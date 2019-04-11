import React, { Component } from 'react'
import { Container, Content, Text, Button, View } from 'native-base'
import { StyleSheet, Alert } from 'react-native'
import { withFormik, Field } from 'formik'
import * as yup from 'yup'
import moment from 'moment'

import firebase, { db } from '../../firebase'

import MyTitle from '../../components/MyTitle'
import FormInput from '../../components/Form/FormInput'
import DateTimePicker from '../../components/Form/DateTimePicker'
import BuddyPicker from '../../components/Form/BuddyPicker'

class AppointmentScreen extends Component {
  _handleCancel = () => {
    // Go back to the previous screen if user cancels
    this.props.navigation.goBack()
  }

  _handleDelete = () => {
    // Set up a confirmation popup
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        {
          text: 'OK',
          onPress: async () => {
            try {
              this.props.setSubmitting(true)
              await this.props.values.appointmentRef.delete()
              this.props.navigation.goBack()
            } catch (error) {
              console.warn(error)
              this.props.setFieldError(
                'root',
                'Unable to complete your request.'
              )
              this.props.setSubmitting(false)
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    )
  }

  render() {
    const { errors } = this.props
    return (
      <Container>
        <Button
          full
          warning
          onPress={this._handleCancel}
          disabled={this.props.isSubmitting}
        >
          <Text>Cancel</Text>
        </Button>
        <Content>
          {this._renderTitle()}
          {errors['root'] && (
            <Text style={{ color: 'red', alignSelf: 'center', paddingTop: 5 }}>
              {errors['root']}
            </Text>
          )}
          {this._renderForm()}
          {this._renderButtons()}
        </Content>
      </Container>
    )
  }

  _renderTitle = () => {
    // Update title if appointment is created, otherwise set it to create appointment
    const isUpdate = Boolean(this.props.navigation.getParam('appointment'))
    return isUpdate ? (
      <MyTitle>Update Appointment</MyTitle>
    ) : (
      <MyTitle>Create Appointment</MyTitle>
    )
  }

  _renderForm = () => (
    <>
      <Field name="title" required component={FormInput} />
      <Field name="description" component={FormInput} />
      <Field name="address" required component={FormInput} />
      <Field name="startDateTime" component={DateTimePicker} />
      <Field
        label="Duration (minutes)"
        name="minutes"
        required
        keyboardType="numeric"
        component={FormInput}
      />
      <Field name="buddy" component={BuddyPicker} />
    </>
  )

  _renderButtons = () => {
    // isUpdate checks if the appointment has been created
    const isUpdate = Boolean(this.props.navigation.getParam('appointment'))
    return (
      <View style={styles.buttons}>
        {isUpdate ? (
          <>
            <Button
              success
              onPress={this.props.handleSubmit}
              disabled={this.props.isSubmitting}
            >
              <Text>Update</Text>
            </Button>
            <Button
              danger
              onPress={this._handleDelete}
              disabled={this.props.isSubmitting}
            >
              <Text>Delete</Text>
            </Button>
          </>
        ) : (
          <Button
            success
            onPress={this.props.handleSubmit}
            disabled={this.props.isSubmitting}
          >
            <Text>Save</Text>
          </Button>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 20
  }
})

export default withFormik({
  mapPropsToValues: props => {
    const appointment = props.navigation.getParam('appointment') || {}
    // Populate the appointment items
    return {
      title: appointment.title || '',
      description: appointment.description || '',
      address: appointment.address || '',
      startDateTime: appointment.startDateTime || new Date(),
      minutes:
        appointment.startDateTime && appointment.endDateTime
          ? moment(appointment.endDateTime).diff(
              appointment.startDateTime,
              'minutes'
            )
          : 0,
      user: db.collection('users').doc(firebase.auth().currentUser.uid),
      status: appointment.status || 'pending',
      buddy: { status: 'n/a', user: null, ...appointment.buddy },
      appointmentRef: appointment.id
        ? db.collection('appointments').doc(appointment.id)
        : db.collection('appointments').doc()
    }
  },
  // Send the form data to db
  handleSubmit: async (values, { props, setSubmitting, setFieldError }) => {
    const { appointmentRef, minutes, ...appointment } = values

    const endDateTime = moment(appointment.startDateTime)
      .add(minutes, 'minutes')
      .toDate()

    try {
      const buddyUser = appointment.buddy.user
        ? await db
            .collection('users')
            .doc(appointment.buddy.user)
            .get()
            .then(doc => doc.ref)
        : null

      const finalAppointment = {
        ...appointment,
        endDateTime,
        buddy: { ...appointment.buddy, user: buddyUser }
      }

      await appointmentRef.set(finalAppointment)
      props.navigation.goBack()
    } catch (error) {
      console.warn(error)
      setFieldError('root', 'Unable to complete your request.')
      setSubmitting(false)
    }
  },
  // Enforce appointment input types
  validationSchema: yup.object({
    title: yup
      .string()
      .max(25)
      .required(),
    description: yup.string().max(50),
    address: yup
      .string()
      .max(50)
      .required(),
    startDateTime: yup.date().required(),
    minutes: yup
      .number()
      .min(15)
      .max(1440)
      .required('duration is a required field')
      .integer()
  })
})(AppointmentScreen)
