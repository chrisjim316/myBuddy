import { createMaterialTopTabNavigator } from 'react-navigation'

import UpcomingAppointmentsScreen from './UpcomingAppointmentsScreen'
import CalendarScreen from './CalendarScreen'
import BuddyRequestsScreen from './BuddyRequestsScreen'

import DEFAULT_COLORS from '../../constants/Colors'

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

export const BuddyAppointmentsScreen = createMaterialTopTabNavigator(
  {
    Requests: BuddyRequestsScreen,
    Upcoming: UpcomingAppointmentsScreen,
    Calendar: CalendarScreen
  },
  { tabBarOptions }
)
