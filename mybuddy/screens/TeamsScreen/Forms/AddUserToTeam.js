import React, { Component } from 'react'
import { Container, Content, Text, Button, CardItem, Body } from 'native-base'

import MyTitle from '../../../components/MyTitle'
import { db } from '../../../firebase'
import { usersWithoutTeamOnSnapshot } from '../../../api'

export default class AddUserToTeam extends Component {
  state = {
    team: {},
    users: []
  }

  async componentDidMount() {
    const team = this.props.navigation.getParam('team')
    this.setState({
      team
    })

    this.unsubscribe = await usersWithoutTeamOnSnapshot(users =>
      this.setState({ users })
    )
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  async _handleSubmit(userId) {
    // add selected user to current team on firebase
    db.collection('users')
      .doc(userId)
      .update({
        team: db.doc('teams/' + this.team.id)
      })
    this.props.navigation.goBack()
  }

  _renderUsers = () => {
    return this.state.users.map(user => (
      <CardItem
        key={user.uid}
        bordered
        style={{ justifyContent: 'center', flex: 1 }}
        button
        onPress={() => this._handleSubmit(user.uid)}
      >
        <Body>
          <Text>{user.displayName}</Text>
          <Text note>{user.email}</Text>
        </Body>
      </CardItem>
    ))
  }

  render() {
    return (
      <Container>
        <Button full warning onPress={() => this.props.navigation.goBack()}>
          <Text>Cancel</Text>
        </Button>
        <Content>
          <MyTitle>Add User to Team</MyTitle>
          <Text note style={{ alignSelf: 'center', marginBottom: 5 }}>
            Team: {this.state.team.name}
          </Text>
          {this.state.users.length ? (
            this._renderUsers()
          ) : (
            <Text style={{ alignSelf: 'center' }}>
              No users without a team found
            </Text>
          )}
        </Content>
      </Container>
    )
  }
}
