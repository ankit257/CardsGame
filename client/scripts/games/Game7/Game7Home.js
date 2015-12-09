import React, { Component, PropTypes } from 'react';
import GameInterface from '../GameInterface';
import GameRender from './components/GameRender';

export default class Game7 extends Component{
	constructor(props){
		super(props)
	}
	static contextTypes = {
		gamePause : PropTypes.bool
	}
	componentDidMount(){
		console.log(this.props);
	}
	render(){
		return (
			<GameInterface {...this.props}>
				<GameRender gamePause={this.context.gamePause} />
			</GameInterface>
		)
	}
}
