import React, { PropTypes, Component } from 'react';
import selectn from 'selectn';
import classNames from 'classnames/dedupe';




export default class NavBarComponent extends Component{
	constructor(props){
		super(props);
	}
	static contextTypes = {
	    history: PropTypes.object.isRequired,
		showLoader : PropTypes.func.isRequired
	}
	componentDidUpdate(){
	    setTimeout(function(){
	      componentHandler.upgradeAllRegistered();
	    },20);
	  }
	  componentDidMount(){
	    setTimeout(function(){
	      componentHandler.upgradeAllRegistered();
	    },20);
	  }
	handleGoToSettings(){
	    this.context.history.pushState(null, `/settings`, null);
	}
	handleLogOut(){
	    LoginActions.LogOut();
	}
	render(){
		const { User } = this.props;
		let ulClassNames = ['mdl-menu', 'mdl-menu--bottom-right', 'mdl-js-menu'];
		let btnClassNames = ['mdl-button', 'mdl-js-button', 'mdl-button--icon'];
		let liItemClassNames = ['mdl-menu__item'];
		let imageUrl = selectn('profile.picture.data.url', User);
		let { heading } = this.props;
		if(!heading) heading = {icon: '', text: ''};
		return(
			<div className='face-div'>
				<div className="nav-bar-left">
					<i className="material-icons">{heading.icon}</i>
					<span className="heading">{heading.text}</span>
				</div>
	            <div className="nav-bar-right">
	            	<img className="md-48" height="32" width="32" src={ imageUrl }/>
	            	<button id="demo-menu-lower-right" className={classNames(btnClassNames)}>
	              		<i className="material-icons">more_vert</i>
	            	</button>
	            </div>
	            <ul className="" htmlFor="demo-menu-lower-right" className={classNames(ulClassNames)}>
	              <li className={classNames(liItemClassNames)} onClick={this.handleGoToSettings.bind(this)}>
	              	<i className="material-icons md-18">settings</i>
	              	Settings
	              </li>
	              <li className={classNames(liItemClassNames)} onClick={this.handleLogOut.bind(this)}>Log Out</li>
	            </ul>
	            <hr/>
        	</div>
			)
	}
}