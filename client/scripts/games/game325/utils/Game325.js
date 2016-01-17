import Cards325 from './Cards325'
import { gameCSSConstants, gameVars, timeConstants } from '../constants/SattiHelper'
import Player325 from '../utils/Player325'
import Bot325 from '../utils/Bot325'
import Score325 from '../utils/Score325'

import * as GameActions from '../actions/GameActions';

let cards325 = new Cards325();


export default class Game325{
	constructor(){
		Object.assign(this, {
					players 			: [],
					deck 				: [],
					distributionArray 	: [5,5],
					distributionIndex 	: 0,
					distributionState	: 0,
					trump 				: null,
					suitTrump			: null,
					turnSuit			: null,
					gameTurn			: 0,
					gameRound			: 0,
					state 				: 'CONSTRUCTED',
					botState			: 'UNINITIATED',
					cardPlayed			: {},
					playedCards 		: {},
					playableCards 		: [],
					activePlayerPos		: null,
					otherPlayerId		: 0,
					pauseState			: false,
					dealerPos			: 0,
					playerPosArray 		: [0,1,2]
		});
	}
	initDeck(){
		this.deck = cards325.shuffle(cards325.deck);
		this.state = 'INIT_DECK';
	}
	setDeckIndex(){
		for (var i = 0; i < this.deck.length; i++) {
			this.deck[i].index = i;
		};
	}
	getTrump(){
		this.state = 'GET_TRUMP';
		// return this.trump;
	}
	initRound(){
		this.deck = cards325.shuffle(this.deck);
		this.deck.map(card=> {
			card.setDefaultState();
			card.setPositionByState();
		});
		this.updateHandsToMake();
		// this.setDeckIndex();
		this.state = 'INIT_ROUND';
		this.playedCards = {
						S: { cards: [], extremes: []},
						D: { cards: [], extremes: []},
						H: { cards: [], extremes: []},	
						C: { cards: [], extremes: []},
		};
		this.distributionIndex = 0;
		this.distributionState = 0;
		this.playableCards = [];
		this.activePlayerPos = null;
		this.botState = 'UNINITIATED';
		this.gameTurn = 1;
		this.gameRound ++;
		delete this.trump;
		if(this.activePlayerPos === null){
			this.activePlayerPos = 0;
		}
		this.players.map(player=>player.state = 'INIT');
	}
	initPlayers(){
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			let player;
			let botNames = ['', 'Player1', 'Player2']
			if( i == 0 ){
				player = new Player325({id: i, name: 'You', img: 'IMAGE_YOU', type: 'HUMAN'});
				player.handsToMake = 5;
				player.handsMade = 4;
				player.handsMadeInLR = 4;
			}else{
				player = new Bot325({id: i, name: botNames[i], img: 'IMAGE_BOT'});
				if( i==1 ){
					player.handsToMake = 3;
					player.handsMade = 5;
					player.handsMadeInLR = 5;
				}
				if(i == 2){
					player.handsToMake = 2;
					player.handsMade = 1;
					player.handsMadeInLR = 1;
				}
			}
			player.position = i;
			this.players.push(player);
		};
		this.state = 'INIT_PLAYERS';
		this.botState = 'BOT_READY';
	}
	reInitDeck(){
		for(let deckcard of this.deck){
			deckcard.state = 'IN_DECK';
			deckcard.ownerPos = null;
		}
		this.state = 'DEALER_SELECTION_SUCCESS';
	}
	distributeCards(){
		let cardDistributionStartFrom = this.dealerPos+1;
		if(cardDistributionStartFrom === this.players.length){
			cardDistributionStartFrom = 0;
		}
		while(this.playerPosArray[0] !== cardDistributionStartFrom){
			var c = this.playerPosArray.pop();
			this.playerPosArray.unshift(c);
		}
		let n = this.distributionArray[this.distributionState];
		let playersLength = this.players.length;
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < playersLength; j++) {
				let card = this.deck[this.distributionIndex];
				if(card.state == 'IN_DECK'){
					card.state = 'DISTRIBUTED';
					card.animTime = timeConstants.SINGLE_DISTR_ANIM;
					card.delay = timeConstants.SINGLE_DISTR_DELAY*((n*playersLength*(this.distributionState+1))-this.distributionIndex);
					card.ownerPos = this.playerPosArray[j] ;//this.players[j].position;
					this.distributionIndex++;
					card.zIndex = gameCSSConstants.zIndex.DISTR + i;
					card.index = n*[this.distributionState]+i;
				}

			}
		}
		var ic = 0;
		for (var i = 0; i < 10; i++) {
			for (var j = 0; j < this.players.length; j++) {
				let card = this.deck[ic];
				if(card.state == 'DISTRIBUTED'){
					card.distributionState = this.distributionState;
				}
				ic++;
			};
		};
		this.distributionState++;
		this.state = 'DISTRIBUTING_CARDS_'+this.distributionState;
	}
	distributeOneCardEach(){
		var biggestCard;
		for (var i = 0; i < this.players.length; i++) {
			this.deck[i].ownerPos = i;
			this.deck[i].state = 'SELECT_DEALER';

			this.deck[i].animTime = timeConstants.SINGLE_DISTR_ANIM;
			this.deck[i].delay = timeConstants.SINGLE_DISTR_DELAY*((i+1));
					
			if(!biggestCard){
				biggestCard = this.deck[i];
			}else{
				if(this.deck[i].rank > biggestCard.rank){
					biggestCard = this.deck[i];
				}else if(this.deck[i].rank == biggestCard.rank){
					var suitOrder = ['C','D','H','S'];
					if(suitOrder.indexOf(this.deck[i].suit) > suitOrder.indexOf(biggestCard.suit)){
						biggestCard = this.deck[i];
					}
				}
			}
		}
		this.dealerPos = biggestCard.ownerPos;
		this.state ='SELECT_DEALER';
		// console.log(this.dealerPos);
	}
	distributionDone(){
		for(let deckcard of this.deck){
			deckcard.delay 		= 0;
			deckcard.animTime 	= timeConstants.REARRANGE_ANIM; 
		}
		this.gameTurn = 0;
	}
	checkBotPlay(){
		let activePlayer;
		this.players.map(player=>{
			if(player.position == this.activePlayerPos){
				activePlayer = player;
			}
		})
		if(activePlayer.type == 'BOT'){
			console.log(this.state);
			this.botState = 'BOT_SHOULD_PLAY';
			// setTimeout(function(){
			// 	GameActions.playBot()
			// }, timeConstants.DISPATCH_DELAY);
		}else{
			this.botState = 'BOT_CANNOT_PLAY';
		}
	}
	getBiggestCard (card1, card2, turnSuit, trump) {
		if(card1 == null)
			return card2;
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
	checkTurnSkip(){
		let activePlayer = this.players[this.activePlayerPos];
		if(activePlayer.state == 'SKIP_TURN'){
			setTimeout(function(){
				GameActions.skipTurn(activePlayer.position);
			}, timeConstants.DISPATCH_DELAY);
		}
	}
	playBot(botCards, gameObj){
		let activeBot = this.players[this.activePlayerPos];
		if(activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY' && this.state == 'SET_TRUMP'){
			return activeBot.setTrump();
		}else if(activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY'){
			this.botState = 'BOT_PLAYING_CARD';
			return activeBot.playCard(botCards, gameObj);
		}
	}
	shouldMoveHand(){
		if(this.gameTurn>=3 && this.gameTurn%(this.players.length) == 0){
			return true;
		}
		return false;
	}
	assignPosToCardsToBeMoved(winnerPos){
		if(typeof winnerPos === 'undefined'){
			this.getTurnWinner();
			// winnerPos = this.winnerId;
		}
		delete this.turnSuit;
		var cards = [];
		for(let deckcard of this.deck){
			if(deckcard.state == 'BEING_PLAYED'){
				deckcard.state = 'MOVE_HAND';
				deckcard.ownerPos = winnerPos;
				deckcard.animTime = timeConstants.PLAY_ANIM;
				deckcard.delay = timeConstants.PLAY_DELAY;
			}
		}
		delete this.winnerId;
	}
	setTrump(trump){
		this.trump = trump;
	}
	playCard(card, callerLocation){
			if(card && ((callerLocation == 'client' && card.ownerPos == this.activePlayerPos) ||  (callerLocation == 'server' && card.ownerId == this.activePlayerId)) && this.state == 'READY_TO_PLAY_NEXT'){
				for(let deckcard of this.deck){
					if(card.rank == deckcard.rank && card.suit == deckcard.suit){
						this.cardPlayed = deckcard;
						deckcard.state = 'BEING_PLAYED';
						deckcard.delay = timeConstants.PLAY_DELAY;
						deckcard.animTime = timeConstants.PLAY_ANIM;
						deckcard.ownerId = null;
						if(!this.turnSuit){
							this.turnSuit = deckcard.suit;
						}
					}
				}
				this.updateCardIndex();
				this.state ='PLAYING_CARD';
			}
			if(card && ((callerLocation == 'client' && card.ownerPos == this.otherPlayerPos) ||  (callerLocation == 'server' && card.ownerPos == this.otherPlayerPos)) && this.state == 'WITHDRAW_CARD'){
				for(let deckcard of this.deck){
					if(card.rank == deckcard.rank && card.suit == deckcard.suit){
						// console.log(12345)
						this.cardPlayed = deckcard;
						deckcard.ownerPos = this.activePlayerPos;
						deckcard.ownerId = this.activePlayerId;
						this.updateCardIndex();
					}
				}
				// this.state ='WITHDRAWING_CARD';
			}
			if(card && ((callerLocation == 'client' && card.ownerPos == this.activePlayerPos) ||  (callerLocation == 'server' && card.ownerPos == this.activePlayerPos)) && this.state == 'RETURN_CARD'){
				for(let deckcard of this.deck){
					if(card.rank == deckcard.rank && card.suit == deckcard.suit){
						this.cardPlayed = deckcard;
						deckcard.ownerPos = this.otherPlayerPos;
						deckcard.ownerId = this.otherPlayerId;
						this.updateCardIndex();
						// IF()
						this.players[this.activePlayerPos].handsMadeInLR--;
						this.players[this.otherPlayerPos].handsMadeInLR++;
					}
				}
				// this.state ='RETURNING_CARD';
			}
			// console.log(card.ownerPos)
			// console.log(this.otherPlayerPos)
			// console.log(this.activePlayerPos);
			// console.log(this.state)
			// this.updateCardIndex()
	}
	updateHandsToMake() {
		var arrHands = [2,3,5];
		for(let player of this.players){
			var scoreObj = new Score325();
			player.score.push(scoreObj);
			player.score[this.gameRound].handsToMake = player.handsToMake;
			player.handsMadeInLR = player.handsMade;
			player.handsToMakeInLR = player.handsToMake;
			player.score[this.gameRound].handsMade = player.handsMade;
			player.score[this.gameRound].handsToMake = player.handsToMake;
			player.handsMade = 0;
			var c = arrHands.indexOf(player.handsToMake);
			if(c==2){
				c=0
			}else{
				c++;
			}
			player.handsToMake = arrHands[c];
		}
	}
	hideMovedCards(){
		for(let deckcard of this.deck){
			if(deckcard.state == 'MOVE_HAND'){
				// deckcard.state = 'HIDE_CARD';
			}
		}
	}
	updateCardState(card, state){
		// console.log(card)
		// console.log(this.activePlayerPos)
		this.deck.map(deckcard=>{
			if(deckcard.rank == card.rank && deckcard.suit == card.suit){
				this.players[this.activePlayerPos].cardPlayed = Object.assign(deckcard);
				deckcard.state = state;
			}
		})
	}
	updateCardIndex(){
		for (var i = 0; i < this.players.length; i++) {
				// this.players[i]
			var j = 0;
			for(let deckcard of this.deck){
				if(deckcard.ownerPos == i && deckcard.state == 'DISTRIBUTED'){
					deckcard.index = j;
					j++;
				}
			}
			for(let deckcard of this.deck){
				if(deckcard.ownerPos == i && deckcard.state == 'DISTRIBUTED'){
					deckcard.totalIndex = j-1;
				}
			}
		};
		
	}
	addPlayedCard(cardToAdd){
		if(!cardToAdd) return false;
		for(let playedCard of this.playedCards[cardToAdd.suit].cards){
			if(cardToAdd.rank == playedCard.rank && cardToAdd.suit == playedCard.suit){
				return false;
			}
		}
		let suit = cardToAdd.suit;
		this.playedCards[suit].cards.push(cardToAdd);
		return true;
	}
	removePlayableCard(cardToRemove){
		for(let deckcard of this.deck){
			if(deckcard.rank == cardToRemove.rank && deckcard.suit == cardToRemove.suit){
				deckcard.isPlayable = false;
				deckcard.bgColor = 'rgb(250,255,255)';
			}
		}
		for (var i = 0; i < this.playableCards.length; i++) {
			let playableCard = this.playableCards[i];
			if(playableCard.rank == cardToRemove.rank && playableCard.suit == cardToRemove.suit){
				this.playableCards.splice(i,1);
				return true;
			}
		};
		return false;
	}
	checkTurnEnd(){
		var playedCards = 0;
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(typeof this.players[i].cardPlayed === 'object'){
				playedCards++;
			}
		}
		if(playedCards == this.players.length){
			this.state = 'MOVE_HAND';
			return true;
		}
		return false;
	}
	assignPlayerIds(){
		this.playerIds =  [];
		for(let player of this.players){
			this.playerIds.push(player.id);
		}
	}
	getTurnWinner() {
		for(let deckcard of this.deck){
			if(deckcard.state == 'PLAYED'){
				this.players[deckcard.ownerPos].cardPlayed = deckcard;
			}
		}
		var biggestCard = null;
		for (var i = 0; i < this.players.length; i++){
			biggestCard = this.getBiggestCard(biggestCard, this.players[i].cardPlayed, this.turnSuit, this.trump);
		}
		this.turnSuit = '';
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].cardPlayed == biggestCard){
				this.lastGameWinner = this.players[i].id;
				this.players[i].handsMade++;
				this.winnerId = this.players[i].id;
				this.activePlayerId = this.winnerId;
				this.activePlayerPos = this.winnerId;
				this.winnerPos = i;
				if(!this.players[i].score[this.gameRound - 1]){
					this.players[i].score[this.gameRound - 1] = {
						handsMade : this.players[i].handsMade,
						handsToMake : this.players[i].handsToMake
					}
				}
				this.players[i].score[this.gameRound - 1].handsMade++;
			}
		}
		for (var i = 0; i < this.players.length ; i++){
			this.players[i].cardPlayed = '';
		}
	}
	checkRoundEnd(){
		if (this.gameTurn%30 == 0) {
			this.state = 'ROUND_END';
			return true;
		}
		return false;
	}
	isWithdrawCard(){
		var array = new Array();
		var arrayId = new Array();
		var arrayVal = new Array();
		var handsDiffObj = function(id, handsDiff){
			return {
				id : id,
				value : handsDiff
			}
		}
		for (let player of this.players){
			var handsDiff = player.handsToMakeInLR - player.handsMadeInLR;
			var j = new handsDiffObj(player.id, handsDiff);
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
        }else{
    		this.activePlayerId = arrayId[0];
    		this.activePlayerPos = this.activePlayerId;
            this.otherPlayerId = arrayId[2];
            this.withdraw = true;
        }
        return this.withdraw;
	}
	withdrawCard(card){
		for(let deckcard of this.deck){
			if(deckcard.suit == card.suit && deckcard.rank == card.rank){
				deckcard.ownerPos = this.activePlayerPos;
			}
		}
	}
	returnCard(card){
		for(let deckcard of this.deck){
			if(deckcard.suit == card.suit && deckcard.rank == card.rank){
				deckcard.ownerPos = this.otherPlayerPos;
				deckcard.ownerId = this.otherPlayerId;
				this.players[this.activePlayerPos].handsMadeInLR--;
				this.players[this.otherPlayerId].handsMadeInLR++;
			}
		}	
	}
	addPlayableCard(cardToAdd){
		let suits = ['S', 'H', 'C', 'D'];
		for(let suit of suits){
			for(let playedCard of this.playedCards[suit].cards){
				if(playedCard.suit == cardToAdd.suit && playedCard.rank == cardToAdd.rank){
					return false;
				}
			}
		}
		for(let deckcard of this.deck){
			if(deckcard.rank == cardToAdd.rank && deckcard.suit == cardToAdd.suit){
				deckcard.isPlayable = true;
				deckcard.bgColor = '#fff';
				// deckcard.setPositionByState();
			}
		}
		for(let playableCard of this.playableCards){
			if(cardToAdd.rank == playableCard.rank && cardToAdd.suit == playableCard.suit){
				return false;
			}
		}
		this.playableCards.push(cardToAdd);
		return true;
	}
	setGameState(state){
		switch(state){
			case 'RETURN_CARD':
				let tempId = this.otherPlayerId;
				this.otherPlayerId = this.activePlayerId;
				this.activePlayerId = tempId;
		}
	}
	updatePlayableCards(){
		var c = 0;
		for(let deckcard of this.deck){
			if(deckcard.ownerPos==this.activePlayerPos && deckcard.suit == this.turnSuit){
					c++;
			}
		}
		if(c == 0){
			for(let deckcard of this.deck){
				if(deckcard.ownerPos == this.activePlayerPos){
					deckcard.isPlayable = true;	
				}else{
					deckcard.isPlayable = false;
				}
			}
		}else{
			for(let deckcard of this.deck){
				if(deckcard.ownerPos == this.activePlayerPos){
					if(deckcard.suit == this.turnSuit){
						deckcard.isPlayable = true;	
					}else{
						deckcard.isPlayable = true;	
					}
				}else{
					deckcard.isPlayable = false;
				}
			}
		}
	}
	getExtremeCards(cards){
		let extremes;
		if(cards.length == 0){
			extremes =[];
		}else{
			extremes = [cards[0], cards[0]];
			for(let card of cards){
				if(card.place == 'UP' && card.storey > extremes[0].storey){
					extremes[0] = card;
				}
				if(card.place == 'DOWN' && card.storey > extremes[1].storey){
					extremes[1] = card;
				}
			}
		}
		return extremes;
	}
	getNextPlayableCards(extremes){
		let nextCards = [];
		for(let extremecard of extremes){
			if(extremecard.place == 'MID'){
				nextCards.push(this.getCardByStorey( extremecard.suit, extremecard.storey+1, 'UP' ))
				nextCards.push(this.getCardByStorey( extremecard.suit, extremecard.storey+1, 'DOWN' ));
			}else{
				let card = this.getCardByStorey( extremecard.suit, extremecard.storey+1, extremecard.place );
				if(card){
					nextCards.push(card);
				}
			}
		}
		return nextCards;
	}
	getCard(suit, rank){
		for(let deckcard of this.deck){
			if(deckcard.suit == suit && deckcard.rank == rank){
				return deckcard;
			}
		}
		return null;
	}
	getCardByStorey(suit, storey, place){
		for(let deckcard of this.deck){
			if(deckcard.suit == suit && deckcard.storey == storey && deckcard.place == place){
				return deckcard;
			}
		}
		return null;
	}
	nextTurn(){
		if(this.state !== 'MOVE_HAND'){
			this.gameTurn++;
			this.setNextActivePlayerPos();	
		}
		if(this.state !== 'WITHDRAW_CARD' &&  this.state !== 'RETURN_CARD' && this.state !== 'SET_TRUMP'){
			this.state = 'READY_TO_PLAY_NEXT';
		}
	}
	updateScores(){
		let gameEnd = false;
		let scores = [0,0,0,0]
		this.players.map(player=>{
			// player.score.penalty.push(player.score.roundPenalty.total);
			// player.score.roundPenalty.total = 0;
			// player.score.roundPenalty.isNotPlayable = 0;
			// scores[player.position] = player.score.getTotalPenalty();
			// if(player.score.getTotalPenalty() > 100){
			// 	gameEnd = true;
			// }
		})
		// var sorted = scores.slice().sort(function(a,b){return a-b;});
		// var ranks = scores.slice().map(function(v) {return sorted.indexOf(v)+1});
		// this.players.map(player=>{
		// 	player.rank = ranks[player.position];
		// })
	}
	roundEnd(){
		this.state = 'ROUND_END';
		this.updateScores();	
	}
	getCardState(card){
		for(let deckcard of this.deck){
			if(deckcard.rank == card.rank && deckcard.suit == card.suit){
				return deckcard.state;
			}
		}
		return false;
	}
	getPlayerByID(){

	}
	setNextActivePlayerPos(){
		if(this.gameTurn>3 && this.gameTurn%3 == 1){
			this.activePlayerPos = this.winnerId;
		}else{
			if(this.gameTurn == 1){
				this.activePlayerPos = 0;
			}else{
				if(this.activePlayerPos == gameVars.noOfPlayers-1){
					this.activePlayerPos = 0;
				}else{
					this.activePlayerPos++;
				}
			}
		}	
		// this.updatePlayableCards();
	}
}
