var GameSatti = require('../game7/utils/GameSatti');
var CardsSatti = require('../game7//utils/CardsSatti');
var PlayerSatti = require('../game7/utils/PlayerSatti');
var BotSatti = require('../game7/utils/BotSatti');
var ScoreSatti = require('../game7/utils/ScoreSatti');
var PlayingCard = require('../game7/utils/PlayingCard');

module.exports = {
	handlePlayCard : function(data){
		/*
			Function which listens to socket.on('play_card',...) and acts according to clientData.action
			Everything in this file passes through this function
		*/
		var clientData = data.clientData, gameData = data.gameData, gameObj = {};
		if(typeof clientData.action === 'undefined'){
			return;
		}
		var gameObj = this.makeGameObj(gameData);
		switch(clientData.action){
			case 'START_NEW_ROUND':
				this.handleSpectators(gameObj);
				gameObj.initDeck();
				gameObj.initRound();
				gameObj.distributeCards();                  // (D1) assign ownerPos to cards in deck
				this.addIdToDeck(gameObj);                  // (D2) assign ownerIds according to ownerPos before sending to client
				gameObj.setNextActivePlayerPos();           // (A1) set next activePlayerPos
				this.setNextActivePlayerId(gameObj);        // (A2) transform activePlayerPos to activePlayerId before sending to client
				gameObj.updatePlayableCards();				// (U after D2) Only use this after deckcards have appropriate ownerIds assigned otherwise problem on client side
				this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic
				return this.makeReturnObj('START_NEW_ROUND', gameObj, gameObj);
				break;
			case 'CARD_PLAYED':
				var card = clientData.gameData.card;
				if(typeof card == 'undefined' || typeof card.suit == 'undefined' || typeof card.rank == 'undefined'){
					return;
				}
				var deckcard; 
				gameObj.deck.map(function(cardFromDeck){
					if(card && cardFromDeck.suit == card.suit && cardFromDeck.rank == card.rank){
						deckcard = cardFromDeck;
					}
				})
				gameObj.updateCardState(deckcard, 'BEING_PLAYED');
				gameObj.playCard(deckcard, 'server');
				this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic
				this.updateRoundPenalty(gameObj);			// Updates round Penalties of all players according to id. To be called only after updating PlayersArrayOnServer
				gameObj.cardPlayed = deckcard;
				gameObj.updateCardState(deckcard, 'PLAYED');    // This adjusts z-index. Handle it separately on client-side
				gameObj.addPlayedCard(deckcard);
				this.checkRoundEnd(gameObj);
				if(gameObj.state == 'ROUND_END'){
					return this.handlePlayCard(this.makeReturnObj('ROUND_END', {card: card, turnType: 'CARD_PLAYED'}, gameObj));
				}else{
					return this.handlePlayCard(this.makeReturnObj('NEXT_TURN', {card: card, turnType: 'CARD_PLAYED'}, gameObj));
				}
				break;
			case 'SKIP_TURN':
				var skippedid = clientData.gameData.id;
				var card = undefined;
				return this.handlePlayCard(this.makeReturnObj('NEXT_TURN', {card: card, turnType: 'TURN_SKIPPED'}, gameObj));
				break;
			case 'NEXT_TURN':
				gameObj.nextTurn();							// (A1) ...Internally
				this.setNextActivePlayerId(gameObj);        // (A2) transform activePlayerPos to activePlayerId before sending to client
				gameObj.updatePlayableCards();				// (U after D2) Only use this after deckcards have appropriate ownerIds assigned otherwise problem on client side
				var playableCards = this.getShortenedPlayableCards(gameObj);
				this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic
				gameObj.checkBotPlay();
				var botState = gameObj.botState;
				return this.makeReturnObj('NEXT_TURN', 
											{
												turnType: clientData.gameData.turnType,
												card: clientData.gameData.card,
												nextGameTurn: gameObj.gameTurn,
												nextActivePlayerId: gameObj.activePlayerId,
												playableCards: playableCards,
												botState: botState
											},
												 gameObj);
				break;
			case 'ROUND_END':
				gameObj.roundEnd();
				this.setRoundEndPos(gameObj);
				var players = this.shortenPlayerScores(gameObj);
				gameObj.players.map(function(player){
					player.score = new ScoreSatti();
				})
				return this.makeReturnObj('ROUND_END', 
											{
												turnType: clientData.gameData.turnType,
												card: clientData.gameData.card,
												players: players
											},
												 gameObj);
				break;
		}
	},
	handleSpectators: function(gameObj){
		gameObj.players.map(function(player){
			if(player.type == 'SPECTATOR'){
				player.type = 'HUMAN';
			}
		})
	},
	getCardsById: function(gameObj, botId){
		var playerIds = this.getPlayerIds(gameObj);
		for (var j = 0; j < playerIds.length; j++) {
			if(playerIds[j] == botId){
				return gameObj.playersCardsServer[j];
			}
		};
	},
	checkRoundEnd: function(gameObj){
		this.updatePlayersArrayOnServer(gameObj);
		var playersCards = gameObj.playersCardsServer;
		for (var i = 0; i < gameObj.maxPlayers; i++) {
			if(playersCards[i].length == 0){
				gameObj.state = 'ROUND_END';
				continue;
			}
		};
	},
	setRoundEndPos : function(gameObj){
		gameObj.deck.map(function(deckcard){
			deckcard.setRoundEndPosition();
		})
	},
	initPlayersArray: function(gameObj){
		/*
			The server version of playersArray stores the array of cards of each player
			[
				[cards of playerid0],
				[cards of playerid1],
				[cards of playerid2],
				[cards of playerid3],
			]
		*/
		gameObj.playersCardsServer = new Array();
		for (var i = 0; i < gameObj.maxPlayers; i++) {
			gameObj.playersCardsServer.push(new Array());
		}
	},
	updatePlayersArrayOnServer: function(gameObj){
		/*
			The server version of playersArray stores the array of cards of each player
			[
				[cards of playerid0],
				[cards of playerid1],
				[cards of playerid2],
				[cards of playerid3],
			]
		*/
		var playerids = this.getPlayerIds(gameObj);
		this.initPlayersArray(gameObj);
		if(gameObj.deck){
			for (var i = 0; i < gameObj.deck.length; i++) {
				var card = gameObj.deck[i];
				if(card.ownerId != null && card.state == 'DISTRIBUTED'){
					for (var j = 0; j < playerids.length; j++) {
						if(playerids[j] == card.ownerId){
							gameObj.playersCardsServer[j].push(card);
						}
					};
				}
			};
		}
	},
	updateRoundPenalty: function(gameObj){
		/*
			Updates round penalties of all players according to their ids
		*/
		var roundPenalty = [{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0}];
		var playersCards = gameObj.playersCardsServer;
		var playerids = this.getPlayerIds(gameObj);
		for (var i = 0; i < gameObj.maxPlayers; i++) {
			for (var j = 0; j < playersCards[i].length; j++) {
				var card = playersCards[i][j];
				if(!card.isPlayable){
					roundPenalty[i].isNotPlayable+=card.rank;
				}
				roundPenalty[i].total+=card.rank;
			}
			for (var j = 0; j < gameObj.players.length; j++) {
				if(gameObj.players[j].id == playerids[i]){
					gameObj.players[j].score.roundPenalty = roundPenalty[i];
				}
			};
		}
	},
	getShortenedPlayableCards: function(gameObj){
		/*
			Send only playableCard.suit and playableCard.rank to client
			Reduces the amount of data sent via socket
		*/
		var playableCards = [];
		gameObj.playableCards.map(function(deckcard){
			var card = {
				rank : deckcard.rank,
				suit : deckcard.suit
			}
			playableCards.push(card);
		})
		return playableCards;
	},
	shortenPlayerScores: function(gameObj){
		/*
			Send only player.id and player.score to client
			Reduces the amount of data sent via socket
		*/
		var players = [];
		gameObj.players.map(function(gamePlayer){
			var player = {
				id : gamePlayer.id,
				score: gamePlayer.score
			}
			players.push(player);
		})
		return players;
	},
	getPlayerIds: function(gameObj){
		/* 
			* playerids is an array
			* All playerids are in form roomId0, roomId1, roomId2, roomId3
			* This function reads gameObj and returns an array [roomId0, roomId1, roomId2, roomId3]
			* The order in which roomIds appear in the output of this function is important.
			* This function is used to maintain other arrays on the gameObj
		*/
		var playerids = [];
		for (var i = 0; i < gameObj.players.length; i++) {
			playerids.push('');
		};
		for (var i = 0; i < gameObj.players.length; i++) {
			var pos = parseInt(gameObj.players[i].id.slice(-1)); // get the last digit from player[i].id
			playerids[pos] = gameObj.players[i].id;
		};
		return playerids;
	},
	addIdToDeck: function(gameObj){
		/*
			The GameSatti file initiates deck with card.ownerPos. This function adds card.ownerId to all cards in deck
		*/
		var playerids = this.getPlayerIds(gameObj);
		for (var i = 0; i < gameObj.deck.length; i++) {
			gameObj.deck[i].ownerId = playerids[gameObj.deck[i].ownerPos];
		};
	},
	setNextActivePlayerId: function(gameObj){
		var playerids = this.getPlayerIds(gameObj);
		for (var i = 0; i < playerids.length; i++) {
			if(gameObj.activePlayerPos == i){
				gameObj.activePlayerId = playerids[i];
			}
		};
	},
	makeReturnObj: function(clientAction, clientData, newGameData){
		/*
			Makes the final output of this file which is send to client via socket.emit('game_state', ...)
			See socket.js
			Caller Function is this.handlePlayedCard()
		*/
		return {
			clientData: {
				action: clientAction,
				gameData: clientData
			},
			gameData: newGameData
		}
	},
	makeGameObj : function (gameData) {
		/*
			The who's your daddy function :D
			Accepts gameData from storage (without member functions)
			Creates a new gameObj with all the member functions and copies gameData to the new gameObj
		*/
		var newGameData = new GameSatti();
		Object.assign(newGameData, gameData);
		// copy deck
		delete newGameData['deck'];
		newGameData.deck = new Array();
		gameData.deck.map(function (deckcard) {
			newGameData.deck.push(Object.assign(new PlayingCard(deckcard), deckcard));
		});
		// copy players
		delete newGameData['players'];
		newGameData.players = new Array();
		gameData.players.map(function (player) {
			if(player.profile && player.profile.profile){
				player.name = player.profile.profile.first_name;
				// player.img = player.profile.picture.data.url
			}
			if (player.type == 'HUMAN' || player.type == 'ADMIN') {
				newGameData.players.push(Object.assign(new PlayerSatti(player), player));
			} else if (player.type == 'BOT' || player.type == 'SPECTATOR') {
				newGameData.players.push(Object.assign(new BotSatti(player), player));
			} else {
				console.log('Weird');
			}
		});
		newGameData.players.map(function (player) {
			delete player.score;
		});
		for (var i = 0; i < gameData.players.length; i++) {
			newGameData.players[i].score = Object.assign(new ScoreSatti(), gameData.players[i].score);
		};
		return newGameData;
	}
}
