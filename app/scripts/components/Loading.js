import React, { PropTypes, Component } from 'react';

const style = {}
export default class Loading extends Component{
	render(){
	return(
		<div className="overlay loading" style={{alignItems:'center', backgroud: '#fff'}}>
            <div className="waiting-loader" style={{top:'20%', left:'51%'}}>
                <div className="cardDiv anime1"></div>
                <div className="cardDiv anime2"></div>
                <div className="cardDiv anime3"></div>
                <div className="cardDiv anime4"></div>
            </div>
            <h2 style={{position:'relative', top:'10%', textAlign:'center'}}>Loading...</h2>
        </div>
	)
	}
}