import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import AppContext from '../contexts/app'
import * as Geolib from 'geolib'
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import * as Sentry from 'sentry-expo'

import { ActivityIndicator, StyleSheet, View, Text, Alert } from 'react-native'
import BusinessList from '../lists/BusinessList'
import { ServerConnectionError } from '../lib/Errors'

export default class BrowseScreen extends React.Component {
  static navigationOptions = {
    title: 'Shops'
  }

  static contextType = AppContext

  state = {
    isFetchingLocation: true,
    businesses: [],
    isRefreshing: false,
    isWithinDeliveryArea: false
  }

  constructor(props) {
    super(props)

    this.didFocusListener = props.navigation.addListener('didFocus', this.onDidFocus)
  }

  onDidFocus = async () => {
    await this.refreshBusinesses()
  }

  refreshBusinesses = async () => {
    this.setState({ isRefreshing: true })

    const { status } = await Permissions.getAsync(Permissions.LOCATION)

    if (status !== Permissions.PermissionStatus.GRANTED) {
      Sentry.captureMessage(`BrowseScreen: Location permission not granted, status: ${status}`)

      if (status === Permissions.PermissionStatus.UNDETERMINED) {
        const response = await Permissions.askAsync(Permissions.LOCATION)

        if (response.status !== Permissions.PermissionStatus.GRANTED) {
          Sentry.captureMessage(`BrowseScreen: Location permission refused`)
          this.setState({ isRefreshing: false })
          Alert.alert('Location permissions', 'Please enable location services for Anita Delivery in your settings.')
          return
        }
      } else {
        this.setState({ isRefreshing: false })
        Alert.alert('Location permissions', 'Please enable location services for Anita Delivery in your settings.')

        return
      }
    }

    let currentPosition

    try {
      currentPosition = await Location.getLastKnownPositionAsync();

      if(currentPosition == null)
      {
        throw "no location error";
      }
    }
    catch (error)
    {
      Sentry.captureMessage('BrowseScreen: 1st location attempt failed')
      Sentry.captureException(error);

      try
      {
        currentPosition = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })
      }
      catch (secondError)
      {
        Sentry.captureMessage('BrowseScreen: 2nd location attempt failed')
        Sentry.captureException(secondError)

        try
        {
          currentPosition = await Location.getCurrentPositionAsync()
        }
        catch (thirdError)
        {
          Sentry.captureMessage('BrowseScreen: 3rd location attempt failed')
          Sentry.captureException(thirdError)

          currentPosition = {
            coords: { latitude: 0, longitude: 0 }
          }

          Alert.alert('Error retrieving location', `We were unable to retrieve your location. Please ensure you have enabled location services in your device settings.`)
        }
      }
    }

    console.log(currentPosition);

    const currentLocation = {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude
    }

    let isWithinDeliveryArea

    try {
      isWithinDeliveryArea = await AnitaAPI.Customer.isWithinDeliveryArea(currentLocation)
    } catch (error) {
      this.setState({ isRefreshing: false, isFetchingLocation: false })

      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      return
    }

    let businesses = []

    try {
      businesses = await AnitaAPI.Customer.getShops()

      // Carraig Off Sales
      const openingHours = [
        ["11:30", "22:00"], // Sunday
        ["11:00", "23:00"], // Monday
        ["11:00", "23:00"], // Tuesday
        ["11:00", "23:00"], // Wednesday
        ["11:00", "23:00"], // Thursday
        ["11:00", "23:00"], // Friday
        ["11:00", "23:00"], // Saturday
      ]
      const now = new Date()
      const [openTime, closeTime] = openingHours[now.getDay()]
      const [openHour, openMinute] = openTime.split(":").map(num => parseInt(num))
      const [closeHour, closeMinute] = closeTime.split(":").map(num => parseInt(num))
      const isOpenPastMidnight = openHour > closeHour

      businesses.push({
        id: 999999,
        name: "Carraig Off Sales",
        streetAddress: "113-119 Strand Road",
        city: "Derry",
        postcode: "BT48 7PA",
        logo: "https://api.anita-delivery.com/static/images/carraig_logo.png",
        header: "https://api.anita-delivery.com/static/images/carraig_header.jpg",
        deliveryFee: -1,
        openingHours: `Available ${openTime} - ${closeTime}`,
        location: {
          latitude: 55.007026,
          longitude: -7.320243
        },
        isOnline: isOpenPastMidnight
          ? (now.getHours() >= openHour && now.getMinutes() >= openMinute) || (now.getHours() <= closeHour && now.getMinutes() <= closeMinute)
          : (now.getHours() >= openHour && now.getMinutes() >= openMinute) && (now.getHours() <= closeHour && now.getMinutes() <= closeMinute)
      })
    } catch (error) {
      this.setState({ isRefreshing: false, isFetchingLocation: false })

      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      return
    }

    businesses = businesses.map(business => {
      const distanceMeters = Geolib.getDistance(currentLocation, business.location)
      const distanceMiles = Math.floor(distanceMeters / 1609.334)
      const distanceFee = distanceMiles * 50

      return {
        ...business,
        logoURL: business.logo != null
          ? business.logo
          : 'https://placehold.it/128/128',
        headerURL: business.header != null
          ? business.header
          : 'https://placehold.it/512/512',
        distance: distanceMeters,
        deliveryFee: business.deliveryFee < 0
          ? business.deliveryFee
          : business.deliveryFee + distanceFee,
        isComingSoon: this.context && this.context.account && (this.context.account.id == 2 || this.context.account.id == 9 || this.context.account.id == 11)
          ? false
          : business.isComingSoon
      }
    }).sort((a, b) =>
      a.openingHours.toLowerCase().includes("closed")
        ? 1
        : a.isComingSoon
          ? 1
          : b.isComingSoon
            ? -1
            : a.distance - b.distance
    )

    this.setState({ businesses, isRefreshing: false, isFetchingLocation: false, isWithinDeliveryArea })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  render() {
    const { businesses, isRefreshing, isWithinDeliveryArea } = this.state

    return (
      <View style={styles.container}>
        {this.state.isFetchingLocation
          ? (
            <View>
              <ActivityIndicator
                color='#008800'
                size='large'
              />
              <Text style={{ marginTop: 8, textAlign: 'center' }}>Retrieving your current location...</Text>
            </View>
          )
          : (
            <BusinessList
              businesses={businesses}
              onBusinessSelected={this.onBusinessSelected}
              isRefreshing={isRefreshing}
              onRefresh={this.refreshBusinesses}
              isWithinDeliveryArea={isWithinDeliveryArea}
            />
          )
        }
      </View>
    )
  }

  onBusinessSelected = async business => {
    // just skip all this logic for carraig off sales
    if (business.id === 999999) {
      this.props.navigation.navigate('ExternalMenu')
      return
    }

    if (business.isComingSoon) {
      Alert.alert(
        'Coming soon',
        `${business.name} will be available to order from soon.`
      )
      return
    }

    try {
      const { isOpen, opensToday, openingHours } = await AnitaAPI.Customer.isShopOnline(business.id)

      if (!isOpen) {
        let message = openingHours != null
        ? `This shop is currently closed. It will be open from ${openingHours[0]} until ${openingHours[1]} ${opensToday ? 'today' : 'tomorrow'}.`
        : `This shop is currently closed. It will be open again on Tuesday from 8:30 until 17:00.`

        message += `\n\nWhy not try one of our other shops in the meantime!`

        Alert.alert('Shop is closed', message)
        return
      }
    } catch (error) {
      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        Sentry.captureException(error)
        Alert.alert('Something went wrong', `An error has occurred. Sorry about this, please try again later.`)
      }

      return
    }

    this.props.navigation.navigate(
      'SelectCategory',
      {
        name: business.name,
        premisesID: business.id,
        deliveryFee: business.deliveryFee,
        isWithinDeliveryArea: this.state.isWithinDeliveryArea
      }
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  search: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  searchText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#808080'
  },
})
