import { timeConstants } from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions'; 
import PauseStore from '../stores/PauseStore';
import { getItemFromLocalStorage } from '../../../utils/LocalStorageUtils';
import SettingsStore from '../../../stores/SettingsStore';
import { Howl }  from 'howler';

window.requestId = undefined;

let distributeAudio = new Howl({
	urls: ['assets/sounds/distribute.mp3'],
	autoplay: false
}),
playAudio = new Howl({
	urls: ['assets/sounds/play.mp3'],
	autoplay: false
}),
pauseAudio = new Howl({
	urls: ['assets/sounds/pause.mp3'],
	autoplay: false
}),
unPauseAudio = new Howl({
	urls: ['assets/sounds/unpause.mp3'],
	autoplay: false
})

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
			pauseAudio.play();
			AnimEngine.audio.pause();
			AnimEngine.pause.start = performance.now();// + performance.timing.navigationStart;
		}else{
			unPauseAudio.play();
			AnimEngine.audio.play();
			AnimEngine.pause.end = performance.now();// + performance.timing.navigationStart;
		}
	}
	static startAnimation(animEngineData){
		// this.audio = new Howl({});
		const { deck, gameState, botState, ifOnline } = animEngineData;
		let duration = 0, action, audio;
		switch(gameState){
			case 'INIT_ROUND':
				duration = timeConstants.TOTAL_DECK_DELAY;
				return this.animateCards(deck, duration);
				break;
			case 'DISTRIBUTING_CARDS':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				this.audio 	 = distributeAudio;
				this.audio.play();
				return this.animateCards(deck, duration);
				break;
			case 'PLAYING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				this.audio 	 = playAudio;
				this.audio.play();
				return this.animateCards(deck, duration);
				break;
			case 'PLAYING_PLAYED_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				this.audio 	 =  playAudio;
				this.audio.play();
				return this.animateCards(deck, duration);
				break;
			case 'GAME_END':
			case 'ROUND_END':
				duration = timeConstants.ROUND_END_WAIT;
				return this.animateCards(deck, duration);
				break;
			case 'READY_TO_PLAY_NEXT':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
				}else if(!ifOnline && botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
				}else if(!ifOnline && botState == 'BOT_PLAYING_CARD'){
					duration = 0;
				}else if(ifOnline){
					duration = 0;
				}
				// console.log(botState + duration);
				return this.animateCards(deck, duration);
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
	static animateCards(deck, duration){
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
		// console.log('duration = '+duration);
		return AnimEngine.stepPromise(deck, duration);
	}
	static stepPromise(deck, duration){
	    return new Promise(function(resolve, reject){
	    	let start = performance.now();// + performance.timing.navigationStart;
			let end =  start + duration;
	   		function step(){
	   			let current = performance.now();// + performance.timing.navigationStart;
		    	if(!AnimEngine.pause.state){
					let	remaining 	= end - current + (AnimEngine.pause.end - AnimEngine.pause.start),
						spent 		= current - start - (AnimEngine.pause.end - AnimEngine.pause.start),
						rate;
					if(remaining < -50){
						// console.log('animation for: '+ duration + ' , animated for: ' + spent);
						resolve();
					}else{
						deck.map(deckcard => {
							let cardRemainingTime = deckcard.delay + deckcard.animTime - spent;
							cardRemainingTime = cardRemainingTime>0 ? cardRemainingTime : 0;
							if(spent > deckcard.delay && deckcard.animState <= 1){
								deckcard.animState	= (deckcard.animTime - cardRemainingTime)/deckcard.animTime;
								rate = deckcard.animState; // linear
								// rate = ( -Math.pow( 2, -8 * deckcard.animState ) + 1 ); // exp ease out
								// rate = -1 * deckcard.animState*(deckcard.animState-2),
								let	element 	= document.getElementById(deckcard.key),
									delX 		= deckcard.x - deckcard.oldX,
									delY 		= deckcard.y - deckcard.oldY,
								    delZ 		= deckcard.z - deckcard.oldZ,
								    delTheta    = deckcard.theta - deckcard.oldTheta,

									x = delX*rate + deckcard.oldX,
									y = delY*rate + deckcard.oldY,
								    z = delZ*rate + deckcard.oldZ,
								    zIndex = deckcard.zIndex,
									theta = delTheta*rate + deckcard.oldTheta,
									frontRotateY, backRotateY
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
								let animatable = true;
								// if(deckcard.state != 'IN_DECK' && (deckcard.isPlayable && deckcard.ownerPos == 0) && delX == 0 && delY == 0 && delZ == 0 && delTheta == 0 && deckcard.showFace == deckcard.oldShowFace){
								// 	animatable = false;
								// }
								if(element && animatable){
									let elemStyle ={
										transform : 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0) rotate(' + theta + 'deg)',
										WebkitTransform : 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) rotate(' + theta + 'deg)',
										zIndex : zIndex
									}, childstyle;
									for (var parentKey in elemStyle) {
										element.style[parentKey] = elemStyle[parentKey];
									}
									for(var key in element.childNodes){
										let childstyle;
										switch(element.childNodes[key].className){
											case "front":
												childstyle = {
													transform : 'perspective(400px) rotateY('+ frontRotateY +'deg)',
													WebkitTransform : 'perspective(400px) rotateY('+ frontRotateY +'deg)'
												}
												break;
											case "back":
												childstyle = {
													transform : 'perspective(400px) rotateY('+ backRotateY +'deg)',
													WebkitTransform : 'perspective(400px) rotateY('+ backRotateY +'deg)'
												}
												break;
										}
										for(var styleKey in childstyle){
											element.childNodes[key].style[styleKey] = childstyle[styleKey];
										}
									}
								}
							}
						}) // deckcard map end +t
					}
				}
				window.requestId = window.requestAnimFrame(step);
			}
			step();
	    })			
	}

}
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
