import React, { Component } from 'react'
import { Container, Content } from 'native-base'

import Card from '../components/Card'
import MyTitle from '../components/MyTitle'
import { allEmergenciesOnSnapshot } from '../api/emergencies'

export class EmergenciesScreen extends Component {
  state = {
    emergencies: []
  }

  async componentDidMount() {
    this.unsubscribe = await allEmergenciesOnSnapshot(emergencies =>
      this.setState({ emergencies })
    )
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    // If there is at least one emergency
    if (Boolean(this.state.emergencies.length)) {
      return (
        <Container>
          <Content>
            {this.state.emergencies.map((emergency, i) => (
              <Card key={i} type="emergency" {...emergency} />
            ))}
          </Content>
        </Container>
      )
    }

    return (
      <MyTitle style={{ fontStyle: 'italic' }}>No active emergencies</MyTitle>
    )
  }
}
