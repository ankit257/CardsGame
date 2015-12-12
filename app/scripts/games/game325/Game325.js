import Deck from './cards325';

var Score = function(){
	return {
		handsToMake : 0,
		handsMade : 0,
	}
}
export function Player(id){
    return {
     id : id,
     name : '',
     image : '',
     type : '',
     cards : [],
     scores : [{
     	handsMade : 0,
     	handsToMake : 0
     }],
     cardsToBeWithdrawn : 0,
     handsToMake : 0,
     handsMade : 0,
     handsToMakeInLR : 0,
     handsMadeInLR : 0,
     totalHandsToMake : 0,
     cardPlayed : {},
     cardWillBeMovedFrom : null
    }
}
export function Game325(){
	this.maxPlayers = 3,
	this.cardDistrbutionIndex = 0,
	this.status = 'INIT_GAME',
	this.allowedStatus = ['INIT_GAME','PLAY_CARD','WITHDRAW_CARD','RETURN_CARD','NEXT_TURN','GAME_OVER']
	this.players = [],
 	this.rank,
	this.suit,
	this.turnSuit,
	this.deck,
	this.cardIndex,
	this.cardPlayed,
	this.playerIds,
	this.round,
	this.gameStarter,
	this.gamePaused = false,
	this.noOfPlayers,
	this.gameTurn = 1,
	this.playerSetTrump,
	this.gameWinSeq,
	this.withdraw,
	this.playedCards = Array({},{},{});
	this.allPlayedCards = Array();
	this.playerWinningIndex = Array(0,0,0),
	this.players = Array(),
	this.activePlayer,
	this.activePlayerId,
	this.otherPlayerId,
	this.activeSuit,
	this.lastGameWinner,
	this.gameRound = 0,
	this.cardWithdrawn,
	this.cardReturned,
	this.cardMoveFrom,
	this.remainingCards,
	this.cardMoveTo,
	this.moveFrom,
	this.moveTo,
	this.returnCard,
	this.initGame = function(profile){
		for (var i = 0; i < this.maxPlayers.length; i++) {
			this.players[i] = new Player();
			if(i == 0){
				this.players[i].profile = profile;
			}
		}
		this.initDeck();
	}
	this.initDeck = function(){
		var deck = new Deck();
		this.deck = deck.deck;
		this.deck = deck.shuffleDeck(this.deck);
		cardcount = new Deck();
		this.remainingCards = cardcount.deck;
		for (var i = this.remainingCards.length - 1; i >= 0; i--) {
			switch(this.remainingCards[i].suit){
				case 'S':
					this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order;
					break;
				case 'H':
					this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 8;
					break;
				case 'C':
					this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 16;
					break;
				case 'D':
					this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 23;
					break;
			}
		}
	},
	this.distributeCards = function(n){
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < this.players.length; j++) {
				this.deck[this.cardDistrbutionIndex].player = j;
				this.cardDistrbutionIndex++;
			}
		}
	},
	this.gameStart = function(){
		if(this.gameTurn == 1){
			this.initDeck();
			this.distributeCards(5);
		}
	},
	this.getPlayer = function(id){
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i].id == id)
				return this.players[i];
		}
	},
	this.assignPlayerIds = function(){
		this.playerIds =  Array();
		for (var i = 0; i < this.players.length; i++) {
			this.playerIds.push(this.players[i].id);
		}
	},
	this.updateHandsToMake = function() {
		var j;
		var x = this.gameTurn%3;
		for (var i =0; i < this.players.length; i++) {
	        if(this.players[i].id == this.activePlayerId){
	            j = i;
	            // console.log(this.players[i]);
	            this.players[i].handsToMake = 5;
	            this.players[i].scores[x-1].handsToMake = 5;
	        }
	        if(j == 0){
	            this.players[1].handsToMake = 3;
	            this.players[2].handsToMake = 2;
	            this.players[1].scores[x-1].handsToMake = 3;
	            this.players[2].scores[x-1].handsToMake = 2;
	        }
	        if(j == 1){
	            this.players[0].handsToMake = 2;
	            this.players[2].handsToMake = 3;
	            this.players[0].scores[x].handsToMake = 2;
	            this.players[2].scores[x].handsToMake = 3;
	        }
	        if(j == 2){
	            this.players[0].handsToMake = 3;
	            this.players[1].handsToMake = 2;
	            this.players[0].scores[x].handsToMake = 3;
	            this.players[1].scores[x].handsToMake = 2;
	        }
	    }
	},
	this.withdrawCard = function(){
		var cardIndex = this.cardIndex;
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == this.cardMoveFrom){
				this.players[i].cards[cardIndex].state = 'deck';
				this.players[i].cards[cardIndex].animation = false;
				var card = this.players[i].cards.splice(cardIndex, 1);
				this.cardPlayed = card[0];
				delete this.cardPlayed.moveFrom;
				delete this.cardPlayed.moveTo;
			}
		}
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i].id == this.cardMoveTo){
				if(i==2){
					this.players[i].cards.unshift(this.cardPlayed);
				}else if(i==0){
					this.players[i].cards.push(this.cardPlayed);
				}else{//playerPosition == 1
					if(this.cardMoveFrom == 0){
						this.players[i].cards.unshift(this.cardPlayed);
					}else{
						this.players[i].cards.push(this.cardPlayed);
					}
				}

				this.players[i].cardWillBeMovedFrom = null;
			}
		}
	},
	this.returnCard = function(){
		var cardIndex = this.cardIndex;
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == this.cardMoveFrom){
				this.players[i].cards[cardIndex].state = 'deck';
				this.players[i].cards[cardIndex].animation = false;
				var card = this.players[i].cards.splice(cardIndex, 1);
				this.cardPlayed = card[0];
				delete this.cardPlayed.moveFrom;
				delete this.cardPlayed.moveTo;
			}
		}
		for (var i = 0; i < this.players.length; i ++){
			if(this.players[i].id == this.cardMoveTo){
				if(i==2){
					this.players[i].cards.unshift(this.cardPlayed);
				}else if(i==0){
					this.players[i].cards.push(this.cardPlayed);
				}else{//playerPosition == 1
					if(this.moveFrom == 0){
						this.players[i].cards.unshift(this.cardPlayed);
					}else{
						this.players[i].cards.push(this.cardPlayed);
					}
				}
				this.players[i].cardWillBeMovedFrom = null;
			}
		}
	},
	this.playCard = function(){
		var card = this.cardPlayed;
		for (var i = 0; i < this.players.length ; i++) {
			if(this.players[i].id == this.activePlayerId){
				this.players[i].cardPlayed = card;
				for (var j = this.players[i].cards.length - 1; j >= 0; j--) {
					if(this.players[i].cards[j].suit == card.suit && this.players[i].cards[j].rank == card.rank){
						var index = j;
					}
				}
			}
		}
		this.cardPlayed = card;
	},
	this.nextRound = function(){
		for (var i = this.players.length - 1; i >= 0; i--){
			if(this.players[i].handsToMake == 2){
				var score = new Score();
				var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
				this.players[i].handsToMakeInLR = 2;
				this.players[i].handsToMake = 3;
				this.players[i].handsMadeInLR = lastScore.handsMade;
				score.handsToMake = this.players[i].handsToMake;
				this.players[i].scores.push(score);
			}else if(this.players[i].handsToMake == 3){
				var score = new Score();
				var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
				this.players[i].handsToMakeInLR = 3;
				this.activePlayerId = this.players[i].id;
				this.players[i].handsToMake = 5;
				this.players[i].handsMadeInLR = lastScore.handsMade;
				score.handsToMake = this.players[i].handsToMake;
				this.players[i].scores.push(score);	
			}else if(this.players[i].handsToMake == 5){
				var score = new Score();
				var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
				this.players[i].handsToMakeInLR = 5;
				this.players[i].handsToMake = 2;
				this.players[i].handsMadeInLR = lastScore.handsMade;
				score.handsToMake = this.players[i].handsToMake;
				this.players[i].scores.push(score);
			}
			var totalHandsToMake = 0;
			for (var k = this.players[i].scores.length - 1; k >= 0; k--) {
				totalHandsToMake += this.players[i].scores[k].handsToMake;
			};
			this.players[i].totalHandsToMake = totalHandsToMake;
		}
	},
	this.getTurnWinner = function() {
		var self = this;
		var x = (this.gameTurn-1)/30;
		var y = parseInt(x);
		if(x == y){
			var x = x-1;
		}else{
			var x = Math.floor(this.gameTurn/30);	
		}
		var biggestCard = null;
		for (var i = 0; i < this.players.length; i++){
			biggestCard = getBiggestCard(biggestCard, this.players[i].cardPlayed, this.turnSuit, this.trump);
		}
		// this.turnSuit = '';
		// console.log(biggestCard);
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].cardPlayed == biggestCard){
				this.lastGameWinner = this.players[i].id;
				this.players[i].handsMade++;
				this.winnerId =  this.players[i].id;
				this.activePlayerId = this.winnerId;
				this.players[i].scores[x].handsMade++;
			}
		}
	},
	this.nextTurn = function() {
		var z = this.gameTurn;
		z++;
		this.gameTurn = z;
		var n;
		for (var i = 0; i < this.players.length; i++) {
			if(this.activePlayerId ==  this.players[i].id){
				n = i;
			}
		};
		if((n+1) == this.players.length){
			n = 0;
		}else{
			n = n+1;
		}
		this.otherPlayerId = this.activePlayerId;
		this.activePlayerId = this.players[n].id;
	},
	this.assignActivePlayer = function(){
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i].handsToMake == 5){
				this.activePlayerId = this.players[i].id;
			}
		};
	}
	this.withdrawCards = function(){
		var array = new Array();
		var arrayId = new Array();
		var arrayVal = new Array();
		var x = function(){
			return {
				id : '',
				value : ''
			}
		}
		for (var i = 0; i < this.players.length; i++){
			var j = new x();
			j.id = this.players[i].id;
			j.value = this.players[i].handsToMakeInLR - this.players[i].handsMadeInLR;
			array.push(j);
		}
		array.sort(function (a, b){
			if (a.value > b.value){
		    	return 1;
		  	}
		  	if (a.value < b.value){
		    	return -1;
		  	}
		  	return 0;
		});
		for (var i = 0; i < array.length; i++) {
			arrayId.push(array[i].id);
			arrayVal.push(array[i].value);
		}
		if(arrayVal[0] == 0 && arrayVal[2] == 0){
	                this.withdraw = false;
	                return false;
	            }else{
	            		this.activePlayerId = arrayId[0];
	                    this.otherPlayerId = arrayId[2];
	                this.withdraw = 'true';
	                return true;
	            }
	}
}	
function getBiggestCard (card1, card2, turnSuit, trump) {
	if(card1 == null)
		return card2;
	// var turnSuit = this.turnSuit;
	if(card1.suit == trump){
        if(card2.suit == trump){
            if(card1.rank > card2.rank){
                return card1;
            }else{
                return card2;
            }
        }else{
            return card1;
        }
    }else if(card2.suit == trump){
        return card2;
    }else if(card1.suit == turnSuit && card2.suit == turnSuit){
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }else if(card1.suit == turnSuit && card2.suit != turnSuit){
        return card1;
    }else if(card1.suit != turnSuit && card2.suit == turnSuit){
        return card2;
    }else{
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }
}
//helper functions