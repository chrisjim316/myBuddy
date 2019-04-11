import { db } from '../firebase'
import { getCurrentUserAsync } from './users'
import moment from 'moment'

const thisWeekClause = [
  [
    'startDateTime',
    '>=',
    moment()
      .startOf('day')
      .toDate()
  ],
  [
    'startDateTime',
    '<=',
    moment()
      .startOf('isoWeek')
      .add(1, 'week')
      .toDate()
  ]
]

/**
 * Turn array of appointments into an object of arrays,
 * with keys Today, Tomorrow and This Week.
 * @param  appointments
 */
const _reshapeWeek = appointments => {
  const apps = appointments.reduce(
    (obj, appointment) => {
      let label
      if (moment(appointment.startDateTime).isSame(moment(), 'day')) {
        label = 'Today'
      } else if (
        moment(appointment.startDateTime).isSame(moment().add(1, 'day'), 'day')
      ) {
        label = 'Tomorrow'
      } else {
        label = 'This Week'
      }
      return {
        ...obj,
        [label]: [...obj[label], appointment]
      }
    },
    { Today: [], Tomorrow: [], ['This Week']: [] }
  )

  return apps
}

/**
 * Fetch users appointments this week
 * @param onSnapshot function to run on update
 * @param reshape boolean if true object grouped today tomorrow this week
 * else return array of appoinments
 * @returns Promise(unsubscribe)
 */
export const appointmentsThisWeekOnSnapshot = async (
  onSnapshot,
  reshape = false
) => {
  const user = await getCurrentUserAsync()
  const clauses = [...thisWeekClause, ['user', '==', user.userRef]]
  return await _allAppointmentsOnSnapshot(
    onSnapshot,
    clauses,
    reshape ? _reshapeWeek : null,
    true
  )
}

/**
 * Fetch all user appointments between dates
 * @param startDate Date to start search from (inclusive)
 * @param {*} endDate Date to end search on (inclusive)
 a* @param onSnapshot function to run on update
 * @returns Promise(unsubscribe)
 */
export const appointmentsBetweenDatesOnSnapshot = (
  startDate,
  endDate
) => async onSnapshot => {
  const user = await getCurrentUserAsync()
  const clauses = [
    ['user', '==', user.userRef],
    ['startDateTime', '>=', startDate],
    ['startDateTime', '<=', endDate]
  ]
  return await _allAppointmentsOnSnapshot(onSnapshot, clauses)
}

/**
 * Fetch buddy appointments this week
 * @param onSnapshot function to run on update
 * @returns Promise(unsubscribe)
 */
export const buddyAppointmentsThisWeekOnSnapshot = async (
  onSnapshot,
  reshape = false
) => {
  const user = await getCurrentUserAsync()
  const clauses = [
    ...thisWeekClause,
    ['buddy.user', '==', user.userRef],
    ['buddy.status', '==', 'confirmed']
  ]
  return await _allAppointmentsOnSnapshot(
    onSnapshot,
    clauses,
    reshape ? _reshapeWeek : null
  )
}

/**
 * Fetch all buddy appointments between dates
 * @param startDate Date to start search from (inclusive)
 * @param {*} endDate Date to end search on (inclusive)
 a* @param onSnapshot function to run on update
 * @returns Promise(unsubscribe)
 */
export const buddyAppointmentsBetweenDatesOnSnapshot = (
  startDate,
  endDate
) => async onSnapshot => {
  const user = await getCurrentUserAsync()
  const clauses = [
    ['buddy.user', '==', user.userRef],
    ['startDateTime', '>=', startDate],
    ['startDateTime', '<=', endDate]
  ]
  return await _allAppointmentsOnSnapshot(onSnapshot, clauses)
}

/**
 * Fetch buddy appointments this week
 * @param onSnapshot function to run on update
 * @returns Promise(unsubscribe)
 */
export const buddyRequestsOnSnapshot = async onSnapshot => {
  const user = await getCurrentUserAsync()
  const clauses = [
    ['buddy.user', '==', user.userRef],
    ['buddy.status', '==', 'pending']
  ]
  return await _allAppointmentsOnSnapshot(onSnapshot, clauses)
}

/**
 * Fetch appointments
 * @param onSnapshot function to run update
 * @param clauses where conditions
 * @param transformation function to transform the shape of the data returned
 * @returns Promise(unsubscribe)
 */
const _allAppointmentsOnSnapshot = async (
  onSnapshot,
  clauses = [],
  transformation = null,
  notDone = false
) => {
  let appointmentsRef = db.collection('appointments')
  clauses.forEach(clause => {
    appointmentsRef = appointmentsRef.where(...clause)
  })
  return (
    appointmentsRef
      .orderBy('startDateTime')
      // listen real time
      .onSnapshot(
        querySnapshot => {
          let appointments = []

          appointments = querySnapshot.docs
            // only keep appointments where status is not done
            .filter(doc => (notDone ? doc.data().status !== 'done' : true))
            .map(doc => {
              const { startDateTime, endDateTime, ...data } = doc.data()

              return {
                ...data,
                startDateTime: new Date(startDateTime.seconds * 1000),
                endDateTime: new Date(endDateTime.seconds * 1000),
                appointmentRef: doc.ref,
                id: doc.id
              }
            })

          if (transformation) {
            appointments = transformation(appointments)
          }

          onSnapshot(appointments)
        },
        error => console.warn(error)
      )
  )
}
