import React from 'react';
import ReactDOM from 'react-dom'
require('file?name=[name].[ext]!../index.html');
import { createHistory, createHashHistory } from 'history';
import Root from './Root';

const rootEl = document.getElementById('root');
// Use hash location for Github Pages
// but switch to HTML5 history locally.
const history = process.env.NODE_ENV === 'production' ?
  createHashHistory() :
  createHistory();

ReactDOM.render(<div><Root history={history} /></div>, rootEl);
