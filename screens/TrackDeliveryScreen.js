import React from 'react'
import Styled from 'styled-components/native'

import AnitaAPI from '../lib/AnitaAPI'
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'

import { View, Text, Image } from 'react-native'

const DriverIcon = require('../assets/anita_driver_icon_small.png')

export default class TrackDeliveryScreen extends React.Component {
  static navigationOptions = {
    title: 'Track your delivery'
  }

  state = {
    order: null,
    location: null
  }

  constructor(props) {
    super(props)

    this.mapRef = React.createRef()
    this.deliveryMarkerRef = React.createRef()
  }

  async componentDidMount() {
    const order = this.props.navigation.getParam('order', null)
    const location = order.latestLocation

    this.setState({ order, location })

    this.orderLocationListener = AnitaAPI.Socket.on('orderLocationUpdated', async ({ location }) => {
      this.setState({ location }, this.focusMap)
    })

    this.orderDeliveredListener = AnitaAPI.Socket.on('orderDelivered', async ({ id }) => {
      alert('Your order has been delivered.')
      this.props.navigation.goBack()
    })
  }

  componentWillUnmount() {
    AnitaAPI.Socket.removeListener('orderLocationUpdated', this.orderLocationListener)
    AnitaAPI.Socket.removeListener('orderDelivered', this.orderDeliveredListener)
  }

  render() {
    if (this.state.order == null) {
      return <Container />
    }

    return (
      <Container>
        <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ddd' }}>
          <Text style={{ fontWeight: 'bold', color: '#008800' }}>DELIVERY FROM</Text>
          <Text>{this.state.order.premises.name}</Text>
          <Text style={{ fontWeight: 'bold', color: '#008800', marginTop: 8 }}>YOUR DRIVER</Text>
          <Text>{this.state.order.driver.firstName}</Text>
        </View>
        <MapView
          ref={this.mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: this.state.location.latitude,
            longitude: this.state.location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }}
          provider={PROVIDER_GOOGLE}
          onMapReady={this.onMapReady}
        >
          <MapView.Marker
            identifier='collection'
            coordinate={this.state.order.premises.location}
            title={this.state.order.premises.name}
            description={`${this.state.order.premises.streetAddress} - ${this.state.order.premises.postcode}`}
            pinColor='red'
          />
          <MapView.Marker
            ref={this.deliveryMarkerRef}
            identifier='delivery'
            coordinate={this.state.order.deliveryAddress.location}
            pinColor='green'
          >
            <MapView.Callout>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{this.state.order.deliveryAddress.streetAddress}</Text>
            </MapView.Callout>
          </MapView.Marker>
          {this.state.location != null &&
            <MapView.Marker
              identifier='driver'
              coordinate={this.state.location}
              title='Your driver'
              description='On the way!'
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Image style={{width: 40, height: 40}} source={DriverIcon} />
            </MapView.Marker>
          }
        </MapView>
      </Container>
    )
  }

  onMapReady = () => {
    setTimeout(
      () => {
        this.deliveryMarkerRef.current.showCallout()
        this.focusMap()
      },
      100
    )
  }

  focusMap = () => {
    this.mapRef.current.fitToSuppliedMarkers(
      ['driver', 'delivery'],
      { edgePadding: { top: 96, bottom: 96, left: 96, right: 96 } }
    )
  }
}

const Container = Styled.View`
  flex: 1;
`
