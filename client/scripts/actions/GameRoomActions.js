import { dispatch, dispatchAsync } from '../AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import GameRoomStore from '../stores/GameRoomStore';

import { createGameRoomServer, exitGameRoomServer, joinGameRoomServer, getRoomServer } from '../utils/APIUtils';
import { saveItemInLocalStorage, getItemFromLocalStorage } from '../utils/LocalStorageUtils';

export function saveUserInLocalStorage(username){
	var User = {
		'id': 'local',
		'first_name': username,
		'image': ''
	}
	saveItemInLocalStorage(User);
	dispatch(ActionTypes.LOGGED_IN, {User})
}
export function createGameRoom(url, data){
	dispatchAsync(createGameRoomServer(url, data), {
	    request: ActionTypes.CREATE_ROOM_REQ,
	    success: ActionTypes.CREATE_ROOM_REQ_SUCCESS,
	    failure: ActionTypes.CREATE_ROOM_REQ_ERROR
	}, { data });
}
export function joinGameRoom(id, profile, game){
	socket.emit('join_room', {'roomId':id, 'profile': profile, 'game': game});
	socket.on('room_joined', function(data){
		dispatch(ActionTypes.JOIN_ROOM_REQ_SUCCESS, data);
	})
}
export function leaveGameRoom(id, game){
	socket.emit('leave_room', {'roomId':id, 'game' : game});
}
export function exitGameRoom(url, data){
	dispatchAsync(exitGameRoomServer(url, data), {
	    request: ActionTypes.EXIT_ROOM_REQ,
	    success: ActionTypes.EXIT_ROOM_REQ_SUCCESS,
	    failure: ActionTypes.EXIT_ROOM_REQ_ERROR
	}, { data });
}
export function getRooms(url){
	dispatchAsync(getRoomServer(url), {
	    request: ActionTypes.GET_ROOM_REQ,
	    success: ActionTypes.GET_ROOM_REQ_SUCCESS,
	    failure: ActionTypes.GET_ROOM_REQ_ERROR
	}, {});
}
