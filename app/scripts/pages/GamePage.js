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
import XPComponent from "../games/Game7/components/XPComponent"
import ConfirmAppExitModal from '../components/ConfirmAppExitModal'

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
  let savedscore = ScoresStore.getScores('game7');
  let xp = savedscore.stats.xp;
  return {
    User,
    gameRoom,
    gameRooms,
    activeColor,
    xp
  }
}

@connectToStores([AuthStore, GameRoomStore, SettingsStore, ScoresStore], getState)
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
      appExitModalIsOpen: false,
      css:{
        multiopts:{
          top: 100+'%'
        },
        gametypeopts:{
          top: 0
        }
      }
    }
    this.showExitModal = this.showExitModal.bind(this);
    this.changeAppExitModalState = this.changeAppExitModalState.bind(this);
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
    document.addEventListener('backbutton', this.showExitModal);
    if(window.requestId) window.cancelAnimFrame(window.requestId);
    if(!this.props.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }
  } 
  componentWillUnmount(){
    document.removeEventListener('backbutton', this.showExitModal);
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
  handleGoToSettings(){
      this.context.history.pushState(null, `/settings`, null);
  }
  loginWithFb(e){
    LoginActions.LoginWithFB(); 
  }
  multiplayerComponent(){
    let iconStyle = {fontSize: 20, top: -1};
    let buttonStyle = {textTransform: 'none', fontSize: 30};
    let User = this.props.User;
    let floginstyle = {
      height: 21,
      marginRight: 8
    }
    if(User.profile.id == 'local'){
      return(
          <div className="btn btn-main">
            <a className="button blue-button" style={buttonStyle} onClick={this.loginWithFb.bind(this)}>
              <img src="assets/images/ficon.png" style={floginstyle}/>
              Login for MultiPlayer
            </a>
          </div>
        )
    }else{
      return(
        <div className="btn btn-main">
          <a className="button blue-button" style={buttonStyle} onClick={this.showMultiplayerOpts.bind(this)}>
            <i className="material-icons md-18" style={iconStyle}>people_outline</i>
            Play MultiPlayer
          </a>
        </div>
        )
    }
  }
  showRoomsComponent(){
      let { showRooms, showPublicRooms, selectedGame } = this.state;
      let { css } = this.state;
      let iconStyle = {fontSize: 20, top: -1};
      let buttonStyle = {textTransform: 'none', fontSize: 30};
      let multiplayercomponent = this.multiplayerComponent();
      return(
        <div>
          <div className="form form-center">
          <div className="opt-screen" style={css.gametypeopts}>
            <div className="btn btn-main">
              <a className="button blue-button" style={buttonStyle} onClick={this.goToPlayWithBots.bind(this)}>
                <i className="material-icons md-18" style={iconStyle}>adb</i>
                Play with Bots
              </a>
            </div>
            {multiplayercomponent}
            <div className="settings-button">
              <a className="button orange-button" style={buttonStyle} onClick={this.handleGoToSettings.bind(this)}>
                <i className="material-icons md-18" style={iconStyle}>settings</i>
                Settings
              </a>
            </div>
          </div>
        </div>
        </div>
      )
  }
  changeAppExitModalState(state){
    this.setState({
      appExitModalIsOpen: state
    })
  }
  showExitModal(e){
    e.preventDefault();
    this.changeAppExitModalState(true);
  }
  render() {
    const { User } = this.props;
    var commonComponent = this.showRoomsComponent.call(this);
    let heading = {};
    let xp = this.props.xp;
    let imageUrl = selectn('profile.picture.data.url', User);
    let imageStyle = {
      backgroundImage: 'url('+imageUrl+')'
    }
    let appExitModalIsOpen = this.state.appExitModalIsOpen;
    heading['icon'] = this.state.showMultiplayerOpts ? 'people_outline' : '';
    heading['text'] = this.state.showMultiplayerOpts ? 'Play with other online players' : 'Sevens Card Game';
    return (
      <div className={''}>
        <img className="cityscape" src="assets/images/cityscape1.png"/>      
        <div className="no-overflow-div">
          <div className='face-div'>
            <div className="nav-bar-gamepage">
              {User.profile.first_name}
            </div>
            <div className="nav-bar-gamepage">
              <div className="profile-image" style={imageStyle}></div>
            </div>
            <div className="nav-bar-gamepage">
                <XPComponent xp={xp} showScores={false}/>
            </div>
          </div>
          {commonComponent}
        </div>
        <ConfirmAppExitModal appExitModalIsOpen={appExitModalIsOpen} changeAppExitModalState={this.changeAppExitModalState}/>
      </div>
    )
    }
}