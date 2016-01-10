import CardsDehla from '../utils/CardsDehla'
import { delay } from '../../../../scripts/AppDispatcher';
import { gameCSSConstants, gameVars, timeConstants } from '../constants/DehlaHelper'
import PlayerDehla from '../utils/PlayerDehla'
import BotDehla from '../utils/BotDehla'
import ScoreDehla from '../utils/ScoreDehla'
import * as GameActions from '../actions/GameActions';

let cardsDehla = new CardsDehla();

export default class GameDehla{
	constructor(){
		Object.assign(this, {
					adminId			: null,
					maxPlayers		: 4,
					players 		: [],
					deck 			: [],
					dealerPos		: 0,
					distributionArray 	: [5,4,4],
					distributionIndex 	: 0,
					distributionState	: 0,
					trump 				: null,
					suitTrump			: null,
					turnSuit			: null,
					gameTurn		: 0,
					gameRound		: 0,
					state 			: 'CONSTRUCTED',
					botState		: 'UNINITIATED',
					cardPlayed		: {},
					playedCards 	: {},
					playableCards 	: [],
					activePlayerPos	: null,
					activePlayerId	: null,
					pauseState		: false
		});
	}
	initDeck(){
		this.deck = cardsDehla.shuffle(cardsDehla.deck);
		this.state = 'INIT_DECK';
	}
	setDeckIndex(){
		for (var i = 0; i < this.deck.length; i++) {
			this.deck[i].index = i;
		};
	}
	initRound(){
		this.deck = cardsDehla.shuffle(this.deck);
		this.deck.map(card=> {
			card.setDefaultState();
			// card.setPositionByState();
		});
		// this.setDeckIndex();
		this.state = 'INIT_ROUND';
		this.playedCards = {
						S: { cards: [], extremes: []},
						D: { cards: [], extremes: []},
						H: { cards: [], extremes: []},	
						C: { cards: [], extremes: []},
		};
		this.playableCards = [];
		this.activePlayerPos = null;
		this.botState = 'UNINITIATED';
		this.gameTurn = 1;
		this.gameRound ++;
		this.players.map(player=>player.state = 'INIT');
	}
	initPlayers(){
		for (var i = 0; i < gameVars.noOfPlayers; i++) {
			let player;
			let botNames = ['', 'Player1', 'Player2', 'Player3']
			if( i == 0 ){
				player = new PlayerDehla({id: i, name: 'You', img: 'IMAGE_YOU', type: 'HUMAN'});
			}else{
				player = new BotDehla({id: i, name: botNames[i], img: 'IMAGE_BOT'});
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
		// let n = 13;
		// let index = 0;
		// for (let i = 0; i < n; i++) {
		// 	for (let j = 0; j < this.players.length; j++) {
		// 		let card = this.deck[index];
		// 		if(card.state == 'IN_DECK'){
		// 			card.state = 'DISTRIBUTED';
		// 			card.animTime = timeConstants.SINGLE_DISTR_ANIM;
		// 			card.delay = timeConstants.SINGLE_DISTR_DELAY*(52-index);
		// 			card.ownerPos = this.players[j].position;
		// 			index++;
		// 			card.zIndex = gameCSSConstants.zIndex.DISTR + i;
		// 			// card.setPositionByState();
		// 		}
		// 	}
		// }
		// this.state = 'DISTRIBUTING_CARDS';
		let cardDistributionStartFrom = this.dealerPos+1;
		if(cardDistributionStartFrom === this.players.length){
			cardDistributionStartFrom = 0;
		}
		let playerPosArray = [0,1,2,3]
		while(playerPosArray[0] !== cardDistributionStartFrom){
			var c = playerPosArray.pop();
			playerPosArray.unshift(c);
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
					card.ownerPos = playerPosArray[j] ;//this.players[j].position;
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
			this.botState = 'BOT_SHOULD_PLAY';
		}else{
			this.botState = 'BOT_CANNOT_PLAY';
		}
	}
	checkTurnSkip(gameType){
		let activePlayer;
		this.players.map(player=>{
			if(player.position == this.activePlayerPos){
				activePlayer = player;
			}
		})
		if(activePlayer.state == 'SKIP_TURN'){
			if(gameType == 'offline'){
				GameActions.skipTurn(activePlayer.position);
			}else if(gameType == 'online'){
				GameActions.skipMyTurn(activePlayer.id);
			}else{
				console.log('Weird');
			}
		}
	}
	playBot(botCards){
		let activeBot;
		this.players.map(player=>{
			if(player.position == this.activePlayerPos){
				activeBot = player;
			}
		})
		if(activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY'){
			this.botState = 'BOT_PLAYING_CARD';
			return activeBot.playCard(botCards);
		}
	}
	playCard(card, callerLocation){
		if(card && ((callerLocation == 'client' && card.ownerPos == this.activePlayerPos) || (callerLocation == 'server' && card.ownerId == this.activePlayerId)) && this.state == 'READY_TO_PLAY_NEXT'){
			for(let deckcard of this.deck){
				if(card.rank == deckcard.rank && card.suit == deckcard.suit){
					this.cardPlayed = deckcard;
					deckcard.state = 'BEING_PLAYED';
					this.removePlayableCard(deckcard);
					deckcard.delay = timeConstants.PLAY_DELAY;
					deckcard.animTime = timeConstants.PLAY_ANIM;
				}
			}
			this.state ='PLAYING_CARD';
		}
	}
	updateCardState(card, state){
		this.deck.map(deckcard=>{
			if(deckcard.rank == card.rank && deckcard.suit == card.suit){
				deckcard.state = state;
			}
		})
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
	updatePlayableCards(){
		let suits = ['S', 'H', 'C', 'D'];
		if(this.gameTurn == 1){
			this.addPlayableCard( this.getCard('S', 7) );
		}else{
			for(let suit of suits){
				this.playedCards[suit].extremes = this.getExtremeCards( this.playedCards[suit].cards );
				let nextCards = this.getNextPlayableCards( this.playedCards[suit].extremes );
				if(nextCards.length == 0){
					this.addPlayableCard( this.getCard(suit, 7) );
				}else{
					nextCards.map(card => this.addPlayableCard(card));
				}
			}
		}
		// this.deck.map(card=> card.isPlayable = false);
		// this.playableCards = [];
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
		this.gameTurn++;
		this.setNextActivePlayerPos();
		this.state = 'READY_TO_PLAY_NEXT';
	}
	updatePenalties(){
		let gameEnd = false;
		let scores = [0,0,0,0]
		this.players.map(player=>{
			player.score.penalty.push(player.score.roundPenalty.total);
			player.score.roundPenalty.total = 0;
			player.score.roundPenalty.isNotPlayable = 0;
			scores[player.position] = player.score.getTotalPenalty();
			if(player.score.getTotalPenalty() > 100){
				gameEnd = true;
			}
		})
		var sorted = scores.slice().sort(function(a,b){return a-b;});
		var ranks = scores.slice().map(function(v) {return sorted.indexOf(v)+1});
		this.players.map(player=>{
			player.rank = ranks[player.position];
		})
	}
	roundEnd(){
		this.state = 'ROUND_END';
		this.updatePenalties();	
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
	// assignFirstPlayer(){
	// 	for(let deckcard of this.deck){
	// 		if(deckcard.rank == 7 && deckcard.suit == 'S'){
	// 			this.activePlayerPos = deckcard.ownerPos;
	// 		}
	// 	}
	// }
	setNextActivePlayerPos(){
		if(this.gameTurn == 1){
			this.deck.map(deckcard => {
				if(deckcard.rank == 7 && deckcard.suit == 'S'){
					this.activePlayerPos = deckcard.ownerPos;
				}
			})
		}else{
			if(this.activePlayerPos == gameVars.noOfPlayers-1){
				this.activePlayerPos = 0;
			}else{
				this.activePlayerPos++;
			}
		}
	}
}
