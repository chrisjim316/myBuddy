import React, { Component } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { DrawerItems } from 'react-navigation'
import { Text, Content, View } from 'native-base'

import Colors from '../constants/Colors'
import firebase from '../firebase'
import SwipeToConfirm from './SwipeToConfirm'

export default class DrawerMenu extends Component {
  state = {
    displayName: ''
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.setState({ displayName: user ? user.displayName : '' })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <Text style={styles.displayName}>{this.state.displayName}</Text>
          <View
            style={{
              borderBottomColor: 'white',
              borderBottomWidth: 1
            }}
          />
          <Content>
            <DrawerItems {...this.props} {...contentOptions} />
          </Content>
          <SwipeToConfirm />
        </SafeAreaView>
      </>
    )
  }
}

// https://reactnavigation.org/docs/en/drawer-navigator.html#contentoptions-for-draweritems
const contentOptions = {
  activeTintColor: 'white',
  activeBackgroundColor: Colors.secondaryColor,
  inactiveTintColor: 'white',
  inactiveBackgroundColor: Colors.primaryColor,
  itemsContainerStyle: {
    marginVertical: 0
  },
  iconContainerStyle: {
    opacity: 1
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryColor,
    flex: 1
  },
  displayName: {
    textAlign: 'center',
    fontSize: 40,
    color: 'white',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingBottom: 5
  },
  drawer: {
    flex: 1
  }
})
