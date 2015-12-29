import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal'
import * as GameActions from '../actions/GameActions'
import { Howler } from "howler"

export default class ConfirmGameNavigation extends Component{
  
  static contextTypes = {
    history: PropTypes.object.isRequired,
  }
  state = {
    modalIsOpen: false
  }
  customStyles = {
      overlay : {
        position          : 'fixed',
        top               : 0,
        left              : 0,
        right             : 0,
        bottom            : 0,
        backgroundColor   : 'rgba(0, 0, 0, 0.6)',
        zIndex            : 1000
      },
      content : {
        position                   : 'absolute',
        top                        : 50,
        left                       : '0',
        bottom                     : 'auto',
        right                      : '0',
        width                      : '350',
        margin                     : '0 auto',
        // border                     : '1px solid #ccc',
        border                     : '1px solid #111',
        background                 : 'rgba(0,0,0,0.8)',
        color                      : '#eee',
        overflow                   : 'auto',
        WebkitOverflowScrolling    : 'touch',
        borderRadius               : '4px',
        outline                    : 'none',
        padding                    : '20px',
        zIndex                     : 1001,
        boxShadow                  : '1px 1px 4px #111'

      }
  }
  startNewGame(){
      this.props.changeGameInitModalState(false);
      Howler.unmute();
      GameActions.initGame();
  }
  loadPrevGame(){
      this.props.changeGameInitModalState(false);
      Howler.unmute();
      GameActions.initGameFromLocal(this.props.offlineGameData);
  }
  componentWillMount(){
    this.setState({
      modalIsOpen: this.props.gameInitModalIsOpen
    })
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      modalIsOpen: nextProps.gameInitModalIsOpen
    })
  }
  render() {
    let htwostyle ={
      fontSize: 18,
      lineHeight: '18px',
      margin: '10px auto'
    }, materialIconStyle={
      fontSize: 24,
      position: 'relative',
      top: -1,
      right: 4
    }, continueButtonStyle={
      margin: '5px 10px 0 0'
    }, newGameButtonStyle={
      margin: '5px 0 0 10px',
      color: '#eee'
    }
    return (
       <Modal
          isOpen={this.state.modalIsOpen}
          style={this.customStyles} key={1}>
          <h2 style={htwostyle} > Continue last game? </h2>
          <button onClick={this.loadPrevGame.bind(this)} className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" style={continueButtonStyle}>
            <i className='material-icons' style={materialIconStyle}>cached</i>
            Yes
          </button>
          <button onClick={this.startNewGame.bind(this)} className="mdl-button mdl-js-button mdl-button--raised" style={newGameButtonStyle}>
            <i className='material-icons' style={materialIconStyle}>redo</i>
            Start New Game
          </button>
        </Modal>
    );
  }
}
