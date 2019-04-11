/******************************************************************************
 * myBuddy API v1
 * Primary entry point to the API
 ******************************************************************************/
'use strict'

const express = require('express'),
  asyncHandler = require('express-async-handler'),
  querystring = require('querystring'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  passport = require('passport'),
  authParser = require('express-auth-parser'),
  morgan = require('morgan'),
  firebase = require('firebase-admin'),
  _ = require('lodash'),
  moment = require('moment'),
  config = require('./config'),
  firestore = require('./firestore'),
  notifications = require('./notifications'),
  authStrategies = require('./strategies')

const functions = require('firebase-functions').region(config.FIREBASE_REGION)

// Firebase Cloud Functions mounts the app at HOST/FUNCTION_NAME
const BASE_PATH = config.IN_DEV ? '' : `/${config.FUNCTION_NAME}`
const AUTH_SUCCESS = 0
const AUTH_FAIL = 1
const AUTH_FAIL_PATH = `${BASE_PATH}/auth/callback?result=${AUTH_FAIL}`
// Init Firebase
firebase.initializeApp()
// Get DB refs
const db = firebase.firestore()
// User data ref
const users = db.collection('users')

// Setup passport to use the auth strategies
const AzureOIDCStrategy = authStrategies.AzureOIDC(firebase, users)
const FirebaseBearerStrategy = authStrategies.FirebaseBearer(firebase)
passport.use(AzureOIDCStrategy)
passport.use(FirebaseBearerStrategy)

/**
 * App init
 */
const app = express()

app.use(morgan('dev'))
app.use(methodOverride())
app.use(cookieParser())
app.use(authParser)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Initialize Passport
// Use passport.session() middleware
app.use(passport.initialize())
app.use(passport.session())

/**
 * Middleware for authenticated routes to ensure the user is already logged in
 * throws a 401 if not
 */
const ensureAuthenticated = passport.authenticate('bearer', { session: false })

/******************************************************************************
 * Routes
 ******************************************************************************/

/**
 * Processes the notifications queue
 *
 * To be polled at an interval
 */
app.get(
  '/notifications/process',
  asyncHandler(async (req, res, next) => {
    await notifications.process(db)
    res.send('done ✅')
  })
)

/**
 * Sends push notifications
 *
 * Requires a `messages` param of the format defined at
 * https://docs.expo.io/versions/latest/guides/push-notifications/#message-format
 */
app.post(
  '/notifications/send',
  asyncHandler(async (req, res, next) => {
    let messages = req.body.messages
    console.log('Messgaes', messages)
    if (!messages) {
      res.status(400).send('Bad Request: messages missing g')
      return
    }
    await notifications.send(messages)
    res.send('sent ✅')
  })
)

/**
 * Client auth url (the `authUrl`)
 *
 * Initiates the client login/signup (OpenID Connect) flow
 * Final auth result is passed back to the client at the specified, as a query
 * param, `redirectUrl` along with the user data (on success) being encoded as a
 * query string with the param `result` being:
 *  0 - success
 *  1 - failure
 *
 * And, on success, the user data being:
 *  uid - the user's ID (the Microsoft account's `oid`)
 *  name - the user's full name
 *  email - the user's email
 *  customToken - the custom token to be used to sign into Firebase on the client-side
 *  (https://firebase.google.com/docs/auth/web/custom-auth#authenticate-with-firebase)
 *  accessToken - the access token for accessing the user's Micorsoft account data
 *  refreshToken - the refresh token for the access token (above)
 */
app.get(
  '/auth/login',
  function(req, res, next) {
    let redirectUrl = req.query.redirectUrl
    // Ensure redirectUrl is passed
    if (!redirectUrl) {
      res.status(400).send('Bad Request: the redirectUrl is missing g')
      return
    }
    // Save the specified redirectUrl as a cookie to be used as the client callback
    res.cookie('redirectUrl', redirectUrl, { maxAge: config.COOKIE_MAX_AGE })
    console.info('Starting login/signup')
    passport.authenticate('azuread-openidconnect', {
      response: res, // required
      session: false, // do not persist
      failureRedirect: AUTH_FAIL_PATH
    })(req, res, next)
  },
  function(req, res) {
    res.redirect(AUTH_FAIL_PATH)
  }
)

/**
 * Server auth callback (the Redirect URL)
 *
 * Processes the login/signup result received from Azure AD authenticating the
 * content returned in query (such as authorization code)
 **/
app.post(
  '/auth/openid/return',
  function(req, res, next) {
    passport.authenticate('azuread-openidconnect', {
      response: res, // required
      session: false, // do not persist
      failureRedirect: AUTH_FAIL_PATH
    })(req, res, next)
  },
  function(req, res) {
    // Flatten the user data and pass it back to the client side
    let resUser = Object.assign(
      { result: AUTH_SUCCESS },
      _.pick(req.user, ['customToken'])
    )
    let redirectUrl = encodeURI(
      req.cookies.redirectUrl + '?' + querystring.stringify(resUser)
    )
    console.info(
      `Finished processing result from Azure AD. Redirecting to ${redirectUrl}`
    )
    res.redirect(redirectUrl)
  }
)

/**
 * Gotta catch em all!
 */
app.get('*', function(req, res) {
  res.status(404).send('404 welcome to the abyss!')
})

/******************************************************************************
 * Server
 ******************************************************************************/

/**
 * Start dev server when in dev environment
 */
if (config.IN_DEV) {
  app.listen(config.PORT, function() {
    console.info(`myBuddy running at ${config.HOST}`)
  })
}

// Expose Express API as a single Firebase Cloud Function
exports[config.FUNCTION_NAME] = functions.https.onRequest(app)

/******************************************************************************
 * Cloud Firestore functions
 * Invoked on Firestore changes
 * https://firebase.google.com/docs/firestore/extend-with-functions
 ******************************************************************************/

/**
 * Listens to new appointments to send buddy request notifications
 */
exports.createAppointment = functions.firestore
  .document('appointments/{appointmentId}')
  .onCreate((snap, context) => firestore.createAppointment(snap, context, db))

/**
 * Listens to appointments status updates to enqueue/dequeue notifications
 */
exports.updateAppointment = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate((snap, context) => firestore.updateAppointment(snap, context, db))

/**
 * Listens to appointments deletion to cancel remaining notifications
 */
exports.deleteAppointment = functions.firestore
  .document('appointments/{appointmentId}')
  .onDelete((snap, context) => firestore.deleteAppointment(snap, context, db))

/**
 * Listens to new emergencies to send emergency notification to everyone
 * in the users team
 */
exports.createEmergency = functions.firestore
  .document('emergencies/{emergencyId}')
  .onCreate((snap, context) => firestore.createEmergency(snap, context, users))
