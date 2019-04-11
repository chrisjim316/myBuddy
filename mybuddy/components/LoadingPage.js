import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Container, Spinner } from 'native-base'

import DEFAULT_COLORS from '../constants/Colors'

export default class LoadingPage extends Component {
  render() {
    return (
      <Container style={styles.container}>
        <Spinner color={DEFAULT_COLORS.secondaryColor} />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center'
  }
})
