import { db } from '../firebase'

/**
 * Fetch teams
 * @param onSnapshot function to run on update
 * @param clauses where conditions
 * @param transformation function to transform the shape of the data returned
 * @returns Promise(unsubscribe)
 */
export const allTeamsOnSnapshot = async (
  onSnapshot,
  clauses = [],
  transformation
) => {
  let teamsRef = db.collection('teams')
  clauses.forEach(clause => {
    teamsRef = teamsRef.where(...clause)
  })
  return (
    teamsRef
      // listen real time
      .onSnapshot(
        async querySnapshot => {
          let teams = querySnapshot.docs.map(doc => {
            return {
              ...doc.data(),
              teamRef: db.collection('teams').doc(doc.id),
              id: doc.id
            }
          })

          if (transformation) {
            teams = transformation(teams)
          }

          onSnapshot(teams)
        },
        error => console.warn(error)
      )
  )
}

/**
 *  Fetch all users in the managers team excluding
 * @param manager object
 * @param onSnapshot function to run on update
 */
export const managersTeamMembersOnSnapshot = manager => async onSnapshot => {
  return db
    .collection('users')
    .where('team', '==', manager.team)
    .onSnapshot(
      querySnapshot => {
        const teamMembers = querySnapshot.docs
          .filter(doc => doc.id !== manager.uid)
          .map(doc => ({
            ...doc.data(),
            userRef: doc.ref
          }))

        onSnapshot(teamMembers)
      },
      error => console.warn(error)
    )
}
