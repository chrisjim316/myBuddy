import React, { Component } from 'react'
import { AppLoading, Font } from 'expo'

import { createNavigator } from './navigation/Navigator'
import ErrorBoundary from './utils/ErrorBoundary'
import { getCurrentUserAsync } from './api'

export default class App extends Component {
  state = {
    isLoading: true,
    Navigator: null
  }

  async componentDidMount() {
    const [_, user] = await Promise.all([
      this._loadResourcesAsync(),
      getCurrentUserAsync()
    ])
    const Navigator = createNavigator(user)
    this.setState({ isLoading: false, Navigator })
  }

  render() {
    if (this.state.isLoading) return <AppLoading />

    const { Navigator } = this.state
    return (
      <ErrorBoundary>
        <Navigator />
      </ErrorBoundary>
    )
  }

  _loadResourcesAsync = async () => {
    Promise.all([
      Font.loadAsync({
        Roboto: require('native-base/Fonts/Roboto.ttf'),
        Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf')
      })
    ])
  }
}
