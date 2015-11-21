import React, { PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import GameRoomStore from '../stores/GameRoomStore';
import AuthStore from '../stores/AuthStore';
import * as GameRoomActions from '../actions/GameRoomActions';

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
  console.log(gameData);
  return {
    gameData,
    profile
  }
}

@connectToStores([GameRoomStore], getState)
export default class Game325 {
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

  constructor() {
    // this.renderStarredRepos = this.renderStarredRepos.bind(this);
    // this.handleLoadMoreClick = this.handleLoadMoreClick.bind(this);
  }

  componentWillMount() {
    var id = this.props.params.id;
    var profile = this.props.profile;
    GameRoomActions.joinGameRoom(id, profile)
    // requestData(this.props);
  }
  componentWillMount() {
    var id = this.props.params.id;
    var profile = this.props.profile;
    GameRoomActions.leaveGameRoom(id, profile)
  }
  componentWillReceiveProps(nextProps) {
    // if (parseLogin(nextProps.params) !== parseLogin(this.props.params)) {
    //   requestData(nextProps);
    // }
  }

  render() {

    return (
      <div>3-2-5</div>
    );
  }
}
