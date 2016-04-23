import React, { Component, PropTypes } from 'react';
import connectToStores from '../../../../scripts/utils/connectToStores';
// import shouldPureComponentUpdate from 'react-pure-render/function';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants} from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions';

import SettingsStore from '../../../stores/SettingsStore';
import PauseStore from '../stores/PauseStore';

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
        this.setState({
            card: this.props.card,
        })
    }
    componentDidMount(){
    }
    shouldComponentUpdate(){
        return true;
    }
    componentWillUnmount(){
        delete this.state;
        delete this.props.card;
        this.props = {};
    }
    handleClick(){
        let card = this.state.card;
        let gameState = this.props.gameState;
        // console.log(gameState + 'activeplayer:'+ this.props.activePlayerPos + 'other' + this.props.otherPlayerPos);
        // console.log(this.props.otherPlayerPos);
        if( card.ownerPos == 0 && card.state == "DISTRIBUTED" && card.ownerPos == this.props.activePlayerPos && gameState=='READY_TO_PLAY_NEXT' && !this.props.pauseState && !this.props.ifIAmBot){
            if(this.context.ifOnline){
                GameActions.onlinePlayCard(this.state.card);
            }else{
                GameActions.playCard(this.state.card);
            }
            
        }
        if(card.ownerPos == this.props.otherPlayerPos && card.state == "DISTRIBUTED" && gameState=='WITHDRAW_CARD' && !this.props.pauseState  && !this.props.ifIAmBot){
            if(this.context.ifOnline){
                GameActions.onlinePlayCard(this.state.card);
            }else{
                GameActions.playCard(this.state.card);
            }
        }
        if(card.ownerPos == this.props.activePlayerPos && card.state == "DISTRIBUTED" && gameState=='RETURN_CARD' && !this.props.pauseState  && !this.props.ifIAmBot){
            if(this.context.ifOnline){
                GameActions.onlinePlayCard(this.state.card);
            }else{
                GameActions.playCard(this.state.card);
            }
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
        let cardimg      = '/'+gamePathConstants.CARD_ASSETS + card.rank + card.suit + '.svg';
        let cardbackimg  = '/'+gamePathConstants.CARD_BACK_IMG;
        let style = {
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
