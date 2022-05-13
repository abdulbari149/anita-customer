import React from 'react'
import Styled from 'styled-components/native'
import AnitaAPI from '../lib/AnitaAPI'
import AppContext from '../contexts/app'
import { ParameterError } from '../lib/Errors'

import { ActivityIndicator, Text } from 'react-native'
import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates'

const LogoImage = require('../assets/logo.png')

class Bootstrapper extends React.Component {
  async componentDidMount() {
    console.log("Mount Runs")
    if (Constants.platform.ios) {
      await Notifications.setBadgeCountAsync(0)
    }

    await AnitaAPI.Account.launch()

    try {
      const update = await Updates.checkForUpdateAsync()

      if (update.isAvailable) {
        console.log(`Updating from v${Constants.manifest.version} to v${update.manifest.version}...`)
        await Updates.fetchUpdateAsync()
        Updates.reloadAsync()
        return
      }
    } catch (error) {
      console.log(`Error checking for updates`, error)
    }

    let account

    try {
      account = await AnitaAPI.Account.retrieve()
    } catch (error) {
      if (error instanceof ParameterError) {
        await AnitaAPI.deleteToken()
        this.props.onAccountNotFound()
        return
      }

      alert(error.message)
      return
    }
    console.log({ account })
    if (account == null) {
      this.props.onAccountNotFound()
      return
    }

    this.props.onAccountFound(account)
  }

  render() {
    return null
  }
}

export default class SplashScreen extends React.Component {
  render() {
    return (
      <AppContext.Consumer>
        {({ set }) => (
          <Content>
            <Bootstrapper
              onAccountFound={async (account) => {
                set({ account })
                await this.onAccountFound(account)
              }}
              onAccountNotFound={this.onAccountNotFound}
            />
            <Logo
              source={LogoImage}
              resizeMode='contain'
            />
            <ActivityIndicator
              color='#008800'
              size='large'
            />
            <Text
              style={{ marginTop: 8 }}
            >
              {/* v{Constants.manifest.version} */}
            </Text>
          </Content>
        )}
      </AppContext.Consumer>
    )
  }

  onAccountFound = async (account) => {
    const { status } = await Permissions.getAsync(Permissions.LOCATION)

    status === 'granted'
      ? this.props.navigation.navigate('App')
      : this.props.navigation.navigate('Intro')
  }

  onAccountNotFound = async () => {
    const { status } = await Permissions.getAsync(Permissions.LOCATION)
    console.log({ status })
    status === 'granted'
      ? this.props.navigation.navigate('App')
      : this.props.navigation.navigate('Intro')
  }
}

const Content = Styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`

const Logo = Styled.Image`
  width: 100%;
`
