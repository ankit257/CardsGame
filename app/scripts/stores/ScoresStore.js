import { register, waitFor } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';
import * as LoginActions from '../actions/LoginActions';
import AuthStore from '../stores/AuthStore';
import Game7StoreOffline from '../games/Game7/stores/GameStore'
import Game7StoreOnline from '../games/Game7/stores/GameStoreOnline'

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
import  { globalVars } from '../utils/CommonUtils'
import { saveItemInLocalStorage, getItemFromLocalStorage, deleteItemFromLocalStorage } from '../utils/LocalStorageUtils';

let history = createBrowserHistory()

const _defaultGameScores = {
	game7: {name: 'game7'},
	game325: {name: 'game325'},
	game29: {name: 'game29'},
	game10: {name: 'game10'}
}
let _gameScores = {};

const ScoresStore = createStore({
	fetchScoresFromServer(game){
		let user = getItemFromLocalStorage('user');
		if(user && user.profile && user.profile.id != 'local'){
			let fn, url, data
			switch(game){
				case 'game7':
					fn = LoginActions.updateDBScore;
					url = '/game7/scores';
					data = {score: this.getScores('game7')};
					break;
				default:
					fn = LoginActions.fetchScoreFromDB;
					url = '/scores';
					data = {};
					break;
			}
			this.requestServer(fn, url, data);
		}
	},
	requestServer(fn, url, data){
		setTimeout(function(){
			fn(url, data);
		}, 0);
	},
	updateCurrentScores(){
		let scores = this.getScoresFromLocal();	
		// console.log(scores);
		if(scores && scores.game7 && scores.game7.stats && scores.game7.stats.xp != undefined){
			_gameScores = scores;
		}else{
			this.setGlobalScores(_defaultGameScores);
		}
		this.saveScoresInLocalStorage();
	},
	setGlobalScores(scores){
		_gameScores = scores;
	},
	getScoresFromLocal(game){
		let user = getItemFromLocalStorage('user');
		if(user && user.games){
			if(game === undefined){
				return user.games;
			}else{
				return user.games[game];
			}
		}else{
			return {};
		}
	},
	getScores(game){
		if(!_gameScores || !_gameScores.game7 || !_gameScores.game7.stats){
			this.updateCurrentScores();
		}
		if(game){
			switch(game){
				case 'game7':
					if(!_gameScores.game7.stats || _gameScores.game7.stats.xp === undefined){
						this.setStandardScoreObj(game);
					}
					break;
			}
			return _gameScores[game];
		}else{
			return _gameScores;
		}
	},
	game7Update(xp){
		let game = this.getScores('game7');
		game.stats.roundsPlayed++;
		game.stats.xp+=xp;
		this.setScores(game, 'game7');
	},
	setScores(score, game){
		if(game){
			_gameScores[game] = score;
			_gameScores[game]['name'] = game;
			this.saveScoresInLocalStorage();
		}
	},
	saveScoresInLocalStorage(){
		let user = getItemFromLocalStorage('user');
		if(user && user.games){
			user.games = _gameScores;
			saveItemInLocalStorage('user', user);
		}
	},
	setStandardScoreObj(game){
		switch(game){
			case 'game7':
				let stats = {
					roundsPlayed: 0,
					xp : 0
				}
				break;
		}
		_gameScores[game]['stats'] = stats;
	}
})
register(action => {
	const { type }  = action;
		switch(type){
			case 'LOGGED_IN':
			waitFor([AuthStore.dispatchToken, SettingsStore.dispatchToken]);
				ScoresStore.updateCurrentScores();
				break;
			case 'LOGGED_IN_WITH_FB':
				waitFor([AuthStore.dispatchToken]);
				ScoresStore.fetchScoresFromServer('game7');
				break;
			case 'GAME_7_ONLINE_SHOW_SCORES':
			waitFor([Game7StoreOnline.dispatchToken]);
				var xp = Game7StoreOnline.getXP();
				ScoresStore.game7Update(xp);
				break;
			case 'GAME7_OFFLINE_SHOW_SCORES':
			waitFor([Game7StoreOffline.dispatchToken]);
				var xp = Game7StoreOffline.getXP();
				ScoresStore.game7Update(xp);
				break;
			case 'GAMESCORE_FETCH_SUCCESS':
				console.log(action);
				break;
			case 'GAMESCORE_UPDATE_SUCCESS':
				ScoresStore.setGlobalScores(action.response.score);
				ScoresStore.saveScoresInLocalStorage();
				break;
			case 'FETCH_SCORES_FROM_SERVER':
				ScoresStore.fetchScoresFromServer(action.data);
				break;
		}
		ScoresStore.emitChange();
});

export default ScoresStore;