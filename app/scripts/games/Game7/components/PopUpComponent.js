import React, { Component, PropTypes, findDOMNode } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { gameCSSConstants, timeConstants, gamePathConstants } from '../constants/SattiHelper'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class PopUpComponent extends Component {
	componentWillReceiveProps(nextProps){
		this.props = nextProps;
	}
	doNotPropagate(e){
		e.stopPropagation();
	}
	getImg(src){
		if(src.localeCompare(gamePathConstants.SVG_ASSETS) == 0){
			return;
		}else{
			return (
				<img src={src}/>
				)
		}
	}
	render() {
		let popup = this.props.popup;
		let showScores = this.props.showScores;
		let position = this.props.position;
		let show = true;
		if(popup.src.localeCompare(gamePathConstants.SVG_ASSETS) == 0 || !popup.show || showScores){
			show = false;
		}
		let opacity = show=='' ? 0 : 1;
		let top = show=='' ? 28 : -25;
		let style ={
			opacity: opacity,
			WebkitOpacity: opacity,
			top: top
		}
		if(position == 2){
			style.transform = 'rotate(180deg)';
			style.WebkitTransform = 'rotate(180deg)';
		}
		return(
			<div className="pop-up-msg" style={style} onTouchStart={this.doNotPropagate} onTouchEnd={this.doNotPropagate}>
				{this.getImg.call(this, popup.src)}
			</div>
			)
	}
}