import PlayerSatti from '../utils/PlayerSatti'
import * as GameActions from '../actions/GameActions';
import { timeConstants } from '../constants/SattiHelper'
import GameStore from '../stores/GameStore'


export default class BotSatti extends PlayerSatti{
	constructor(player){
		player.type = 'BOT';
		super(player);
		this.cards = [];
	}
	updateMyCards(){
		this.cards = GameStore.getPlayersCardsByPosition(this.position);
	}
	playCard(){
		this.updateMyCards();
		let myPlayableCards = [];
		for(let myCard of this.cards){
			if(myCard.isPlayable){ myPlayableCards.push(myCard) }
		}
		if(myPlayableCards.length == 0){
			console.log('I GOT NO CARD TO PLAY!');
			var self = this;
			// this.state = 'SKIP_TURN'
			
		}else{
			setTimeout(function(){
				GameActions.playCard(myPlayableCards.pop());
			}, timeConstants.DISPATCH_DELAY);
		}
	}

}