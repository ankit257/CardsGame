import { gameCSSConstants,timeConstants,gameVars } from '../constants/SattiHelper';

export default class PlayingCard{
	constructor(card){
		// console.log(card);
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
			animState	: 0
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
		this.animTime = 1000;
		switch(this.state){
			case 'DISTRIBUTED':
				this.showFace = true;
				break;
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
		switch(this.state){
			case 'IN_DECK':
				this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2;
				this.oy			= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2;
				this.delay		= timeConstants.DECK_DELAY;
				this.animTime   = timeConstants.DECK_ANIM;
				// this.zIndex     = gameCSSConstants.zIndex.DECK + this.index;
				this.showFace	= false;
				break;
			case 'DISTRIBUTED':
				let smallOffset = gameCSSConstants.cardOffset.small * gameCSSConstants.cardSize.width;
				let largeOffset = gameCSSConstants.cardOffset.large * gameCSSConstants.cardSize.width;
				let screenOutOffset = -1 * gameCSSConstants.cardOffset.screenOut * gameCSSConstants.cardSize.height;
				let widthLargeCardArrayBy2 = ((this.similar - 1)*largeOffset + gameCSSConstants.cardSize.width)/2;
				let widthSmallCardArrayBy2 = ((this.similar - 1)*smallOffset + gameCSSConstants.cardSize.width)/2;
				switch(this.ownerPos){
					case 0:
						this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2;
						this.oy 		= gameCSSConstants.gameBody.height - gameCSSConstants.cardSize.height - gameCSSConstants.gameBody.padding;
						this.dx 		= -1*widthLargeCardArrayBy2 + largeOffset*(this.index) + gameCSSConstants.cardSize.width/2;
						this.dy 		= 0;
						this.theta 		= 0;
						this.showFace	= true;
						if(this.isPlayable){
							this.dy = -5;
						}
						break;
					case 1:
						// this.ox 		=  2*gameCSSConstants.gameBody.padding;
						this.ox			= gameCSSConstants.cardSize.height/2 - gameCSSConstants.cardSize.width/2 + screenOutOffset;
						this.oy 		= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2;
						this.dx 		= 0;
						this.dy 		= -1*widthSmallCardArrayBy2 + smallOffset*(this.index) + gameCSSConstants.cardSize.width/2;
						this.theta 		= 90;
						this.showFace	= false;
						break;
					case 2:
						this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2;
						// this.oy 		= gameCSSConstants.gameBody.padding;
						this.oy			= screenOutOffset
						this.dx 		= widthSmallCardArrayBy2 - smallOffset*(this.index) - gameCSSConstants.cardSize.width/2;
						this.dy 		= 0;
						this.theta 		= 180;
						this.showFace	= false;
						break;
					case 3:
						this.ox 		= gameCSSConstants.gameBody.width + (gameCSSConstants.cardSize.height/2 - gameCSSConstants.cardSize.width/2) - gameCSSConstants.cardSize.height - screenOutOffset;
						this.oy 		= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2;
						this.dx 		= 0;
						this.dy 		= widthSmallCardArrayBy2 - smallOffset*(this.index) - gameCSSConstants.cardSize.width/2;
						this.theta 		= 270;
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
				let stackDir = this.place == 'UP' ? -1 : this.place == 'DOWN' ? 1 : 0;
				let zIndex = {
					S : gameCSSConstants.zIndex.PLAYED + 0,
					H : gameCSSConstants.zIndex.PLAYED + 10,
					C : gameCSSConstants.zIndex.PLAYED + 20,
					D : gameCSSConstants.zIndex.PLAYED + 30,
				}
				this.ox 		= gameCSSConstants.gameBody.width/2 - gameCSSConstants.cardSize.width/2 + offset.stackH*this.storey*stackDir;
				this.oy 		= gameCSSConstants.gameBody.height/2 - gameCSSConstants.cardSize.height/2 - gameCSSConstants.gameBody.padding + offset.screenOut + offset.stackV*this.storey*stackDir - 10;
				this.dx 		= 0;
				this.dy 		= 0;
				this.theta 		= 0;
				this.showFace 	= true;
				switch(this.suit){
					case 'S':
						this.dx 	= -3*offset.horz - 3*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.S + this.storey;
						break;
					case 'H':
						this.dx 	= -1*offset.horz - 1*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.H + this.storey;
						break;
					case 'C':
						this.dx 	=  1*offset.horz + 1*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.C + this.storey;
						break;
					case 'D':
						this.dx 	=  3*offset.horz + 3*gameCSSConstants.cardSize.width/2;
						this.zIndex = zIndex.D + this.storey;
						break;
				}
				switch(this.place){
					case 'UP':
						this.dy 	= -(1*offset.vert + 1*gameCSSConstants.cardSize.height/2);
						this.theta 	= 0;
						break;
					case 'MID':
						this.dy 	= 0
						this.theta 	= -54;
						break;
					case 'DOWN':
						this.dy 	=  1*offset.vert + 1*gameCSSConstants.cardSize.height/2;
						this.theta 	= 0;
						break;
				}
				if(this.storey == 7){
					// if(this.suit == 'D' || this.suit == 'H'){
						// this.bgColor = 'rgb(255,244,244)';	
					// }else{
						this.bgColor = 'rgb(244,244,244)';	
					// }
					
				}
				this.showFace 	= true;
				break;
		}
		if(this.state == 'BEING_PLAYED'){
			this.zIndex = gameCSSConstants.zIndex.BEING_PLAYED;
		}
		// console.log(this);
		this.calculateActualPosition();
	}
	calculateActualPosition(){
		this.x = this.ox + this.dx;
		this.y = this.oy + this.dy;
		this.dx = 0;
		this.dy = 0;
		if(!this.x || !this.y){
			// console.log(this);
		}
	}
}