import { timeConstants } from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions'; 
import PauseStore from '../stores/PauseStore';

window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame   || 
        window.mozRequestAnimationFrame      || 
        window.oRequestAnimationFrame        || 
        window.msRequestAnimationFrame       || 
        function(callback, element){
            window.setTimeout(function(){
               
                callback(+new Date);
            }, 1000 / 60);
        };
    })();



(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }
  
  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){
    
    var nowOffset = Date.now();
    
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();

export default class AnimEngine{
	static pauseState = false;
	static setPauseState(gamePause){
		this.pauseState = gamePause;
	}
	static startListening(){
		let self = this;
		PauseStore.addChangeListener(function(){
			// console.log(PauseStore.getPauseState());
			self.setPauseState(PauseStore.getPauseState());
		})
	}
	static startAnimation(deck, gameState){
		let duration = 0, action;
		switch(gameState){
			case 'INIT_ROUND':
				duration = timeConstants.TOTAL_DECK_DELAY;
				action   = GameActions.initRoundSuccess;
				this.animateCards(deck, duration, action, gameState)
				break;
			case 'DISTRIBUTING_CARDS':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = GameActions.distributionSuccess;
				this.animateCards(deck, duration, action, gameState)
				break;
			case 'PLAYING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = GameActions.playCardSuccess;
				this.animateCards(deck, duration, action, gameState)
				break;
			case 'ROUND_END':
				duration = 0;
				action   = GameActions.showScores;
				break;
			case 'INIT_ROUND_SUCCESS':
			case 'GAME_STARTED':
			case 'INIT_DECK':
			case 'DISTRIBUTE_CARDS_SUCCESS':
			case 'NOW_NEXT_TURN':
			case 'READY_TO_PLAY_NEXT':
				
				break;
		}
		
	}
	static animateCards(deck, duration, action, gameState){	
		
		if(duration == 0){
				deck.map(deckcard =>{
				if(deckcard.animTime + deckcard.delay > duration){
					duration = deckcard.animTime + deckcard.delay;
				}
			})
		}
		let self = this;
		let current, remaining, rate, spent;
		let cardRemainingTime;
		let element, delX, delY, delZ, delTheta;
		let x, y, z, theta, frontRotateY, backRotateY, oldFrontRotateY, oldBackRotateY, newBackRotateY, newFrontRotateY;
		let start = performance.now() + performance.timing.navigationStart;
		let end =  start + duration;
		function step(){
			if(!self.pauseState){
				current 	= performance.now() + performance.timing.navigationStart;
				remaining 	= end - current;
				spent 		= current - start;

				if(remaining < 0){
					if (typeof action === "function") {
							action();
						}
					return;
				}else{
					deck.map(deckcard => {
						cardRemainingTime = deckcard.delay + deckcard.animTime - spent;
						cardRemainingTime = cardRemainingTime>0 ? cardRemainingTime : 0;
						if(spent > deckcard.delay && deckcard.animState <= 1){
							deckcard.animState	= (deckcard.animTime - cardRemainingTime)/deckcard.animTime;
							// rate = deckcard.animState; // linear
							// rate = ( -Math.pow( 2, -8 * deckcard.animState ) + 1 ); // exp ease out
							rate = -1 * deckcard.animState*(deckcard.animState-2);
							element 	= document.getElementById(deckcard.key);
							delX 		= deckcard.x - deckcard.oldX;
							delY 		= deckcard.y - deckcard.oldY;
							delZ 		= deckcard.z - deckcard.oldZ;
							delTheta    = deckcard.theta - deckcard.oldTheta;

							x = delX*rate + deckcard.oldX;
							y = delY*rate + deckcard.oldY;
							z = delZ*rate + deckcard.oldZ;
							theta = delTheta*rate + deckcard.oldTheta;
							if(deckcard.showFace != deckcard.oldShowFace){
								if(deckcard.showFace){
									frontRotateY = (0 - 180)*rate + 180;
									backRotateY = (180 - 0)*rate + 0;
								}else{
									backRotateY = (0 - 180)*rate + 180;
									frontRotateY = (180 - 0)*rate + 0;
								}
							}else{
								if(deckcard.showFace){
									frontRotateY = 0
									backRotateY = 180
								}else{
									backRotateY = 0
									frontRotateY = 180
								}
							}
							element.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) rotate(' + theta + 'deg)';
							element.style.WebkitTransform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) rotate(' + theta + 'deg)';
							Array.prototype.map.call(element.childNodes, child=>{
								switch(child.className){
									case "front":
										child.style.transform = 'perspective(400px) rotateY('+ frontRotateY +'deg)';
										child.style.WebkitTransform = 'perspective(400px) rotateY('+ frontRotateY +'deg)';
										break;
									case "back":
										child.style.transform = 'perspective(400px) rotateY('+ backRotateY +'deg)';
										child.style.WebkitTransform = 'perspective(400px) rotateY('+ backRotateY +'deg)';
										break;
								}
							}) //childNodes map end
						}
					}) // deckcard map end
				}
			}
			if(window.requestAnimFrame){
				window.requestAnimFrame(step);
			}
		}
		step();
	}

}