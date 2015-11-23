import GameStore from '../stores/GameStore';
import * as GameActions from '../actions/GameActions';
import  { timeConstants } from '../constants/SattiHelper';

class StoreChangeListener{
	handleGameStoreChange(){
		if(this.state.botState == 'BOT_SHOULD_PLAY'){
			this.fire(function(){
				GameActions.playBot()
			});
		}
	}
	constructor(){
		this.state = {};
	}
	startListening(){
		let self = this;
		GameStore.addChangeListener(function(){
			let newState = self.getStateVars();
			if(!self.isStateUnchanged(newState)){
				self.setState(newState);
				self.handleGameStoreChange();	
			}
		})
	}
	setState(newState){
		this.state = newState;
	}
	getStateVars(){
		let gameState 	= GameStore.getGameProperty('state');
		let botState 	= GameStore.getGameProperty('botState');
		return {
			gameState,
			botState
		}
	}
	isStateUnchanged(newState){
		for(let key in newState){
			if(!(this.state.hasOwnProperty(key) && newState.hasOwnProperty(key) && this.state[key] == newState[key])){
				return false;
			}
		}
		return true;
	}
	fire(callback){
		// setTimeout(callback(), 0);
	}
}


export default new StoreChangeListener()

