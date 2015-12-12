import React, { PropTypes, Component } from 'react';
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
      this.context.showLoader(true)
      var gameRooms = this.props.gameRooms;
      for(var game in gameRooms){
        for(var room in gameRooms[game]){
          if(roomId == room){
            // GameRoomStore.update();
            this.context.history.pushState(null, `/${game}/${roomId}`, null);
            this.context.showLoader(false)
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
        <h5>No rooms available</h5>
        <div className="btn btn-primary" onClick={this.createRoom.bind(this)}>Create Room</div>
      </div>
    )
  }
  getRoomsArray(gameRooms, game){
    var roomsArray = [];
        for(var room in gameRooms[game]){
          if(gameRooms[game][room][3] == 'show'){
            roomsArray.push(<tr key={room} onClick={this.roomRowClicked.bind(this, room)}><td>Room# {room}</td><td>{ gameRooms[game][room][0] }</td><td>{ gameRooms[game][room][2] }</td></tr>);
          }
        }
        return (
          <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
              <thead>
                <tr>
                  <th>Room #Id</th>
                  <th>Players Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
              {roomsArray}
              </tbody>
            </table>  
          );
  }
  getPrivateRoomsDiv(){
    return (
      <div>
        <form action="#" style={{padding:'0px 188px'}}>
          <div className="mdl-textfield mdl-js-textfield">
            <input className="mdl-textfield__input" type="text" id="enterRoomInput" onKeyUp={this.enterRoom.bind(this)} style={{borderBottom:'1px solid #cdcdcd'}}/>
            <label className="mdl-textfield__label" htmlFor="sample1" style={{color:Style.fontColor}}>enter room id to join</label>
          </div>
          <span className={this.state.invalidRoomId?classNames(['show-error']):'no-error'}>Invalid Room</span>
          <h6><span>or</span></h6>
        </form>
        <div className="btn btn-primary" onClick={this.createRoom.bind(this)}>Create Room</div>
      </div>
    )
  }
  render(){
    let {gameRooms, publicRoom, game} = this.props;
    // console.log(this.state);
    if(publicRoom){
      if(!gameRooms || !gameRooms[game] || (gameRooms[game] && Object.keys(gameRooms[game]).length == 0)){
          var roomsDiv = this.noRoomsDiv();
      }else{
        var roomsDiv = this.getRoomsArray.call(this, gameRooms, game);
        }
    }else{
      var roomsDiv = this.getPrivateRoomsDiv.call(this);
    }
    return(
      <div>
        {roomsDiv}
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
    this.calculateCSS = this.calculateCSS.bind(this);
    this.goToGame = this.goToGame.bind(this)
    
    this.state = {
      showGames : true,
      showRooms : false,
      showPublicRooms : true,
      css : {
        game7 : {
          width: '299px',
          height: '300px',
          margin: '12px',
          zIndex: 1,
          background: 'rgba(79, 193, 233, 0.5)',
          color: '#eee',
          padding: '100px 40px',
          display : 'inline-block'
        },
        game325 : {
          width: '299px',
          height: '300px',
          margin: '12px',
          zIndex: 1,
          background: 'rgba(172, 146, 236, 0.5)',
          color: '#eee',
          padding: '100px 40px',
          direction : 'rtl',
          display : 'inline-block'
        },
        container : {
          paddingTop : '50px',
          width : '1080px',
          margin : '0 auto',
        }
      },
    }
  }
  calculateCSS(){
    var screenSize = window.innerWidth;
    var topPadding = '100px';
    var minWidth = '600px';
      return {
        game7 : {
          margin: '12px',
          height : '40px',
          width : '102px',
          zIndex: 1,
          background: 'rgba(79, 193, 233, 0.5)',
          color: '#eee',
          padding: '10px 12px',
          display : 'block',
          float : 'left'
        },
        game325 : {
          margin: '12px',
          height : '40px',
          width : '140px',
          zIndex: 1,
          background: 'rgba(172,146,236,0.5)',
          color: '#eee',
          padding: '10px 12px',
          display : 'inline-block',
          float : 'left'
        },
        container : {
          paddingTop : '50px',
          width : '1080px',
          margin : '0 auto',
        }
      }
  }
  // componentWillMount() {
  //   if(!this.props.User.profile){
  //     this.context.history.pushState(null, `/`, null);
  //   }
  //   // if(this.props.gameRoom){
  //   //   console.log(this.props.gameRoom)
  //   // }
  // }
  componentWillReceiveProps(nextProps){
    // console.log(nextProps);
    if(!nextProps.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }else if(nextProps.gameRoom.game && nextProps.gameRoom.roomId){
      let { gameRoom } = nextProps;
      this.context.history.pushState(null, `/${gameRoom.game}/${gameRoom.roomId}`, null);
    }else{
      // console.log(nextProps);
    }
  }
  componentDidMount(){
    GameRoomActions.updateSelectedGame('game325');
    this.intervalId = this.getRoomFromServer();
  }
  getRoomFromServer(){
    return window.setInterval(function(){
      GameRoomActions.getRooms('/getrooms');
    },2000)
  }
  componentWillUnmount(){
    window.clearInterval(this.intervalId);
  }
  componentWillMount(){
    // console.log(this.props);
    if(!this.props.User.profile.id){
      this.context.history.pushState(null, `/`, null);
    }
    setTimeout(function(){
      componentHandler.upgradeAllRegistered()
      adjustToggleElemenetCssManually('demo-menu-lower-right');
    },10);
  } 
  componentDidUpdate(){
    setTimeout(function(){
      componentHandler.upgradeAllRegistered()
      adjustToggleElemenetCssManually('demo-menu-lower-right');
    },10);
  }
  goToGame(game){
    var newState = _.extend({}, this.state);
      newState['css'] = this.calculateCSS();
      newState['showRooms'] = true;
      newState['selectedGame'] = game;
      GameRoomStore.updateSelectedGame(game);
      this.reRender(newState);
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
          <div className="form form-center" style={{textAlign:'center'}}>
          <div>
          <div className="radio-btn-container">
            <section className="radio-container">Game Room</section>
            <section className="radio-container">
              <label className="mdl-radio mdl-js-radio mdl-js-ripple-effect" htmlFor="option-1">
                <input type="radio" id="option-1" className="mdl-radio__button" name="options" value="public" checked={showPublicRooms} onChange={this.clicked.bind(this)}></input>
                <span className="mdl-radio__label">Public</span>
              </label>
            </section>
            <section className="radio-container">
              <label className="mdl-radio mdl-js-radio mdl-js-ripple-effect" htmlFor="option-2">
                <input type="radio" id="option-2" className="mdl-radio__button" name="options" value="private" checked={!showPublicRooms} onChange={this.clicked.bind(this)}></input>
                <span className="mdl-radio__label">Private</span>
              </label>
            </section>
          </div>
          <RoomsComponent game={selectedGame} gameRooms={this.props.gameRooms} rooms={this.state.rooms} publicRoom={this.state.showPublicRooms} clickHandle={this.createRoom.bind(this)} joinRoom={this.joinRoom.bind(this)}></RoomsComponent>
          </div>
          <hr />
          <div className="btn btn-primary" onClick={this.goToPlayWithBots.bind(this)}>Play with Bots</div>
        </div>
        </div>
      )
  }
  showGameCardsComponent(){
    let { showRooms, showPublicRooms, selectedGame } = this.state;
    let { css } = this.state;
    var games = [{'title' : 'Teen Do Paanch', 'desc': 'A classcic Indian Game played between 3 players.', 'blogref': '/bog/how-to-play-teen-do-paanch', 'key': 'game325'}, 
            {'title' : 'Satti Center', 'desc': 'Arrange the cards 4 players and try finishing your cards first .', 'blogref': '/bog/how-to-play-teen-do-paanch', 'key': 'game7'}];
    var gameCardsArray = [];
    var self = this;
    games.map(function (game, index){
      var classAr = ["demo-card-square","mdl-card","mdl-shadow--2dp", 'demo-card-square-'+game.key];
      var t = <div key={index} className="demo-card-square-outer">
              <div className={classNames(classAr)}>
                <div className="mdl-card__title mdl-card--expand">
                  <h2 className="mdl-card__title-text">{ game.title }</h2>
                </div>
                <div className="mdl-card__supporting-text">
                  { game.desc } <a href={game.blogref}>Learn More </a>
                </div>
                <div className="mdl-card__actions mdl-card--border">
                  <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onClick={self.goToGame.bind(self, game.key)}>
                    Play
                  </a>
                </div>
              </div>
              </div>
      gameCardsArray.push(t);
    });
    return (
        <div>
          { gameCardsArray }
        </div>
    )
  }
  gameHeaderComponent(){
    let { css } = this.state;
    return(
      <div>
        <div onClick={this.goToGame.bind(this, 'game7')} className="animate-it block-1" style={css.game7}>
          <span className="">Satti Center</span>
        </div>
        <div onClick={this.goToGame.bind(this, 'game325')} className="animate-it block-2" style={css.game325}>
          <span className="">Teen Do Paanch</span>
        </div>
      </div> 
    )
  }
  render() {
    let { css, showRooms } = this.state;
    const { User } = this.props;
    let firstName = selectn('profile.first_name', User);
    let imageUrl = selectn('profile.picture.data.url', User);
    if(!showRooms){
      var commonComponent = this.showGameCardsComponent.call(this);
    }else{
      var gameComponent =  this.gameHeaderComponent.call(this);
      var commonComponent = this.showRoomsComponent.call(this);
    }
    let btnClassNames = ['mdl-button', 'mdl-js-button', 'mdl-button--icon'];
    let ulClassNames = ['mdl-menu', 'mdl-menu--bottom-right', 'mdl-js-menu', 'mdl-js-ripple-effect'];
    let liItemClassNames = ['mdl-menu__item'];
    return (
      <div className={''} style={css.container}>
        <div className={this.props.activeColor.name+'-img fixed-bkg'}></div>
        <div className="">
        {gameComponent}
        <div className='face-div' style={{'float':'right'}}>
            <img className="md-48" height="32" width="32" src={ imageUrl }/>
            <span className="pad-left-10">{ firstName }</span>
            <button id="demo-menu-lower-right" className={classNames(btnClassNames)} style={css.btn}>
              <i className="material-icons">more_vert</i>
            </button>
            <ul className="" htmlFor="demo-menu-lower-right" className={classNames(ulClassNames)}>
              <li className={classNames(liItemClassNames)} onClick={this.handleGoToSettings.bind(this)}>Settings</li>
              <li className={classNames(liItemClassNames)} onClick={this.handleLogOut.bind(this)}>Log Out</li>
            </ul>
        </div>
        <div style={{'clear':'both'}}></div>
        <hr />
            {commonComponent}
        </div>
      </div>
    )
    }
}
function adjustToggleElemenetCssManually(id){
    var element = document.getElementById(id);
    if(!element){
      return false;
    }
    var width = element.nextSibling.children[1].offsetWidth;
    // var height = element.nextSibling.children[1].offsetHeight;
    var left = element.offsetLeft;
    left = left - width/1.2;
    var nextElement = element.nextSibling;
    var props = {'left': left};
    for(var key in props){
      nextElement.style[key] = props[key];
    }
    // nextElement.children[1].style['clip'] = 'rect(0px '+width+'px '+height+'px 0px)';
}