import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import connectToStores from '../../../../scripts/utils/connectToStores';
import { scaleGameBodyByWidth } from '../../../../scripts/utils/CommonGameUtils';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, timeConstants} from '../constants/SattiHelper'

import DeckComponent from './DeckComponent';
import StatusComponent from './StatusComponent';

import * as GameActions from '../actions/GameActions';

export default class GameRender extends Component {
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
			zoomStyle: scaleGameBodyByWidth(gameCSSConstants)
		});
		if(window.attachEvent) {
		    window.attachEvent('onresize', this.handleResize);
		}
		else if(window.addEventListener) {
			window.addEventListener('resize', this.handleResize);
		}
	}
	handleResize(e){
		this.setState({
				zoomStyle: scaleGameBodyByWidth(gameCSSConstants)
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
			height		: gameCSSConstants.gameBody.height
			,overflow	: 'hidden'
		}
		let zoomStyle = this.state.zoomStyle;
		style = Object.assign(style, zoomStyle);
		return (
	      <div style={style}>
	        <StatusComponent/>
			<DeckComponent/>
	      </div>
	    )
	}
}