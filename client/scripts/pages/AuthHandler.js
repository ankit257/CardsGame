import React, { PropTypes, Component } from 'react';
import AuthStore from '../stores/AuthStore';
import DocumentTitle from 'react-document-title';
import * as LoginActions from '../actions/LoginActions';
import connectToStores from '../utils/connectToStores';
import _ from 'underscore';
import classNames from 'classnames/dedupe';
import selectn from 'selectn';
import Loading from '../components/Loading';

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
  // const gameRoom = GameRoomStore.get();
  return {
    User,
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
    console.log(nextProps);
    if(!nextProps.User.profile){
      this.context.history.pushState(null, `/`, null);
    }
  }
  shouldComponentUpdate(c,v,b){
    return true;
    // console.log(122);
  }
  render() {
    return(
      <div>
      <div className="loader-div" id="loader-div" style={{display:'none'}}>
          <Loading style={{'zoom':0.75}}/>
      </div>
      <div {...this.props} {...this.context} {...this.state}>
      {this.props.children}
      </div>      
      </div>
      )
    }
}
// AuthHandler.childContextTypes = contextTypes;
