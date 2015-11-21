import React, { PropTypes, Component } from 'react';
import { Router, Route } from 'react-router';

import App from './App';
import SettingsPage from './pages/SettingsPage'

import GamePage from './pages/GamePage';
import Game325 from './games/Game325';

export default class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }

  render() {
    const { history } = this.props;
    return (
      <Router history={history}>
        <Route name='explore' path='/' component={App} title="Game"></Route>
        <Route name='settings' path='/settings' component={SettingsPage} />
        <Route name='games' path='/games' component={GamePage} />
        <Route name='game325' path='/game325/(:id)' component={Game325} />
      </Router>
    );
  }
}
