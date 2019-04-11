import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import ActionButton from 'react-native-action-button'
import {
  Container,
  Text,
  Content,
  CardItem,
  Icon,
  Left,
  Button,
  SwipeRow
} from 'native-base'

import MyTitle from '../../components/MyTitle'
import Card from '../../components/Card'
import DEFAULT_COLORS from '../../constants/Colors'

import { managersTeamMembersOnSnapshot } from '../../api'
import { db } from '../../firebase'

export default class TeamMembersScreen extends Component {
  state = {
    team: {},
    manager: {},
    users: []
  }

  async componentDidMount() {
    const managerId = this.props.navigation.getParam('managerId')
    const manager = await db
      .collection('users')
      .doc(managerId)
      .get()
      .then(doc => ({ ...doc.data(), userRef: doc.ref, id: doc.id }))

    this.setState({ manager })

    this.unsubscribe = await managersTeamMembersOnSnapshot(manager)(users =>
      this.setState({ users })
    )
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  _renderUsers = () => {
    // Check if there are team members
    if (!this.state.users.length) {
      return <MyTitle style={styles.noMembers}>No Team Members</MyTitle>
    }

    return (
      <Card>
        {this.state.users.map(({ userRef, ...user }) => (
          <SwipeRow
            key={user.uid}
            rightOpenValue={-75}
            body={
              <>
                <CardItem style={styles.card}>
                  <Left>
                    <Icon
                      ios="ios-contact"
                      android="ios-contact"
                      style={styles.cardItem}
                    />
                    <Text>{user.displayName}</Text>
                  </Left>
                </CardItem>
              </>
            }
            right={
              <Button danger onPress={() => userRef.update({ team: null })}>
                <Icon name="md-remove" style={styles.removeIcon} />
              </Button>
            }
          />
        ))}
      </Card>
    )
  }

  render() {
    const team = this.props.navigation.getParam('team')
    return (
      <Container>
        <Button full warning onPress={() => this.props.navigation.goBack()}>
          <Text>Back</Text>
        </Button>

        <Content>
          <MyTitle>{this.state.team.name} Members</MyTitle>
          <Text note style={{ alignSelf: 'center' }}>
            Manager: {this.state.manager.displayName || 'n/a'}
          </Text>
          {this._renderUsers()}
        </Content>

        <ActionButton buttonColor={DEFAULT_COLORS.primaryColor}>
          <ActionButton.Item
            title="Edit Team"
            buttonColor={DEFAULT_COLORS.secondaryColor}
            onPress={() => this.props.navigation.navigate('EditTeam', { team })}
          >
            <Icon name="md-create" style={styles.actionButtonIcon} />
          </ActionButton.Item>

          <ActionButton.Item
            title="Add Member"
            buttonColor={DEFAULT_COLORS.secondaryColor}
            onPress={() =>
              this.props.navigation.navigate('AddUserToTeam', { team })
            }
          >
            <Icon name="md-person-add" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  },
  removeIcon: {
    fontSize: 40,
    color: 'white'
  },
  cardItem: {
    fontSize: 40,
    color: 'gray',
    marginLeft: 5,
    marginRight: 5
  },
  noMembers: {
    fontStyle: 'italic',
    fontSize: 15
  },
  card: { paddingBottom: 0, paddingTop: 0 }
})
