import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Icon } from 'native-base'
import { createMaterialTopTabNavigator } from 'react-navigation'
import ActionButton from 'react-native-action-button'

import CalendarScreen from './CalendarScreen'
import UpcomingAppointmentsScreen from './UpcomingAppointmentsScreen'
import DEFAULT_COLORS from '../../../constants/Colors'

const tabBarOptions = {
  scrollEnabled: false,
  indicatorStyle: {
    backgroundColor: DEFAULT_COLORS.primaryColor
  },
  labelStyle: { fontWeight: 'bold' },
  style: {
    backgroundColor: DEFAULT_COLORS.secondaryColor
  }
}

const Screens = createMaterialTopTabNavigator(
  {
    Upcoming: UpcomingAppointmentsScreen,
    Calendar: CalendarScreen
  },
  { tabBarOptions }
)

export default class extends Component {
  static router = Screens.router

  _newAppointment = () => {
    this.props.navigation.navigate('AppointmentForm')
  }

  render() {
    return (
      <>
        <Screens {...this.props} />
        <ActionButton
          onPress={this._newAppointment}
          buttonColor={DEFAULT_COLORS.secondaryColor}
          renderIcon={() => (
            <Icon
              type="MaterialCommunityIcons"
              name="calendar-plus"
              style={styles.actionButtonIcon}
            />
          )}
        />
      </>
    )
  }
}

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  }
})
