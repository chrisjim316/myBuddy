import firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: '[ADD IT HERE]',
  authDomain: '[ADD IT HERE]',
  databaseURL: '[ADD IT HERE]',
  projectId: '[ADD IT HERE]',
  storageBucket: '[ADD IT HERE]',
  messagingSenderId: '[ADD IT HERE]'
}

firebase.initializeApp(config)
export const db = firebase.firestore()
export default firebase
