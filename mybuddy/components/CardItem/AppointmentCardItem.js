import React, { Component } from 'react'
import { Alert } from 'react-native'
import { Text, CardItem, Button, Row, Icon } from 'native-base'
import { withNavigation } from 'react-navigation'
import PropTypes from 'prop-types'
import moment from 'moment'
import omit from 'lodash/omit'

import AppointmentInfo from './AppointmentInfo'
import { getCurrentUserAsync } from '../../api'

class AppointmentCardItem extends Component {
  state = {
    showDescription: false,
    buddyName: null,
    statusColor: null
  }

  componentDidMount() {
    this._setRequester(this.props.buddy)
  }

  componentDidUpdate(prevProps) {
    if (this.props.buddy !== prevProps.buddy) {
      this._setRequester(this.props.buddy)
    }
  }

  _setRequester = async buddy => {
    const buddyName = buddy.user
      ? await buddy.user.get().then(doc => doc.data().displayName)
      : null

    let statusColor = null
    switch (buddy.status) {
      case 'confirmed':
        statusColor = 'green'
        break
      case 'pending':
        statusColor = 'orange'
        break
      default:
        statusColor = 'red'
    }
    this.setState({ buddyName, statusColor })
  }

  _handleCheckIn = async () => {
    if (moment(this.props.startDateTime) >= moment().add(30, 'minutes')) {
      alert('You cannot check in until 30 minutes before your appointment')
      return
    }
    const user = await getCurrentUserAsync()
    user.userRef.update({ currentAppointment: this.props.appointmentRef })
    this.props.appointmentRef.update({ status: 'in-progress' })
  }

  _handleCheckOut = async () => {
    const user = await getCurrentUserAsync()
    user.userRef.update({ currentAppointment: null })
    this.props.appointmentRef.update({ status: 'done' })
  }

  _handleEdit = async () => {
    const buddyId = this.props.buddy.user
      ? await this.props.buddy.user.get().then(doc => doc.id)
      : null

    const updatedAppointment = omit(
      {
        ...this.props,
        buddy: {
          ...this.props.buddy,
          user: buddyId
        }
      },
      ['user', 'appointmentRef']
    )

    this.props.navigation.navigate('AppointmentForm', {
      appointment: updatedAppointment
    })
  }

  _handleExtend = () => {
    // Show message popup and options to extend
    Alert.alert('Extend Appointment', 'Add minutes to the end time...', [
      {
        text: '15 minutes',
        onPress: () =>
          this.props.appointmentRef.update({
            endDateTime: moment(this.props.endDateTime)
              .add(15, 'minutes')
              .toDate()
          })
      },
      {
        text: '30 minutes',
        onPress: () =>
          this.props.appointmentRef.update({
            endDateTime: moment(this.props.endDateTime)
              .add(30, 'minutes')
              .toDate()
          })
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ])
  }

  render() {
    return (
      <>
        <AppointmentInfo
          info={this._renderBuddyInfo()}
          buttonsComponent={this._renderButtons()}
          {...this.props}
        />
      </>
    )
  }

  _renderBuddyInfo = () => {
    return (
      <>
        <Icon
          type="MaterialIcons"
          name="person"
          style={{ fontSize: 20, color: this.state.statusColor }}
        />
        <Text>{this.state.buddyName || 'none selected'}</Text>
      </>
    )
  }

  _renderButtons = () => {
    const { status, canEdit, canCheckIn } = this.props
    return (
      <CardItem cardBody bordered>
        {status === 'in-progress' ? (
          <>
            <Button
              warning
              full
              style={{ flex: 1 }}
              onPress={this._handleCheckOut}
            >
              <Text>Check Out</Text>
            </Button>
            <Button light full style={{ flex: 1 }} onPress={this._handleExtend}>
              <Text>Extend</Text>
            </Button>
          </>
        ) : (
          <>
            {canCheckIn && (
              <Button
                success
                full
                style={{ flex: 1 }}
                onPress={this._handleCheckIn}
              >
                <Text>Check In</Text>
              </Button>
            )}
            {canEdit && (
              <Button light full style={{ flex: 1 }} onPress={this._handleEdit}>
                <Text>Edit</Text>
              </Button>
            )}
          </>
        )}
      </CardItem>
    )
  }
}

AppointmentCardItem.propTypes = {
  appointmentRef: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  canCheckIn: PropTypes.bool.isRequired
}

AppointmentCardItem.defaultProps = {
  canEdit: false,
  canCheckIn: false
}

export default withNavigation(AppointmentCardItem)
