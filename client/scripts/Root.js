import React, { PropTypes, Component } from 'react';
import { Router, Route } from 'react-router';

import App from './App';
import SettingsPage from './pages/SettingsPage'

import GamePage from './pages/GamePage';
import Game325 from './games/Game325';
import GameInterface from './games/GameInterface';

export default class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  render() {
    const { history } = this.props;
    return (
      // GameInterface should check which options are selected and load appropriate Game.
      // For now, hard-coded for SattiCentre
      <Router history={history}>
        <Route name='explore' path='/' component={App} title="Game"></Route>
        <Route name='settings' path='/settings' component={SettingsPage} />
        <Route name='games' path='/games' component={GamePage} />
        <Route name='game7' path='/game7local' component={GameInterface} /> 
        <Route name='game325' path='/game325/(:id)' component={Game325} />
      </Router>
    );
  }
}
