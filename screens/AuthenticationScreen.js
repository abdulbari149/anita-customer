import React from 'react'
import { Image, StyleSheet, View, Text } from 'react-native'

import { Spacer } from '../components/Form'
import Button from '../components/elements/Button'

const Logo = require('../assets/logo.png')

export default class AuthenticationScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  })

  render() {
    const { navigation } = this.props

    return (
      <View style={styles.container}>
        <Image
          style={{ width: '100%', alignSelf: 'center' }}
          source={Logo}
          resizeMode='contain'
        />
        <Spacer />
        {/* <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 32, marginBottom: 32 }}>
          Please create an account or log in to continue with your order.
        </Text> */}
        <Button
          label='Create an account'
          primary={true}
          onPress={() => navigation.navigate('SignUp')}
        />
        <Button
          label='Log in'
          primary={true}
          onPress={() => navigation.navigate('LogIn')}
          style={{ marginTop: 16 }}
        />
        <Button
          label='Cancel'
          onPress={() => navigation.navigate('Core')}
          style={{ marginTop: 32 }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16
  }
})
