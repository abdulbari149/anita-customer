// import Constants from 'expo-constants'
import * as Sentry from 'sentry-expo'
// import * as Facebook from 'expo-facebook'
import { LogBox } from 'react-native'
// Sentry.init({
//   dsn: 'https://98f4b296b9fa45c28e8b9ddcd9998895@sentry.io/1510815',
//   enableInExpoDevelopment: false,
//   debug: false,
//   enableNative: false
// })

console.log(Constants.manifest.releaseChannel)
// Facebook.setAutoLogAppEventsEnabledAsync(true)
//   .then(() => Facebook.initializeAsync({appId: "3174719052608750", appName: "Anita Delivery"}))
//   .then(() => console.log("FB SDK initialised"))
//   .catch(error => Sentry.captureException(error))

import React from 'react'
import {
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer,
  createSwitchNavigator
} from 'react-navigation'
import { MaterialIcons } from '@expo/vector-icons'
import AppContext from './contexts/app'
import { StatusBar } from 'expo-status-bar';

import SplashScreen from './screens/SplashScreen'
import IntroScreen from './screens/IntroScreen'
import AuthenticationScreen from './screens/AuthenticationScreen'

import BrowseScreen from './screens/BrowseScreen'
import MenuScreen from './screens/MenuScreen'
import BasketScreen from './screens/BasketScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import AddDeliveryAddressScreen from './screens/AddDeliveryAddressScreen'
import ExternalMenuScreen from './screens/ExternalMenuScreen'

import OrdersScreen from './screens/OrdersScreen'
import TrackDeliveryScreen from './screens/TrackDeliveryScreen'

import AccountScreen from './screens/AccountScreen'
import LogInScreen from './screens/LogInScreen'
import SignUpScreen from './screens/SignUpScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import ChangePasswordScreen from './screens/ChangePasswordScreen'

import SelectDeliveryAddressScreen from './screens/SelectDeliveryAddressScreen'
import ManageDeliveryAddressesScreen from './screens/ManageDeliveryAddressesScreen'

import ManageAccountScreen from './screens/ManageAccountScreen'
import SelectCategoryScreen from './screens/SelectCategoryScreen'

const navigationOptions = {
  headerStyle: {
    backgroundColor: '#008800',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  }
}

const browseNavigator = createStackNavigator(
  {
    Browse: BrowseScreen,
    SelectCategory: SelectCategoryScreen,
    Menu: MenuScreen,
    Basket: BasketScreen,
    SelectDeliveryAddress: SelectDeliveryAddressScreen,
    AddDeliveryAddress: AddDeliveryAddressScreen,
    Checkout: CheckoutScreen,
  },
  {
    initialRouteName: 'Browse',
    defaultNavigationOptions: navigationOptions
  }
)

browseNavigator.navigationOptions = ({ navigation }) => {
  return { tabBarVisible: navigation.state.index < 1 }
}

const ordersNavigator = createStackNavigator(
  {
    Orders: OrdersScreen,
    TrackDelivery: TrackDeliveryScreen
  },
  {
    initialRouteName: 'Orders',
    defaultNavigationOptions: navigationOptions
  }
)

const accountNavigator = createStackNavigator(
  {
    Account: AccountScreen,
    ChangePassword: ChangePasswordScreen,
    ManageDeliveryAddresses: ManageDeliveryAddressesScreen,
    AddDeliveryAddressAccount: AddDeliveryAddressScreen,
    ManageAccount: ManageAccountScreen
  },
  {
    defaultNavigationOptions: navigationOptions
  }
)

accountNavigator.navigationOptions = ({ navigation }) => {
  return { tabBarVisible: navigation.state.index < 1 }
}

const coreNavigator = createBottomTabNavigator(
  {
    Shops: browseNavigator,
    Orders: ordersNavigator,
    Account: accountNavigator,
  },
  {
    initialRouteName: 'Shops',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ tintColor }) => {
        const { routeName } = navigation.state
        let iconName = 'store'

        if (routeName === 'Orders') {
          iconName = 'receipt'
        } else if (routeName === 'Account') {
          iconName = 'account-circle'
        }

        return <MaterialIcons name={iconName} size={24} color={tintColor} />
      }
    })
  }
)

const authNavigator = createStackNavigator(
  {
    Auth: AuthenticationScreen,
    LogIn: LogInScreen,
    SignUp: SignUpScreen,
    ResetPassword: ResetPasswordScreen
  },
  {
    initialRouteName: 'Auth'
  }
)

const appNavigator = createStackNavigator(
  {
    Core: coreNavigator,
    Auth: authNavigator,
    ExternalMenu: ExternalMenuScreen
  },
  {
    initialRouteName: 'Core',
    headerMode: 'none'
  }
)

const rootNavigator = createSwitchNavigator(
  {
    Splash: SplashScreen,
    Intro: IntroScreen,
    App: appNavigator
  },
  {
    initialRouteName: 'Splash'
  }
)

const AppContainer = createAppContainer(rootNavigator)

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.set = data => this.setState({ ...data })

    this.state = {
      set: this.set,
      account: null,
      basket: [],
      donationAmount: 0,
      promoCode: null,
      selectedPremisesID: null
    }
  }

  render() {
    return (
      <AppContext.Provider value={this.state}>
        <StatusBar style={'auto'}/>
        <AppContainer />
      </AppContext.Provider>
    )
  }
}
