import { AuthSession } from 'expo'

import firebase, { db } from '../firebase'
import { navigate } from '../navigation/NavigationService'
import { LOGIN_SCREEN } from '../navigation/keys'
import { BASE_URL } from '../constants/Urls'

/**
 * Log user in using expo's AuthSession,
 * then store the user object in AsyncStorage.
 * If successful return the user object, else
 * return null.
 * @return Promise(user) | Promise(null)
 */
export const login = async () => {
  const results = await AuthSession.startAsync({
    authUrl: `${BASE_URL}/auth/login?redirectUrl=${AuthSession.getRedirectUrl()}`
  })
  if (results.type === 'success') {
    const { result, customToken } = results.params
    if (result == 0) {
      await firebase.auth().signInWithCustomToken(customToken)
      const userRef = db
        .collection('users')
        .doc(firebase.auth().currentUser.uid)
      const user = await userRef.get().then(doc => ({ ...doc.data(), userRef }))
      return user
    } else {
      navigate(LOGIN_SCREEN, {
        error: { message: 'Authentication failed please contact an admin.' }
      })
    }
  }
}

/**
 * Remove user from local storage, sign out
 * from firebase, and invalidate id_token.
 */
export const logout = async () => {
  await firebase.auth().signOut()
}
