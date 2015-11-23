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
	dispatchDelayAsync(timeConstants.TOTAL_DECK_DELAY, {
		request	: Actions.INIT_ROUND,
		success : Actions.INIT_ROUND_SUCCESS
	}, {})
}

export function distributeCards(){
	dispatchDelayAsync(timeConstants.TOTAL_DISTR_DELAY, {
		request	: Actions.DISTRIBUTE_CARDS,
		success : Actions.DISTRIBUTE_CARDS_SUCCESS
	}, {})
}

export function playCard(card){
	dispatchDelayAsync(timeConstants.TOTAL_PLAY_DELAY, {
		request	: Actions.PLAY_CARD,
		success : Actions.PLAY_CARD_SUCCESS
	}, {card})
}

export function playCardSuccess(card){
	dispatch(Actions.PLAY_CARD_SUCCESS, {card});
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
