import React from 'react'
import AppContext from '../contexts/app'

import { Alert, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import DeliveryAddressPicker from '../components/DeliveryAddressPicker'
import Button from '../components/elements/Button'
import AnitaAPI from '../lib/AnitaAPI'

export default class ManageDeliveryAddressesScreen extends React.Component {
  static navigationOptions = {
    title: 'Your delivery addresses'
  }

  static contextType = AppContext

  state = {
    selectedDeliveryAddress: null,
    isEditing: false,
    isLoading: false,
  }

  render() {
    const { deliveryAddresses } = this.context.account.customer
    const { selectedDeliveryAddress, isEditing, isLoading } = this.state

    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text
              style={{ color: '#008800', fontWeight: 'bold', marginBottom: 8 }}
            >
              SAVED DELIVERY ADDRESSES
            </Text>
            <Button
              primary={!isEditing}
              dangerous={isEditing}
              label={isEditing ? 'Done' : 'Edit'}
              onPress={() => this.setState({ isEditing: !isEditing })}
              disabled={isLoading}
            />
          </View>
          <DeliveryAddressPicker
            isEditing={isEditing}
            deliveryAddresses={deliveryAddresses}
            selectedDeliveryAddress={selectedDeliveryAddress}
            onSelected={this.onDeliveryAddressSelected}
          />
          <Button
            label='Add delivery address'
            onPress={this.onAddDeliveryAddressPressed}
            style={{ marginTop: 16 }}
            disabled={isLoading}
          />
        </ScrollView>
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
    const { isEditing, isLoading } = this.state

    if (!isEditing || isLoading) {
      return
    }

    Alert.alert(
      'Delete address',
      `Are you sure you want to delete this address?\n\n${deliveryAddress.streetAddress}, ${deliveryAddress.postcode}`,
      [
        { text: 'Yes', style: 'destructive', onPress: async () => { await this.deleteDeliveryAddress(deliveryAddress) } },
        { text: 'No', style: 'cancel' },
      ]
    )
  }

  deleteDeliveryAddress = async (deliveryAddress) => {
    const deliveryAddresses = this.context.account.customer.deliveryAddresses.filter(address => address != deliveryAddress)

    this.setState({ isLoading: true })

    try {
      const account = await AnitaAPI.Customer.updateDeliveryAddresses(deliveryAddresses)
      this.context.set({ account })
    } catch (error) {
      console.log('Error updating delivery addresses', error)
      alert('Something went wrong, please try again. If this error persists please contact us.')
    }
    
    this.setState({ isLoading: false })
  }

  onAddDeliveryAddressPressed = () => {
    this.props.navigation.navigate('AddDeliveryAddressAccount')
  }
}