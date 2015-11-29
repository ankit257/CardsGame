import React, { Component, PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import GameRoomStore from '../stores/GameRoomStore';
import AuthStore from '../stores/AuthStore';
import * as GameRoomActions from '../actions/GameRoomActions';

import Game7Render from './Game7/components/GameRender'

function parseLogin(params) {
  return params.login;
}

/**
 * Requests data from server for current props.
 */
function requestData(props) {
  const { params } = props;
  console.log(params);
  const userLogin = parseLogin(params);

  UserActionCreators.requestUser(userLogin, ['name', 'avatarUrl']);
  RepoActionCreators.requestStarredReposPage(userLogin, true);
}

/**
 * Retrieves state from stores for current props.
 */
function getState(props) {
  var gameData = GameRoomStore.get();
  var profile = AuthStore.get();
  // console.log(gameData);
  return {
    gameData,
    profile
  }
}

@connectToStores([GameRoomStore], getState)
export default class GameInterface extends Component{
  static propTypes = {
    // Injected by React Router:
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired,

    // Injected by @connectToStores:
    // user: PropTypes.object,
    // starred: PropTypes.arrayOf(PropTypes.object).isRequired,
    // starredOwners: PropTypes.arrayOf(PropTypes.object).isRequired,
    // isLoadingStarred: PropTypes.bool.isRequired,
    // isLastPageOfStarred: PropTypes.bool.isRequired
  };
  // static childContextTypes = {
  //   color: PropTypes.string
  // }
  // getChildContext() {
  //   return {color: "purple"};
  // }
  state = {
    gamePause : false
  }
  constructor(props) {
    super(props);
    // this.pauseToggle = this.pauseToggle.bind(this);
    // this.renderStarredRepos = this.renderStarredRepos.bind(this);
    // this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }
  pauseToggle() {
    GameRoomActions.togglePauseGame();
    // console.log(this.state);
    // this.setState({
    //   gamePause: !this.state.gamePause
    // })
  }
  componentWillMount() {
    var id = this.props.params.id;
    var profile = this.props.profile;
    // GameRoomActions.joinGameRoom(id, profile)
    // requestData(this.props);
  }
  componentWillUnmount() {
    // var id = this.props.params.id;
    // var profile = this.props.profile;
    // GameRoomActions.leaveGameRoom(id, profile)
  }
  componentWillReceiveProps(nextProps) {
    // if (parseLogin(nextProps.params) !== parseLogin(this.props.params)) {
    //   requestData(nextProps);
    // }
  }

  render() {
    return (
      <div>
        <div className={'bkg-filter'}></div>
        <Game7Render/>
        <button onClick={this.pauseToggle.bind(this)} className = "distribute-button"> P </button>
      </div>
    );
  }
}
