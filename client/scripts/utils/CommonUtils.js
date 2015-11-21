import { Schema, arrayOf, normalize } from 'normalizr';
import { camelizeKeys } from 'humps';
import 'core-js/es6/promise';
import 'whatwg-fetch';
import *  as LocalStorageUtils from './LocalStorageUtils';

export var globalVars = {
    colors : [
        {name : 'poppins', color : '#f59120'},
        {name : 'sushi', color : '#94c23d'},
        {name : 'viking', color : '#4c9dcb'},
        {name : 'orchid', color : '#c583ac'},
        {name : 'flamingo', color : '#df3921'},
        {name : 'haze', color : '#795fa1'}
    ],
    backClass : 'poppins',
    cardBack : ['cardBack1', 'cardBack2'],
    cardFront : ['cardFront1', 'cardFront2'],
    activeBgColor : {name : 'poppins', color : '#f59120'},
    activeCardBack : 'cardBack1',
    activeCardFront : 'cardFront1'
}
var gameSettings = localStorage.getItem('gameSettings');
if(gameSettings){
    gameSettings = JSON.parse(gameSettings);
    globalVars.activeBgColor = gameSettings.activeColor;
    globalVars.deckBack = gameSettings.deckBack;
    globalVars.deckFront = gameSettings.deckFront;
}


// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Player = function(id){
    return {
     id : id,
     name : '',
     image : '',
     type : '',
     cards : [],
     scores : [{
      handsMade : 0,
      handsToMake : 0
     }],
     cardsToBeWithdrawn : 0,
     handsToMake : 0,
     handsMade : 0,
     handsToMakeInLR : 0,
     handsMadeInLR : 0,
     totalHandsToMake : 0,
     cardPlayed : {},
     cardWillBeMovedFrom : null
    }
}
var gameVars = {
  noOfPlayers : 3,
  botsName : ['dUmMy', 'aNk', 'eNVy']
}
var ww = window.innerWidth;
var wh = window.innerHeight;
var gameCSSConstants = {
  gameWindow : { x : ww, y :wh, padding : 10},
  gameBody : { x : ww, y : wh, padding : 10},
  cardSize : {x: 80, y : 113.4},//px
  trump : {left : 0, top : 0},
  deckCSS : {x : 0, y : (wh-113.4)},
  cardLeftMargin : 30
}
var DelayService = function (time, fn) {
  var time = time;
  var fn = fn;
  var _fact = {};
    var _initvalue = 1;
    var waitPromise = Q.when(true);
    var _asyncTask = function(time, fn){
        waitPromise = waitPromise.then(function (){
            return setTimeout(function (){
                fn();
            }, time);
        });
        return waitPromise;
    }
    _fact.asyncTask = _asyncTask;
    return _fact;
}
var delayService = new DelayService(null, null);
var findMyBrowser = function(){
    var browser = [{
                    name: 'Opera',
                    found: false
                   },{
                    name : 'Firefox',
                    found: false
                   },{
                    name : 'Safari',
                    found: false
                   },{
                    name : 'Chrome',
                    found: false
                   },{
                    name : 'IE',
                    found: false
                   }];
    browser[0].found = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    browser[1].found = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    browser[2].found = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    browser[3].found = !!window.chrome && !browser[0].found;              // Chrome 1+
    browser[4].found = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6
    for (var i = browser.length - 1; i >= 0; i--) {
        if(browser[i].found){
            return browser[i].name;
        }
    };
    return false;
}
var scaleGameBody = function(){
        var win_w = window.innerWidth;
        var effh = window.innerHeight;
        var effw = win_w - 80;
            if(effw/effh < gameCSSConstants.gameBody.x/gameCSSConstants.gameBody.y){
                var scalefactor = effw/gameCSSConstants.gameBody.x;
                var leftshiftFirefox = gameCSSConstants.gameBody.x*(scalefactor-1)/2;
                var topshiftFirefox = gameCSSConstants.gameBody.y*(scalefactor-1)/2 + + (effh-gameCSSConstants.gameBody.y*scalefactor)/2;
            }
            if(effw/effh > gameCSSConstants.gameBody.x/gameCSSConstants.gameBody.y){
                scalefactor = effh/gameCSSConstants.gameBody.y;
                var leftshiftFirefox = gameCSSConstants.gameBody.x*(scalefactor-1)/2 + (effw-gameCSSConstants.gameBody.x*scalefactor)/2;
                var topshiftFirefox = gameCSSConstants.gameBody.y*(scalefactor-1)/2;
                var leftshiftChrome = (effw - gameCSSConstants.gameBody.x*scalefactor)/2 + gameCSSConstants.gameBody.x*scalefactor/2;
            }      
        scalefactor = 0.99*scalefactor; 
        if(findMyBrowser() == 'Firefox' || findMyBrowser() == 'IE'){
            return {
                WebkitTransform : 'scale('+scalefactor+','+scalefactor+')',
                msTransform : 'scale('+scalefactor+','+scalefactor+')',
                transform : 'scale('+scalefactor+','+scalefactor+')',
                MozTransform : 'scale('+scalefactor+','+scalefactor+')',
                left : leftshiftFirefox,
                top: topshiftFirefox
            }
        }else{
            var zoompercent = scalefactor*100;
            return {
                zoom: zoompercent+'%',
                margin: '0 auto',
                left : 0,
                top: 0
            }
        }
        
    }
