import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Text, CardItem, Icon, Title, Row, Col } from 'native-base'
import PropTypes from 'prop-types'
import moment from 'moment'

export default class AppointmentInfo extends Component {
  state = {
    style: {},
    showDescription: false
  }

  componentDidMount() {
    this.setState({
      style: { backgroundColor: this.props.backgroundColor || 'white' }
    })
  }

  _toggleDescription = () => {
    this.setState(({ showDescription }) => ({
      showDescription: !showDescription
    }))
  }

  render() {
    return (
      <>
        {this._renderHeader()}
        <CardItem style={this.state.style}>
          <Col>
            {/* Location & Date */}
            <Row style={{ paddingBottom: 5 }}>
              <Row style={styles.center}>
                <Icon
                  type="MaterialIcons"
                  name="location-on"
                  style={{ fontSize: 20 }}
                />
                <Text style={{ flex: 1 }}>{this.props.address}</Text>
              </Row>
              <Row style={styles.center}>{this.props.info}</Row>
            </Row>

            {/* Time */}
            <Row>
              <Row style={styles.center}>
                <Icon
                  type="MaterialCommunityIcons"
                  name="calendar"
                  style={{ fontSize: 20 }}
                />
                <Text>
                  {moment(this.props.startDateTime).format('MMM DD, YYYY')}
                </Text>
              </Row>
              <Row style={{ paddingLeft: 5, paddingTop: 10, paddingBottom: 5 }}>
                <Icon
                  type="MaterialCommunityIcons"
                  name="clock"
                  style={{ fontSize: 20 }}
                />
                <Text>
                  {moment(this.props.startDateTime).format('HH:mm')} -{' '}
                  {moment(this.props.endDateTime).format('HH:mm')}
                </Text>
              </Row>
            </Row>
          </Col>
        </CardItem>
        {this.props.buttonsComponent}
        {this._renderDescription()}
      </>
    )
  }

  _renderHeader = () => {
    if (!this.props.header) return null

    if (this.props.renderHeader) {
      // renderProp function
      return this.props.renderHeader({ ...this.props })
    }

    if (this.props.isCard) {
      return (
        <CardItem
          button
          onPress={this._toggleDescription}
        >
          <Text style={{ fontWeight: 'bold', flex: 1 }}>
            {this.props.title}
          </Text>
          <Icon
            type="MaterialCommunityIcons"
            name={this.state.showDescription ? 'chevron-up' : 'chevron-down'}
            style={{ fontSize: 30 }}
          />
        </CardItem>
      )
    }

    return (
      <CardItem style={this.state.style}>
        <Title>{this.props.title}</Title>
      </CardItem>
    )
  }

  _renderDescription = () => {
    return (
      this.state.showDescription && (
        <Text
          style={[
            {
              padding: 10,
              fontStyle: 'italic'
            },
            this.state.style
          ]}
        >
          {this.props.description || 'no details provided'}
        </Text>
      )
    )
  }
}

AppointmentInfo.propTypes = {
  // Data
  title: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  startDateTime: PropTypes.object.isRequired,
  endDateTime: PropTypes.object.isRequired,
  // Properties
  buddy: PropTypes.any.isRequired,
  header: PropTypes.bool,
  isCard: PropTypes.bool,
  renderHeader: PropTypes.func,
  buttonsComponent: PropTypes.node,
  backgroundColor: PropTypes.string
}

AppointmentInfo.defaultProps = {
  header: true,
  isCard: false
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  }
})
