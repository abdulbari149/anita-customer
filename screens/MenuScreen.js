import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import AppContext from '../contexts/app'
import * as Sentry from 'sentry-expo'
import { ServerConnectionError } from '../lib/Errors'

import {
  ActivityIndicator,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  StyleSheet
} from 'react-native'

import { Ionicons, MaterialIcons } from '@expo/vector-icons'

import * as Device from 'expo-device'
const needsMargin = ['iphone x', 'iphone 11'].some(name => Device.modelName.toLowerCase().includes(name))

export default class MenuScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('name', 'Menu'),
      headerRight: (
        <TouchableOpacity 
          style={{ marginRight: 8, paddingHorizontal: 8 }}
          onPress={navigation.getParam('toggleSearch')}
        >
          {navigation.getParam('isSearching', false)
            ? <MaterialIcons name={'cancel'} color={'#FFFFFF'} size={32} />
            : <Ionicons name={'md-search'} color={'#FFFFFF'} size={32} />
          }
        </TouchableOpacity>
      )
    }
  }

  static contextType = AppContext

  constructor(props) {
    super(props)

    this.state = {
      premisesID: null,
      menu: null,
      selectedCategory: null,
      isSwitching: false,
      isSearching: false,
      searchText: '',
      searchResults: [],
      deliveryFee: null,
      isWithinDeliveryArea: false,
      viewingProduct: null,
      isCategoryListOpen: false
    }

    this.categoriesListRef = React.createRef()
    this.productsListRef = React.createRef()

    props.navigation.setParams({ isSearching: false, toggleSearch: this.toggleSearch })
  }

  async componentDidMount() {
    const premisesID = this.props.navigation.getParam('premisesID', null)
    const deliveryFee = this.props.navigation.getParam('deliveryFee', null)
    const isWithinDeliveryArea = this.props.navigation.getParam('isWithinDeliveryArea', false)
    const initialCategory = this.props.navigation.getParam('initialCategory', '')
    const menu = this.props.navigation.getParam('menu', null)

    const { selectedPremisesID } = this.context

    if (selectedPremisesID !== premisesID) {
      this.context.set({ selectedPremisesID: premisesID, basket: [] })
    }

    this.setState({ premisesID, menu, deliveryFee, selectedCategory: initialCategory, isWithinDeliveryArea })

    await AnitaAPI.Customer.viewMenu(premisesID)
  }

  toggleMenu = () => {
    const isCategoryListOpen = !this.state.isCategoryListOpen

    this.setState({
      isCategoryListOpen,
    })

  }

  toggleSearch = () => {
    const isSearching = !this.state.isSearching

    this.props.navigation.setParams({ isSearching })
    this.setState({ 
      isSearching, 
      searchText: '', 
      searchResults: [], 
      isCategoryListOpen: false,
    })
  }

  onSearchTextChanged = text => {
    const searchText = text.trim()
    const searchResults = []

    if (searchText.length > 0) {
      for (const category of this.state.menu) {
        for (const product of category.data) {
          if (product.name.toLowerCase().includes(searchText.toLowerCase())) {
            searchResults.push(product)
          }
        }
      }
    }

    searchResults.sort((a, b) => a.name.localeCompare(b.name))
    this.setState({ searchText: text, searchResults })
  }

  render() {
    const { menu, selectedCategory, isSearching, searchText, searchResults, viewingProduct, isCategoryListOpen } = this.state

    if (menu == null) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color='#008800' size='large' />
        </View>
      )
    }

    const { basket } = this.context
    const canViewBasket = basket.length > 0

    const products = menu.find(category => category.title === selectedCategory).data

    return (
      <View style={{ flex: 1 }}>
        {isSearching
          ? (
            <View style={{ flex: 1 }}>
              <View style={{ borderColor: '#eee', borderBottomWidth: 1 }}>
                <TextInput
                  placeholder='Search all products'
                  returnKeyType='search'
                  autoFocus={true}
                  onChangeText={this.onSearchTextChanged}
                  value={searchText}
                  style={{ padding: 16, fontSize: 16 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FlatList 
                  data={searchResults}
                  keyExtractor={item => item.name}
                  renderItem={this.renderProductItem}
                  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }}/>}
                  extraData={basket}
                  // getItemLayout={this.getProductItemLayout}
                  keyboardShouldPersistTaps='handled'
                />
              </View>
            </View>
          )
          : (
            <View style={{ flex: 1 }}>
              <View style={{ borderColor: '#008800', borderBottomWidth: 1, borderTopWidth: 1 }}>
                <TouchableOpacity onPress={this.toggleMenu}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 12,
                    }}
                  >
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#008800'}}>
                        {isCategoryListOpen ? 'Select a category' : selectedCategory}
                      </Text>
                    </View>
                    <MaterialIcons name={isCategoryListOpen ? 'expand-less' : 'expand-more'} color={'#008800'} size={32} />
                  </View>
                </TouchableOpacity>
                  {isCategoryListOpen && (
                    <FlatList
                      ref={this.categoriesListRef}
                      data={menu}
                      keyExtractor={category => category.title}
                      renderItem={this.renderCategoryItem}
                      ListHeaderComponent={() => <View style={{ width: '100%', borderColor: '#eee', borderTopWidth: 1 }}/>}
                      ListFooterComponent={() => <View style={{ width: '100%', borderColor: '#eee', borderBottomWidth: 1, paddingBottom: 32}}/>}
                      horizontal={false}
                      extraData={selectedCategory}
                      contentContainerStyle={{ paddingBottom: 24 }}
                    />
                  )}
              </View>
              <View style={{ flex: 1 }}>
                {!this.state.isSwitching && !isCategoryListOpen && 
                  <FlatList 
                    ref={this.productsListRef}
                    data={products}
                    keyExtractor={item => item.name}
                    renderItem={this.renderProductItem}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }}/>}
                    extraData={basket}
                    // getItemLayout={this.getProductItemLayout}
                    windowSize={41}
                  />
                }
              </View>
            </View>
          )
        }
        {canViewBasket &&
          <TouchableOpacity
            style={{
              padding: 16,
              flexDirection: 'row',
              backgroundColor: '#008800',
              borderColor: '#eee',
              borderTopWidth: 1,
              marginBottom: needsMargin ? 32 : 0
            }}
            onPress={this.onViewBasketPressed}
          >
            <Text style={{ flex: 1, marginRight: 16, fontWeight: 'bold', color: '#fff' }}>
              VIEW BASKET
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>
              {this.getBasketCount()} | £{(this.getBasketTotal() / 100).toFixed(2)}
            </Text>
          </TouchableOpacity>
        }
        <Modal
          visible={viewingProduct != null}
          onRequestClose={() => console.log('onRequestClose')}
          transparent={true}
          animationType='fade'
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
            }}
          >
            {viewingProduct != null &&
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => this.setState({ viewingProduct: null })}
                activeOpacity={1}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 32,
                    marginHorizontal: 16
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#fff',
                      marginRight: 32
                    }}
                  >
                    {viewingProduct.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#fff',
                    }}
                  >
                    £{(viewingProduct.price / 100).toFixed(2)}
                  </Text>
                </View>
                <Image
                  style={{
                    flex: 1,
                    marginTop: 16
                  }}
                  source={{ uri: viewingProduct.image || 'https://placehold.it/512/512' }}
                  resizeMode='contain'
                />
                <Text
                  style={{
                    color: '#fff',
                    margin: 16,
                    textAlign: 'center',
                    opacity: 0.5
                  }}
                >
                  Tap anywhere to close.
                </Text>
              </TouchableOpacity>
            }
          </View>
        </Modal>
      </View>
    )
  }

  renderCategoryItem = ({ item, index }) => {
    const { selectedCategory } = this.state
    const isSelected = selectedCategory != null && item.title === selectedCategory

    return (
      <TouchableOpacity
        onPress={() => this.onCategorySelected(item, index)}
      >
        <View style={{...styles.categoryItem, backgroundColor: isSelected ? '#008000' : 'white'}}>
          <View style={{ flex: 1, flexDirection: 'column', marginRight: 8}}>
            <Text style={{...styles.categoryName, color: !isSelected ? 'black' : 'white'}}>{item.title}</Text>
          </View>

          <Ionicons name={'ios-arrow-forward'} size={20} color={!isSelected ? '#008000' : 'white'} />
        </View>
      </TouchableOpacity>
    )
  }

  onCategorySelected = (category, index) => {
    if (this.state.selectedCategory === category.title) {
      this.toggleMenu()
      return
    }

    this.categoriesListRef.current.scrollToIndex({ index, viewPosition: 0.5 })

    // hide menu
    this.toggleMenu()

    this.setState(
      { selectedCategory: category.title, isSwitching: true },
      () => {
        this.setState(
          { isSwitching: false },
          () => this.productsListRef.current.scrollToOffset({ offset: 0, animated: false })
        )
      }
    )
  }

  renderProductItem = ({ item }) => {
    const existingItem = this.context.basket.find(basketItem => basketItem.product.id === item.id)

    return (
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            width: 64,
            height: 64
          }}
          onPress={() => this.setState({ viewingProduct: item })}
        >
          <Image
            style={{ width: 64, height: 64 }}
            source={{ uri: item.image || 'https://placehold.it/64/64' }}
            resizeMode='contain'
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 16, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {item.outOfStock &&
              <Text style={{ color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
                OUT OF STOCK
              </Text>
            }
            {item.isSpecial && !item.outOfStock &&
              <Text style={styles.specialOfferLabel}>
                SPECIAL OFFER
              </Text>
            }
            <Text>
              {item.name}
            </Text>
            {existingItem != null &&
              <Text style={{ color: '#008800', fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>
                {existingItem.quantity} IN BASKET
              </Text>
            }
          </View>
          <TouchableOpacity 
            style={{ 
              marginLeft: 16, 
              paddingHorizontal: 8,
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 32,
              backgroundColor: item.outOfStock ? '#888' : '#008800',
              borderRadius: 2
            }}
            disabled={item.outOfStock}
            onPress={() => this.onProductSelected(item)}
          >
            <Ionicons 
              name={'md-add'} 
              size={16} 
              color={'#fff'}
            />
            <Text style={{ marginLeft: 4, fontWeight: 'bold', color: '#fff' }}>
              £{(item.price / 100).toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  onProductSelected = product => {
    if (product.outOfStock) {
      return
    }

    const { basket, set } = this.context
    const existingItem = basket.find(item => item.product.id === product.id)

    if (existingItem != null) {
      existingItem.quantity += 1
    } else {
      basket.push({ product, quantity: 1 })
    }

    set({ basket })
  }

  getProductItemLayout = (data, index) => {
    const height = 64 + 32
    return { length: height, offset: (height + index) * index, index }
  }

  getBasketCount = () => this.context.basket.reduce(
    (count, item) => count + item.quantity,
    0
  )
  
  getBasketTotal = () => this.context.basket.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  )

  onViewBasketPressed = () => {
    const { premisesID, deliveryFee, isWithinDeliveryArea } = this.state
    this.props.navigation.navigate('Basket', { premisesID, deliveryFee, isWithinDeliveryArea })
  }

  getProductCategory = (product) => {
    for (const category of this.state.menu) {
      for (const item of category.data) {
        if (item.id === product.id) return category
      }
    }
    
    return null
  }
}

const styles = StyleSheet.create({
  specialOfferLabel: {
    color: '#ffffff',
    backgroundColor: '#eb4034',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    // test behavior on smaller ppi emulator
    alignSelf: 'flex-start',
    textAlign: 'center',
  },
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