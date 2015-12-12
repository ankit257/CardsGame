import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';
import ScoresStore from '../../../../scripts/stores/ScoresStore';
import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
import classNames from 'classnames/dedupe';
import _ from 'underscore';

import GameStoreOffline from '../stores/GameStore';
import GameStoreOnline from '../stores/GameStoreOnline';

import * as GameActions from '../actions/GameActions';

import PlayerComponent from './PlayerComponent'
import XPComponent from './XPComponent'

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
	let savedscore = ScoresStore.getScores('game7');
	let xp = savedscore.stats.xp
	return {
		activePlayerPos,
		gameState,
		gameTurn,
		botState,
		players,
		playableCount,
		requestShowScore,
		scoresUpdated,
		xp,
		ifWaiting
	};
}


@connectToGameStores([GameStoreOffline, GameStoreOnline, ScoresStore], getState)
export default class StatusComponent extends Component {
	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	constructor(props){
		super(props);
		this.showScore = this.showScore.bind(this);
		this.hideScore = this.hideScore.bind(this);
		this.startNextRound = this.startNextRound.bind(this);
		this.toggleTable = this.toggleTable.bind(this);
	}
	componentWillUnmount(){
		delete this.props;
		delete this.state;
		this.props = {};
	}
	state = {
		status : '',
		showScores: false,
		showTable: false
	}
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
		this.updateSelf();
		if(nextProps.requestShowScore){
			this.showScore();
		}
	}
	requestServerBots(){
		GameActions.requestDistribution();
	}
	getPlayerName(position){
		if(position){
			return this.props.players[position].name;
		}else{
			return null;
		}
	}
	toggleTable(){
		this.setState({
			showTable: !this.state.showTable
		})
	}
	startNextRound(){
		GameActions.initStartGame();
		this.hideScore();
	}
	updateSelf(){
		let status = '';
		let gameState = this.props.gameState;
		let gameTurn = this.props.gameTurn;
		let activePlayerPos = this.props.activePlayerPos;
		let activePlayerName = this.getPlayerName(activePlayerPos);
		let playableCount = this.props.playableCount[activePlayerPos];
		// console.log(activePlayerPos);
		// console.log(this.props.playableCount);
		switch(gameState){
			case 'INIT_DECK':
			case 'INIT_PLAYERS':
			case 'INIT_ROUND':
			case 'DISTRIBUTING_CARDS':
				status = 'Starting new game'
				break;
			case 'PLAYING_CARD':
			case 'READY_TO_PLAY_NEXT':
				if(activePlayerPos == 0){
					if(gameTurn == 1){
						status = 'Your turn. Play SEVEN of SPADES to start the game!'
					}else if(playableCount == 0){
						status = 'No cards to play. Skipping turn.'
					}else{
						status = 'Your turn. Play card.'
					}
				}else{
					if(playableCount == 0){
						// status = activePlayerName + ' has no card to play. Skipping turn...'
					}else{
						// status = activePlayerName + '\'s turn. Playing card.'
					}
				}
				break;
			case 'ROUND_END':
				status = 'End of this round';
				break;
		}
		this.setState({
			status : status
		});
	}
	showScore(){
		this.setState({
			showScores: true
		});
	}
	hideScore(){
		GameActions.hideScoreUpdated(this.context.ifOnline);
		this.setState({
			showScores: false,
			showTable: false
		});
	}
	render() {
		let xp = this.props.xp;
		let ifWaiting = this.props.ifWaiting;
		let status = this.state.status;
		let players = this.props.players;
		let activePlayerPos = this.props.activePlayerPos;
		let gameState = this.props.gameState;
		let showScores = this.state.showScores;
		let showTable = this.state.showTable;
		let scoresUpdated = this.props.scoresUpdated;
		let className = 'game-status';
		let adminButtonStyle = {display: 'none'};
		let tableButtonStyle = {zIndex: gameCSSConstants.zIndex.SCORE + 2};
		let style = {
			width: gameCSSConstants.gameBody.width - 2*(gameCSSConstants.cardSize.height - 2*gameCSSConstants.cardSize.height*gameCSSConstants.cardOffset.screenOut),
			bottom: -gameCSSConstants.gameBody.height + gameCSSConstants.gameBody.padding + gameCSSConstants.cardSize.height + gameCSSConstants.player.statusOffset
		}
		let scoreButtonStyle ={
			bottom: gameCSSConstants.cardSize.height + gameCSSConstants.player.statusOffset
		}
		let overlayStyle = {
			width: 0,
			height: 0,
			backgroundColor: 'rgba(0,0,0,0)',
			zIndex: gameCSSConstants.zIndex.SCORE
		}
		let tableButtonClass = {'table-button mdl-button mdl-js-button': true, 'show': false, 'shown': false}, tableButtonText = '';
		let showScoreButtonClass = {'score-button mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab': true, 'show' : false};
		let nextButtonClass = _.extend({}, showScoreButtonClass), okButtonClass = _.extend({}, showScoreButtonClass);
		showScoreButtonClass.show = true;
		if(showScores){
			style.bottom = gameCSSConstants.gameBody.height/2 + 2*gameCSSConstants.score.height/3;
			style.fontSize = 20;
			className = 'game-status score';
			if(gameState == 'ROUND_END_SHOW_SCORES' && !this.context.ifOnline){
				status = 'Well Played! Time for scores.';
				nextButtonClass.show = true;
				okButtonClass.show = false;
			}else{
				okButtonClass.show = true;
				nextButtonClass.show = false;
			}
			showScoreButtonClass.show = false;
			overlayStyle = {
				width: gameCSSConstants.gameBody.width,
				height: gameCSSConstants.gameBody.height,
				backgroundColor: 'rgba(50,50,50,0.8)',
				zIndex: gameCSSConstants.zIndex.SCORE
			}
			if(showTable){
				style.fontSize = 0;
				tableButtonClass.show = true, tableButtonClass.shown = true, tableButtonText = 'Compact';
			}else{
				tableButtonClass.show = true, tableButtonClass.shown = false, tableButtonText = 'Tabular';
			}
		}
		if(ifWaiting){
			showScoreButtonClass.show = false;
			overlayStyle = {
				width: gameCSSConstants.gameBody.width,
				height: gameCSSConstants.gameBody.height,
				backgroundColor: 'rgba(50,50,50,0.8)',
				zIndex: gameCSSConstants.zIndex.SCORE
			}
			style.bottom = gameCSSConstants.gameBody.height/2 + 2*gameCSSConstants.score.height/3 + 20;
			style.fontSize = 18;
			className = 'game-status score';
			status = 'Waiting for other players to join';
		}
		if(players){
			let numberOfHumans = 0, ifIAmAdmin = false;
			players.map(player=>{
				if(player.type == 'HUMAN' || player.type == 'ADMIN') numberOfHumans++;
				if(player.position == 0 && player.type == 'ADMIN') ifIAmAdmin = true;
			})
			if(numberOfHumans >= 2 && ifIAmAdmin && ifWaiting){
				adminButtonStyle = {
					display: 'block',
					bottom: gameCSSConstants.gameBody.height/2 - 3*gameCSSConstants.score.height/2
				}
				status = 'Still waiting for other players?';
			}
		}
		if(!showScores && scoresUpdated){
			showScoreButtonClass.show = true;
			showScoreButtonClass['score-updated'] = true;
		}
		if(this.context.ifOnline){
			nextButtonStyle = {
				display : 'none'
			}
		}
		style.left = gameCSSConstants.gameBody.width/2 - style.width/2;
		return(
			<div style={overlayStyle} className="score-overlay">
				<div className = {className} style={style}>
					{status}
				</div>
				<XPComponent xp={xp} showScores={showScores}/>
				<PlayerComponent players={players} activePlayerPos={activePlayerPos} showScores={showScores} ifWaiting={ifWaiting} showTable={showTable}/>
				<div className='admin-status' style={adminButtonStyle} >
					If it's taking too long for other players to join, you can start now with bots. Players can join the same game later.
					<button onClick={this.requestServerBots} className={'request-bot-button'}>Start Game </button>
				</div>
				<button onClick={this.startNextRound} onTouch={this.startNextRound} style={scoreButtonStyle} className={classNames(nextButtonClass)}>
					<i className='material-icons'>check_circle</i>
				</button>
				<button onClick={this.showScore} onTouch={this.showScore} style={scoreButtonStyle} className={classNames(showScoreButtonClass)}>
					<i className='material-icons'>toys</i>
				</button>
				<button onClick={this.hideScore} onTouch={this.hideScore} style={scoreButtonStyle} className={classNames(okButtonClass)}>
					<i className='material-icons'>check_circle</i>
				</button>
				<button onClick={this.toggleTable} onTouch={this.toggleTable} style={tableButtonStyle} className={classNames(tableButtonClass)}>{tableButtonText}</button>
			</div>
			)
	}
}