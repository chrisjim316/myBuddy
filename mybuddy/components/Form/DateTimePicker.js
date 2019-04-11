import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Button, Text, View } from 'native-base'
import DateTime from 'react-native-modal-datetime-picker'
import moment from 'moment'

export default class DateTimePicker extends Component {
  state = {
    startDateTime: moment(),
    isDatePickerVisible: false,
    isTimePickerVisible: false
  }

  componentDidMount() {
    const {
      field,
      form: { values }
    } = this.props
    const startDateTime = values[field.name]
    if (startDateTime) {
      this.setState({ startDateTime: moment(startDateTime) })
    }
  }

  _togglePicker = DateOrTime => () => {
    this.setState(prevState => ({
      [`is${DateOrTime}PickerVisible`]: !prevState[
        `is${DateOrTime}PickerVisible`
      ]
    }))
  }

  _handleDatePicked = dateJs => {
    const date = moment(dateJs)
    this.setState(
      ({ startDateTime }) => ({
        startDateTime: startDateTime
          .year(date.year())
          .month(date.month())
          .date(date.date())
      }),
      () => this._updateFormik()
    )

    this._togglePicker('Date')()
  }

  _handleTimePicked = timeJs => {
    const time = moment(timeJs)
    this.setState(
      ({ startDateTime }) => ({
        startDateTime: startDateTime.hour(time.hour()).minute(time.minute())
      }),
      () => this._updateFormik()
    )

    this._togglePicker('Time')()
  }

  _updateFormik = () => {
    const {
      field,
      form: { setFieldValue }
    } = this.props
    setFieldValue(field.name, this.state.startDateTime.toDate())
  }

  _getDate = () => {
    return this.state.startDateTime.format('MMM DD, YYYY')
  }

  _getTime = () => {
    return this.state.startDateTime.format('HH:mm')
  }

  render() {
    return (
      <View style={styles.container}>
        {/* Date Picker */}
        <Button
          bordered
          full
          style={styles.item}
          onPress={this._togglePicker('Date')}
        >
          <Text>{this._getDate()}</Text>
        </Button>
        <DateTime
          isVisible={this.state.isDatePickerVisible}
          date={this.state.startDateTime.toDate()}
          mode="date"
          onCancel={this._togglePicker('Date')}
          onConfirm={this._handleDatePicked}
          minimumDate={new Date()}
        />
        {/* Time Picker */}
        <Button
          bordered
          full
          style={[styles.item, { marginLeft: 10 }]}
          onPress={this._togglePicker('Time')}
        >
          <Text>{this._getTime()}</Text>
        </Button>
        <DateTime
          isVisible={this.state.isTimePickerVisible}
          date={this.state.startDateTime.toDate()}
          titleIOS="Pick a time"
          mode="time"
          onCancel={this._togglePicker('Time')}
          onConfirm={this._handleTimePicked}
          minimumDate={new Date()}
          minuteInterval={5}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  item: {
    width: '45%',
    justifyContent: 'center'
  }
})
