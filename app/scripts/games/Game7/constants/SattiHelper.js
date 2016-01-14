export var gameCSSConstants = {
	gameWindow 			: { width : window.innerWidth, height :window.innerHeight, padding : 10 },
	gameBody 			: { width : 500, height : 350, padding : 2, wbyhratio: 500/350 },
	// gameBody			: {width: window.innerWidth, height: window.innerHeight, padding: 2},
	cardSize 			: {	width : 50, height : 70 },
	player 				: { smallDim: 40, largeDim: 100, screenOut: 16/40, statusOffset: 4, scoreHeight:4 },
	cardOffset			: { screenOut: 0.1, small : 0.1, large: 0.8, playedH: 0.5, playedV: 0.1, playedStackH: 2/50 ,playedStackV: 2/70 },	
	deckCSS 			: {	x : 0, y : (window.innerHeight-70) },
	zIndex		 		: { DISTR: 50,  PLAYED: 150, BEING_PLAYED: 300, DECK: 350, STATUS: 400, SCORE: 500 },
	score 				: { width: 100, height: 100, sep: 20 }
}
export const gamePathConstants = {
	CARD_BACK_IMG		: ['assets/cards/cardback.png','assets/cards/cardbackorange.svg'] ,
	CARD_ASSETS 		: 'assets/cards/',
	IMG_ASSETS  		: 'assets/img/',
	SVG_ASSETS			: 'assets/images/svg/'
}
export const timeConstants = {
	TOTAL_DISTR_DELAY 	: 50*52 + 1000, 			// = SINGLE_DISTR_DELAY*52 + SINGLE_DISTR_ANIM
	TOTAL_PLAY_DELAY	: 500 + 0,				// = PLAY_ANIM + PLAY_DELAY
	TOTAL_DECK_DELAY	: 100 + 200 + 500, 			// = DECK_ANIM + DECK_DELAY + 500
	SINGLE_DISTR_DELAY	: 50,
	SINGLE_DISTR_ANIM	: 1000,
	PLAY_ANIM			: 500,
	PLAY_DELAY			: 0,
	DECK_DELAY			: 100,
	DECK_ANIM			: 200,
	REARRANGE_ANIM		: 100,
	SKIP_TURN_DELAY		: 1000,
	ROUND_END_WAIT		: 1000,
	BOT_THINKING_DELAY	: 100,
	SHOW_SCORE_DELAY	: 3000,
	TOLERANCE			: 10,
	DISPATCH_DELAY		: 0
}
export const gameVars = {
	noOfPlayers			: 4,
	maxPenalty			: 13*4 + 12*4 + 11*4 + 10
}

export function getSavedScoreObj() {
	return stats = {
		roundsPlayed: 0,
		xp: 0
	}
}