import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
class RoomsComponent extends Component{
  constructor(props){
    super(props);
    this.state = {
      'invalidRoomId' : false,
    }
  }
  static contextTypes = {
    history : PropTypes.object.isRequired,
    showLoader : PropTypes.func.isRequired
  }
  createRoom(){
    this.props.clickHandle();
  }
  roomRowClicked(room){
    this.props.joinRoom(room);
  }
  enterRoom(e){
    var input = e.target.value;
    var newState = _.extend({}, this.state);
    if(input.length == 5){
      newState['invalidRoomId'] = false;
      this.setState(newState);
      // this.context.showLoader(true)
      var gameRooms = this.props.gameRooms;
      for(var game in gameRooms){
        for(var room in gameRooms[game]){
          if(roomId == room){
            this.context.history.pushState(null, `/${game}1/${roomId}`, null);
            // this.context.showLoader(false)
            return;
          }
        }
      }
      newState['invalidRoomId'] = true;
    }else{
      newState['invalidRoomId'] = true;
    }
    this.setState(newState);
    this.context.showLoader(false)
  }
  noRoomsDiv(){
    return(
      <div>
        <div className='room-message'>
          Open public rooms are not available at the moment. You can create your own room.
        </div>
        <div className='public-rooms-container'>
            <div onClick={this.createRoom.bind(this)} className = 'public-room-box create-room'>
              <div className = 'public-room-players'><i className="material-icons">add_box</i></div>
              <div className = 'public-room-text'>CREATE ROOM</div>
            </div>
        </div>
      </div>
    )
  }
  getRoomsArray(gameRooms, game){
    var roomsArray = [];
        for(var room in gameRooms[game]){
          if(gameRooms[game][room][3] == 'show'){
            let boxClassNames = ['public-room-box',gameRooms[game][room][2]] 
            roomsArray.push(<div key={room} onClick={this.roomRowClicked.bind(this, room)} className = {classNames(boxClassNames)}>
              <div className = 'public-room-players'>{ gameRooms[game][room][0] }</div>
              <div className = 'public-room-text'>PLAYER(S)</div>
              <div className = 'public-room-status'>{ gameRooms[game][room][2] }</div>
            </div>)
          }
        }
        return (
          <div>
            <div className='room-message'>
              Click on the boxes below to join the public rooms and start playing.
            </div>
            <div className='public-rooms-container'>
              <div>
                {roomsArray}  
                <div onClick={this.createRoom.bind(this)} className = 'public-room-box create-room'>
                  <div className = 'public-room-players'><i className="material-icons">add_box</i></div>
                  <div className = 'public-room-text'>CREATE ROOM</div>
                </div> 
              </div>
            </div>
          </div>
          );
  }
  getPrivateRoomsDiv(){
    let privateRoomStyle = {
      fontSize : 25,
    }
    return(
        <div>
          <div className='room-message' style={privateRoomStyle}>
            Private rooms coming up very soon! Wait till our next update.
          </div>
        </div>
      )
    // return (
    //   <div>
    //     <form action="#" style={{padding:'0px 188px'}}>
    //       <div className="mdl-textfield mdl-js-textfield">
    //         <input className="mdl-textfield__input" type="text" id="enterRoomInput" onKeyUp={this.enterRoom.bind(this)} style={{borderBottom:'1px solid #636363'}}/>
    //         <label className="mdl-textfield__label" htmlFor="sample1" style={{color:'#636363'}}>enter room id to join</label>
    //       </div>
    //       <span className={this.state.invalidRoomId?classNames(['show-error']):'no-error'}>Invalid Room</span>
    //       <h6><span>or</span></h6>
    //     </form>
    //     <div className="btn btn-main" onClick={this.createRoom.bind(this)}>Create Private Room</div>
    //   </div>
    // )
  }
  render(){
    let {gameRooms, publicRoom, game} = this.props;
    let roomkey = null;
    // console.log(this.state);
    if(publicRoom){
      if(!gameRooms || !gameRooms[game] || (gameRooms[game] && Object.keys(gameRooms[game]).length == 0)){
          var roomsDiv = this.noRoomsDiv();
          roomkey = 'no-public-rooms';
      }else{
        var roomsDiv = this.getRoomsArray.call(this, gameRooms, game);
          roomkey = 'show-public-rooms';  
        }
    }else{
      var roomsDiv = this.getPrivateRoomsDiv.call(this);
          roomkey = 'show-private-opts';  
    }
    return(
      <div className="rooms-div">
        <ReactCSSTransitionGroup component="div" transitionAppear={true} transitionName="element-transition" transitionAppearTimeout={800} transitionEnterTimeout={500} transitionLeaveTimeout={500}>
          <div key = {roomkey}>
            {roomsDiv}
          </div>
        </ReactCSSTransitionGroup>     
      </div>
      )
  }
}
/**
 * Requests data from server for current props.
 */
