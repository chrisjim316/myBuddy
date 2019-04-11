/**
 * Manages organising the tabs in the navigation.
 * Tabs displayed on navigation depends on user access level.
 */

import React from 'react'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { AsyncStorage } from 'react-native'
import { createDrawerNavigatorWithHeader } from '../components/Navigation'

import { setTopLevelNavigator } from './NavigationService'
import { getInitialRouteName } from './utils'

import DrawerMenu from '../components/DrawerMenu'
import {
  HomeScreen,
  LoginScreen,
  AppointmentsScreen,
  SettingsScreen,
  TeamsScreen,
  UnauthorisedUserScreen,
  BuddyAppointmentsScreen,
  EmergenciesScreen,
  UserScreen
} from '../screens'

import {
  APPOINTMENTS_SCREEN,
  SETTINGS_SCREEN,
  LOGIN_SCREEN,
  HOME_SCREEN,
  UNAUTHORISED_USER_SCREEN,
  CLINICIAN_PORTAL,
  TEAM_MANAGER_PORTAL,
  ADMIN_PORTAL,
  TEAM_SCREEN,
  TEAMS_SCREEN,
  BUDDY_APPOINTMENTS_SCREEN,
  EMERGENCIES_SCREEN,
  USERS_SCREEN
} from './keys'

const ClinicianDrawerNavigator = createDrawerNavigatorWithHeader(
  {
    [HOME_SCREEN]: HomeScreen,
    [APPOINTMENTS_SCREEN]: AppointmentsScreen,
    [BUDDY_APPOINTMENTS_SCREEN]: BuddyAppointmentsScreen,
    [EMERGENCIES_SCREEN]: EmergenciesScreen,
    [SETTINGS_SCREEN]: SettingsScreen
  },
  {
    contentComponent: DrawerMenu
  }
)

const TeamManagerDrawerNavigator = createDrawerNavigatorWithHeader(
  {
    [HOME_SCREEN]: HomeScreen,
    [APPOINTMENTS_SCREEN]: AppointmentsScreen,
    [BUDDY_APPOINTMENTS_SCREEN]: BuddyAppointmentsScreen,
    [EMERGENCIES_SCREEN]: EmergenciesScreen,
    // [TEAM_SCREEN]: TeamScreen,
    [USERS_SCREEN]: UserScreen,
    [SETTINGS_SCREEN]: SettingsScreen
  },
  {
    contentComponent: DrawerMenu
  }
)

const AdminDrawerNavigator = createDrawerNavigatorWithHeader(
  {
    [HOME_SCREEN]: HomeScreen,
    [APPOINTMENTS_SCREEN]: AppointmentsScreen,
    [BUDDY_APPOINTMENTS_SCREEN]: BuddyAppointmentsScreen,
    [EMERGENCIES_SCREEN]: EmergenciesScreen,
    [TEAMS_SCREEN]: TeamsScreen,
    [USERS_SCREEN]: UserScreen,
    [SETTINGS_SCREEN]: SettingsScreen
  },
  {
    contentComponent: DrawerMenu
  }
)

const AuthSwitchNavigator = initialRouteName => {
  return createSwitchNavigator(
    {
      [LOGIN_SCREEN]: LoginScreen,
      [ADMIN_PORTAL]: AdminDrawerNavigator,
      [TEAM_MANAGER_PORTAL]: TeamManagerDrawerNavigator,
      [CLINICIAN_PORTAL]: ClinicianDrawerNavigator,
      [UNAUTHORISED_USER_SCREEN]: UnauthorisedUserScreen
    },
    { initialRouteName, resetOnBlur: true }
  )
}

export const createNavigator = user => props => {
  persistenceKey = __DEV__ ? 'NavigationStateDEV' : null
  AsyncStorage.removeItem('NavigationStateDEV')
  const initialRouteName = getInitialRouteName(user)
  const App = createAppContainer(AuthSwitchNavigator(initialRouteName))

  return (
    <App
      ref={navigatorRef => {
        setTopLevelNavigator(navigatorRef)
      }}
      // persistenceKey={persistenceKey}
    />
  )
}
