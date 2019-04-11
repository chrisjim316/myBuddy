/**
 * Responsible for customising the way errors are received and handled.
 * A custom global error handler is created.
 */

import React from 'react'
import { Alert } from 'react-native'
import { Updates } from 'expo'

if(!__DEV__) {
  // Console.log will be disabled in production
  console.log = () => {}
}

// The default error handler.
const defaultErrorHandler = ErrorUtils.getGlobalHandler()

/**
 * Builds the global error handler for errors throughout the application.
 * @param error - The error to handle.
 * @param isFatal - If the error is fatal (will kill the app).
 */
const globalErrorHandler = (error, isFatal) => {
  console.log(`Error: { isFatal:${isFatal}, error:${error}}`)
  // Display different message if error is fatal/non-fatal.
  isFatal
    ? error.message = "[Fatal unhandled exception] " + error.message
    : error.message = "[Nonfatal unhandled exception] " + error.message
  console.log(error)
  if(!__DEV__) {
    // Use alert popup if the application is not in developer mode.
    Alert.alert(
      'Oops!',
      'An unknown error occurred\nPlease check and try again',
      [
        {
          text: 'Restart the App',
          onPress: () => Updates.reload()
        },
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed, error message dismissed'),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    )
  }
  // Pass the error onto the default react native error handler
  defaultErrorHandler(error, isFatal)
}

// Set the global error handler to the custom global error handler.
ErrorUtils.setGlobalHandler(globalErrorHandler)

/**
 * Represents the error boundary class which is a component.
 * An error will be displayed as an alert popup with text.
 * Displays an option to restart the application or dismiss the error.
 * If no errors were caught, it will render its children.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  /**
   * Catches lifecycle errors.
   * The error is a string.
   * @param error - The error.
   * @param information  - The information.
   */
  async componentDidCatch(error, information) {
    console.log(`React native lifecycle exception: ${JSON.stringify(information)}`)
    await this.setState({hasError: true})
    error.message = "[React native lifecycle exception] " + error.message
    console.log(error)
  }

  render() {
    if(this.state.hasError && !__DEV__) {
      Alert.alert(
        'Oops!',
        'An unknown error occurred\nPlease check and try again',
        [
          {
            text: 'Restart the App',
            onPress: () => Updates.reload()
          },
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed, error message dismissed'),
            style: 'cancel'
          }
        ],
        { cancelable: false }
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
