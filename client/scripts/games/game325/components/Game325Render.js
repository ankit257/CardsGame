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
		ifIAmBot
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
		let { gameState, botState } = this.props;
		let action;
		// switch(gameState){
		// 	case 'INIT_ROUND':
		// 		action   = ifOnline ? GameActions.initRoundOnlineSuccess : GameActions.initRoundSuccess;
		// 		break;
		// 	case 'DISTRIBUTING_CARDS_0':
		// 		action   = ifOnline ? GameActions.distributingCardsZeroOnlineSuccess : GameActions.distributingCardsZeroSuccess;
		// 		break;
		// 	case 'DEALER_SELECTION_SUCCESS':
		// 		action   = ifOnline ? GameActions.onlineStartGame : GameActions.startGame;
		// 		break;
		// 	case 'SELECT_DEALER':
		// 		action   = GameActions.selectDealerSuccess;
		// 		break;
		// 	case 'SET_TRUMP_SUCCESS':
		// 		// action   = ifOnline ? GameActions.onlineTrumpSetSuccess : GameActions.trumpSetSuccess;
		// 		break;
		// 	case 'DISTRIBUTING_CARDS_1':
		// 		action   = ifOnline ? GameActions.onlineDistributionFirstSuccess : GameActions.distributionFirstSuccess;
		// 		break;
		// 	case 'DISTRIBUTING_CARDS_2':
		// 		action   = ifOnline ? GameActions.onlineDistributionSecondSuccess : GameActions.distributionSecondSuccess;
		// 		break;
		// 	case 'PLAYING_CARD':
		// 		action   = ifOnline ? GameActions.playedWaitForServer : GameActions.playCardSuccess;
		// 		break;
		// 	case 'PLAYING_PLAYED_CARD':
		// 		action   = ifOnline ? GameActions.playCardSuccessOnline : '';
		// 		break;
		// 	case 'WITHDRAWING_CARD':
		// 		action   = ifOnline ? GameActions.onlineWithdrawCardSuccess : GameActions.withdrawCardSuccess;
		// 		break;
		// 	case 'RETURNING_CARD':
		// 		action   = ifOnline ? GameActions.onlineReturnCardSuccess: GameActions.returnCardSuccess;
		// 		break;
		// 	case 'ROUND_END':
		// 		action   = GameActions.showScores;
		// 		break;
		// 	case 'MOVE_HAND':
		// 		action   = ifOnline ? GameActions.onlineMoveHandSuccess : GameActions.moveHandSuccess;
		// 		break;
		// 	case 'SET_TRUMP':
		// 		if(botState == 'BOT_SHOULD_PLAY'){
		// 			action = ifOnline ? '' : GameActions.botWillPlay;
		// 		}else if(!ifOnline && botState == 'BOT_CANNOT_PLAY'){
		// 			action = null;
		// 		}else if(!ifOnline && botState == 'BOT_PLAYING_CARD'){
		// 			action = null;
		// 		}
		// 		break;
		// 	case 'WITHDRAW_CARD':
		// 		if(botState == 'BOT_SHOULD_PLAY'){
		// 			action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
		// 		}else if(botState == 'BOT_CANNOT_PLAY'){
		// 			action = null;
		// 		}else if(botState == 'BOT_PLAYING_CARD'){
		// 			action = null;
		// 		}
		// 		break;
		// 	case 'RETURN_CARD':
		// 		if(botState == 'BOT_SHOULD_PLAY'){
		// 			action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
		// 		}else if(botState == 'BOT_CANNOT_PLAY'){
		// 			action = null;
		// 		}else if(botState == 'BOT_PLAYING_CARD'){
		// 			action = null;
		// 		}
		// 		break;
		// 	case 'READY_TO_PLAY_NEXT':
		// 		if(botState == 'BOT_SHOULD_PLAY'){
		// 			action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
		// 		}else if(botState == 'BOT_CANNOT_PLAY'){
		// 			action = null;
		// 		}else if(botState == 'BOT_PLAYING_CARD'){
		// 			action = null;
		// 		}
		// 		break;
		// 	case 'ROUND_END_SHOW_SCORES':
		// 		break;
		// 	case 'PLAY_DATA_RECEIVED':
		// 	case 'INIT_ROUND_SUCCESS':
		// 	case 'GAME_STARTED':
		// 	case 'INIT_DECK':
		// 	case 'DISTRIBUTE_CARDS_SUCCESS':
		// 	case 'NOW_NEXT_TURN':
		// 		break;
		// }
		if(typeof action == "function"){
			action();
		}
		this.updateFlag = false;
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