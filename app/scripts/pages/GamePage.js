import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom'
// import createFragment from 'react-addons-create-fragment';
import AuthStore from '../stores/AuthStore';
import GameRoomStore from '../stores/GameRoomStore';
import SettingsStore from '../stores/SettingsStore';
import ScoresStore from '../stores/ScoresStore';
import DocumentTitle from 'react-document-title';
import * as LoginActions from '../actions/LoginActions';
import * as GameRoomActions from '../actions/GameRoomActions';
import connectToStores from '../utils/connectToStores';
import _ from 'underscore';
import classNames from 'classnames/dedupe';
import selectn from 'selectn';
import NavBarComponent from '../components/NavBarComponent'
import RoomTypeSelector from '../components/RoomTypeSelector'
import { Howler } from "howler"

var Style={
  fontColor : '#bebebe'
}
/**
 * Retrieves state from stores for current props.
 */
function getState(props) {
  const User = AuthStore.get();
  const gameRoom = GameRoomStore.get();
  const gameRooms = GameRoomStore.getRooms();
  const settings = SettingsStore.getSettings();
  let scores = ScoresStore.getScores();
  let activeColor = settings.activeColor;
  return {
    User,
    gameRoom,
    gameRooms,
    scores,
    activeColor
  }
}

@connectToStores([AuthStore, GameRoomStore, SettingsStore], getState)
export default class GamaPage extends Component{
  static propTypes = {
    // Injected by @connectToStores:
    User: PropTypes.object,
    gameRoom : PropTypes.object,
    gameRooms : PropTypes.object
  };
  // Injected by React Router:
  static contextTypes = {
    history: PropTypes.object.isRequired,
    showLoader : PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      selectedGame: 'game7',
      showPublicRooms : true,
      showMultiplayerOpts: false,
      css:{
        multiopts:{
          top: 100+'%'
        },
        gametypeopts:{
          top: 0
        }
      }
    }
  }
  componentWillReceiveProps(nextProps){
    let self = this;
    if(!nextProps.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }else{
    }
  }
  componentDidMount(){
    setTimeout(function(){
        componentHandler.upgradeAllRegistered();
      },20);
  }
  componentWillMount(){
    Howler.mute();
    if(window.requestId) window.cancelAnimFrame(window.requestId);
    if(!this.props.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }
  } 
  componentDidUpdate(){
      setTimeout(function(){
        componentHandler.upgradeAllRegistered();
      },20);
  }
  reRender(newState){
    this.setState(newState);
  }
  handleGoToSettings(){
    this.context.history.pushState(null, `/settings`, null);
  }
  handleLogOut(){
    LoginActions.LogOut();
  }
  goToPlayWithBots(){
    this.context.history.pushState(null, `/${this.state.selectedGame}`, null); 
  }
  showMultiplayerOpts(){
    this.context.history.replaceState(null, `/gamesmulti`, null);  
  }
  showRoomsComponent(){
      let { showRooms, showPublicRooms, selectedGame } = this.state;
      let { css } = this.state;
      return(
        <div>
          <div className="form form-center">
          <div className="opt-screen" style={css.gametypeopts}>
            <div className="btn btn-main" onClick={this.goToPlayWithBots.bind(this)}>
              <i className="material-icons md-18">adb</i>
              Play with Bots
            </div>
            <div className="btn btn-main" onClick={this.showMultiplayerOpts.bind(this)}>
              <i className="material-icons md-18">people_outline</i>
              Play MultiPlayer
            </div>
          </div>
        </div>
        </div>
      )
  }
  render() {
    const { User } = this.props;
    var commonComponent = this.showRoomsComponent.call(this);
    let heading = {};
    heading['icon'] = this.state.showMultiplayerOpts ? 'people_outline' : '';
    heading['text'] = this.state.showMultiplayerOpts ? 'Play with other online players' : 'Satti Centre';
    return (
      <div className={''}>        
        <div className="no-overflow-div">
          <NavBarComponent User={User} heading={heading}/>
          {commonComponent}
        </div>
      </div>
    )
    }
}