var disableBlockCSS = function(){
    return{
        position:'absolute',
        bottom:0,
        left: 0,
        width: '100%',
        height: '100%',
        // backgroundColor:'red',
        // opacity: '0.2',
        zIndex: 10020,
        display: 'block'
    }
}    
var getTrumpStyle = function (trump, trumpSet,  index, state){
  switch(trump){
    case 'H':
      var posy = '-226.88px';
      break;
    case 'S':
      var posy = '-340.32px';
      break;
    case 'D':
      var posy = '0px';
      break;
    case 'C':
      var posy = '-113.44px';
      break;
  }
  var posx = -1040;
    if(state == 'SET_TRUMP'){
        var left = (gameCSSConstants.gameBody.x - (4)*(gameCSSConstants.cardSize.x))/2 + gameCSSConstants.cardSize.x*index;
        var top = gameCSSConstants.gameBody.y/2 + 60;
        var zIndex = 99;
    }else{
        var zIndex = 0
        if(trump == trumpSet)
            zIndex = 1;
        var left = gameCSSConstants.gameBody.x - gameCSSConstants.cardSize.x - gameCSSConstants.gameBody.padding;
        var top = gameCSSConstants.gameBody.y - gameCSSConstants.cardSize.y - gameCSSConstants.gameBody.padding + 20;
    }
    var x = {
            width : gameCSSConstants.cardSize.x,
                height : gameCSSConstants.cardSize.y,
                left : left,
                top : top,
                zIndex : zIndex
            };
    return x;
}
export  function getSuitForHTML(card){
        if(card.suit == 'H')
            return 'hearts';
        if(card.suit == 'S')
            return 'spades';
        if(card.suit == 'D')
            return 'diams';
        if(card.suit == 'C')
            return 'clubs';
    }
    export function getRankForHTML(card){
        if(card.rank == 13){
            return 'A';
        }else if(card.rank == 12){
            return 'K';
        }else if(card.rank == 11){
            return 'Q';
        }else if(card.rank == 10){
            return 'J';
        }else{
            return card.rank;
        }
    }
export function getCardPic(card){
  if(!card){
        return {};
    }
    else
    {
      switch(card.suit){
        case 'H':
          var posy = '-226.88px';
          break;
        case 'S':
          var posy = '-340.32px';
          break;
        case 'D':
          var posy = '0px';
          break;
        case 'C':
          var posy = '-113.44px';
          break;
      }
        var posx = ((card.rank-1)*80*-1);
        var x = {
            backgroundImage : 'url(assets/img/cardpic.jpg)',
                width : gameCSSConstants.cardSize.x,
                height : gameCSSConstants.cardSize.y,
                backgroundSize : 1200,
                backgroundPosition : posx+'px '+posy
            };
      return x;
   }
}
var sortDeck = function (array){
    array.sort(function (a,b){
       if (a.order > b.order){
            return 1;
        }
        if (a.order < b.order){
            return -1;
        }
        return 0;
    });
    return array;
}
var arrangePlayerPositions = function(playerIds, playerId){
    while(playerIds.indexOf(playerId) > 0){
        var e = playerIds.pop();
        playerIds.push(e);
    }
    return playerIds;
}
export function getCardSuit(cardSuit) {
            if(cardSuit == 'H')
                return '<img height="16" width="16" src="assets/css/cards/images/heart.png">';
            if(cardSuit == 'S')
                // return '&spades;';
                return '<img height="18" width="18" src="assets/css/cards/images/spade.png" style="position:relative;right:4px;">';
            if(cardSuit == 'D')
                //return '&diams;';
                return '<img height="18" width="18" src="assets/css/cards/images/diams.png" style="position:relative;right:6px;">';
            if(cardSuit == 'C')
                // return '&clubs;';
                return '<img height="18" width="18" src="assets/css/cards/images/club.png">';
        }
export function getCardCSS () {
  return {
            position : 'absolute',
            width : gameCSSConstants.cardSize.x,
            height : gameCSSConstants.cardSize.y
        }
}
export function getColorClass (color, i, activeColor) {
        var className = [];
        if(color == activeColor.color){
            className.push('activeBlock');
        }
        if (i%2!=0) {
            className.push('evenBlock');
        }
        return className;
    }
    var CommonUtils = {
     getColorClass : function (color, i, activeColor) {
        var className = [];
        if(color == activeColor.color){
            className.push('activeBlock');
        }
        if (i%2!=0) {
            className.push('evenBlock');
        }
        return className;
    }, 
    getCardCSS : function () {
        return {
                  position : 'absolute',
                  width : gameCSSConstants.cardSize.x,
                  height : gameCSSConstants.cardSize.y
              }
      },
      getCardSuit : function(cardSuit) {
          if(cardSuit == 'H')
              return '<img height="16" width="16" src="public/css/cards/images/heart.png">';
          if(cardSuit == 'S')
              return '<img height="18" width="18" src="public/css/cards/images/spade.png" style="position:relative;right:4px;">';
          if(cardSuit == 'D')
              return '<img height="18" width="18" src="public/css/cards/images/diams.png" style="position:relative;right:6px;">';
          if(cardSuit == 'C')
              return '<img height="18" width="18" src="public/css/cards/images/club.png">';
      }
    }
    // export default CommonUtils;