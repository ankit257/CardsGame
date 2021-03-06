import React, { Component, PropTypes } from 'react';
import { delay } from '../../scripts/AppDispatcher';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import GameRoomStore from '../stores/GameRoomStore';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
import * as GameRoomActions from '../actions/GameRoomActions';

import Game7Render from './Game7/components/GameRender';
import Game325Render from './Game325/components/Game325Render';
import * as GameActions from './Game325/actions/GameActions';
import { timeConstants } from './Game7/constants/SattiHelper'

function parseLogin(params) {
  return params.login;
}

/**
 * Requests data from server for current props.
 */
function requestData(props) {
  const { params } = props;
  console.log(params);
  const userLogin = parseLogin(params);

  UserActionCreators.requestUser(userLogin, ['name', 'avatarUrl']);
  RepoActionCreators.requestStarredReposPage(userLogin, true);
}

/**
 * Retrieves state from stores for current props.
 */
function getState(props) {
  var gameData = GameRoomStore.get();
  var profile = AuthStore.get();
  var settings = SettingsStore.getSettings();
  var activeColor = settings.activeColor;
  var selectedGame = GameRoomStore.getSelectedGame();
  // console.log(gameData);
  return {
    gameData,
    profile,
    activeColor,
    selectedGame
  }
}

@connectToStores([GameRoomStore], getState)
export default class GameInterface extends Component{
  static propTypes = {
    // Injected by React Router:
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,
  };
  static childContextTypes = {
    ifOnline: PropTypes.bool,
    ifOverlayShown: PropTypes.func
  }
  getChildContext() {
    return { 
        ifOnline : this.props.params.id === undefined ? false : true,
        ifOverlayShown : function(bool, zIndex, status){
            if(!zIndex) zIndex = 600;
            if(bool){
              document.getElementById('game-overlay-screen').style.display = 'block';
              document.getElementById('game-overlay-screen').style.zIndex = zIndex;
            }else{
              document.getElementById('game-overlay-screen').style.display = 'none';
            }
          }
      }
  }
  static contextTypes = {
    history: PropTypes.object.isRequired,
  }
  state = {
    gamePause : false
  }
  constructor(props) {
    super(props);
    // this.pauseToggle = this.pauseToggle.bind(this);
    // this.renderStarredRepos = this.renderStarredRepos.bind(this);
    // this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }
  pauseToggle() {
    if(!this.context.ifOnline){
      this.setState({
        gamePause: !this.state.gamePause
      })
    }
  }
  componentWillMount() {
    var id = this.props.params.id;
    var profile = this.props.profile;
    var game = this.props.selectedGame;
    if(id){
      setTimeout(function(){GameRoomActions.joinGameRoom(id, profile, game)},timeConstants.DISPATCH_DELAY);
      let self = this;
      socket.on('invalid_room', function(){
        self.context.history.go(-1);
      });
      socket.on('room_full', function(){
        self.context.history.go(-1);
      }); 
      socket.on('disconnect', function(){
        self.context.history.go(-1);
      })
    }else{
      GameActions.refreshStore({ifOnline: false});
      GameRoomActions.startGameWithBots(game)
    }
  }
  componentDidMount(){
    var game = this.props.selectedGame;
    socket.on('game_state', function(data){
      var clientData = data.clientData;
      GameRoomActions.gameStateReceived(game, clientData);
    })
    GameRoomActions.fetchScoresFromServer('game7');
  }
  componentWillUnmount() {
    var game = this.props.gameData.game;
    var id = this.props.params.id;
    if(id){
      GameActions.refreshStore({ifOnline: true});
      // GameRoomActions.leaveGameRoom(id, 'game7');
      GameRoomActions.leaveGameRoom(id, game);
    }
    console.log('unmount');
    socket.removeAllListeners("invalid_room");
    socket.removeAllListeners("room_full");
    socket.removeAllListeners("play_card");
    socket.removeAllListeners("room_joined");
    socket.removeAllListeners("player_changed");
    socket.removeAllListeners("disconnect");
    socket.removeAllListeners("game_state");
  }
  componentWillReceiveProps(nextProps) {
    // if (parseLogin(nextProps.params) !== parseLogin(this.props.params)) {
    //   requestData(nextProps);
    // }
  }
  render() {
    let gamePause = this.state.gamePause;
    let pauseButtonText, pauseButtonStyle, overlayMessage;
    if(this.context.ifOnline){
      pauseButtonStyle = {
        display: 'none'
      }
    }else{
      pauseButtonStyle = {
        zIndex : 601
      }
      if(gamePause){
        pauseButtonText = 'R'
      }else{
        pauseButtonText = 'P'
      }
    }
    return (
      <div>
        <div className={this.props.activeColor.name+' fixed-bkg'}></div>
        <button onClick={this.pauseToggle.bind(this)} className = "distribute-button" style= {pauseButtonStyle}> {pauseButtonText} </button>
        <div className={'overlay-screen'} id={'game-overlay-screen'}><span></span></div>
        <Game325Render gamePause={gamePause}/>
      </div>
    );
  }
}
