import * as Sentry from 'sentry-expo'
import Axios from 'axios'
import Constants from 'expo-constants'
import { AsyncStorage } from 'react-native'

import { ServerConnectionError, ParameterError, InternalServerError } from './Errors'

const isDev = Constants.manifest.releaseChannel === undefined
const ENDPOINT_HOST = isDev ? 'http://192.168.4.142:5643' : 'https://api.anita-delivery.com'
const WEBSOCKET_HOST = isDev ? 'ws://192.168.4.142:5643' : 'wss://api.anita-delivery.com'

const TOKEN_KEY = 'anita_token'
let cachedToken

const endpoint = Axios.create({
  baseURL: ENDPOINT_HOST,
  headers: { 'X-Anita-Platform': 1 },
  timeout: 10000
})

endpoint.interceptors.response.use(
  response => {
    if (response.data.errors != null) {
      const parameters = response.data.errors.reduce(
        (root, error) => {
          root[error.param] = error.msg
          return root
        },
        {}
      )

      return Promise.reject(new ParameterError(parameters))
    }

    return response
  },
  error => {
    if (error.response != null) {
      return Promise.reject(new InternalServerError())
    }

    if (error.request != null) {
      return Promise.reject(new ServerConnectionError())
    }

    return Promise.reject(error)
  }
)

