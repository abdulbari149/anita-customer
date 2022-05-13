import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default class CategoryListItem extends React.Component {
  render() {
    const {
      categoryName,
      numProducts,
      numSpecialOffers,
      numOutOfStock,
      onSelected
    } = this.props

    return (
      <TouchableOpacity onPress={onSelected}>
        <View style={styles.categoryItem}>
          <View style={{ flex: 1, flexDirection: 'column', marginRight: 8 }}>
            <Text style={styles.categoryName}>{categoryName}</Text>
            <Text style={{ fontSize: 16, fontWeight: 'normal' }}>
              {numProducts} {numProducts === 1 ? 'product' : 'products'}
              {numSpecialOffers > 0 && ' - '}
              {numSpecialOffers > 0 && (
                <Text style={{ marginLeft: 8, color: '#036bfc' }}>
                  {numSpecialOffers}{' '}
                  {numSpecialOffers === 1 ? 'offer' : 'offers'}
                </Text>
              )}
              {/* {numOutOfStock > 0 && (
                <Text style={{ marginLeft: 8, color: "#eb4034" }}>
                  {numOutOfStock} out of stock
                </Text>
              )} */}
            </Text>
          </View>
          <Ionicons name={'ios-arrow-forward'} size={20} color={'#008000'} />
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  categoryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,

    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  categoryName: {
    fontWeight: 'bold',
    fontSize: 20
  }
})
