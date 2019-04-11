/******************************************************************************
 * Expo notifications
 ******************************************************************************/
'use strict'

const Expo = require('expo-server-sdk')
  .Expo,
  _ = require('lodash'),
  moment = require('moment'),
  config = require('./config'),
  INIT_QUEUE = { queue: [] },
  STATE_COLLECTION = 'state',
  NOTIFICATION_QUEUE_DOC = 'notification-queue'

// Create a new Expo SDK client
let expo = new Expo()

// For sorting notifications by the soonest
function notifComparator(a, b) {
  return a.scheduledAtEpoch - b.scheduledAtEpoch
}

/**
 * Sends a push notifications
 *
 * @param  {Message || [Message]} messages   Expo push messages as per https://docs.expo.io/versions/latest/guides/push-notifications/#message-format
 * @return {void}
 */
exports.send = async function (messages) {
  // Ensure messages is an array
  if (!_.isArray(messages)) {
    messages = [messages]
  }
  console.log('Sending notifications', messages)

  // Filter by valid push tokens
  messages = messages.filter(message => Expo.isExpoPushToken(message.to))

  if (_.isEmpty(messages)) {
    // Throw an error if there are no valid push tokens
    return Promise.reject(new Error('No valid push tokens'))
  }

  // The Expo push notification service accepts batches of notifications. So
  // batch notifications to reduce the number of requests and to compress them
  // (notifications with similar content will get compressed)
  let chunks = expo.chunkPushNotifications(messages)

  // Send the chunks to the Expo push notification service one chunk at a
  // time to spread the load out over time
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      console.log('Notification sent', ticketChunk)
      if (ticketChunk.status === 'error') {
        console.error('An error occured while sending notification', chunk, ticketChunk)
      }
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
}

/**
 * Schedules a push notification to be sent to a user
 *
 * @param  {Object} db   A Firestore instance
 * @param  {Moment || [Moment]} scheduledAts The times to schedule the notification for
 * @param  {String} pushToken            The push token of the destined user
 * @param  {Object} groupId              The group id of the notification to group it
 *
 * @return {Promise}                   A Firestore DB transaction
 */
exports.schedule = function (db, scheduledAts, payload, pushToken, groupId) {
  console.log('Scheduling notification')
  // Get notification queue data ref
  const notifQueueRef = db.collection(STATE_COLLECTION).doc(NOTIFICATION_QUEUE_DOC)
  // Run all ops as a db transaction to alleviate concurrency issues
  return db.runTransaction(async function (transaction) {
    const notifQueueDoc = await transaction.get(notifQueueRef)
    let notifQueue
    // Ensure notification queue exists
    if (!notifQueueDoc.exists) {
      // Initialise it
      notifQueue = _.cloneDeep(INIT_QUEUE)
      console.log('notifQueue does not exist so initializing it', INIT_QUEUE)
    } else {
      // Retrieve it
      notifQueue = notifQueueDoc.data()
      console.log('notifQueue already exists so using it', notifQueue)
    }

    // Ensure scheduledAts is an array
    if (!_.isArray(scheduledAts)) {
      scheduledAts = [scheduledAts]
    }

    // Schedule the notifications
    scheduledAts.forEach((scheduledAt) => {
      let notification = Object.assign({}, payload, {
        to: pushToken,
        scheduledAt: scheduledAt.toISOString(),
        scheduledAtEpoch: scheduledAt.unix(),
        groupId
      })
      // Add to the front of the queue
      notifQueue.queue.unshift(notification)
      console.log('Adding notification to queue', notification)
    })
    // Sort queue by the soonest to be processed
    notifQueue.queue.sort(notifComparator)
    transaction.set(notifQueueRef, notifQueue)
    console.log('Set queue', notifQueue)
    return transaction
  })
}

/**
 * Processes the scheduled push notification in the notification queue
 * Sends the scheduled notifications
 *
 * @param  {Object} db   A Firestore instance
 * @return {Promise}               A promise for the notification send requests results
 */
exports.process = function (db) {
  console.log('Processing notification')
  // Get notification queue data ref
  const notifQueueRef = db.collection(STATE_COLLECTION).doc(NOTIFICATION_QUEUE_DOC)
  // Run all ops as a db transaction to alleviate concurrency issues
  return db.runTransaction(async function (transaction) {
    const notifQueueDoc = await transaction.get(notifQueueRef)
    // Ensure notification queue exists
    if (!notifQueueDoc.exists) {
      // Doesn't exist so nothing to process
      console.log('Notification queue does not exist so nothing to proceess')
      return Promise.resolve()
    }

    // Retrieve the notification queue
    const notifQueue = notifQueueDoc.data()
    const nowEpoch = moment().unix()
    let notifMessages = []
    // Find all the notifications that need to be sent
    for (let i = 0; i < notifQueue.queue.length; i++) {
      if (notifQueue.queue[i].scheduledAtEpoch < nowEpoch) {
        // Add to messages to send
        let notifMessage = notifQueue.queue.shift()
        notifMessages.push(notifMessage)
        console.log('Enqueueing for processing notification', notifMessage)
      } else {
        // No more notifications to send
        break
      }
    }

    if (_.isEmpty(notifMessages)) {
      // Empty so nothing to process
      console.log('No new notifications to proceess')
      return Promise.resolve()
    }

    transaction.update(notifQueueRef, notifQueue)
    console.log('Updated notification queue', notifQueue)
    // Send notifications
    return exports.send(notifMessages)
  })
}

/**
 * Cancels a group of scheduled push notification in the notification queue
 *
 * @param  {Object} db   A Firestore instance
 * @param  {String} groupId  The ID of the group of notifications to cancel
 * @return {Promise}               An empty promise
 */
exports.cancel = function (db, groupId) {
  // Get notification queue data ref
  const notifQueueRef = db.collection(STATE_COLLECTION).doc(NOTIFICATION_QUEUE_DOC)
  // Run all ops as a db transaction to alleviate concurrency issues 
  return db.runTransaction(async function (transaction) {
    const notifQueueDoc = await transaction.get(notifQueueRef)
    // Ensure notification queue exists
    if (!notifQueueDoc.exists) {
      // Doesn't exist so nothing to process
      return Promise.resolve()
    }

    // Retrieve the notification queue
    const notifQueue = notifQueueDoc.data()

    if (_.isEmpty(notifQueue.queue)) {
      // Empty so nothing to process
      return Promise.resolve()
    }

    // Filter the group of notifications out
    notifQueue.queue = notifQueue.queue.filter(notif => notif.groupId !== groupId)
    // Sort queue by the soonest to be processed
    notifQueue.queue.sort(notifComparator)
    transaction.update(notifQueueRef, notifQueue)
    return Promise.resolve()
  })
}