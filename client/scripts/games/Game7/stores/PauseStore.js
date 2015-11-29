import React from 'react';
import { register } from '../../../../scripts/AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../../../scripts/utils/StoreUtils';
import selectn from 'selectn';

import * as GameActions from '../actions/GameActions';
import { timeConstants, gameVars } from '../constants/SattiHelper'


let bellAudio = new Audio('../../assets/sounds/bell.mp3');


var _pauseState = false;

const PauseStore = createStore({
	getPauseState(){
		return _pauseState;
	},
	togglePauseState(){
		_pauseState = !_pauseState;
	}
})

PauseStore.dispatchToken = register(action=>{
	const responseData = selectn('response.data', action);
	switch(action.type){
		case 'TOGGLE_PAUSE':
			bellAudio.play();
			PauseStore.togglePauseState();
			PauseStore.emitChange();
			break;
	}
})

export default PauseStore;