import React, { Component, PropTypes, findDOMNode } from 'react';
import connectToStores from '../../../../scripts/utils/connectToStores';
// import shouldPureComponentUpdate from 'react-pure-render/function';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants} from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions';

import PauseStore from '../stores/PauseStore';
import SettingsStore from '../../../stores/SettingsStore';

function getState(props){
    let pauseState = PauseStore.getPauseState();
    let settings = SettingsStore.getSettings();
    let cardbackimg = settings.activeCardBack;
    return {
        pauseState,
        cardbackimg
    };
}

@connectToStores([PauseStore, SettingsStore], getState)
export default class CardComponent extends Component {
    state = {

    }
    static contextTypes = {
        ifOnline: PropTypes.bool
    }
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    componentWillMount(){
        let x = gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2;
        let y = gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2;
        let theta = 0;
        this.setState({
            card: this.props.card,
            initialstyle: {
                transform           : 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)',
                WebkitTransform     : 'translateX(' + x + 'px) translateY(' + y + 'px) rotate(' + theta + 'deg)'
            }
        })
    }
    componentWillUnmount(){
        delete this.state;
        delete this.props;
        this.props = {};
    }
    handleClick(){
        let card = this.state.card;
        let gameState = this.props.gameState;
        if(card.isPlayable && card.ownerPos == 0 && card.state == "DISTRIBUTED" && card.ownerPos == this.props.activePlayerPos && gameState=='READY_TO_PLAY_NEXT' && !this.props.pauseState && !this.props.ifIAmBot){
            GameActions.playCard(this.state.card, this.context.ifOnline);
        }
    }
    handleTouch(){
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            card : nextProps.card,
            initialstyle: {}
        })
        this.props = nextProps;
    }	
	render() {
        const { card } = this.state;
        const { x, y, theta, animTime, delay, zIndex, bgColor } = card;
        let cardimg      = gamePathConstants.CARD_ASSETS + card.rank + card.suit + '.svg';
        let cardbackimg  = this.props.cardbackimg;
        if(this.context.ifOnline){
            cardimg = '../'+cardimg;
            cardbackimg = '../'+cardbackimg;
        }
        // let style = Object.assign(initialstyle, {
        //                                 zIndex : zIndex
        //                         });
        let style = {
            zIndex: zIndex
        };
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
