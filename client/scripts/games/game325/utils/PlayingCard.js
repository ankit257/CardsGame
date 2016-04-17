import { gameCSSConstants, timeConstants, gameVars } from '../constants/SattiHelper';

export default class PlayingCard{
	constructor(card){
		const { suit, rank, order, storey, place } = card;
		Object.assign(this, { suit, rank, order, storey, place });
		Object.assign(this, {
			state 		: 'IN_DECK',
			oldX		: 0,
			oldY 		: 0,
			oldZ 		: 0,
			oldTheta	: 0,
			oldShowFace	: false,
			x			: 0,
			y			: 0,
			z 			: 0,
			dx			: 0,
			dy			: 0,
			ox			: 0,
			oy			: 0,
			animTime	: 200, 
			delay		: 0,
			showFace	: false,
			ownerPos	: null,
			index		: null,
			similar		: null,
			theta		: 0,
			ytheta		: 0,
			zIndex		: 0,
			isPlayable	: false,
			bgColor		: '#ddd',
			animState	: 0,
		});
		this.key = this.suit + this.rank;
		this.setPositionByState();
		this.oldX = this.x;
		this.oldY = this.y;
		this.oldTheta = this.theta;
	}
	setDefaultState(){
		Object.assign(this, {
			state 		: 'IN_DECK',
			oldX		: 0,
			oldY 		: 0,
			oldZ 		: 0,
			oldTheta	: 0,
			oldShowFace	: false,
			x			: 0,
			y			: 0,
			z 			: 0,
			dx			: 0,
			dy			: 0,
			ox			: 0,
			oy			: 0,
			animTime	: 200, 
			delay		: 0,
			showFace	: false,
			ownerPos	: null,
			index		: null,
			similar		: null,
			theta		: 0,
			ytheta		: 0,
			zIndex		: 0,
			isPlayable	: false,
			bgColor		: '#ddd',
			animState	: 0
		});
		this.key = this.suit + this.rank;
		this.setPositionByState();
		this.oldX = this.x;
		this.oldY = this.y;
		this.oldTheta = this.theta;
	}
	setRoundEndPosition(){
		this.oldShowFace = this.showFace;
		this.oldTheta = this.theta;
		this.oldX = this.x;
		this.oldY = this.y;
		this.animState  = 0;
		this.delay = 0;
		this.animTime = timeConstants.ROUND_END_WAIT;
		switch(this.state){
			case 'DISTRIBUTED':
				this.showFace = true;
				break;
			case 'MOVE_HAND':
			case 'PLAYED':
				let boundSep = (gameCSSConstants.gameBody.width - 4*gameCSSConstants.score.width - 3*gameCSSConstants.score.sep)/2;
				this.ox = 50;
				this.oy	= 250;
				this.theta = 90;
				this.dx = 0;
				this.dy = 0;
				this.showFace = false;
				break;
		}
		this.calculateActualPosition();
	}
	setPositionByState(){
		this.oldShowFace = this.showFace;
		this.oldTheta = this.theta;
		this.oldX = this.x;
		this.oldY = this.y;
		this.oldZ = this.z;
		this.animState  = 0;
		let screenOutOffset = -1 * gameCSSConstants.cardOffset.screenOut * gameCSSConstants.cardSize.height;
		// console.log(this.state)
		switch(this.state){
			case 'START_DISTRIBUTING':
				this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2;
				this.oy			= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2;
				this.delay		= timeConstants.DECK_DELAY;
				this.animTime   = timeConstants.DECK_ANIM;
				this.showFace	= false;
				break;
			case 'IN_DECK':
				this.ox 		= 0;
				this.oy			= gameCSSConstants.gameBody.height - gameCSSConstants.cardSize.height - gameCSSConstants.gameBody.padding;
				this.delay		= this.delay == timeConstants.DEALER_WAIT? timeConstants.DEALER_WAIT : 0;//timeConstants.DECK_DELAY;
				this.animTime   = timeConstants.DECK_ANIM;
				// this.zIndex     = gameCSSConstants.zIndex.DECK + this.index;
				this.showFace	= false;
				break;
			case 'SELECT_DEALER':
				switch(this.ownerPos){
					case 0:
						this.ox 		= gameCSSConstants.gameBody.width/2 -gameCSSConstants.cardSize.width/2;
						this.oy 		= gameCSSConstants.gameBody.height - gameCSSConstants.cardSize.height - gameCSSConstants.gameBody.padding;
						this.zIndex 	= -1;
						this.index 		= 0;
						this.showFace	= true;
						break;
					case 1:
						this.ox 		=  gameCSSConstants.cardSize.width/2;
						this.oy 		=  screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.zIndex 	= -1;
						this.index 		= 4;
						this.showFace	= true;
						break;
					case 2:
						this.ox 		= gameCSSConstants.gameBody.width - gameCSSConstants.cardSize.width;
						this.oy 		=  screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.zIndex 	= -1;
						this.index 		= 8;
						this.showFace	= true;
						break;
				}
				break;
			case 'DISTRIBUTED':
				let smallOffset = gameCSSConstants.cardOffset.small * gameCSSConstants.cardSize.width;
				let largeOffset = gameCSSConstants.cardOffset.large * gameCSSConstants.cardSize.width;
				let widthLargeCardArrayBy2 = ((this.similar - 1)*largeOffset + gameCSSConstants.cardSize.width)/2;
				let widthSmallCardArrayBy2 = ((this.similar - 1)*smallOffset + gameCSSConstants.cardSize.width)/2;
				switch(this.ownerPos){
					case 0:
						if(this.distributionState == 0){
							this.deckWidth  = 	gameCSSConstants.cardSize.width+ 4*(largeOffset)
						}else{
							if(typeof this.totalIndex !== 'undefined'){
								this.deckWidth  = 	gameCSSConstants.cardSize.width+ (this.totalIndex)*(largeOffset)	
							}else{
								this.deckWidth  = 	gameCSSConstants.cardSize.width+ (9)*(largeOffset)
							}
						}
						this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2 - this.deckWidth/2;
						this.oy 		= gameCSSConstants.gameBody.height - gameCSSConstants.cardSize.height - gameCSSConstants.gameBody.padding;
						this.dx 		= -1*widthLargeCardArrayBy2 + largeOffset*(this.index) + gameCSSConstants.cardSize.width/2;
						this.dy 		= 0;
						this.theta 		= 0;
						this.showFace	= true;
						this.zIndex 	= this.index;
						// console.log(widthLargeCardArrayBy2);
						break;
					case 1:
						this.ox			= gameCSSConstants.cardSize.width/2 + largeOffset/2;
						this.oy 		= screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.dy 		= 0;
						this.dx 		= -1*(-1*widthSmallCardArrayBy2 + smallOffset*(this.index) + gameCSSConstants.cardSize.width/2);
						this.theta 		= 0;
						this.showFace	= false;
						break;
					case 2:
						this.ox 		= gameCSSConstants.gameBody.width - gameCSSConstants.cardSize.width - largeOffset + 1.2*(smallOffset);
						this.oy			= screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.dx 		= -1*(widthSmallCardArrayBy2 - smallOffset*(this.index) - gameCSSConstants.cardSize.width/2);
						this.dy 		= 0;
						this.theta 		= 180;
						this.showFace	= false;
						break;
				}
				this.zIndex = gameCSSConstants.zIndex.DISTR + this.index;
				// this.showFace = true;
				break;
			case 'BEING_PLAYED':
			case 'PLAYED':
				this.z = 150;
				let offset = {
					horz : (gameCSSConstants.cardOffset.playedH * gameCSSConstants.cardSize.width)/2,
					vert : (gameCSSConstants.cardOffset.playedV * gameCSSConstants.cardSize.height)/2,
					stackV:  gameCSSConstants.cardOffset.playedStackV * gameCSSConstants.cardSize.height,
					stackH:  gameCSSConstants.cardOffset.playedStackH * gameCSSConstants.cardSize.width,
					screenOut : -1 * gameCSSConstants.cardOffset.screenOut * gameCSSConstants.cardSize.height
				}
				let zIndex = {
					S : gameCSSConstants.zIndex.PLAYED + 0,
					H : gameCSSConstants.zIndex.PLAYED + 10,
					C : gameCSSConstants.zIndex.PLAYED + 20,
					D : gameCSSConstants.zIndex.PLAYED + 30,
				}
				this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2 ;
				this.oy 		= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2 - gameCSSConstants.gameBody.padding + offset.screenOut - 10;
				this.dx 		= 0;
				this.dy 		= 0;
				this.theta 		= 0;
				this.showFace 	= true;
				switch(this.ownerPos){
					case 0:
						this.dx 	= 0;
						this.dy     = gameCSSConstants.cardSize.height;
						this.zIndex = 0;
						break;
					case 1:
						this.dx 	= -1*offset.horz - 1*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.H + this.storey;
						break;
					case 2:
						this.dx 	=  1*offset.horz + 1*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.C + this.storey;
						break;
				}
				this.showFace 	= true;
				break;
			case 'MOVE_HAND':
				// console.log('Pos:'+this.ownerPos)
				this.dx = 0;
				this.dy = 0;
				switch(this.ownerPos){
					case 0:
						this.ox 		= gameCSSConstants.gameBody.width/2 -gameCSSConstants.cardSize.width/2;
						this.oy 		= gameCSSConstants.gameBody.height;
						this.oy 		= gameCSSConstants.gameBody.height - gameCSSConstants.cardSize.height - gameCSSConstants.gameBody.padding;
						this.zIndex 	= -1;
						break;
					case 1:
						this.ox 		=  gameCSSConstants.cardSize.width/2;
						this.oy 		=  0;
						this.oy 		= screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.zIndex 	= -1;
						break;
					case 2:
						this.ox 		= gameCSSConstants.gameBody.width - gameCSSConstants.cardSize.width;
						this.oy 		=  0;
						this.oy			= screenOutOffset + gameCSSConstants.cardSize.height/2;
						this.zIndex 	= -1;
						break;
				}
				break;
			case 'HIDE_CARD':
				// console.log('HIDE_CARD')
				// this.display = 'none';
				break;
		}
		if(this.state == 'BEING_PLAYED'){
			this.zIndex = gameCSSConstants.zIndex.BEING_PLAYED;
		}
		this.calculateActualPosition();	
	}
	calculateActualPosition(){
		this.x = this.ox + this.dx;
		this.y = this.oy + this.dy;
		this.dx = 0;
		this.dy = 0;
		//  
	}
}