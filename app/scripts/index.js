import React from 'react';
import ReactDOM from 'react-dom'
import { createHistory, createHashHistory } from 'history';
import Root from './Root';


const rootEl = document.getElementById('root');
// Use hash location for Github Pages
// but switch to HTML5 history locally.
// const history = process.env.NODE_ENV === 'production' ?
//   createHashHistory() :
//   createHistory();

const history = new createHashHistory();

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	navigator.splashscreen.hide();
    navigator.analytics.setTrackingId('UA-72217136-1');
    navigator.analytics.enableAdvertisingIdCollection();
    let colorStyle = {
    	background: '#35d58e'
    }
    ReactDOM.render(<div style={colorStyle}><Root history={history} /></div>, rootEl);
}