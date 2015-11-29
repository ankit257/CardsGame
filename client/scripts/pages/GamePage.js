import React, { PropTypes, Component } from 'react';
import AuthStore from '../stores/AuthStore';
import GameRoomStore from '../stores/GameRoomStore';
// import RoomStre from '../stores/RoomStore';
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
  }
  roomClicked(){

  }
  enterRoom(e){
    console.log(e.target.value);
  }
  createRoom(){
    this.props.clickHandle();
  }
  roomRowClicked(room){
    this.props.joinRoom(room);
    console.log(room)
  }
  render(){
    let {rooms, publicRoom} = this.props;
    if(publicRoom){
      var c = [];
      var self = this;
      rooms.map(function (room, index){
        c.push(<tr key={index} onClick={self.roomRowClicked.bind(self, room)}><td>Room #{room}</td><td>{index}</td></tr>);
      })
      var roomsX = <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
                    <thead>
                      <tr>
                        <th>Room #Id</th>
                        <th>No of Players</th>
                      </tr>
                    </thead>
                    <tbody>
                    {c}
                    </tbody>
                  </table>
      if(!rooms)
        rooms = [];
      if(rooms.length == 0){
          var r = <div>
                    <h5>No rooms available</h5>
                    <div className="btn btn-primary" onClick={this.createRoom.bind(this)}>Create Room</div>
                  </div>
      }else{
        var self = this;
        var r = roomsX;
      }  
    }else{
      var r = <div>
                <form action="#" style={{padding:'0px 188px'}}>
                  <div className="mdl-textfield mdl-js-textfield">
                    <input className="mdl-textfield__input" type="text" id="sample1" onKeyUp={this.enterRoom.bind(this)} style={{borderBottom:'1px solid #cdcdcd'}}/>
                    <label className="mdl-textfield__label" for="sample1" style={{color:Style.fontColor}}>enter room id to join</label>
                  </div>
                  <h6><span>or</span></h6>
                </form>
                <div className="btn btn-primary" onClick={this.createRoom.bind(this)}>Create Room</div>
              </div>
    }
    return(
      <div>
        {r}
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
  return {
    User,
    gameRoom
  }
}


@connectToStores([AuthStore, GameRoomStore], getState)
export default class GamaPage extends Component{
  static propTypes = {
    params: PropTypes.shape({
      login: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    // Injected by @connectToStores:
    User: PropTypes.object,
    gameRoom : PropTypes.object
  };
  // Injected by React Router:
  static contextTypes = {
    history: PropTypes.object.isRequired
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
      rooms : [],
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
  componentWillMount() {
    if(!this.props.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
    if(this.props.gameRoom){
      console.log(this.props.gameRoom)
    }
  }
  componentWillReceiveProps(nextProps){
    console.log(this.context);
    if(!nextProps.User.profile){
      this.context.history.pushState(null, `/`, null);
    }else if(nextProps.gameRoom){
      let { gameRoom } = nextProps;
      this.context.history.pushState(null, `/${gameRoom.game}/${gameRoom.roomId}`, null);
      // this.context.history.pushState(null, `/${gameRoom.game}/`, null);
    }
  }
  componentDidMount(){
    // componentHandler.upgradeAllRegistered();
    socket.emit('getRooms');
    var self = this;
    socket.on('rooms', function (data){
      var newState = _.extend({}, this.state);
      newState.rooms = data.roomNo;
      self.reRender(newState);
    })
  }
  componentDidUpdate(){
    setTimeout(function(){
      componentHandler.upgradeAllRegistered()
      bindToggleEventsManually('demo-menu-lower-right');
      componentHandler.upgradeDom();
    },200);
  }
  goToGame(game){
    var newState = _.extend({}, this.state);
      newState['css'] = this.calculateCSS();
      newState['showRooms'] = true;
      newState['selectedGame'] = game;
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
  openToggle(e){
    openToggle('demo-menu-lower-right');
    e.stopPropagation();
  }
  handleGoToSettings(){
    this.context.history.pushState(null, `/settings`, null);
  }
  handleLogOut(){
    LoginActions.LogOut();
  }
  createRoom(){
    var selectedGame = this.state.selectedGame;
    console.log(selectedGame)
    GameRoomActions.createGameRoom(`/createroom`, {'game': selectedGame})
  }
  joinRoom(room){
    console.log(room)
  }
  offlinePlay(){
    if(this.state.selectedGame == "game7"){
      this.context.history.pushState(null, `/game7local`, null);
    }
  }
  showRoomsComponent(){
    let { showRooms, showPublicRooms } = this.state;
    let { css } = this.state;
    var games = [{'title' : 'Teen Do Paanch', 'desc': 'A classcic Indian Game played between 3 players.', 'blogref': '/bog/how-to-play-teen-do-paanch', 'key': 'game325'}, 
            {'title' : 'Satti Center', 'desc': 'Arrange the cards 4 players and try finishing your cards first .', 'blogref': '/bog/how-to-play-teen-do-paanch', 'key': 'game7'}];
    var gameCardsArray = [];
    var self = this;

    games.map(function (game, index){
      var classAr = ["demo-card-square","mdl-card","mdl-shadow--2dp", 'demo-card-square-'+game.key];
      var t = <div className="demo-card-square-outer">
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
    })
    var commonComponent = <div>
                            { gameCardsArray }
                          </div>
    if(!showRooms){
      return(
        { commonComponent }
      )
    }
    if(showRooms){
      return(
        <div>
          <div className="form form-center" style={{textAlign:'center'}}>
          <div>
          <div className="radio-btn-container">
            <section className="radio-container">Game Room</section>
            <section className="radio-container">
              <label className="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="option-1">
                <input type="radio" id="option-1" className="mdl-radio__button" name="options" value="public" checked={showPublicRooms} onChange={this.clicked.bind(this)}></input>
                <span className="mdl-radio__label">Public</span>
              </label>
            </section>
            <section className="radio-container">
              <label className="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="option-2">
                <input type="radio" id="option-2" className="mdl-radio__button" name="options" value="private" checked={!showPublicRooms} onChange={this.clicked.bind(this)}></input>
                <span className="mdl-radio__label">Private</span>
              </label>
            </section>
          </div>
          <RoomsComponent rooms={this.state.rooms} publicRoom={this.state.showPublicRooms} clickHandle={this.createRoom.bind(this)} joinRoom={this.joinRoom.bind(this)}></RoomsComponent>
          </div>
          <hr />
          <div className="btn btn-primary" onClick={this.offlinePlay.bind(this)}>Play with Bots</div>
        </div>
        </div>
      )
    }
  }
  render() {
    let { css, showRooms } = this.state;
    const { User } = this.props;
    let firstName = selectn('profile.first_name', User);
    let imageUrl = selectn('profile.picture.data.url', User);
    if(showRooms){
      var gameComponent = <div>
                            <div onClick={this.goToGame.bind(this, 'game7')} className="animate-it block-1" style={css.game7}>
                              <span className="">Satti Center</span>
                            </div>
                            <div onClick={this.goToGame.bind(this, 'game325')} className="animate-it block-2" style={css.game325}>
                              <span className="">Teen Do Paanch</span>
                            </div>
                          </div>  
    }
    let btnClassNames = ['mdl-button', 'mdl-js-button', 'mdl-button--icon'];
    let ulClassNames = ['mdl-menu', 'mdl-menu--bottom-right', 'mdl-js-menu', 'mdl-js-ripple-effect'];
    let liItemClassNames = ['mdl-menu__item'];
    return (
      <div className={''} style={css.container}>
        <div className={'bkg-filter'}></div>
        <div className="">
        {gameComponent}
        <div className='face-div' style={{'float':'right'}}>
            <img className="md-48" height="32" width="32" src={ imageUrl }/>
            <span className="pad-left-10">{ firstName }</span>
            <button id="demo-menu-lower-right" className={classNames(btnClassNames)} onClick={this.openToggle.bind(this)} style={css.btn}>
              <i className="material-icons">more_vert</i>
            </button>
            <ul className="" for="demo-menu-lower-right" className={classNames(ulClassNames)}>
              <li className={classNames(liItemClassNames)} onClick={this.handleGoToSettings.bind(this)}>Settings</li>
              <li className={classNames(liItemClassNames)} onClick={this.handleLogOut.bind(this)}>Log Out</li>
            </ul>
        </div>
        <div style={{'clear':'both'}}></div>
        <hr />
        {this.showRoomsComponent.call(this)}
        </div>
      </div>
    )
    }
}
function openToggle(id){
    var element = document.getElementById(id);
    if(!element){
      return false;
    }
    var classes = element.nextSibling.getAttribute('class').split(' ');
    var indexOfisVisible = classes.indexOf('is-visible');
    if(indexOfisVisible==-1){
      classes.push('is-visible');
    }else{
      classes.splice(indexOfisVisible, 1);
    }
    element.nextSibling.setAttribute('class', classes.join(' '));
}
function bindToggleEventsManually(id){
    var element = document.getElementById(id);
    if(!element){
      return false;
    }
    var width = element.nextSibling.children[1].offsetWidth;
    var height = element.nextSibling.children[1].offsetHeight;
    var top = element.offsetTop+element.offsetWidth;
    var left = element.offsetLeft;
    left = left - width/1.2;
    var nextElement = element.nextSibling;
    var props = {'width': width, 'height': height, 'top': top, 'left': left};
    for(var key in props){
      nextElement.style[key] = props[key];
      if(['width','height'].indexOf(key)>-1){
        nextElement.children[0].style[key] = props[key];  
      }
    }
    nextElement.children[1].style['clip'] = 'rect(0px '+width+'px '+height+'px 0px)';
    for (var i = 0; i < nextElement.children[1].children.length; i++) {
      var c = 9*(i+1)*(i+1)
      nextElement.children[1].children[i].style.transitionDelay =  c+'ms';
    };
    nextElement.style.height = height;
    document.addEventListener('click', function (e){
    var classes = element.nextSibling.getAttribute('class').split(' ');
    if(classes.indexOf('is-visible')>-1){
      var width = element.nextSibling.children[1].offsetWidth;
      var height = element.nextSibling.children[1].offsetHeight;
      var top = element.offsetTop+element.offsetWidth;
      var left = element.offsetLeft;
      var btWidth = element.offsetWidth;
      var btnHeight = element.offsetHeight;
      var btnTop = element.offsetTop;
      var btnLeft = element.offsetLeft;
      var leftRange = [left, left+width];
      var topRange = [top, top+height];
      if(!((e.clientY < (top+height)) && (e.clientY > top) && (e.clientX < (left+width)) && (e.clientX > left)) && 
        !((e.clientY < (btnTop+btnHeight)) && (e.clientY > btnTop) && (e.clientX < (btnLeft+btWidth)) && (e.clientX > btnLeft))){
        openToggle(id);
      }
    }
  })
}


