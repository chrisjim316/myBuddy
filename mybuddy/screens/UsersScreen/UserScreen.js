import React, { Component } from 'react'
import { Container, Content, Tabs, Tab, Text } from 'native-base'
import _ from 'lodash'
import { UserTab } from './UserTab'
import SearchBar from '../../components/SearchBar'
import firebase from '../../firebase'
import Colors from '../../constants/Colors'

export class UserScreen extends Component {
  constructor() {
    super()
    this.state = {
      loading: false,
      data: [],
      fullData: []
    }
    this.ref = firebase.firestore().collection('users')
    this.unsubscribe = null
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this._onCollectionUpdate)
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  _onCollectionUpdate = querySnapshot => {
    // If user is part of a team, fetch relevant data from db
    const users = []
    querySnapshot.forEach(doc => {
      const { displayName, email, team, accessLevel, uid } = doc.data()
      if (team) {
        this.setState({ loading: true })
        team
          .get()
          .then(teamDoc => {
            const { name } = teamDoc.data()
            users.push({
              key: uid,
              email, // DocumentSnapshot
              displayName,
              teamName: name,
              accessLevel
            })
            this.setState({ loading: false })
          })
          .catch(err => {
            console.log(err)
          })
      } else {
        users.push({
          key: uid,
          email, // DocumentSnapshot
          displayName,
          teamName: 'None',
          accessLevel
        })
      }
    })
    this.setState({
      loading: false,
      data: users,
      fullData: users
    })
  }

  _search = visibleUsers => {
    // Search for all users available
    this.setState({ data: visibleUsers })
  }

  render() {
    if (this.state.loading) {
      return (
        <Container>
          <Content>
            <Text>Loading...</Text>
          </Content>
        </Container>
      )
    } else {
      return (
        <Container>
          <SearchBar
            properties={['displayName', 'teamName', 'email']}
            data={this.state.fullData}
            onSearch={this._search}
            placeholder="Search"
          />
          <Tabs
            tabBarUnderlineStyle={{
              backgroundColor: Colors.primaryColor,
              height: 2
            }}
          >
            <Tab
              textStyle={{ color: Colors.tabIconDefault }}
              tabStyle={{ backgroundColor: Colors.secondaryColor }}
              activeTextStyle={{
                color: Colors.tabIconDefault,
                fontWeight: '400'
              }}
              activeTabStyle={{ backgroundColor: Colors.secondaryColor }}
              heading="Clinicians"
            >
              <Content>
                <UserTab
                  data={this.state.data.filter(
                    user => user.accessLevel === 'clinician'
                  )}
                />
              </Content>
            </Tab>
            <Tab
              textStyle={{ color: Colors.tabIconDefault }}
              tabStyle={{ backgroundColor: Colors.secondaryColor }}
              activeTextStyle={{
                color: Colors.tabIconDefault,
                fontWeight: '400'
              }}
              activeTabStyle={{ backgroundColor: Colors.secondaryColor }}
              heading="Team managers"
            >
              <UserTab
                data={this.state.data.filter(
                  user => user.accessLevel === 'teamManager'
                )}
              />
            </Tab>
            <Tab
              textStyle={{ color: Colors.tabIconDefault }}
              tabStyle={{ backgroundColor: Colors.secondaryColor }}
              activeTextStyle={{
                color: Colors.tabIconDefault,
                fontWeight: '400'
              }}
              activeTabStyle={{ backgroundColor: Colors.secondaryColor }}
              heading="Admins"
            >
              <UserTab
                data={this.state.data.filter(
                  user => user.accessLevel === 'admin'
                )}
              />
            </Tab>
          </Tabs>
        </Container>
      )
    }
  }
}
