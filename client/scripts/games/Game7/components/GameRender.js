import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';
import { scaleGameBody } from '../../../../scripts/utils/CommonGameUtils';
import { delay } from '../../../../scripts/AppDispatcher';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, timeConstants} from '../constants/SattiHelper'

import DeckComponent from './DeckComponent';
import StatusComponent from './StatusComponent';

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
	console.log('getStateCall');
	return {
		activePlayerPos,
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
export default class GameRender extends Component {
	state = {
		zoomStyle : {}
	}
	static contextTypes = {
		ifOnline: PropTypes.bool,
		ifOverlayShown: PropTypes.func
	}
	constructor(props){
		super(props);
		this.updateFlag = true;
		this.handleResize = this.handleResize.bind(this);
	}
	getUpdateFlag(){
		return this.updateFlag;
	}
	componentWillUnmount(){
		if(window.detachEvent) {
		    window.detachEvent('onresize', this.handleResize);
		}
		else if(window.removeEventListener) {
		    window.removeEventListener('resize', this.handleResize);
		}
		AnimEngine.cancelAnimationFrame();
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
		AnimEngine.startListening();
	}
	componentDidUpdate(){
		let ifOnline = this.context.ifOnline;
		let { gameState, botState } = this.props;
		let action;
		switch(gameState){
			case 'INIT_ROUND':
				action   = ifOnline ? GameActions.onlineInitRoundSuccess : GameActions.initRoundSuccess;
				break;
			case 'DISTRIBUTING_CARDS':
				action   = ifOnline ? GameActions.onlineDistributionSuccess : GameActions.distributionSuccess;
				break;
			case 'PLAYING_CARD':
				action   = ifOnline ? GameActions.playedWaitForServer : GameActions.playCardSuccess;
				break;
			case 'PLAYING_PLAYED_CARD':
				action   = ifOnline ? GameActions.playCardSuccessOnline : '';
				break;
			case 'GAME_END':
			case 'ROUND_END':
				action   = ifOnline ? GameActions.showScoresOnline : GameActions.showScores;
				break;
			case 'READY_TO_PLAY_NEXT':
				if(botState == 'BOT_SHOULD_PLAY'){
					action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
				}else if(!ifOnline && botState == 'BOT_CANNOT_PLAY'){
					action = null;
				}else if(!ifOnline && botState == 'BOT_PLAYING_CARD'){
					action = null;
				}else if(ifOnline){
					action = null;
				}
				break;
			case 'ROUND_END_SHOW_SCORES':
				this.cancelAnimationFrame();
				break;
			case 'INIT_ROUND_SUCCESS':
			case 'GAME_STARTED':
			case 'INIT_DECK':
			case 'NOW_NEXT_TURN':
			case 'PLAY_DATA_RECEIVED':
			case 'SKIP_DATA_RECEIVED':
				break;
		}
		if(typeof action == "function"){
			delay(timeConstants.DISPATCH_DELAY).then(function(){
				action();
			});
		}
		this.updateFlag = false;
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
		this.updateFlag = true;
		if(this.props.gamePause != nextProps.gamePause){
			GameActions.togglePauseGame();
		}
		// if(nextProps.gamePause) this.context.ifOverlayShown(true);
		// 	else this.context.ifOverlayShown(false);
	}
	deleteLocalStore(){
		localStorage.removeItem('gameData');
	}
	render() {
		let style = {
			position	: 'relative',
			width		: gameCSSConstants.gameBody.width,
			height		: gameCSSConstants.gameBody.height
			,overflow	: 'hidden'
		}
		let zoomStyle = this.state.zoomStyle;
		style = Object.assign(style, zoomStyle);
		return (
	      <div style={style}>
	        <StatusComponent 
	        			activePlayerPos 	= {this.props.activePlayerPos}
						gameState			= {this.props.gameState}
						gameTurn			= {this.props.gameTurn}
						botState			= {this.props.botState}
						players 			= {this.props.players}
						playableCount 		= {this.props.playableCount}
						requestShowScore    = {this.props.requestShowScore}
						scoresUpdated       = {this.props.scoresUpdated}
						ifWaiting           = {this.props.ifWaiting}
						getUpdateFlag		= {this.getUpdateFlag.bind(this)}/>
			<DeckComponent
						deck                = {this.props.deck}
						gameState			= {this.props.gameState}
						activePlayerPos     = {this.props.activePlayerPos}
						ifIAmBot            = {this.props.ifIAmBot}
						getUpdateFlag		= {this.getUpdateFlag.bind(this)}/>
	      </div>
	    )
	}
}