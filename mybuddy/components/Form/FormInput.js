import React, { Component } from 'react'
import { Item, Label, Input, Text } from 'native-base'
import { StyleSheet } from 'react-native'

const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default class FormInput extends Component {
  _updateFormik = value => {
    const {
      field,
      form: { setFieldValue }
    } = this.props

    try {
      if (this.props.keyboardType === 'numeric') {
        const number = Number(value)
        if (number || !value) {
          setFieldValue(field.name, number || '')
        }
      } else {
        setFieldValue(field.name, value)
      }
    } catch (error) {}
  }

  render() {
    const {
      field, // { name, value, onChange, onBlur }
      form: { touched, errors, values }, // touched, errors, setXXXX, handleXXXX, dirty, isValid, status, etc.
      required,
      ...props
    } = this.props
    return (
      <>
        <Item
          floatingLabel
          style={styles.item}
          error={Boolean(touched[field.name] && errors[field.name])}
        >
          <Label>
            {`${props.label || capitalize(field.name)}${required ? '*' : ''}`}
          </Label>
          <Input
            value={props.value || String(values[field.name])}
            onChangeText={this._updateFormik}
            {...props}
          />
        </Item>
        {touched[field.name] && errors[field.name] && (
          <Text style={[styles.item, { color: 'red' }]}>
            {errors[field.name]}
          </Text>
        )}
      </>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    alignSelf: 'center',
    width: '90%',
    marginTop: 10
  }
})
