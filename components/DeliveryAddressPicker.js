import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

export default ({ deliveryAddresses, selectedDeliveryAddress, onSelected, isEditing }) => {
  if (deliveryAddresses == null || deliveryAddresses.length === 0) {
    return <Text style={{ marginBottom: 8 }}>You do not have any saved delivery addresses.</Text>
  }

  return (
    <View>
      {deliveryAddresses.map((deliveryAddress, index) => {
        const isSelected = selectedDeliveryAddress === deliveryAddress

        return (
          <TouchableOpacity 
            key={index}
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: isEditing ? '#880000' : isSelected ? '#008800' : '#bbb',
              backgroundColor: isSelected ? '#008800' : '#fff',
              flexDirection: 'row',
              marginBottom: 8,
              alignItems: 'center'
            }}
            onPress={() => onSelected(deliveryAddress)}
          >
            <Text 
              style={{ 
                color: isSelected ? '#fff' : '#000', 
                fontWeight: isSelected ? 'bold' : 'normal',
                flex: 1,
                marginRight: 8
              }}
            >
              {deliveryAddress.streetAddress}
            </Text>
            <Text 
              style={{ 
                color: isSelected ? '#fff' : '#000', 
                fontWeight: isSelected ? 'bold' : 'normal'
              }}
            >
              {deliveryAddress.postcode}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}