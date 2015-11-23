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
export default class PlayerCards extends Component {
	state = {
		deck 		: [],
		activePlayer: null
	}
	componentWIllUnmount(){
        delete this.props.deck;
        this.props = {};
        console.log('unmounted');
	}
	componentWillReceiveProps(nextProps){
		this.setState({
				deck 		: nextProps.deck,
				activePlayerPos: nextProps.activePlayerPos
			});
	}
	componentDidUpdate(){
		AnimEngine.animateCards(this.state.deck);
	}
	componentDidMount(){
		AnimEngine.animateCards(this.state.deck);	
	}
	render() {
		let deck = this.state.deck;
		let activePlayerPos = this.state.activePlayerPos;
		let gameState = this.props.gameState;
		return(
			<div className="playingCards">
				{deck.map(card => <CardComponent key={card.key} card={card} activePlayerPos={activePlayerPos} gameState={gameState}/>)}
			</div>
			)
	}
}