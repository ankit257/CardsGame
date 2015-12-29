import React, { PropTypes, Component } from 'react';
import { Route, RouteHandler, Router } from 'react-router';

import App from './App';
import SettingsPage from './pages/SettingsPage';
import AuthHandler from './pages/AuthHandler';

import GamePage from './pages/GamePage';
import GamePageMulti from './pages/GamePageMulti';
import Game325 from './games/Game325';
import GameInterface from './games/GameInterface';

export default class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  }
  static childContextTypes = {
    showLoader: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.func
  }
  getChildContext() {
    return { 
        showLoader : function(bool){
            if(bool){
              document.getElementById('loader-div').style.display = 'block';
            }else{
              document.getElementById('loader-div').style.display = 'none';
            }
          }
      }
  }
  render() {
    const { history } = this.props;
    return (
      // GameInterface should check which options are selected and load appropriate Game.
      // For now, hard-coded for SattiCentre
      <Router history={history}>
        <Route name='explore' path='/' component={App} title="Game"></Route>
        <Route name='auth' path='/' component={AuthHandler}>
          <Route name='settings' path='/settings' component={SettingsPage} />
          <Route name='games' path='/games' component={GamePage} />
          <Route name='gamesmulti' path='/gamesmulti' component={GamePageMulti} />
          <Route name='game7' path='/game7' component={GameInterface}/> 
          <Route name='game7multi' path='/game7/(:id)' component={GameInterface} />
          <Route name='game325' path='/game325(/)(:id)' component={Game325} />
        </Route>
      </Router>
    );
  }
}
