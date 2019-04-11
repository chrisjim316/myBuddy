import React, { Component } from 'react'
import { View, Text, Button, Row, Item, Label, Input } from 'native-base'
import { StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'

import { db } from '../../firebase'

export default class ManagerPicker extends Component {
  state = {
    selectedManager: {},
    users: []
  }

  async componentDidMount() {
    await db
      .collection('users')
      .where('team', '==', null)
      .get()
      .then(querySnapshot =>
        querySnapshot.docs.forEach(doc =>
          this.setState(prevState => {
            const { displayName } = doc.data()
            return {
              users: [
                ...prevState.users,
                {
                  label: displayName,
                  value: { displayName, user: doc.id }
                }
              ]
            }
          })
        )
      )
  }

  _updateFormik = value => {
    const {
      field,
      form: { setFieldValue }
    } = this.props
    setFieldValue(field.name, value)
  }

  _selectManager = selectedManager => {
    this.setState({ selectedManager })
    this._updateFormik(selectedManager.user)
  }

  render() {
    const {
      field,
      form: { touched, errors },
      required
    } = this.props
    return (
      <View style={{ marginTop: 10 }}>
        <Row>
          <Row size={3}>
            <Item
              floatingLabel
              style={styles.item}
              error={Boolean(touched[field.name] && errors[field.name])}
            >
              <Label>Manager{`${required ? '*' : ''}`}</Label>
              <Input
                required
                disabled
                value={this.state.selectedManager.displayName}
              />
            </Item>
          </Row>
          <Row size={1}>
            <RNPickerSelect
              placeholder={{ label: 'Select a manager...', value: {} }}
              items={this.state.users}
              value={this.state.selectedManager}
              onValueChange={this._selectManager}
              ref={ps => (this.pickerSelectRef = ps)}
            >
              <Button full bordered>
                <Text>Select</Text>
              </Button>
            </RNPickerSelect>
          </Row>
        </Row>
        {touched[field.name] && errors[field.name] && (
          <Text style={[styles.item, { color: 'red' }]}>
            {errors[field.name]}
          </Text>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    alignSelf: 'center',
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 5
  }
})
