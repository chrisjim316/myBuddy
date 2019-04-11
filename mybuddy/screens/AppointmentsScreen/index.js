import { createStackNavigator } from 'react-navigation'

import AppointmentsTabNavigator from './AppointmentsTabNavigator'
import AppointmentFormScreen from './AppointmentFormScreen'

export const AppointmentsScreen = createStackNavigator(
  {
    Base: AppointmentsTabNavigator,
    AppointmentForm: AppointmentFormScreen
  },
  {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false
    }
  }
)
