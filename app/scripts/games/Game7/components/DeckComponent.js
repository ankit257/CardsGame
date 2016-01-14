import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';
import CardComponent from './CardComponent';
import CardsSatti from '../utils/CardsSatti';
let cardsSatti = new CardsSatti();

export default class DeckComponent extends Component {
	state = {
		deck 		: [],
		activePlayer: null,
		time : 0
	}
	shouldComponentUpdate(nextProps){
		return nextProps.getUpdateFlag();
	}
	componentWillUnmount(){
		// delete this.props.deck;
	}
	componentWillReceiveProps(nextProps){
		this.setState({
				deck 			: nextProps.deck,
				activePlayerPos	: nextProps.activePlayerPos,
				gameState		: nextProps.gameState,
				time			: Date.now()
			});
	}
	componentDidUpdate(){
		// console.log('DeckCompRender : '+ (Date.now()-this.state.time));
	}
	makeOrderedDeck(){
		let deck = typeof this.state.deck === "undefined" ? cardsSatti.shuffle(cardsSatti.deck) : this.state.deck;
		let copiedDeck = deck.slice();
		copiedDeck.sort(function(a,b){
			if(a.order > b.order){
				return 1;
			}else{
				return -1;
			}
		})
		return copiedDeck;
	}
	render() {
		// console.log('deck component render');
		let activePlayerPos = this.state.activePlayerPos;
		let gameState = this.state.gameState;
		let ifIAmBot = this.props.ifIAmBot;
		let deck = this.makeOrderedDeck();
		// console.log(deck);
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} gameState={gameState} ifIAmBot={ifIAmBot}/>)}
			</div>
			)
	}
}