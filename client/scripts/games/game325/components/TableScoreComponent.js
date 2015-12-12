import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class TableScoreComponent extends Component {
	ifIAmShown(){
		let ifWaiting = this.props.ifWaiting,
			showScores = this.props.showScores,
			showTable = this.props.showTable;
		if(!ifWaiting && showTable && showScores){
			return true;
		}else{
			return false;
		}
	}
	getScoreTrs(){
		let score = this.props.score;
		let tr ='';
		// score.penalty.map(penalty=>{
		// 	tr+=`<tr><td>${penalty}<td><tr>`
		// })
		return tr;
	}
	render() {
		let score = this.props.score, position = this.props.position;
		let className;

		if(this.ifIAmShown()){
			className = 'table-score show'
		}else{
			className = 'table-score'
		}
		let t = '<table>' + this.getScoreTrs() + '</table>';
		let style = {
			maxHeight: gameCSSConstants.gameBody.height - 2*gameCSSConstants.score.sep - 36 - 40 - 40 -20,
			overflow: 'auto'
		}

		return(
			<div className={className} style={style}>
				<table>
						<tr>
							<th> # </th>
							<th> Penalty </th>
						</tr>
				</table>
			</div>
			)
	}
}