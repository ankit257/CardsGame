import React, { Component } from 'react';


export default class RoomTypeSelector extends Component{
	state = {
		optShown: false
	}
	toggleOptsShow(){
		this.setState({
			optShown: !this.state.optShown
		})
	}
	clicked(e){
		this.setState({
			optShown: false
		})
		this.props.clicked(e);
	}
	render(){
		let showPublicRooms = this.props.showPublicRooms, optsStyle, selectedStyle;
		let roomtype = showPublicRooms ? 'Public' : 'Private';
		let icon = showPublicRooms ? 'visibility' : 'visibility_off';
		if(this.state.optShown){
			optsStyle = {display: 'block'};
			selectedStyle = {display: 'none'};
		}else{
			optsStyle = {display: 'none'};
			selectedStyle = {display: 'block'};
		}
		return(
			<div className="radio-btn-container radio-as-dropdown">
              <div className="radio-container-name">
              	Game room type:
              </div>
              <div className="radio-container-selected" onClick={this.toggleOptsShow.bind(this)} style={selectedStyle}> 
              	<section className="radio-container">
              		<i className="material-icons md-18">{icon}</i>{roomtype} 
              	</section>
              </div>
              <div className="radio-container-opts" style={optsStyle}>
	              <section className="radio-container">
	                <label className="mdl-radio mdl-js-radio" htmlFor="option-1">
	                  <input type="radio" id="option-1" className="mdl-radio__button" name="options" value="public" onChange={this.clicked.bind(this)}></input>
	                  <span className="mdl-radio__label">
	                  <i className="material-icons md-18">visibility</i>
	                  Public
	                  </span>
	                </label>
	              </section>
	              <section className="radio-container">
	                <label className="mdl-radio mdl-js-radio" htmlFor="option-2">
	                  <input type="radio" id="option-2" className="mdl-radio__button" name="options" value="private" onChange={this.clicked.bind(this)}></input>
	                  <span className="mdl-radio__label">
	                  <i className="material-icons md-18">visibility_off</i>
	                  Private
	                  </span>
	                </label>
	              </section>
              </div>
            </div>
			)
	}
}