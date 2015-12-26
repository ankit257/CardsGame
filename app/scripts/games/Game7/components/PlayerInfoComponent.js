import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, gamePathConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import SmallScoreComponent from './SmallScoreComponent';
import LargeScoreComponent from './LargeScoreComponent';
import TableScoreComponent from './TableScoreComponent';
import PopUpComponent from './PopUpComponent';

export default class PlayerInfoComponent extends Component {
	static contextTypes = {
		ifOnline: PropTypes.bool
	}
	state = {
		scoreHeight: gameCSSConstants.player.scoreHeight
	}
	getPopUp(){
		let ifWaiting = this.props.ifWaiting;
		let popup = {
			src : '',
			show: false
		}
		let player = this.props.player;
		let activePlayerPos = this.props.activePlayerPos;
		if(player.score.getTotalPenalty() > 90){
			popup.src = 'game7-popup-losing.svg';
			popup.show = true;
		}
		if(player.position == activePlayerPos && player.state == 'SKIP_TURN'){
			popup.src = 'game7-popup-pass.svg';
			popup.show = true;
		}
		if(player.state == 'CLEARED'){
			popup.src = 'game7-popup-cleared.svg';
			popup.show = true;
		}
		if(player.position == 0 && ifWaiting){
			popup.src = 'game7-popup-you.svg';
			popup.show = true;	
		}
		// if(this.context.ifOnline) popup.src = '../' + gamePathConstants.SVG_ASSETS + popup.src;
			popup.src = gamePathConstants.SVG_ASSETS +  popup.src;
		return popup;
	}
	getImg(src, classname){
		if(src.localeCompare(gamePathConstants.SVG_ASSETS) == 0){
			return
		}else{
			return (
				<img className={classname} src={src}/> 
			)
		}
	}
	render() {
		let playertype  = {
			text : '',
			color: 'rgba(0,0,0,0)'
		}, playerTypeSrc = gamePathConstants.SVG_ASSETS;
		// if(this.context.ifOnline){
		// 	playerTypeSrc = '../' + playerTypeSrc;
		// }
		let ifWaiting = this.props.ifWaiting;
		let showTable = this.props.showTable;
		let player = this.props.player;
		let score = player.score;
		let scoreHeight = this.state.scoreHeight;
		let activePlayerPos = this.props.activePlayerPos;
		let showScores = this.props.showScores;
		let popup = this.getPopUp();
		let playerTypeClass;
		player.updatePosition(activePlayerPos, showScores, ifWaiting, showTable);
		const { width, height, x, y, theta, animTime, delay, bgColor, name, id } = player
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
		if(ifWaiting){
			playerNameStyle.height = 50;
			playerTypeClass = 'player-type player-type-waiting';
			switch(player.type){
				case 'BOT':
					playerTypeSrc+='waiting-large.svg';
					break;
				case 'HUMAN':
					playerTypeSrc+='person-large.svg';
					break;
				case 'ADMIN':
					playerTypeSrc+='admin-large.svg';
					break;
			}	
		}else if(showTable){
			playerNameStyle.height = 40;
			playerTypeClass = 'player-type player-type-waiting';
			switch(player.type){
				case 'BOT':
					playerTypeSrc+='bot-large.svg';
					break;
				case 'HUMAN':
					playerTypeSrc+='person-large.svg';
					break;
				case 'ADMIN':
					playerTypeSrc+='admin-large.svg';
					break;
			}
			style.backgroundColor= 'rgba(62,43,36,0.8)';
			style.WebkitBackgroundColor= 'rgba(62,43,36,0.8)';
		}
		else{
			playerTypeClass = 'player-type';
			switch(player.type){
				case 'BOT':
					playerTypeSrc+='bot-icon.svg';
					break;
				case 'HUMAN':
					playerTypeSrc+='person-icon.svg';
					break;
				case 'ADMIN':
					playerTypeSrc+='admin-icon.svg';
					break;
			}
			if(player.type == 'BOT' && player.position == 0){
				playerTypeSrc='../' + gamePathConstants.SVG_ASSETS + 'spectator-icon.svg';
			}
		}
		let playerTypeStyle = {
			backgroundColor: playertype.color
		}
		if(player.position == 2 && !(showScores || ifWaiting)){
			playerNameStyle.transform = 'rotate(180deg)';
			playerNameStyle.WebkitTransform = 'rotate(180deg)';
		}
		if(showScores || ifWaiting){
			playerNameStyle.top =  40;
			playerNameStyle.fontSize = 12;
		}
		return(
			<div style={style} className="player-info">
				<div className='player-name' style={playerNameStyle} >{id} 
					{this.getImg.call(this, playerTypeSrc, playerTypeClass)}
				</div>
				<PopUpComponent popup={popup} position={player.position} showScores={showScores} ifWaiting={ifWaiting}/>
				<SmallScoreComponent score={score} position={player.position} showScores={showScores} rank={player.rank} ifWaiting={ifWaiting}/>
				<TableScoreComponent score={score} position={player.position} showScores={showScores} showTable={showTable} ifWaiting={ifWaiting}/>
				<LargeScoreComponent score={score} position={player.position} rank={player.rank} showScores={showScores} ifWaiting={ifWaiting}/>
			</div>
			)
	}
}