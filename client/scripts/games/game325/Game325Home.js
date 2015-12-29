import React, { Component, PropTypes } from 'react';
import GameInterface from '../GameInterface';
import Game325Render from './components/Game325Render';

export default class Game325 extends Component{
	constructor(props){
		super(props)
	}
	static contextTypes = {
		gamePause : PropTypes.bool
	}
	componentDidMount(){
	}
	render(){
		return (
			<GameInterface {...this.props}>
				<Game325Render gamePause={this.context.gamePause} />
			</GameInterface>
		)
	}
}
