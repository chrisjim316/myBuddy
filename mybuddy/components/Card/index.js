import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Card } from 'native-base'
import PropTypes from 'prop-types'

import CardItem from '../CardItem'

const styles = StyleSheet.create({
  card: { alignSelf: 'center', width: '95%' }
})

export default class CustomCard extends Component {
  render() {
    if (this.props.children) {
      return <Card style={styles.card}>{this.props.children}</Card>
    }

    return (
      <Card style={styles.card}>
        <CardItem isCard {...this.props} />
      </Card>
    )
  }
}

CustomCard.propTypes = {
  children: PropTypes.node
}
