import React, { Component, PropTypes, findDOMNode } from 'react';
import connectToStores from '../../../../scripts/utils/connectToStores';
import connectToGameStores from '../../../../scripts/utils/connectToGameStores';

// import shouldPureComponentUpdate from 'react-pure-render/function';

// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

import {gameCSSConstants, gamePathConstants, trumps} from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions';
import GameStoreOffline from '../stores/GameStore';
import GameStoreOnline from '../stores/GameStoreOnline';

// import PauseStore from '../stores/PauseStore';

function getState(props, ifOnline){
    let GameStore;
    if(ifOnline){
        GameStore = GameStoreOnline;
    }else{
        GameStore = GameStoreOffline;
    }
    let trump = GameStore.getTrump();
    
    return {
        trump,
        ifOnline
    }
}

@connectToGameStores([GameStoreOffline, GameStoreOnline], getState)
export default class TrumpComponent extends Component {
    static contextTypes = {
        ifOnline: PropTypes.bool
    }
    state = {
        trump : null,
    }
    constructor(props) {
        super(props);
        // this.handleClick = this.handleClick.bind(this);
    }
    componentWillMount(){
        this.setState({
            trump: this.props.trump,
        })
    }
    componentDidMount(){
        // var self = this;
        // var t = (this.props.index+this.props.position+2)*100;
        // var fn = function (){
        //     self.setState({mounted : true})
        // }
    }
    componentWillUnmount(){
        delete this.state;
        delete this.props.card;
        this.props = {};
    }
    setTrump(trumpKey){
        if(!this.state.trump){
            if(this.context.ifOnline){
                GameActions.onlineSetTrump(trumpKey)
            }else{
                GameActions.setTrump(trumpKey)
            }
            // this.props.ifOnline ?  : ;
        }
    }
    handleTouch(){
    }
   componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        this.setState({
            trump : nextProps.trump
        })
        this.props = nextProps;
    }	
	render() {
        var { trump } = this.props;
        var trumpNodes = [];
        var self = this;
        let trumpSet = trump;
        var left = gameCSSConstants.gameWindow.width - gameCSSConstants.cardSize.width;
        var top = gameCSSConstants.gameWindow.height - gameCSSConstants.cardSize.height;
        trumps.map(function (trump, index){
            var style = function(x){
                var zIndex = 0;
                if(trumpSet){
                    var left = 2*gameCSSConstants.gameWindow.width/3 + 30;
                    var top = gameCSSConstants.gameWindow.height/3 + 100;
                    var visibility = 'hidden';
                }else{
                    var left = gameCSSConstants.gameWindow.width/4 + (x*85);
                    var top = gameCSSConstants.gameWindow.height/3;
                    var visibility = 'visible';
                }
                if(trumpSet == Object.keys(trump)[0]){
                    zIndex = 1;
                    visibility = 'visible';
                }
                return {
                    left : left,
                    top : top,
                    zIndex : zIndex,
                    position : 'absolute',
                    zoom : '0.5',
                    display : 'inline-block',
                    cursor : 'pointer',
                    visibility : visibility,
                    transition : 'all 0.2s linear',
                    animation : 'none !important',
                    WebkitAnimation : 'none !important'
                }
            }
            var trumpKey = Object.keys(trump)[0];
            var classes = Object.values(trump)[0];
            trumpNodes.push(<div key={index} className={classes} style={style.call(this, index)} onClick={self.setTrump.bind(self, trumpKey)}></div>)
        })
		return (
            <div className='trumps'>
                {trumpNodes}
            </div>
	    )
	}
}
