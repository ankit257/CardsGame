import React from 'react';
import { register, waitFor } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import selectn from 'selectn';

import { Howl } from "howler";

import * as GameActions from '../actions/GameActions';

import PauseStore from '../stores/PauseStore';
import GameRoomStore from '../../../stores/GameRoomStore';

import { timeConstants, gameVars } from '../constants/SattiHelper'

import PlayingCard from '../utils/PlayingCard';
import Game325 from '../utils/Game325';
import Player325 from '../utils/Player325';
import Bot325 from '../utils/Bot325';
import Score325 from '../utils/Score325';
import AnimEngine from '../utils/AnimEngine';

// let distributeAudio = new Audio('../../assets/sounds/distribute.mp3');
// let playAudio = new Audio('../../assets/sounds/play.mp3');
let passAudio = new Howl({
	urls: ['../../assets/sounds/pass.mp3'],
	autoplay: false
}),
bellAudio = new Howl({
	urls: ['../../assets/sounds/bell.mp3'],
	autoplay: false
}),
tadaAudio = new Howl({
	urls: ['../../assets/sounds/tada.mp3'],
	autoplay: false
})
// }
var _game = {}
var _myid = ''               // Permanent storage of my id
var _playersCards = []
var _playableCount = []
var _showScore = false;
var _pauseState = false;
var _next ={                 // temporary storage of value from server till it is needed in the course of actions at client
	activePlayerId : '',
	gameTurn: 0,
	playableCards : [],
	gameData: {}
}
var _sync = [{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
	clientFirst : false,
	serverFirst : false,
	eventName	: 'TRUMP'
},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
	clientFirst : false,
	serverFirst : false,
	eventName	: 'WITHDRAW'
},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
	clientFirst : false,
	serverFirst : false,
	eventName	: 'RETURN'
},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
	clientFirst : false,
	serverFirst : false,
	eventName	: 'PLAY'
}]
var _serverData = [];
var _nextAction;
var _ifEmit = true;           // bool to control if Store will emit change on data being received from server
var _playersFromServer = [];  // to store the scores from server at round end 
var _scoreUpdated = false;    // to show a red dot over scores in view once scores are received from server
var _ifWaiting = true;        // ifWaiting bool stores the state of client: whether it is waiting for more players to join or whether game is running and new users will be treated as spectators
var _game = new Game325();
var _fnToCall = null;
var _clicked = [{eventName: 'PLAY', flag: false},
			{eventName: 'WITHDRAW', flag: false},
			{eventName: 'RETURN', flag: false},
			{eventName: 'TRUMP', flag: false},]

