import React from 'react'
import AnitaAPI from '../lib/AnitaAPI'
import AppContext from '../contexts/app'
import Styled from 'styled-components/native'
import { AsyncStorage } from 'react-native'

import { Platform, View, Alert } from 'react-native'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'

import * as Device from 'expo-device'
const needsExtraMargin = ['iphone x', 'iphone 11'].some(name => Device.modelName.toLowerCase().includes(name))

export default class ExternalMenuScreen extends React.Component {
  static contextType = AppContext
  static navigationOptions = {
    title: 'External menu'
  }

  async componentDidMount() {
    Alert.alert('Customer notice', `Anita Delivery is not responsible for orders purchased from Carraig Off Sales.\n\nIf you need assistance with an order please contact Carraig Off Sales directly.`)

    await AnitaAPI.Customer.viewMenu(999999)
  }

  render() {
    return (
      <Container>
        <Header>
          <Button onPress={this.onClosePressed} style={{ marginRight: 16 }}>
            <Ionicons name={'ios-arrow-back'} color={'#008800'} size={20} />
            <Label style={{ marginLeft: 8 }}>Anita Delivery</Label>
          </Button>
          <TitleContainer>
            <Title>Carraig Off Sales</Title>
            <Subtitle>113-119 Strand Road, BT48 7PA</Subtitle>
          </TitleContainer>
        </Header>
        <WebView
          bounces={false}
          overScrollMode='never'
          source={{ uri: "https://carraigbaronline.com/our_menu.php" }}
        />
      </Container>
    )
  }

  onClosePressed = () => {
    this.props.navigation.goBack()
  }
}

const Container = Styled.View`
  flex: 1;
  background-color: #fff;
  margin-top: ${
    Platform.OS === "ios" 
      ? needsExtraMargin 
        ? 46 
        : 32
      : 24
  };
`

const Header = Styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px;

  border-color: rgba(0, 0, 0, 0.25);
  border-top-width: 1px;
  border-bottom-width: 1px;
`

const Button = Styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px;
`

const Label = Styled.Text`
  color: #008800;
  font-weight: bold;
  font-size: 18px;
`

const Title = Styled.Text`
  font-weight: bold;
  font-size: 16px;
`
const Subtitle = Styled.Text`
  font-size: 10px;
`

const TitleContainer = Styled.View`
  align-items: flex-end;
`