function requestData(props) {
  const { params } = props;
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
    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.state = {
      routeChanged: false,
      selectedGame: 'game7',
      showPublicRooms : true,
      showMultiplayerOpts: true,
      css:{
        gametypeopts:{
          top: 100+'%'
        },
        multiopts:{
          top: 0
        }
      }
    }
  }
  componentWillReceiveProps(nextProps, nextState){
    let self = this;
    if(!this.state.routeChanged){
      if(!nextProps.User.profile.id){
        this.changeRoute('/');
      }else if(nextProps.gameRoom.game && nextProps.gameRoom.roomId !== undefined){
        window.clearInterval(this.intervalId);
        let { gameRoom } = this.props;
        setTimeout(function(){
            if(gameRoom.roomId != undefined){
              let route = `/${gameRoom.game}/${gameRoom.roomId}`;
              self.changeRoute(route);
            }
          },0);
      }
    }
  }
  changeRoute(route){
    this.setState({routeChanged: true});
    this.context.history.pushState(null, route, null);
  }
  componentDidMount(){
    this.intervalId = this.getRoomFromServer();
    setTimeout(function(){
        componentHandler.upgradeAllRegistered();
      },20);
    document.addEventListener('backbutton', this.routerWillLeave);
  }
  getRoomFromServer(){
    return window.setInterval(function(){
      GameRoomActions.getRooms('/getrooms');
    },2000)
  }
  componentWillUnmount(){
    // console.log('parent unmount');
    window.clearInterval(this.intervalId);
    document.removeEventListener('backbutton', this.routerWillLeave);
  }
  componentWillMount(){
    Howler.mute();
    if(window.requestId) window.cancelAnimFrame(window.requestId);
    if(!this.props.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }
  }
  routerWillLeave(e){
    e.preventDefault();
    navigator.app.backHistory();
  }
  componentDidUpdate(){
      setTimeout(function(){
        componentHandler.upgradeAllRegistered();
      },20);
  }
  reRender(newState){
    this.setState(newState);
  }
  clicked(e){
    var roomType = e.target.value;
    var newState = _.extend({}, this.state);
    switch(roomType){
      case 'public':
        newState.showPublicRooms = true;
        break;
      case 'private':
        newState.showPublicRooms = false;
        break;
    }
    this.reRender(newState);
  }
  handleGoToSettings(){
    this.context.history.pushState(null, `/settings`, null);
  }
  handleLogOut(){
    LoginActions.LogOut();
  }
  createRoom(roomType){
    var roomType = 'private'
    if(this.state.showPublicRooms){
      roomType = 'public';
    }
    var selectedGame = this.state.selectedGame;
    GameRoomActions.createGameRoom(`/createroom`, {'game': selectedGame, 'type': roomType});
  }
  joinRoom(room){
    this.context.history.pushState(null, `/${this.state.selectedGame}/${room}`, null);
  }
  goToPlayWithBots(){
    this.context.history.pushState(null, `/${this.state.selectedGame}`, null); 
  }
  
  showRoomsComponent(){
      let { showRooms, showPublicRooms, selectedGame } = this.state;
      let { css } = this.state;
      return(
        <div>
          <div className="form form-center">
          <div className="opt-screen" style={css.multiopts}>
            {/*<RoomTypeSelector showPublicRooms={showPublicRooms} clicked={this.clicked.bind(this)}/>*/}
            <RoomsComponent game={selectedGame} gameRooms={this.props.gameRooms} rooms={this.state.rooms} publicRoom={this.state.showPublicRooms} clickHandle={this.createRoom.bind(this)} joinRoom={this.joinRoom.bind(this)}></RoomsComponent>
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
    heading['text'] = this.state.showMultiplayerOpts ? 'Play with other online players' : 'Badam Satti';
    return (
      <div className={''}>
        {/*<div className={this.props.activeColor.name+'-img fixed-bkg'}></div>*/}
        <div className="no-overflow-div">
          <NavBarComponent User={User} heading={heading}/>
          {commonComponent}
        </div>
      </div>
    )
    }
}