const Account = {
  launch: async () => {
    try {
      await endpoint.post(
        '/accounts/launch',
        { installationID: Constants.installationId, platformID: 1 }
      )
    } catch (error) {
      if (error instanceof ServerConnectionError || error instanceof InternalServerError) {
        return
      }

      Sentry.captureException(error)
    }
  },
  retrieve: async () => {
    await getToken()
    if (cachedToken == null) return null

    const response = await endpoint.get(
      '/accounts/me',
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    const account = response.data.data.account
    Sentry.setUser({ id: account.id })

    return account
  },
  create: async (email, password, firstName, lastName, phoneNumber, consentedToMarketing, pushToken) => {
    const response = await endpoint.post(
      '/accounts',
      { email, password, firstName, lastName, phoneNumber, consentedToMarketing, pushToken }
    )

    const { token } = response.data.data
    await setToken(token)

    const account = await Customer.register()
    Sentry.setUser({ id: account.id })

    return account
  },
  update: async (firstName, lastName, phoneNumber) => {
    const response = await endpoint.post(
      '/accounts/update',
      { firstName, lastName, phoneNumber },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.account
  },
  logIn: async (email, password, pushToken) => {
    const response = await endpoint.post(
      '/accounts/log-in',
      { email, password, pushToken }
    )

    let { account, token } = response.data.data
    await setToken(token)

    if (account.customer == null) {
      account = await Customer.register()
    }

    Sentry.setUser({ id: account.id })

    return account
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await endpoint.post(
      '/accounts/change-password',
      { currentPassword, newPassword },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    let { account, token } = response.data.data
    await setToken(token)

    return account
  },
  requestPasswordReset: async (email) => {
    await endpoint.post(
      '/accounts/request-password-reset',
      { email }
    )
  },
  logOut: async () => {
    await endpoint.post(
      '/accounts/log-out',
      null,
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    await deleteToken()

    Sentry.setUser(null)
  },
  updatePushToken: async (token) => {
    const response = await endpoint.post(
      '/accounts/token',
      { token },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.account
  }
}

const Customer = {
  viewMenu: async (premisesID) => {
    try {
      await endpoint.post(
        `/customers/view-menu/${premisesID}`,
        { installationID: Constants.installationId }
      )
    } catch (error) {
      if (error instanceof ServerConnectionError || error instanceof InternalServerError) {
        return
      }

      Sentry.captureException(error)
    }
  },
  register: async () => {
    const response = await endpoint.post(
      '/customers',
      null,
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.account
  },
  isWithinDeliveryArea: async (location) => {
    const response = await endpoint.post('/customers/delivery-area-check', { location })
    return response.data.data.isWithinDeliveryArea
  },
  getShops: async () => {
    const response = await endpoint.get('/customers/shops')
    return response.data.data.shops
  },
  getShopMenu: async (id) => {
    const response = await endpoint.get(`/customers/shops/${id}/menu`)
    return response.data.data.menu
  },
  isShopOnline: async (id) => {
    const response = await endpoint.get(`/customers/shops/${id}/online`)
    return response.data.data
  },
  getOrders: async () => {
    const response = await endpoint.get(
      '/customers/order-history',
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.orders
  },
  getPaymentIntent: async (premisesID, subtotal, deliveryFee, donationAmount) => {
    const response = await endpoint.post(
      '/customers/payment-intent',
      { premisesID, subtotal, deliveryFee, donationAmount },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.paymentIntent
  },
  getPaymentMethods: async () => {
    const response = await endpoint.get(
      '/customers/payment-methods',
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.paymentMethods
  },
  addDeliveryAddress: async (streetAddress, postcode, location) => {
    const response = await endpoint.post(
      '/customers/delivery-addresses',
      { streetAddress, postcode, location },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.account
  },
  updateDeliveryAddresses: async (deliveryAddresses) => {
    const response = await endpoint.patch(
      '/customers/delivery-addresses',
      { deliveryAddresses },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.account
  }
}

const Order = {
  create: async (premisesID, basket, deliveryAddress, notes, paymentIntentID, promoCodeID, donationAmount) => {
    const response = await endpoint.post(
      '/orders',
      { premisesID, basket, deliveryAddress, notes: notes == null ? '' : notes, paymentIntentID, promoCodeID, donationAmount },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.order
  },
  validatePromoCode: async (code) => {
    const response = await endpoint.post(
      '/orders/promo-code',
      { code },
      { headers: { 'Authorization': `Bearer ${cachedToken}` } }
    )

    return response.data.data.promoCode
  },
  getCheckoutURL: () => `${ENDPOINT_HOST}/customers/checkout`
}

let webSocket

const socketResponseListeners = {}

const onSocketMessageReceived = (socket, message) => {
  let payload

  try {
    payload = JSON.parse(message)
  } catch (error) {
    console.log('Error parsing payload.')
    return
  }

  if (payload.id == null || socketResponseListeners[payload.id] == null) {
    console.log(`No handler for payload id ${payload.id}`)
    return
  }

  socketResponseListeners[payload.id].forEach(callback => {
    if (callback == null) return
    callback(payload.body)
  })
}

const onSocketClose = (event) => {
  console.log('onSocketClose', event.code, event.reason)

  socketResponseListeners['disconnected'].forEach(callback => {
    if (callback == null) return
    callback()
  })
}

const Socket = {
  isConnected: () => {
    return webSocket != null && webSocket.readyState === WebSocket.OPEN
  },
  connect: () => {
    return new Promise((resolve, reject) => {
      webSocket = new WebSocket(WEBSOCKET_HOST)

      webSocket.addEventListener('open', e => {
        webSocket.send(JSON.stringify({
          id: 'auth',
          body: { token: cachedToken }
        }))

        socketResponseListeners['connected'].forEach(callback => {
          if (callback == null) return
          callback()
        })

        resolve()
      })

      webSocket.addEventListener('error', reject)

      webSocket.addEventListener('message', event => {
        onSocketMessageReceived(webSocket, event.data)
      })

      webSocket.addEventListener('close', onSocketClose)
    })
  },
  disconnect: () => {
    if (webSocket == null) {
      return
    }

    webSocket.removeEventListener('close', onSocketClose)

    webSocket.close()
    webSocket = null
  },
  on: (name, callback) => {
    if (socketResponseListeners[name] == null) {
      socketResponseListeners[name] = []
    }

    socketResponseListeners[name].push(callback)
    return (socketResponseListeners[name].length - 1)
  },
  removeListener: (name, id) => {
    if (socketResponseListeners[name] == null || id >= socketResponseListeners[name].length)  {
      return false
    }

    socketResponseListeners[name][id] = null
    return true
  },
  sendHeartbeat: () => {
    if (webSocket == null) {
      return
    }

    webSocket.send(JSON.stringify({ id: 'heartbeat' }))
  }
}

const getToken = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  cachedToken = token

  return token
}

const setToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token)
  cachedToken = token
}

const deleteToken = async () => {
  cachedToken = null
  await AsyncStorage.removeItem(TOKEN_KEY)
}

export default {
  Account,
  Customer,
  Order,
  Socket,
  getToken,
  deleteToken
}
