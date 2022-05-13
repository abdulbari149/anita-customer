import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default class BasketListItem extends React.Component {
  render() {
    const { product, quantity, doNotReplace } = this.props
    const total = product.price * quantity

    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <Image
            style={styles.image}
            source={{ uri: this.props.product.image || 'https://placehold.it/64/64' }}
            resizeMode='contain'
          />
          <Text style={styles.name}>{this.props.product.name}</Text>
          <Text style={styles.total}>£{(total / 100).toFixed(2)}</Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity style={styles.buttonWrapper} onPress={() => this.props.removeFromBasket(this.props.product)}>
              <View style={styles.removeButton}>
                <Ionicons name={'md-remove'} size={12} color={'#fff'} />
              </View>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{this.props.quantity}</Text>
            <TouchableOpacity style={styles.buttonWrapper} onPress={() => this.props.addToBasket(this.props.product)}>
              <View style={styles.addButton}>
                <Ionicons name={'md-add'} size={12} color={'#fff'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.options}
          onPress={() => this.props.setDoNotReplace(product, !doNotReplace)}
        >
            <View
              style={{
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: doNotReplace ? '#008800' : '#fff',
                }}
              />
            </View>
            <Text style={{ marginLeft: 8, fontSize: 12 }}>Do not replace this item if it's out of stock</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingTop: 12
  },
  options: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 8
  },
  name: {
    flex: 1,
    // marginLeft: 12,
    // flex: 2
    // fontWeight: 'bold'
  },
  quantity: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#008800',
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    margin: 8
  },
  total: {
    fontWeight: 'bold',
    fontSize: 14,
    marginHorizontal: 16
  },
  buttonWrapper: {
    // marginRight: 4
  },
  removeButton: {
    // backgroundColor: '#fff',
    backgroundColor: '#aa0000',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 2,
    // borderColor: '#990000',
    borderRadius: 4,
    width: 32,
    height: 32
  },
  addButton: {
    // backgroundColor: '#fff',
    backgroundColor: '#00aa00',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 2,
    // borderColor: '#008800',
    borderRadius: 4,
    width: 32,
    height: 32
  }
})