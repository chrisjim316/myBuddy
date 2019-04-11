import React, { Component } from 'react'
import { Location, Permissions } from 'expo'
import { Icon, Text, Button, View } from 'native-base'
import { Platform, Linking, StyleSheet, SafeAreaView, Alert } from 'react-native'
import { withNavigation } from 'react-navigation'
import Modal from 'react-native-modal'
import RNSwipeVerify from 'react-native-swipe-verify'

import { db } from '../firebase'
import { getCurrentUserAsync } from '../api/users'
import DEFAULT_COLORS from '../constants/Colors'

class SwipeToConfirm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isModalVisible: false,
      location: null
    }
    this._getLocationAsync = this._getLocationAsync.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this._createEmergency = this._createEmergency.bind(this)
    this._renderModal = this._renderModal.bind(this)
  }

  componentWillMount() {
    // Will not work on Sketch in an Android emulator
    // Get user's location whenever the user initiates an emergency
    this._getLocationAsync()
  }

  componentDidUpdate(_, prevState) {
    if (this.state.isModalVisible !== prevState.isModalVisible) {
      this.props.navigation.closeDrawer()
    }
  }

  // Gets all the (gps) location data
  async _getLocationAsync() {
    // Ask permission and deep link to settings
    let {status} = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      // Deep link to Settings for iOS
      Platform.OS === 'ios'
        ? (
          Alert.alert(
            'Enable Location Permissions',
            'Please enable Location in settings to get the most out of this app.',
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
                onPress: () => console.log('OK Pressed, error message dismissed'),
              }
            ],
            { cancelable: false }
          )
        )
        : (
          Alert.alert(
            'Enable Notifications',
            'Please enable push notification in settings to get the most out of this app.',
            [
              {
                text: 'OK',
                onPress: () => console.log('OK Pressed, error message dismissed'),
              }
            ],
            { cancelable: false }
          )
        )
      return
    }

    // Get location lat/lon
    let rawLocation = await Location.getCurrentPositionAsync({})
    let {latitude, longitude} = rawLocation['coords']
    // Get city, street, region, country, postal code,...
    let resolvedLocation = await Location.reverseGeocodeAsync({latitude, longitude})
    // Get the first match
    let {city, country, street, postalCode, isoCountryCode} = resolvedLocation[0]
    // Format it into the required format
    let location = {
      latitude,
      longitude,
      city,
      country,
      street,
      postalCode,
      countryCode: isoCountryCode
    }
    console.log(`Got Location: ${JSON.stringify(location)}`)
    await this.setState({location})
  }

  _toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  _createEmergency = async () => {
    try {
      const user = await getCurrentUserAsync()
      const emergency = await db.collection('emergencies').add({
        status: 'alert',
        user: user.userRef,
        team: user.team,
        appointment: user.currentAppointment || null,
        location: this.state.location
      })
      user.userRef.update({ currentEmergency: emergency })
    } catch (error) {
      alert ('Emergency Alert Failure!')
      error.message = '[Emergency Alert Failure]: ' + error.message
      console.warn(error)
    }
    this.setState({ isModalVisible: false })
  }

  render() {
    return (
      <>
        <Button style={styles.emergencyButton} onPress={this._toggleModal}>
          <Text>Emergency</Text>
        </Button>
        {this._renderModal()}
      </>
    )
  }

  _renderModal = () => (
    <Modal isVisible={this.state.isModalVisible}>
      <SafeAreaView style={styles.modal}>
        <Text style={{ color: 'white', fontSize: 30, textAlign: 'center' }}>
          Are you sure, you want to create an emergency?
        </Text>
        <View>
          <RNSwipeVerify
            width={100}
            buttonSize={50}
            borderRadius={50}
            okButton={{ visible: true, duration: 400 }}
            buttonColor={DEFAULT_COLORS.primaryColor}
            backgroundColor={DEFAULT_COLORS.secondaryColor}
            onVerified={this._createEmergency}
            icon={<Icon name="arrow-forward" style={{ color: 'white' }} />}
          >
            <Text style={{ color: 'white' }}>swipe to confirm</Text>
          </RNSwipeVerify>
        </View>
        <Button
          transparent
          onPress={this._toggleModal}
          style={styles.cancelButton}
        >
          <Text>Cancel</Text>
        </Button>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  emergencyButton: {
    alignSelf: 'center',
    backgroundColor: DEFAULT_COLORS.dangerColor,
    marginBottom: 10
  },
  cancelButton: {
    alignSelf: 'center'
  },
  modal: {
    flex: 1,
    justifyContent: 'space-around'
  }
})

export default withNavigation(SwipeToConfirm)
