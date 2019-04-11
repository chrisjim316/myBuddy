/**
 * Class to manage asynchronised storage on the device.
 */

import { AsyncStorage } from 'react-native'

/**
 * Stores an object with the key specified.
 * Will overwrite the key by default and has option to merge.
 * key - The key to store with the object.
 * obj - The object to store.
 * isMerging - If we want to merge.
 */
AsyncStorage.storeObj = async (key, obj, isMerging = false) => {
  // console.log(`-> Storing object with key ${key}:`, obj)
  try {
    if (isMerging) {  
      let objInStorage = await this.retrieveObj(key) //Deserialized object as JSON array.
      if (!objInStorage) objInStorage = {} //If the object is empty, create an empty object in order to merge.
      let obj = Object.assign(objInStorage, obj)
    }
    const serialisedObj = JSON.stringify(obj)
    if (!serialisedObj) { //Check if the object is serializable.
      console.log(
        `Could not store object for key ${key} as its serialised value is:`,
        serialisedObj
      )
      return
    }
    await AsyncStorage.setItem(key, serialisedObj)
    // console.log(`Successfully stored object with key ${key}:`, obj)
  } catch (error) {
    // Error retrieving data
    console.log(`Error storing object with key ${key}:`, obj)
    console.log(error)
  }
}

/**
 * Retrieve an object with the specified key it was serialised with.
 * key - The key the object was saved with.
 */
AsyncStorage.retrieveObj = async key => {
  // console.log(`-> Retrieving object with key: ${key}`)
  try {
    let savedObject = await AsyncStorage.getItem(key)
    if (savedObject !== null) {
      // console.log(`Successfully retrieved object with {${key}: ${val}}`)
      savedObject = JSON.parse(savedObject)
      // console.log(`Successfully deserialised object with ${key}`, val)
    }
    return savedObject
  } catch (error) {
    console.log(`Error retrieving object with key ${key}`)
    console.log(error)
    return null
  }
}

export default AsyncStorage
