import { dispatch, dispatchDelayAsync } from '../../../../scripts/AppDispatcher';
import Actions from '../constants/Actions';
import { timeConstants } from '../constants/SattiHelper'

export function initGame(){
	dispatch(Actions.GAME325_INIT_GAME, {});
}

export function initStartGame() {
	dispatch(Actions.GAME325_INIT_START_GAME, {});
}
export function selectDealer(){
	dispatch(Actions.GAME325_SELECT_DEALER, {});	
}
export function distributeOneCardEach(){
	dispatch(Actions.GAME325_DISTRIBUTE_ONE_CARD_EACH, {});	
}
export function selectDealerSuccess(){
	dispatch(Actions.GAME325_SELECT_DEALER_SUCCESS, {});
}
export function onlineSelectDealerSuccess(){
	dispatch(Actions.GAME325_ONLINE_SELECT_DEALER_SUCCESS, {});
}
export function distributingCardsZeroSuccess(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS_ZERO_SUCCESS, {});
}
export function startGame(){
	dispatch(Actions.GAME325_START_GAME, {});
}
export function onlineStartGame(){
	dispatch(Actions.GAME325_ONLINE_START_GAME, {});
}
export function initRound(){
	dispatch(Actions.GAME325_INIT_ROUND, {});
}
export function setTrump(trump){
	dispatch(Actions.GAME325_SET_TRUMP, {trump});
}
export function onlineDistributeCardsSecond(){
	dispatch(Actions.GAME325_ONLINE_DISTRIBUTE_CARDS_SECOND, {})
}
export function onlineSetTrump(trump){
	dispatch(Actions.GAME325_ONLINE_SET_TRUMP, {trump});
}
export function setTrumpOnline(){
	dispatch(Actions.GAME325_ONLINE_SET_TRUMP, {card});
}
export function requestServerBot(){
	dispatch(Actions.GAME325_ONLINE_REQUEST_SERVER_BOT, {});
}
export function initRoundSuccess(){
	dispatch(Actions.GAME325_INIT_ROUND_SUCCESS, {});
}
export function initRoundOnline(){
	dispatch(Actions.GAME325_ONLINE_INIT_ROUND, {});	
}
export function initRoundOnlineSuccess(){
	dispatch(Actions.GAME325_ONLINE_INIT_ROUND_SUCCESS, {});	
}
export function distributeCards(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS, {});
}
export function distributionFirstSuccess(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS_FIRST_SUCCESS, {});
}
export function onlineDistributionFirstSuccess(){
	dispatch(Actions.GAME325_ONLINE_DISTRIBUTE_CARDS_FIRST_SUCCESS, {});
}
export function distributionSecondSuccess(){
	dispatch(Actions.GAME325_DISTRIBUTE_CARDS_SECOND_SUCCESS, {});
}
export function onlineDistributionSecondSuccess(){
	dispatch(Actions.GAME325_ONLINE_DISTRIBUTE_CARDS_SECOND_SUCCESS, {});
}
export function playCard(card){
	dispatch(Actions.GAME325_PLAY_CARD, {card});
}
export function onlinePlayCard(card){
	dispatch(Actions.GAME325_ONLINE_PLAY_CARD, {card});
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
export function nowNextTurn(){
	dispatch(Actions.GAME325_ONLINE_NOW_NEXT_TURN, {});
}
export function togglePauseGame(){
	dispatch(Actions.GAME325_TOGGLE_PAUSE, {});	
}
export function distributingCardsZeroOnlineSuccess(){
	dispatch(Actions.GAME325_ONLINE_DISTRIBUTE_CARDS_ZERO_SUCCESS, {});
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
export function playCardOnline(){
	dispatch(Actions.GAME325_ONLINE_PLAY_CARD, {card});
}
export function cardPlayed(){
	dispatch(Actions.GAME325_ONLINE_CARD_PLAYED, {});
}
export function onlineMoveHand(){
	dispatch(Actions.GAME325_ONLINE_MOVE_HAND, {});	
}
export function onlineMoveHandSuccess(){
	dispatch(Actions.GAME325_ONLINE_MOVE_HAND_SUCCESS, {});	
}
export function returnCardOnline(){
	dispatch(Actions.GAME325_ONLINE_RETURN_CARD, {card});
}
export function withdrawCardOnline(){
	dispatch(Actions.GAME325_ONLINE_WITHDRAW_CARD, {card});
}
export function gameStateReceived(clientData){
	dispatch(Actions.GAME325_ONLINE_GAME_STATE_RECEIVED, {clientData});
}
export function  onlineWithdrawCardSuccess() {
	dispatch(Actions.GAME325_ONLINE_WITHDRAW_CARD_SUCCESS, {});
}
export function onlineReturnCardSuccess() {
	dispatch(Actions.GAME325_ONLINE_RETURN_CARD_SUCCESS, {});
}
export function onlinePlayCardSuccess(){
	dispatch(Actions.GAME325_ONLINE_PLAY_CARD_SUCCESS, {});
}
export function playedWaitForServer(eventName)
{	
	dispatch(Actions.GAME325_ONLINE_PLAYED_WAIT_FOR_SERVER, {eventName});
}
export function setTrumpWaitForServer()
{
	dispatch(Actions.GAME325_ONLINE_SET_TRUMP_WAIT_FOR_SERVER, {});
}
export function  withdrawnWaitForServer() {
	dispatch(Actions.GAME325_ONLINE_WITHDRWAWN_WAIT_FOR_SERVER, {});
}
export function returnedWaitForServer()
{
	dispatch(Actions.GAME325_ONLINE_RETURNED_WAIT_FOR_SERVER, {});
}
export function showScoresOnline(){
	dispatch(Actions.GAME325_ONLINE_SHOW_SCORES, {});
}

export function onlineInitRoundSuccess(){
	dispatch(Actions.GAME325_ONLINE_INIT_ROUND_SUCCESS, {});
}

export function playerChanged(players){
	dispatch(Actions.GAME325_ONLINE_PLAYER_CHANGED, {players});
}

export function requestServerBot(){
	dispatch(Actions.GAME325_ONLINE_REQUEST_SERVER_BOT, {});
}

export function requestDistribution(){
	dispatch(Actions.GAME325_ONLINE_ADMIN_REQUEST_DISTRIBUTION, {});
}

export function refreshStore(data){
	dispatch(Actions.GAME325_REFRESH_STORE, {data});		
}

export function onlineStateReceivedEmitChange(eventName){
	dispatch(Actions.GAME325_ONLINE_STATE_RECEIVED_EMIT_CHANGE, {eventName});
}
//Refresh Store