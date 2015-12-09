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

const GameStore = createStore({
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
				GameStore.fireNextTurn();
				break;
			case 'PLAYING_CARD':
				GameStore.firePlayCardSuccess();
				break;
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
	}
});
GameStore.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	switch(action.type){
		case 'GAME325_DISPLAY_GAME_STATE':
			break;
		case 'GAME325_INIT_GAME':
			let gameData;
			gameData = localStorage.getItem('gameData');
			if(gameData){
				gameData = JSON.parse(gameData);
				let newGameData = GameStore.makeGameObj(gameData);
				GameStore.setGameObj(newGameData);
				GameStore.actOnState();
			}else{
				GameStore.initGame();
				GameStore.initDeck();
				GameStore.setCardPositionByState();
				// GameStore.fireInitStartGame();
				// GameStore.setGameState('GAME_STARTED');
			
				// GameStore.emitAndSaveChange( 'gameData', _game );
				GameStore.fireDistributeOneCardEach();
			}
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_DISTRIBUTE_ONE_CARD_EACH':
			GameStore.distributeOneCardEach();
			GameStore.setCardPositionByState();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_INIT_START_GAME':
			GameStore.hideScores();
			GameStore.setCardPositionByState();
			GameStore.setGameState('GAME_STARTED');
			GameStore.fireInitRound();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_INIT_ROUND':
			GameStore.initRound();
			GameStore.setCardPositionByState();
			GameStore.emitChange();
			break;
		case 'GAME325_INIT_ROUND_SUCCESS':
			GameStore.initPlayersArray();
			GameStore.setCardPositionByState();
			GameStore.fireDistributeCards();
			GameStore.setGameState('INIT_ROUND_SUCCESS');
			GameStore.emitChange();
			break;
		case 'GAME325_DISTRIBUTE_CARDS':
			GameStore.distributeCards();
			GameStore.updatePlayersArray();
			GameStore.sortDeck(0);
			GameStore.updateCardIndex();
			GameStore.setCardPositionByState();
			GameStore.emitChange();
			break;
		case 'GAME325_DISTRIBUTE_CARDS_FIRST_SUCCESS':
			GameStore.distributionDone();
			GameStore.sortDeck(0);
			GameStore.setActivePlayerId();
			GameStore.setGameState('SET_TRUMP');
			GameStore.checkBotPlay();
			GameStore.setCardPositionByState();
			// GameStore.fireNextTurn();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_DISTRIBUTE_CARDS_SECOND_SUCCESS':
			GameStore.distributionDone();
			GameStore.sortDeck(0);
			GameStore.setCardPositionByState();
			if(GameStore.isWithdrawCard()){
				GameStore.setGameState('GAME325_WITHDRAW_CARD');
				GameStore.checkBotPlay();
				GameStore.setCardPositionByState();
			 	GameStore.emitAndSaveChange( 'gameData', _game );
			}else{
				GameStore.setGameState('GAME325_PLAY_CARD');
				GameStore.fireNextTurn();
			}
			break;
		case 'GAME325_WITHDRAW_CARD_SUCCESS':
			GameStore.setGameState('GAME325_RETURN_CARD');
			GameStore.checkBotPlay();
			GameStore.setCardPositionByState();
			 	
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_RETURN_CARD_SUCCESS':
			if(GameStore.isWithdrawCard()){
				GameStore.setGameState('GAME325_WITHDRAW_CARD');
				GameStore.checkBotPlay();
				GameStore.setCardPositionByState();
			}else{
				GameStore.setGameState('READY_TO_PLAY_NEXT');
				GameStore.setActivePlayerId();
				GameStore.checkBotPlay();
				GameStore.setCardPositionByState();
			}
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_SET_TRUMP':
			var trump = action.trump;
			GameStore.setTrump(trump);
			GameStore.distributeCards();
			GameStore.updatePlayersArray();
			GameStore.sortDeck(0);
			GameStore.updateCardIndex();
			GameStore.setCardPositionByState();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_BOT_HAS_PLAYED':
			GameStore.playBot();
			GameStore.setCardPositionByState();
			GameStore.emitChange();
			break;
		case 'GAME325_PLAY_CARD':
			var card = action.card;
			GameStore.playCard(card);
			GameStore.updatePlayersArray();
			GameStore.sortDeck(0);
			GameStore.updateCardIndex();
			GameStore.setCardPositionByState();
			GameStore.emitAndSaveChange( 'gameData', _game );
			break;
		case 'GAME325_PLAY_CARD_SUCCESS':
			var card = GameStore.getGameProperty('cardPlayed');
			GameStore.updateCardState(card, 'PLAYED');
			GameStore.checkTurnEnd();
			if(GameStore.getGameProperty('state') == 'MOVE_HAND'){
					GameStore.setGameState('MOVE_HAND');
					GameStore.setCardPositionByState();
					GameStore.fireMoveHand();
			 		GameStore.emitAndSaveChange( 'gameData', _game );
			}else{
				GameStore.updatePlayedCards(card);
				GameStore.updateBotState('BOT_READY');
				GameStore.setGameState('NOW_NEXT_TURN');
				GameStore.setCardPositionByState();
				GameStore.fireNextTurn();
				GameStore.emitAndSaveChange( 'gameData', _game );
			}
			break;
		case 'GAME325_SKIP_TURN':
			passAudio.play();
			break;
		 case 'GAME325_TURN_SKIPPED':
		 	break;
		 case 'GAME325_NOW_NEXT_TURN':
	 		GameStore.nextTurn();
			// GameStore.updatePlayersArray();
			GameStore.updatePlayableCards();
			GameStore.checkBotPlay();
			GameStore.setCardPositionByState();
		 	GameStore.emitChange();
		 	break;
		 case 'GAME325_MOVE_HAND':
		 	GameStore.moveHandMade();
		 	GameStore.setGameState('MOVE_HAND')
		 	GameStore.setCardPositionByState();
		 	GameStore.emitChange();
		 	break;
		 case 'GAME325_MOVE_HAND_SUCCESS':
		 	// GameStore.hideMovedCards();
		 	GameStore.checkRoundEnd();
		 	if(GameStore.getGameProperty('state') == 'ROUND_END'){
		 		GameStore.roundEnd();
				GameStore.setRoundEndPos();
				GameStore.emitAndSaveChange( 'gameData', _game );
		 	}else{
		 		GameStore.fireNextTurn();
		 	}
		 	break;
		 case 'GAME325_SHOW_SCORES':
		 	GameStore.showScores();
			GameStore.setRoundEndPos();
			GameStore.setGameState('ROUND_END_SHOW_SCORES');
		 	GameStore.emitChange();
		 	break;
		 case 'GAME325_BOT_WILL_PLAY':
		 	break;
		 }
});

export default GameStore;