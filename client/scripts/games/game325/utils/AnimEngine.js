import { timeConstants } from '../constants/SattiHelper'
import * as GameActions from '../actions/GameActions'; 
import PauseStore from '../stores/PauseStore';
import { getItemFromLocalStorage } from '../../../utils/LocalStorageUtils';
import SettingsStore from '../../../stores/SettingsStore';
import { Howl }  from 'howler';

let distributeAudio = new Howl({
	urls: ['../../assets/sounds/distribute.mp3'],
	autoplay: false
}),
playAudio = new Howl({
	urls: ['../../assets/sounds/play.mp3'],
	autoplay: false
}),
pauseAudio = new Howl({
	urls: ['../../assets/sounds/pause.mp3'],
	autoplay: false
}),
unPauseAudio = new Howl({
	urls: ['../../assets/sounds/unpause.mp3'],
	autoplay: false
})
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
	static pause = {
		state : false,
		start : 0,
		end   : 0
	}
	static audio = new Howl({});
	static requestId = undefined;
	static makeReadyForNext(){
		this.pause = {
			start : 0,
			end   : 0
		}
		this.audio = new Howl({});
	}
	static setPauseState(gamePause){
		this.pause.state = gamePause;
	}
	static cancelAnimationFrame(){
		window.cancelAnimFrame(this.requestId);
		this.requestId = undefined;
	}
	static startListening(){
		let self = this;
		PauseStore.addChangeListener(function(){
			self.setPauseState(PauseStore.getPauseState());
			if(PauseStore.getPauseState()){
				pauseAudio.play();
				self.audio.pause();
				self.pause.start = performance.now() + performance.timing.navigationStart;
			}else{
				unPauseAudio.play();
				self.audio.play();
				self.pause.end = performance.now() + performance.timing.navigationStart;
			}
		})
	}
	static startAnimation(deck, gameState, botState, ifOnline){
		this.audio = new Howl({});
		let duration = 0, action, audio;
		switch(gameState){
			case 'INIT_ROUND':
				duration = timeConstants.TOTAL_DECK_DELAY;
				// action   = GameActions.initRoundSuccess;
				action   = ifOnline ? GameActions.initRoundOnlineSuccess : GameActions.initRoundSuccess;
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'DISTRIBUTING_CARDS_0':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				// action   = GameActions.distributingCardsZeroSuccess;
				action   = ifOnline ? GameActions.distributingCardsZeroOnlineSuccess : GameActions.distributingCardsZeroSuccess;
				this.audio 	 = distributeAudio;
				// this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'DEALER_SELECTION_SUCCESS':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = GameActions.startGame;
				this.audio 	 = distributeAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'SELECT_DEALER':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = GameActions.selectDealerSuccess;
				this.audio 	 = distributeAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'DISTRIBUTING_CARDS_1':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = GameActions.distributionFirstSuccess;
				this.audio 	 = distributeAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'DISTRIBUTING_CARDS_2':
				duration = timeConstants.TOTAL_DISTR_DELAY;
				action   = GameActions.distributionSecondSuccess;
				this.audio 	 = distributeAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'PLAYING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = ifOnline ? GameActions.playedWaitForServer : GameActions.playCardSuccess;
				this.audio 	 = playAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'PLAYING_PLAYED_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = ifOnline ? GameActions.playCardSuccessOnline : '';
				// this.audio 	 = playAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'GAME325_WITHDRAWING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = GameActions.withdrawCardSuccess;
				this.audio 	 = playAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'GAME325_RETURNING_CARD':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = GameActions.returnCardSuccess;
				this.audio 	 = playAudio;
				this.audio.play();
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'ROUND_END':
				duration = timeConstants.ROUND_END_WAIT;
				action   = GameActions.showScores;
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'MOVE_HAND':
				duration = timeConstants.TOTAL_PLAY_DELAY;
				action   = GameActions.moveHandSuccess;
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'SET_TRUMP':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
					action = GameActions.botWillPlay;
				}else if(botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.REARRANGE_ANIM;
					action = null;
				}else if(botState == 'BOT_PLAYING_CARD'){
					duration = 0;
					action = null;
				}
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'GAME325_WITHDRAW_CARD':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
					action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
				}else if(botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.REARRANGE_ANIM;
					action = null;
				}else if(botState == 'BOT_PLAYING_CARD'){
					duration = 0;
					action = null;
				}
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'GAME325_RETURN_CARD':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
					action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
				}else if(botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.REARRANGE_ANIM;
					action = null;
				}else if(botState == 'BOT_PLAYING_CARD'){
					duration = 0;
					action = null;
				}
				this.animateCards(deck, duration, action, gameState);
				break;
			case 'READY_TO_PLAY_NEXT':
				if(botState == 'BOT_SHOULD_PLAY'){
					duration = timeConstants.BOT_THINKING_DELAY;
					action = ifOnline ? GameActions.requestServerBot : GameActions.botWillPlay;
				}else if(botState == 'BOT_CANNOT_PLAY'){
					duration = timeConstants.REARRANGE_ANIM;
					action = null;
				}else if(botState == 'BOT_PLAYING_CARD'){
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
			case 'DISTRIBUTE_CARDS_SUCCESS':
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
			if(!self.pause.state){
				current 	= performance.now() + performance.timing.navigationStart;
				remaining 	= end - current + (self.pause.end - self.pause.start);
				spent 		= current - start - (self.pause.end - self.pause.start);

				if(remaining < 0){
					if (typeof action === "function") {
							action();
							//this.audio = new Howler.Howl({});
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
			self.requestId = window.requestAnimFrame(step);
		}
		step();
	}
}