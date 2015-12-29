import { dispatch, dispatchAsync } from '../AppDispatcher';
import ActionTypes from '../constants/ActionTypes';
import AuthStore from '../stores/AuthStore';

import { postRequest } from '../utils/APIUtils';
import { saveItemInLocalStorage, getItemFromLocalStorage } from '../utils/LocalStorageUtils';

window.fbAsyncInit = function(){
			//initialize FB Object
			// FB.init({
			// 	appId : "440773049460625",
			// 	cookie : true,
			// 	xfbml : true,
			// 	version : "v2.1"
			// });
			facebookConnectPlugin.getLoginStatus(function (response) {
				if(response.status == 'connected'){
					facebookConnectPlugin.api('/me?fields=first_name,last_name,picture,email',[], function(data){
						dispatch(ActionTypes.LOGGED_IN_WITH_FB, {data});
				})
				}
			});
		}
export function saveUserInLocalStorage(username){
	var User = {
		'id': 'local',
		'first_name': username,
		'image': ''
	}
	dispatch(ActionTypes.LOGGED_IN, {User})
}
export function LoginWithFB(){
	facebookConnectPlugin.getLoginStatus(function (response) {
		console.log(response)
		if(response.status == 'connected'){
			statusChangeCallback(response);
		}else{
			facebookConnectPlugin.login(['user_friends, email'],function (response) {
				statusChangeCallback(response);
			});
		}
	});
}
export function checkLoginWithFB(){	
	facebookConnectPlugin.getLoginStatus(function (response) {
		if(response.status == 'connected'){
			statusChangeCallback(response)
		}
	});
}
export function checkLoginState() {
	console.log('checkLoginWithFB');
	facebookConnectPlugin.getLoginStatus(function (response){
		statusChangeCallback(response)
	});
}
export function statusChangeCallback(response){
	if(response.status == 'connected'){
		facebookConnectPlugin.api('/me?fields=first_name,last_name,picture,email',[], function(data){
			dispatch(ActionTypes.LOGGED_IN_WITH_FB, {data});
			addUpdateDb(data);
		})
	}
}
export function addUpdateDb (data) {
	console.log(data);
	var url = '/login';
	data['username'] = 'username'; //Fake It
	data['password'] = 'password'; //Fake It
	dispatchAsync(postRequest(url, data), {
	    request: ActionTypes.LOGIN_REQUEST,
	    success: ActionTypes.LOGGED_IN_WITH_FB,
	    failure: ActionTypes.LOGGED_IN_WITH_FB_ERROR
	}, { data });
}
export function LogOut() {
	var Session = AuthStore.get();
	if(Session.profile.id !== 'local'){
		facebookConnectPlugin.logout(function (response) {
			dispatch(ActionTypes.LOGGED_OUT, {response} );
		});	
	}else{
		dispatch(ActionTypes.LOGGED_OUT, {});
	}
}

export function applySettings(settings){
	dispatch(ActionTypes.CHANGE_SETTINGS, {settings});
}

export function fetchScoreFromDB(url, data){
	dispatchAsync(postRequest(url,data), {
		request: ActionTypes.GAMESCORE_FETCH_REQUEST,
		success: ActionTypes.GAMESCORE_FETCH_SUCCESS,
		error: ActionTypes.GAMESCORE_FETCH_ERROR
	},{data});
}

export function updateDBScore(url, data){
	dispatchAsync(postRequest(url,data), {
		request: ActionTypes.GAMESCORE_UPDATE_REQUEST,
		success: ActionTypes.GAMESCORE_UPDATE_SUCCESS,
		error: ActionTypes.GAMESCORE_UPDATE_ERROR
	},{data});
}
// //Promise Function to Get GeoLocation for coordinates
// var getGeoLocation = new Promise(function (resolve, reject) {
// 	navigator.geolocation.getCurrentPosition(function (position){
// 		resolve(position.coords);
// 	})
// })