import React from 'react'
import {
  FlatList,
  StyleSheet,
  View
} from 'react-native'

import BasketListItem from './items/BasketListItem'

export default class BasketList extends React.Component {
  render() {
    return (
      <FlatList
        data={this.props.products}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        ItemSeparatorComponent={this.itemSeparatorComponent}
        style={styles.list}
      />
    )
  }

  renderItem = ({ item }) => (
    <BasketListItem
      product={item.product}
      quantity={item.quantity}
      doNotReplace={item.doNotReplace}
      removeFromBasket={this.props.removeFromBasket}
      addToBasket={this.props.addToBasket}
      setDoNotReplace={this.props.setDoNotReplace}
    />
  )

  keyExtractor = item => `${item.product.id}`

  itemSeparatorComponent = () => <View style={styles.itemSeparator} />
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#eee'
  }
})