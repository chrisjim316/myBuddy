/******************************************************************************
 * Cloud Firestore functions
 * Invoked on Firestore changes
 * https://firebase.google.com/docs/firestore/extend-with-functions
 ******************************************************************************/
'use strict'

const notifications = require('./notifications'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('./config')

/**
 * Calculates the scheduleAts from the appointment date
 *
 * @param  {Moment} appointmentDate the appointment date
 * @param  {Number || [Number]} intervals the scheduling intervals
 * @param  {String} op        the moment operation to apply (add, subtract,...)
 * @return {[Moment]}             the scheduledAts
 */
function calcScheduleAts(appointmentDate, intervals, op) {
  // Ensure intervals is an array
  if (!_.isArray(intervals)) {
    intervals = [intervals]
  }

  return intervals.map(interval => {
    // Ensure immutability of appointmentDate
    return appointmentDate.clone()[op](interval, 'minutes')
  })
}

/**
 * Schedules the checkout notifications for the buddy and clinician
 *
 * @param  {Document} appointment appointment document
 * @param  {String} appointmentId the appointment id
 * @param  {Object} db            database ref
 * @return {Promise}              a promise that's rejected if any work fails
 */
function scheduleCheckOuts(appointment, appointmentId, db) {
  let promises = []
  // Momentify notification due date
  const endDate = moment(appointment.endDateTime.toDate())

  // Schedule clinician checkout notifications
  promises.push(
    appointment.user.get().then(userDoc => {
      const user = userDoc.data()
      // Ensure the user and push token exist
      if (!user || (user && !user.pushToken)) {
        return Promise.resolve()
      }
      // Calculate times to schedule the notifications
      const scheduledAts = calcScheduleAts(
        endDate,
        config.NOTIFICATIONS_INTERVALS.CHECK_OUT,
        'add'
      )
      console.log('Scheduling clinician checkout notifications', scheduledAts)
      return notifications.schedule(
        db,
        scheduledAts,
        config.NOTIFICATIONS_CHECK_OUT,
        user.pushToken,
        appointmentId
      )
    })
  )

  // Schedule buddy check out notification if specified
  if (appointment.buddy.user) {
    promises.push(
      appointment.buddy.user.get().then(buddyDoc => {
        const buddy = buddyDoc.data()
        // Ensure the user and push token exist
        if (!buddy || (buddy && !buddy.pushToken)) {
          return Promise.resolve()
        }
        // Calculate buddy check out notification time
        const scheduledAts = calcScheduleAts(
          endDate,
          config.NOTIFICATIONS_INTERVALS.CHECK_OUT_BUDDY,
          'add'
        )
        console.log('Scheduling buddy checkout notifications', scheduledAts)
        return notifications.schedule(
          db,
          scheduledAts,
          config.NOTIFICATIONS_BUDDY_CHECK_OUT,
          buddy.pushToken,
          appointmentId
        )
      })
    )
  }

  return Promise.all(promises)
}

/**
 * Listens to new appointments to send buddy request notifications
 */
exports.createAppointment = (appointmentDoc, context, db) => {
  // Get the newly created appointment
  const appointment = appointmentDoc.data()
  console.log('Created appointment', context.params.appointmentId)
  let promises = []
  // Send check in notification
  promises.push(
    appointment.user.get().then(userDoc => {
      const user = userDoc.data()
      console.log('Got user', user)
      // Ensure the user and push token exist
      if (!user || (user && !user.pushToken)) {
        console.log('user or push token does not exist')
        return Promise.resolve()
      }
      const notifDueDate = moment(appointment.startDateTime.toDate())
      // Calculate time to schedule the notification for
      const scheduledAt = calcScheduleAts(
        notifDueDate,
        config.NOTIFICATIONS_INTERVALS.CHECK_IN,
        'subtract'
      )
      console.log(
        'Scheduling notification',
        scheduledAt,
        config.NOTIFICATIONS_CHECK_IN
      )
      return notifications.schedule(
        db,
        scheduledAt,
        config.NOTIFICATIONS_CHECK_IN,
        user.pushToken,
        context.params.appointmentId
      )
    })
  )

  // Send buddy request notification if buddy specified
  if (appointment.buddy.user) {
    promises.push(
      appointment.buddy.user.get().then(buddyDoc => {
        const buddy = buddyDoc.data()
        // Ensure the buddy and push token exist
        if (!buddy || (buddy && !buddy.pushToken)) {
          return Promise.resolve()
        }
        let notification = Object.assign(
          {
            to: buddy.pushToken
          },
          config.NOTIFICATIONS_BUDDY_REQUEST
        )
        return notifications.send(notification)
      })
    )
  }
  // Terminate async background function once all promises have been processed
  return Promise.all(promises)
}

/**
 * Listens to appointments status updates to enqueue/dequeue notifications
 */
exports.updateAppointment = (appointmentDoc, context, db) => {
  // Get new appointment
  const newAppointment = appointmentDoc.after.data()
  // Get previous appointment before this update
  const previousAppointment = appointmentDoc.before.data()
  console.log('Changed appointment', context.params.appointmentId)

  // Detect appointment status changes
  if (newAppointment.status !== previousAppointment.status) {
    console.log(`Appointment status changed to ${newAppointment.status}`)
    switch (newAppointment.status) {
      case config.NOTIFICATIONS_STATES.IN_PROGRESS:
        // Checkin
        // Schedule checkout notifications for appointment
        return scheduleCheckOuts(
          newAppointment,
          context.params.appointmentId,
          db
        )
      case config.NOTIFICATIONS_STATES.DONE:
        // Checkout
        // Cancel remaining checkout notifications for appointment
        return notifications.cancel(db, context.params.appointmentId)
      default:
        console.log('Unknown appointment state')
        return Promise.resolve()
    }
  }

  // Detect appointment extensions
  if (!newAppointment.endDateTime.isEqual(previousAppointment.endDateTime)) {
    console.log(`Appointment extended to ${newAppointment.endDateTime}`)
    let promises = []
    // Cancel all currently scheduled notifications for appointment
    promises.push(notifications.cancel(db, context.params.appointmentId))
    // Re-schedule checkout notifications for appointment
    return _.concat(
      promises,
      scheduleCheckOuts(newAppointment, context.params.appointmentId, db)
    )
  }
}

/**
 * Listens to appointments deletion to cancel remaining notifications
 */
exports.deleteAppointment = (appointmentDoc, context, db) => {
  // Get the deleted appointment
  console.log('Deleted appointment', context.params.appointmentId)
  // Cancel any scheduled notifications
  return notifications.cancel(db, context.params.appointmentId)
}

/**
 * Listens to new emergencies to send emergency notification to everyone
 * in the users team
 */
exports.createEmergency = async (emergencyDoc, context, users) => {
  const userRef = emergencyDoc.data().user
  const userData = await userRef.get().then(userDoc => userDoc.data())
  console.log(userData.displayName, 'initiated an emergency')

  // Check if user has a team
  if (!userData.team) {
    console.warn(userData.displayName, 'is not a in team!')
    return
  }

  console.log('Created emergency', context.params.emergencyId)
  return (
    users
      // Get users in the same team
      .where('team', '==', userData.team)
      .get()
      .then(querySnapshot => {
        return (
          querySnapshot.docs
            // Don't send notification to user that initiated request
            .filter(userDoc => userDoc.id !== userData.uid)
            // Remove users with no pushToken
            .filter(userDoc => Boolean(userDoc.data().pushToken))
            // Construct messages array
            .map(userDoc => {
              const { pushToken, displayName } = userDoc.data()
              console.log('Sending emergency notifications to:', displayName)
              return Object.assign(
                { to: pushToken },
                config.NOTIFICATIONS_EMERGENCY(userData.displayName)
              )
            })
        )
      })
      // Send notifications
      .then(messages => notifications.send(messages))
  )
}
