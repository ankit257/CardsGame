'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var _temporalUndefined = {};
var gameCSSConstants = _temporalUndefined;
var gamePathConstants = _temporalUndefined;
var timeConstants = _temporalUndefined;
var gameVars = _temporalUndefined;

function _temporalAssertDefined(val, name, undef) { if (val === undef) { throw new ReferenceError(name + ' is not defined - temporal dead zone'); } return true; }

exports.gameCSSConstants = gameCSSConstants = {
	// gameWindow: { width: window.innerWidth, height: window.innerHeight, padding: 10 },
	gameBody: { width: 500, height: 350, padding: 2 },
	cardSize: { width: 50, height: 70 },
	player: { smallDim: 40, largeDim: 100, screenOut: 16 / 40, statusOffset: 4, scoreHeight: 4 },
	cardOffset: { screenOut: 0.1, small: 0.1, large: 0.666667, playedH: 0.5, playedV: 0.1, playedStackH: 2 / 50, playedStackV: 2 / 70 },
	zIndex: { DISTR: 50, PLAYED: 150, BEING_PLAYED: 300, DECK: 350, STATUS: 400, SCORE: 500 },
	score: { width: 100, height: 100, sep: 20 }
};
exports.gameCSSConstants = _temporalAssertDefined(gameCSSConstants, 'gameCSSConstants', _temporalUndefined) && gameCSSConstants;
exports.gamePathConstants = gamePathConstants = {
	CARD_BACK_IMG: 'assets/cards/cardback.svg',
	CARD_ASSETS: 'assets/cards/',
	IMG_ASSETS: 'assets/img/'
};
exports.gamePathConstants = _temporalAssertDefined(gamePathConstants, 'gamePathConstants', _temporalUndefined) && gamePathConstants;
exports.timeConstants = timeConstants = {
	TOTAL_DISTR_DELAY 	: 200*15 + 1200, 			// = SINGLE_DISTR_DELAY*52 + SINGLE_DISTR_ANIM
	TOTAL_PLAY_DELAY	: 2000 + 0,				// = PLAY_ANIM + PLAY_DELAY
	TOTAL_DECK_DELAY	: 100 + 200 + 500, 			// = DECK_ANIM + DECK_DELAY + 500
	SINGLE_DISTR_DELAY	: 200,
	SINGLE_DISTR_ANIM	: 1200,
	PLAY_ANIM			: 2000,
	PLAY_DELAY			: 0,
	DECK_DELAY			: 100,
	DECK_ANIM			: 200,
	REARRANGE_ANIM		: 100,
	SKIP_TURN_DELAY		: 1000,
	ROUND_END_WAIT		: 2000,
	BOT_THINKING_DELAY	: 100,
	SHOW_SCORE_DELAY	: 3000,
	TOLERANCE			: 10,
	DISPATCH_DELAY		: 100
};
exports.timeConstants = _temporalAssertDefined(timeConstants, 'timeConstants', _temporalUndefined) && timeConstants;
exports.gameVars = gameVars = {
	noOfPlayers: 3,
	maxPenalty: 13 * 4 + 12 * 4 + 11 * 4 + 10
};
exports.gameVars = _temporalAssertDefined(gameVars, 'gameVars', _temporalUndefined) && gameVars;