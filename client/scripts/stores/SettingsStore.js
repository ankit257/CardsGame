import { Howler }  from 'howler';
import { register, waitFor } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';
import AuthStore from '../stores/AuthStore';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
import  { globalVars } from '../utils/CommonUtils'
import { saveItemInLocalStorage, getItemFromLocalStorage, deleteItemFromLocalStorage } from '../utils/LocalStorageUtils';

let history = createBrowserHistory()

const _defaultSettings = {
	activeColor: globalVars.colors[0],
	activeCardBack: globalVars.cardBack[0],
	volume: 0.8
}
let _currentSettings = {};



const SettingsStore = createStore({
	updateCurrentSettings(){
		let settings = this.getSettingsFromLocal();	
		if(settings.volume){
			_currentSettings = settings;
		}else{
			this.setDefaultSettings();
		}
		this.saveSettingsInLocalStorage();
	},
	setDefaultSettings(){
		_currentSettings = _defaultSettings;
	},
	getSettingsFromLocal(){
		let user = getItemFromLocalStorage('user');
		if(user && user.settings){
			return user.settings;
		}else{
			return {};
		}
		
	},
	getSettings(){
		if(!_currentSettings || !_currentSettings.activeColor || !_currentSettings.activeCardBack){
			this.updateCurrentSettings();
		}
		Howler.volume(_currentSettings.volume);
		return _currentSettings;
	},
	setSettings(settings){
		_currentSettings = settings;
		Howler.volume(settings.volume);
		this.saveSettingsInLocalStorage();
	},
	saveSettingsInLocalStorage(){
		let user = getItemFromLocalStorage('user');
		if(user && user.settings){
			saveItemInLocalStorage('user', user);
			user.settings = _currentSettings;
		}
	}
})
SettingsStore.dispatchToken = register(action => {
	const { type }  = action;
		switch(type){
			case 'LOGGED_IN':
			waitFor([AuthStore.dispatchToken]);
				SettingsStore.updateCurrentSettings();
				break;
			case 'CHANGE_SETTINGS':
				SettingsStore.setSettings(action.settings);
				break;
		}
		SettingsStore.emitChange();
});

export default SettingsStore;