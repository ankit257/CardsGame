import { register } from '../AppDispatcher';
import 'whatwg-fetch';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { saveItemInLocalStorage, getItemFromLocalStorage, deleteItemFromLocalStorage } from '../utils/LocalStorageUtils';
let history = createBrowserHistory();




const Session = {
	profile: {},
	settings: {},
	games: {}
};

const AuthStore = createStore({
	update (user){
		Session.profile = user.profile;
		saveItemInLocalStorage('user', user);
	},
	updateProfile (profile){
		var user = getItemFromLocalStorage('user');
		Session.profile = profile;
		if(user == null){
			user = Session;
		}
		user.profile = profile;
		saveItemInLocalStorage('user', user);
	},
	get(){
		if(!Session.profile.id){					
			var user = getItemFromLocalStorage('user');
			if(user && user.profile){
				this.update(user);
			}
		}
		return Session;
	},
	del(){
		if(Session.profile.id == "local"){
			var user = getItemFromLocalStorage('user');
			delete user.profile;
			saveItemInLocalStorage('user', user);
		}else{
			deleteItemFromLocalStorage('user');
		}
		deleteItemFromLocalStorage('gameData');
		delete Session.profile;
		Session.profile = new Object();
	}
})
AuthStore.dispatchToken = register(action => {
	const { type }  = action;
		switch(type){
			case 'LOGGED_IN':
				AuthStore.updateProfile(action.User);
				AuthStore.emitChange();
				break;
			case 'LOGGED_IN_WITH_FB':
				AuthStore.updateProfile(action.data);
				AuthStore.emitChange();
				break;
			case 'LOGGED_OUT':
				AuthStore.del();
				AuthStore.emitChange();
				break;
			default:
				return true;
		}
		// AuthStore.emitChange();
});

export default AuthStore;