import { register } from '../../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../../utils/StoreUtils';
import ActionTypes from '../../constants/ActionTypes';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
let history = createBrowserHistory();

const Game325 = {};
const Game325Store = createStore({
	update (data){
		Game325.data = data;
	},
	get(){
		return Game325.data;
	},
	del(response){
		delete GameData.data;
	}
})
Game325Store.dispathToken = register(action => {
	const { type }  = action;
		switch(type){
			case 'GAME325':
				Game325Store.update(action.response);
				Game325Store.emitChange();
				//showLoader//
				break;
		}
		// GameRoomStore.emitChange();
});

export default Game325Store;