import React from 'react'
import {
  SectionList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'

import ProductListItem from './items/ProductListItem'

export default class ProductList extends React.Component {
  constructor(props) {
    super(props)

    this.list = React.createRef()
  }

  render() {
    return (
      <SectionList
        ref={this.list}
        sections={this.props.products}
        renderItem={this.renderItem}
        ItemSeparatorComponent={this.itemSeparatorComponent}
        renderSectionHeader={this.renderSectionHeader}
        // SectionSeparatorComponent={this.sectionSeparatorComponent}
        keyExtractor={this.keyExtractor}
        stickySectionHeadersEnabled={false}
        extraData={this.props.basket}
        overScrollMode='never'
        ListHeaderComponent={() => {
          const sectionCount = this.props.products.length
          const rowCount = Math.floor(sectionCount / 2)

          const rows = []

          for (let i = 0; i < rowCount; i++) {
            rows.push(
              <View style={{ flexDirection: 'row', marginBottom: 16 }} key={i}>
                <TouchableOpacity style={{ backgroundColor: '#008800', padding: 12, flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{this.props.products[i*2].title.toUpperCase()}</Text>
                </TouchableOpacity>
                <View style={{ width: 16 }} />
                <TouchableOpacity style={{ backgroundColor: '#008800', padding: 12, flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>{this.props.products[(i*2)+1].title.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            )
          }

          return (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              {rows}
            </View>
          )
        }}
      />
    )
  }

  scrollToItem = (sectionIndex, itemIndex) => {
    this.refs.list.scrollToLocation({
      sectionIndex,
      itemIndex: -1
    })
  }

  renderItem = ({ item, index, section }) => (
    <ProductListItem 
      product={item}
      quantity={this.getProductQuantity(item)}
      onAddPressed={() => this.props.addToBasket(item)}
      onRemovePressed={() => this.props.removeFromBasket(item)}
    />
  )

  getProductQuantity = product => {
    const existingBasketItem = this.props.basket.find(
      basketItem => basketItem.product.id === product.id
    )

    if (existingBasketItem != null) {
      return existingBasketItem.quantity
    }

    return 0
  }

  itemSeparatorComponent = () => <View style={styles.itemSeparator} />

  renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.headerTitle}>{section.title}</Text>
    </View>
  )

  sectionSeparatorComponent = () => <View style={styles.sectionSeparator} />

  keyExtractor = (item, index) => item.id
}

const styles = StyleSheet.create({
  itemSeparator: {
    height: 1,
    backgroundColor: '#E8E8E8'
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E8E8E8'
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24
  }
})