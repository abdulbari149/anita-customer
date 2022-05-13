import React from 'react'
import { FlatList, StyleSheet, Text } from 'react-native'

import CategoryListItem from './items/CategoryListItem'

export default class CategoriesList extends React.Component {
  render() {
    return (
      <FlatList
        data={this.props.categories}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        onRefresh={this.props.onRefresh}
        refreshing={this.props.isRefreshing}
      />
    )
  }

  renderItem = ({ item, index }) => {
    const numSpecialOffers = item.data.filter(
      (product) => product.isSpecial
    ).length
    const numOutOfStock = item.data.filter(
      (product) => product.outOfStock
    ).length

    return (
      <CategoryListItem
        categoryName={item.title}
        categoryId={index}
        numProducts={item.data.length}
        numOutOfStock={numOutOfStock}
        numSpecialOffers={numSpecialOffers}
        onSelected={() => this.props.onSelected(item.title)}
      />
    )
  }

  keyExtractor = (category) => category.title
}
