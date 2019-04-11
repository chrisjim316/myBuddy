import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FuzzySearch from 'fuzzy-search'
import { SearchBar as SearchBox } from 'react-native-elements'

import DEFAULT_COLORS from '../constants/Colors'

/**
 * Represents the search bar that can be used throughout the application.
 * The fuzzy search algorithm is used on the data and the result is returned.
 */
export default class Search extends Component {
  state = {
    searchText: ''
  }

  /**
   * Updates the search to search for the text inside the search bar.
   * The text is formatted by removing whitespace and ensuring the appropriate split is used.
   */
  updateSearch = searchText => {
    this.setState({ searchText })
    const results = new FuzzySearch(this.props.data, this.props.properties, {
      sort: true
    }).search(
      searchText
        .trim()
        .split('/[ .,/-]/')
        .join('')
    )
    this.props.onSearch(results)
  }

  render() {
    return (
      <SearchBox
        ref="search-bar"
        placeholder={this.props.placeholder || 'search'}
        onChangeText={this.updateSearch}
        value={this.state.searchText}
        containerStyle={{
          backgroundColor: DEFAULT_COLORS.secondaryColor,
          borderTopColor: DEFAULT_COLORS.primaryColor,
          borderBottomColor: 'white',
          marginTop: -1,
          backfaceVisibility: 'hidden',
          height: 50
        }}
        inputContainerStyle={{
          marginTop: -2,
          backgroundColor: 'white',
          height: 35
        }}
      />
    )
  }
}

Search.proptypes = {
  data: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  properties: PropTypes.array.isRequired
}
