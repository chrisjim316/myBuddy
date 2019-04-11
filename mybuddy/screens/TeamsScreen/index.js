import { createStackNavigator } from 'react-navigation'

import TeamScreen from './TeamsScreen'
import TeamMembersScreen from './TeamMembersScreen'

import AddTeam from './Forms/AddTeam'
import AddUserToTeam from './Forms/AddUserToTeam'
import EditTeam from './Forms/EditTeam'

const Screens = createStackNavigator(
  {
    Base: TeamScreen,
    TeamMembers: TeamMembersScreen
  },
  { headerMode: 'none' }
)

export const TeamsScreen = createStackNavigator(
  {
    Base: Screens,
    AddTeamForm: AddTeam,
    AddUserToTeam: AddUserToTeam,
    EditTeam: EditTeam
  },
  {
    headerMode: 'none',
    mode: 'modal',
    navigationOptions: {
      gesturesEnabled: false
    }
  }
)
