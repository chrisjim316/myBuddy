import React, { Component } from 'react'
import { Container, Content, Text, Button, View } from 'native-base'
import { StyleSheet } from 'react-native'
import { withFormik, Field } from 'formik'
import * as yup from 'yup'

import MyTitle from '../../../components/MyTitle'
import FormInput from '../../../components/Form/FormInput'
import { db } from '../../../firebase'
import ManagerPicker from '../../../components/Form/ManagerPicker'

class EditTeam extends Component {
  render () {
    return (
      <Container>
        <Button full warning onPress={() => this.props.navigation.goBack()}>
          <Text>Cancel</Text>
        </Button>
        <Content>
          <MyTitle>Edit Team</MyTitle>
          <View style={styles.form}>
            <Field name='name' required component={FormInput} />
            <Field name='manager' component={ManagerPicker} />
          </View>
          <View style={styles.buttons}>
            <Button success onPress={this.props.handleSubmit}>
              <Text>Update</Text>
            </Button>
          </View>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  form: {
    paddingTop: 10,
    paddingBottom: 10
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 20
  }
})

export default withFormik({
  mapPropsToValues: props => {
    const team = props.navigation.getParam('team') || {}
    return {
      name: team.name || '',
      manager: team.manager || ''
    }
  },
  handleSubmit: async (values, { setSubmitting }) => {
    const team = this.props.navigation.getParam('team')
    if (team.manager.id === values.manager.id) {
      // If the Manager has not been updated
      db.collection('teams')
        .doc(team.id)
        .set({
          name: values.name
        })
    } else {
      // If the Manager has been updated
      // Update Access of Previous Manager
      db.collection('users')
        .doc(team.manager.id)
        .set({
          access: 'clinician',
          team: null
        })
      // Add new manager to the team and update that user's access
      await db
        .collection('teams')
        .doc(team.id)
        .set({
          name: values.name,
          manager: db.doc('users/' + values.manager.id)
        })
        .then(docRef => {
          db.collection('users')
            .doc(values.manager.id)
            .update({
              team: db.doc('teams/' + docRef.id),
              accessLevel: 'manager'
            })
        })
    }
    props.navigation.goBack()
  },
  validationSchema: yup.object({
    name: yup
      .string()
      .max(15)
      .required(),
    manager: yup.string().required('you must select a manager')
  })
})(EditTeam)
