import React, { Component, PropTypes, findDOMNode } from 'react';
// import shouldPureComponentUpdate from 'react-pure-render/function';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants} from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions';

export default class CardComponent extends Component {
    state = {

    }
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState){
        return true;
    }
    componentWillMount(){
        this.setState({
            card: this.props.card,
        })
    }
    componentDidMount(){
        // var self = this;
        // var t = (this.props.index+this.props.position+2)*100;
        // var fn = function (){
        //     self.setState({mounted : true})
        // }
    }
    componentWillLeave(){
        // this.state.style.transform = 'translateX(0px) translateY(0px)';
        // this.state.style.WebkitTransform = 'translateX(0px) translateY(0px)';
    }
    handleClick(){
        let card = this.state.card;
        let gameState = this.props.gameState;
        if(card.isPlayable && card.ownerPos == 0 && card.state == "DISTRIBUTED" && card.ownerPos == this.props.activePlayerPos && gameState=='READY_TO_PLAY_NEXT'){
            GameActions.playCard(this.state.card);
        }
    }
    handleTouch(){
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            card : nextProps.card
        })
        this.props = nextProps;
    }	
	render() {
        const { card } = this.state;
        const { x, y, theta, animTime, delay, zIndex, bgColor } = card;
        let cardimg      = gamePathConstants.CARD_ASSETS + card.rank + card.suit + '.svg';
        let cardbackimg  = gamePathConstants.CARD_BACK_IMG;
        let style = {
            // transform          : 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)',
            // WebkitTransform    : 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)',
            // transition         : 'transform ' + animTime + 'ms ease-in ' + delay + 'ms',
            // WebkitTransition   : '-webkit-transform ' + animTime + 'ms ease-in ' + delay + 'ms',
            zIndex             : zIndex
        }
        let cardImgStyle ={
            backgroundColor         : bgColor,
            WebkitBackgroundColor   : bgColor
        }
        let cardfrontclass = card.showFace ? 'frontRotated' : 'front';
        let cardbackclass  = card.showFace ? 'backRotated'  : 'back' ;
		return (
            <div id={card.key} className="card" style={style} onClick={this.handleClick}>
                <img className="front" src={cardimg} style={cardImgStyle}   />
                <img className="back"  src={cardbackimg}/>
            </div>
	    )
	}
}
