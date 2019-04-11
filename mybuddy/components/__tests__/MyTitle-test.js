import 'react-native'
import React from 'react'
import MyTitle from '../MyTitle'
import renderer from 'react-test-renderer'
import { Text } from 'native-base'

describe('My title rendering', () => {
  it('My title bar renders correctly', () => {
    expect(
      renderer
        .create(
          <MyTitle>
            <Text>test</Text>
          </MyTitle>
        )
        .toJSON()
    ).toMatchSnapshot()
  })
})
