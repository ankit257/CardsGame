import React, { PropTypes, Component } from 'react';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
import { Howl, Howler } from 'howler';
import DocumentTitle from 'react-document-title';
import * as LoginActions from '../actions/LoginActions';
import * as GameRoomActions from '../actions/GameRoomActions';
import connectToStores from '../utils/connectToStores';
import _ from 'underscore';
import classNames from 'classnames/dedupe';
import selectn from 'selectn';
import  { getCardCSS, getCardSuit, getColorClass, globalVars, getCardPic, getRankForHTML, getSuitForHTML } from '../utils/CommonUtils'
import * as LocalStorage from '../utils/LocalStorageUtils'
import NavBarComponent from '../components/NavBarComponent'

var style={
  fontColor : '#bebebe'
} 
let tadaAudio = new Howl({
  urls: ['../assets/sounds/tada.mp3'],
  autoplay: false
})
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
  let settings = SettingsStore.getSettings();
  // const gameRoom = GameRoomStore.get();
  return {
    User,
    settings
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
      // activeTab : 'colors',
      activeColor : '',
      css : {
        container : {
          paddingTop : '50px',
          width : '1080px',
          margin : '0 auto',
        }
      },
      classes : {
        activeCardBack : '',
        // activeCardFront : 'cardFront1',
        backgroundTab : 'activeSettingsTab',
        deckBackTab:'',
        // deckFrontTab:'',
        backgroundSettings : 'activeSettings', 
        deckBackSettings : '', 
        // deckFrontSettings : '',
        // CardsFront : 'cardFront1',
        // CardsFront_2 : { 
        //   CheckBox : '',
        // },
        // CardsFront_1 : { 
        //   CheckBox : '',
        // }
      }
    }
  }
  componentWillMount() {
    var newState = _.extend({}, this.state);
    newState.activeColor = this.props.settings.activeColor;
    newState.classes.activeCardBack = this.props.settings.activeCardBack;
    newState.volume = this.props.settings.volume;
    this.reRender(newState);
    if(!this.props.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  componentDidUpdate(){
    setTimeout(function(){
      componentHandler.upgradeAllRegistered();
    },20);
  }
  componentDidMount(){
    setTimeout(function(){
      componentHandler.upgradeAllRegistered();
    },20);
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
      backgroundTab : '',
      deckBackTab:'',
      backgroundSettings : '', 
      deckBackSettings : '',
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
    // console.log('sett');
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
    var newState = _.extend({}, this.state);
    newState.activeColor = color;
    this.reRender(newState);
  }
  selectCardBack(card){
    var newState = _.extend({}, this.state);
    newState.classes.activeCardBack = card;
    this.reRender(newState);
  }
  changeVolume(e){
    var newState = _.extend({}, this.state);
    newState.volume = e.target.value;
    Howler.volume(e.target.value);
    tadaAudio.play();
    e.target.MaterialSlider.change(e.target.value);
    this.reRender(newState);
  }
  applySettings(e){
    if(e){
      e.preventDefault();
    }
    let settings = {
      activeColor: this.state.activeColor,
      activeCardBack: this.state.classes.activeCardBack,
      volume: this.state.volume
    }
    LoginActions.applySettings(settings);
    this.context.history.replaceState(null, `/games`, null);
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
    var backCardsArray = [];
    cardBacks.map(function (card, index){
      var CheckBox;
      if(self.state.classes.activeCardBack == card){
        CheckBox = 'card selected';
      }else{
        CheckBox = 'card';
      }
      var t = <div key={index} className="selectCard">
                <div className={CheckBox} onClick={self.selectCardBack.bind(self, card)}>
                  <img className="back" src={card} />
                </div>
              </div>
      backCardsArray.push(t)
    });
    var colorsArray = [];
    var self = this;
    bgColors.map(function (color, index){
      var t = <div key={index} className={classNames(['color-list-block'], getColorClass(color.color, index, self.state.activeColor))} onClick={self.selectBackgroundColor.bind(self, color)}>
              <div className="colorBlock" style={{backgroundColor: color.color}}></div>
              <div className="color-name">
                { color.name }
              </div>
            </div>
      colorsArray.push(t)
    })
    return (
      <div>
        <div className={this.state.activeColor.name+'-img fixed-bkg'}></div>
        <div className="">
        <NavBarComponent User={User} heading={{icon: 'settings', text: 'Customise your gameplay'}}/>
        <div className="form form-center">
          <div className="opt-screen settingsBlock mdl-tabs mdl-js-tabs mdl-js-ripple-effect">
            <div className="mdl-tabs__tab-bar">
                <a href="#background-panel" className="mdl-tabs__tab is-active">
                  <i className="material-icons md-18">format_color_fill</i>
                  Background
                </a>
                <a href="#backcard-panel" className="mdl-tabs__tab">
                  <i className="material-icons md-18">wallpaper</i>
                  Deck Back</a>
                <a href="#sound-panel" className="mdl-tabs__tab">
                  <i className="material-icons md-18">volume_down</i>
                  Sound
                </a>
            </div>

            <div className="mdl-tabs__panel colors-list is-active" id="background-panel">
              { colorsArray }
            </div>
            <div className="mdl-tabs__panel backcards-list" id="backcard-panel">
              { backCardsArray }
            </div>
            <div className="mdl-tabs__panel volume-control" id="sound-panel">
              <i className="material-icons">volume_mute</i>
              <input className="mdl-slider mdl-js-slider" id="s1" type="range" min="0" max="1" step="0.1" value={this.state.volume} onChange={this.changeVolume.bind(this)}/>
              <i className="material-icons">volume_up</i>
            </div>
          </div>
        </div>
        <button className="apply-settings mdl-button mdl-js-button mdl-button--fab mdl-button--colored" onClick={this.applySettings.bind(this)}>
          <i className="material-icons">done</i>
        </button>
      </div>
      </div>
      )
    }
}