import 'react-native';
import React from 'react';
import SearchBar from '../SearchBar';
import renderer from 'react-test-renderer';

  /**
   * Returns a search bar component.
   * If getInstance is true, will return an instance of the component else a JSON of it.
   * @param getInstance - If we want an instance of the search bar or not.
   */
  let getSearchBar = function(getInstance) {
    if (getInstance) 
        return renderer.create(<SearchBar />).getInstance()
    else 
        return renderer.create(<SearchBar />).toJSON()
  }

  //The search bar as JSON
  var searchBarAsJSON = getSearchBar(false)

  //The search bar instance
  var searchBarInstance = getSearchBar(true)

  describe('Search bar rendering', () => {
    it('search bar renders correctly', () => {
      expect(searchBarAsJSON).toMatchSnapshot()
    })
  });

  describe('Search bar text field', () => {
    it('search bar starts with no search text', () => {
      expect(searchBarInstance.state.searchText).toEqual('')
    })
    it('Set search text to a value', () => {
      searchBarInstance.setState({searchText: 'Man utd'})
      expect(searchBarInstance.state.searchText).toEqual('Man utd')
    })
  })