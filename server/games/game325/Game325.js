var Game325 = require('../game325/utils/Game325');
var Cards325 = require('../game325//utils/Cards325');
var Player325 = require('../game325/utils/Player325');
var Bot325 = require('../game325/utils/Bot325');
var Score325 = require('../game325/utils/Score325');
var PlayingCard = require('../game325/utils/PlayingCard');
var cx = 0;
module.exports = {
	getScores : function(gameObj){
		var playerScores = {};
		for (var i = 0; i < gameObj.players.length; i++) {
			playerScores[gameObj.players[i].id] = gameObj.players[i].score;
		};
		return playerScores;
	},
	handlePlayCard : function(data){
		/*
			Function which listens to socket.on('play_card',...) and acts according to clientData.action
			Everything in this file passes through this function
		*/
		var clientData = data.clientData, gameData = data.gameData, gameObj = {};
		var gameObj = this.makeGameObj(gameData);
		// this.checkCards(gameObj);
		// var ifAdminChanged = this.assignAdmin(gameObj);
		// if(ifAdminChanged){
		// 	console.log('admin changed');
		// 	console.log(gameObj.adminId);
		// }
		// console.log(data)

		switch(clientData.action){
			case 'START_NEW_ROUND':
				cx = 0;
				console.log('START_NEW_ROUND')
				this.handleSpectators(gameObj);
				gameObj.initDeck();
				if(gameObj.gameRound % 30 == 0){
					gameObj.initRound();	
				}
				if(gameObj.dealerId != null){
					gameObj.distributeCards();                  // (D1) assign ownerPos to cards in deck
					gameObj.updateHandsToMake();
					// this.addIdToDeck(gameObj);                  // (D2) assign ownerIds according to ownerPos before sending to client
					gameObj.setNextActivePlayerPos();           // (A1) set next activePlayerPos
					gameObj.setActivePlayerPosOnNewRound();
					this.setNextActivePlayerId(gameObj);        // (A2) transform activePlayerPos to activePlayerId before sending to client
					gameObj.updatePlayableCards();				// (U after D2) Only use this after deckcards have appropriate ownerIds assigned otherwise problem on client side
					this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic	
				}else{
					gameObj.distributeOneCardEach();
					// this.addIdToDeck(gameObj);
				}
				return this.makeReturnObj('START_NEW_ROUND', gameObj, gameObj);
				break;
			case 'SET_TRUMP':
				var trump = clientData.gameData.trump;
				console.log(trump);
				gameObj.setTrump(trump);
				gameObj.distributeCards();                  // (D1) assign ownerPos to cards in deck
				// this.addIdToDeck(gameObj);                  // (D2) assign ownerIds according to ownerPos before sending to client
				// gameObj.getActiveplayerPos()
				return this.makeReturnObj('SET_TRUMP_SUCCESS', gameObj, gameObj);
				break;
			case 'CARD_PLAYED':
				// console.log(clientData.gameData)
				var card = clientData.gameData.card;
				var deckcard; 
				gameObj.deck.map(function(cardFromDeck){
					if(cardFromDeck.suit == card.suit && cardFromDeck.rank == card.rank){
						deckcard = cardFromDeck;
					}
				})
				// console.log(deckcard.rank+':'+deckcard.suit);
				// console.log(gameObj.activePlayerPos);
				gameObj.updateCardState(deckcard, 'BEING_PLAYED');
				gameObj.playCard(deckcard, 'server');
				this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic
				// this.updateRoundScores(gameObj);			// Updates round Penalties of all players according to id. To be called only after updating PlayersArrayOnServer
				gameObj.cardPlayed = deckcard;
				var cardsPlayed = 0;
				for(var i = 0; i < gameObj.players.length; i++){
					if(gameObj.players[i].id == deckcard.ownerId){
						gameObj.players[i].cardPlayed = deckcard;
					}
					if(gameObj.players[i].cardPlayed){
						cardsPlayed++;
					}
				}
				if(cardsPlayed == 3){
					gameObj.getTurnWinner();
					this.checkRoundEnd(gameObj);
				}else{
					if(gameObj.winnerId){
						delete gameObj.winnerId;
					}
				}
				// gameObj.updateCardState(deckcard, 'PLAYED');    // This adjusts z-index. Handle it separately on client-side
				gameObj.addPlayedCard(deckcard);
				if(gameObj.state == 'ROUND_END'){
					return this.handlePlayCard(this.makeReturnObj('ROUND_END', {card: card, turnType: 'CARD_PLAYED'}, gameObj));
				}else{
					return this.handlePlayCard(this.makeReturnObj('NEXT_TURN', {card: card, turnType: 'CARD_PLAYED'}, gameObj));
				}
				break;
			case 'SKIP_TURN':
				// var skippedid = clientData.gameData.id;
				// var card = undefined;
				// return this.handlePlayCard(this.makeReturnObj('NEXT_TURN', {card: card, turnType: 'TURN_SKIPPED'}, gameObj));
				break;
			case 'GAME_STATE':
				if(cx == 0){
					console.log('asdfgh')
					gameObj.players[0].handsMadeInLR = 2;
					gameObj.players[1].handsMadeInLR = 4;
					gameObj.players[2].handsMadeInLR = 4;	
					cx = 1;
				}
				
				// console.log('IS_WD');
				var returnedCard = clientData.gameData.returnedCard;
				var a = console.log(gameObj.isWithdrawCard());
				if(gameObj.isWithdrawCard()){
					var objToExtend = {
						activePlayerId : gameObj.activePlayerId,
						otherPlayerId : gameObj.otherPlayerId,
						returnedCard  : returnedCard,
						gameState : 'WITHDRAW_CARD'
					}
					return this.makeReturnObj('WITHDRAW_CARD', objToExtend, gameObj);
				}else{
					var objToExtend = {
						returnedCard  : returnedCard,
						gameState : 'PLAY_CARD'
					}
					return this.makeReturnObj('START_PLAYING', objToExtend, gameObj);
				}
				break;
			case 'CARD_WITHDRAWN':
				var card = clientData.gameData.card;
				console.log(card)
				var deckcard; 
				gameObj.deck.map(function(cardFromDeck){
					if(cardFromDeck.suit == card.suit && cardFromDeck.rank == card.rank){
						deckcard = cardFromDeck;
					}
				})
				gameObj.withdrawCard(deckcard);
				var withdrawnCard = {
					suit 	: deckcard.suit,
					rank	: deckcard.rank,
					ownerId : deckcard.ownerId
				}
				return this.makeReturnObj('RETURN_CARD', {state : 'RETURN_CARD', 
														activePlayerId 	: gameObj.activePlayerId,
														otherPlayerId	: gameObj.otherPlayerId,
														withdrawnCard   : withdrawnCard
														}, gameObj);
				break;
			case 'CARD_RETURNED':
				var card = clientData.gameData.card;
				var deckcard; 
				gameObj.deck.map(function(cardFromDeck){
					if(cardFromDeck.suit == card.suit && cardFromDeck.rank == card.rank){
						deckcard = cardFromDeck;
					}
				})
				gameObj.returnCard(deckcard);
				var returnedCard = {
					suit 	: deckcard.suit,
					rank	: deckcard.rank,
					ownerId : deckcard.ownerId
				}
				console.log('AFter return : '+deckcard.ownerId);
				return this.handlePlayCard(this.makeReturnObj('GAME_STATE', {
																returnedCard : returnedCard
																}, gameObj));
				break;
			case 'NEXT_TURN':
				gameObj.nextTurn();							// (A1) ...Internally
				this.setNextActivePlayerId(gameObj);        // (A2) transform activePlayerPos to activePlayerId before sending to client
				// gameObj.updatePlayableCards();				// (U after D2) Only use this after deckcards have appropriate ownerIds assigned otherwise problem on client side
				// console.log(gameObj.activePlayerPos);
				var playableCards = this.getShortenedPlayableCards(gameObj);
				this.updatePlayersArrayOnServer(gameObj);   // This array resides on server. Is of no use to client. Will be used for bot-logic
				gameObj.checkBotPlay();
				var botState = gameObj.botState;
				// console.log(gameObj.winnerId)
				//The Roots feat. John Legend- The Fire
				//Donovan - Superman Sunshine, Mellow yellow, Catch the wind
				//Tommy James & Shondells - Crimson and Clover
				//Tommy James & The Shondells - Crystal Blue Persuasion - 1969
				var minObj = {
							turnType: clientData.gameData.turnType,
							card: clientData.gameData.card,
							nextGameTurn: gameObj.gameTurn,
							nextActivePlayerId: gameObj.activePlayerId,
							nextOtherPlayer : gameObj.otherPlayerId,
							playableCards: playableCards,
							botState: botState,
						}
						// console.log('Turn:'+gameObj.gameTurn)
						// console.log('Round:'+gameObj.gameRound)
						// console.log('HandsToMake:'+gameObj.players[0].handsToMake)
						// console.log('HandsMade:'+gameObj.players[0].handsMade)
				if(gameObj.gameRound%3 == 1){
					minObj['scores'] = this.getScores(gameObj);
					minObj['winnerId'] = gameObj.winnerId;
				}
				return this.makeReturnObj('NEXT_TURN', minObj, gameObj);
				break;
			case 'ROUND_END':
				gameObj.roundEnd();
				this.setRoundEndPos(gameObj);
				var players = this.shortenPlayerScores(gameObj);
				return this.makeReturnObj('ROUND_END', 
											{
												turnType: clientData.gameData.turnType,
												card: clientData.gameData.card,
												players: players
											}, 	gameObj);
				break;
		}
	},
	checkCards: function(gameObj){
		var cardkeys = [];
		gameObj.deck.map(function(deckcard){
			cardkeys.push(deckcard.key);
		})
		cardkeys.sort(function(a,b){
			if(a>b) return -1;
			if(a<b) return 1;
			if(a==b) return 0;
		})
		// console.log(cardkeys);
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
	// assignAdmin: function(gameObj){
	// 	// var currentAdminId = gameObj.adminId;
	// 	// var newAdminId = '';
	// 	// var playerIds = this.getPlayerIds(gameObj);
	// 	// for (var i = 0; i < playerIds.length; i++) {
	// 	// 	for (var j = 0; j < gameObj.players.length; j++) {
	// 	// 		if(newAdminId == '' && gameObj.players[j].id == playerIds[i] && (gameObj.players[j].type == 'HUMAN' || gameObj.players[j].type == 'ADMIN')){
	// 	// 			newAdminId = playerIds[i];
	// 	// 			gameObj.players[j].type = 'ADMIN';
	// 	// 			break;
	// 	// 		}
	// 	// 	};
	// 	// 	if(newAdminId != '') break;
	// 	// };
	// 	// gameObj.adminId = newAdminId;
	// 	// if(currentAdminId == '' || currentAdminId == newAdminId){
	// 	// 	return false;  // Same Admin
	// 	// }else{
	// 	// 	return true;   // Different Admin
	// 	// }
	// 	return false;
	// },
	checkRoundEnd: function(gameObj){
		this.updatePlayersArrayOnServer(gameObj);
		// var playersCards = gameObj.playersCardsServer;
		// for (var i = 0; i < gameObj.maxPlayers; i++) {
		// 	if(playersCards[i].length == 0){
		// 		gameObj.state = 'ROUND_END';
		// 		continue;
		// 	}
		// };
		if (gameObj.gameTurn%30 == 0) {
			gameObj.state = 'ROUND_END';
			return true;
		}
		return false;
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
	updateRoundScores: function(gameObj){
		/*
			Updates round penalties of all players according to their ids
		*/
		var roundPenalty = [{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0},{total: 0, isNotPlayable: 0}];
		var playersCards = gameObj.playersCardsServer;
		var playerids = this.getPlayerIds(gameObj);
		for (var i = 0; i < gameObj.maxPlayers; i++) {
			for (var j = 0; j < gameObj.players.length; j++) {
				if(gameObj.players[j].id == playerids[i]){
					gameObj.players[j].score[gameObj.gameRound].handsToMake = gameObj.players[j].handsToMake;
					gameObj.players[j].score[gameObj.gameRound].handsMade = gameObj.players[j].handsMade;
					gameObj.players[j].handsToMakeInLR = gameObj.players[j].handsToMake;
					gameObj.players[j].handsMadeInLR = gameObj.players[j].handsMade;

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
				suit : deckcard.suit,
				ownerPos : deckcard.ownerPos
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
			The Game325 file initiates deck with card.ownerPos. This function adds card.ownerId to all cards in deck
		*/
		var playerids = this.getPlayerIds(gameObj);
		for (var i = 0; i < gameObj.deck.length; i++) {
			if(gameObj.deck[i].ownerPos){
				gameObj.deck[i].ownerId = playerids[gameObj.deck[i].ownerPos];	
			}
			
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
		var newGameData = new Game325();
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
				newGameData.players.push(Object.assign(new Player325(player), player));
			} else if (player.type == 'BOT' || player.type == 'SPECTATOR') {
				newGameData.players.push(Object.assign(new Bot325(player), player));
			} else {
				console.log('Weird');
			}
		});
		newGameData.players.map(function (player) {
			delete player.score;
		});
		for (var i = 0; i < gameData.players.length; i++) {
			// newGameData.players[i].score = Object.assign(new ScoreSatti(), gameData.players[i].score);
			if(!newGameData.players[i].score){
				newGameData.players[i].score = [];
			}else{
				newGameData.players[i].score =  gameData.players[i].score;	
			}
			
		};
		return newGameData;
	}
}
