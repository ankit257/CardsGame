import PlayerSatti from '../utils/PlayerSatti'
import * as GameActions from '../actions/GameActions';
import { timeConstants } from '../constants/SattiHelper'



export default class BotSatti extends PlayerSatti{
	constructor(player){
		player.type = 'BOT';
		super(player);
		this.cards = [];
		this.myCardStats = {
			config: {
				level1: ['S','H','D','C'],
				level2: ['UP','MID','DOWN'],
				level3: ['n','storeySum', 'rankSum', 'playable']
			},
			obj: {},
			sums: {}
		}
		this.initCardStats();
		//create array
		
	}
	initCardStats(){
		this.myCardStats.sums = new Array();
		this.myCardStats.config.level1.map(suit=>{
			this.myCardStats.obj[suit] = new Object();
			this.myCardStats.config.level2.map(place=>{
				this.myCardStats.obj[suit][place] = new Object();
				this.myCardStats.config.level3.map(value=>{
					if(value != 'playable'){
						this.myCardStats.obj[suit][place][value] = 0;
						this.myCardStats.sums[value] = 0;
					}else{
						this.myCardStats.obj[suit][place][value] = false;
					}
				})
			})
		});
	}
	updateMyCards(botCards){
		this.cards = botCards;
	}
	getPlayableCards(){
		let myPlayableCards = [];
		for(let myCard of this.cards){
			if(myCard.isPlayable){ myPlayableCards.push(Object.assign({},myCard)) }
		}
		return myPlayableCards;
	}
	playCard(botCards){
		this.updateMyCards(botCards);
		let myPlayableCards = this.getPlayableCards();
		if(myPlayableCards.length == 0){
			console.log('I GOT NO CARD TO PLAY!');
		}else{
			let card = this.getCardToPlay();
			return card;
		}
	}
	getCardToPlay(){
		let cards = this.cards;
		let playableCards = this.getPlayableCards();
		let cardToPlay = {};
		let self = this;
		this.populateMyCardStats();
		this.assignProbabilitiesToPlayables(playableCards);
		playableCards.sort(function(a,b){
			if(a.Prank < b.Prank) return -1;
			if(a.Prank > b.Prank) return 1;
			if(a.Prank == b.Prank){
				if(a.Pstorey < b.Pstorey) return -1;
				if(a.Pstorey < b.Pstorey) return 1;
				if(a.Pstorey < b.Pstorey) {
					if(a.Pn < b.Pn) return -1;
					if(a.Pn > b.Pn) return 1;
					if(a.Pn == b.Pn) return 0;
				}
			}
		});
		let printable2 = [];
		playableCards.map(card=>{
			printable2.push({key: card.key, Prank: card.Prank, Pstorey: card.Pstorey});
		})
		// console.log(printable2);
		let PlayableCopy = playableCards.slice();
		cardToPlay = PlayableCopy.pop();
		// console.log(cardToPlay.key);
		return cardToPlay;
	}
	compareCardByProbabs(a, b){
		if(a.Prank < b.Prank) return -1;
		if(a.Prank > b.Prank) return 1;
		if(a.Prank == b.Prank){
			if(a.Pstorey < b.Pstorey) return -1;
			if(a.Pstorey < b.Pstorey) return 1;
			if(a.Pstorey < b.Pstorey) {
				if(a.Pn < b.Pn) return -1;
				if(a.Pn > b.Pn) return 1;
				if(a.Pn == b.Pn) return 0;
			}
		}
	}
	populateMyCardStats(){
		// populate array
		this.initCardStats();
		let playableCards = this.getPlayableCards();
		this.cards.map(card=>{
			this.myCardStats.obj[card.suit][card.place]['n']++;
			this.myCardStats.obj[card.suit][card.place]['storeySum']+=card.storey;
			this.myCardStats.obj[card.suit][card.place]['rankSum']+=card.rank;
		});
		playableCards.map(playableCard=>{
			this.myCardStats.sums['n']+=this.myCardStats.obj[playableCard.suit][playableCard.place]['n'];
			this.myCardStats.sums['storeySum']+=this.myCardStats.obj[playableCard.suit][playableCard.place]['storeySum'];
			this.myCardStats.sums['rankSum']+=this.myCardStats.obj[playableCard.suit][playableCard.place]['rankSum'];
		})
	}
	assignProbabilitiesToPlayables(playableCards){
		playableCards.map(playableCard=>{
			if(playableCard.place == 'MID'){
				playableCard.Pn = (this.myCardStats.obj[playableCard.suit]['UP']['n']+this.myCardStats.obj[playableCard.suit]['DOWN']['n']+this.myCardStats.obj[playableCard.suit]['MID']['n'])/this.myCardStats.sums['n'];
				playableCard.Pstorey = (this.myCardStats.obj[playableCard.suit]['UP']['storeySum']+this.myCardStats.obj[playableCard.suit]['DOWN']['storeySum']+this.myCardStats.obj[playableCard.suit]['MID']['storeySum'])/this.myCardStats.sums['storeySum'];
				playableCard.Prank = (this.myCardStats.obj[playableCard.suit]['UP']['rankSum']+this.myCardStats.obj[playableCard.suit]['DOWN']['rankSum']+this.myCardStats.obj[playableCard.suit]['MID']['rankSum'])/this.myCardStats.sums['rankSum'];
			}else{
				playableCard.Pn = this.myCardStats.obj[playableCard.suit][playableCard.place]['n']/this.myCardStats.sums['n'];
				playableCard.Pstorey = this.myCardStats.obj[playableCard.suit][playableCard.place]['storeySum']/this.myCardStats.sums['storeySum'];
				playableCard.Prank = this.myCardStats.obj[playableCard.suit][playableCard.place]['rankSum']/this.myCardStats.sums['rankSum'];
			}
		})
	}

}