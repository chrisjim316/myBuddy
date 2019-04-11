import React, { Component } from 'react'
import { db } from '../../firebase'
import { StyleSheet } from 'react-native'
import {
  Container,
  Text,
  Content,
  CardItem,
  Body,
  Icon,
  Right
} from 'native-base'
import ActionButton from 'react-native-action-button'
import omit from 'lodash/omit'

import DEFAULT_COLORS from '../../constants/Colors'
import SearchBar from '../../components/SearchBar'
import { allTeamsOnSnapshot } from '../../api'

export default class TeamsScreen extends Component {
  state = {
    teams: [],
    visibleTeams: []
  }

  async componentDidMount() {
    this.unsubscribe = await allTeamsOnSnapshot(async teams => {
      teams = await Promise.all(
        teams.map(async team => {
          const manager = await team.manager
            .get()
            .then(doc => ({ ...doc.data(), id: doc.id }))
          console.log(manager.displayName)
          return { ...team, manager }
        })
      )
      this.setState({ teams, visibleTeams: teams })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  _search = visibleTeams => {
    // Search for all teams available
    this.setState({ visibleTeams })
  }

  _renderTeams = () => {
    return this.state.visibleTeams.map(team => (
      <CardItem
        key={team.id}
        bordered
        style={{ justifyContent: 'center', flex: 1 }}
        button
        onPress={() =>
          this.props.navigation.navigate('TeamMembers', {
            managerId: team.manager.id
          })
        }
      >
        <Body>
          <Text>{team.name}</Text>
          <Text note>Manager: {team.manager.displayName || 'n/a'}</Text>
        </Body>
        <Right>
          <Icon name="arrow-forward" />
        </Right>
      </CardItem>
    ))
  }

  render() {
    return (
      <Container>
        <SearchBar
          properties={['name', 'manager.displayName']}
          data={this.state.teams}
          onSearch={this._search}
          placeholder="team or manager name"
        />
        <Content>{this._renderTeams()}</Content>
        <ActionButton
          buttonColor={DEFAULT_COLORS.secondaryColor}
          onPress={() => this.props.navigation.navigate('AddTeamForm')}
          renderIcon={() => (
            <Icon
              type="MaterialIcons"
              name="group-add"
              style={styles.actionButtonIcon}
            />
          )}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white'
  }
})
