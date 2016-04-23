import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import PlayerInfoComponent from './PlayerInfoComponent'

export default class PlayerComponent extends Component {
	static defaultProps = {
		players : []
	}
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	render() {
		let players = this.props.players;
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