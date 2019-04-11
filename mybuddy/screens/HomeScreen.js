import React, { Component } from 'react'
import { Container, Content, Button, Text } from 'native-base'
import Carousel from 'react-native-snap-carousel'

import Card from '../components/Card'

import {
  appointmentsThisWeekOnSnapshot,
  buddyAppointmentsThisWeekOnSnapshot,
  currentUserOnSnapshot
} from '../api'
import {
  APPOINTMENTS_SCREEN,
  BUDDY_APPOINTMENTS_SCREEN,
  EMERGENCIES_SCREEN
} from '../navigation/keys'
import { allEmergenciesOnSnapshot } from '../api/emergencies'
import Layout from '../constants/Layout'
import DEFAULT_COLORS from '../constants/Colors'

export class HomeScreen extends Component {
  state = {
    user: {},
    emergencies: [],
    appointments: [],
    buddyAppointments: []
  }

  subscriptions = []

  async componentDidMount() {
    const currentUser = await currentUserOnSnapshot(user =>
      this.setState({ user })
    )
    const appointments = await appointmentsThisWeekOnSnapshot(appointments =>
      this.setState({ appointments })
    )
    const buddyAppointmentsThisWeek = await buddyAppointmentsThisWeekOnSnapshot(buddyAppointments =>
      this.setState({ buddyAppointments })
    )
    const allEmergencies = await allEmergenciesOnSnapshot(emergencies =>
      this.setState({ emergencies })
    )
    // Make promises cancellable
    await this.subscriptions.push(currentUser, appointments, buddyAppointmentsThisWeek, allEmergencies)
  }

  componentWillUnmount() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
  }

  render() {
    return (
      <Container>
        {this.state.user.currentEmergency && (
          <Text
            style={{
              backgroundColor: DEFAULT_COLORS.dangerColor,
              color: 'white',
              textAlign: 'center',
              paddingTop: 10,
              paddingBottom: 10
            }}
          >
            You have an emergency active!
          </Text>
        )}
        <Content>
          <Button
            transparent
            onPress={() => this.props.navigation.navigate(EMERGENCIES_SCREEN)}
          >
            <Text>Emergencies</Text>
          </Button>
          <Carousel
            data={this.state.emergencies}
            renderItem={this._renderEmergencies}
            sliderWidth={Layout.window.width}
            itemWidth={350}
          />

          <Button
            transparent
            onPress={() => this.props.navigation.navigate(APPOINTMENTS_SCREEN)}
          >
            <Text>Appointments</Text>
          </Button>
          <Carousel
            data={this.state.appointments}
            renderItem={this._renderAppointments}
            sliderWidth={Layout.window.width}
            itemWidth={350}
          />

          <Button
            transparent
            onPress={() =>
              this.props.navigation.navigate(BUDDY_APPOINTMENTS_SCREEN)
            }
          >
            <Text>Buddy Appointments</Text>
          </Button>
          <Carousel
            data={this.state.buddyAppointments}
            renderItem={this._renderBuddyAppointments}
            sliderWidth={Layout.window.width}
            itemWidth={350}
          />
        </Content>
      </Container>
    )
  }

  _renderEmergencies = ({ item, index }) => {
    return <Card canCheckIn type="emergency" {...item} />
  }

  _renderAppointments = ({ item, index }) => {
    return <Card canCheckIn type="appointment" {...item} />
  }

  _renderBuddyAppointments = ({ item, index }) => {
    return <Card type="buddy-appointment" {...item} />
  }
}
