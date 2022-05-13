import React from 'react'
import Styled from 'styled-components/native'
import AnitaAPI from '../lib/AnitaAPI'
import { ParameterError } from '../lib/Errors'
import AppContext from '../contexts/app'

import { Keyboard, ScrollView, KeyboardAvoidingView, View, Platform } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import * as Location from 'expo-location'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import TextField from '../components/elements/TextField'
import Button from '../components/elements/Button'

export default class AddDeliveryAddress extends React.Component {
  static navigationOptions = {
    title: 'Add delivery address',
    gesturesEnabled: false
  }

  static contextType = AppContext

  state = {
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    errors: {},
    location: null,
    isLoading: false
  }

  constructor(props) {
    super(props)

    this.mapViewRef = React.createRef()
    this.refPostcode = React.createRef()
    this.inputRefs = {}
    this.inputLayouts = {}
  }

  scrollToInputWithId = (id) => {
    // const layout = this.inputLayouts[id]
    //
    // if (!layout) {
    //   console.log(`scrollToInput: no layout found for id ${id}`)
    //   return
    // }
    //
    // this.refScroll.scrollToPosition(0, layout.y, true)
  }

  render() {
    const { addressLine1, addressLine2, city, postcode, errors, isLoading } = this.state

    return (
      <AppContext.Consumer>
        {({ set }) => (
          <KeyboardAwareScrollView
            enableOnAndroid={true}
          >
            <Container>
              <TextField
                ref={ref => this.inputRefs['address_line_1'] = ref}
                onLayout={({ nativeEvent }) => this.inputLayouts['address_line_1'] = nativeEvent.layout}
                label='Address line 1'
                value={addressLine1}
                error={errors.addressLine1 || errors.streetAddress}
                placeholder=''
                autoCapitalize='words'
                returnKeyType='next'
                blurOnSubmit={false}
                autoFocus={true}
                onChangeText={text => this.setState({ addressLine1: text })}
                onSubmitEditing={() => this.inputRefs['address_line_2'].focus()}
                disabled={isLoading}
                onFocus={() => this.scrollToInputWithId('address_line_1')}
              />
              <TextField
                ref={ref => this.inputRefs['address_line_2'] = ref}
                onLayout={({ nativeEvent }) => this.inputLayouts['address_line_2'] = nativeEvent.layout}
                label='Address line 2 (opt.)'
                value={addressLine2}
                error={errors.addressLine2}
                placeholder=''
                autoCapitalize='words'
                returnKeyType='next'
                blurOnSubmit={false}
                onChangeText={text => this.setState({ addressLine2: text })}
                onSubmitEditing={() => this.inputRefs['city'].focus()}
                disabled={isLoading}
                onFocus={() => this.scrollToInputWithId('address_line_2')}
              />
              <TextField
                ref={ref => this.inputRefs['city'] = ref}
                onLayout={({ nativeEvent }) => this.inputLayouts['city'] = nativeEvent.layout}
                label='City'
                value={city}
                error={errors.city}
                placeholder=''
                autoCapitalize='words'
                returnKeyType='next'
                blurOnSubmit={false}
                onChangeText={text => this.setState({ city: text })}
                onSubmitEditing={() => this.inputRefs['postcode'].focus()}
                disabled={isLoading}
                onFocus={() => this.scrollToInputWithId('city')}
              />
              <TextField
                ref={ref => this.inputRefs['postcode'] = ref}
                onLayout={({ nativeEvent }) => this.inputLayouts['postcode'] = nativeEvent.layout}
                label='Postcode'
                value={postcode}
                error={errors.postcode}
                placeholder=''
                autoCapitalize='characters'
                returnKeyType='done'
                onChangeText={text => this.setState({ postcode: text })}
                disabled={isLoading}
                onFocus={() => this.scrollToInputWithId('postcode')}
              />
              <Button
                label='Save address'
                primary={true}
                disabled={isLoading}
                onPress={this.onSavePressed}
              />
            </Container>
          </KeyboardAwareScrollView>
        )}
      </AppContext.Consumer>
    )
  }

  onSearchPressed = async () => {
    Keyboard.dismiss()

    const { streetAddress, postcode } = this.state

    if (streetAddress.trim().length === 0) {
      this.setState({
        errors: {
          ...this.state.errors,
          streetAddress: 'Please provide a street address.'
        }
      })
      return
    }

    if (postcode.trim().length === 0) {
      this.setState({
        errors: {
          ...this.state.errors,
          postcode: 'Please provide a postcode.'
        }
      })
      return
    }

    this.setState({ errors: {}, isLoading: true })

    console.log('geocoding...', streetAddress, postcode)
    const geocode = await Location.geocodeAsync(`${streetAddress} ${postcode}`)

    if (geocode.length === 0) {
      this.setState({
        errors: {
          streetAddress: 'Could not find address, please ensure you have entered it correctly.'
        },
        isLoading: false
      })

      return
    }

    const { latitude, longitude } = geocode[0]
    const location = { latitude, longitude }

    this.setState({ location, isLoading: false })
    this.mapViewRef.current.fitToSuppliedMarkers(
      ['delivery'],
      { edgePadding: { top: 64, bottom: 64, left: 64, right: 64 } }
    )
  }

  onSavePressed = async () => {
    this.setState({ errors: {}, isLoading: false })
    const { addressLine1, addressLine2, city, postcode } = this.state

    if (addressLine1.trim().length === 0) {
      this.setState({
        errors: {
          addressLine1: 'Please provide the 1st line of your address.'
        }
      })

      return
    }

    if (city.trim().length === 0) {
      this.setState({
        errors: {
          city: 'Please provide a city.'
        }
      })

      return
    }

    if (postcode.trim().length === 0) {
      this.setState({
        errors: {
          postcode: 'Please provide a postcode.'
        }
      })

      return
    }

    const streetAddress = `${addressLine1}, ${addressLine2 ? `${addressLine2}, ` : ``}${city}`

    const geocode = await Location.geocodeAsync(`${streetAddress} ${postcode}`)

    if (geocode.length === 0) {
      alert(`Sorry, we were unable to locate this address. Please ensure you have entered it correctly and try again.`)
      return
    }

    console.log(`geocode for ${streetAddress} ${postcode}`, geocode)

    const { latitude, longitude } = geocode[0]
    const location = { latitude, longitude }

    let account

    try {
      account = await AnitaAPI.Customer.addDeliveryAddress(
        streetAddress, postcode, location
      )
    } catch (error) {
      if (error instanceof ParameterError) {
        this.setState({ errors: { ...error.parameters }, isLoading: false })
        return
      }

      alert(error.message)
      this.setState({ isLoading: false })
      return
    }

    this.context.set({ account })
    this.props.navigation.goBack()
  }
}

const Container = Styled.View`
  display: flex;
  flex-direction: column;

  flex: 1;

  padding: 16px;
`

const InfoText = Styled.Text`
  font-size: 12px;
  text-align: center;

  margin: 8px 0px;
`
