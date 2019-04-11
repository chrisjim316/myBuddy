import React, { Component } from 'react'
import { Text, CardItem, Button, Icon } from 'native-base'
import PropTypes from 'prop-types'

import AppointmentInfo from './AppointmentInfo'

export default class BuddyAppointmentCardItem extends Component {
  state = {
    clinicianName: ''
  }

  async componentDidMount() {
    try {
      const { user } = this.props
      const { displayName } = await user.get().then(doc => doc.data())
      this.setState({ clinicianName: displayName })
    } catch (error) {
      this.setState({ clinicianName: 'unavailable' })
    }
  }

  _handleSendReminder = () => {}

  _handleAccept = () => {
    this.props.appointmentRef.update({ 'buddy.status': 'confirmed' })
  }

  _handleReject = () => {
    this.props.appointmentRef.update({
      'buddy.user': null,
      'buddy.status': null
    })
  }

  render() {
    return (
      <>
        <AppointmentInfo
          info={this._renderRequester()}
          backgroundColor="whitesmoke"
          buttonsComponent={this._renderButtons()}
          {...this.props}
        />
      </>
    )
  }

  _renderRequester = () => {
    return (
      <>
        <Icon
          type="MaterialIcons"
          name="person-add"
          style={{ fontSize: 20, color: this.state.statusColor }}
        />
        <Text>{this.state.clinicianName}</Text>
      </>
    )
  }

  _renderButtons = () => {
    const {
      buddy: { status }
    } = this.props
    return (
      <CardItem cardBody bordered>
        {status === 'confirmed' ? (
          <>
            <Button
              warning
              full
              style={{ flex: 1 }}
              onPress={this._handleSendReminder}
            >
              <Text>Send reminder</Text>
            </Button>
          </>
        ) : (
          <>
            <Button
              success
              full
              style={{ flex: 1 }}
              onPress={this._handleAccept}
            >
              <Text>Accept</Text>
            </Button>
            <Button
              danger
              full
              style={{ flex: 1 }}
              onPress={this._handleReject}
            >
              <Text>Reject</Text>
            </Button>
          </>
        )}
      </CardItem>
    )
  }
}

BuddyAppointmentCardItem.propTypes = {
  appointmentRef: PropTypes.object.isRequired,
  buddy: PropTypes.shape({ status: PropTypes.string }).isRequired
}
