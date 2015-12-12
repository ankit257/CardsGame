import React from 'react';
import { register, waitFor } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import { Howl } from "howler";
import selectn from 'selectn';

import * as GameActions from '../actions/GameActions';
import GameRoomStore from '../../../stores/GameRoomStore';
import { timeConstants, gameVars } from '../constants/SattiHelper'

import PlayingCard from '../utils/PlayingCard';
import GameSatti from '../utils/GameSatti';
import PlayerSatti from '../utils/PlayerSatti';
import BotSatti from '../utils/BotSatti';
import ScoreSatti from '../utils/ScoreSatti';

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
var _sync = {               // object to store the value and allow function flow on the basis of whether client calculated first or server sent data first
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
	setSyncState(caller, event, data){         // setter function for sync state
		if(caller == 'server'){
			_sync.serverFirst = true;
		}else if(caller == 'client'){
			_sync.clientFirst = true;
		}
		_sync.event = event;
		_sync.data = data;
	},
	clearSyncState(){							// clear sync state once sync is resolved
		_sync = {
			clientFirst : false,
			serverFirst : false,
			event		: '',
			data 		: {}
		}
	},
	getSyncState(){							// getter function for sync state
		return _sync;
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
		_myid = id;
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
			GameActions.showScoresOnline();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireNextTurn(){
		setTimeout(function(){
			GameActions.nowNextTurn();
		}, timeConstants.DISPATCH_DELAY);	
	},
	fireTurnSkipped(){
		setTimeout(function(){
			GameActions.onlineSkipTurn();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireInitStartGame(){
		setTimeout(function(){
			GameActions.initStartGame();
		}, timeConstants.DISPATCH_DELAY);
	},
	firePlayCardSuccess(){
		setTimeout(function(){
			GameActions.playCardSuccessOnline();
		}, timeConstants.DISPATCH_DELAY);
	},
	fireCardPlayed(){
		setTimeout(function(){
			GameActions.cardPlayed();
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
			if(player.profile && player.profile.profile){
				player.name = player.profile.profile.first_name;
			}
			if(player.type == 'HUMAN' || player.type == 'ADMIN'){
				newGameData.players.push(Object.assign(new PlayerSatti(player), player));
			}else if(player.type == 'BOT' || player.type == 'SPECTATOR'){
				newGameData.players.push(Object.assign(new BotSatti(player), player));
			}else{
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
	adminCheckAndAct(){     // If game state is idle, admin checks the gamestate and botstate and acts accordingly.
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
	adminRequestServerBot(adminId){   // admin plays for a bot. Either plays a card or sends a skip turn to server. Server sends NEXT_ROUND with nextRoundCalculations
		if(_myid == adminId){
			_game.players.map(player=>{
				if(player.id == _game.activePlayerId && player.state == 'SKIP_TURN'){
					setTimeout(function(){
						GameActions.skipMyTurn(_game.activePlayerId);
					}, timeConstants.DISPATCH_DELAY);
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
						_game.players.push(Object.assign(new PlayerSatti(gamePlayer), gamePlayer));
					}else if(serverPlayer.type == 'BOT' || serverPlayer.type == 'SPECTATOR'){
						_game.players.push(Object.assign(new BotSatti(gamePlayer), gamePlayer));
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
					player.score = Object.assign(new ScoreSatti(), savedGamePlayers[i].score);
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
	takeAction(socketdata){  // switch for acting upon data being received from server
		switch(socketdata.action){
			case 'SET_ID':   // sent as soon as a player gets connected to socket.
				this.setMyId(socketdata.id);
				this.initPlayersArray();
				this.ifEmitFalse();
				break;
			case 'START_NEW_ROUND': // New gameObj from server received at the start of every round.
				if(this.ifGameWaiting) this.makeGameRunning();
				_next.gameData = socketdata.gameData; // Save a copy of gameData here. Use during distribution
				_next.activePlayerId = socketdata.gameData.activePlayerId;
				_next.gameTurn = socketdata.gameData.gameTurn;
				_next.playableCards = socketdata.gameData.playableCards;
				_game.initDeck(); // Save server gameObj in temporary variable and initDeck here which has all _game.deck[i].state == 'IN_DECK' <- To bring deck to centre of board
				this.setGameState('INIT_ROUND');
				this.ifEmitTrue();   // <- This received event and its changes will be emitted from store 
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
						let sync = this.getSyncState();
						if(sync.clientFirst){  // if client play_card_success was already fired before next_turn data was received from server
							this.firePlayCardSuccess();
							this.clearSyncState();
						}else{					// else if server reached first and client is still animating his card.
							this.setSyncState('server', 'PLAY_CARD_DONE', {});
						}
						this.setGameState('PLAY_DATA_RECEIVED');
					}else{
						// If I have not played this card, animate the played card for other clients.
						_game.cardPlayed = socketdata.gameData.card;
						this.fireCardPlayed();
						this.setGameState('READY_TO_PLAY_NEXT');
					}
				}else if(socketdata.gameData.turnType == 'TURN_SKIPPED'){
					// IF TURN WAS SKIPPED
					this.fireTurnSkipped();
					this.setGameState('SKIP_DATA_RECEIVED');
				}
				this.ifEmitFalse();  // <- All emits are already handled using fire functions. Do not emit this data receive.
				break;
			case 'ROUND_END': // Once round_end is received, do everything as we do in NEXT_TURN, just show scores in the end
				_playersFromServer = socketdata.gameData.players;
				if(socketdata.gameData.card !== undefined && socketdata.gameData.turnType == 'CARD_PLAYED'){
					let socketcard = socketdata.gameData.card;
					if(_game.cardPlayed && _game.cardPlayed.suit && _game.cardPlayed.suit == socketcard.suit && _game.cardPlayed.rank == socketcard.rank){
						let sync = this.getSyncState();
						if(sync.clientFirst){
							this.firePlayCardSuccess();
							this.clearSyncState();
						}else{
							this.setSyncState('server', 'PLAY_CARD_DONE', {});
						}
						this.setGameState('PLAY_DATA_RECEIVED');
						this.ifEmitFalse();
					}else{
						_game.cardPlayed = socketdata.gameData.card;
						this.fireCardPlayed();
						this.setGameState('READY_TO_PLAY_NEXT');
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
				console.log('Someone joined');
			}
			break;
		case 'GAME7_ONLINE_GAME_STATE_RECEIVED':   
			GameStoreOnline.takeAction(action.clientData);
			if(GameStoreOnline.getIfEmit()){  // -> Whether or not to emit the change 
				GameStoreOnline.emitChange();
			}
			break;
		case 'GAME_7_ONLINE_INIT_ROUND_SUCCESS': 
		// Server sends 'START_NEW_ROUND' - (use false deck) -> 'INIT_ROUND' -> 'INIT_ROUND_SUCCESS' - (consume server gameObj using setNextGameObj) -> 'DISTRIBUTING_CARDS'
			GameStoreOnline.setNextGameObj();
			// GameStoreOnline.setPlayerPositionById();
			GameStoreOnline.setCardOwnerPosition();
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setGameState('DISTRIBUTING_CARDS');
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.emitChange();
			break;
		case 'GAME7_ONLINE_DISTRIBUTE_CARDS_SUCCESS':
		// 'DISTRIBUTING_CARDS' - (AnimEngine) -> 'DISTRIBUTION_SUCCESS' -> 'NOW_NEXT_TURN' -> gamestate == 'READY_TO_PLAY_NEXT' -> waitForClientInput
			GameStoreOnline.distributionDone();
			GameStoreOnline.setGameState('NOW_NEXT_TURN');
			GameStoreOnline.fireNextTurn();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.emitChange();
			break;
		case 'GAME7_ONLINE_NOW_NEXT_TURN':
		// Universal next_turn event fired after PLAY_CARD_SUCCESS and SKIP_TURN_DONE
			GameStoreOnline.nextTurn();
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.updatePlayableCards();
			GameStoreOnline.setClearedPlayers();
			GameStoreOnline.checkTurnSkip();
			GameStoreOnline.checkBotPlay();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.emitChange();
			break;
		case 'GAME7_ONLINE_PLAY_CARD':
		// If I am active player and I played this card. Rendering independant from server.
			var card = action.card;
			GameStoreOnline.playCard(card, 'client');
			GameStoreOnline.updatePlayersArray();
			GameStoreOnline.sortDeck(0);
			GameStoreOnline.updateCardIndex();
			GameStoreOnline.setCardPositionByState();
			GameStoreOnline.emitPlayCardFromSocket('CARD_PLAYED', {card});
			GameStoreOnline.emitChange();
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
			GameStoreOnline.emitChange();
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
			}else{
				GameStoreOnline.updateBotState('BOT_READY');
				GameStoreOnline.setGameState('NOW_NEXT_TURN');
				GameStoreOnline.setCardPositionByState();
				GameStoreOnline.fireNextTurn();	
			}
			GameStoreOnline.emitChange();
			break;
		case 'GAME_7_ONLINE_PLAYED_WAIT_FOR_SERVER':
		// I have played card during my turn - (AnimEngine) -> WAIT_FOR_SERVER
			var sync = GameStoreOnline.getSyncState();
			if(sync.serverFirst){  // <-  If server already sent next_turn data while I was animating.
				GameStoreOnline.firePlayCardSuccess();
				GameStoreOnline.clearSyncState();
			}else{
				GameStoreOnline.setSyncState('client', 'PLAY_CARD_DONE', {});
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
			break;
		case 'GAME_7_ONLINE_SKIP_TURN_DONE':
		// Fired after both skip turn events. Next event is NOW_NEXT_TURN
			GameStoreOnline.setGameState('NOW_NEXT_TURN');
			GameStoreOnline.fireNextTurn();
			GameStoreOnline.emitChange();
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
			GameStoreOnline.refreshPlayers(players);
			if(GameStoreOnline.ifGameWaiting()){
				GameStoreOnline.emitChange();
			}else{
				console.log('player_changed');
				GameStoreOnline.gameIsIdleFor(6000)
				.then(function(){
					GameStoreOnline.adminCheckAndAct();
				}, function(){
					console.log('Running');
				})
			}
			break;
		case 'GAME_7_ONLINE_REQUEST_SERVER_BOT':
			GameStoreOnline.adminRequestServerBot(GameStoreOnline.getGameProperty('adminId'));
			break;
		case 'GAME7_ONLINE_ADMIN_REQUEST_DISTRIBUTION':
			GameStoreOnline.adminRequestsDistribution(GameStoreOnline.getGameProperty('adminId'));
			break;
		 }
});

export default GameStoreOnline;