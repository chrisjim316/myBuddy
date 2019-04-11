/**
 * Holds constants for the layout of the window such as dimension and width.
 * Exports them as constants to refer to.
 */

import { Dimensions } from 'react-native'

// The width of the window.
const width = Dimensions.get('window').width

// The height of the window.
const height = Dimensions.get('window').height

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375, // Smaller screen devices such as iPhone 5.
}
