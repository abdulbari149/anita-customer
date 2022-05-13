import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import { ParameterError } from '../lib/Errors'
import AppContext from '../contexts/app'

import { View, Text } from 'react-native'
import TextField from '../components/elements/TextField'
import Button from '../components/elements/Button'
import { captureException } from 'sentry-expo'

export default class ManageAccountScreen extends React.Component {
  static navigationOptions = {
    title: 'Manage your account'
	}
	
	static contextType = AppContext

	state = {
		newPhoneNumber: '',
		errors: {},
		isLoading: false,
	}

	constructor(props) {
		super(props);

		this.refNewPhoneNumber = React.createRef();
	}

	render() {
		const { account } = this.context
		const { newPhoneNumber, errors, isLoading } = this.state;

		return (
			<View style={{ padding: 16 }}>
				<Text
          style={{ color: '#008800', fontWeight: 'bold', marginBottom: 16 }}
        >
          FULL NAME
        </Text>
				<View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
					<View style={{flex: 1}}>
						<TextField 
							label='First name'
							value={account.firstName}
							autoCapitalize='none'
							returnKeyType='done'
							autoFocus={true}
							disabled={true}
						/>
					</View>
					
					<View style={{flex: 1, paddingLeft: 10}}>
						<TextField 
							label='Last name'
							value={account.lastName}
							autoCapitalize='none'
							returnKeyType='done'
							autoFocus={true}
							disabled={true}
						/>
					</View>
					
				</View>
        
        <Text
          style={{ color: '#008800', fontWeight: 'bold', marginBottom: 16 }}
        >
          PHONE NUMBER
        </Text>

        <TextField 
          label='Current phone number'
          value={account.phoneNumber}
          autoCapitalize='none'
					returnKeyType='done'
					autoFocus={true}
          disabled={true}
        />

				<TextField 
          ref={this.refNewPhoneNumber}
          label='New phone number'
          value={newPhoneNumber}
          error={errors.newPhoneNumber}
          placeholder='Enter a new phone number'
          keyboardType='phone-pad'
          autoCapitalize='none'
					returnKeyType='done'
					autoFocus={true}
          onChangeText={text => this.setState({ newPhoneNumber: text })}
          disabled={isLoading}
        />
				<Button
					label='Change phone number'
					primary={true}
					onPress={this.onSubmit}
					disabled={isLoading}
				/>
			</View>
		)
	}

	onSubmit = async () => {
		this.setState({ errors: {}, isLoading: true })

		const newPhoneNumber = this.state.newPhoneNumber.trim();
		const exp = /^\d{5,11}$/; // is numeric and between 5 and 11 digits

		if (!newPhoneNumber.match(exp)) {
			this.setState({errors: {newPhoneNumber: "Use the correct number format" }, isLoading: false})
			return;
		}

		const currentAccount = this.context.account
		
		if (newPhoneNumber === currentAccount.phoneNumber) {
			this.setState({errors: {newPhoneNumber: "The numbers are the same" }, isLoading: false})
			return;
		}
		
		let account
		
		try {
			account = await AnitaAPI.Account.update(currentAccount.firstName, currentAccount.lastName, newPhoneNumber);
		} catch (error) {
			if (error instanceof ParameterError) {
				alert('Error: '+ error.message)
				this.setState({errors: {...error.parameters}, isLoading: false })
				return
			}

			alert('Error: '+ error.message)
			this.setState({isLoading: false})
			return
		}

		this.context.set({ account })
		this.props.navigation.navigate('Account')
	}
}