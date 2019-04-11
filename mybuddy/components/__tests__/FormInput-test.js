import 'react-native'
import React from 'react'
import FormInput from '../Form/FormInput'
import renderer from 'react-test-renderer'

const props = (value, touched, error) => ({
  field: {
    name: 'test'
  },
  form: {
    values: {
      test: value
    },
    touched: {
      test: touched
    },
    errors: {
      test: error
    }
  }
});

describe('DateTimePicker snapshot', () => {
  jest.useFakeTimers()
  Date.now = jest.fn(() => 1503187200000)
  it('form input renders without errors', async () => {
    const tree = renderer
      .create(<FormInput {...props(null, false, false)} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})

  describe('Form input renders with errors', () => {
    jest.useFakeTimers()
    Date.now = jest.fn(() => 1503187200000)
    it('form input renders with errors', async () => {
      const tree = renderer
        .create(<FormInput {...props(null, true, true)} />)
        .toJSON()
      expect(tree).toMatchSnapshot()
    })
  })
