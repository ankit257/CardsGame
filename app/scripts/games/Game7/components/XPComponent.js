import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'

export default class XPComponent extends Component {
	static defaultProps = {
		xp: 0,
		showScores: false
	}
	render() {
		let xp = {
			value: this.props.xp,
			text: '',
			color: '#111',
			bgColor: '#eee'
		};
		let showScores = this.props.showScores;
		if(xp.value < 100){
			xp.text = xp.value + ' XP';
			xp.color = '#eee';
			xp.bgColor = '#F44336'
		}else if(xp.value < 1000){
			xp.text = xp.value + ' XP';
			xp.color = '#111';
			xp.bgColor = '#eee'
		}else if(xp.value <100000){
			xp.text = Math.round(xp.value/1000 * 10)/10 + " T XP";
			xp.color = '#eee';
			xp.bgColor = '#673AB7'
		}else{
			xp.text = Math.round(xp.value/100000 * 10)/10 + " L XP";
			xp.color = '#F44336';
			xp.bgColor = '#FFEB3B'
		}
		let style = {
			// bottom: -gameCSSConstants.gameBody.height + gameCSSConstants.gameBody.padding + gameCSSConstants.cardSize.height + gameCSSConstants.player.statusOffset,
			backgroundColor: xp.bgColor,
			color: xp.color
		}
		let spanStyle = {
			color: style.color
		}
		if(showScores){
			style.display = 'none';
		}
		return(
			<div className='xp-show' style={style}>
				<span style={spanStyle}> {xp.text}</span>
			</div>
			)
	}
}