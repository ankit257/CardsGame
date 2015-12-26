import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';
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
	let otherPlayerPos = GameStore.getGameProperty('otherPlayerPos');
	let gameState = GameStore.getGameProperty('state');
	let botState = GameStore.getGameProperty('botState');
	let ifIAmBot = GameStore.ifIAmSpectatorOrBot();
	return {
		deck,
		gameState,
		botState,
		activePlayerPos,
		otherPlayerPos,
		ifIAmBot
	};
}

@connectToGameStores([GameStoreOffline, GameStoreOnline], getState)
export default class DeckComponent extends Component {
	state = {
		deck 		: [],
		activePlayer: null
	}
	// static contextTypes = {
 //    	color: PropTypes.string
 //  	}
 	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	componentDidMount(){
		AnimEngine.startListening();
		// AnimEngine.startAnimation(this.state.deck, this.state.gameState);	
	}
	componentWillUnmount(){
        delete this.props.deck;
        delete this.props.gameState;
        delete this.state;
        this.props = {};
	}
	componentWillReceiveProps(nextProps){
		this.setState({
				// gamePause		: nextProps.gamePause,
				deck 			: nextProps.deck,
				activePlayerPos	: nextProps.activePlayerPos,
				otherPlayerPos	: nextProps.otherPlayerPos,
				gameState		: nextProps.gameState,
				botState		: nextProps.botState
			});
	}
	componentWillUpdate(nextProps, nextState){
		// if(this.state.gamePause != nextState.gamePause){
		// 	this.toggleAnimEnginePause();
		// }
	}
	componentDidUpdate(){
		// console.log('component Updated ' + this.props.gameState );
		AnimEngine.startAnimation(this.state.deck, this.state.gameState, this.state.botState, this.context.ifOnline);
	}
	// toggleAnimEnginePause(){
	// 	AnimEngine.setPauseState(this.state.gamePause);
	// }
	render() {
		let deck = this.state.deck;
		let activePlayerPos = this.state.activePlayerPos;
		let otherPlayerPos = this.state.otherPlayerPos;
		let gameState = this.state.gameState;
		let cardsToDistribute = [];
		let ifIAmBot = this.props.ifIAmBot;
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} otherPlayerPos={otherPlayerPos} gameState={gameState}  ifIAmBot={ifIAmBot}/>)}
			</div>
			)
	}
}