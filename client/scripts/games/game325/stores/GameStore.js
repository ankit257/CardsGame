import React from 'react';
import { register } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import selectn from 'selectn';

import * as GameActions from '../actions/GameActions';
import { timeConstants, gameVars } from '../constants/SattiHelper'

import PlayingCard from '../utils/PlayingCard';
import Game325 from '../utils/Game325';
import Player325 from '../utils/Player325';
import Bot325 from '../utils/Bot325';
import Score325 from '../utils/Score325';

// let distributeAudio = new Audio('../../assets/sounds/distribute.mp3');
// let playAudio = new Audio('../../assets/sounds/play.mp3');
let passAudio = new Audio('../../assets/sounds/pass.mp3');
let bellAudio = new Audio('../../assets/sounds/bell.mp3');
let tadaAudio = new Audio('../../assets/sounds/tada.mp3');

// var _game = {}
var _playersCards = []
var _playableCount = []
var _showScore = false
var _pauseState = false;

var _game = new Game325();

const GameStoreOffline = createStore({
	type : 'offline',
	ifGameWaiting(){
		return false;
	},
	ifIAmSpectatorOrBot(){
		return false;
	},
	getScoreUpdated(){
		return {}
	},
	getGameObj(){
		return _game;
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
		_game.players[pos].state = state;
	},
	setCardPositionByState(){
		_game.deck.map(deckcard=> {deckcard.setPositionByState()});
	},
	setRoundEndPos(){
		_game.deck.map(deckcard=> deckcard.setRoundEndPosition());
	},
	initGame(){
		_game.initPlayers();
	},
	initDeck(){
		_game.initDeck();
	},
	getTrump(){
		return _game.trump;
	},
	setTrump(trump){
		_game.trump = trump
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
	hideMovedCards(){
		_game.hideMovedCards();
	},
	checkTurnSkip(){
		_game.checkTurnSkip();
	},
	isWithdrawCard(){
		return _game.isWithdrawCard();
	},
	moveHandMade(){
		_game.assignPosToCardsToBeMoved()
	},
	playBot(){
		_game.playBot();
	},
	playCard(card){
		_game.playCard(card);
	},
	getTurnWinner(){
		_game.getTurnWinner();
	},
	nextTurn(){
		_game.nextTurn();
	},
	moveHand(){
		return _game.shouldMoveHand();
	},
	reInitDeck(){
		_game.reInitDeck()
	},
	roundEnd(){
		tadaAudio.play();
		_game.roundEnd();
	},
	fireMoveHand(){
		setTimeout(function(){
			GameActions.moveHand();
		}, timeConstants.DISPATCH_DELAY);
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
	fireSetTrump(){
		setTimeout(function(){
			// GameActions.setTrump();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireReturnCard(){
		setTimeout(function(){
			GameActions.returnCard();
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
	fireDistributeOneCardEach(){
		setTimeout(function(){
			GameActions.distributeOneCardEach();
		}, timeConstants.DISPATCH_DELAY);	
	},
	initPlayersArray(){
		_playersCards = new Array();
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			_playersCards.push(new Array());
		}
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
	distributeOneCardEach(){
		_game.distributeOneCardEach()
	},
	getGameObj(){
		return _game;
	},
	checkRoundEnd(){
		_game.checkRoundEnd();
	},
	setPlayableCount(){
		_playableCount = [0, 0, 0];
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
			this.setPlayerState(playerPos, 'CAN_PLAY');
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
			if(deckcard.ownerPos){ //In case All the deck is not to be distributed at once
				let index = this.setIndexFromArray(deckcard);
				let similar = _playersCards[deckcard.ownerPos].length;
				deckcard.index = index;
				deckcard.similar = similar;	
			}
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
	checkTurnEnd(){
		return _game.checkTurnEnd();
	},
	setActivePlayerId(){
		for(let player of _game.players){
			if(player.handsToMake == 5){
				_game.activePlayerId = player.id;
				_game.activePlayerPos = player.id;
			}
		}
	},
	makeGameObj(gameData){
		let newGameData = new Game325();
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
			newGameData.players[i].score.push(Object.assign(new Score325(), gameData.players[i].score));
		};
		return newGameData;
	},
	actOnState(){
		switch(_game.state){
			case 'NOW_NEXT_TURN':
				GameStoreOffline.fireNextTurn();
				break;
			case 'PLAYING_CARD':
				GameStoreOffline.firePlayCardSuccess();
				break;
			case 'ROUND_END':
				GameStoreOffline.fireShowScores();
				break;
			case 'GAME_STARTED':
				GameStoreOffline.fireInitRound();
				break;
			default:
				GameStoreOffline.fireInitStartGame();
				break;
			}
	},
	getPauseState(){
		return _pauseState;
	},
	togglePauseState(){
		_pauseState = !_pauseState;
	}
});
GameStoreOffline.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	switch(action.type){
		case 'GAME325_DISPLAY_GAME_STATE':
			break;
		case 'GAME325_INIT_GAME':
			let gameData;
			gameData = localStorage.getItem('gameData');
			if(gameData){
				gameData = JSON.parse(gameData);
				let newGameData = GameStoreOffline.makeGameObj(gameData);
				GameStoreOffline.setGameObj(newGameData);
				GameStoreOffline.actOnState();
			}else{
				GameStoreOffline.initGame();
				GameStoreOffline.initDeck();
				GameStoreOffline.setCardPositionByState();
				GameStoreOffline.fireInitStartGame();
			}
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_DISTRIBUTE_CARDS_ZERO_SUCCESS':
			GameStoreOffline.reInitDeck();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_DISTRIBUTE_ONE_CARD_EACH':
			GameStoreOffline.distributeOneCardEach();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_INIT_START_GAME':
			GameStoreOffline.hideScores();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.setGameState('GAME_STARTED');
			GameStoreOffline.fireInitRound();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_START_GAME':
			GameStoreOffline.fireDistributeCards();
			GameStoreOffline.setGameState('INIT_ROUND_SUCCESS');
			GameStoreOffline.emitChange();
			break;
		case 'GAME325_INIT_ROUND':
			GameStoreOffline.initRound();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitChange();
			break;
		case 'GAME325_INIT_ROUND_SUCCESS':
			GameStoreOffline.initPlayersArray();
			GameStoreOffline.setCardPositionByState();
			if(GameStoreOffline.getGameProperty('dealerPos')){
				GameStoreOffline.fireDistributeCards();
				GameStoreOffline.setGameState('INIT_ROUND_SUCCESS');
			}else{
				GameStoreOffline.fireDistributeOneCardEach();
				GameStoreOffline.setGameState('DISTRIBUTING_CARDS_0');
			}
			GameStoreOffline.emitChange();
			break;
		case 'GAME325_DISTRIBUTE_CARDS':
			GameStoreOffline.distributeCards();
			GameStoreOffline.updatePlayersArray();
			GameStoreOffline.sortDeck(0);
			GameStoreOffline.updateCardIndex();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitChange();
			break;
		case 'GAME325_DISTRIBUTE_CARDS_FIRST_SUCCESS':
			GameStoreOffline.distributionDone();
			GameStoreOffline.sortDeck(0);
			GameStoreOffline.setActivePlayerId();
			GameStoreOffline.setGameState('SET_TRUMP');
			GameStoreOffline.checkBotPlay();
			GameStoreOffline.setCardPositionByState();
			// GameStoreOffline.fireNextTurn();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_DISTRIBUTE_CARDS_SECOND_SUCCESS':
			GameStoreOffline.distributionDone();
			GameStoreOffline.sortDeck(0);
			GameStoreOffline.setCardPositionByState();
			if(GameStoreOffline.isWithdrawCard()){
				GameStoreOffline.setGameState('GAME325_WITHDRAW_CARD');
				GameStoreOffline.checkBotPlay();
				GameStoreOffline.setCardPositionByState();
			 	GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			}else{
				GameStoreOffline.setGameState('GAME325_PLAY_CARD');
				GameStoreOffline.fireNextTurn();
			}
			break;
		case 'GAME325_WITHDRAW_CARD_SUCCESS':
			GameStoreOffline.setGameState('GAME325_RETURN_CARD');
			GameStoreOffline.checkBotPlay();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_RETURN_CARD_SUCCESS':
			if(GameStoreOffline.isWithdrawCard()){
				GameStoreOffline.setGameState('GAME325_WITHDRAW_CARD');
				GameStoreOffline.checkBotPlay();
				GameStoreOffline.setCardPositionByState();
			}else{
				GameStoreOffline.setGameState('READY_TO_PLAY_NEXT');
				GameStoreOffline.setActivePlayerId();
				GameStoreOffline.checkBotPlay();
				GameStoreOffline.setCardPositionByState();
			}
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_SET_TRUMP':
			var trump = action.trump;
			GameStoreOffline.setTrump(trump);
			GameStoreOffline.distributeCards();
			GameStoreOffline.updatePlayersArray();
			GameStoreOffline.sortDeck(0);
			GameStoreOffline.updateCardIndex();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_BOT_HAS_PLAYED':
			GameStoreOffline.playBot();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitChange();
			break;
		case 'GAME325_PLAY_CARD':
			var card = action.card;
			GameStoreOffline.playCard(card);
			GameStoreOffline.updatePlayersArray();
			GameStoreOffline.sortDeck(0);
			GameStoreOffline.updateCardIndex();
			GameStoreOffline.setCardPositionByState();
			GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_PLAY_CARD_SUCCESS':
			var card = GameStoreOffline.getGameProperty('cardPlayed');
			GameStoreOffline.updateCardState(card, 'PLAYED');
			GameStoreOffline.checkTurnEnd();
			if(GameStoreOffline.getGameProperty('state') == 'MOVE_HAND'){
					GameStoreOffline.setGameState('MOVE_HAND');
					GameStoreOffline.setCardPositionByState();
					GameStoreOffline.fireMoveHand();
			 		GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			}else{
				GameStoreOffline.updatePlayedCards(card);
				GameStoreOffline.updateBotState('BOT_READY');
				GameStoreOffline.setGameState('NOW_NEXT_TURN');
				GameStoreOffline.setCardPositionByState();
				GameStoreOffline.fireNextTurn();
				GameStoreOffline.emitAndSaveChange( 'gameData', _game );
			}
			break;
		case 'GAME325_SKIP_TURN':
			passAudio.play();
			break;
		 case 'GAME325_TURN_SKIPPED':
		 	break;
		 case 'GAME325_NOW_NEXT_TURN':
	 		GameStoreOffline.nextTurn();
			GameStoreOffline.updatePlayableCards();
			GameStoreOffline.checkBotPlay();
			GameStoreOffline.setCardPositionByState();
		 	GameStoreOffline.emitChange();
		 	break;
		 case 'GAME325_MOVE_HAND':
		 	GameStoreOffline.moveHandMade();
		 	GameStoreOffline.setGameState('MOVE_HAND')
		 	GameStoreOffline.setCardPositionByState();
		 	GameStoreOffline.emitChange();
		 	break;
		 case 'GAME325_MOVE_HAND_SUCCESS':
		 	GameStoreOffline.checkRoundEnd();
		 	if(GameStoreOffline.getGameProperty('state') == 'ROUND_END'){
		 		GameStoreOffline.roundEnd();
				GameStoreOffline.setRoundEndPos();
				GameStoreOffline.emitAndSaveChange( 'gameData', _game );
		 	}else{
		 		GameStoreOffline.fireNextTurn();
		 	}
		 	break;
		 case 'GAME325_SHOW_SCORES':
		 	GameStoreOffline.showScores();
			GameStoreOffline.setRoundEndPos();
			GameStoreOffline.setGameState('ROUND_END_SHOW_SCORES');
		 	GameStoreOffline.emitChange();
		 	break;
		 case 'GAME325_BOT_WILL_PLAY':
		 	break;
		 }
});

export default GameStoreOffline;