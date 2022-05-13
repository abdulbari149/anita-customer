import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import Moment from 'moment'
import AppContext from '../contexts/app'

import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'
import { WebView } from 'react-native-webview'

import Constants from 'expo-constants'
import { ActivityIndicator, FlatList, View, Text, Image, TouchableOpacity, Modal } from 'react-native'

const isDev = Constants.manifest.releaseChannel === undefined

export default class OrdersScreen extends React.Component {
  static navigationOptions = {
    title: 'Your orders'
  }

  static contextType = AppContext

  state = {
    orders: [],
    refreshing: false,
    isConnected: false,
    selectedReceiptID: undefined,
  }

  constructor(props) {
    super(props)

    this.willFocusListener = props.navigation.addListener('willFocus', this.onWillFocus)
    this.willBlurListener = props.navigation.addListener('willBlur', this.onWillBlur)
  }

  componentWillUnmount() {
    this.willFocusListener.remove()
    this.willBlurListener.remove()
  }

  onWillFocus = async () => {
    const { account } = this.context

    if (account == null) return

    if (this.connectionCheckInterval != null) {
      clearInterval(this.checkConnection)
    }

    this.connectionCheckInterval = setInterval(this.checkConnection, 15000)

    this.connectedListener = AnitaAPI.Socket.on('connected', () => {
      console.log('Connected')
      this.setState({ isConnected: true })
    })

    this.disconnectedListener = AnitaAPI.Socket.on('disconnected', () => {
      console.log('Disconnected')
      this.setState({ isConnected: false })
    })

    this.heartbeatListener = AnitaAPI.Socket.on('heartbeat', () => {
      console.log('Got heartbeat')
    })

    this.orderAcceptedListener = AnitaAPI.Socket.on('orderAccepted', async ({ id }) => {
      console.log('Order accepted', id)
      await this.refreshOrders()
    })

    this.orderReadyListener = AnitaAPI.Socket.on('orderReady', async ({ id }) => {
      console.log('Order ready', id)
      await this.refreshOrders()
    })

    this.orderDeclinedListener = AnitaAPI.Socket.on('orderDeclined', async ({ id }) => {
      console.log('Order declined', id)
      await this.refreshOrders()
    })

    this.orderCollectedListener = AnitaAPI.Socket.on('orderCollected', async ({ id }) => {
      console.log('Order collected', id)
      await this.refreshOrders()
    })

    this.orderOutForDeliveryListener = AnitaAPI.Socket.on('orderOutForDelivery', async ({ id }) => {
      console.log('Order out for delivery', id)
      await this.refreshOrders()
    })

    this.orderDeliveredListener = AnitaAPI.Socket.on('orderDelivered', async ({ id }) => {
      console.log('Order delivered', id)
      await this.refreshOrders()
    })

    if (!AnitaAPI.Socket.isConnected()) {
      try {
        await AnitaAPI.Socket.connect()
      } catch (error) {
        console.log('Error connecting', error.message)
      }
    }

    await this.refreshOrders()

    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    let permissionStatus = existingStatus

    console.log('existingStatus', existingStatus)

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      permissionStatus = status
    }

    console.log('permissionStatus', permissionStatus)

    if (permissionStatus !== 'granted') return

