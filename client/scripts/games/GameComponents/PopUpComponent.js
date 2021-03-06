import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

import { gameCSSConstants, timeConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class PopUpComponent extends Component {
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	doNotPropagate(e){
		e.stopPropagation();
	}
	render() {
		let popup = this.props.popup;
		let showScores = this.props.showScores;
		let position = this.props.position;
		let show = true;
		if(popup.msg=='' || showScores){
			show = false;
		}
		let opacity = show=='' ? 0 : 1;
		let top = show=='' ? 28 : -25;
		let style ={
			backgroundColor : popup.color,
			opacity: opacity,
			WebkitOpacity: opacity,
			top: top
		}
		if(position == 2){
			style.transform = 'rotate(180deg)';
			style.WebkitTransform = 'rotate(180deg)';
		}
		return(
			<div className="pop-up-msg" style={style} onTouchStart={this.doNotPropagate} onTouchEnd={this.doNotPropagate} onMouseUp={this.doNotPropagate} onMouseDown={this.doNotPropagate}>
				{popup.msg}
			</div>
			)
	}
}