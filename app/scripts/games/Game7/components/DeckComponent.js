import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CardComponent from './CardComponent';

import GameStoreOffline from '../stores/GameStore';
import GameStoreOnline from '../stores/GameStoreOnline';

import AnimEngine from '../utils/AnimEngine'

function getState(props, ifOnline){
	let GameStore;
	if(ifOnline){
		GameStore = GameStoreOnline;
	}else{
		GameStore = GameStoreOffline;
	}
	let deck = GameStore.getGameProperty('deck');
	let activePlayerPos = GameStore.getGameProperty('activePlayerPos');
	let gameState = GameStore.getGameProperty('state');
	let botState = GameStore.getGameProperty('botState');
	let ifIAmBot = GameStore.ifIAmSpectatorOrBot();
	return {
		deck,
		gameState,
		botState,
		activePlayerPos,
		ifIAmBot
	};
}

@connectToGameStores([GameStoreOffline, GameStoreOnline], getState)
export default class DeckComponent extends Component {
	state = {
		deck 		: [],
		activePlayer: null
	}
	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	componentDidMount(){
		AnimEngine.startListening();
	}

	componentWillUnmount(){
        delete this.props.deck;
        delete this.props.gameState;
        delete this.state;
        AnimEngine.cancelAnimationFrame();
        this.props = {};
	}
	componentWillReceiveProps(nextProps){
		this.setState({
				deck 			: nextProps.deck,
				activePlayerPos	: nextProps.activePlayerPos,
				gameState		: nextProps.gameState,
				botState		: nextProps.botState
			});
	}
	componentWillUpdate(nextProps, nextState){

	}
	componentDidUpdate(){
		AnimEngine.startAnimation(this.state.deck, this.state.gameState, this.state.botState, this.context.ifOnline);
	}
	render() {
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