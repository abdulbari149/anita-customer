import React from 'react'
import Styled from 'styled-components/native'
import AppContext from '../contexts/app'
import AnitaAPI from '../lib/AnitaAPI'

import Constants from 'expo-constants'
import { MaterialIcons } from '@expo/vector-icons'
import Button from '../components/elements/Button'
import { Alert, Text } from 'react-native'

export default class AccountScreen extends React.Component {
  static navigationOptions = {
    title: 'Your account'
  }

  static contextType = AppContext

  render() {
    const { account } = this.context
    const { version, releaseChannel } = Constants.manifest

    return account != null
      ? (
        <Container> 
          <AccountContainer>
            <MaterialIcons name='account-circle' size={64} />
            <NameLabel>{account.firstName} {account.lastName}</NameLabel>
            <InfoLabel>{account.email}</InfoLabel>
          </AccountContainer>
          <OptionRow onPress={() => this.props.navigation.navigate('ManageDeliveryAddresses')}>
            <OptionLabel>Manage delivery addresses</OptionLabel>
            <MaterialIcons name='chevron-right' size={24} />
          </OptionRow>
          <OptionRow onPress={() => this.props.navigation.navigate('ManageAccount')}>
            <OptionLabel>Manage your account</OptionLabel>
            <MaterialIcons name='chevron-right' size={24} />
          </OptionRow>
          <OptionRow onPress={this.onChangePasswordPressed}>
            <OptionLabel>Change your password</OptionLabel>
            <MaterialIcons name='chevron-right' size={24} />
          </OptionRow>
          <OptionRow onPress={this.confirmLogOut}>
            <OptionLabel>Log out</OptionLabel>
            <MaterialIcons name='chevron-right' size={24} />
          </OptionRow>
          <VersionLabel>v{version}{!releaseChannel && '-dev'}</VersionLabel>
        </Container>
      )
      : (
        <InfoContainer>
          <Info>Please log in or create an account.</Info>
          <Button
            label='Continue'
            primary={true}
            onPress={this.onContinuePressed}
          />
        </InfoContainer>
      )
  }

  confirmLogOut = async () => {
    Alert.alert(
      `Log out`,
      `Are you sure you want to log out?`,
      [
        { text: 'Yes', onPress: this.logOut },
        { text: 'No', style: 'cancel' }
      ]
    )
  }

  logOut = async () => {
    if (AnitaAPI.Socket.isConnected()) {
      AnitaAPI.Socket.disconnect()
    }

    try {
      await AnitaAPI.Account.logOut()
    } catch (error) {
      alert(error.message)
      await AnitaAPI.deleteToken()
    } finally {
      this.context.set({ account: null })
    }
  }

  onContinuePressed = () => {
    this.props.navigation.navigate('Auth')
  }

  onChangePasswordPressed = () => {
    this.props.navigation.navigate('ChangePassword')
  }
}

const Container = Styled.ScrollView`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.05);
`

const AccountContainer = Styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 16px;
  margin-top: 4px;
  margin-bottom: 2px;

  background-color: #fff;
  border-color: rgba(0, 0, 0, 0.1);
  border-top-width: 1px;
  border-bottom-width: 1px;
`

const NameLabel = Styled.Text`
  text-align: center;
  font-size: 18px;
`

const InfoLabel = Styled.Text`
  text-align: center;
  font-size: 14px;
  opacity: 0.5;
`

const VersionLabel = Styled.Text`
  text-align: center;
  font-size: 12px;
  padding: 16px;
  opacity: 0.25;
`

const OptionRow = Styled.TouchableOpacity`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 12px;
  margin: 2px 0px;

  background-color: #fff;
  border-color: rgba(0, 0, 0, 0.1);
  border-top-width: 1px;
  border-bottom-width: 1px;
`

const OptionLabel = Styled.Text`
  font-size: 16px;
  flex: 1;
`

const InfoContainer = Styled.View`
  flex: 1;
  justify-content: center;
  background-color: #eee;

  padding: 16px;
`

const Info = Styled.Text`
  font-size: 18px;
  text-align: center;

  margin-bottom: 32px;
`