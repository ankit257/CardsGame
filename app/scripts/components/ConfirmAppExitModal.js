import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal'
import { Howler } from "howler"

export default class ConfirmAppExitModal extends Component{
  
  static contextTypes = {
    history: PropTypes.object.isRequired
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
  exitApp(){
    this.props.changeAppExitModalState(false);
    navigator.app.exitApp();
  }
  doNothing(){
    this.props.changeAppExitModalState(false);
  }
  componentWillReceiveProps(nextProps){
    this.setState({
      modalIsOpen: nextProps.appExitModalIsOpen
    })
  }
  render() {
    let continueButtonStyle={
      fontSize: 24,
      position: 'relative',
      top: 3,
      right: 4
    };
    let arrowLeftStyle = {
      position: 'relative',
      left: 0,
      top: 8,
      fontSize: 24
    }, pstyle ={
      margin: 0
    },divstyle={
      margin: '0 0 10px 0'
    }
    if(this.context.ifOnline){
      this.customStyles.content.width = '80%'
    }
    return (
       <Modal
          isOpen={this.state.modalIsOpen}
          style={this.customStyles} key={1}>
           <div style={divstyle}>
            <p style={pstyle}>Exit Game?</p>
          </div>
          <div className = "game-init-button-holder">
            <a onClick={this.doNothing.bind(this)} className="button yellow-button small-button">
              No
            </a>
            <a onClick={this.exitApp.bind(this)} className="button yellow-button small-button">
              Exit Game
            </a>
          </div>
        </Modal>
    );
  }
}
