import React, { Component, PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import GameRoomStore from '../stores/GameRoomStore';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
import * as GameRoomActions from '../actions/GameRoomActions';

import Game7Render from './Game7/components/GameRender'

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

@connectToStores([GameRoomStore], getState)
export default class GameInterface extends Component{
  static propTypes = {
    // Injected by React Router:
    params: PropTypes.shape({
      id: PropTypes.string
    }).isRequired,

    // Injected by @connectToStores:
    // user: PropTypes.object,
    // starred: PropTypes.arrayOf(PropTypes.object).isRequired,
    // starredOwners: PropTypes.arrayOf(PropTypes.object).isRequired,
    // isLoadingStarred: PropTypes.bool.isRequired,
    // isLastPageOfStarred: PropTypes.bool.isRequired
  };
  static childContextTypes = {
    ifOnline: PropTypes.bool
  }
  getChildContext() {
    return { 
        ifOnline : this.props.params.id === undefined ? false : true
      }
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
    if(id){
      GameRoomActions.joinGameRoom(id, profile, 'game7');
      socket.on('invalid_room', function(){
        console.log('invalid_room')
      });
      socket.on('room_full', function(){
        console.log('room_full')
      });  
    }else{
      GameRoomActions.startGameWithBots('game7')
    }
  }
  componentDidMount(){
    socket.on('game_state', function(data){
      var clientData = data.clientData;
      GameRoomActions.gameStateReceived('game7', clientData);
    })
  }
  componentWillUnmount() {
    var id = this.props.params.id;
    // var profile = this.props.profile;
    GameRoomActions.leaveGameRoom(id, 'game7');
  }
  componentWillReceiveProps(nextProps) {
    // if (parseLogin(nextProps.params) !== parseLogin(this.props.params)) {
    //   requestData(nextProps);
    // }
  }

  render() {
    let gamePause = this.state.gamePause;
    let pauseButtonText, pauseScreenStyle, pauseButtonStyle;
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
        pauseScreenStyle = {
          display: 'block',
          zIndex : 600
        }
      }else{
        pauseButtonText = 'P'
        pauseScreenStyle = {
          display: 'none',
          zIndex : 600
        }
      }
    }
    return (
      <div>
        <div className={this.props.activeColor.name+' fixed-bkg'}></div>
        <button onClick={this.pauseToggle.bind(this)} className = "distribute-button" style= {pauseButtonStyle}> {pauseButtonText} </button>
        <div className={'pause-screen'} style={pauseScreenStyle}><span>Game Paused</span></div>
        <Game7Render gamePause={gamePause}/>
      </div>
    );
  }
}
