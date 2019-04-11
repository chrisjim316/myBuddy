import React from 'react'
import { StyleSheet } from 'react-native'
import { Header, Left, Body, Right, Button, Icon, Title } from 'native-base'
import { createStackNavigator } from 'react-navigation'
import PropTypes from 'prop-types'

import DEFAULT_COLORS from '../../constants/Colors'

// https://github.com/react-navigation/react-navigation/issues/1886#issuecomment-311665040
const HeaderBar = ({ navigation, scene }) => {
  const { rightComponent } = scene.descriptor.options
  return (
    <Header
      style={styles.header}
      iosBarStyle="light-content"
      androidStatusBarColor="white"
    >
      <Left>
        <Button transparent onPress={navigation.openDrawer}>
          <Icon name="menu" style={styles.headerItem} />
        </Button>
      </Left>
      <Body>
        <Title
          style={[
            {
              fontSize: 22,
              width: '200%'
            },
            styles.headerItem
          ]}
        >
          {navigation.state.key.toUpperCase()}
        </Title>
      </Body>
      <Right>{rightComponent}</Right>
    </Header>
  )
}

HeaderBar.propTypes = {
  navigation: PropTypes.shape({
    openDrawer: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
    toggleDrawer: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    state: PropTypes.object.isRequired
  }).isRequired
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: DEFAULT_COLORS.primaryColor,
    paddingBottom: 10
  },
  headerItem: {
    color: 'white'
  }
})

export default (screen, routeName) => {
  screen.navigationOptions = { ...screen.navigationOptions, header: HeaderBar }
  return createStackNavigator(
    { [routeName]: screen },
    {
      headerMode: 'screen',
      navigationOptions: {
        gesturesEnabled: false
      }
    }
  )
}
