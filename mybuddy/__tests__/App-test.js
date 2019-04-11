import 'react-native';
import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';

  describe('App snapshot', () => {
    it('renders the loading screen', async () => {
      const appSnapshot = renderer.create(<App />).toJSON();
      expect(appSnapshot).toMatchSnapshot();
    });
  });

  describe('Skips loading screen', () => {
    it('renders the root without loading screen', async () => {
      const appSkipLoadingScreen = renderer.create(<App skipLoadingScreen />).toJSON();
      expect(appSkipLoadingScreen).toMatchSnapshot();
    });
  })
