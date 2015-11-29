import { dispatch, dispatchDelayAsync } from '../../../../scripts/AppDispatcher';
import Actions from '../constants/Actions';
import { timeConstants } from '../constants/SattiHelper'

export function initGame(){
	dispatch(Actions.INIT_GAME, {});
}

export function initStartGame() {
	dispatch(Actions.INIT_START_GAME, {});
}

export function initRound(){
	dispatch(Actions.INIT_ROUND, {});
}

export function initRoundSuccess(){
	dispatch(Actions.INIT_ROUND_SUCCESS, {});
}

export function distributeCards(){
	dispatch(Actions.DISTRIBUTE_CARDS, {});
}

export function distributionSuccess(){
	dispatch(Actions.DISTRIBUTE_CARDS_SUCCESS, {});
}

export function playCard(card){
	dispatch(Actions.PLAY_CARD, {card});
}

export function playCardSuccess(){
	dispatch(Actions.PLAY_CARD_SUCCESS, {});
}

export function playBot(){
	dispatchDelayAsync(timeConstants.BOT_THINKING_DELAY, {
		request	: Actions.BOT_WILL_PLAY,
		success : Actions.BOT_HAS_PLAYED
	}, {})
}

export function displayGameState(){
	dispatch(Actions.DISPLAY_GAME_STATE, {});
}

export function skipTurn(position){
	dispatchDelayAsync(timeConstants.SKIP_TURN_DELAY, {
		request	: Actions.SKIP_TURN,
		success : Actions.TURN_SKIPPED
	}, {position})
}

export function endTurn(){
	dispatch(Actions.END_TURN, {});
}

export function showScores(){
	dispatchDelayAsync(timeConstants.SHOW_SCORE_DELAY, {
		request	: Actions.WAIT_TO_SHOW_SCORE,
		success : Actions.SHOW_SCORES
	}, {})
}

export function nextTurn(gameTurn){
	dispatch(Actions.NOW_NEXT_TURN, {gameTurn});
}

export function togglePauseGame(){
	dispatch(Actions.TOGGLE_PAUSE, {});	
}