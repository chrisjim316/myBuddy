import React, { Component } from 'react'
import { FlatList } from 'react-native'
import { Content } from 'native-base'
import { ListItem } from 'react-native-elements'
import _ from 'lodash'

export class UserTab extends Component {
  renderItem = ({ item }) => (
    <ListItem
      key={item.key}
      title={item.displayName}
      subtitle={item.email + ', ' + item.teamName}
    />
  )

  render() {
    return (
      <Content>
        <FlatList
          data={this.props.data}
          keyExtractor={user => user.key}
          renderItem={this.renderItem}
        />
      </Content>
    )
  }
}
