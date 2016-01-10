import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';

import CardComponent from './CardComponent';

export default class DeckComponent extends Component {
	state = {
		deck 		: [],
		activePlayer: null,
		time : 0
	}
	shouldComponentUpdate(nextProps){
		return nextProps.getUpdateFlag();
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
		console.log('DeckCompRender : '+ (Date.now()-this.state.time));
	}
	render() {
		// console.log('deck component render');
		let deck = this.state.deck == undefined ? [] : this.state.deck;
		let activePlayerPos = this.state.activePlayerPos;
		let gameState = this.state.gameState;
		let ifIAmBot = this.props.ifIAmBot;
		// console.log(deck);
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} gameState={gameState} ifIAmBot={ifIAmBot}/>)}
			</div>
			)
	}
}