import React, { Component } from 'react'
import { View, Title, Text, Button, Row, Item, Label, Input } from 'native-base'
import { StyleSheet } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'

import { db } from '../../firebase'
import { getCurrentUserAsync } from '../../api'

export default class BuddyPicker extends Component {
  state = {
    currentBuddy: {},
    selectedBuddy: {},
    team: []
  }

  async componentDidMount() {
    const {
      field,
      form: { values }
    } = this.props

    const currentBuddy = values[field.name]
    this.setState({
      currentBuddy,
      selectedBuddy: currentBuddy
    })

    const user = await getCurrentUserAsync()

    await db
      .collection('users')
      // all users in the current users team
      .where('team', '==', user.team)
      .get()
      .then(querySnapshot =>
        querySnapshot.docs
          // remove the current user from results
          .filter(doc => doc.id !== user.uid)
          // all each user the list in state
          .forEach(doc =>
            this.setState(prevState => {
              const { displayName } = doc.data()
              // user object of shape {label: ..., value: ...}
              return {
                team: [
                  ...prevState.team,
                  {
                    label: displayName,
                    value:
                      currentBuddy.user === doc.id
                        ? currentBuddy
                        : { user: doc.id, status: 'pending' }
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

  _selectBuddy = selectedBuddy => {
    this.setState({ selectedBuddy })
    this._updateFormik(selectedBuddy)
  }

  _resetBuddy = () => {
    this.setState({ selectedBuddy: this.state.currentBuddy })
    this._updateFormik(this.state.currentBuddy)
  }

  render() {
    const {
      field,
      form: { touched, errors }
    } = this.props
    return (
      <View style={{ marginTop: 10 }}>
        <Title>Buddy</Title>
        <Row>
          <Row size={3}>{this._renderField('label', 'Name')}</Row>
          <Row size={1}>
            <RNPickerSelect
              placeholder={{ label: 'Select a buddy...', value: {} }}
              items={this.state.team}
              value={this.state.selectedBuddy}
              onValueChange={this._selectBuddy}
              ref={ps => (this.pickerSelectRef = ps)}
            >
              <Button full bordered>
                <Text>Change</Text>
              </Button>
            </RNPickerSelect>
          </Row>
        </Row>
        <Row>
          <Row size={3}>{this._renderField('value.status', 'Status')}</Row>
          <Row size={1}>
            <Button
              full
              bordered
              warning
              onPress={this._resetBuddy}
              style={{ flex: 1, marginRight: 20 }}
            >
              <Text>Reset</Text>
            </Button>
          </Row>
        </Row>
        {touched[field.name] && errors[field.name] && (
          <Text style={[styles.item, { color: 'red' }]}>
            {errors[field.name]}
          </Text>
        )}
        {this._renderWarningText()}
      </View>
    )
  }

  _renderField = (fieldName, label) => {
    const buddy =
      this.state.team.find(
        item => item.value.user === this.state.selectedBuddy.user
      ) || {}
    let displayValue
    if (fieldName === 'label') {
      displayValue = buddy.label
    } else if (fieldName === 'value.status') {
      displayValue = buddy.value ? buddy.value.status : null
    }
    return (
      <>
        <Item floatingLabel style={styles.item}>
          <Label>{label}</Label>
          <Input disabled value={displayValue} />
        </Item>
      </>
    )
  }

  _renderWarningText = () => {
    const { currentBuddy, selectedBuddy } = this.state
    if (
      currentBuddy.status === 'confirmed' &&
      currentBuddy.user !== selectedBuddy.user
    ) {
      return (
        <Text
          style={{
            alignSelf: 'center',
            textAlign: 'center',
            width: '90%',
            color: 'red'
          }}
        >
          Warning: you are about to cancel a confirmed buddy, press reset if you
          do not intend to do this.
        </Text>
      )
    }
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
