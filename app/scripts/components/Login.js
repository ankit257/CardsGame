import React, { Component, PropTypes, findDomNode } from 'react';
import { Link } from 'react-router';
import  * as LoginActionCreators from '../actions/LoginActionCreators';
import AuthStore from '../stores/AuthStore';
import connectToStores from '../utils/connectToStores';
//  mport * as LoginActions from './actions/LoginActions';
// var React = require('React');
// import * as Facebook from 'react-facebook-login';

// const default_logged_in = null;

//Utility fn to check if user is logged in or not
//Utility fn to check if register new user

/**
 * Retrieves state from stores for current props.
 */
function getState(props) {
  const Session = AuthStore.get();

  return {
    	Session,
	};
}
@connectToStores([AuthStore], getState)
export default class Login extends Component{
	static propTypes = {
		Session: PropTypes.object,
	}
	static contextTypes = {
		router : PropTypes.func.isRequired
	}
	constructor(props){
		super(props);
		this.state = {
			isLoggedIn : false
		}
	}
	componentWillMount(){
		console.log(this.props);
		getState(this.props)
	}
	componentWillRecieveProps(nextProps){
		console.log(this.props);
		getState(nextProps)
	}
	handleClick(){
		LoginActionCreators.LoginWithFB();
	}
	handleLogout(){
		LoginActionCreators.LogOut();
	}
	render(){
		return(
			<div className="login-modal">
				<div onClick={this.handleClick.bind(this)}>Login with Facebook</div>
				<div onClick={this.handleLogout.bind(this)}>Logout</div>
			</div>
		)
	}
}