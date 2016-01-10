import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal'
import { Howler } from "howler"

export default class ConfirmGameExitModal extends Component{
  
  static contextTypes = {
    history: PropTypes.object.isRequired,
    ifOnline: PropTypes.bool
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
        width                      : '50%',
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
  shouldNavigateAway(answer){
    if(answer){ 
      this.context.history.go(-1);
    }else{
      Howler.unmute();
      this.props.changeGameExitModalState(false);
    }
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      modalIsOpen: nextProps.gameExitModalIsOpen
    })
  }
  getContent(){
    let arrowLeftStyle = {
      position: 'relative',
      left: 0,
      top: 6,
      fontSize: 24
    }, pstyle ={
      margin: 0
    },divstyle={
      margin: '0 0 10px 0'
    }
    if(this.context.ifOnline){
      return(
        <div style={divstyle}>
          <p style={pstyle}>Tap back <i className='material-icons' style={arrowLeftStyle}>keyboard_arrow_left</i> once more to exit game room.</p>
          <p style={pstyle}>You can later join the same game as a spectator and start playing from a new round.</p>
        </div>
        )
    }else{
      return(
        <div style={divstyle}>
          {/*<p style={pstyle}>Game Paused. </p>*/}
          <p style={pstyle}>Tap back <i className='material-icons' style={arrowLeftStyle}>keyboard_arrow_left</i> once more to exit game.</p>
        </div>
        )
    }
  }
  render() {
    let continueButtonStyle={
      fontSize: 24,
      position: 'relative',
      top: 3,
      right: 4
    };
    if(this.context.ifOnline){
      this.customStyles.content.width = '80%'
    }
    let message = this.getContent();
    return (
       <Modal
          isOpen={this.state.modalIsOpen}
          style={this.customStyles} key={1}>
          {message}
          <a onClick={this.shouldNavigateAway.bind(this,false)} className="button yellow-button small-button">
            <i className='material-icons' style={continueButtonStyle}>videogame_asset</i>
            Continue Playing
          </a>
        </Modal>
    );
  }
}
