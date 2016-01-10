import React from 'react';
import { register, waitFor, delay } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import { Howl } from "howler"
import selectn from 'selectn';

import * as GameActions from '../actions/GameActions';
import GameRoomStore from '../../../stores/GameRoomStore';
import PauseStore from '../stores/PauseStore';
import { timeConstants, gameVars } from '../constants/DehlaHelper'

import PlayingCard from '../utils/PlayingCard';
import GameDehla from '../utils/GameDehla';
import PlayerDehla from '../utils/PlayerDehla';
import BotDehla from '../utils/BotDehla';
import ScoreDehla from '../utils/ScoreDehla';
import AnimEngine from '../utils/AnimEngine'

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
var _serverData = [];
var _playCardSync = {               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
	clientFirst : false,
	serverFirst : false,
	event		: '',
	data 		: {}
}
var _ifEmit = true;           // bool to control if Store will emit change on data being received from server
var _playersFromServer = [];  // to store the scores from server at round end 
var _scoreUpdated = false;    // to show a red dot over scores in view once scores are received from server
var _ifWaiting = true;        // ifWaiting bool stores the state of client: whether it is waiting for more players to join or whether game is running and new users will be treated as spectators

const GameStoreOnline = createStore( {
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
		_playCardSync = {               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
			clientFirst : false,
			serverFirst : false,
			event		: '',
			data 		: {}
		}
		_ifEmit = true;           // bool to control if Store will emit change on data being received from server
		_playersFromServer = [];  // to store the scores from server at round end 
		_scoreUpdated = false;    // to show a red dot over scores in view once scores are received from server
		_ifWaiting = true;        // ifWaiting bool stores the state of client: whether it is waiting for more players to join or whether game is running and new users will be treated as spectators
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
	makeGameRunning(){
		_ifWaiting = false;
	},
	updateCardState(card, state){
		_game.updateCardState(card, state);
	},
	setGameState(gameState){
		_game.state = gameState;
	},
	setPlayCardSyncState(caller, event, data){         // setter function for sync state
		if(caller == 'server'){
			_playCardSync.serverFirst = true;
		}else if(caller == 'client'){
			_playCardSync.clientFirst = true;
		}
		_playCardSync.event = event;
		_playCardSync.data = data;
	},
	resolvePlayCardSyncState(){							// clear sync state once sync is resolved
		_playCardSync = {
			clientFirst : false,
			serverFirst : false,
			event		: '',
			data 		: {}
		}
	},
	getPlayCardSyncState(){							// getter function for sync state
		return _playCardSync;
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
	updateBotState(botState){ 					//same
		_game.botState = botState;
	},
	updatePlayedCards(card){ 					//same
		delete _game.cardPlayed;
		_game.addPlayedCard(card);
	},
	updatePlayableCards(){ 					//same
		_game.deck.map(deckcard=>{
			_next.playableCards.map(shortCard=>{
				if(deckcard.rank == shortCard.rank && deckcard.suit == shortCard.suit){
					_game.addPlayableCard(deckcard);
				}
			})
		})
		this.setPlayableCount();
	},
	updatePlayerScores(playerpos, penalty){ 					//same
		_game.players[playerpos].score.penalty.push(penalty);
	},
	getXP(){
		let xp = 0;
		_game.players.map(player=>{
			if(player.id == _myid && player.type == 'HUMAN'){
				let score = player.score;
				let penalty = score.penalty[score.penalty.length-1];
				if(penalty) {
					xp = Math.round((100-penalty)/10);
				}else{
					xp = 0;
				}
			}
		})
		console.log(xp);
		return xp;
	},
	setPlayerState(pos, state){ 					//same... position handling. Earlier _game.players[playerPos] gave the position. Now it has to be checked explicitly
			if(state == 'CLEARED'){
				_game.players.map(player=>{
					if(player.position == pos && player.state != 'CLEARED'){
						bellAudio.play();
					}
				})
			}
			_game.players.map(player=> {
				if(player.position == pos){
					player.state = state;
				}
			})
	},
	setCardPositionByState(){ 					//same
		_game.deck.map(deckcard=> {deckcard.setPositionByState();});
	},
	setRoundEndPos(){ 					//same
		_game.deck.map(deckcard=> deckcard.setRoundEndPosition());
	},
	setMyId(id){   // id setter
		// this.refreshStore();
		_myid = id;
	},
	initGame(){
		_game = new GameDehla();
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
		if(!this.ifIAmSpectatorOrBot() && _game.activePlayerId == _myid){
			_game.checkTurnSkip('online');
		}
	},
	playBot(){
		return _game.playBot(_playersCards[_game.activePlayerPos]);
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
	nextTurn(){
		_game.gameTurn = _next.gameTurn;
		this.setActivePlayerPos();
		_game.state = 'READY_TO_PLAY_NEXT';
	},
	roundEnd(){
		tadaAudio.play();
		_game.roundEnd();
	},
	fireInitRound(){
		GameActions.initRoundOnline();
	},
	fireDistributeCards(){
		GameActions.distributeCards();
	},
	fireShowScores(){
		GameActions.showScoresOnline();
	},
	fireNextTurn(){
		GameActions.nowNextTurn();
	},
	fireTurnSkipped(){
		GameActions.onlineSkipTurn();
	},
	fireInitStartGame(){
		GameActions.initStartGame();
	},
	firePlayCardSuccess(){
		GameActions.playCardSuccessOnline();
	},
	fireCardPlayed(){
		GameActions.cardPlayed();
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
	checkRoundEnd(){
		this.updatePlayersArray();
		if(_game.state == 'PLAYING_CARD' || _game.state == 'PLAYING_PLAYED_CARD' || _game.state == 'PLAY_DATA_RECEIVED'){
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
				_game.players.map(player=>{
					if(player.position == playerPos && player.state != 'CLEARED'){
						this.setPlayerState(playerPos, 'CAN_PLAY');	
					}
				})
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
		this.setPlayerPositionById();
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
	scoreUpdatedTrue(){
		_scoreUpdated = true;
	},
	scoreUpdatedFalse(){
		_scoreUpdated = false;
	},
	getScoreUpdated(){
		// return true;
		return _scoreUpdated;
	},
	makeGameObj(gameData){						// daddy function to take gameData as input and return gameObj with all its prototype functions. Similar function exists on server side
		let newGameData = new GameDehla();
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
			if(player.profile && player.profile.profile){
				player.name = player.profile.profile.first_name;
			}
			if(player.type == 'HUMAN' || player.type == 'ADMIN'){
				newGameData.players.push(Object.assign(new PlayerDehla(player), player));
			}else if(player.type == 'BOT' || player.type == 'SPECTATOR'){
				newGameData.players.push(Object.assign(new BotDehla(player), player));
			}else{
				console.log('Weird');
			}
		})
		newGameData.players.map(player => {
			delete player.score;
		})
		for (var i = 0; i < gameData.players.length; i++) {
			newGameData.players[i].score = Object.assign(new ScoreDehla(), gameData.players[i].score);
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
	setNewScores(){        // Reads the _next.playerfromserver and sets score after PLAY_CARD_SUCCESS -> ROUND_END_SHOW_SCORES
		_game.players.map(player=>{
			_playersFromServer.map(playerfromserver=>{
				if(playerfromserver.id == player.id){
					player.score = Object.assign(new ScoreDehla(), playerfromserver.score);
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
	adminCheckAndAct(){     // If game state is idle, admin checks the gamestate and botstate and acts accordingly.
		if(_game.adminId == _myid && !this.ifIAmSpectatorOrBot()){
			switch(_game.state){
				case 'READY_TO_PLAY_NEXT':
					_game.checkBotPlay();
					if(_game.botState == 'BOT_SHOULD_PLAY'){
						GameActions.requestServerBot();
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
	adminRequestServerBot(adminId){   // admin plays for a bot. Either plays a card or sends a skip turn to server. Server sends NEXT_ROUND with nextRoundCalculations
		if(_myid == adminId){
			_game.players.map(player=>{
				if(player.id == _game.activePlayerId && player.state == 'SKIP_TURN'){
					GameActions.skipMyTurn(_game.activePlayerId);
				}else if(player.id == _game.activePlayerId && (player.state == 'CAN_PLAY' || player.state == 'CLEARED')){
					let card = this.playBot();
					this.emitPlayCardFromSocket('CARD_PLAYED', {card});
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
						_game.players.push(Object.assign(new PlayerDehla(gamePlayer), gamePlayer));
					}else if(serverPlayer.type == 'BOT' || serverPlayer.type == 'SPECTATOR'){
						_game.players.push(Object.assign(new BotDehla(gamePlayer), gamePlayer));
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
					player.score = Object.assign(new ScoreDehla(), savedGamePlayers[i].score);
				}
			})
		};
		serverPlayers.map(serverPlayer=>{
			if(serverPlayer.type == 'ADMIN'){
				newAdminId = serverPlayer.id;
			}
		})
		_game.adminId = newAdminId;

	},
	attemptPlayerChangeTrigger(){
		if(_serverData.length > 0 && _serverData[0].action == 'PLAYER_CHANGED'){
			this.actUponServerData();
		}
	},
	attemptClientTrigger(socketdata){
		switch(_game.state){
			case 'READY_TO_PLAY_NEXT':
				if((socketdata.gameData.nextGameTurn - _game.gameTurn) == 1 || socketdata.action == 'ROUND_END') this.actUponServerData();
				break;
			case 'PLAYING_CARD':
				let playCardSync = this.getPlayCardSyncState();
				if(playCardSync.clientFirst){  // if client play_card_success was already fired before next_turn data was received from server
					this.actUponServerData();
					this.resolvePlayCardSyncState();
				}else{					// else if server reached first and client is still animating his card.
					this.setPlayCardSyncState('server', 'PLAY_CARD_DONE', {});
				}
				break;
			case 'ROUND_END':
				// console.log('server reached here');
				if(socketdata.action == 'ROUND_END') this.actUponServerData();
				break;
		}
	},
	actUponServerData(){
		if(_serverData.length > 0){
			let action = _serverData[0].action;
			switch(action){
				case 'NEXT_TURN':
				case 'ROUND_END':
					this.takeAction(_serverData.shift());
					break;
				case 'PLAYER_CHANGED':
					let data = _serverData.shift(), self = this;
					this.refreshPlayers(data.gameData);
					if(_serverData.length == 0){
						this.gameIsIdleFor(2000)
						.then(function(){
							self.adminCheckAndAct();
						}, function(){
							// console.log('Running');
						})
					}else{
						this.actUponServerData(); // PlayerChanged event never triggers actUponServerData() function. It must be triggered by NEXT_TURN event
					}
					break;
			}
		}
	},
	checkActionType(serveraction){
		let actions = [{
						type: 'IMMEDIATE',
						values: ['SET_ID', 'START_NEW_ROUND']
					},{
						type: 'DEFERRED',
						values: ['NEXT_TURN', 'ROUND_END', 'PLAYER_CHANGED']
					}]
		for (var i = 0; i < actions.length; i++) {
			if(actions[i].values.indexOf(serveraction) > -1){
				return actions[i].type;
				break;
			}
		};
		console.warn('Some action may not be defined');
		return false;
	},
	pushServerData(socketdata){
		switch(this.checkActionType(socketdata.action)){
			case 'IMMEDIATE':
				this.takeAction(socketdata);
				break;
			case 'DEFERRED':
				_serverData.push(socketdata);
				this.attemptClientTrigger(socketdata);
				// console.log(_serverData);
				break;
			case false:
				console.warn('Cannot process further');
				break;
		}
	},
	getAnimEngineData(){
		return {
			deck: _game.deck,
			gameState: _game.state,
			botState: _game.botState,
			ifOnline: false
			}
	},
	takeAction(socketdata){  // switch for acting upon data being received from server
		// console.log(socketdata);
		switch(socketdata.action){
			case 'SET_ID':   // sent as soon as a player gets connected to socket.
				this.setMyId(socketdata.id);
				this.initPlayersArray();
				this.ifEmitFalse();
				break;
			case 'START_NEW_ROUND': // New gameObj from server received at the start of every round.
				if(this.ifGameWaiting) this.makeGameRunning();
				_serverData = [];
				_next.gameData = socketdata.gameData; // Save a copy of gameData here. Use during distribution
				_next.activePlayerId = socketdata.gameData.activePlayerId;
				_next.gameTurn = socketdata.gameData.gameTurn;
				_next.playableCards = socketdata.gameData.playableCards;
				_game.initDeck(); // Save server gameObj in temporary variable and initDeck here which has all _game.deck[i].state == 'IN_DECK' <- To bring deck to centre of board
				this.fireInitRound();
				break;
			case 'NEXT_TURN': 
			// Server sends 'NEXT_TURN' when client either plays card or skips turn. Save temporary values in _next and consume after render_success.
				_next.activePlayerId = socketdata.gameData.nextActivePlayerId;
				_next.gameTurn = socketdata.gameData.nextGameTurn;
				_next.playableCards = socketdata.gameData.playableCards;
				if(socketdata.gameData.card !== undefined && socketdata.gameData.turnType == 'CARD_PLAYED'){
					// IF CARD WAS PLAYED AND TURN WAS NOT SKIPPED
					let socketcard = socketdata.gameData.card;
					_game.botState = socketdata.gameData.botState;
					if(_game.cardPlayed && _game.cardPlayed.suit && _game.cardPlayed.suit == socketcard.suit && _game.cardPlayed.rank == socketcard.rank){
						// If I have played this card, then I don't want it to reanimate.
							this.firePlayCardSuccess();
					}else{
						// If I have not played this card, animate the played card for other clients.
						_game.cardPlayed = socketdata.gameData.card;
						this.fireCardPlayed();
					}
				}else if(socketdata.gameData.turnType == 'TURN_SKIPPED'){
					// IF TURN WAS SKIPPED
					this.fireTurnSkipped();
					this.setGameState('SKIP_DATA_RECEIVED');
				}
				break;
			case 'ROUND_END': // Once round_end is received, do everything as we do in NEXT_TURN, just show scores in the end
				_playersFromServer = socketdata.gameData.players;
				if(socketdata.gameData.card !== undefined && socketdata.gameData.turnType == 'CARD_PLAYED'){
					let socketcard = socketdata.gameData.card;
					if(_game.cardPlayed && _game.cardPlayed.suit && _game.cardPlayed.suit == socketcard.suit && _game.cardPlayed.rank == socketcard.rank){
						this.firePlayCardSuccess();
					}else{
						_game.cardPlayed = socketdata.gameData.card;
						this.fireCardPlayed();
						this.ifEmitTrue();
					}
				}
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
	switch(action.type){
		case 'JOIN_ROOM_REQ_SUCCESS':
			waitFor([GameRoomStore.dispathToken]);
			if(GameStoreOnline.ifGameWaiting()){
				let gameData = (action.data);
				GameStoreOnline.setGameObj(GameStoreOnline.makeGameObj(gameData));
				if(GameStoreOnline.ifIAmSpectatorOrBot()){
					GameStoreOnline.setCardOwnerPosition();
					GameStoreOnline.makeGameRunning();
					GameStoreOnline.setCardPositionByState();
					GameStoreOnline.setSpectatorCards();
				}else{
					GameStoreOnline.tryAutoInit();
					GameStoreOnline.emitChange();
				}
			}else{
				// console.log('Someone joined');
			}
			break;
		case 'GAME7_ONLINE_GAME_STATE_RECEIVED':   
			GameStoreOnline.pushServerData(action.clientData);
			break;
		case 'GAME_7_ONLINE_INIT_ROUND':
		// to bring deck to centre position
			GameStoreOnline.setGameState('INIT_ROUND');
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME_7_ONLINE_INIT_ROUND_SUCCESS': 
		// Server sends 'START_NEW_ROUND' - (use false deck) -> 'INIT_ROUND' -> 'INIT_ROUND_SUCCESS' - (consume server gameObj using setNextGameObj) -> 'DISTRIBUTING_CARDS'
			GameStoreOnline.setNextGameObj();  // now use the calculated gameObj sent by server
			GameStoreOnline.setCardOwnerPosition();
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setGameState('DISTRIBUTING_CARDS');
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME7_ONLINE_DISTRIBUTE_CARDS_SUCCESS':
		// 'DISTRIBUTING_CARDS' - (AnimEngine) -> 'DISTRIBUTION_SUCCESS' -> 'NOW_NEXT_TURN' -> gamestate == 'READY_TO_PLAY_NEXT' -> waitForClientInput
			GameStoreOnline.distributionDone();
			GameStoreOnline.setGameState('NOW_NEXT_TURN');
			GameStoreOnline.fireNextTurn();
			break;
		case 'GAME7_ONLINE_NOW_NEXT_TURN':
		// Universal next_turn event fired after PLAY_CARD_SUCCESS and SKIP_TURN_DONE and DISTRIBUTE_CARDS_SUCCESS
			GameStoreOnline.nextTurn();
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.updatePlayableCards();
			GameStoreOnline.setClearedPlayers();
			GameStoreOnline.checkTurnSkip();
			GameStoreOnline.checkBotPlay();
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.actUponServerData();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME7_ONLINE_PLAY_CARD':
		// If I am active player and I played this card. Rendering independant from server.
			var card = action.card;
			GameStoreOnline.emitPlayCardFromSocket('CARD_PLAYED', {card});
			GameStoreOnline.playCard(card, 'client');
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME7_ONLINE_CARD_PLAYED':
		// If I am not active player and someone played this card. Rendered after data received from server.
			var card = GameStoreOnline.getGameProperty('cardPlayed');
			GameStoreOnline.playCard(card, 'server');
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setGameState('PLAYING_PLAYED_CARD');
			GameStoreOnline.setCardPositionByState();
			AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
			.then(function(){
				AnimEngine.cancelAnimationFrame();
				GameStoreOnline.emitChange();
			});
			break;
		case 'GAME7_ONLINE_PLAY_CARD_SUCCESS':
		// Fired after both the PLAY_CARD events -> Next event is NOW_NEXT_TURN
			var card = GameStoreOnline.getGameProperty('cardPlayed');
			GameStoreOnline.updateCardState(card, 'PLAYED');
			GameStoreOnline.updatePlayedCards(card);
			GameStoreOnline.checkRoundEnd();
			if(GameStoreOnline.getGameProperty('state') == 'ROUND_END'){
				GameStoreOnline.roundEnd();
				GameStoreOnline.setRoundEndPos();
				AnimEngine.startAnimation(GameStoreOnline.getAnimEngineData())
				.then(function(){
					AnimEngine.cancelAnimationFrame();
					GameStoreOnline.actUponServerData();
					GameStoreOnline.emitChange();
				});
			}else{
				GameStoreOnline.updateBotState('BOT_READY');
				GameStoreOnline.setGameState('NOW_NEXT_TURN');
				GameStoreOnline.fireNextTurn();	
			}
			break;
		case 'GAME_7_ONLINE_PLAYED_WAIT_FOR_SERVER':
		// I have played card during my turn - (AnimEngine) -> WAIT_FOR_SERVER
			var playCardSync = GameStoreOnline.getPlayCardSyncState();
			if(playCardSync.serverFirst){  // <-  If server already sent next_turn data while I was animating.
				GameStoreOnline.actUponServerData();
				GameStoreOnline.resolvePlayCardSyncState();
			}else{
				GameStoreOnline.setPlayCardSyncState('client', 'PLAY_CARD_DONE', {});
			}
			break;
		case 'GAME_7_ONLINE_SKIP_TURN':
		// If I skipped my turn
			var id = action.id;
			GameStoreOnline.emitPlayCardFromSocket('SKIP_TURN', {id});
			break;
		case 'GAME_7_ONLINE_TURN_SKIPPED':
		// If skip turn data received from server
			passAudio.play();
			GameStoreOnline.emitChange();
			break;
		case 'GAME_7_ONLINE_SKIP_TURN_DONE':
		// Fired after both skip turn events. Next event is NOW_NEXT_TURN
			GameStoreOnline.setGameState('NOW_NEXT_TURN');
			GameStoreOnline.fireNextTurn();
			break;
		case 'GAME_7_ONLINE_SHOW_SCORES':
		// Sets the dot above score button on the view to show scores have been updated
			GameStoreOnline.setNewScores();
			GameStoreOnline.adminRequestsDistribution(GameStoreOnline.getGameProperty('adminId'));
			GameStoreOnline.setGameState('ROUND_END_SHOW_SCORES');
			GameStoreOnline.emitChange();
			break;
		case 'GAME_7_ONLINE_HIDE_SCORE_UPDATED':
			GameStoreOnline.scoreUpdatedFalse();
			break;
		case 'GAME_7_ONLINE_PLAYER_CHANGED':
		// In case a player leaves the game. Emit is true when game is waiting, false when game is running
			let players = action.players;
			if(GameStoreOnline.ifGameWaiting()){
				GameStoreOnline.refreshPlayers(players);
				GameStoreOnline.emitChange();
			}else{  // if game is running add player change event to server queue. Do not act.
				let socketdata = {
					action: 'PLAYER_CHANGED',
					gameData: players
				}
				GameStoreOnline.pushServerData(socketdata);
				GameStoreOnline.attemptPlayerChangeTrigger();
			}
			break;
		case 'GAME_7_ONLINE_REQUEST_SERVER_BOT':
			GameStoreOnline.adminRequestServerBot(GameStoreOnline.getGameProperty('adminId'));
			break;
		case 'GAME7_ONLINE_ADMIN_REQUEST_DISTRIBUTION':
			GameStoreOnline.adminRequestsDistribution(GameStoreOnline.getGameProperty('adminId'));
			break;
		case 'GAME_7_REFRESH_STORE':
			waitFor([PauseStore.dispatchToken]);
			GameStoreOnline.refreshStore();
			// GameStoreOnline.emitChange();
			break;
		 }
});

export default GameStoreOnline;