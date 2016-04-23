import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import SmallScoreComponent from './SmallScoreComponent';
import LargeScoreComponent from './LargeScoreComponent';
import TableScoreComponent from './TableScoreComponent';
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
		let ifWaiting = this.props.ifWaiting;
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
		// if(player.score.getTotalPenalty() > 90){
		// 	popup.msg = 'Losing!'
		// 	popup.color = 'red';
		// }
		if(player.state == 'CLEARED'){
			popup.msg = 'CLEARED'
			popup.color = 'rgba(226,93,138,1)';
		}
		if(player.position == 0 && ifWaiting){
			popup.msg = 'YOU';
			popup.color = '#de4f3d';
		}
		return popup;
	}
	render() {
		let playertype  = {
			text : '',
			color: 'rgba(0,0,0,0)'
		};
		let ifWaiting = this.props.ifWaiting;
		let showTable = this.props.showTable;
		let player = this.props.player;
		let score = player.score;
		let scoreHeight = this.state.scoreHeight;
		let touched = this.state.touched;
		let activePlayerPos = this.props.activePlayerPos;
		let otherPlayerPos = this.props.otherPlayerPos;
		let showScores = this.props.showScores;
		let popup = this.getPopUp();
		let playerTypeClass;
		let handsToMake = player.handsToMake;
		let handsMade = player.handsMade;
		player.updatePosition(activePlayerPos, this.state.touched, showScores, ifWaiting, showTable);
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
					playertype.text = 'Waiting';
					playertype.color = '#1f1f1f';
					break;
				case 'HUMAN':
					playertype.text = 'Player';
					playertype.color = '#00403A';
					break;
				case 'ADMIN':
					playertype.text = 'Admin';
					playertype.color = '#3F51B5';
					break;
			}	
		}else if(showTable){
			playerNameStyle.height = 30;
			playerTypeClass = 'player-type player-type-waiting';
			switch(player.type){
				case 'BOT':
					playertype.text = 'BOT';
					playertype.color = '#3F51B5';
					break;
				case 'HUMAN':
					playertype.text = 'Player';
					playertype.color = '#795548';
					break;
				case 'ADMIN':
					playertype.text = 'Admin';
					playertype.color = 'rgba(244,67,54,0.75)';
					break;
			}
			style.backgroundColor= 'rgba(62,43,36,0.8)';
			style.WebkitBackgroundColor= 'rgba(62,43,36,0.8)';
		}
		else{
			playerTypeClass = 'player-type';
			switch(player.type){
				case 'BOT':
					playertype.text = 'B';
					playertype.color = '#3F51B5';
					break;
				case 'HUMAN':
					playertype.text = 'P';
					playertype.color = '#795548';
					break;
				case 'ADMIN':
					playertype.text = 'A';
					playertype.color = 'rgba(244,67,54,0.75)';
					break;
			}
			if(player.type == 'BOT' && player.position == 0){
				playertype.text = 'S';
				playertype.color = '#9C27B0';
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
			<div style={style} className="player-info" onTap={this.onTouchStart} onMouseDown={this.onTouchStart} onMouseUp={this.onTouchEnd} onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} >
				<div className='player-name' style={playerNameStyle} >{id} 
					<span className={playerTypeClass} style={playerTypeStyle}> {playertype.text} </span>
				</div>
				<PopUpComponent popup={popup} position={player.position} showScores={showScores} ifWaiting={ifWaiting}/>
				<SmallScoreComponent score={score} position={player.position} showScores={showScores} rank={player.rank} ifWaiting={ifWaiting}/>
				<TableScoreComponent handsMade={handsMade} handsToMake={handsToMake} score={score} position={player.position} showScores={showScores} showTable={showTable} ifWaiting={ifWaiting}/>
				<LargeScoreComponent handsMade={handsMade} handsToMake={handsToMake} score={score} position={player.position} rank={player.rank} showScores={showScores} ifWaiting={ifWaiting}/>
			</div>
			)
	}
}