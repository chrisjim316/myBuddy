import { createDrawerNavigator } from 'react-navigation'
import withHeader from './withHeader'

const _withHeaders = RouteConfigs =>
  Object.entries(RouteConfigs).reduce(
    (obj, [routeName, screen]) => ({
      ...obj,
      [routeName]: withHeader(screen, routeName)
    }),
    {}
  )

export const createDrawerNavigatorWithHeader = (
  RouteConfigs,
  DrawerNavigatorConfig = {}
) => createDrawerNavigator(_withHeaders(RouteConfigs), DrawerNavigatorConfig)
