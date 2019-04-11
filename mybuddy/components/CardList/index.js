import React, { Component } from 'react'
import { Card, CardItem, Text, Icon, Title } from 'native-base'
import PropTypes from 'prop-types'
import { StyleSheet } from 'react-native'
import Inflector from 'inflector-js'
import { withNavigation } from 'react-navigation'

import CustomCardItem from '../CardItem'
import {
  APPOINTMENTS_SCREEN,
  BUDDY_APPOINTMENTS_SCREEN,
  EMERGENCIES_SCREEN
} from '../../navigation/keys'

const styles = StyleSheet.create({
  card: { alignSelf: 'center', width: '95%' }
})

const toTitleCase = text =>
  Inflector.pluralize(text)
    .toLowerCase()
    .split('-')
    .map(word => Inflector.capitalize(word))
    .join(' ')

class CustomCardList extends Component {
  state = {
    showList: false
  }

  _toggleList = () => {
    this.setState(({ showList }) => ({
      showList: !showList
    }))
  }

  _navigateTo = () => {
    switch (this.props.type) {
      case 'appointment':
        return APPOINTMENTS_SCREEN
      case 'buddy-appointment':
        return BUDDY_APPOINTMENTS_SCREEN
      case 'emergency':
        return EMERGENCIES_SCREEN
      default:
        return ''
    }
  }

  render() {
    const { type, ...props } = this.props
    return (
      <Card style={styles.card}>
        <CardItem header bordered button onPress={this._toggleList}>
          <Icon type="MaterialCommunityIcons" name="calendar" />
          <Text style={{ flex: 1 }}>{toTitleCase(type)}</Text>
          <Icon
            type="MaterialCommunityIcons"
            name={this.state.showList ? 'chevron-up' : 'chevron-down'}
            style={{ fontSize: 30 }}
          />
        </CardItem>
        {this.state.showList && (
          <CardItem
            bordered
            button
            onPress={() => this.props.navigation.navigate(this._navigateTo())}
          >
            <Title style={{ flex: 1, alignSelf: 'center', fontSize: 12 }}>
              View More
            </Title>
          </CardItem>
        )}
        {this.state.showList &&
          this.props.data.map((datum, i) => (
            <CustomCardItem key={i} type={type} {...props} {...datum} />
          ))}
      </Card>
    )
  }
}

CustomCardList.propTypes = {
  data: PropTypes.array.isRequired
}

export default withNavigation(CustomCardList)
