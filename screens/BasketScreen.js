import React from 'react'
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  View,
  Alert,
  Image
} from 'react-native'
import AppContext from '../contexts/app'
import AnitaAPI from '../lib/AnitaAPI'
import { ParameterError, ServerConnectionError } from '../lib/Errors'
import * as Sentry from 'sentry-expo'
import { Ionicons } from '@expo/vector-icons'

import BasketList from '../lists/BasketList'
import TextField from '../components/elements/TextField'
import Button from '../components/elements/Button'

import * as Device from 'expo-device'
const needsMargin = ['iphone x', 'iphone 11'].some(name => Device.modelName.toLowerCase().includes(name))

const DonationRecipientName = 'Foyle Search and Rescue'
const DonationRecipientLogo = require('../assets/foyle-search-and-rescue-logo.png')

export default class BasketScreen extends React.Component {
  static navigationOptions = {
    title: 'Your basket'
  }

  static contextType = AppContext
  
  state = {
    premisesID: null,
    deliveryFee: null,
    menu: [],
    isAddingPromoCode: false,
    promoCodeText: '',
    errors: {},
    isLoading: false,
    isWithinDeliveryArea: false
  }

  async componentDidMount() {
    const premisesID = this.props.navigation.getParam('premisesID', null)
    const deliveryFee = this.props.navigation.getParam('deliveryFee', null)
    const isWithinDeliveryArea = this.props.navigation.getParam('isWithinDeliveryArea', false)

    let menu

    try {
      menu = await AnitaAPI.Customer.getShopMenu(premisesID)
    } catch (error) {
      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      this.props.navigation.goBack()
      return
    }

    this.setState({ menu, premisesID, deliveryFee, isWithinDeliveryArea })
  }

  getSubTotal = basket => basket.reduce(
    (total, basketItem) => total + (basketItem.product.price * basketItem.quantity),
    0
  )

