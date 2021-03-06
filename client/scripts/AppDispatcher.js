import { Dispatcher } from 'flux';

const flux = new Dispatcher();

export function delay(ms) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, ms); // (A)
    });
}

export function register(callback) {
  return flux.register(callback);
}

export function waitFor(ids) {
  return flux.waitFor(ids);
}

// Some Flux examples have methods like `handleViewAction`
// or `handleServerAction` here. They are only useful if you
// want to have extra pre-processing or logging for such actions,
// but I found no need for them.

/**
 * Dispatches a single action.
 */
var oldTime = Date.now();
export function dispatch(type, action = {}) {
  if (!type) {
    throw new Error('You forgot to specify type.');
  }

  // In production, thanks to DefinePlugin in webpack.config.production.js,
  // this comparison will turn `false`, and UglifyJS will cut logging out
  // as part of dead code elimination.
  if (process.env.NODE_ENV !== 'production') {
    // Logging all actions is useful for figuring out mistakes in code.
    // All data that flows into our application comes in form of actions.
    // Actions are just plain JavaScript objects describing “what happened”.
    // Think of them as newspapers.
    var newTime = Date.now();
    var timeDiff = newTime - oldTime;
    if (action.error) {
      console.error(type, action);
    } else {
      console.log(type, action, timeDiff);
    }
    oldTime = newTime;
  }
  delay(0).then(function(){
    flux.dispatch({ type, ...action });
  })
}

/**
 * Dispatches three actions for an async operation represented by promise.
 */
export function dispatchAsync(promise, types, action = {}) {
  const { request, success, failure } = types;

  dispatch(request, action);
  promise.then(
    response => dispatch(success, { ...action, response }),
    error => dispatch(failure, { ...action, error })
  );
}
/**
 * Dispatches two actions for an async delay operation
 */
export function dispatchDelayAsync(ms, types, action = {}) {
  const { request, success } = types;

  dispatch(request, action);
  delay(ms).then(
    response => dispatch(success, { ...action, response})
    );
}
