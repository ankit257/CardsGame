import React from 'react';
import { register, waitFor } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import selectn from 'selectn';
import { Howl } from "howler"
import * as GameActions from '../actions/GameActions';
import PauseStore from '../stores/PauseStore';
import { timeConstants, gameVars } from '../constants/SattiHelper'

import PlayingCard from '../utils/PlayingCard';
import GameSatti from '../utils/GameSatti';
import PlayerSatti from '../utils/PlayerSatti';
import BotSatti from '../utils/BotSatti';
import ScoreSatti from '../utils/ScoreSatti';

// let passAudio = new Howl({
// 	urls: ['assets/sounds/pass.mp3'],
// 	autoplay: false
// }),
// bellAudio = new Howl({
// 	urls: ['assets/sounds/bell.mp3'],
// 	autoplay: false
// }),
// tadaAudio = new Howl({
// 	urls: ['assets/sounds/tada.mp3'],
// 	autoplay: false
// })

var _game = {}
var _playersCards = []
var _playableCount = []
var _showScore = false
var _pauseState = false;
var _scoreUpdated = false;

const GameStore = createStore( {
	type : 'offline',
	getGameObj(){
		return _game;
	},
	refreshStore(){
		_game = {}
		_playersCards = []
		_playableCount = []
		_showScore = false
		_pauseState = false;
		_scoreUpdated = false;
	},
	ifGameWaiting(){
		return false;
	},
	ifIAmSpectatorOrBot(){
		return false;
	},
	getCardState(card){
		return _game.getCardState(card);
	},
	getGameProperty(property){
		return _game[property];
	},
	updateCardState(card, state){
		_game.updateCardState(card, state);
	},
	setGameState(gameState){
		_game.state = gameState;
	},
	updateBotState(botState){
		_game.botState = botState;
	},
	updatePlayedCards(card){
		delete _game.cardPlayed;
		_game.addPlayedCard(card);
	},
	updatePlayableCards(){
		_game.updatePlayableCards();
		this.setPlayableCount();
	},
	updatePlayerScores(playerpos, penalty){
		_game.players[playerpos].score.penalty.push(penalty);
	},
	setPlayerState(pos, state){
			if(_game.players[pos].state != 'CLEARED' && state=='CLEARED'){
				// bellAudio.play();
			}
			_game.players[pos].state = state;
	},
	setCardPositionByState(){
		_game.deck.map(deckcard=> {deckcard.setPositionByState();});
	},
	setRoundEndPos(){
		_game.deck.map(deckcard=> deckcard.setRoundEndPosition());
	},
	initGame(){
		_game = new GameSatti();
		_game.initPlayers();
	},
	initDeck(){
		_game.initDeck();
	},
	initRound(){
		_game.initRound();
	},
	distributeCards(){
		_game.distributeCards();
	},
	distributionDone(){
		_game.distributionDone();
	},
	checkBotPlay(){
		_game.checkBotPlay();
	},
	checkTurnSkip(){
		_game.checkTurnSkip('offline');
	},
	playBot(){
		let card = _game.playBot(_playersCards[_game.activePlayerPos]);
		setTimeout(function(){
				GameActions.playCard(card);
			}, timeConstants.DISPATCH_DELAY);
	},
	playCard(card){
		_game.playCard(card, 'client');
	},
	nextTurn(){
		_game.nextTurn();
	},
	roundEnd(){
		// tadaAudio.play();
		_game.roundEnd();
	},
	fireInitRound(){
		setTimeout(function(){
			GameActions.initRound();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireDistributeCards(){
		setTimeout(function(){
			GameActions.distributeCards();
		}, timeConstants.DISPATCH_DELAY);	
	},
	fireShowScores(){
		setTimeout(function(){
			GameActions.showScores();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireNextTurn(){
		setTimeout(function(){
			GameActions.nextTurn(_game.gameTurn);
		}, timeConstants.DISPATCH_DELAY);	
	},
	fireInitStartGame(){
		setTimeout(function(){
			GameActions.initStartGame();
		}, timeConstants.DISPATCH_DELAY);
	},
	firePlayCardSuccess(){
		setTimeout(function(){
			GameActions.playCardSuccess();
		}, timeConstants.DISPATCH_DELAY);
	},
	initPlayersArray(){
		_playersCards = new Array();
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			_playersCards.push(new Array());
		}
	},
	getXP(){
		let xp = 0;
		_game.players.map(player=>{
			if(player.position == 0){
				let score = player.score;
				let penalty = score.penalty[score.penalty.length-1];
				if(penalty) {
					xp = Math.round((30-penalty)/3);
				}else{
					xp = 0;
				}
			}
		})
		if(xp<0) xp = 0;
		return xp;
	},
	updatePlayersArray(){
		this.initPlayersArray();
		if(_game.deck){
			for(let card of _game.deck){
				if(card.ownerPos != null && card.state=='DISTRIBUTED'){
					_playersCards[card.ownerPos].push(card);
				}
			}
		}
	},
	checkRoundEnd(){
		this.updatePlayersArray();
		if(_game.state == 'PLAYING_CARD'){
				for (var i = 0; i < gameVars.noOfPlayers; i++) {
					if(_playersCards[i].length == 0){
						this.setGameState('ROUND_END');
						continue;
					}
				};
			}
	},
	setPlayableCount(){
		_playableCount = [0, 0, 0, 0];
		for (var playerPos = 0; playerPos < gameVars.noOfPlayers; playerPos++) {
			for (var j = 0; j < _playersCards[playerPos].length; j++) {
				let card = _playersCards[playerPos][j];
				if(card.isPlayable){
					_playableCount[playerPos]++;
				}
			};
		};
		for (var playerPos = 0; playerPos < _playableCount.length; playerPos++) {
			let count = _playableCount[playerPos];
			if(count == 0){
				this.setPlayerState(playerPos, 'SKIP_TURN');
			}else{
				if(_game.players[playerPos].state != 'CLEARED'){
					this.setPlayerState(playerPos, 'CAN_PLAY');
				}
			}
		};
	},
	setClearedPlayers(){
		let _cleared = [true, true, true, true];
		for (var playerPos = 0; playerPos < gameVars.noOfPlayers; playerPos++) {
			for (var j = 0; j < _playersCards[playerPos].length; j++) {
				let card = _playersCards[playerPos][j];
				if(!card.isPlayable){
					_cleared[playerPos] = false;
					continue;
				}
			}
		}
		for (var playerPos = 0; playerPos < gameVars.noOfPlayers; playerPos++) {
			let cleared = _cleared[playerPos];
			if(cleared){
				this.setPlayerState(playerPos, 'CLEARED');
			}
		}
	},
	updateRoundPenalty(){
		let _roundPenalty = [{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0}];
		for (var playerPos = 0; playerPos < gameVars.noOfPlayers; playerPos++) {
			for (var j = 0; j < _playersCards[playerPos].length; j++) {
				let card = _playersCards[playerPos][j];
				if(!card.isPlayable){
					_roundPenalty[playerPos].isNotPlayable+=card.rank;
				}
				_roundPenalty[playerPos].total+=card.rank;
			}
			_game.players[playerPos].score.roundPenalty = _roundPenalty[playerPos];
		}
	},
	sortDeck(position){
		let array = _playersCards[position];
	    array.sort(function (a,b){
	       if (a.order > b.order){
	            return 1;
	        }
	        if (a.order < b.order){
	            return -1;
	        }
	        return 0;
	    });
	    return array;
	},
	updateCardIndex(){
		for(let deckcard of _game.deck){
			let index = this.setIndexFromArray(deckcard);
			let similar = _playersCards[deckcard.ownerPos].length;
			deckcard.index = index;
			deckcard.similar = similar;
		}
	},
	setIndexFromArray(card){
		if(card.ownerPos == null) return null;
		let playersCards = _playersCards;
		for (var i = 0; i < playersCards[card.ownerPos].length; i++) {
			let cardcopy = playersCards[card.ownerPos][i];
			if(card.suit == cardcopy.suit && card.rank == cardcopy.rank){
				return i;
			}
		};
	},
	getPlayableCount(){
		return _playableCount;
	},
	getPlayersCards(){
		this.updatePlayersArray();
		return _playersCards;
	},
	getPlayersCardsByPosition(position){
		return _playersCards[position];
	},
	setGameObj(gameObj){
		_game = gameObj;
	},
	showScores(){
		_showScore = true;
	},
	hideScores(){
		_showScore = false;
	},
	getShowScore(){
		return _showScore;
	},
	makeGameObj(gameData){
		let newGameData = new GameSatti();
		Object.assign(newGameData, gameData);
		// copy deck
		delete newGameData['deck'];
		newGameData.deck = new Array();
		gameData.deck.map(deckcard => {
			newGameData.deck.push(Object.assign(new PlayingCard(deckcard), deckcard));
		})
		// copy players
		delete newGameData['players'];
		newGameData.players = new Array();
		gameData.players.map(player => {
			if(player.type == 'HUMAN'){
				newGameData.players.push(Object.assign(new PlayerSatti(player), player));
			}else if(player.type == 'BOT'){
				newGameData.players.push(Object.assign(new BotSatti(player), player));
			}else {
				console.log('Weird');
			}			
		})
		newGameData.players.map(player => {
			delete player.score;
		})
		for (var i = 0; i < gameData.players.length; i++) {
			newGameData.players[i].score = Object.assign(new ScoreSatti(), gameData.players[i].score);
		};
		return newGameData;
	},
	actOnState(){
		switch(_game.state){
			case 'NOW_NEXT_TURN':
				GameStore.fireNextTurn();
				break;
			case 'PLAYING_CARD':
				GameStore.firePlayCardSuccess();
				break;
			case 'GAME_END':
			case 'ROUND_END':
				GameStore.fireShowScores();
				break;
			case 'GAME_STARTED':
				GameStore.fireInitRound();
				break;
			default:
				GameStore.fireInitStartGame();
				break;
			}
	},
	getPauseState(){
		return _pauseState;
	},
	togglePauseState(){
		_pauseState = !_pauseState;
	},
	scoreUpdatedTrue(){
		_scoreUpdated = true;
	},
	scoreUpdatedFalse(){
		_scoreUpdated = false;
	},
	getScoreUpdated(){
		return _scoreUpdated;
	}
});
GameStore.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	switch(action.type){
		case 'GAME7_OFFLINE_DISPLAY_GAME_STATE':
			console.log(GameStore.getGameObj());
			// GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME7_OFFLINE_INIT_GAME':
			GameStore.refreshStore();
			GameStore.initGame();
			GameStore.initDeck();
			GameStore.setCardPositionByState();
			GameStore.fireInitStartGame();			
			GameStore.emitAndSaveChange( 'gameData', {} );
			// GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_INIT_GAME_FROM_LOCAL':
			GameStore.refreshStore();
			let gameData = action.data;
			// console.log(gameData)
			let newGameData = GameStore.makeGameObj(gameData);
			GameStore.setGameObj(newGameData);
			GameStore.actOnState();
			// GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME7_OFFLINE_INIT_START_GAME':
			GameStore.hideScores();
			GameStore.setCardPositionByState();
			GameStore.setGameState('GAME_STARTED');
			GameStore.fireInitRound();
			GameStore.emitAndSaveChange( 'gameData', _game );
			// GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_INIT_ROUND':
			GameStore.initRound();
			GameStore.setCardPositionByState();
			GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_INIT_ROUND_SUCCESS':
			GameStore.initPlayersArray();
			GameStore.setCardPositionByState();
			GameStore.fireDistributeCards();
			GameStore.setGameState('INIT_ROUND_SUCCESS');
			GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_DISTRIBUTE_CARDS':
			GameStore.distributeCards();
			GameStore.updatePlayersArray();
			GameStore.sortDeck(0);
			GameStore.updateCardIndex();
			GameStore.setCardPositionByState();
			GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_DISTRIBUTE_CARDS_SUCCESS':
			GameStore.distributionDone();
			GameStore.setGameState('NOW_NEXT_TURN');
			GameStore.fireNextTurn();
			GameStore.setCardPositionByState();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME7_OFFLINE_BOT_HAS_PLAYED':
			GameStore.playBot();
			// GameStore.setCardPositionByState();
			// GameStore.emitChange();
			break;
		case 'GAME7_OFFLINE_PLAY_CARD':
			var card = action.card;
			GameStore.playCard(card);
			GameStore.updatePlayersArray();
			GameStore.updateRoundPenalty();
			GameStore.sortDeck(0);
			GameStore.updateCardIndex();
			GameStore.setCardPositionByState();
			var date = new Date();
       		console.log('GameStore '+date.getTime());
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME7_OFFLINE_PLAY_CARD_SUCCESS':
			var card = GameStore.getGameProperty('cardPlayed');
			GameStore.updateCardState(card, 'PLAYED');
			GameStore.updatePlayedCards(card);
			GameStore.checkRoundEnd();
			if(GameStore.getGameProperty('state') == 'ROUND_END'){
				GameStore.roundEnd();
				GameStore.setRoundEndPos();
			}else{
				// GameStore.updatePlayedCards(card);
				GameStore.updateBotState('BOT_READY');
				GameStore.setGameState('NOW_NEXT_TURN');
				GameStore.setCardPositionByState();
				GameStore.fireNextTurn();	
			}
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME7_OFFLINE_SKIP_TURN':
			// passAudio.play();
			break;
		case 'GAME7_OFFLINE_TURN_SKIPPED':
		 	GameStore.setGameState('NOW_NEXT_TURN');
		 	GameStore.fireNextTurn();		 	
		 	GameStore.emitAndSaveChange( 'gameData', _game );
		 	break;
		case 'GAME7_OFFLINE_NOW_NEXT_TURN':
		 	GameStore.nextTurn();
			GameStore.updatePlayersArray();
			GameStore.updatePlayableCards();
			GameStore.setClearedPlayers();
			GameStore.checkTurnSkip();
			GameStore.checkBotPlay();
			GameStore.setCardPositionByState();
		 	GameStore.emitChange();
		 	break;
		case 'GAME7_OFFLINE_SHOW_SCORES':
		 	GameStore.showScores();
			GameStore.setRoundEndPos();
			GameStore.setGameState(GameStore.getGameProperty('state')+'_SHOW_SCORES');
		 	GameStore.emitChange();
		 	break;
		case 'GAME_7_OFFLINE_HIDE_SCORE_UPDATED':
			GameStore.scoreUpdatedFalse();
			break;
		case 'GAME_7_REFRESH_STORE':
			waitFor([PauseStore.dispatchToken]);
			GameStore.refreshStore();
			GameStore.emitChange();
			break;
		 }
});

export default GameStore;