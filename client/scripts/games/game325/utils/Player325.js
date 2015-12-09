// import ScoreSatti from '../utils/ScoreSatti'
import { gameCSSConstants,timeConstants,gameVars } from '../constants/SattiHelper';


export default class Player325{
	constructor(player){
		const {id, name, img, type} = player;
		Object.assign(this, {id, name, img, type});
		Object.assign(this, {
					position			: null,
					handsToMake			: 0,
					handsMade			: 0,
					handsToMakeInLR		: 0,
					handsMadeInLR		: 0,
					score 				: [],
					rank				: 0,
					width				: 0,
					height				: 0,
					state 				: 'INIT',
					x					: 0,
					y					: 0,
					theta				: 0,
					bgColor				: 'rgba(100,100,100,0.9)',
					animTime			: 100,
					delay				: 0
		});
	}
	updatePosition(activePlayerPos, touched, showScores){
		if(!showScores){
			this.delay 			= 50;
			this.animTime       = 200;
			this.width			= gameCSSConstants.player.largeDim;
			this.height			= gameCSSConstants.player.smallDim;
			let screenOut = gameCSSConstants.player.screenOut*this.height;
			// var delta = 2*(Math.PI)/gameVars.noOfPlayers;
			// var cx = gameCSSConstants.gameBody.width/2;
			// var cy = gameCSSConstants.gameBody.height/2;
			// var yd = Math.cos((this.position)*delta);
			// var xd = Math.sin((this.position)*delta);
			// this.y = gameCSSConstants.gameBody.height/2 + screenOut +cx*xd;
			// this.x = gameCSSConstants.gameBody.width/2 - this.width/2 -cy*yd;
			// console.log(this.x)
			// console.log(this.y)
			// this.theta = 180;
			switch(this.position){
				case 0:
					this.x 				= gameCSSConstants.gameBody.width/2 - this.width/2;
					this.y				= gameCSSConstants.gameBody.height - gameCSSConstants.player.smallDim + screenOut;
					this.theta			= 0;
					if(touched) { this.y -= screenOut }
					break;
				case 1:
					this.x 				= screenOut;
					this.y				= gameCSSConstants.gameBody.height/3 - this.height;
					this.theta			= 0;
					// if(touched) { this.x += screenOut }
					break;
				case 2:
					this.x 				= gameCSSConstants.gameBody.width - this.width;
					this.y				= gameCSSConstants.gameBody.height/3 - this.height;
					this.theta			= 360;
					// if(touched) { this.x += screenOut }
					break;
			}
		}else{
			this.delay 			= 200;
			this.animTime       = 200;
			this.width 			= gameCSSConstants.score.width;
			this.height			= gameCSSConstants.score.height;
			let boundSep		= (gameCSSConstants.gameBody.width - 4*gameCSSConstants.score.width - 3*gameCSSConstants.score.sep)/2;
			this.y				= gameCSSConstants.gameBody.height/2 - gameCSSConstants.score.height/2;
			this.theta 			= 0;
			let switchvar;
			if(this.rank == 0){
				switchvar = this.position + 1;
			}else{
				switchvar = this.position + 1;
			}
			switch(switchvar){
				case 2: 
					this.x 	 	= boundSep + this.width + gameCSSConstants.score.sep;
					break;
				case 1:
					this.x 		= boundSep;
					break;
				case 3:
					this.x 		= boundSep + 2*this.width + 2*gameCSSConstants.score.sep;
					break;
			}
		}
		if(this.position == activePlayerPos){
				switch(this.state){
					case 'INIT':
						// this.bgColor		= 'rgba(0,0,200,0.9)';
						break;
					case 'SKIP_TURN':
							this.bgColor		= 'rgba(243,80,68,0.8)';
						break;
					case 'CAN_PLAY':
						this.bgColor		= 'rgba(0,146,132,0.8)';
						break;
					default: 
						this.bgColor		= 'rgba(100,100,100,0.8)';
						break;
				}
			}else{
				this.bgColor = 'rgba(62,43,36,0.8)';
			}
			if(this.state == 'CLEARED'){
				this.bgColor = 'rgba(226,93,138,0.8)';
		}
		
	}
}