import { dispatch, dispatchAsync } from '../AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import GameRoomStore from '../stores/GameRoomStore';

import * as Game7Actions from '../games/Game7/actions/GameActions';
import * as Game325Actions from '../games/Game325/actions/GameActions'

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
	socket.on('player_changed', function(data){
		switch(data.game){
			case 'game7':
				Game7Actions.playerChanged(data.players);
				break;
			case 'game325':
				Game325Actions.playerChanged(data.players);
				break;
		}
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
export function startGameWithBots(game){
	switch(game){
		case 'game7':
			Game7Actions.initGame();
			break;
		case 'game325':
			Game325Actions.initGame();
			break;
	}
}
export function updateSelectedGame(game){
	dispatch(ActionTypes.UPDATE_SELECTED_GAME, {data : game})
}
export function gameStateReceived(game, data){
	switch(game){
		case 'game7':
			Game7Actions.gameStateReceived(data);
			break;
		case 'game325':
			Game325Actions.gameStateReceived(data);
			break;
	}
}