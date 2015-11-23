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
	static animateCards(deck){
		let duration = 0;
		deck.map(deckcard =>{
			if(deckcard.animTime + deckcard.delay > duration){
				duration = deckcard.animTime + deckcard.delay;
			}
		})
		let current, remaining, rate, spent;
		let cardRemainingTime;
		let element, delX, delY, delZ, delTheta;
		let x, y, z, theta, frontRotateY, backRotateY, oldFrontRotateY, oldBackRotateY, newBackRotateY, newFrontRotateY;
		let start = performance.now() + performance.timing.navigationStart;
		let end =  start + duration;
		function step(){

			current 	= performance.now() + performance.timing.navigationStart;
			remaining 	= end - current;
			spent 		= current - start;

			if(remaining < 0){
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
			if(window.requestAnimFrame){
				window.requestAnimFrame(step);
			}
		}
		step();
	}

}