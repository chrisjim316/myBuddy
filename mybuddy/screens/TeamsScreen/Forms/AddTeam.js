import React, { Component } from 'react'
import { Container, Content, Text, Button } from 'native-base'
import { StyleSheet } from 'react-native'
import { withFormik, Field } from 'formik'
import * as yup from 'yup'

import { db } from '../../../firebase'
import MyTitle from '../../../components/MyTitle'
import FormInput from '../../../components/Form/FormInput'
import ManagerPicker from '../../../components/Form/ManagerPicker'

class AddTeam extends Component {
  render() {
    return (
      <Container>
        <Button
          full
          warning
          onPress={() => this.props.navigation.goBack()}
          disabled={this.props.isSubmitting}
        >
          <Text>Cancel</Text>
        </Button>
        <Content>
          <MyTitle>Add New Team</MyTitle>
          <Field name="name" required component={FormInput} />
          <Field name="manager" required component={ManagerPicker} />
          <Button
            success
            style={{ paddingTop: 10, alignSelf: 'center' }}
            onPress={this.props.handleSubmit}
            disabled={this.props.isSubmitting}
          >
            <Text>Create Team</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export default withFormik({
  mapPropsToValues: () => {
    return {
      name: '',
      manager: ''
    }
  },
  handleSubmit: async (values, { props, setSubmitting }) => {
    console.log(values)

    try {
      const team = await db.collection('teams').add({
        name: values.name,
        manager: db.collection('users').doc(values.manager)
      })
      await db
        .collection('users')
        .doc(values.manager)
        .update({
          team,
          accessLevel: 'manager'
        })
      props.navigation.goBack()
    } catch (error) {
      console.warn(error)
      setFieldError('root', 'Unable to complete your request.')
      setSubmitting(false)
    }
  },
  validationSchema: yup.object({
    name: yup
      .string()
      .max(15)
      .required(),
    manager: yup.string().required('you must select a manager')
  })
})(AddTeam)
