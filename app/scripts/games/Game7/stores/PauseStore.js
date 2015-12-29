import React from 'react';
import { register } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import selectn from 'selectn';

import * as GameActions from '../actions/GameActions';
import { timeConstants, gameVars } from '../constants/SattiHelper'

var _pauseState = false;

const PauseStore = createStore({
	getPauseState(){
		return _pauseState;
	},
	togglePauseState(){
		_pauseState = !_pauseState;
	},
	setPauseState(state){
		_pauseState = state;
	}
})

PauseStore.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	switch(action.type){
		case 'TOGGLE_PAUSE':
			PauseStore.togglePauseState();
			PauseStore.emitChange();
			break;
		case 'GAME_7_REFRESH_STORE':
			let ifOnline = action.data.ifOnline;
			if(!ifOnline){
				PauseStore.setPauseState(false);
			}
				PauseStore.emitChange();
			break;
	}
})

export default PauseStore;