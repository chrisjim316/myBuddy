import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import {
  Container,
  Content,
  Text,
  CardItem,
  Right,
  Left,
  Body,
  Icon,
  Badge,
  Row,
  Button
} from 'native-base'

import { TextInput } from 'react-native'

import { logout } from '../api/auth'
import { getCurrentUserAsync } from '../api/users'
import { LOGIN_SCREEN } from '../navigation/keys'
import { navigate } from '../navigation/NavigationService'
import { db } from '../firebase'

export class SettingsScreen extends Component {
  static navigationOptions = {
    rightComponent: (
      <Text
        style={{ color: 'white' }}
        onPress={async () => {
          await logout()
          navigate(LOGIN_SCREEN)
        }}
      >
        LOG OUT
      </Text>
    )
  }

  state = {
    user: {},
    team: {},
    manager: {},
    contact: ''
  }

  async componentDidMount () {
    const { team, ...user } = await getCurrentUserAsync()
    const { manager, ...teamData } = team
      ? await team.get().then(doc => doc.data())
      : {}
    const managerData = manager
      ? await manager.get().then(doc => doc.data())
      : {}
    this.setState({
      user,
      team: teamData,
      manager: managerData,
      contact: user.contact || ''
    })
  }

  _handleSubmit () {
    if (this.state.contact === this.state.user.contact) {
    } else {
      db.collection('users')
        .doc(this.state.user.uid)
        .update({
          contact: this.state.contact
        })
    }
  }

  render () {
    return (
      <Container>
        <Button full warning onPress={() => this._handleSubmit()}>
          <Text>Update</Text>
        </Button>

        <CardItem bordered>
          <Left>
            <Icon
              style={{ fontSize: 100, color: 'gainsboro' }}
              name='ios-contact'
            />
            <Body>
              <Text>{this.state.user.displayName}</Text>
              <Text note>{this.state.user.email}</Text>
              <Badge style={{ marginTop: 5 }}>
                <Text>{this.state.user.accessLevel}</Text>
              </Badge>
            </Body>
          </Left>
        </CardItem>
        <Content>
          <CardItem bordered>
            <Text style={styles.boldText}>Team</Text>
            <Right>
              <Text>{this.state.team.name}</Text>
            </Right>
          </CardItem>
          <CardItem bordered>
            <Text style={styles.boldText}>Manager</Text>
            <Right>
              <Text>{this.state.manager.displayName}</Text>
            </Right>
          </CardItem>
          <CardItem bordered>
            {/* <Row> */}
            <Text style={styles.boldText}>Contact Number</Text>
            {/* </Row> */}
            <Right>
              <TextInput
                value={this.state.contact}
                placeholder='Contact Number'
                editable
                keyboardType={'numeric'}
                returnKeyLabel={'update'}
                onChangeText={text => this.setState({ contact: text })}
              />
            </Right>
          </CardItem>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  boldText: {
    fontWeight: 'bold'
  }
})
