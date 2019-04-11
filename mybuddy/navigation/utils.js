/**
 * A utility class used to return the initial display after login for a user.
 */

import {
  LOGIN_SCREEN,
  ADMIN_PORTAL,
  UNAUTHORISED_USER_SCREEN,
  TEAM_MANAGER_PORTAL,
  CLINICIAN_PORTAL
} from './keys'
import { ADMIN, TEAM_MANAGER, USER } from '../constants/Keys'

 /**
  * Returns the initial portal/screen to display just after login.
  * Based on the user access level, different screens are available to different access levels.
  * An invalid user will be returned back to the login screen.
  * @param user - the user.
  */
export const getInitialRouteName = user => {
  if (!user) return LOGIN_SCREEN
  switch (user.accessLevel) {
    case ADMIN:
      return ADMIN_PORTAL
    case TEAM_MANAGER:
      return TEAM_MANAGER_PORTAL
    case USER:
      return CLINICIAN_PORTAL
    default:
      return UNAUTHORISED_USER_SCREEN
  }
}