const GameStoreOnline = createStore({
	type : 'online',
	refreshStore(){
		_game = {}
		_myid = ''               // Permanent storage of my id
		_playersCards = []
		_playableCount = []
		_showScore = false;
		_pauseState = false;
		_next ={                 // temporary storage of value from server till it is needed in the course of actions at client
			activePlayerId : '',
			gameTurn: 0,
			playableCards : [],
			gameData: {}
		}
		_serverData = [];
		_sync = [{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
			clientFirst : false,
			serverFirst : false,
			eventName	: 'TRUMP'
		},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
			clientFirst : false,
			serverFirst : false,
			eventName	: 'WITHDRAW'
		},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
			clientFirst : false,
			serverFirst : false,
			eventName	: 'RETURN'
		},{               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
			clientFirst : false,
			serverFirst : false,
			eventName	: 'PLAY'
		}]
		_ifEmit = true;           // bool to control if Store will emit change on data being received from server
		_playersFromServer = [];  // to store the scores from server at round end 
		_scoreUpdated = false;    // to show a red dot over scores in view once scores are received from server
		_ifWaiting = true;        // ifWaiting bool stores the state of client: whether it is waiting for more players to join or whether game is running and new users will be treated as spectators
		_fnToCall = null;
		_clicked = [{eventName: 'PLAY', flag: false},
			{eventName: 'WITHDRAW', flag: false},
			{eventName: 'RETURN', flag: false},
			{eventName: 'TRUMP', flag: false},];
	},
	getClickedFlag(eventName){
		let boolReturn;
		_clicked.map(clicked=>{
			if(clicked.eventName == eventName){
				boolReturn = clicked.flag;
			}
		})
		return boolReturn;
	},
	setClickedFlag(eventName, bool){
		_clicked.map(clicked=>{
			if(clicked.eventName == eventName){
				clicked.flag = bool;
			}
		})
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
	ifGameWaiting(){
		return _ifWaiting;
	},
	getScoreUpdated(){
		return {};
	},
	makeGameRunning(){
		_ifWaiting = false;
	},
	updateCardState(card, state){
		_game.updateCardState(card, state);
	},
	setGameState(gameState){
		_game.state = gameState;
	},
	setSyncState(caller, eventName){         // setter function for sync state
		_sync.map(sync=>{
				if(sync.eventName == eventName){
					if(caller == 'server'){
						sync.serverFirst = true;
					}else if(caller == 'client'){
						sync.clientFirst = true;
				}	
			}
		})
	},
	resolveSyncState(eventName){							// clear sync state once sync is resolved
		_sync.map(sync=>{
			if(sync.eventName == eventName){
				sync.clientFirst = false;
				sync.serverFirst = false;
			}
		});
	},
	getSyncState(eventName){							// getter function for sync state
		let returnSync;
		_sync.map(sync=>{
			if(sync.eventName == eventName){
				returnSync = sync;
			}
		})
		return returnSync;
	},
	//controls for whether GameStoreOnline emits upon data received from server
	ifEmitTrue(){						
		_ifEmit = true;
	},
	ifEmitFalse(){
		_ifEmit = false;
	},
	getIfEmit(){
		return _ifEmit;
	},
	updateBotState(botState){
		_game.botState = botState;
	},
	updatePlayedCards(card){
		delete _game.cardPlayed;
		_game.cardPlayed = new Object();
		_game.addPlayedCard(card);
	},
	updatePlayableCards(){
		_game.updatePlayableCards();
		this.setPlayableCount();
	},
	updatePlayerScores(playerpos, penalty){
		_game.players[playerpos].score.penalty.push(penalty);
	},
	getXP(){
		let xp = 0;
		_game.players.map(player=>{
			if(player.id == _myid && player.type == 'HUMAN'){
				let score = player.score;
				//Calculate For 325
			}
		})
		return xp;
	},
	setPlayerState(pos, state){
		// _game.players[pos].state = state;
		_game.players.map(player=> {
			if(player.position == pos){
				player.state = state;
			}
		})
	},
	setCardPositionByState(){
		_game.deck.map(deckcard=> {deckcard.setPositionByState()});
	},
	setRoundEndPos(){
		_game.deck.map(deckcard=> deckcard.setRoundEndPosition());
	},
	setMyId(id){   // id setter
		_myid = id;
	},
	initGame(){
		_game = new Game325();
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
	moveHandMade(winnerPos){
		_game.assignPosToCardsToBeMoved(winnerPos)
	},
	playBot(){
		let botCards = [];
		_game.deck.map(deckcard=>{
			if(deckcard.ownerId === _game.activePlayerId){
				botCards.push(deckcard);
			}
		})
		return _game.playBot(botCards, _game);
	},
	playCard(card, callerLocation){
		if(callerLocation == 'server'){
			_game.playCard(card, 'server');
		}else{
			if(!this.ifIAmSpectatorOrBot()){
				_game.playCard(card, 'client');
			}
		}
	},
	getTurnWinner(){
		_game.getTurnWinner();
	},
	getWinnnerFromServerData(){
		_game.winnerId = _next.winnerId;
	},
	nextTurn(){
		// _game.nextTurn();
		_game.gameTurn = _next.gameTurn;
		this.setActivePlayerPos();
		_game.state = 'READY_TO_PLAY_NEXT';
	},
	setNextAction(action){
		_nextAction = action;
	},
	getNextAction(){
		return _nextAction;
	},
	moveHand(){
		return _game.shouldMoveHand();
	},
	reInitDeck(){
		_game.reInitDeck()
	},
	putCardsBackInDeck(){
		_game.deck.map(deckcard=>{
			if(deckcard.state == 'SELECT_DEALER'){
				deckcard.state = 'IN_DECK';
				deckcard.delay = timeConstants.DEALER_WAIT;
			}
		})
	},
	roundEnd(){
		tadaAudio.play();
		_game.roundEnd();
	},
	fireMoveHand(){
			GameActions.moveHand();
	},
	fireInitRound(){
			GameActions.initRound();
	},
	fireDistributeCards(){
			GameActions.distributeCards();
	},
	fireShowScores(){
			GameActions.showScores();
	},
	fireSetTrump(){
			GameActions.setTrump();
	},
	fireReturnCard(){
			GameActions.returnCard();
	},
	fireNextTurn(){
			// GameActions.nextTurn(_game.gameTurn);
			GameActions.nowNextTurn();
	},
	fireInitStartGame(){
			GameActions.initStartGame();
	},
	firePlayCardSuccess(){
			GameActions.playCardSuccess();
	},
	fireDistributeOneCardEach(){								//
			GameActions.distributeOneCardEach();				// callDelay(GameActions.distributeOneCardEach) // fn();
	},
	initPlayersArray(){
		_playersCards = new Array();
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			_playersCards.push(new Array());
		}
	},
	callFn(fn){
		if(typeof fn === 'function'){
			fn();	
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
		this.updatePlayersArray();
		if(_game.state == 'PLAYING_CARD' || _game.state == 'PLAYING_PLAYED_CARD' || _game.state == 'PLAY_DATA_RECEIVED'){
			_game.checkRoundEnd();
		}
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
		this.setPlayerPositionById()
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
	getDistributedCards(){
		let disCards = [];
		_game.deck.map(deckcard=>{
			if(deckcard.state == 'DISTRIBUTED'){
				disCards.push(Object.assign({}, deckcard));
			}
		})
		return disCards;
	},
	assignDistributedCards(disCards){
		disCards.map(disCard=>{
			_game.deck.map(deckcard=>{
				if(disCard.suit == deckcard.suit && disCard.rank == deckcard.rank){
					deckcard.oldX = deckcard.x;
					deckcard.oldY = deckcard.y;
					deckcard.oldZ = deckcard.z;
					deckcard.oldTheta = deckcard.theta;
					deckcard.oldShowFace = deckcard.showFace;
				}
			})
		})
	},
	getAnimEngineData(){
		return {
			deck: _game.deck,
			gameState: _game.state,
			botState: _game.botState,
			ifOnline: true
			}
	},
	makeGameObj(gameData){
		let newGameData = new Game325();
		Object.assign(newGameData, gameData);
		// copy deck
		newGameData.winnerId = gameData.winnerId;
		delete newGameData['deck'];
		newGameData.deck = new Array();
		gameData.deck.map(deckcard => {
			newGameData.deck.push(Object.assign(new PlayingCard(deckcard), deckcard));
		})
		// copy players
		delete newGameData['players'];
		newGameData.players = new Array();
		gameData.players.map(player => {
			if(player.profile && player.profile.profile){
				player.name = player.profile.profile.first_name;
			}
			if(player.type == 'HUMAN' || player.type == 'ADMIN'){
				newGameData.players.push(Object.assign(new Player325(player), player));
			}else if(player.type == 'BOT' || player.type == 'SPECTATOR'){
				newGameData.players.push(Object.assign(new Bot325(player), player));
			}else{
				console.log('Weird');
			}
		})
		newGameData.players.map(player => {
			delete player.score;
		})
		for (var i = 0; i < gameData.players.length; i++) {
			newGameData.players[i].score = Object.assign(new Score325(), gameData.players[i].score);
		};
		return newGameData;
	},
	getPauseState(){
		return _pauseState;
	},
	togglePauseState(){
		_pauseState = !_pauseState;
	},
	getPlayerIds(){
	/* Utility function for those functions which translate ids to positions.
	 	This function returns playerids array = [id_at_pos0, id_at_pos1, id_at_pos2...]
		This function MUST be called ONLY after this.setPlayerPositionById() has been called once.
	 */
		let playerids = [];
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			playerids.push('');
		};
		_game.players.map(player=>{
			playerids[player.position] = player.id;
		})
		return playerids;
	},
	ifIAmSpectatorOrBot(){					// For checking spectators. If BOT is also checked because a spectator has _game.player[i].type = 'BOT' on client-side
		for (var i = 0; i < _game.players.length; i++) {
			if(_game.players[i].id == _myid && (_game.players[i].type == 'SPECTATOR' || _game.players[i].type == 'BOT')){
				return true;
			}
		};
		return false;
	},
	ifIPlayedCard(eventName, cardFromServer){
		let boolReturn;
		switch(eventName){
			case 'TRUMP':
				break;
			case 'PLAY':
			case 'WITHDRAW':
			case 'RETURN':
				_game.deck.map(deckcard=>{
					if(deckcard.suit == cardFromServer.suit && deckcard.rank == cardFromServer.rank){
						if(deckcard.ownerId == cardFromServer.ownerId){
							boolReturn = true;
						}else{
							boolReturn = false;
						}
					}
				})
				break;
		}
		return boolReturn;
	},
	setSpectatorCards(){					// Upon arrival of a spectator, set animTime and delay for all his cards to facilitate easy-rendering for him
		if(this.ifIAmSpectatorOrBot()){
			_game.deck.map(card=>{
				card.delay = 0;
				card.animTime = 200;
			})
		}
	},
	setPlayerPositionById(){				// Arranges players such that player at _myid is at position 0. The usual push-pop function. Do all position calculations after calling this func
		let getCircularIndex = function(i, len){
			if(i < len){
				return i;
			}else{
				return (i - len);
			}
		}
		for (var i = 0; i < _game.players.length; i++) {
			if(_game.players[i].id == _myid){
				for (var j = 0; j < _game.maxPlayers; j++) {
					_game.players[getCircularIndex(i+j, _game.maxPlayers)].position = j;
				};
				break;
			}
		};
	},
	assignCardsForDealerSelection(){
		_game.deck.map(card=>{
			if(card.dealerId){
				card.state = 'SELECT_DEALER';
			}
		})
	},
	setCardOwnerPosition(){				// _game.deck from server side has all ownerIds set. This function converts it to ownerPos. 
		let playerids = this.getPlayerIds();
		_game.deck.map(card=>{
			for (var i = 0; i < playerids.length; i++) {
				if(playerids[i] == card.ownerId){
					card.ownerPos = i;
				}
			};
		})
		_game.playableCards.map(card=>{
			for (var i = 0; i < playerids.length; i++) {
				if(playerids[i] == card.ownerId){
					card.ownerPos = i;
				}
			};
		})
	},
	fireCardPlayed(card){
		setTimeout(function(){
			GameActions.cardPlayed();
		}, timeConstants.DISPATCH_DELAY);
	},
	setActivePlayerPos(){			// Reads the _next.activePlayerId stored and translates it to activePlayerPos. Also sets _game.activePlayerId
		let activePlayerId = _next.activePlayerId;
		let playerids = this.getPlayerIds();
		for (var i = 0; i < playerids.length; i++) {
			if(playerids[i] == activePlayerId){
				_game.activePlayerPos = i;
				break;
			}
		};
		_game.activePlayerId = activePlayerId;
	},
	setOtherPlayerPos(){			// Reads the _next.activePlayerId stored and translates it to activePlayerPos. Also sets _game.activePlayerId
		let otherPlayerId = _next.otherPlayerId;
		// let otherPlayerId = _game.otherPlayerId; //= otherPlayerId;
		let playerids = this.getPlayerIds();
		for (var i = 0; i < playerids.length; i++) {
			if(playerids[i] == otherPlayerId){
				_game.otherPlayerPos = i;
				break;
			}
		};
		_game.otherPlayerId = otherPlayerId;
	},
	setNewScores(){        // Reads the _next.playerfromserver and sets score after PLAY_CARD_SUCCESS -> ROUND_END_SHOW_SCORES
		_game.players.map(player=>{
			_playersFromServer.map(playerfromserver=>{
				if(playerfromserver.id == player.id){
					player.score = Object.assign(new ScoreSatti(), playerfromserver.score);
				}
			})
		})
		this.scoreUpdatedTrue();
	},
	tryAutoInit(){       // Try to auto-start the game by asking the admin everytime a new player joins (only when gamestate is waiting)
		let tryautoinit = true;
		_game.players.map(player=>{
			if(player.type == 'BOT'){
				tryautoinit = false;
			}
		})
		if(tryautoinit){
			this.adminRequestsDistribution(_game.adminId);
		}
	},
	ifGameStatesSame(state1, state2){  // compare two gameStates for GameIdle Promise Object checking
		if(state1.gameActivePlayerId == state2.gameActivePlayerId &&
			state1.gameGameTurn == state2.gameGameTurn &&
			state1.nextActivePlayerId == state2.nextActivePlayerId &&
			state1.nextGameTurn == state2.nextGameTurn &&
			state1.gameAdminId == state2.gameAdminId){
			return true;
		}else{
			return false;
		}
	},
	getGameRealTimeState(){    // Values to be checked for comparing GameStates
		let state = {
			gameActivePlayerId :_game.activePlayerId,
			gameGameTurn 	   :_game.gameTurn,
			nextActivePlayerId :_next.activePlayerId,
			nextGameTurn       :_next.gameTurn,
			gameAdminId        :_game.adminId
		};
		return state;
	},
	gameIsIdleFor(ms){        // Returns promise object which is resolved if game is idle for ms ms.
		let self = this;
		return new Promise(function (resolve, reject) {
			let stateNow = self.getGameRealTimeState();
			let stateThen;
			let delay = function(delayTime) {
				 return new Promise(function (resolvedelay, reject) {
	            	setTimeout(resolvedelay, delayTime); // (A)
	        	});
			}
			delay(ms).then(function(){
				stateThen = self.getGameRealTimeState();
				if(self.ifGameStatesSame(stateNow, stateThen)){
					resolve();
				}else{
					reject();
				}
			})
		})
	},
	adminCheckAndAct(){     // If game state is idle, admin checks the gamestate and botState and acts accordingly.
		if(_game.adminId == _myid && !this.ifIAmSpectatorOrBot()){
			switch(_game.state){
				case 'READY_TO_PLAY_NEXT':
					_game.checkBotPlay();
					if(_game.botState == 'BOT_SHOULD_PLAY'){
						setTimeout(function(){
							GameActions.requestServerBot();
						}, timeConstants.DISPATCH_DELAY);
					}
					break;
				case 'ROUND_END_SHOW_SCORES':
					this.adminRequestsDistribution(_game.adminId);
					break;
				case 'INIT_PLAYERS':
					this.tryAutoInit();
					break;

			}
		}
	},
	adminRequestsDistribution(adminId){ // admin asks server for distribution. Server sends START_NEW_ROUND with gameObj containing distributed deck
		this.makeGameRunning();
		if(_myid == adminId){
			this.emitPlayCardFromSocket('START_NEW_ROUND', {adminId});
		}
	},
	adminRequestsGameState(adminId){
		this.makeGameRunning();
		if(_myid == adminId){
			this.emitPlayCardFromSocket('GAME_STATE', {adminId});
		}
	},
	adminRequestServerBot(adminId){   // admin plays for a bot. Either plays a card or sends a skip turn to server. Server sends NEXT_ROUND with nextRoundCalculations
		if(_myid == adminId){
			_game.players.map(player=>{
				if(player.id == _game.activePlayerId){
					if (_game.state == 'SET_TRUMP') {
						let trump = this.playBot();
						this.emitPlayCardFromSocket('SET_TRUMP', {trump});
					} else {
						let card = this.playBot();
						this.emitPlayCardFromSocket('CARD_PLAYED', {card});
					}
				}
			})
		}
	},
	setNextGameObj(){            // Picks the gameObj saved in _next variable and sets it as the current _game.
		this.setGameObj(this.makeGameObj(_next.gameData));
	},
	refreshPlayers(serverPlayers){ // If a player leaves game, server sends serverplayers. Refresh the players in game accordingly. Add bots instead of spectators. Assign new ADMIN if admin changes. Assign prototype functions.
		let savedGamePlayers = _game.players;
		let newAdminId;
		delete _game.players;
		_game.players = new Array();
		serverPlayers.map(serverPlayer=>{
			savedGamePlayers.map(gamePlayer=>{
				if(serverPlayer.id == gamePlayer.id){
					gamePlayer.name = serverPlayer.name;
					gamePlayer.type = serverPlayer.type;
					gamePlayer.img  = serverPlayer.img;
					gamePlayer.socket = serverPlayer.socket;
					if(serverPlayer.type == 'HUMAN' || serverPlayer.type == 'ADMIN'){
						_game.players.push(Object.assign(new Player325(gamePlayer), gamePlayer));
					}else if(serverPlayer.type == 'BOT' || serverPlayer.type == 'SPECTATOR'){
						_game.players.push(Object.assign(new Bot325(gamePlayer), gamePlayer));
					}else{
						console.log('Weird');
					}
				}
			})
		})
		_game.players.map(player => {
			delete player.score;
		})
		for (var i = 0; i < savedGamePlayers.length; i++) {
			_game.players.map(player=>{
				if(savedGamePlayers[i].id == player.id){
					player.score = Object.assign(new Score325(), savedGamePlayers[i].score);
				}
			})
		};
		serverPlayers.map(serverPlayer=>{
			if(serverPlayer.type == 'ADMIN'){
				newAdminId = serverPlayer.id;
			}
		})
		_game.adminId = newAdminId;

	},takeAction(socketdata){  // switch for acting upon data being received from server
		switch(socketdata.action){
			case 'SET_ID':   // sent as soon as a player gets connected to socket.
				this.setMyId(socketdata.id);
				this.initPlayersArray();
				// this.ifEmitFalse();
				break;
			case 'SELECT_DEALER': //3 cards and Make dealer as Player with Biggest Card
				GameStoreOnline.setNextAction(GameActions.selectDealer); //Set Next State
				break;
			case 'DISTRIBUTE_CARDS_FIRST': //Distribute Cards and Ask active player to Set Trump
				break;
			case 'SET_TRUMP_SUCCESS': // Set trump and fire distribution cards second and ask active player play card;
				if(this.ifGameWaiting) this.makeGameRunning();
				_next.gameData = socketdata.gameData; // Save a copy of gameData here. Use during distribution
				let trumpfromserver = socketdata.gameData.trump;
				if(_game.trump && _game.trump == trumpfromserver){
					this.setSyncState('server', 'TRUMP');
					let syncState = this.getSyncState('TRUMP');
					if(syncState.clientFirst && syncState.serverFirst){
						GameActions.onlineDistributeCardsSecond();
						GameStoreOnline.resolveSyncState('TRUMP');
					}
				}else{
					_game.setTrump(trumpfromserver);
					GameActions.onlineSetTrump(trumpfromserver);
				}
				_fnToCall = null;
				// this.ifEmitFalse();
				break;
			case 'START_NEW_ROUND': // New gameObj from server received at the start of every round.
				if(this.ifGameWaiting) this.makeGameRunning();
				_next.gameData = socketdata.gameData; // Save a copy of gameData here. Use during distribution
				_next.activePlayerId = socketdata.gameData.activePlayerId;
				_next.gameTurn = socketdata.gameData.gameTurn;
				_next.playableCards = socketdata.gameData.playableCards;
				_game.initDeck(); // Save server gameObj in temporary variable and initDeck here which has all _game.deck[i].state == 'IN_DECK' <- To bring deck to centre of board
				_game.playerIds = this.getPlayerIds();
				 //Set Action
				this.setGameState('INIT_ROUND');
				_fnToCall = GameActions.initRoundOnline;
				// this.assignCardsForDealerSelection();
				// this.ifEmitTrue();   // <- This received event and its changes will be emitted from store 
				break;
			case 'NEXT_TURN':  //if gameWinner -> MoveHand and ask active player to play card
				_next = socketdata.gameData;
				var playedCard = _next.card;
				if(typeof playedCard !== 'undefined' && socketdata.gameData.turnType === 'CARD_PLAYED'){
					if(this.ifIPlayedCard('PLAY', playedCard)){
						this.setSyncState('server', 'PLAY');
						let syncState = this.getSyncState('PLAY');
						if(syncState.clientFirst && syncState.serverFirst){
							GameActions.onlinePlayCardSuccess();
							GameStoreOnline.resolveSyncState('PLAY');
						}
					}else{
						GameActions.onlinePlayCard(playedCard);
					}
					_game.botState = socketdata.gameData.botState;
				}
				_fnToCall = null;
				break;
			case 'ROUND_END': // Once round_end is received, do everything as we do in NEXT_TURN, just show scores in the end
				_playersFromServer = socketdata.gameData.players;
				_next = socketdata.gameData;
				var playedCard = _next.card;
				if(typeof playedCard !== 'undefined' && socketdata.gameData.turnType === 'CARD_PLAYED'){
					let socketcard = socketdata.gameData.card;
					if(this.ifIPlayedCard('PLAY', playedCard)){
						this.setSyncState('server', 'PLAY');
						let syncState = this.getSyncState('PLAY');
						if(syncState.clientFirst && syncState.serverFirst){
							GameActions.onlinePlayCardSuccess();
							GameStoreOnline.resolveSyncState('PLAY');
						}
					}else{
						GameActions.onlinePlayCard(playedCard);
					}
				}
				_fnToCall = null;
				break;
			case 'START_PLAYING':
				_next = socketdata.gameData;
				var returnedCard = socketdata.gameData.returnedCard;
				if(typeof returnedCard !== 'undefined'){
					if(this.ifIPlayedCard('RETURN', returnedCard)){
						this.setSyncState('server', 'RETURN');
						let syncState = this.getSyncState('RETURN');
						if(syncState.clientFirst && syncState.serverFirst){
							GameActions.onlineReturnCardSuccess();
							GameStoreOnline.resolveSyncState('RETURN');
						}
					}else{
						this.setGameState('RETURN_CARD');
						GameActions.onlinePlayCard(returnedCard);
					}
				}else{
					GameActions.onlineStateReceivedEmitChange('PLAY');
				}
				_fnToCall = null;
				break;
				// this.ifEmitTrue();
			case 'WITHDRAW_CARD':
				_next = socketdata.gameData;
				var returnedCard = socketdata.gameData.returnedCard;
				if(typeof returnedCard !== 'undefined'){
					if(this.ifIPlayedCard('RETURN', returnedCard)){
						this.setSyncState('server', 'RETURN');
						let syncState = this.getSyncState('RETURN');
						if(syncState.clientFirst && syncState.serverFirst){
							GameActions.onlineReturnCardSuccess();
							GameStoreOnline.resolveSyncState('RETURN');
						}
					}else{
						this.setGameState('RETURN_CARD');
						GameActions.onlinePlayCard(returnedCard);
					}
				}else{
					GameActions.onlineStateReceivedEmitChange('WITHDRAW');
				}
				_fnToCall = null;
				// this.ifEmitFalse(); //to Handle it via action
				// this.ifEmitTrue();
				break;
			case 'RETURN_CARD':
				_next = socketdata.gameData;
				var withdrawnCard = socketdata.gameData.withdrawnCard;
				if(this.ifIPlayedCard('WITHDRAW', withdrawnCard)){
					this.setSyncState('server', 'WITHDRAW');
					let syncState = this.getSyncState('WITHDRAW');
					if(syncState.clientFirst && syncState.serverFirst){
						GameActions.onlineWithdrawCardSuccess();
						GameStoreOnline.resolveSyncState('WITHDRAW');
					}
				}else{
					GameActions.onlinePlayCard(withdrawnCard);
				}
				_fnToCall = null;
				break;
			case 'SERVER_STATE_RECEIVED':
				this.ifEmitFalse();
				break;
		}
	},
	emitPlayCardFromSocket(action, gameData){  // For sending data to server
		let clientData = !gameData ? {action} : {action, gameData};
		socket.emit('play_card', clientData);
	}
});
GameStoreOnline.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	let botState;
	let eventName;
	switch(action.type){
		case 'JOIN_ROOM_REQ_SUCCESS':
			waitFor([GameRoomStore.dispathToken]);
			if (GameStoreOnline.ifGameWaiting()) {
				let gameData = (action.data);
				GameStoreOnline.setGameObj(GameStoreOnline.makeGameObj(gameData));
				if (GameStoreOnline.ifIAmSpectatorOrBot()) {
					// GameStoreOnline.setCardOwnerPosition();
					GameStoreOnline.makeGameRunning();
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.setSpectatorCards();
				} else {
					GameStoreOnline.tryAutoInit();
					GameStoreOnline.emitChange(); // Dont call Animate Here
				}
			} else {
				console.log('Someone joined');
			}
			break;
		case 'GAME325_ONLINE_GAME_STATE_RECEIVED':   
			GameStoreOnline.takeAction(action.clientData);
			if(typeof _fnToCall === 'function'){
				GameStoreOnline.callFn(_fnToCall);
			}
			break;
		case 'GAME325_ONLINE_DISPLAY_GAME_STATE':
			break;
		case 'GAME325_ONLINE_INIT_GAME':
			let gameData;
			gameData = localStorage.getItem('gameData');
			if (gameData) {
				gameData = JSON.parse(gameData);
				let newGameData = GameStoreOnline.makeGameObj(gameData);
				GameStoreOnline.setGameObj(newGameData);
				GameStoreOnline.actOnState();
			} else {
				GameStoreOnline.initGame();
				GameStoreOnline.initDeck();
				GameStoreOnline.setCardPositionByState();
				GameStoreOnline.fireInitStartGame();
			}
			GameStoreOnline.emitChange()
			break;
		case 'GAME325_ONLINE_INIT_START_GAME':
			GameStoreOnline.hideScores();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.setGameState('GAME_STARTED');
			GameStoreOnline.fireInitRound();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function() {
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME325_ONLINE_START_GAME':
			GameStoreOnline.adminRequestsDistribution(GameStoreOnline.getGameProperty('adminId'));
			break;
		case 'GAME325_ONLINE_INIT_ROUND':  // used
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.setNextAction(GameActions.initRoundOnlineSuccess)
			GameStoreOnline.emitChange();
			break;
		case 'GAME325_ONLINE_INIT_ROUND_SUCCESS': //used
			GameStoreOnline.setNextGameObj();
			GameStoreOnline.setActivePlayerPos();
			GameStoreOnline.setCardOwnerPosition();
			
			if (_game.state == 'SELECT_DEALER') {
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.setGameState('DISTRIBUTING_CARDS_0');
					GameStoreOnline.setNextAction(GameActions.distributingCardsZeroOnlineSuccess);
			} else {
				GameStoreOnline.setCardPositionByState();
				if (_game.state == 'DISTRIBUTING_CARDS_1')
					GameStoreOnline.setNextAction(GameActions.onlineDistributionFirstSuccess)
				if (_game.state == 'DISTRIBUTING_CARDS_2')
					GameStoreOnline.setNextAction(GameActions.onlineDistributionSecondSuccess)
			}
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function() {
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME325_ONLINE_DISTRIBUTE_CARDS_ZERO_SUCCESS': //used
			GameStoreOnline.putCardsBackInDeck();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.setNextAction(GameActions.onlineStartGame) // Set Next Action to fire;
			GameStoreOnline.setGameState('DEALER_SELECTION_SUCCESS');
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function() {
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME325_ONLINE_DISTRIBUTE_CARDS_FIRST_SUCCESS': //used
			GameStoreOnline.setGameState('SET_TRUMP');
			var action = null;
			GameStoreOnline.checkBotPlay();
			switch (GameStoreOnline.getGameProperty('botState')) {
				case 'BOT_SHOULD_PLAY':
					GameStoreOnline.setNextAction(GameActions.requestServerBot);
					GameStoreOnline.setCardPositionByState();
					AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
					.then(function() {
						AnimEngine.cancelAnimationFrame();
						GameStoreOnline.emitChange();
					});
				break;
				case 'BOT_CANNOT_PLAY':
					GameStoreOnline.setNextAction(action);
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.emitChange();
				break;
			}
			break;
		case 'GAME325_ONLINE_SET_TRUMP': //used
			var trump = action.trump;
			GameStoreOnline.setGameState('SET_TRUMP');
			if (GameStoreOnline.getGameProperty('trump') != trump) {
				GameStoreOnline.emitPlayCardFromSocket('SET_TRUMP', {trump});
				_game.setTrump(trump);
				GameStoreOnline.setNextAction(GameActions.playedWaitForServer.bind(null, 'TRUMP')); //'TRUMP'	

			} else {
				GameStoreOnline.setNextAction(GameActions.onlineDistributeCardsSecond);	
			}
			GameStoreOnline.emitChange();
			break;
		case 'GAME325_ONLINE_DISTRIBUTE_CARDS_SECOND': //used
			let disCards = GameStoreOnline.getDistributedCards();
			GameStoreOnline.setNextGameObj();
			GameStoreOnline.setCardOwnerPosition();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.assignDistributedCards(disCards);
			GameStoreOnline.setNextAction(GameActions.onlineDistributionSecondSuccess);
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			
			break;
		case 'GAME325_ONLINE_DISTRIBUTE_CARDS_SECOND_SUCCESS': //used
			GameStoreOnline.distributionDone();
			GameStoreOnline.adminRequestsGameState(GameStoreOnline.getGameProperty('adminId')); //To check withdraw return from server
			break;
		case 'GAME325_ONLINE_PLAY_CARD': //used
			var card = action.card;
			var gameState = GameStoreOnline.getGameProperty('state');
			var processPlayCard = false;
			GameStoreOnline.sortDeck(0);
			if (gameState == 'WITHDRAW_CARD') {
				if (typeof GameStoreOnline.getClickedFlag('WITHDRAW') == "boolean" && !GameStoreOnline.getClickedFlag('WITHDRAW')) {
					GameStoreOnline.setClickedFlag('WITHDRAW', true);
					processPlayCard = true;
					if(GameStoreOnline.ifIPlayedCard('WITHDRAW', card)) {
					  GameStoreOnline.emitPlayCardFromSocket('CARD_WITHDRAWN', {card});
					  GameStoreOnline.setNextAction(GameActions.playedWaitForServer.bind(null, 'WITHDRAW'));	
					} else {
						GameStoreOnline.setNextAction(GameActions.onlineWithdrawCardSuccess);
					}
				} else {
					processPlayCard = false;
				}
			}
			else if (gameState == 'RETURN_CARD') {
				if (typeof GameStoreOnline.getClickedFlag('RETURN') == "boolean" && !GameStoreOnline.getClickedFlag('RETURN')) {
					GameStoreOnline.setClickedFlag('RETURN', true);
					processPlayCard = true;
					if (GameStoreOnline.ifIPlayedCard('RETURN', card)) {
						GameStoreOnline.emitPlayCardFromSocket('CARD_RETURNED', {card});
						GameStoreOnline.setNextAction(GameActions.playedWaitForServer.bind(null, 'RETURN'));	
					} else {
						GameStoreOnline.setNextAction(GameActions.onlineReturnCardSuccess);
					}
				} else {
					processPlayCard = false;
				}
			}
			else if (gameState == 'READY_TO_PLAY_NEXT') {
				if (typeof GameStoreOnline.getClickedFlag('PLAY') == "boolean" && !GameStoreOnline.getClickedFlag('PLAY')) {
					GameStoreOnline.setClickedFlag('PLAY', true);
					processPlayCard = true;
					if (GameStoreOnline.ifIPlayedCard('PLAY', card)) {
						GameStoreOnline.emitPlayCardFromSocket('CARD_PLAYED', {card});
						GameStoreOnline.setNextAction(GameActions.playedWaitForServer.bind(null, 'PLAY'));
					} else {
						GameStoreOnline.setNextAction(GameActions.onlinePlayCardSuccess);
					}
				} else {
					processPlayCard = false;
				}
			}
			if (processPlayCard) {
				var deck = GameStoreOnline.getGameProperty('deck');
				deck.map(deckcard=> {
					if (deckcard.suit == card.suit && deckcard.rank == card.rank) {
						deckcard.animTime = timeConstants.PLAY_ANIM;
						deckcard.delay = timeConstants.PLAY_DELAY;
						GameStoreOnline.playCard(deckcard, 'client');
					}
				})
				GameStoreOnline.setCardPositionByState();
				AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
				.then(function(){
					AnimEngine.cancelAnimationFrame();
					GameStoreOnline.emitChange();
				});
			}
			break;
		case 'GAME325_ONLINE_WITHDRAW_CARD_SUCCESS': //used
			GameActions.onlineStateReceivedEmitChange('RETURN');
			break;
		case 'GAME325_ONLINE_RETURN_CARD_SUCCESS': //used
			GameStoreOnline.setOtherPlayerPos();
			GameStoreOnline.setActivePlayerPos();
			if (_next.gameState == 'READY_TO_PLAY_NEXT') {
				GameActions.onlineStateReceivedEmitChange('PLAY');	
			} else if(_next.gameState == 'WITHDRAW_CARD') {
				GameActions.onlineStateReceivedEmitChange('WITHDRAW');		
			}
			break;
		case 'GAME325_ONLINE_SELECT_DEALER_SUCCESS':
			break;
		case 'GAME325_ONLINE_DISTRIBUTE_CARDS':
			GameStoreOnline.distributeCards();
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function() {
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME325_ONLINE_PLAY_CARD_SUCCESS':  ///state when online play card recieved from others
			var card = GameStoreOnline.getGameProperty('cardPlayed');
			GameStoreOnline.updatePlayedCards(card);
			GameStoreOnline.updateBotState('BOT_READY');
			GameStoreOnline.getWinnnerFromServerData();
			GameStoreOnline.setGameState('NOW_NEXT_TURN');
			GameStoreOnline.setCardPositionByState();
			GameActions.nowNextTurn();
			break;
		case 'GAME325_ONLINE_PLAYED_WAIT_FOR_SERVER':
			eventName = action.eventName;
			GameStoreOnline.setSyncState('client', eventName);
			let syncState = GameStoreOnline.getSyncState(eventName);
			if (syncState.clientFirst && syncState.serverFirst) {
				GameStoreOnline.resolveSyncState(eventName);
				switch (eventName) {
					case 'TRUMP':
						GameActions.onlineDistributeCardsSecond();
						break;
					case 'WITHDRAW':
						GameActions.onlineWithdrawCardSuccess();
						break;
					case 'RETURN':
						GameActions.onlineReturnCardSuccess();
						break;
					case 'PLAY':
						GameActions.onlinePlayCardSuccess();
						break;
				}	
			}
			break;
		case 'GAME325_ONLINE_STATE_RECEIVED_EMIT_CHANGE':
			eventName = action.eventName;
			switch (eventName) {
				case 'WITHDRAW':
					GameStoreOnline.setGameState('WITHDRAW_CARD');
					GameStoreOnline.setActivePlayerPos();
					GameStoreOnline.setOtherPlayerPos();
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.setNextAction(null);
					GameStoreOnline.setClickedFlag('WITHDRAW', false);
					GameStoreOnline.emitChange();
					break;
				case 'PLAY':
					GameStoreOnline.setGameState('READY_TO_PLAY_NEXT');
					GameStoreOnline.setActivePlayerPos();
					GameStoreOnline.checkBotPlay();
					switch (GameStoreOnline.getGameProperty('botState')) {
						case 'BOT_SHOULD_PLAY':
							GameStoreOnline.setNextAction(GameActions.requestServerBot);
							GameStoreOnline.setCardPositionByState();
							AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
							.then(function() {
								AnimEngine.cancelAnimationFrame();
								GameStoreOnline.emitChange();
							});
						break;
						case 'BOT_CANNOT_PLAY':
							GameStoreOnline.setNextAction(null);
							GameStoreOnline.setCardPositionByState();
							GameStoreOnline.setClickedFlag('PLAY', false);
							GameStoreOnline.emitChange();
						break;
					}
					break;
				case 'RETURN':
					GameStoreOnline.setGameState('RETURN_CARD');
					GameStoreOnline.setActivePlayerPos();
					GameStoreOnline.setOtherPlayerPos();
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.setNextAction(null);
					GameStoreOnline.setClickedFlag('RETURN', false);
					GameStoreOnline.emitChange();
			}
			break;
		case 'GAME325_ONLINE_NOW_NEXT_TURN':
	 		if (_game.winnerId) {
	 			GameStoreOnline.setGameState('MOVE_HAND');
				let playerIds = GameStoreOnline.getPlayerIds();
				for (var i = 0; i < playerIds.length; i++) {
					if (playerIds[i] == _game.winnerId) {
						var winnerPos = i;
					}
				};
				GameStoreOnline.moveHandMade(winnerPos);
				GameStoreOnline.setCardPositionByState();
				GameStoreOnline.setNextAction(GameActions.onlineMoveHandSuccess);
				AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
				.then(function() {
					AnimEngine.cancelAnimationFrame();
					GameStoreOnline.emitChange();
				});
			} else {
				GameStoreOnline.nextTurn();
				GameStoreOnline.setClickedFlag('PLAY', false);
				GameStoreOnline.checkBotPlay();
				switch (GameStoreOnline.getGameProperty('botState')) {
					case 'BOT_SHOULD_PLAY':
						GameStoreOnline.setNextAction(GameActions.requestServerBot);
						GameStoreOnline.setCardPositionByState();
						AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
						.then(function() {
							AnimEngine.cancelAnimationFrame();
							GameStoreOnline.emitChange();
						});
					break;
					case 'BOT_CANNOT_PLAY':
						GameStoreOnline.setNextAction(null);
						GameStoreOnline.setCardPositionByState();
						GameStoreOnline.emitChange();
					break;
				}
			}
		 	break;
		 case 'GAME325_ONLINE_MOVE_HAND_SUCCESS':
		 	GameStoreOnline.checkRoundEnd();
		 	if (GameStoreOnline.getGameProperty('state') == 'ROUND_END') {
		 		GameStoreOnline.roundEnd();
				GameStoreOnline.setRoundEndPos();
				GameStoreOnline.setClickedFlag('WITHDRAW', false);
				GameStoreOnline.setClickedFlag('RETURN', false);
				GameStoreOnline.setClickedFlag('PLAY', false);
				GameStoreOnline.setClickedFlag('TRUMP', false);
				// GameStoreOnline.emitAndSaveChange( 'gameData', _game );
				AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
				.then(function() {
					AnimEngine.cancelAnimationFrame();
					GameStoreOnline.emitChange();
				});
		 	} else {
		 		GameActions.nowNextTurn();
		 	}
		 	break;
		 case 'GAME325_ONLINE_PLAYER_CHANGED':
		// In case a player leaves the game. Emit is true when game is waiting, false when game is running
			let players = action.players;
			console.log(GameStoreOnline.ifGameWaiting());
			if (GameStoreOnline.ifGameWaiting()) {
				GameStoreOnline.refreshPlayers(players);
				GameStoreOnline.emitChange();
			} else {  // if game is running add player change event to server queue. Do not act.
				let socketdata = {
					action: 'PLAYER_CHANGED',
					gameData: players
				}
				// GameStoreOnline.pushServerData(socketdata);
				// GameStoreOnline.attemptPlayerChangeTrigger();
			}
			break;
		 case 'GAME325_ONLINE_SHOW_SCORES':
		 	GameStoreOnline.showScores();
			GameStoreOnline.setRoundEndPos();
			GameStoreOnline.setGameState('ROUND_END_SHOW_SCORES');
		 	// GameStoreOnline.emitChange();
		 	AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function() {
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
		 	break;
		 case 'GAME325_ONLINE_REQUEST_SERVER_BOT':
			GameStoreOnline.adminRequestServerBot(GameStoreOnline.getGameProperty('adminId'));
			break;
		 case 'GAME325_ONLINE_BOT_WILL_PLAY':
		 	break;
		 case 'GAME325_REFRESH_STORE':
			waitFor([PauseStore.dispatchToken]);
			GameStoreOnline.refreshStore();
			// GameStoreOnline.emitChange();
			break;
		 }
});

export default GameStoreOnline;