import React from 'react'
import Styled from 'styled-components/native'
import { ActivityIndicator, Alert } from 'react-native' 

import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'

export default class IntroScreen extends React.Component {
  state = {
    isFetchingLocation: false
  }

  render() {
    const { isFetchingLocation } = this.state

    return (
      <Content>
        {!isFetchingLocation &&
          <>
            <Title>Welcome to Anita!</Title>
            <Text>We need to know where you're located so that you can order from local shops in your area.</Text>
            <Button onPress={this.onContinuePressed}>
              <ButtonLabel>CONTINUE</ButtonLabel>
            </Button>
          </>
        }
        {isFetchingLocation &&
          <>
            <Text>Thanks! Just a moment...</Text>
            <ActivityIndicator
              color='#008800'
              size='large'
            />
          </>
        }
      </Content>
    )
  }

  onContinuePressed = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)

    if (status !== 'granted') {
      Alert.alert('Location permissions', 'Please enable location services for Anita Delivery in your settings.')
      return
    }
    
    this.props.navigation.navigate('App')
  }
}

const Content = Styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

const Text = Styled.Text` 
  font-size: 16px;
  text-align: center;

  margin: 16px 0px;
`

const Title = Styled(Text)`
  font-size: 24px;
  font-weight: bold;
`

const Button = Styled.TouchableOpacity`
  width: 100%;
  padding: 16px;
  margin: 16px 0px;
  background-color: #008800;
`

const ButtonLabel = Styled.Text`
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #fff;
`