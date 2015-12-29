import { dispatch, dispatchAsync } from '../../AppDispatcher';
import ActionTypes from '../../constants/ActionTypes';
import Game325Store from './Game325Store';
import { Game325 } from './Game325';

// console.log(Game325);

var Game = new Game325();

export function playWithBots(gameObj){
	
}
export function startGame(game){
	Game.initGame();
	dispatch(ActionTypes.GAME325, Game);
}