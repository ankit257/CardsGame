import React, { PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import Index from './components/Index'

export default class App {
  static propTypes = {
    children: PropTypes.object
  };

  render() {
    let title = this.props.route.title;
    return (
      <DocumentTitle title={title}>
        <div className='App'>
          <Index {...this.props} />
          {this.props.children}
        </div>
      </DocumentTitle>
    );
  }
}
