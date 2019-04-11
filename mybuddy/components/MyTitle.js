import React, { Component } from 'react'
import { Title } from 'native-base'
import PropTypes from 'prop-types'

export default class MyTitle extends Component {
  render () {
    const { style, ...props } = this.props
    return (
      <Title
        {...props}
        style={[
          {
            fontSize: 25,
            marginTop: 10,
            marginBottom: 5,
            color: 'black'
          },
          style
        ]}
      >
        {this.props.children}
      </Title>
    )
  }
}

MyTitle.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.string, PropTypes.node)
  ]).isRequired,
  style: PropTypes.object
}
