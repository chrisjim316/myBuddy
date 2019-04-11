import React, { Component } from 'react'
import { Container, Content } from 'native-base'

import Card from '../../components/Card'
import { buddyRequestsOnSnapshot } from '../../api'
import MyTitle from '../../components/MyTitle'
import LoadingPage from '../../components/LoadingPage'

export default class BuddyRequestsScreen extends Component {
  state = {
    appointments: {},
    isLoading: true
  }

  async componentDidMount() {
    this.unsubscribe = await buddyRequestsOnSnapshot(appointments =>
      this.setState({
        appointments,
        isLoading: false
      })
    )
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingPage />
    }

    const appointments = this.state.appointments.map((appointment, i) => (
      <Card key={i} type="buddy-appointment" {...appointment} />
    ))

    if (Boolean(appointments.length)) {
      return (
        <Container>
          <Content>{appointments}</Content>
        </Container>
      )
    }

    return (
      <MyTitle style={{ fontStyle: 'italic' }}>No outstanding requests</MyTitle>
    )
  }
}
