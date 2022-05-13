import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import { ParameterError } from '../lib/Errors'
import AppContext from '../contexts/app'

import { View } from 'react-native'
import TextField from '../components/elements/TextField'
import Button from '../components/elements/Button'

export default class ResetPasswordScreen extends React.Component {
  static navigationOptions = {
    title: 'Reset your password'
  }

  static contextType = AppContext

  state = {
    email: '',
    isLoading: false,
    errors: {}
  }

  render() {
    const { email, errors, isLoading } = this.state

    return (
      <View style={{ padding: 16 }}>
        <TextField
          label='Email address'
          placeholder='username@email.com'
          keyboardType='email-address'
          autoCapitalize='none'
          value={email}
          error={errors.email}
          onChangeText={text => this.setState({ email: text })}
          disabled={isLoading}
        />
        <Button
          label='Reset password'
          primary={true}
          onPress={this.onSubmit}
          disabled={isLoading}
        />
      </View>
    )
  }

  onSubmit = async () => {
    this.setState({ errors: {}, isLoading: true })
    
    const email = this.state.email.trim()

    if (email.length === 0) { 
      this.setState({ errors: { email: 'Please enter your email address.' }, isLoading: false })
      return
    }

    try {
      await AnitaAPI.Account.requestPasswordReset(email)
    } catch (error) {
      if (error instanceof ParameterError) {
        this.setState({ isLoading: false, errors: error.parameters })
        return
      }

      alert(error.message)
      this.setState({ isLoading: false })
      return
    }

    this.setState({ isLoading: false })

    alert(`Please check your email inbox for an email containg a link to reset your password.`)
    this.props.navigation.goBack()
  }
}