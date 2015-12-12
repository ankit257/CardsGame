import React, { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Exports a higher-order component that connects the component to stores.
 * This higher-order component is most easily used as an ES7 decorator.
 * Decorators are just a syntax sugar over wrapping class in a function call.
 *
 * Read more about higher-order components: https://goo.gl/qKYcHa
 * Read more about decorators: https://github.com/wycats/javascript-decorators
 */
export default function connectToGameStores(stores, getState) {
  return function (DecoratedComponent) {
    const displayName =
      DecoratedComponent.displayName ||
      DecoratedComponent.name ||
      'Component';

    return class StoreConnector extends Component {
      static displayName = `connectToGameStores(${displayName})`;

      static contextTypes = {
        ifOnline: PropTypes.bool
      }

      constructor(props) {
        super(props);
        this.handleStoresChanged = this.handleStoresChanged.bind(this);

        this.state = getState(props);
      }

      componentWillMount() {
        stores.forEach(store =>{
                  if(store.type){
                    if(store.type=='online' && this.context.ifOnline){
                      store.addChangeListener(this.handleStoresChanged)  
                    }else if(store.type=='offline' && !this.context.ifOnline){
                      store.addChangeListener(this.handleStoresChanged)
                    }
                  }else{
                    store.addChangeListener(this.handleStoresChanged)
                  }
                }
        );
      }

      componentWillReceiveProps(nextProps) {
        if (!shallowEqual(nextProps, this.props)) {
          this.setState(getState(nextProps, this.context.ifOnline));
        }
      }

      componentWillUnmount() {
        stores.forEach(store =>{
                            store.removeChangeListener(this.handleStoresChanged)
                          }
        );
      }

      handleStoresChanged() {
        this.setState(getState(this.props, this.context.ifOnline));
      }

      render() {
        return <DecoratedComponent {...this.props} {...this.state} />;
      }
    };
  };
}
