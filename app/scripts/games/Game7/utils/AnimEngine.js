import { timeConstants } from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions'; 
import PauseStore from '../stores/PauseStore';
import { getItemFromLocalStorage } from '../../../utils/LocalStorageUtils';
import SettingsStore from '../../../stores/SettingsStore';
import { Howl }  from 'howler';

window.requestId = undefined;

// let distributeAudio = new Howl({
// 	urls: ['assets/sounds/distribute.mp3'],
// 	autoplay: false
// }),
// playAudio = new Howl({
// 	urls: ['assets/sounds/play.mp3'],
// 	autoplay: false
// }),
// pauseAudio = new Howl({
// 	urls: ['assets/sounds/pause.mp3'],
// 	autoplay: false
// }),
// unPauseAudio = new Howl({
// 	urls: ['assets/sounds/unpause.mp3'],
// 	autoplay: false
// })
window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame   || 
        window.mozRequestAnimationFrame      || 
        window.oRequestAnimationFrame        || 
        window.msRequestAnimationFrame       || 
        function(callback, element){
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    })();

window.cancelAnimFrame = (function(){
	return window.cancelAnimationFrame ||
		function(id) {
            clearTimeout(id);
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
	// static mount = false;
	static pause = {
		state : false,
		start : 0,
		end   : 0
	}
	// static audio = new Howl({});
	static makeReadyForNext(){
		this.pause.start = 0;
		this.pause.end = 0;
	}
	static setPauseState(gamePause){
		this.pause.state = gamePause;
	}
	static cancelAnimationFrame(){
		window.cancelAnimFrame(window.requestId);
		window.requestId = undefined;
	}
	static startListening(){
		PauseStore.addChangeListener(AnimEngine.handlePause);
	}
	static stopListening(){
		PauseStore.removeChangeListener(AnimEngine.handlePause);	
	}
	static handlePause(e){
		AnimEngine.setPauseState(PauseStore.getPauseState());
		if(PauseStore.getPauseState()){
			// pauseAudio.play();
			// AnimEngine.audio.pause();
			AnimEngine.pause.start = performance.now() + performance.timing.navigationStart;
		}else{
			// unPauseAudio.play();
			// AnimEngine.audio.play();
			AnimEngine.pause.end = performance.now() + performance.timing.navigationStart;
		}
	}
	static startAnimation(deck, gameState, botState, ifOnline){
		// this.audio = new Howl({});
		let duration = 0, action, audio;
		switch(gameState){
			case 'INIT_ROUND':
				duration = timeConstants.TOTAL_DECK_DELAY;
				action   = ifOnline ? GameActions.onlineInitRoundSuccess : GameActions.initRoundSuccess;
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'DISTRIBUTING_CARDS':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = ifOnline ? GameActions.onlineDistributionSuccess : GameActions.distributionSuccess;
				// this.audio 	 = distributeAudio;
				// this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'PLAYING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = ifOnline ? GameActions.playedWaitForServer : GameActions.playCardSuccess;
				// this.audio 	 = playAudio;
				// this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'PLAYING_PLAYED_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = ifOnline ? GameActions.playCardSuccessOnline : '';
				// this.audio 	 = playAudio;
				// this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'GAME_END':
			case 'ROUND_END':
				duration = timeConstants.ROUND_END_WAIT;
				action   = ifOnline ? GameActions.showScoresOnline : GameActions.showScores;
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'READY_TO_PLAY_NEXT':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
					action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
				}else if(!ifOnline && botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.REARRANGE_ANIM;
					action = null;
				}else if(!ifOnline && botState == 'BOT_PLAYING_CARD'){
					duration = 0;
					action = null;
				}else if(ifOnline){
					duration = 0;
					action = null;
				}
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'ROUND_END_SHOW_SCORES':
				this.cancelAnimationFrame();
				break;
			case 'INIT_ROUND_SUCCESS':
			case 'GAME_STARTED':
			case 'INIT_DECK':
			case 'NOW_NEXT_TURN':
			case 'PLAY_DATA_RECEIVED':
			case 'SKIP_DATA_RECEIVED':
				break;
		}
		
	}
	static animateCards(deck, duration, action, gameState){
		if(this.pause.state){
			this.cancelAnimationFrame();
		}else{
			this.makeReadyForNext();
		}
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
			// if(AnimEngine.mount == false){
			// 	AnimEngine.cancelAnimationFrame();
			// }
			if(!AnimEngine.pause.state){
				current 	= performance.now() + performance.timing.navigationStart;
				remaining 	= end - current + (self.pause.end - self.pause.start);
				spent 		= current - start - (self.pause.end - self.pause.start);

				if(remaining < 0){
					if (typeof action === "function") {
							action();
							// self.audio = new Howl({});
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
							if(element){
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
							}else{
								self.cancelAnimationFrame();
							}
							
						}
					}) // deckcard map end
				}
			}
			window.requestId = window.requestAnimFrame(step);
		}
		step();
	}

}