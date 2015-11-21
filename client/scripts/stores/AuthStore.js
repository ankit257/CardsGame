import { register } from '../AppDispatcher';
import { createStore, mergeIntoBag, isInBag } from '../utils/StoreUtils';
import ActionTypes from '../constants/ActionTypes';

import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
let history = createBrowserHistory()



const Session = {};

const AuthStore = createStore({
	update (profile){
		Session.profile = profile;
	},
	get(){
		return Session;
	},
	del(){
		delete Session.profile;
	}
})
//AuthStore.dispathToken =
register(action => {
	const { type }  = action;
		switch(type){
			case 'LOGGED_IN':
				AuthStore.update(action.User);
				AuthStore.emitChange();
				break;
			case 'LOGGED_IN_WITH_FB':
				AuthStore.update(action.data);
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