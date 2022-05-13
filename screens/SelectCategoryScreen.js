import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import { ServerConnectionError } from '../lib/Errors'
import { Alert } from 'react-native'

import CategoriesList from '../lists/CategoryList'

export default class SelectCategoryScreen extends React.Component {
  static navigationOptions = {
    title: 'Select a category',
  }

  constructor(props) {
    super(props)

    this.state = {
      menu: null,
      premisesID: null,
      deliveryFee: null,
      isWithinDeliveryArea: null,
    }
  }

  async componentDidMount() {
    const premisesID = this.props.navigation.getParam('premisesID', null)
    const deliveryFee = this.props.navigation.getParam('deliveryFee', null)
    const isWithinDeliveryArea = this.props.navigation.getParam(
      'isWithinDeliveryArea',
      false
    )

    let menu

    try {
      menu = await AnitaAPI.Customer.getShopMenu(premisesID)
    } catch (error) {
      if (error instanceof ServerConnectionError) {
        Alert.alert('Connection error', error.message)
      } else {
        console.log(error)
        Alert.alert(
          'Something went wrong',
          `An error has occurred. Sorry about this, please try again later.`
        )
      }

      return
    }

    this.setState({
      menu,
      premisesID,
      deliveryFee,
      isWithinDeliveryArea,
    })
  }

  onSelected = (category) => {
    this.props.navigation.navigate('Menu', {
      menu: this.state.menu,
      premisesID: this.state.premisesID,
      deliveryFee: this.state.deliveryFee,
      isWithinDeliveryArea: this.state.isWithinDeliveryArea,
      initialCategory: category,
    })
  }

  render() {
    return (
      <CategoriesList
        categories={this.state.menu}
        onSelected={this.onSelected}
      />
    )
  }
}
