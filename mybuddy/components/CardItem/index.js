import React, { Component } from 'react'
import { CardItem, Text } from 'native-base'
import PropTypes from 'prop-types'

import AppointmentCardItem from './AppointmentCardItem'
import BuddyAppointmentCardItem from './BuddyAppointmentCardItem'
import EmergencyCardItem from './EmergencyCardItem'

export default class CustomCardItem extends Component {
  render() {
    const { children, type, ...props } = this.props

    if (children) {
      return <CardItem {...props}>{children}</CardItem>
    }

    switch (type) {
      case 'appointment':
        return <AppointmentCardItem {...props} />
      case 'buddy-appointment':
        return <BuddyAppointmentCardItem {...props} />
      case 'emergency':
        return <EmergencyCardItem {...props} />
      default:
        return <Text>error</Text>
    }
  }
}

CustomCardItem.propTypes = {
  children: PropTypes.node
}
