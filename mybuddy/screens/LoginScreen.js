import React, { Component } from 'react'
import { Platform, Linking, StyleSheet, Image, Alert } from 'react-native'
import { Container, Button, Text } from 'native-base'
import { Notifications, Permissions, Constants } from 'expo'

import Layout from '../constants/Layout'
import { login as authLogin } from '../api/auth'
import { getInitialRouteName } from '../navigation/utils'

export class LoginScreen extends Component {
  _login = async () => {
    // Try to login user
    const user = await authLogin()
    if (!user) return

    // Updates the pushToken so that notifications can come through
    const pushToken = (await this._registerForPushNotificationsAsync()) || null
    await user.userRef.update({ pushToken })

    // Take the user to the right screen
    const initialRouteName = getInitialRouteName(user)
    this.props.navigation.navigate(initialRouteName)
  }

  _registerForPushNotificationsAsync = async () => {
    if (!Constants.isDevice) return

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )

    // Check if push notification permission is granted
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }

    // If push notification permission is not granted yet
    if (finalStatus !== 'granted') {
      // Deep link to Settings for iOS
      Platform.OS === 'ios'
        ? Alert.alert(
            'Enable Notifications',
            'Please enable push notification in settings to get the most out of this app.',
            [
              {
                text: 'SETTINGS',
                onPress: () => {
                  !__DEV__
                    ? Linking.openURL('app-settings://notification/expo')
                    : Linking.openURL('app-settings:')
                },
                style: 'cancel'
              },
              {
                text: 'OK',
                onPress: () =>
                  console.log('OK Pressed, error message dismissed')
              }
            ],
            { cancelable: false }
          )
        : Alert.alert(
            'Enable Notifications',
            'Please enable push notification in settings to get the most out of this app.',
            [
              {
                text: 'OK',
                onPress: () =>
                  console.log('OK Pressed, error message dismissed')
              }
            ],
            { cancelable: false }
          )
      return
    }

    return Notifications.getExpoPushTokenAsync()
  }

  render() {
    const error = this.props.navigation.getParam('error', null)
    return (
      <Container style={styles.container}>
        <Image
          style={{}}
          width={Layout.window.width - 50}
          source={require('../assets/images/logo.png')}
          resizeMode="contain"
        />
        {error && <Text style={styles.warning}>{error.message}</Text>}
        <Button onPress={this._login} style={styles.button} transparent>
          <Text style={{ color: 'blue' }}>SIGN IN</Text>
        </Button>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  warning: {
    color: 'red'
  },
  button: {
    alignSelf: 'center'
  }
})
