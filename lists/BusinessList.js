import React from 'react'
import { FlatList, StyleSheet } from 'react-native'

import BusinessListItem from './items/BusinessListItem'

export default class BusinessList extends React.Component {
  render() {
    return (
      <FlatList
        data={this.props.businesses}
        renderItem={this.renderItem}
        keyExtractor={this.keyExtractor}
        style={styles.list}
        onRefresh={this.props.onRefresh}
        refreshing={this.props.isRefreshing}
      />
    )
  }

  renderItem = ({ item }) => (
    <BusinessListItem
      business={item}
      onSelected={() => this.props.onBusinessSelected(item)}
      isWithinDeliveryArea={this.props.isWithinDeliveryArea}
    />
  )

  keyExtractor = (item) => `${item.id}`
}

const styles = StyleSheet.create({
  list: {
    
  }
})