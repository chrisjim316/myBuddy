/******************************************************************************
 * Auth Strategies
 * For PassportJS
 ******************************************************************************/
'use strict'

const AzureAD = require('passport-azure-ad'),
  BearerStrategy = require('passport-http-bearer')
  .Strategy,
  _ = require('lodash'),
  config = require('./config')

/**
 * Returns the User record if the user exists and null if he does not
 * Throws the error if it fails to
 */
async function getUser(uid, firebase) {
  try {
    let userRecord = await firebase.auth()
      .getUser(uid)
    return userRecord
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return null
    }
    throw err
  }
}


/**
 * Azure Active Directory OpenID Connect Strategy used for login/signup
 *
 * Verifies the credentials and updates the corresponding user from the db if it
 * exists (login) or creates it otherwise (signup)
 **/
exports.AzureOIDC = function (firebase, users) {
  return new AzureAD.OIDCStrategy(
    _.cloneDeep(config.creds),
    function (iss, sub, profile, accessToken, refreshToken, params, done) {
      if (!profile.oid) {
        return done(new Error('No oid found'), null)
      }

      let user = {}
      // Async verification
      getUser(profile.oid, firebase)
        .then(userRecord => {
          // Check if user exists
          if (!userRecord) {
            // User doesn't exist yet, so create it
            user = {
              uid: profile.oid,
              email: profile._json.email,
              emailVerified: true,
              displayName: profile._json.name,
              disabled: false
            }
            console.info('User does not exist so creating user', profile.oid)
            // Create user
            return firebase
              .auth()
              .createUser(user)
              .then(newUserRecord => {
                // See the UserRecord reference doc for the contents of newUserRecord
                console.debug('Successfully created new user: ', newUserRecord.uid)
                /**
                 *  Create a extended user object in Firestore in order to
                 *  add additional user properties (due to Firebase Auth User
                 *  Record limitations)
                 **/
                // Store Mircosoft account access and refresh token
                user.auth = { accessToken, refreshToken }
                // Default user properties
                Object.assign(user, config.DEFAULT_USER)
                return users.doc(profile.oid)
                  .set(user)
              })
              .then(userDoc => {
                console.debug('Successfully created new user in Firestore: ', userDoc)
              })
          } else {
            // User already exists so get the extended user object and attach it to it
            console.info('User already exists so getting', profile.oid)
            return users
              .doc(profile.oid)
              .get()
              .then(firebaseUser => {
                // Ensure user exists
                if (!firebaseUser.exists) {
                  return done(new Error('No user found'), null)
                }
                // Add the extended user object data
                Object.assign(user, userRecord, firebaseUser.data())
              })
          }
        })
        .then(() => {
          // Create a new custom token for user
          return firebase.auth()
            .createCustomToken(profile.oid)
        })
        .then(customToken => {
          // Save the custom token as the ID token for the user
          // Set user auth params for client callback
          user.customToken = customToken
          console.debug('Sending back user', user)
          // Auth successfull so pass back params in the client callback
          done(null, user)
        })
        .catch(err => {
          // Catch all other errors
          console.error(err)
          done(err)
        })
    }
  )
}

/**
 * Azure Active Directory OAuth 2.0 Strategy used for authenticating API calls
 *
 * Verifies the user ID token and attaches it as a `req.user` property to the
 * request to make it available to the middlewares downstream
 */
exports.AzureBearer = function (users) {
  return new AzureAD.BearerStrategy(
    _.omit(config.creds, ['scope']),
    function (token, done) {
      // Get user from db
      users
        .doc(token.oid)
        .get()
        .then(firebaseUser => {
          // Ensure user exists
          if (!firebaseUser.exists) {
            return done(new Error('No user found'), null)
          }
          console.info('Successfully retrieved user', firebaseUser.data()
            .uid)
          done(null, firebaseUser.data(), token)
        })
        .catch(err => done(err))
    }
  )
}

/**
 * Firebase OAuth 2.0 Strategy used for authenticating API calls
 *
 * Verifies the user ID token and attaches it as a `req.user` property to the
 * request to make it available to the middlewares downstream
 *
 * Only accepts ID tokens (does NOT accept custom tokens sent back at signup/
 * login). To obtain an ID token from a custom token on the client-side
 * First call `firebase.auth().signInWithCustomToken()`
 * https://firebase.google.com/docs/auth/web/custom-auth#authenticate-with-firebase
 * Then call `firebase.auth().currentUser.getToken()` on the signed in user
 * https://firebase.google.com/docs/auth/admin/verify-id-tokens#retrieve_id_tokens_on_clients
 */
exports.FirebaseBearer = function (firebase) {
  return new BearerStrategy(function (token, done) {
    firebase
      .auth()
      .verifyIdToken(token)
      .then(decodedToken => {
        console.debug('ID token is valid:', decodedToken)
        // Retrieve user via its uid
        return firebase.auth()
          .getUser(decodedToken.uid)
      })
      .then(user => {
        console.debug('Successfully fetched user data:', user.toJSON())
        done(null, user)
      })
      .catch(err => {
        // Catch all other errors
        console.error(err)
        done(err)
      })
  })
}