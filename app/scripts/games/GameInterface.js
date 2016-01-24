import React, { Component, PropTypes } from 'react';
import { getItemFromLocalStorage } from '../utils/LocalStorageUtils'
import { delay } from '../../scripts/AppDispatcher';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import GameRoomStore from '../stores/GameRoomStore';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
import * as GameRoomActions from '../actions/GameRoomActions';
import * as GameActions from './Game7/actions/GameActions';
import { timeConstants } from './Game7/constants/SattiHelper'
import Modal from 'react-modal'
import Game7Render from './Game7/components/GameRender'
import ConfirmGameExitModal from './Game7/components/ConfirmGameExitModal'
import GameInitModal from './Game7/components/GameInitModal'
import { Howler } from "howler"

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
  // console.log(gameData);
  return {
    gameData,
    profile,
    activeColor
  }
}
// const GameInterface = React.createClass({
//   mixins: [ Lifecycle ],
//   componentWillMount(){
//     console.log(1);
//   },
//   routerWillLeave(nextLocation) {
//     // if (!this.state.isSaved)
//       return 'Your work is not saved! Are you sure you want to leave?'
//   },

//   render(){
//     return(
//       <GameInterface1 {...this.props} {...this.state} {...this.context}/>
//       )
//   }
// })

// export default GameInterface;

@connectToStores([GameRoomStore], getState)
export default class GameInterface extends Component{
  static propTypes = {
    // Injected by React Router:
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,
  };
  static childContextTypes = {
    ifOnline: PropTypes.bool
  }
  static contextTypes = {
    history: PropTypes.object.isRequired,
  }
  getChildContext() {
    return { 
        ifOnline : this.props.params.id === undefined ? false : true,
      }
  }
  state = {
    gamePause : false,
    gameExitModalIsOpen: false,
    gameInitModalIsOpen: false,
    offlineGameData: {}
  }
  constructor(props) {
    super(props);
    this.changeGameInitModalState = this.changeGameInitModalState.bind(this);
    this.changeGameExitModalState = this.changeGameExitModalState.bind(this);
    this.startOfflineGame = this.startOfflineGame.bind(this);
    this.routerWillLeave = this.routerWillLeave.bind(this);
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
    document.addEventListener('backbutton', this.routerWillLeave);
    var id = this.props.params.id;
    var profile = this.props.profile;
    let self = this;
    if(id){
      this.setState({gameStart: true});
      Howler.unmute();
      GameRoomActions.joinGameRoom(id, profile, 'game7')
      socket.on('invalid_room', function(){
        self.context.history.go(-1);
      });
      socket.on('room_full', function(){
        self.context.history.go(-1);
      }); 
      socket.on('disconnect', function(){
        self.context.history.go(-1);
      }); 
    }else{
      GameActions.refreshStore({ifOnline: false});
      let gameData = getItemFromLocalStorage('gameData');
      if(gameData && gameData.state){
        this.setState({gameStart: false});
        Howler.mute();
        this.setState({offlineGameData: gameData, gameInitModalIsOpen: true});
      }else{
        Howler.unmute();
        this.setState({gameStart: true});
        GameActions.initGame();
      }
    }
  }
  componentDidMount(){
    socket.on('game_state', function(data){
      var clientData = data.clientData;
      GameRoomActions.gameStateReceived('game7', clientData);
    })
    GameRoomActions.fetchScoresFromServer('game7');
    // this._unlistenBeforeLeavingRoute = this.context.history.listenBeforeLeavingRoute(this.props.route, this.routerWillLeave.bind(this));
  }
  componentWillUnmount() {
    // if (this._unlistenBeforeLeavingRoute) this._unlistenBeforeLeavingRoute();
    document.removeEventListener('backbutton', this.routerWillLeave);
    var id = this.props.params.id;
    if(id){
      GameRoomActions.leaveGameRoom(id, 'game7');
      GameActions.refreshStore({ifOnline: true});
    }
    socket.removeAllListeners("invalid_room");
    socket.removeAllListeners("room_full");
    socket.removeAllListeners("play_card");
    socket.removeAllListeners("room_joined");
    socket.removeAllListeners("player_changed");
    socket.removeAllListeners("disconnect");
    socket.removeAllListeners("game_state");
  }
  routerWillLeave(e) {
      e.preventDefault();
      Howler.mute();
      if(this.state.gameExitModalIsOpen){
        this.changeGameExitModalState(false);
        navigator.app.backHistory();
      }else{
        this.changeGameExitModalState(true);
      }
  }
  componentWillReceiveProps(nextProps) {
  }
  changeGameExitModalState(state){
    this.setState({gameExitModalIsOpen: state, gamePause: state});
  }
  changeGameInitModalState(state){
    this.setState({gameInitModalIsOpen: state});
  }
  startOfflineGame(){
    this.setState({gameStart: true});
  }
  getGameRender(){
    let { gamePause, gameStart } = this.state;
    var id = this.props.params.id;
    if(gameStart){
      return(
         <Game7Render gamePause={false}/>
        )
    }else{
      return (
        <div/>
        )
    }    
  }
  render() {
    let { gameExitModalIsOpen, gameInitModalIsOpen, offlineGameData }  = this.state;
    let pauseButtonText, pauseButtonStyle, overlayMessage;
    let gameRenderComponent = this.getGameRender();
    return (
      <div>
        {/*<div className={this.props.activeColor.name+' fixed-bkg'}></div>
        <button onClick={ this.pauseToggle.bind(this)} style= {pauseButtonStyle} className="mdl-button mdl-js-button mdl-button--icon pause-button">
                    <i className="material-icons">{pauseButtonText}</i>
                </button>*/}
        {gameRenderComponent}
        <GameInitModal gameInitModalIsOpen={gameInitModalIsOpen} changeGameInitModalState={this.changeGameInitModalState} offlineGameData={offlineGameData} startOfflineGame={this.startOfflineGame}/>
        <ConfirmGameExitModal gameExitModalIsOpen={gameExitModalIsOpen} changeGameExitModalState={this.changeGameExitModalState}/>
      </div>
    );
  }
}