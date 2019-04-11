import React, { Component } from 'react'
import { View } from 'react-native'
import { Agenda } from 'react-native-calendars'
import moment from 'moment'

import { appointmentsBetweenDatesOnSnapshot } from '../../../api'
import Card from '../../../components/Card'

export default class CalendarScreen extends Component {
  state = {
    items: {}
  }

  subscriptions = []

  componentWillUnmount() {
    this.subscriptions.forEach(unsubscribe => unsubscribe())
  }

  _loadItems = async day => {
    if (this.state.items.hasOwnProperty(day.dateString)) return

    // Extract a specific month
    const startOfMonth = moment(day.dateString).startOf('month')
    const endOfMonth = moment(day.dateString).endOf('month')

    const unsubscribe = await appointmentsBetweenDatesOnSnapshot(
      startOfMonth.toDate(),
      endOfMonth.toDate()
    )(appointments => {
      let items = {}

      // create object of arrays for every date in month
      for (
        let m = moment(startOfMonth);
        m.isSameOrBefore(endOfMonth);
        m.add(1, 'days')
      ) {
        items[m.format('YYYY-MM-DD')] = []
      }

      // add appointments array on each date
      appointments.forEach(appointment => {
        // Normalize the appointments' times fetched from the database
        const dateString = moment(appointment.startDateTime).format(
          'YYYY-MM-DD'
        )
        // Merge it with existing calendar items
        items = {
          ...items,
          [dateString]: [...items[dateString], appointment]
        }
      })

      this.setState(prevState => ({ items: { ...prevState.items, ...items } }))
    })

    this.subscriptions.push(unsubscribe)
  }

  _rowHasChanged = (r1, r2) => {
    // Detect if a specific row has changed
    return r1 !== r2
  }

  render() {
    return (
      <Agenda
        ref={c => (this.calendar = c)}
        items={this.state.items}
        loadItemsForMonth={this._loadItems}
        renderItem={this._renderItem}
        renderEmptyDate={this._renderEmptyDate}
        rowHasChanged={this._rowHasChanged}
      />
    )
  }

  _renderItem = item => {
    return <Card type="appointment" canEdit {...item} />
  }

  _renderEmptyDate = () => (
    // Render an empty date to fill up the days with no agenda
    <View
      style={{
        borderBottomColor: 'gainsboro',
        borderBottomWidth: 1
      }}
    />
  )
}
