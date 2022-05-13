import React from 'react'
import AppContext from '../contexts/app'
import AnitaAPI from '../lib/AnitaAPI'
import * as Sentry from 'sentry-expo'
import * as Geolib from 'geolib'

import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native'
import DeliveryAddressPicker from '../components/DeliveryAddressPicker'
import TextField from '../components/elements/TextField'
import Button from '../components/elements/Button'
import { ServerConnectionError } from '../lib/Errors'

import * as Device from 'expo-device'
const needsMargin = ['iphone x', 'iphone 11'].some(name => Device.modelName.toLowerCase().includes(name))

export default class SelectDeliveryAddressScreen extends React.Component {
  static navigationOptions = {
    title: 'Delivery address'
  }

  static contextType = AppContext

  state = {
    subtotal: 0,
    deliveryFee: 0,
    donationAmount: 0,
    premisesID: null,
    selectedDeliveryAddress: null,
    isAddingNotes: false,
    notesText: '',
    notesError: '',
    notes: null,
    promoCode: null,
    isContactFree: true
  }

  componentDidMount() {
    const subtotal = this.props.navigation.getParam('subtotal', 0)
    const deliveryFee = this.props.navigation.getParam('deliveryFee', 0)
    const donationAmount = this.props.navigation.getParam('donationAmount', 0)
    const premisesID = this.props.navigation.getParam('premisesID', null)
    const promoCode = this.props.navigation.getParam('promoCode', null)

    const { deliveryAddresses } = this.context.account.customer
    let selectedDeliveryAddress = null

    if (deliveryAddresses != null && deliveryAddresses.length > 0) {
      selectedDeliveryAddress = deliveryAddresses[0]
    }
    
    this.setState({ subtotal, deliveryFee, premisesID, selectedDeliveryAddress, promoCode, donationAmount })
  }

