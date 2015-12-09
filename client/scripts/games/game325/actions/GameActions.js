import { dispatch, dispatchDelayAsync } from '../../../../scripts/AppDispatcher';
import Actions from '../constants/Actions';
import { timeConstants } from '../constants/SattiHelper'

export function initGame(){
	dispatch(Actions.GAME325_INIT_GAME, {});
}

export function initStartGame() {
	dispatch(Actions.GAME325_INIT_START_GAME, {});
}
export function distributeOneCardEach(){
	dispatch(Actions.GAME325_DISTRIBUTE_ONE_CARD_EACH, {});	
}
export function initRound(){
	dispatch(Actions.GAME325_INIT_ROUND, {});
}
export function setTrump(trump){
	dispatch(Actions.GAME325_SET_TRUMP, {trump});
}

export function initRoundSuccess(){
	dispatch(Actions.GAME325_INIT_ROUND_SUCCESS, {});
}

export function distributeCards(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS, {});
}

export function distributionFirstSuccess(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS_FIRST_SUCCESS, {});
}
export function distributionSecondSuccess(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS_SECOND_SUCCESS, {});
}
export function playCard(card){
	dispatch(Actions.GAME325_PLAY_CARD, {card});
}

export function playCardSuccess(){
	dispatch(Actions.GAME325_PLAY_CARD_SUCCESS, {});
}

export function playBot(){
	dispatch(Actions.GAME325_BOT_WILL_PLAY, {});
}

export function botWillPlay(){
	dispatch(Actions.GAME325_BOT_HAS_PLAYED, {});
}

export function displayGameState(){
	dispatch(Actions.GAME325_DISPLAY_GAME_STATE, {});
}

export function skipTurn(position){
	dispatchDelayAsync(timeConstants.SKIP_TURN_DELAY, {
		request	: Actions.GAME325_SKIP_TURN,
		success : Actions.GAME325_TURN_SKIPPED
	}, {position})
}

export function endTurn(){
	dispatch(Actions.GAME325_END_TURN, {});
}

export function showScores(){
	dispatchDelayAsync(timeConstants.SHOW_SCORE_DELAY, {
		request	: Actions.GAME325_WAIT_TO_SHOW_SCORE,
		success : Actions.GAME325_SHOW_SCORES
	}, {})
}

export function nextTurn(gameTurn){
	dispatch(Actions.GAME325_NOW_NEXT_TURN, {gameTurn});
}

export function togglePauseGame(){
	dispatch(Actions.GAME325_TOGGLE_PAUSE, {});	
}

export function moveHand(){
	dispatch(Actions.GAME325_MOVE_HAND, {});
}
export function moveHandSuccess(){
	dispatch(Actions.GAME325_MOVE_HAND_SUCCESS, {});
}
export function withdrawCardSuccess(card){
	dispatch(Actions.GAME325_WITHDRAW_CARD_SUCCESS, {card});
}
export function returnCardSuccess(card){
	dispatch(Actions.GAME325_RETURN_CARD_SUCCESS, {card});
}