import React, { Component } from 'react'
import { Container, Text, Button, View } from 'native-base'
import { StyleSheet } from 'react-native'

import LoadingPage from '../components/LoadingPage'
import { getCurrentUserAsync } from '../api'
import { logout } from '../api/auth'
import { LOGIN_SCREEN, UNAUTHORISED_USER_SCREEN } from '../navigation/keys'
import { getInitialRouteName } from '../navigation/utils'

export class UnauthorisedUserScreen extends Component {
  state = {
    isLoading: false
  }

  _logout = async () => {
    await logout()
    this.props.navigation.navigate(LOGIN_SCREEN)
  }

  _reload = async () => {
    // Show loading screen when initializing
    this.setState({ isLoading: true })
    try {
      const user = await getCurrentUserAsync()

      // User is unauthorized
      if (!user) this._logout()

      // Take the user to the unauthorized screen and display instructions
      const initialRouteName = getInitialRouteName(user)
      if (initialRouteName !== UNAUTHORISED_USER_SCREEN) {
        this.props.navigation.navigate(initialRouteName)
      } else {
        this.setState({ isLoading: false })
      }
    } catch (error) {
      error.message = '[Unauthorized User]: ' + error.message
      console.warn(error)
    }
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingPage />
    }

    return (
      <Container style={styles.container}>
        <Text style={{ alignSelf: 'center', width: '80%' }}>
          You currently do not have access rights to use this application,
          please contact an admin or your team manager. Press below to try
          again, or to sign out.
        </Text>
        <View style={styles.buttons}>
          <Button success onPress={this._reload}>
            <Text>Reload</Text>
          </Button>
          <Button danger onPress={this._logout}>
            <Text>Sign out</Text>
          </Button>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-evenly'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20
  }
})
