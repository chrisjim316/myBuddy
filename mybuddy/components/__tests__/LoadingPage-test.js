import 'react-native';
import React from 'react';
import LoadingPage from '../LoadingPage';
import renderer from 'react-test-renderer';

describe('Loading page rendering', () => {
    it('loading page renders correctly', () => {
      expect(renderer.create(<LoadingPage />).toJSON()).toMatchSnapshot()
    })
  });