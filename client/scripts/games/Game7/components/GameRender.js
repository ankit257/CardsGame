import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';
import { scaleGameBody } from '../../../../scripts/utils/CommonGameUtils';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, timeConstants} from '../constants/SattiHelper'

import PlayerCardsComponent from './PlayerCardsComponent';
import StatusComponent from './StatusComponent';

import GameStore from '../stores/GameStore';
import * as GameActions from '../actions/GameActions';

import StoreChangeListener from '../utils/StoreChangeListener'

function getState(props){
	let game = GameStore.getGameObj();
	return {
		game
	};
}

@connectToStores([GameStore], getState)
export default class GameRender extends Component {
	state = {
		zoomStyle : {}
	}
	constructor(props){
		super(props);
	}
	componentWillMount(){
		GameActions.initGame();
	}
	componentWillUnmount(){
		if(window.detachEvent) {
		    window.detachEvent('onresize', scaleFunc);
		}
		else if(window.removeEventListener) {
		    window.removeEventListener('resize', scaleFunc);
		}
	}
	componentDidMount(){
		this.setState({
			zoomStyle: scaleGameBody(gameCSSConstants)
		});
		let self = this;
		if(window.attachEvent) {
		    window.attachEvent('onresize', function scaleFunc() {
		        self.setState({
					zoomStyle: scaleGameBody(gameCSSConstants)
				});
		    });
		}
		else if(window.addEventListener) {
		    window.addEventListener('resize', function scaleFunc() {
		        self.setState({
					zoomStyle: scaleGameBody(gameCSSConstants)
				});
		    }, true);
		}
	}
	initGame(){
		GameActions.initGame();
	}
	displayGameObj(){
		GameActions.displayGameState();
	}
	componentWillReceiveProps(nextProps){
		this.next(nextProps.game);
		// console.log('----STATUS--------' + nextProps.game.state);
	}
	next(game){
		let gameState = game.state;
		let botState = game.botState;
		if(botState == 'BOT_SHOULD_PLAY'){
			setTimeout(function(){
				GameActions.playBot()
			}, timeConstants.DISPATCH_DELAY);
		}
	}
	deleteLocalStore(){
		localStorage.removeItem('gameData');
	}
	render() {
		let style = {
			position	: 'relative',
			width		: gameCSSConstants.gameBody.width,
			height		: gameCSSConstants.gameBody.height
			,overflow	: 'hidden'
		}
		let zoomStyle = this.state.zoomStyle;
		style = Object.assign(style, zoomStyle);
		return (
	      <div style={style}>
	      	{/*<button onClick={this.initGame} className = "distribute-button init-button"> INIT </button>
	      		      	<button onClick={this.displayGameObj} className = "distribute-button display-button"> DISPLAY GAME OBJ </button>
	      		      	<button onClick={this.deleteLocalStore} className = "distribute-button"> DELETE </button>*/}
	        <StatusComponent/>
	        <PlayerCardsComponent/>
	      </div>
	    )
	}
}