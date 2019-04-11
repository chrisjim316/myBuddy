import React, { Component } from 'react'
import { Platform, Linking } from 'react-native'
import { Button, Col, CardItem, Text, Title, Icon, Row } from 'native-base'
import PropTypes from 'prop-types'

export default class EmergencyCardItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      appointment: {},
      location: null
    }
    this._openGps = this._openGps.bind(this)
    this._updateEmergency = this._updateEmergency.bind(this)
  }

  async componentDidMount() {
    const user = await this.props.user.get().then(doc => doc.data())
    const appointment = this.props.appointment
      ? await this.props.appointment.get().then(doc => doc.data())
      : {}
    let location = this.props.location ? this.props.location : null
    this.setState({ user, appointment, location })
  }

  _openGps = () => {
    console.log(`Location object acquired: ${JSON.stringify(this.props.location)}`)
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' })
    const latLng = `${this.props.location.latitude},${this.props.location.longitude}`
    const label = 'Custom Label'
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    })
    Linking.openURL(url)
  }

  _updateEmergency = () => {
    this.props.emergencyRef.update({ status: 'resolved' })
    this.props.user.update({ currentEmergency: null })
  }

  render() {
    return (
      <>
        <CardItem>
          <Col>
            <Title>{this.state.user.displayName}</Title>
            <Row style={{ alignItems: 'center' }}>
              <Icon type="MaterialIcons" name="location-on" />
              <Text>Appointment Address: {this.state.appointment.address || 'n/a'}</Text>
            </Row>
            <Row style={{ alignItems: 'center'}}>
              <Icon style={{paddingLeft: 5}} type="FontAwesome" name="map-pin" />
              <Text>Last Known: {
                this.state.location
                  ? `${this.state.location.street} ${this.state.location.city} ${this.state.location.country} ${this.state.location.postalCode}`
                  : 'n/a'
              }</Text>
            </Row>
            <Row style={{ alignItems: 'center' }}>
              <Icon type="MaterialCommunityIcons" name="email" />
              <Text>{this.state.user.email}</Text>
            </Row>
            <Row style={{ alignItems: 'center' }}>
              <Icon type="MaterialIcons" name="phone" />
              <Text>{this.state.user.contact || 'n/a'}</Text>
            </Row>
          </Col>
        </CardItem>
        <CardItem cardBody>
          <Button
            full
            success
            style={{ flex: 1 }}
            onPress={this._updateEmergency}
          >
            <Text style={{ color: 'white' }}>Resolve</Text>
          </Button>
          <Button
            full
            light
            style={{ flex: 1 }}
            onPress={this._openGps}
          >
            <Text>View Location</Text>
          </Button>
        </CardItem>
      </>
    )
  }
}

EmergencyCardItem.propTypes = {
  user: PropTypes.object.isRequired,
  appointment: PropTypes.object,
  emergencyRef: PropTypes.object.isRequired
}
