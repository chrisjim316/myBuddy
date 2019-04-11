import { db } from '../firebase'
import { getCurrentUserAsync } from './users'

/**
 * Fetch all emergencies in the current users team,
 * excluding any issued by the current user themselves.
 a* @param onSnapshot function to run on update
 * @returns Promise(unsubscribe)
 */
export const allEmergenciesOnSnapshot = async onSnapshot => {
  const user = await getCurrentUserAsync()
  return db
    .collection('emergencies')
    .where('team', '==', user.team)
    .where('status', '==', 'alert')
    .onSnapshot(async querySnapshot => {
      const emergencies = querySnapshot.docs
        .filter(doc => doc.data().user.id !== user.uid)
        .map(doc => {
          return {
            ...doc.data(),
            emergencyRef: doc.ref
          }
        })
      onSnapshot(emergencies)
    })
}
