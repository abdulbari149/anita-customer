import React from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default class ProductListItem extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.item}>
          <Image
            style={styles.image}
            source={{ uri: this.props.product.image || 'https://placehold.it/64/64' }}
            resizeMethod='resize'
            resizeMode='contain'
          />
          <View style={styles.details}>
            <Text style={styles.name}>{this.props.product.name}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Text style={styles.price}>£{(this.props.product.price / 100).toFixed(2)}</Text>
            <TouchableOpacity style={styles.buttonWrapper} onPress={this.props.onAddPressed}>
              <View style={styles.addButton}>
                <Ionicons name={'md-add'} size={18} color={'#008800'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {this.props.quantity > 0 &&
          <View style={styles.editor}>
            <View style={styles.quantity}>
              <Text style={styles.quantityText}>{this.props.quantity}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Text style={styles.total}>£{((this.props.product.price * this.props.quantity) / 100).toFixed(2)}</Text>
              <TouchableOpacity style={styles.buttonWrapper} onPress={this.props.onRemovePressed}>
                <View style={styles.removeButton}>
                  <Ionicons name={'md-remove'} size={20} color={'#888'} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  editor: {
    backgroundColor: '#F4F4F4',
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#C4C4C4',
    borderTopWidth: 1
  },
  quantity: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#008800',
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6
  },
  quantityText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#008800',
  },
  item: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center'
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  details: {
    flex: 1,
    marginLeft: 16
  },
  name: {
    fontWeight: 'bold'
  },
  description: {
    fontSize: 12,
    marginTop: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  price: {
    fontWeight: 'bold'
  },
  total: {
    fontWeight: 'bold',
    color: '#646464'
  },
  buttonWrapper: {
    padding: 8,
    marginLeft: 0,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#008800',
    borderRadius: 28,
    width: 30,
    height: 30
  },
  removeButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 28,
    width: 30,
    height: 30
  }
})
