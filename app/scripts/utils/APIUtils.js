import { Schema, arrayOf, normalize } from 'normalizr';
import { camelizeKeys } from 'humps';
import 'core-js/es6/promise';
import 'whatwg-fetch';

/**
 * Extracts the next page URL from Github API response.
 */
function getNextPageUrl(response) {
  const link = response.headers.get('link');
  if (!link) {
    return null;
  }

  const nextLink = link.split(',').filter(s => s.indexOf('rel="next"') > -1)[0];
  if (!nextLink) {
    return null;
  }

  return nextLink.split(';')[0].slice(1, -1);
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by Stores, because each Store can just grab entities of its kind.

// Read more about Normalizr: https://github.com/gaearon/normalizr

const userSchema = new Schema('users', { idAttribute: 'login' });
const repoSchema = new Schema('repos', { idAttribute: 'fullName' });
repoSchema.define({
  owner: userSchema
});

// const API_ROOT = 'https://api.github.com/';
// const API_ROOT = 'http://localhost:4000/api';
const API_ROOT = 'http://playingcards.herokuapp.com/api';
/**
 * Fetches an API response and normalizes the result JSON according to schema.
 */
function fetchAndNormalize(url, schema) {
  if (url.indexOf(API_ROOT) === -1) {
    url = API_ROOT + url;
  }

  return fetch(url).then(response =>
    response.json().then(json => {
      const camelizedJson = camelizeKeys(json);
      const nextPageUrl = getNextPageUrl(response) || undefined;

      return {
        ...normalize(camelizedJson, schema),
        nextPageUrl
      };
    })
  );
}
function postFetch(url, data) {
  if (url.indexOf(API_ROOT) === -1) {
    url = API_ROOT + url;
  }
  fetch.withCredentials = true;
  return fetch(url, {
      method : 'POST',
      headers : {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body : JSON.stringify(data)
    }).then(response =>
    response.json().then(json => {
      // const camelizedJson = camelizeKeys(json);
      return json;
    })
  );
}

/**
* Post Login Data and Create Server side Session
*/
export function postRequest(url, data){
  return postFetch(url, data);
}
export function fetchUser(url) {
  return postFetch(url, userSchema);
}
export function joinGameRoomServer(url, data) {
  return postFetch(url, arrayOf(userSchema));
}

export function exitGameRoomServer(url) {
  return postFetch(url, repoSchema);
}

export function createGameRoomServer(url, data) {
  return postFetch(url, data);
}
export function getRoomServer(url){
  return postFetch(url, {})
}
