import React, { PropTypes, Component } from 'react';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
// import RoomStre from '../stores/RoomStore';
import DocumentTitle from 'react-document-title';
import * as LoginActions from '../actions/LoginActions';
import * as GameRoomActions from '../actions/GameRoomActions';
import connectToStores from '../utils/connectToStores';
import _ from 'underscore';
import classNames from 'classnames/dedupe';
import selectn from 'selectn';
import  { getCardCSS, getCardSuit, getColorClass, globalVars, getCardPic, getRankForHTML, getSuitForHTML } from '../utils/CommonUtils'

var style={
  fontColor : '#bebebe'
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
  // const gameRoom = GameRoomStore.get();
  return {
    User,
    // gameRoom
  }
}


@connectToStores([SettingsStore, AuthStore], getState)
export default class SettingsPage extends Component{
  static propTypes = {
    // Injected by @connectToStores:
    User: PropTypes.object,
    Settings : PropTypes.object
  };
  // Injected by React Router:
  static contextTypes = {
    history: PropTypes.object.isRequired,
    showLoader: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    // this.calculateCSS = this.calculateCSS.bind(this);
    // this.goToGame = this.goToGame.bind(this)
    this.tabs = ['colors', 'deck'];
    this.state = {
      activeTab : 'colors',
      activeColor : globalVars.colors[0],
      css : {
        container : {
          paddingTop : '50px',
          width : '1080px',
          margin : '0 auto',
        }
      },
      classes : {
        activeCardBack : 'cardBack1',
        activeCardFront : 'cardFront1',
        backgroundTab : 'activeSettingsTab',
        deckBackTab:'',
        deckFrontTab:'',
        backgroundSettings : 'activeSettings', 
        deckBackSettings : '', 
        deckFrontSettings : '',
        CardsFront : 'cardFront1',
        CardsFront_2 : { 
          CheckBox : '',
        },
        CardsFront_1 : { 
          CheckBox : '',
        }
      }
    }
  }
  componentWillMount() {
    console.log(this.context)
    if(!this.props.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  componentDidMount(){
    var self = this;
    setTimeout(function(){
      componentHandler.upgradeAllRegistered()
      adjustToggleElemenetCssManually('demo-menu-lower-right');
    },200);
  }
  componentDidUpdate(){
    setTimeout(function(){
      componentHandler.upgradeAllRegistered();
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
  getDefaultClass(){
    return {
      activeCardBack : 'cardBack1',
      activeCardFront : 'cardFront1',
      backgroundTab : '',
      deckBackTab:'',
      deckFrontTab:'',
      backgroundSettings : '', 
      deckBackSettings : '',
      deckFrontSettings : '',
      CardsFront_2 : { 
        CheckBox : '',
      },
      CardsFront_1 : { 
        CheckBox : '',
      }
    }
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
    console.log('sett');
  }
  handleLogOut(){
    LoginActions.LogOut();
  }
  createRoom(){
    
  }
  changeTab(setting, tab){
    var newState = _.extend({}, this.state);
    var x = ['activeCardBack', 'CardsFront'];
    newState.classes = this.getDefaultClass();
    for (var i = 0; i < x.length; i++) {
      newState.classes[x[i]] = this.state.classes[x[i]];
    }
    newState.classes[setting] = 'activeSettings'
    newState.classes[tab] = 'activeSettingsTab';
    this.reRender(newState);
  }
  selectBackgroundColor(color){
    console.log(color);
    var newState = _.extend({}, this.state);
    newState.activeColor = color;
    this.reRender(newState);
  }
  selectFront(front){
    var newState = _.extend({}, this.state);
    newState.classes.CardsFront = front;
    this.reRender(newState);
  }
  selectCardBack(card){
    var newState = _.extend({}, this.state);
    newState.classes.activeCardBack = card;
    this.reRender(newState);
  }
  render() {
    let { css, showRooms, activeColor, classes } = this.state;
    const { User } = this.props;
    let firstName = selectn('profile.first_name', User);
    let imageUrl = selectn('profile.picture.data.url', User);
    var sampleCards  =   [{ suit : 'S', rank : 13,}, { suit : 'H', rank : 12}, { suit : 'C', rank : 11 }, { suit : 'D', rank : 10}];
    var CardsFront_1 = [];
    var CardsFront_2 = [];
    let bgColors = globalVars.colors;
    let cardBacks = globalVars.cardBack;
    let cardFronts = globalVars.cardFront;
    var self = this;

    sampleCards.map(function (card, index){
      var t = <div key={index} className="card playingCards simpleCards" style={{left: index*40 +'px', padding:0}}>
                <div className="card playingCards simpleCards" style={ getCardCSS() }>
                  <a className="card frontRotated" style={ getCardPic(card) }></a>
                </div>
              </div>
      CardsFront_2.push(t);
      let cardClass = ['card', 'frontRotated', 'rank-'+card.rank, card.suit];
      var cardSuitHTML = getCardSuit(card.suit);
      var x = function () {
        return {__html: cardSuitHTML}
      }
      var t = <div className="card playingCards simpleCards" style={{ left: index*40 + 'px'}}>
                <a className={classNames(cardClass)} style={getCardCSS()}>
                  <span className="rank"> { getRankForHTML(card) }</span>
                  <span className="suit" dangerouslySetInnerHTML={x()}></span>
                </a>
              </div>
      CardsFront_1.push(t);
    });
    var backCardsArray = [];
    cardBacks.map(function (card, index){
      var CheckBox;
      if(self.state.classes.activeCardBack == card){
        CheckBox = 'checked';
      }
      var t = <div key={index} className="selectCard">
                <div className="linear-block" style={{ height:'112px', width:'60px' }}>
                  <span className="check-box">
                    <span className={CheckBox}></span>
                  </span>
                </div>
                <div className="card playingCards simpleCards" onClick={self.selectCardBack.bind(self, card)}>
                  <a className={classNames(["card", "back", card])}></a>
                </div>
              </div>
      backCardsArray.push(t)
    });
    var colorsArray = [];
    var self = this;
    bgColors.map(function (color, index){
      var t = <div key={index} className={classNames(['color-list-block'], getColorClass(color.color, index, self.state.activeColor))}>
              <div className="colorBlock" style={{backgroundColor: color.color}} onClick={self.selectBackgroundColor.bind(self, color)}></div>
              <div className="color-name">
                { color.name }
              </div>
            </div>
      colorsArray.push(t)
    })
    let btnClassNames = ['mdl-button', 'mdl-js-button', 'mdl-button--icon'];
    let ulClassNames = ['mdl-menu', 'mdl-menu--bottom-right', 'mdl-js-menu', 'mdl-js-ripple-effect'];
    let liItemClassNames = ['mdl-menu__item'];
    return (
      <div style={css.container}>
        <div className={'bkg-filter'}></div>
        <div className="">
        <div style={{float:'left'}} colSpan="12"><h5><i className="fa fa-gear">&nbsp;</i>Settings</h5></div>
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
        <div className="auth-inner">
        <form className="form auth-form block-center settings-form">
        <div className="settingsBlock">
          <table className="settingsTable">
            <thead>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="selected" style={{width:'200px'}}>
                  <div className={classNames(['settingsTab', classes.backgroundSettings])} onClick={this.changeTab.bind(this, 'backgroundSettings', 'backgroundTab')}>
                    <span><h6 style={{borderTop:"1px solid #444"}}>Background</h6></span>
                  </div>
                  <div className={classNames(['settingsTab', classes.deckBackSettings])} onClick={this.changeTab.bind(this, 'deckBackSettings', 'deckBackTab')}>
                    <span><h6>Deck Back</h6></span>
                  </div>
                  <div className={classNames(['settingsTab', classes.deckFrontSettings])} onClick={this.changeTab.bind(this, 'deckFrontSettings', 'deckFrontTab')}>
                    <span><h6>Deck Front</h6></span>
                  </div>
                </td>
                <td>
                  <div className={classNames(["color-list","tabs", classes.backgroundTab])}>
                    { colorsArray }
                  </div>
                  <div className={classNames('tabs', classes.deckBackTab)}>
                    { backCardsArray }
                  </div>
                  <div className={classNames('tabs', classes.deckFrontTab)}>
                    <div>
                      <div className="linear-block" style={{ height:'112px', width:'90px' }}>
                        <span className="check-box">
                          <span className={classes.CardsFront=='cardFront1'?'checked':''}></span>
                        </span>
                      </div>
                      <div className="selectCards linear-block" style={{ position:'relative' }} onClick={this.selectFront.bind(this, 'cardFront1')}>
                        {CardsFront_1}
                      </div>
                      <div className="clearfix"></div>
                    </div>
                    <div>
                      <div className="linear-block" style={{ height:'112px', width:'90px'}}>
                        <span className="check-box">
                          <span className={classes.CardsFront=='cardFront2'?'checked':''}></span>
                        </span>
                      </div>
                      <div className="selectCards linear-block" style={{ position:'relative'}} onClick={this.selectFront.bind(this, 'cardFront2')}>
                        {CardsFront_2}
                      </div>  
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="control-group">
          <button className="btn btn-primary">
            <span>Apply</span>
          </button>
          </div>
        </div>
        </form>
        </div>
      </div>
      </div>
      )
    }
}
// function openToggle(id){
//     var element = document.getElementById(id);
//     if(!element){
//       return false;
//     }
//     var classes = element.nextSibling.getAttribute('class').split(' ');
//     var indexOfisVisible = classes.indexOf('is-visible');
//     if(indexOfisVisible==-1){
//       classes.push('is-visible');
//     }else{
//       classes.splice(indexOfisVisible, 1);
//     }
//     element.nextSibling.setAttribute('class', classes.join(' '));
// }
// function bindToggleEventsManually(id){
//   console.log(id);
//     var element = document.getElementById(id);
//     if(!element){
//       return false;
//     }
//     var width = element.nextSibling.children[1].offsetWidth;
//     var height = element.nextSibling.children[1].offsetHeight;
//     var top = element.offsetTop+element.offsetWidth;
//     var left = element.offsetLeft;
//     left = left - width/1.2;
//     var nextElement = element.nextSibling;
//     var props = {'width': width, 'height': height, 'top': top, 'left': left};
//     for(var key in props){
//       nextElement.style[key] = props[key];
//       if(['width','height'].indexOf(key)>-1){
//         nextElement.children[0].style[key] = props[key];  
//       }
//     }
//     nextElement.children[1].style['clip'] = 'rect(0px '+width+'px '+height+'px 0px)';
//     for (var i = 0; i < nextElement.children[1].children.length; i++) {
//       var c = 9*(i+1)*(i+1)
//       nextElement.children[1].children[i].style.transitionDelay =  c+'ms';
//     };
//     nextElement.style.height = height;
//     document.addEventListener('click', function (e){
//     var classes = element.nextSibling.getAttribute('class').split(' ');
//     if(classes.indexOf('is-visible')>-1){
//       var width = element.nextSibling.children[1].offsetWidth;
//       var height = element.nextSibling.children[1].offsetHeight;
//       var top = element.offsetTop+element.offsetWidth;
//       var left = element.offsetLeft;
//       var btWidth = element.offsetWidth;
//       var btnHeight = element.offsetHeight;
//       var btnTop = element.offsetTop;
//       var btnLeft = element.offsetLeft;
//       var leftRange = [left, left+width];
//       var topRange = [top, top+height];
//       if(!((e.clientY < (top+height)) && (e.clientY > top) && (e.clientX < (left+width)) && (e.clientX > left)) && 
//         !((e.clientY < (btnTop+btnHeight)) && (e.clientY > btnTop) && (e.clientX < (btnLeft+btWidth)) && (e.clientX > btnLeft))){
//         openToggle(id);
//       }
//     }
//   })
// }
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