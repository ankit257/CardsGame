import React, { Component, PropTypes, findDOMNode } from 'react';
import classNames from 'classnames/dedupe';
import _ from 'underscore';

export default class ErrorComponent extends Component {
  static propTypes = {
    show : PropTypes.boolean,
    msg : PropTypes.String
  }
  constructor(props){
    super(props);
    this.state = {
      animClass : 'fadeIn'
    }
  }
  componentWillUnmount(){
    var nextState = _.extend({}, this.state);
    this.setState(nextState);
  }
  render(){
    const { show, msg } = this.props;
    if(show){
      return (
        <div className={classNames(['control-group','error', this.state.animClass])}>
          <label><span className="embed-error error">{msg}</span></label>
        </div>
      )
    }else{
      return null;
    }
    
  }
}