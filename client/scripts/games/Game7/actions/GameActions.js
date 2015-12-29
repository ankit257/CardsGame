import { dispatch, dispatchDelayAsync } from '../../../../scripts/AppDispatcher';
import Actions from '../constants/Actions';
import { timeConstants } from '../constants/SattiHelper'

export function initGame(){
	dispatch(Actions.GAME7_OFFLINE_INIT_GAME, {});
}

export function initStartGame() {
	dispatch(Actions.GAME7_OFFLINE_INIT_START_GAME, {});
}

export function initRound(){
	dispatch(Actions.GAME7_OFFLINE_INIT_ROUND, {});
}

export function initRoundSuccess(){
	dispatch(Actions.GAME7_OFFLINE_INIT_ROUND_SUCCESS, {});
}

export function distributeCards(){
	dispatch(Actions.GAME7_OFFLINE_DISTRIBUTE_CARDS, {});
}

export function distributionSuccess(){
	dispatch(Actions.GAME7_OFFLINE_DISTRIBUTE_CARDS_SUCCESS, {});
}

export function onlineDistributionSuccess(){
	dispatch(Actions.GAME7_ONLINE_DISTRIBUTE_CARDS_SUCCESS, {});
}

export function playCard(card, ifOnline){
	ifOnline ? dispatch(Actions.GAME7_ONLINE_PLAY_CARD, {card}) : dispatch(Actions.GAME7_OFFLINE_PLAY_CARD, {card});
}

export function hideScoreUpdated(ifOnline){
	ifOnline ? dispatch(Actions.GAME_7_ONLINE_HIDE_SCORE_UPDATED, {}) : dispatch(Actions.GAME_7_OFFLINE_HIDE_SCORE_UPDATED, {});
}

export function playCardSuccess(){
	dispatch(Actions.GAME7_OFFLINE_PLAY_CARD_SUCCESS, {});
}

export function playCardSuccessOnline(){
	dispatch(Actions.GAME7_ONLINE_PLAY_CARD_SUCCESS, {});
}

export function cardPlayed(){
	dispatch(Actions.GAME7_ONLINE_CARD_PLAYED, {});
}

export function playBot(){
	dispatch(Actions.GAME7_OFFLINE_BOT_WILL_PLAY, {});
}

export function botWillPlay(){
	dispatch(Actions.GAME7_OFFLINE_BOT_HAS_PLAYED, {});
}

export function displayGameState(){
	dispatch(Actions.GAME7_OFFLINE_DISPLAY_GAME_STATE, {});
}

export function skipTurn(position){
	dispatchDelayAsync(timeConstants.SKIP_TURN_DELAY, {
		request	: Actions.GAME7_OFFLINE_SKIP_TURN,
		success : Actions.GAME7_OFFLINE_TURN_SKIPPED
	}, {position})
}
export function skipMyTurn(id){
	dispatch(Actions.GAME_7_ONLINE_SKIP_TURN, {id});
}
export function onlineSkipTurn(){
	dispatchDelayAsync(timeConstants.SKIP_TURN_DELAY, {
		request	: Actions.GAME_7_ONLINE_TURN_SKIPPED,
		success : Actions.GAME_7_ONLINE_SKIP_TURN_DONE
	}, {})
}

export function endTurn(){
	dispatch(Actions.GAME7_OFFLINE_END_TURN, {});
}

export function showScores(){
	dispatchDelayAsync(timeConstants.SHOW_SCORE_DELAY, {
		request	: Actions.GAME7_OFFLINE_WAIT_TO_SHOW_SCORE,
		success : Actions.GAME7_OFFLINE_SHOW_SCORES
	}, {})
}

export function nextTurn(gameTurn){
	dispatch(Actions.GAME7_OFFLINE_NOW_NEXT_TURN, {gameTurn});
}

export function togglePauseGame(){
	dispatch(Actions.GAME7_OFFLINE_TOGGLE_PAUSE, {});	
}

export function gameStateReceived(clientData){
	dispatch(Actions.GAME7_ONLINE_GAME_STATE_RECEIVED, {clientData});
}

export function nowNextTurn(){
	dispatch(Actions.GAME7_ONLINE_NOW_NEXT_TURN, {});
}

export function playedWaitForServer()
{
	dispatch(Actions.GAME_7_ONLINE_PLAYED_WAIT_FOR_SERVER, {});
}

export function showScoresOnline(){
	dispatch(Actions.GAME_7_ONLINE_SHOW_SCORES, {});
}

export function onlineInitRoundSuccess(){
	dispatch(Actions.GAME_7_ONLINE_INIT_ROUND_SUCCESS, {});
}

export function playerChanged(players){
	dispatch(Actions.GAME_7_ONLINE_PLAYER_CHANGED, {players});
}

export function requestServerBot(){
	dispatch(Actions.GAME_7_ONLINE_REQUEST_SERVER_BOT, {});
}

export function requestDistribution(){
	dispatch(Actions.GAME7_ONLINE_ADMIN_REQUEST_DISTRIBUTION, {});
}

export function initRoundOnline(){
	dispatch(Actions.GAME_7_ONLINE_INIT_ROUND, {});	
}
export function refreshStore(data){
	dispatch(Actions.GAME_7_REFRESH_STORE, {data});		
}