  render() {
    const { account, basket, donationAmount, promoCode } = this.context
    const { isAddingPromoCode, promoCodeText, errors, isLoading } = this.state
    const subtotal = this.getSubTotal(basket)
    const canContinue = subtotal >= 500
    
    let deliveryFee = this.state.deliveryFee

    if (promoCode != null) {
      // deliveryFee = Math.max(0, deliveryFee - promoCode.discount)
      deliveryFee = 0
    }

    if (isAddingPromoCode) {
      return (
        <View style={{ flex: 1, padding: 16 }}>
          <TextField
            label='Promo code'
            value={promoCodeText}
            error={errors.promoCode}
            placeholder='Enter a promo code'
            autoCapitalize='characters'
            onChangeText={text => this.setState({ promoCodeText: text })}
            disabled={isLoading}
          />
          <Button
            label='Apply promo code'
            primary={true}
            onPress={this.onApplyPromoCodePressed}
            disabled={isLoading}
          />
          <Button
            label='Cancel'
            style={{ marginTop: 16 }}
            onPress={() => this.setState({ isAddingPromoCode: false })}
            disabled={isLoading}
          />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <BasketList
          products={basket}
          removeFromBasket={this.removeFromBasket}
          addToBasket={this.addToBasket}
          setDoNotReplace={this.setDoNotReplace}
        />
        {/* {promoCode == null
          ? (
            <TouchableOpacity 
              style={{ padding: 16 }} 
              onPress={() => this.setState({ isAddingPromoCode: true, promoCodeText: '', errors: {} })}
            >
              <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#008800' }}>
                ENTER A PROMO CODE
              </Text>
            </TouchableOpacity>
          )
          : (
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#008800' }}>
                  PROMO CODE
                </Text>
                <Text style={{ fontSize: 16, paddingVertical: 8, fontWeight: 'bold' }}>
                  {promoCode.code}
                </Text>
              </View>
              <TouchableOpacity style={{ padding: 8, marginLeft: 16 }} onPress={this.removePromoCode}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#880000', textAlign: 'center' }}>
                  REMOVE
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
        <View style={styles.divider} /> */}
        <View style={styles.divider} />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <Image
            source={DonationRecipientLogo}
            resizeMode='contain'
            style={{ width: 48, height: 48 }}
          />
          <Text style={{ flex: 1, fontSize: 14, fontWeight: 'bold', marginHorizontal: 8 }}>
            Make a donation to {DonationRecipientName}?
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ 
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#aa0000', 
                width: 32, height: 32, 
                borderRadius: 4 
              }}
              onPress={() => this.context.set({ donationAmount: Math.max(donationAmount - 100, 0)  })}
            >
              <Ionicons name={'md-remove'} size={12} color={'#fff'} />
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 8, fontWeight: 'bold', fontSize: 16 }}>£{(donationAmount / 100).toFixed(2)}</Text>
            <TouchableOpacity
              style={{ 
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00aa00', 
                width: 32, height: 32, 
                borderRadius: 4 
              }}
              onPress={() => this.context.set({ donationAmount: Math.min(donationAmount + 100, 10000)  })}
            >
              <Ionicons name={'md-add'} size={12} color={'#fff'} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowText}>Subtotal</Text>
            <Text style={styles.summaryRowCharge}>£{(subtotal / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowText}>Delivery fee</Text>
            <Text style={styles.summaryRowCharge}>
              {this.state.isWithinDeliveryArea
                ? `£${(deliveryFee / 100).toFixed(2)}`
                : 'Unavailable'
              }
            </Text>
          </View>
          {donationAmount > 0 &&
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowText}>{DonationRecipientName} donation</Text>
                <Text style={styles.summaryRowCharge}>
                  £{(donationAmount / 100).toFixed(2)}
                </Text>
              </View>
            </>
          }
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalText}>Order total</Text>
            <Text style={styles.summaryTotalCharge}>
              {this.state.isWithinDeliveryArea 
                ? `£${((subtotal + deliveryFee + donationAmount) / 100).toFixed(2)}`
                : `£${((subtotal) / 100).toFixed(2)}`
              }
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={{
            padding: 16,
            backgroundColor: canContinue
              ? '#008800'
              : '#eee',
            marginBottom: needsMargin ? 32 : 0
          }} 
          onPress={async () => await this.onContinuePressed(account, basket, donationAmount)} 
          disabled={!canContinue}
        >
          <Text 
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
              color: canContinue
                ? '#fff'
                : '#888'
            }}
          >
            {canContinue ? 'CONTINUE' : 'SPEND £5 OR MORE TO CONTINUE'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  onContinuePressed = async (account, basket, donationAmount) => {
    const restrictedBasketItems = this.getRestrictedBasketItems(basket)

    if (!restrictedBasketItems) {
      Sentry.captureMessage('restrictedProducts is undefined')
      Alert.alert('Something went wrong', 'Please re-open your basket and try again.')
      this.props.navigation.goBack()
      return
    }

    if (restrictedBasketItems.length > 0) {
      // restrictedBasketItems.forEach(item => {
      //   console.log(item[0].product.name + '\n')
      // })

      Alert.alert(
        'Identification required',
        `All cigarette, tobacco and e-liquid purchases require you to provide identification to the delivery driver before you receive your order.\n\nThe delivery driver has the right to not hand over these items if they are not satisfied that the customer receiving the order is over 18. If this situation arises you will be refunded for these items.`,
        [
          { text: 'Accept', onPress: async () => await this.submitOrder(account, basket, donationAmount) },
          { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: false }
      )
    } else {
      await this.submitOrder(account, basket, donationAmount)
    }
  }

  isRestrictedCategory = (category) => {
    const lowerCaseCategory = category.toLowerCase()

    const restrictedCategories = [
      'cigarettes and tobacco',
      'cigarettes & tobacco',
      'vape liquids'
    ]

    return restrictedCategories.some(element => element === lowerCaseCategory)
  }

  getRestrictedBasketItems = (basket) => {

    const restrictedProducts = this.state.menu.filter(
        category => category && category.title && this.isRestrictedCategory(category.title)
    )

    if (!restrictedProducts) {
      return []
    }

    let result = [];

    for (let i = 0; i < restrictedProducts.length; i++) {
      let f = basket.filter(
        item => restrictedProducts[i].data.some(
          restrictedProduct => item.product.id === restrictedProduct.id
        )
      )

      if (f && f.length) {
        result.push(f);
      }
    }
    
    return result;
  }

  submitOrder = async (account, basket, donationAmount) => {
    try {
      const { isOnline, isOpen, opensToday, openingHours } = await AnitaAPI.Customer.isShopOnline(this.state.premisesID)

      if (!isOpen) {
        Alert.alert(
          'Shop is closed',
          openingHours != null
            ? `This shop is currently closed. It will be open from ${openingHours[0]} until ${openingHours[1]} ${opensToday ? 'today' : 'tomorrow'}.`
            : `This shop is currently closed. It will be open again on Tuesday from 8:30 until 17:00.`
        )
        return
      }

      if (!isOnline) {
        Alert.alert(
          'Not accepting orders',
          'This shop is currently not accepting orders. Please try again later.'
        )
        return
      }
    } catch (error) {
      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      return
    }

    if (account == null) {
      this.props.navigation.navigate('Auth')
    } else {
      const { promoCode } = this.context
      let deliveryFee = this.state.deliveryFee

      if (promoCode != null) {
        deliveryFee = 0
      }

      this.props.navigation.navigate(
        'SelectDeliveryAddress', 
        { premisesID: this.state.premisesID, subtotal: this.getSubTotal(basket), deliveryFee, donationAmount, promoCode }
      )
    }
  }

  setDoNotReplace = (product, doNotReplace) => {
    let basket = [...this.context.basket]

    const existingBasketItem = basket.find(
      basketItem => basketItem.product.id === product.id
    )

    existingBasketItem.doNotReplace = doNotReplace
    this.context.set({ basket })
  }

  removeFromBasket = product => {
    let basket = [...this.context.basket]

    const existingBasketItem = basket.find(
      basketItem => basketItem.product.id === product.id
    )

    existingBasketItem.quantity -= 1

    if (existingBasketItem.quantity === 0) {
      basket = basket.filter(item => item.product.id !== product.id)
    }

    this.context.set({ basket })
  }

  addToBasket = product => {
    const basket = [...this.context.basket]
    const existingItem = basket.find(item => item.product.id === product.id)

    if (existingItem != null) {
      existingItem.quantity += 1
    } else {
      basket.push({ product, quantity: 1 })
    }

    this.context.set({ basket })
  }

  onApplyPromoCodePressed = async () => {
    this.setState({ errors: {} })
    const promoCodeText = this.state.promoCodeText.trim()

    if (promoCodeText.length === 0) {
      this.setState({ errors: { promoCode: 'Please enter a promo code.' } })
      return
    }

    this.setState({ isLoading: true })
    let promoCode

    try {
      promoCode = await AnitaAPI.Order.validatePromoCode(promoCodeText)
    } catch (error) {
      if (error instanceof ParameterError) {
        this.setState({ isLoading: false, errors: { ...error.parameters } })
        return
      }

      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      return
    }

    this.context.set({ promoCode })
    this.setState({ isLoading: false, isAddingPromoCode: false })
  }

  removePromoCode = () => {
    this.context.set({ promoCode: null })
  }

  getProductCategory = (product) => {
    for (const category of this.state.menu) {
      for (const item of category.data) {
        if (item.id === product.id) return category
      }
    }
    
    return null
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  divider: {
    height: 1,
    backgroundColor: '#D8D8D8'
  },
  summary: {
    padding: 16
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  summaryRowText: {
    flex: 1,
    fontSize: 16
  },
  summaryRowCharge: {
    marginLeft: 16,
    fontSize: 16
  },
  summaryTotal: {
    flexDirection: 'row',
  },
  summaryTotalText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16
  },
  summaryTotalCharge: {
    marginLeft: 16,
    fontWeight: 'bold',
    fontSize: 16
  },
  continue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#008800'
  },
  continueText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#FFFFFF'
  }
})