import React, { PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import connectToStores from '../utils/connectToStores';
import Game325Store from './game325/Game325Store';
import AuthStore from '../stores/AuthStore';
import * as Game325Actions from './game325/Game325Actions';

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
  var gameData = Game325Store.get();
  var profile = AuthStore.get();
  console.log(gameData);
  return {
    gameData,
    profile
  }
}

@connectToStores([Game325Store], getState)
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
    console.log(id);
    if(id){
      GameRoomActions.joinGameRoom(id, profile, 'game325');
      socket.on('invalid_room', function(){
        console.log('invalid_room')
      });
      socket.on('room_full', function(){
        console.log('room_full')
      });  
    }else{
      Game325Actions.startGame()
    }

    // requestData(this.props);
  }
  componentWillUnmount() {
    var id = this.props.params.id;
    var profile = this.props.profile;
    if(id){
      GameRoomActions.leaveGameRoom(id, 'game325')  
    }
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
