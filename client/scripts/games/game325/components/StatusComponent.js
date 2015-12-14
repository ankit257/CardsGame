import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
// import connectToStores from '../../../../scripts/utils/connectToStores';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';
import ScoresStore from '../../../../scripts/stores/ScoresStore';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import GameStoreOffline from '../stores/GameStore';
import GameStoreOnline from '../stores/GameStoreOnline';

import * as GameActions from '../actions/GameActions';

import PlayerComponent from './PlayerComponent';
import XPComponent from './XPComponent';
import selectn from 'selectn';
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
	let savedscore = ScoresStore.getScores('game325');
	let xp = selectn('stats.xp', savedscore);	
	
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

@connectToGameStores([GameStoreOffline, GameStoreOnline], getState)
export default class StatusComponent extends Component {
	constructor(props){
		super(props);
		this.showScore = this.showScore.bind(this);
		this.hideScore = this.hideScore.bind(this);
		this.startNextRound = this.startNextRound.bind(this);
	}
	state = {
		status : '',
		showScores: false
	}
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
		this.updateSelf();
		if(nextProps.requestShowScore){
			this.showScore();
		}
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
		let otherPlayerId = this.props.otherPlayerId;
		let activePlayerName = this.getPlayerName(activePlayerPos);
		let otherPlayerName = this.getPlayerName(otherPlayerId);
		let playableCount = this.props.playableCount[activePlayerPos];
		console.log('GameStatus:'+gameState+'___ActivePlayer:'+activePlayerPos)
		switch(gameState){
			case 'INIT_DECK':
			case 'INIT_PLAYERS':
			case 'INIT_ROUND':
			case 'SET_TRUMP':
				if(activePlayerPos == 0){
					var msg = 'Your';
				}else{
					var msg = activePlayerName+"'s";
				}
				status = msg+' turn. Set Trump';
				break;
			case 'DISTRIBUTING_CARDS':
				status = 'Starting new game'
				break;
			case 'GAME325_WITHDRAW_CARD':
				var string = 'ACTIVEPLAYER Turn. Select a card from OTHERPLAYER \'s deck to withdraw card';
				if(activePlayerPos == 0){
					status = string.replace('ACTIVEPLAYER', 'Your');
				}else{
					status = string.replace('ACTIVEPLAYER', activePlayerName+"'s");
				}
				status = status.replace('OTHERPLAYER', otherPlayerName);
				break;
			case 'GAME325_RETURN_CARD':
				var string = 'ACTIVEPLAYER Turn. Select a card from your deck to return card to OTHERPLAYER';
				if(activePlayerPos == 0){
					status = string.replace('ACTIVEPLAYER', 'Your');
				}else{
					status = status.replace('ACTIVEPLAYER', activePlayerPos+"'s");
				}
				status = status.replace('OTHERPLAYER', otherPlayerName);
				break;
			case 'PLAYING_CARD':
			case 'READY_TO_PLAY_NEXT':
				if(activePlayerPos == 0){
					if(gameTurn == 1){
						status = 'Your turn. Play Card'
					}else if(playableCount == 0){
						status = 'No cards to play. Skipping turn.'
					}else{
						status = 'Your turn. Play card.'
					}
				}else{
					if(playableCount == 0){
						status = activePlayerName + ' has no card to play. Skipping turn...'
					}else{
						status = activePlayerName + '\'s turn. Playing card.'
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
		this.setState({
			showScores: false
		});
	}
	calculatePlayersPos(players){
		var i = 0;
		var c = (500 - (100*(players.length)))/(players.length+1);
		var left = c;
		for(let player of players){
			player.x = left + i*100;
			i++;
			left = left+c;
			player.y = 300;
		}
		return players;
	}
	render() {
		let xp = this.props.xp;
		let ifWaiting = this.props.ifWaiting;
		let status = this.state.status;
		let players = this.props.players;
		if(ifWaiting){
			players = this.calculatePlayersPos(players)	
		}
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
		let showScoreButtonStyle ={
			bottom: style.bottom
		}
		let overlayStyle = {
			width: 0,
			height: 0,
			backgroundColor: 'rgba(0,0,0,0)',
			zIndex: gameCSSConstants.zIndex.SCORE
		}
		let nextButtonStyle = {zIndex: gameCSSConstants.zIndex.SCORE+3}, okButtonStyle = {zIndex: gameCSSConstants.zIndex.SCORE + 2};
		let nextButtonClass = 'ok-button';
		let okButtonClass = 'ok-button';
		let tableButtonClass = 'table-button', tableButtonText = '';
		let showScoreButtonClass = 'show-score-button show';
		if(showScores){
			style.bottom = gameCSSConstants.gameBody.height/2 + 2*gameCSSConstants.score.height/3;
			style.fontSize = 20;
			className = 'game-status score';
			if(gameState == 'ROUND_END_SHOW_SCORES' && !this.context.ifOnline){
				status = 'Well Played! Time for scores.';
				nextButtonClass = 'ok-button show';
				okButtonClass = 'ok-button';
				okButtonStyle.display= 'none';
				nextButtonStyle.backgroundColor = '#E91E63';
			}else{
				okButtonClass = 'ok-button show';
				nextButtonClass = 'ok-button';
				nextButtonStyle.display= 'none';
			}
			showScoreButtonClass = 'show-score-button';
			overlayStyle = {
				width: gameCSSConstants.gameBody.width,
				height: gameCSSConstants.gameBody.height,
				backgroundColor: 'rgba(50,50,50,0.8)',
				zIndex: gameCSSConstants.zIndex.SCORE
			}
			if(showTable){
				style.fontSize = 0;
				tableButtonClass = 'table-button show shown', tableButtonText = 'Compact';
			}else{
				tableButtonClass = 'table-button show', tableButtonText = 'Tabular';
			}
		}
		if(ifWaiting){
			showScoreButtonStyle = {
				display: 'none'
			}
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
			showScoreButtonClass = 'show-score-button score-updated show';
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
				<button onClick={this.startNextRound} onTouch={this.startNextRound} style={nextButtonStyle} className={nextButtonClass}>N</button>
				<button onClick={this.showScore} onTouch={this.showScore} style={showScoreButtonStyle} className={showScoreButtonClass}>S</button>
				<button onClick={this.hideScore} onTouch={this.hideScore} style={okButtonStyle} className={okButtonClass}>ok</button>
				<button onClick={this.toggleTable} onTouch={this.toggleTable} style={tableButtonStyle} className={tableButtonClass}>{tableButtonText}</button>
			</div>
			)
	}
}