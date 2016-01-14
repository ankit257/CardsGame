import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { gameVars } from '../constants/SattiHelper'
import BotSatti from '../utils/BotSatti'

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import PlayerInfoComponent from './PlayerInfoComponent'

export default class PlayerComponent extends Component {
	static defaultProps = {
		players : []
	}
	render() {
		let players = this.props.players;
		if(typeof players === "undefined" || players.length == 0){
			players = [];
			for (var i = 0; i < gameVars.noOfPlayers; i++) {
				let player;
				let botNames = ['Pintu', 'Bablu', 'Guddu', 'Pappu']
				player = new BotSatti({id: i, name: botNames[i], img: 'IMAGE_BOT'});
				player.position = i;
				players.push(player);
			};
		}
		let activePlayerPos = this.props.activePlayerPos;
		let showScores = this.props.showScores;
		let showTable = this.props.showTable;
		let ifWaiting = this.props.ifWaiting;
		return(
			<div>
				{players.map(player=> <PlayerInfoComponent player={player} key={player.position} activePlayerPos={activePlayerPos} showScores={showScores} ifWaiting={ifWaiting} showTable={showTable}/>)}
			</div>
			)
	}
}