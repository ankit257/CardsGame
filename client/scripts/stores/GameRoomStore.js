import { register } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
let history = createBrowserHistory()



const GameRoom = {};
var GameRooms = {};
var selectedGame;
const GameRoomStore = createStore({
	updateSelectedGame(game){
		selectedGame = game;
	},
	getSelectedGame(){
		return selectedGame;
	},
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
	},
	getRooms(){
		return GameRooms;
	},
	updateRooms(response){
		// console.log(response)
		GameRooms = response;

	}
})
GameRoomStore.dispathToken = register(action => {
	const { type }  = action;
		switch(type){
			case 'UPDATE_SELECTED_GAME':
				GameRoomStore.updateSelectedGame(action.data);
				break;
			case 'CREATE_ROOM_REQ':
				// GameRoomStore.update(action.response);
				// GameRoomStore.emitChange();
				//showLoader//
				break;
			case 'CREATE_ROOM_REQ_SUCCESS':
				GameRoomStore.update(action.response);
				GameRoomStore.emitChange();
				break;
			case 'JOIN_ROOM_REQ':
				// GameRoomStore.update(action.response);
				// GameRoomStore.emitChange();
				//showLoader//
				break;
			case 'JOIN_ROOM_REQ_SUCCESS':
				// console.log(action)
				GameRoomStore.update(action.data);
				GameRoomStore.emitChange();
				break;
			case 'EXIT_ROOM_REQ_SUCCESS':
				GameRoomStore.del(action.data);
				GameRoomStore.emitChange();
				break;
			case 'GET_ROOM_REQ_SUCCESS':
				GameRoomStore.updateRooms(action.response.data);
				GameRoomStore.emitChange();
				break;
			default:
				return true;
		}
		// GameRoomStore.emitChange();
});

export default GameRoomStore;