import React, { Component } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { View, Text } from 'native-base'
import PropTypes from 'prop-types'
import RNPickerSelect from 'react-native-picker-select'

export default class Dropdown extends Component {
  constructor(props) {
    super(props)
    this._normalizeItems = this._normalizeItems.bind(this)
    this.items = null
  }
  /**
   * items are the dropdown selections
   * format: {label: 'Orange', value: 'orange', key: 'orange', color: 'orange'}
   * label and value are required, key and color are optional
   * value can be any data type
   * must have at least one item, cannot be empty
   */
  static propTypes = {
    style: PropTypes.object,
    placeholderText: PropTypes.string, // placeholder={{label: 'Select a color...',value: null}}
    dropdownTitle: PropTypes.string,
    onValueChange: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired, // [{label: 'Orange', value: 'orange'},...]
    value: PropTypes.any
  }

  componentWillMount = async () => {
    console.log(`Normalizing array items input: ${JSON.stringify(this.props.items)}`)
    await this._normalizeItems()
    console.log(`Items normalized: ${JSON.stringify(this.items)}`)
  }

  _normalizeItems = () => {
    this.items = this.props.items.map((item) => {
      return {
        label: item,
        value: item
      }
    })
  }

  render() {
    return (
      <View style={[this.props.style, { flex: 1 }]}>
        <Text
          style={{
            alignItems: 'stretch',
            paddingLeft: 10,
            paddingBottom: 10,
            paddingTop: 30,
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {this.props.dropdownTitle}
        </Text>
        <RNPickerSelect
          style={
            Platform.OS === 'ios'
              ? { ...pickerSelectStyles, ...styles.defaultStyles }
              : styles.defaultStyles
          }
          onValueChange={this.props.onValueChange}
          items={this.items}
          placeholder={{ label: this.props.placeholderText, value: null }}
          value={this.props.value}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  defaultStyles: {
    marginLeft: 30,
    marginRight: 30,
    width: '100%'
  }
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    marginLeft: 30,
    marginRight: 30,
    fontSize: 12,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gainsboro',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black'
  }
})
