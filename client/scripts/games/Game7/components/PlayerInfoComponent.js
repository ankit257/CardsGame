import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import SmallScoreComponent from './SmallScoreComponent';
import LargeScoreComponent from './LargeScoreComponent';
import PopUpComponent from './PopUpComponent';

export default class PlayerInfoComponent extends Component {
	state = {
		touched: false,
		scoreHeight: gameCSSConstants.player.scoreHeight
	}
	constructor(props){
		super(props);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
	}
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	onTouchStart(){
		this.setState({
			touched: true,
			scoreHeight: gameCSSConstants.player.scoreHeight + gameCSSConstants.player.screenOut*gameCSSConstants.player.smallDim
		})
	}
	onTouchEnd(){
		this.setState({
			touched: false,
			scoreHeight: gameCSSConstants.player.scoreHeight
		})
	}
	getPopUp(){
		let popup = {
			msg 	: '',
			color 	: '#fff'
		};
		let player = this.props.player;
		let activePlayerPos = this.props.activePlayerPos;
		if(player.position == activePlayerPos && player.state == 'SKIP_TURN'){
			popup.msg = 'PASS';
			popup.color = 'rgba(243,80,68,1)';
		}
		if(player.score.getTotalPenalty() > 90){
			popup.msg = 'Losing!'
			popup.color = 'red';
		}
		if(player.state == 'CLEARED'){
			popup.msg = 'CLEARED'
			popup.color = 'rgba(226,93,138,1)';
		}
		return popup;
	}
	render() {
		let player = this.props.player;
		let score = player.score;
		let scoreHeight = this.state.scoreHeight;
		let touched = this.state.touched;
		let activePlayerPos = this.props.activePlayerPos;
		let showScores = this.props.showScores;
		let popup = this.getPopUp();
		player.updatePosition(activePlayerPos, this.state.touched, showScores);
		const { width, height, x, y, theta, animTime, delay, bgColor, name } = player
		let style = {
            transform          	: 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)',
            WebkitTransform    	: 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)',
            transition         	: 'all ' + animTime + 'ms linear ' + delay + 'ms',
            WebkitTransition   	: 'all ' + animTime + 'ms linear ' + delay + 'ms',
            backgroundColor    	: bgColor,
            WebkitBackgroundColor: bgColor,
            width 				: width,
            height 				: height,
            zIndex				: gameCSSConstants.zIndex.STATUS
		}
		let playerNameStyle = {
			padding				: 3,
			width				: width-6,
			height				: 14,
			zIndex				: gameCSSConstants.zIndex.STATUS+1,
			top					: 4,
			transition         	: 'all ' + animTime + 'ms linear ' + delay + 'ms',
            WebkitTransition   	: 'all ' + animTime + 'ms linear ' + delay + 'ms'
		}
		if(player.position == 2 && !showScores){
			playerNameStyle.transform = 'rotate(180deg)';
			playerNameStyle.WebkitTransform = 'rotate(180deg)';
		}
		if(showScores){
			playerNameStyle.top =  40;
			playerNameStyle.fontSize = 12;
		}
		return(
			<div style={style} className="player-info" onTap={this.onTouchStart} onMouseDown={this.onTouchStart} onMouseUp={this.onTouchEnd} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} >
				<div className='player-name' style={playerNameStyle} >{name} </div>
				<PopUpComponent popup={popup} position={player.position} showScores={showScores}/>
				<SmallScoreComponent score={score} position={player.position} showScores={showScores} rank={player.rank}/>
				<LargeScoreComponent score={score} position={player.position} rank={player.rank} showScores={showScores}/>
			</div>
			)
	}
}