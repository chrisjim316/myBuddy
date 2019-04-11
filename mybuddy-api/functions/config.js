/******************************************************************************
 * Config
 * Defines the configuration and constants for the API
 ******************************************************************************/
'use strict'
/**
 * Login/sign up constraint
 *
 * For dev purposes, set to allow anyone with a work and school accounts from
 * Azure AD and personal Microsoft accounts (MSA), such as hotmail.com,
 * outlook.com, and msn.com, to login/sign up To use the common endpoint, either
 * turn `validateIssuer` off, or provide the `issuer` value
 *
 * TODO: change to 'nhs.onmicrosoft.com' to restrict login/sign up to just NHS employees
 * (from https://s3-eu-west-1.amazonaws.com/comms-mat/Comms-Archive/NHSmail_O365+Hybrid+Onboarding+Guidance+Document.pdf)
 **/
const TENANT_ID = 'common'
const PRODUCTION_HOST = 'https://europe-west1-mybuddy-47e82.cloudfunctions.net'

/******************************************************************************
 * General
 ******************************************************************************/
exports.FUNCTION_NAME = 'api'
exports.IN_DEV = process.env.NODE_ENV === 'development'
exports.PORT = 3000
exports.HOST = exports.IN_DEV
  ? `http://localhost:${exports.PORT}`
  : `${PRODUCTION_HOST}/${exports.FUNCTION_NAME}`
exports.FIREBASE_REGION = 'europe-west1' // https://firebase.google.com/docs/functions/locations
exports.COOKIE_MAX_AGE = 15 * 60 * 1000 // 15 minutes

// Signup defaults
exports.DEFAULT_ACCESS_LEVEL = 'user'
exports.DEFAULT_USER = {
  accessLevel: exports.DEFAULT_ACCESS_LEVEL,
  team: null
}

/******************************************************************************
 * Notifications
 ******************************************************************************/
exports.NOTIFICATIONS_STATES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  DONE: 'done'
}
// In minutes
exports.NOTIFICATIONS_INTERVALS = {
  CHECK_IN: 15,
  CHECK_OUT: [5, 10, 15, 20],
  CHECK_OUT_BUDDY: 30
}
exports.NOTIFICATIONS_BUDDY_REQUEST = {
  title: 'New buddy request',
  body: 'You have a new buddy request',
  data: {
    type: 'buddy-request'
  }
}
exports.NOTIFICATIONS_CHECK_IN = {
  title: 'Time to check in!',
  body: 'You have appointment coming right up so check in!',
  data: {
    type: 'check-in'
  }
}
exports.NOTIFICATIONS_CHECK_OUT = {
  title: 'Time to check out!',
  body: 'Your appointment has finished so check out!',
  data: {
    type: 'check-out'
  }
}
exports.NOTIFICATIONS_BUDDY_CHECK_OUT = {
  title: 'Check up on your buddy!',
  body: 'Your buddy has not checked out yet!',
  data: { type: 'check-out-buddy' }
}

exports.NOTIFICATIONS_EMERGENCY = name => ({
  title: 'Emergency Alert',
  body: `${name} initiated an emergency! 🚨`,
  data: { type: 'emergency' },
  priority: 'high'
})

/******************************************************************************
 * Azure AD
 ******************************************************************************/
exports.creds = {
  // Required
  identityMetadata: `https://login.microsoftonline.com/${TENANT_ID}/v2.0/.well-known/openid-configuration`,
  // or equivalently: 'https://login.microsoftonline.com/<tenant_guid>/v2.0/.well-known/openid-configuration'

  // Required, the client ID of your app in AAD
  clientID: '44af2bda-c9bc-406c-9397-ca62f5e63d56',

  // Required, must be 'code', 'code id_token', 'id_token code' or 'id_token'
  // If you want to get access_token, you must use 'code', 'code id_token' or 'id_token code'
  responseType: 'code id_token',

  // Required
  responseMode: 'form_post',

  // Required, the reply URL registered in AAD for your app
  redirectUrl: `${exports.HOST}/auth/openid/return`,

  // Required if we use http for redirectUrl
  allowHttpForRedirectUrl: true,

  // Required if `responseType` is 'code', 'id_token code' or 'code id_token'.
  // If app key contains '\', replace it with '\\'.
  clientSecret: 'anzXE1017](gbbxQHYPQ2;_',

  // Required to set to false if you don't want to validate issuer
  validateIssuer: false,

  // Required if you want to provide the issuer(s) you want to validate instead of using the issuer from metadata
  // issuer could be a string or an array of strings of the following form: 'https://sts.windows.net/<tenant_guid>/v2.0'
  issuer: null,

  // Required to set to true if the `verify` function has 'req' as the first parameter
  passReqToCallback: false,

  // Use cookies instead of express session
  useCookieInsteadOfSession: true,

  // Required if `useCookieInsteadOfSession` is set to true. You can provide multiple set of key/iv pairs for key
  // rollover purpose. We always use the first set of key/iv pair to encrypt cookie, but we will try every set of
  // key/iv pair to decrypt cookie. Key can be any string of length 32, and iv can be any string of length 12.
  cookieEncryptionKeys: [
    { key: '12345678901234567890123456789012', iv: '123456789012' },
    { key: 'abcdefghijklmnopqrstuvwxyzabcdef', iv: 'abcdefghijkl' }
  ],

  // The additional scopes we want besides 'openid'.
  // 'profile' scope is required, the rest scopes are optional.
  // (1) if you want to receive refresh_token, use 'offline_access' scope
  // (2) if you want to get access_token for graph api, use the graph api url like 'https://graph.microsoft.com/mail.read'
  scope: [
    'profile',
    'offline_access',
    'email',
    'openid',
    'Calendars.Read.Shared',
    'Calendars.Read'
  ],

  // Optional, 'error', 'warn' or 'info'
  loggingLevel: 'info',

  // Optional, If this is set to true, no personal information such as tokens and claims will be logged. The default value is true.
  // loggingNoPII: false,

  // Optional. The lifetime of nonce in session or cookie, the default value is 3600 (seconds).
  nonceLifetime: null,

  // Optional. The max amount of nonce saved in session or cookie, the default value is 10.
  nonceMaxAmount: 10,

  // Optional. The clock skew allowed in token validation, the default value is 300 seconds.
  clockSkew: 300,

  // B2B
  isB2C: false

  // Access token from AAD may not be a JWT (in which case only AAD knows how to validate it)
  // So using this URL ensures we always do
  // resourceURL: null,

  // Optional, default value is clientID
  // audience: null
}
