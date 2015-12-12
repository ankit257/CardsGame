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
		Session.profile = profile;
		saveItemInLocalStorage('user', Session);
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
		deleteItemFromLocalStorage('user');
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