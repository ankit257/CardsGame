import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom'
import shouldPureComponentUpdate from 'react-pure-render/function';
import _ from 'underscore';
import classnames from 'classnames/dedupe';

import * as LoginActions from '../actions/LoginActions';
import AuthStore from '../stores/AuthStore';
import Loading from './Loading';
import ErrorComponent from './Error';

import connectToStores from '../utils/connectToStores';


function checkValidUsername(name){
  var usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(name);
}
function getState(props){
  var User = AuthStore.get();
  // console.log(User)
  return {
    User
  }
}

@connectToStores([AuthStore], getState)
export default class Index extends Component {
  static propTypes = {
    params: PropTypes.shape({
      login: PropTypes.string,
      name: PropTypes.string
    }),
    asd : PropTypes.string
  }
  static contextTypes = {
    history: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleGoClick = this.handleGoClick.bind(this);
    this.getInputValue = this.getInputValue.bind(this);
    // State that depends on props is often an anti-pattern, but in our case
    // that's what we need to we can update the input both in response to route
    // change and in response to user typing.
    this.state = {
      errors : {
        username : {'show' : false}
      }
    };
  }
  componentWillMount(){
    if(this.props.User.profile && this.props.User.profile.id){
      this.context.history.pushState(null, `/games`, null);
    }
  }
  // shouldComponentUpdate = shouldPureComponentUpdate;
  componentWillReceiveProps(nextProps) {
    if(nextProps.User.profile.id){
      this.context.history.pushState(null, `/games`, null);
    }
    // this.setState({
    //   loginOrRepo: parseFullName(nextProps.params)
    // });
  }
  validateInput(e){
    // console.log(e.keyCode);
    // this.context.history.pushState(null, `/games`)
    var name = ReactDOM.findDOMNode(this.refs.username).value;
    var newState = _.extend({}, this.state);
    if(!checkValidUsername(name)){
      newState.errors.username = { 'show' : true, 'text' : 'Okay. We dont know how to call that.'}
    }
    else if(name.length < 3){
      newState.errors.username = { 'show' : true, 'text' : 'Damn. Its too small.'}
    }else{
      newState.errors.username = { 'show' : false, 'text' : ''}
      if(e.keyCode == 13){
        document.getElementById('register').click();
        e.stopPropagation();
      }
    }
    this.setState(newState);
  }
  register(e){
    var name = ReactDOM.findDOMNode(this.refs.username).value;
    if(name.length==0){
      this.validateInput(e);
    }
    var stopPropagation = false;
    for(var key in this.state.errors){
      if (this.state.errors[key].show) {
        stopPropagation = true;
      }
    }
    if(!stopPropagation){
      LoginActions.saveUserInLocalStorage(name);
      e.preventDefault();
    }else{
      e.preventDefault();
    }
  }
  loginWithFb(e){
    LoginActions.LoginWithFB(); 
  }

  render() {
    var rippleBtnClassNames = ['mdl-button', 'mdl-js-button', 'mdl-button--raised', 'mdl-js-ripple-effect', 'mdl-button--accent'];
    let buttonHolderStyle = {textAlign: 'center'};
    return (
      <div className={'auth-center'}>
        <img className="cityscape" src="assets/images/cityscape1.png"/>
        <div className={'auth-inner'}>
          <form className={'form auth-form'}>
            <div className={'control-group'}>
              <label htmlFor="username">
                <span>What should everyone call you?</span>
              </label>
                <input type="text" id="register-username" ref="username" autoComplete="off" onKeyDown={this.validateInput.bind(this)}/>
                <ErrorComponent msg={this.state.errors.username.text} show={this.state.errors.username.show}></ErrorComponent>
            </div>
            <div className={'control-group'} style={buttonHolderStyle}>
              <a id="register" className={'button blue-button'} onClick={this.register.bind(this)}><span>CONTINUE</span></a>
            </div>
            <footer>
              <label>
                <span>or Login with <a href="#" onClick={this.loginWithFb.bind(this)}>Facebook</a></span>
              </label>
            </footer>
          </form>
        </div>
      </div>
    );
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.handleGoClick();
    }
  }

  handleOnChange() {
    // Update the internal state because we are using a controlled input.
    // This way we can update it *both* in response to user input *and*
    // in response to navigation in `componentWillReceiveProps`.
    this.setState({
      loginOrRepo: this.getInputValue()
    });
  }

  handleGoClick() {
    this.context.history.pushState(null, `/${this.getInputValue()}`);
  }

  getInputValue() {
    return ReactDOM.findDOMNode(this.refs.loginOrRepo).value;
  }
}