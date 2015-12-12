import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';
import { scaleGameBody } from '../../../../scripts/utils/CommonGameUtils';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, timeConstants} from '../constants/SattiHelper'

import DeckComponent from './DeckComponent';
import StatusComponent from './StatusComponent';
import TrumpComponent from './TrumpComponent';

import * as GameActions from '../actions/GameActions';

export default class Game325Render extends Component {
	state = {
		zoomStyle : {}
	}
	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	constructor(props){
		super(props);
		this.handleResize = this.handleResize.bind(this);
	}
	componentWillMount(){
	}
	componentWillUnmount(){
		if(window.detachEvent) {
		    window.detachEvent('onresize', this.handleResize);
		}
		else if(window.removeEventListener) {
		    window.removeEventListener('resize', this.handleResize);
		}
	}
	componentDidMount(){
		this.setState({
			zoomStyle: scaleGameBody(gameCSSConstants)
		});
		if(window.attachEvent) {
		    window.attachEvent('onresize', this.handleResize);
		}
		else if(window.addEventListener) {
			window.addEventListener('resize', this.handleResize);
		}
		// GameActions.initGame();
	}
	handleResize(e){
		this.setState({
				zoomStyle: scaleGameBody(gameCSSConstants)
			});
	}
	shouldComponentUpdate(nextProps){
		return this.props.gamePause == nextProps.gamePause;
	}
	componentWillReceiveProps(nextProps){
		if(this.props.gamePause != nextProps.gamePause){
			GameActions.togglePauseGame();
		}
	}
	deleteLocalStore(){
		localStorage.removeItem('gameData');
	}
	render() {
		let style = {
			position	: 'relative',
			width		: gameCSSConstants.gameBody.width,
			height		: gameCSSConstants.gameBody.height,
			overflow	: 'hidden'
		}
		let zoomStyle = this.state.zoomStyle;
		style = Object.assign(style, zoomStyle);
		return (
	      <div style={style}>
	        <StatusComponent />
	        <DeckComponent />
	        <TrumpComponent />
	      </div>
	    )
	}
}