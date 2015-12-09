import { register, waitFor } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';
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
	updateCurrentScores(){
		let scores = this.getScoresFromLocal();	
		// console.log(scores);
		if(scores && scores.game7 && scores.game7.stats && scores.game7.stats.xp){
			_gameScores = scores;
		}else{
			this.setDefaultScores();
		}
		this.saveScoresInLocalStorage();
	},
	setDefaultScores(){
		_gameScores = _defaultGameScores;
	},
	getScoresFromLocal(){
		let user = getItemFromLocalStorage('user');
		if(user && user.games){
			return user.games;
		}else{
			return {};
		}
	},
	getScores(game){
		if(!_gameScores || !_gameScores.game7 || !_gameScores.game7.xp){
			this.updateCurrentScores();
		}
		if(game){
			switch(game){
				case 'game7':
					if(!_gameScores.game7.stats || !_gameScores.game7.stats.xp){
						this.setStandardScoreObj(game);
					}
					break;
			}
			return _gameScores[game];
		}else{
			return _gameScores
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
		}
		ScoresStore.emitChange();
});

export default ScoresStore;