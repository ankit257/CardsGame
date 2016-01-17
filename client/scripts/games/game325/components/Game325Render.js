import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';

import { scaleGameBody } from '../../../../scripts/utils/CommonGameUtils';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, timeConstants} from '../constants/SattiHelper'

import DeckComponent from './DeckComponent';
import StatusComponent from './StatusComponent';
import TrumpComponent from './TrumpComponent';

import * as GameActions from '../actions/GameActions';


import GameStoreOffline from '../stores/GameStore';
import GameStoreOnline from '../stores/GameStoreOnline';
import AnimEngine from '../utils/AnimEngine'

function getState(props, ifOnline){
	let GameStore;
	if(ifOnline){
		GameStore = GameStoreOnline;
	}else{
		GameStore = GameStoreOffline;
	}
	let activePlayerPos = GameStore.getGameProperty('activePlayerPos');
	let otherPlayerPos = GameStore.getGameProperty('otherPlayerPos');
	let gameState = GameStore.getGameProperty('state');
	let botState = GameStore.getGameProperty('botState');
	let players = GameStore.getGameProperty('players');
	let gameTurn = GameStore.getGameProperty('gameTurn');
	let playableCount = GameStore.getPlayableCount();
	let requestShowScore = GameStore.getShowScore();
	let scoresUpdated = GameStore.getScoreUpdated();
	let ifWaiting = GameStore.ifGameWaiting();
	let deck = GameStore.getGameProperty('deck');
	let ifIAmBot = GameStore.ifIAmSpectatorOrBot();
	let action = GameStore.getNextAction();
	return {
		activePlayerPos,
		otherPlayerPos,
		gameState,
		gameTurn,
		botState,
		players,
		playableCount,
		requestShowScore,
		scoresUpdated,
		ifWaiting,
		deck,
		ifIAmBot,
		action
	};
}
@connectToGameStores([GameStoreOffline, GameStoreOnline], getState)
export default class Game325Render extends Component {
	state = {
		zoomStyle : {}
	}
	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	constructor(props){
		super(props);
		this.handleResize = this.handleResize.bind(this);
	}
	componentWillMount(){
	}
	componentWillUnmount(){
		if(window.detachEvent) {
		    window.detachEvent('onresize', this.handleResize);
		}
		else if(window.removeEventListener) {
		    window.removeEventListener('resize', this.handleResize);
		}
	}
	componentDidMount(){
		this.setState({
			zoomStyle: scaleGameBody(gameCSSConstants)
		});
		if(window.attachEvent) {
		    window.attachEvent('onresize', this.handleResize);
		}
		else if(window.addEventListener) {
			window.addEventListener('resize', this.handleResize);
		}
		// GameActions.initGame();
	}
	componentDidUpdate(){
		// let ifOnline = this.context.ifOnline;
		let { gameState, botState, action } = this.props;
		// console.log(gameState)
		if(typeof action == "function"){
			// console.log('Action is Fn: '+gameState);
			action();
		}
		// console.log('Rendering TIME : '+ (Date.now()-this.state.time));
	}
	handleResize(e){
		this.setState({
				zoomStyle: scaleGameBody(gameCSSConstants)
			});
	}
	shouldComponentUpdate(nextProps){
		return this.props.gamePause == nextProps.gamePause;
	}
	componentWillReceiveProps(nextProps){
		if(this.props.gamePause != nextProps.gamePause){
			GameActions.togglePauseGame();
		}
	}
	deleteLocalStore(){
		localStorage.removeItem('gameData');
	}
	render() {
		let style = {
			position	: 'relative',
			width		: gameCSSConstants.gameBody.width,
			height		: gameCSSConstants.gameBody.height,
			overflow	: 'hidden'
		}
		let zoomStyle = this.state.zoomStyle;
		style = Object.assign(style, zoomStyle);
		return (
	      <div style={style}>
	        <StatusComponent />
	        <DeckComponent />
	        <TrumpComponent />
	      </div>
	    )
	}
}