import { register } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
let history = createBrowserHistory()



const GameRoom = {};

const SettingsStore = createStore({
	update (data){
		GameRoom.roomId = data.roomId;
		GameRoom.game = data.game;
	},
	get(){
		return GameRoom;
	},
	del(response){
		delete GameRoom.id;
		delete GameRoom.type;
	}
})
SettingsStore.dispathToken = register(action => {
	const { type }  = action;
		switch(type){
			case 'CREATE_ROOM_REQ':
				// SettingsStore.update(action.response);
				// SettingsStore.emitChange();
				//showLoader//
				break;
			case 'CREATE_ROOM_REQ_SUCCESS':
				SettingsStore.update(action.response);
				SettingsStore.emitChange();
				break;
			case 'JOIN_ROOM_REQ':
				// SettingsStore.update(action.response);
				// SettingsStore.emitChange();
				//showLoader//
				break;
			case 'JOIN_ROOM_REQ_SUCCESS':
				console.log(action);
				SettingsStore.update(action.data);
				SettingsStore.emitChange();
				break;
			case 'EXIT_ROOM_REQ_SUCCESS':
				SettingsStore.del(action.data);
				SettingsStore.emitChange();
				break;
			default:
				return true;
		}
		// SettingsStore.emitChange();
});

export default SettingsStore;