import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class SmallScoreComponent extends Component {
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	render() {
		// console.log(this.props.score[0])
		let score = this.props.score;
		let showScores = this.props.showScores;
		// let totalPenalty = score.getTotalPenalty();
		let rank = this.props.rank;
		let rankToShow, rankStyle;
		switch(rank){
			case 0:
				rankToShow = '';
				break;
			case 1:
				rankToShow = '1st';
				break;
			case 2:
				rankToShow = '2nd';
				break;
			case 3:
				rankToShow = '3rd';
				break;
		}
		let rankdelay = 750 + 300*rank;
		let rankClass = "rank-container"
		let style = {
			zIndex : gameCSSConstants.zIndex.STATUS - 1
		}
		let barStyle ={
			// width : totalPenalty + '%'
			width : 50 + '%'
		}
		let className = 'small-score';
		if(showScores){
			className = 'small-score expanded';
			rankClass = "rank-container expanded";
			rankStyle = {
					transition: 'all 200ms ease ' + rankdelay + 'ms'
				}
		}
		return(
			<div className={className}>
				<div className={rankClass} style={rankStyle}>
					<div className="rank">
						{rankToShow}
					</div>
				</div>
				<div className="small-score-full"/>
				<div className="small-score-bar" style={barStyle}/>
			</div>
			)
	}
}