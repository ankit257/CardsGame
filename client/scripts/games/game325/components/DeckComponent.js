import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import CardComponent from './CardComponent';

import GameStore from '../stores/GameStore';

import AnimEngine from '../utils/AnimEngine'

function getState(props){
	let deck = GameStore.getGameProperty('deck');
	let activePlayerPos = GameStore.getGameProperty('activePlayerPos');
	let otherPlayerId = GameStore.getGameProperty('otherPlayerId');
	let gameState = GameStore.getGameProperty('state');
	let botState = GameStore.getGameProperty('botState');
	return {
		deck,
		gameState,
		botState,
		activePlayerPos,
		otherPlayerId
	};
}

@connectToStores([GameStore], getState)
export default class DeckComponent extends Component {
	state = {
		deck 		: [],
		activePlayer: null
	}
	// static contextTypes = {
 //    	color: PropTypes.string
 //  	}
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
				otherPlayerId	: nextProps.otherPlayerId,
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
		AnimEngine.startAnimation(this.state.deck, this.state.gameState, this.state.botState);
	}
	// toggleAnimEnginePause(){
	// 	AnimEngine.setPauseState(this.state.gamePause);
	// }
	render() {
		let deck = this.state.deck;
		let activePlayerPos = this.state.activePlayerPos;
		let otherPlayerId = this.state.otherPlayerId;
		let gameState = this.state.gameState;
		let cardsToDistribute = [];
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} otherPlayerId={otherPlayerId} gameState={gameState}/>)}
			</div>
			)
	}
}