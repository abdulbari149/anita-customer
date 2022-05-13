import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import AppContext from '../contexts/app'

import { View, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'

import * as Device from 'expo-device'
const needsMargin = ['iphone x', 'iphone 11'].some(name => Device.modelName.toLowerCase().includes(name))

export default class CheckoutScreen extends React.Component {
  static contextType = AppContext
  static navigationOptions = {
    title: 'Checkout'
  }

  state = {
    subtotal: 0,
    deliveryFee: 0,
    donationAmount: 0,
    premisesID: 0,
    deliveryAddress: null,
    paymentIntent: null,
    paymentMethods: null,
    notes: '',
    loaded: false
  }

  constructor(props) {
    super(props)

    this.webViewRef = React.createRef()
  }

  async componentDidMount() {
    const premisesID = this.props.navigation.getParam('premisesID', null)
    const deliveryAddress = this.props.navigation.getParam('deliveryAddress', null)
    const donationAmount = this.props.navigation.getParam('donationAmount', null)
    const subtotal = this.props.navigation.getParam('subtotal', 0)
    const deliveryFee = this.props.navigation.getParam('deliveryFee', 0)
    const notes = this.props.navigation.getParam('notes', '')

    const paymentIntent = await AnitaAPI.Customer.getPaymentIntent(premisesID, subtotal, deliveryFee, donationAmount)
    const paymentMethods = await AnitaAPI.Customer.getPaymentMethods()

    this.setState({ 
      subtotal, 
      deliveryFee, 
      donationAmount,
      premisesID, 
      deliveryAddress,
      paymentIntent, 
      paymentMethods, 
      notes,
      loaded: true 
    })
  }

  onMessage = e => {
    const data = JSON.parse(e.nativeEvent.data)

    switch (data.id) {
      case 'load':
        this.onLoad()
        return
      case 'payment_succeeded':
        this.submitOrder()
        return
      case 'payment_failed':
        alert(data.message)
        return
    }
  }

  submitOrder = async () => {
    this.setState({ loaded: false })

    const { premisesID, deliveryAddress, paymentIntent, notes, donationAmount } = this.state
    const { promoCode } = this.context

    const basket = this.context.basket.map(
      item => ({ 
        id: item.product.id, 
        name: item.product.name,
        price: item.product.price, 
        quantity: item.quantity,
        doNotReplace: !!item.doNotReplace
      })
    )

    try {
      await AnitaAPI.Order.create(
        premisesID,
        basket,
        deliveryAddress,
        notes,
        paymentIntent.id,
        promoCode != null
          ? promoCode.id
          : null,
        donationAmount
      )
    } catch (error) {
      alert(error.message)
      this.setState({ loaded: true })
      return
    }

    this.context.set({ basket: [], promoCode: null, donationAmount: 0 })
    this.props.navigation.popToTop()
    this.props.navigation.navigate('Orders')
  }

  render() {
    const { loaded } = this.state

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {!loaded 
          ? 
            <ActivityIndicator 
              style={{ flex: 1, alignSelf: 'center' }} 
              color='#008800' 
              size='large' 
            />
          : 
            <WebView
              ref={this.webViewRef}
              bounces={false}
              overScrollMode='never'
              onMessage={this.onMessage}
              source={{ uri: AnitaAPI.Order.getCheckoutURL() }}
              style={{ marginBottom: needsMargin ? 32 : 0 }}
            />
        }
      </View>
    )
  }

  onLoad = () => {
    const { paymentIntent, paymentMethods, subtotal, deliveryFee, deliveryAddress, donationAmount } = this.state
    const data = JSON.stringify({
      paymentIntent,
      deliveryAddress,
      subtotal,
      deliveryFee,
      savedPaymentMethods: paymentMethods,
      donationAmount
    })

    this.webViewRef.current.injectJavaScript(`loadForm('${data}');`)
  }
}