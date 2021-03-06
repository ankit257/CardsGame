import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class LargeScoreComponent extends Component {
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	render() {
		let ifWaiting = this.props.ifWaiting;
		let score = this.props.score;
		let showScores = this.props.showScores;
		let totalPenalty = score.getTotalPenalty();
		let rank = this.props.rank;
		let scoremsg = '';
		let style = {};
		let divStyle = {
			display: 'block'
		}
		// let divStyle2 = {
		// 	opacity: 0
		// };
		let className = 'large-score';
		// switch(rank){
		// 	case 0:
		// 		scoremsg = '';
		// 		break;
		// 	case 1:
		// 		scoremsg = 'Winning at ';
		// 		break;
		// 	case 2:
		// 		scoremsg = '2nd at ';
		// 		break;
		// 	case 3:
		// 		scoremsg = '3rd at ';
		// 		break;
		// 	case 4:
		// 		scoremsg = 'Losing at ';
		// 		break;
		// }
		if(this.props.position == 2 && !showScores){
			style.transform = 'rotate(180deg)';
			style.WebkitTransform = 'rotate(180deg)';
		}
		if(showScores){
			divStyle ={
				display: 'block',
				boxSizing: 'content-box'
			}
			className = 'large-score expanded';
		}
		if(ifWaiting){
			divStyle ={
				display: 'none'
			}
		}
		return(
			<div className={className} style={style}>
				<div style={divStyle}>{totalPenalty}/100</div>
			</div>
			)
	}
}