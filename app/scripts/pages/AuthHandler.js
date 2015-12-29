import React, { PropTypes, Component } from 'react';
import { Route } from 'react-router';
// import TransitionGroup from  'react-addons-css-transition-group';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AuthStore from '../stores/AuthStore';
import SettingsStore from '../stores/SettingsStore';
import DocumentTitle from 'react-document-title';
import * as LoginActions from '../actions/LoginActions';
import connectToStores from '../utils/connectToStores';
import _ from 'underscore';
import classNames from 'classnames/dedupe';
import selectn from 'selectn';
import Loading from '../components/Loading';

// console.log(Route);
/**
 * Requests data from server for current props.
 */
function requestData(props) {
  const { params } = props;
}

/**
 * Retrieves state from stores for current props.
 */
function getState(props) {
  const User = AuthStore.get();
  let bckClassName = SettingsStore.getBckClassName()
  // const gameRoom = GameRoomStore.get();
  return {
    User,
    bckClassName
    // gameRoom
  }
}
@connectToStores([AuthStore], getState)
export default class AuthHandler extends Component{
  static propTypes = {
    children: PropTypes.object,
    User: PropTypes.object
  };
  static contextTypes = {
    history: PropTypes.object.isRequired,
    showLoader: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    if(!this.props.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  componentWillReceiveProps(nextProps){
    if(!nextProps.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  shouldComponentUpdate(c,v,b){
    return true;
    // console.log(122);
  }
  render() {
    let name = this.props.routes[this.props.routes.length-1].name;
    // console.log(this.props.children);
    // console.log(this.props.routes);
    return(
      <div>
        <div className={this.props.bckClassName}></div>
        <div className="loader-div" id="loader-div" style={{display:'none'}}>
            <Loading style={{'zoom':0.75}}/>
        </div>
        {/*<ReactCSSTransitionGroup component="div" transitionAppear={true} transitionName="page-transition" transitionAppearTimeout={500} transitionEnterTimeout={500} transitionLeaveTimeout={500}>*/}
          <div {...this.props} {...this.context} {...this.state}  key={name}>
            {this.props.children}
          </div> 
        {/*</ReactCSSTransitionGroup>*/}
        
      </div>
      )
    }
}
// AuthHandler.childContextTypes = contextTypes;