  render() {
    const { deliveryAddresses } = this.context.account.customer
    const { selectedDeliveryAddress, isAddingNotes, notesText, notes, notesError, isContactFree } = this.state
    const canContinue = selectedDeliveryAddress != null

    if (isAddingNotes) {
      return (
        <View style={{ flex: 1, padding: 16 }}>
          <TextField
            label='Delivery note'
            value={notesText}
            error={notesError}
            placeholder='Provide any special delivery instructions here.'
            onChangeText={text => this.setState({ notesText: text })}
            multiline={true}
            numberOfLines={3}
          />
          <Button
            label='Add delivery note'
            primary={true}
            onPress={this.addDeliveryNote}
          />
          <Button
            label='Cancel'
            style={{ marginTop: 16 }}
            onPress={() => this.setState({ isAddingNotes: false, notes: null })}
          />
        </View>
      )
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text
            style={{ color: '#008800', fontWeight: 'bold', marginBottom: 8 }}
          >
            SAVED DELIVERY ADDRESSES
          </Text>
          <DeliveryAddressPicker
            deliveryAddresses={deliveryAddresses}
            selectedDeliveryAddress={selectedDeliveryAddress}
            onSelected={this.onDeliveryAddressSelected}
          />
          <Button
            label='Add delivery address'
            onPress={this.onAddDeliveryAddressPressed}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
        <View style={{ height: 1, backgroundColor: '#d8d8d8' }} />
        <TouchableOpacity
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={() => {
            Alert.alert(
              "Contact-free delivery",
              "All of our deliveries are contact-free. This means our driver will knock and leave your delivery at your door instead of handing it over to you.\n\nIf you'd like our driver to leave your delivery in a different spot please add a delivery note.",
              [
                { text: "OK" }
              ]
            )
          }}
        >
          <Switch
            value={isContactFree}
            // onValueChange={isContactFree => this.setState({ isContactFree })}
            style={{ marginRight: 16 }}
          />
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Contact-free delivery?</Text>
        </TouchableOpacity>
        <View style={{ height: 1, backgroundColor: '#d8d8d8' }} />
        {notes == null
          ? (
            <TouchableOpacity 
              style={{ padding: 16 }} 
              onPress={() => this.setState({ isAddingNotes: true, notesText: '' })}
            >
              <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#008800' }}>
                ADD A DELIVERY NOTE
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#008800' }}>
                  DELIVERY NOTE
                </Text>
                <Text style={{ fontSize: 16, paddingVertical: 8 }}>
                  {notes}
                </Text>
              </View>
              <TouchableOpacity style={{ padding: 8, marginLeft: 16 }} onPress={() => this.setState({ notes: null })}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#880000', textAlign: 'center' }}>
                  REMOVE
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
        <TouchableOpacity 
          disabled={!canContinue}
          style={{ 
            padding: 16, 
            backgroundColor: 
            canContinue ? '#008800' : '#eee',
            marginBottom: needsMargin ? 32 : 0
          }}
          onPress={this.onContinuePressed}
        >
          <Text style={{ color: canContinue ? '#fff' : '#888', fontWeight: 'bold', textAlign: 'center' }}>
            {canContinue ? 'CONTINUE' : 'SELECT AN ADDRESS TO CONTINUE'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderItem = ({ item }) => {
    const isSelected = item === this.state.selectedDeliveryAddress

    return (
      <TouchableOpacity
        style={{ 
          padding: 12,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: isSelected ? '#008800' : '#bbb',
          backgroundColor: isSelected ? '#008800' : '#fff'
        }}
        onPress={() => this.setState({ selectedDeliveryAddress: item })}
      >
        <Text
          style={{
            color: isSelected ? '#fff' : '#000',
            fontWeight: isSelected ? 'bold' : 'normal',
            flex: 1,
            marginRight: 16
          }}
        >
          {item.streetAddress}
        </Text>
        <Text
          style={{
            color: isSelected ? '#fff' : '#000',
            fontWeight: isSelected ? 'bold' : 'normal'
          }}
        >
          {item.postcode}
        </Text>
      </TouchableOpacity>
    )
  }

  onDeliveryAddressSelected = deliveryAddress => {
    const { selectedDeliveryAddress } = this.state

    if (selectedDeliveryAddress === deliveryAddress) {
      this.setState({ selectedDeliveryAddress: null })
    } else {
      this.setState({ selectedDeliveryAddress: deliveryAddress })
    }
  }

  onAddDeliveryAddressPressed = () => {
    this.props.navigation.navigate('AddDeliveryAddress')
  }

  onContinuePressed = async () => {
    const { premisesID, subtotal, deliveryFee, selectedDeliveryAddress, notes, promoCode, donationAmount } = this.state

    try {
      const { isOnline, isOpen, opensToday, openingHours } = await AnitaAPI.Customer.isShopOnline(premisesID)

      if (!isOpen) {
        Alert.alert(
          'Shop is closed',
          `This shop is currently closed. It will be open from ${openingHours[0]} until ${openingHours[1]} ${opensToday ? 'today' : 'tomorrow'}.`
        )
        return
      }

      if (!isOnline) {
        Alert.alert(`Not accepting orders`, `This shop is currently not accepting orders. Please try again later.`)
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

    let finalDeliveryFee

    if (promoCode != null) {
      finalDeliveryFee = 0
    } else {
      try {
        const shops = await AnitaAPI.Customer.getShops()
        const shop = shops.find(shop => shop.id === premisesID)
        const distanceMeters = Geolib.getDistance(selectedDeliveryAddress.location, shop.location)
        const distanceMiles = Math.floor(distanceMeters / 1609.334)
        const distanceFee = distanceMiles * 50
  
        finalDeliveryFee = shop.deliveryFee + distanceFee
      } catch (error) {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
        return
      }
    }

    if (finalDeliveryFee != deliveryFee) {
      Alert.alert('Delivery fee updated', `Your delivery fee has been updated to £${(finalDeliveryFee / 100).toFixed(2)} based on your selected delivery address.`)
    }

    this.props.navigation.navigate('Checkout', { 
      premisesID, subtotal, deliveryFee: finalDeliveryFee, deliveryAddress: selectedDeliveryAddress, notes, donationAmount 
    })
  }

  addDeliveryNote = () => {
    this.setState({ notesError: '' })
    const notes = this.state.notesText.trim()

    if (notes.length === 0) {
      this.setState({ notesError: `You haven't entered a note.` })
      return
    }

    this.setState({ isAddingNotes: false, notes })
  }
}