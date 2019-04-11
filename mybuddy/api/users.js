import firebase, { db } from '../firebase'

/**
 * Returns user object corresponding to the
 * userUid passed in, else null
 * @param userUid
 * @returns user | null
 */
export const _getUserAsync = async userUid => {
  const userRef = db.collection('users').doc(userUid)
  return userRef.get().then(doc => {
    return { ...doc.data(), userRef: doc.ref }
  })
}

/**
 * Returns user object corresponding to current
 * logged in user.
 * @returns user
 */
export const getCurrentUserAsync = async () => {
  const [unsubscribe, user] = await new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async authUser => {
      let user = null
      if (authUser) user = await _getUserAsync(authUser.uid)
      resolve([unsubscribe, user])
    })
  })
  unsubscribe()
  return user
}

/**
 * Fetch user details and watch for changes
 * @param onSnapshot function to run update
 * @returns Promise(unsubscribe)
 */
export const currentUserOnSnapshot = async onSnapshot => {
  const user = await getCurrentUserAsync()
  return user.userRef.onSnapshot(userDoc => {
    onSnapshot(userDoc.data())
  })
}

/**
 * Fetch all users without a team
 * @param onSnapshot function to run update
 * @returns Promise(unsubscribe)
 */
export const usersWithoutTeamOnSnapshot = async onSnapshot => {
  return db
    .collection('users')
    .where('team', '==', null)
    .onSnapshot(querySnapshot => {
      const teamlessUsers = querySnapshot.docs.map(userDoc => {
        return userDoc.data()
      })
      onSnapshot(teamlessUsers)
    })
}
