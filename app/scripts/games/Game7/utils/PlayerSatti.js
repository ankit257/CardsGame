import ScoreSatti from '../utils/ScoreSatti'
import { gameCSSConstants,timeConstants,gameVars } from '../constants/SattiHelper';

export default class PlayerSatti{
	constructor(player){
		const {id, name, img, type} = player;
		Object.assign(this, {id, name, img, type});
		Object.assign(this, {
					position			: null,
					score 				: new ScoreSatti(),
					rank				: 0,
					width				: 0,
					height				: 0,
					state 				: 'INIT',
					x					: 0,
					y					: 0,
					theta				: 0,
					bgColor				: 'rgba(100,100,100,0.9)',
					animTime			: 100,
					delay				: 0,
					socket				: ''
		});
	}
	updatePosition(activePlayerPos, showScores, ifWaiting, showTable){
		let hideEnlarged = !(showScores || ifWaiting);
		if(hideEnlarged){
			this.delay 			= 50;
			this.animTime       = 200;
			this.width			= gameCSSConstants.player.largeDim;
			this.height			= gameCSSConstants.player.smallDim;
			let screenOut = gameCSSConstants.player.screenOut*this.height;
			switch(this.position){
				case 0:
					this.x 				= gameCSSConstants.gameBody.width/2 - this.width/2;
					this.y				= gameCSSConstants.gameBody.height - gameCSSConstants.player.smallDim + screenOut;
					this.theta			= 0;
					break;
				case 1:
					this.x 				= this.height - screenOut;
					this.y				= gameCSSConstants.gameBody.height/2 - this.width/2;
					this.theta			= 90;
					break;
				case 2:
					this.x 				= gameCSSConstants.gameBody.width/2 + this.width/2;
					this.y				= this.height - screenOut;
					this.theta			= 180;
					break;
				case 3:
					this.x 				= gameCSSConstants.gameBody.width - this.height + screenOut;
					this.y				= gameCSSConstants.gameBody.height/2 + this.width/2;
					this.theta			= 270;
					break;
			}
		}else{
			this.delay 			= 200;
			this.animTime       = 200;
			this.width 			= gameCSSConstants.score.width;
			let boundSep		= (gameCSSConstants.gameBody.width - 4*gameCSSConstants.score.width - 3*gameCSSConstants.score.sep)/2;
			this.y				= gameCSSConstants.gameBody.height/2 - gameCSSConstants.score.height/2;	
			this.height			= gameCSSConstants.score.height;
			if(showTable){
				let miny = gameCSSConstants.score.sep;
				let maxh = gameCSSConstants.gameBody.height - 2*gameCSSConstants.score.sep;
				this.y			= this.y + 23  - (1+this.score.penalty.length)*15 + 10;
				this.height     = this.height + 26 + (1+this.score.penalty.length)*15 + 10;
				this.delay 		= 50;
				this.animTime   = 50;
				if(this.y < miny || this.height > maxh){
					this.y = miny;
					this.height = maxh;
				}
			}
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
				case 4:
					this.x		= boundSep + 3*this.width + 3*gameCSSConstants.score.sep;
					break;
			}
		}
		if(!ifWaiting){
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
		}else{
			switch(this.type){
				case 'ADMIN':
					this.bgColor = '#29367B';
					break;
				case 'HUMAN':
					this.bgColor = 'rgba(0,146,132,1)';
					break;
				case 'BOT':
					this.bgColor = 'rgba(158,158,158,0.3)';
					break;
			}
		}
		
		
	}
}