    try {
      console.log('getting push token...')
      const token = await Notifications.getExpoPushTokenAsync()

      if (token === this.context.account.customer.expoPushToken) {
        console.log('same push token')
        return
      }

      console.log(`got new token ${token}, updating...`)
      const account = await AnitaAPI.Account.updatePushToken(token)
      this.context.set({ account })
    } catch (error) {
      alert(error.message)
    }
  }

  onWillBlur = async () => {
    const { account } = this.context

    if (account == null) return

    if (this.connectionCheckInterval != null) {
      clearInterval(this.checkConnection)
    }

    AnitaAPI.Socket.removeListener('connected', this.connectedListener)
    AnitaAPI.Socket.removeListener('disconnected', this.disconnectedListener)
    AnitaAPI.Socket.removeListener('heartbeat', this.heartbeatListener)
    AnitaAPI.Socket.removeListener('orderAccepted', this.orderAcceptedListener)
    AnitaAPI.Socket.removeListener('orderReady', this.orderReadyListener)
    AnitaAPI.Socket.removeListener('orderDeclined', this.orderDeclinedListener)
    AnitaAPI.Socket.removeListener('orderCollected', this.orderCollectedListener)
    AnitaAPI.Socket.removeListener('orderOutForDelivery', this.orderOutForDeliveryListener)
    AnitaAPI.Socket.removeListener('orderDelivered', this.orderDeliveredListener)
  }

  checkConnection = async () => {
    if (this.context.account == null) {
      clearInterval(this.checkConnection)
      return
    }

    if (this.state.isConnected) {
      console.log('Sending heartbeat')
      AnitaAPI.Socket.sendHeartbeat()
      return
    }

    console.log('Reconnecting...')

    try {
      await AnitaAPI.Socket.connect()
    } catch (error) {
      console.log('Error reconnecting', error.message)
    }
  }

  refreshOrders = async () => {
    if (!this.context.account) return

    this.setState({ refreshing: true })

    let orders = []

    try {
      orders = await AnitaAPI.Customer.getOrders()
    } catch (error) {
      alert(error.message)
    }

    console.log(orders);

    this.setState({ orders, refreshing: false })
  }

  render() {
    const { orders, refreshing, isConnected, selectedReceiptID } = this.state
    const { account } = this.context

    return (
      <View style={{ flex: 1, backgroundColor: '#eee' }}>
        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          refreshing={refreshing}
          onRefresh={this.refreshOrders}
          renderItem={this.renderItem}
          ListHeaderComponent={() => <View style={{ height: 16 }} />}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListFooterComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={() =>
            <Text style={{ textAlign: 'center', fontSize: 16 }}>No orders to display.</Text>
          }
        />
        {account != null && !isConnected &&
          <View style={{ padding: 16, backgroundColor: '#ddd', flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator color='#000' style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: 'bold' }}>CONNECTING...</Text>
          </View>
        }
        <Modal
          transparent={true}
          animationType={"fade"}
          visible={selectedReceiptID != null}
          onRequestClose={() => this.setState({ selectedReceiptID: undefined })}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 16,
              justifyContent: "center"
            }}
          >
            {selectedReceiptID &&
              <View
                style={{
                  backgroundColor: "#fff",
                  height: "80%"
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold", padding: 16 }}>View receipt</Text>
                <WebView
                  bounces={false}
                  overScrollMode='never'
                  source={{ uri: `${isDev ? 'http://localhost:5643' : 'https://api.anita-delivery.com'}/orders/receipts/${selectedReceiptID}` }}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: "#008800",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 12,
                    marginTop: 16
                  }}
                  onPress={() => this.setState({ selectedReceiptID: null })}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>DISMISS</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </Modal>
      </View>
    )
  }

  renderItem = ({ item }) => {
    const status = item.cancelledAt != null
      ? 'Cancelled'
      : item.deliveredAt != null
        ? 'Delivered'
        : item.outForDeliveryAt != null
          ? 'Out for delivery'
          : item.collectedAt != null
              ? 'Collected by driver'
              : item.acceptedAt != null
                ? 'Being prepared'
                : 'Pending'

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ddd',
          padding: 16,
          marginHorizontal: 16
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>{Moment(item.createdAt).format('ddd Do MMM h:mm A')}</Text>
          <Text style={{ fontWeight: 'bold' }}>{status}</Text>
        </View>
        {item.outForDeliveryAt != null && item.deliveredAt == null &&
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#008800', padding: 16, marginTop: 16 }}
            onPress={() => this.trackDelivery(item)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>TRACK DELIVERY</Text>
          </TouchableOpacity>
        }
        <View style={{ marginVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Image
            style={{ width: 48, height: 48, borderRadius: 4 }}
            source={{ uri: item.premises.logo != null ? item.premises.logo : 'https://placehold.it/64/64' }}
            resizeMode='cover'
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.premises.name}</Text>
            <Text style={{ fontSize: 12, marginTop: 2 }}>{item.premises.streetAddress} - {item.premises.postcode}</Text>
          </View>
        </View>
        {item.basket.map(product =>
          <View key={product.id} style={{ flexDirection: 'row', marginBottom: 8, opacity: product.removed ? 0.5 : 1 }}>
            <Text style={{ fontWeight: 'bold', color: '#008800', marginRight: 8 }}>{product.quantity}</Text>
            <Text style={{ flex: 1, marginRight: 8 }}>{product.removed ? '[REFUNDED] ' : product.originalQuantity ? `[${product.originalQuantity - product.quantity} REFUNDED] ` : ''}{product.replaced ? product.replacedQuantity ? `[${product.replacedQuantity} REPLACED] ` : '[REPLACED] ' : ''}{product.name}</Text>
            <Text>{product.removed ? '-' : ''}£{((product.quantity * product.price) / 100).toFixed(2)}</Text>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: '#ddd', marginTop: 8 }} />
        {!item.cancelledAt &&
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#008800', padding: 12, marginTop: 8 }}
            onPress={() => this.setState({ selectedReceiptID: item.receiptID })}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>VIEW RECEIPT</Text>
          </TouchableOpacity>
        }
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Text style={{ flex: 1 }}>Subtotal</Text>
          <Text>£{(item.subtotal / 100).toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <Text style={{ flex: 1 }}>Delivery fee</Text>
          <Text>£{(item.deliveryFee / 100).toFixed(2)}</Text>
        </View>
        {item.donationAmount > 0 &&
          <>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <Text style={{ flex: 1 }}>Foyle Foodbank donation</Text>
              <Text>£{(item.donationAmount / 100).toFixed(2)}</Text>
            </View>
          </>
        }
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          <Text style={{ flex: 1, fontWeight: 'bold' }}>Total</Text>
          <Text style={{ fontWeight: 'bold' }}>£{((item.subtotal + item.deliveryFee + item.donationAmount) / 100).toFixed(2)}</Text>
        </View>
      </View>
    )
  }

  trackDelivery = (order) => {
    this.props.navigation.navigate('TrackDelivery', { order })
  }
}
