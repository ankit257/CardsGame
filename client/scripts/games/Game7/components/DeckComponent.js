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
	let gameState = GameStore.getGameProperty('state');
	return {
		deck,
		gameState,
		activePlayerPos
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
				gameState		: nextProps.gameState
			});
	}
	componentWillUpdate(nextProps, nextState){
		// if(this.state.gamePause != nextState.gamePause){
		// 	this.toggleAnimEnginePause();
		// }
	}
	componentDidUpdate(){
		// console.log('component Updated ' + this.props.gameState );
		AnimEngine.startAnimation(this.state.deck, this.state.gameState);
	}
	// toggleAnimEnginePause(){
	// 	AnimEngine.setPauseState(this.state.gamePause);
	// }
	render() {

		let deck = this.state.deck;
		let activePlayerPos = this.state.activePlayerPos;
		let gameState = this.state.gameState;
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} gameState={gameState}/>)}
			</div>
			)
	}
}