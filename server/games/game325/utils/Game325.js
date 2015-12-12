'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Cards325 = require('./Cards325');

var _Cards3252 = _interopRequireDefault(_Cards325);

var _constantsSattiHelper = require('../constants/SattiHelper');

var _utilsPlayer325 = require('../utils/Player325');

var _utilsPlayer3252 = _interopRequireDefault(_utilsPlayer325);

var _utilsBot325 = require('../utils/Bot325');

var _utilsBot3252 = _interopRequireDefault(_utilsBot325);

var _utilsScore325 = require('../utils/Score325');

var _utilsScore3252 = _interopRequireDefault(_utilsScore325);

var _actionsGameActions = require('../actions/GameActions');

var GameActions = _interopRequireWildcard(_actionsGameActions);

var cards325 = new _Cards3252['default']();

var Game325 = (function () {
	function Game325() {
		_classCallCheck(this, Game325);

		Object.assign(this, {
			players: [],
			deck: [],
			distributionArray: [5, 5],
			maxPlayers : 3,
			distributionIndex: 0,
			distributionState: 0,
			trump: null,
			suitTrump: null,
			turnSuit: null,
			gameTurn: 0,
			gameRound: 0,
			state: 'CONSTRUCTED',
			botState: 'UNINITIATED',
			cardPlayed: {},
			playedCards: {},
			playableCards: [],
			activePlayerPos: null,
			otherPlayerId: 0,
			pauseState: false,
			dealerId: null,
			playerPosArray: [0, 1, 2]
		});
	}

	_createClass(Game325, [{
		key: 'initDeck',
		value: function initDeck() {
			this.deck = cards325.shuffle(cards325.deck);
			this.state = 'INIT_DECK';
		}
	}, {
		key: 'setDeckIndex',
		value: function setDeckIndex() {
			for (var i = 0; i < this.deck.length; i++) {
				this.deck[i].index = i;
			};
		}
	}, {
		key: 'getTrump',
		value: function getTrump() {
			this.state = 'GET_TRUMP';
			// return this.trump;
		}
	}, {
		key: 'initRound',
		value: function initRound() {
			this.deck = cards325.shuffle(this.deck);
			this.deck.map(function (card) {
				card.setDefaultState();
				// card.setPositionByState();
			});
			this.updateHandsToMake();
			// this.setDeckIndex();
			this.state = 'INIT_ROUND';
			this.playedCards = {
				S: { cards: [], extremes: [] },
				D: { cards: [], extremes: [] },
				H: { cards: [], extremes: [] },
				C: { cards: [], extremes: [] }
			};
			this.distributionIndex = 0;
			this.distributionState = 0;
			this.playableCards = [];
			this.activePlayerPos = null;
			this.botState = 'UNINITIATED';
			this.gameTurn = 1;
			this.gameRound++;
			delete this.trump;
			if (this.activePlayerPos === null) {
				this.activePlayerPos = 0;
			}
			this.players.map(function (player) {
				return player.state = 'INIT';
			});
		}
	}, 
	{
		key: 'initBots',
		value: function initBots(roomId) {
			for (var i = 0; i < _constantsSattiHelper.gameVars.noOfPlayers; i++) {
				var player = undefined;
				var botNames = ['Player0', 'Player1', 'Player2'];
					player = new _utilsBot3252['default']({ id: roomId+i, name: botNames[i], img: 'IMAGE_BOT' });
				player.position = i;
				this.players.push(player);
			};
			this.state = 'INIT_PLAYERS';
			this.botState = 'BOT_READY';
		}
	},
	{
		key: 'initPlayers',
		value: function initPlayers() {
			for (var i = 0; i < _constantsSattiHelper.gameVars.noOfPlayers; i++) {
				var player = undefined;
				var botNames = ['', 'Player1', 'Player2'];
				if (i == 0) {
					player = new _utilsPlayer3252['default']({ id: i, name: 'You', img: 'IMAGE_YOU', type: 'HUMAN' });
					player.handsToMake = 5;
					player.handsMade = 4;
					player.handsMadeInLR = 4;
				} else {
					player = new _utilsBot3252['default']({ id: i, name: botNames[i], img: 'IMAGE_BOT' });
					if (i == 1) {
						player.handsToMake = 3;
						player.handsMade = 5;
						player.handsMadeInLR = 5;
					}
					if (i == 2) {
						player.handsToMake = 2;
						player.handsMade = 1;
						player.handsMadeInLR = 1;
					}
				}
				player.position = i;
				this.players.push(player);
			};
			this.state = 'INIT_PLAYERS';
			this.botState = 'BOT_READY';
		}
	}, {
		key: 'reInitDeck',
		value: function reInitDeck() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.deck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var deckcard = _step.value;

					deckcard.state = 'IN_DECK';
					deckcard.ownerPos = null;
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			this.state = 'DEALER_SELECTION_SUCCESS';
		}
	}, {
		key: 'distributeCards',
		value: function distributeCards() {
			var cardDistributionStartFrom = this.dealerPos + 1;
			if (cardDistributionStartFrom === this.players.length) {
				cardDistributionStartFrom = 0;
			}
			while (this.playerPosArray[0] !== cardDistributionStartFrom) {
				var c = this.playerPosArray.pop();
				this.playerPosArray.unshift(c);
			}
			var n = this.distributionArray[this.distributionState];
			var playersLength = this.players.length;
			for (var _i = 0; _i < n; _i++) {
				for (var _j = 0; _j < playersLength; _j++) {
					var card = this.deck[this.distributionIndex];
					if (card.state == 'IN_DECK') {
						card.state = 'DISTRIBUTED';
						card.animTime = _constantsSattiHelper.timeConstants.SINGLE_DISTR_ANIM;
						card.delay = _constantsSattiHelper.timeConstants.SINGLE_DISTR_DELAY * (n * playersLength * (this.distributionState + 1) - this.distributionIndex);
						card.ownerPos = this.playerPosArray[_j]; //this.players[j].position;
						this.distributionIndex++;
						card.zIndex = _constantsSattiHelper.gameCSSConstants.zIndex.DISTR + _i;
						card.index = n * [this.distributionState] + _i;
					}
				}
			}
			var ic = 0;
			for (var i = 0; i < 10; i++) {
				for (var j = 0; j < this.players.length; j++) {
					var card = this.deck[ic];
					if (card.state == 'DISTRIBUTED') {
						card.distributionState = this.distributionState;
					}
					ic++;
				};
			};
			this.distributionState++;
			this.state = 'DISTRIBUTING_CARDS_' + this.distributionState;
		}
	}, {
		key: 'distributeOneCardEach',
		value: function distributeOneCardEach() {
			var biggestCard;
			for (var i = 0; i < this.players.length; i++) {
				this.deck[i].ownerPos = i;
				this.deck[i].state = 'SELECT_DEALER';

				this.deck[i].animTime = _constantsSattiHelper.timeConstants.SINGLE_DISTR_ANIM;
				this.deck[i].delay = _constantsSattiHelper.timeConstants.SINGLE_DISTR_DELAY * (i + 1);

				if (!biggestCard) {
					biggestCard = this.deck[i];
				} else {
					if (this.deck[i].rank > biggestCard.rank) {
						biggestCard = this.deck[i];
					} else if (this.deck[i].rank = biggestCard.rank) {
						var suitOrder = ['C', 'D', 'H', 'S'];
						if (suitOrder.indexOf(this.deck[i].suit) > suitOrder.indexOf(biggestCard.suit)) {
							biggestCard = this.deck[i];
						}
					}
				}
			}
			this.dealerId = biggestCard.ownerPos;
			this.state = 'SELECT_DEALER';
		}
	}, {
		key: 'distributionDone',
		value: function distributionDone() {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = this.deck[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var deckcard = _step2.value;

					deckcard.delay = 0;
					deckcard.animTime = _constantsSattiHelper.timeConstants.REARRANGE_ANIM;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2['return']) {
						_iterator2['return']();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			this.gameTurn = 0;
		}
	}, {
		key: 'checkBotPlay',
		value: function checkBotPlay() {
			var activePlayer = this.players[this.activePlayerPos];
			if (activePlayer.type == 'BOT') {
				console.log(this.state);
				this.botState = 'BOT_SHOULD_PLAY';
				setTimeout(function () {
					GameActions.playBot();
				}, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
			} else {
				this.botState = 'BOT_CANNOT_PLAY';
			}
		}
	}, {
		key: 'getBiggestCard',
		value: function getBiggestCard(card1, card2, turnSuit, trump) {
			if (card1 == null) return card2;
			if (card1.suit == trump) {
				if (card2.suit == trump) {
					if (card1.rank > card2.rank) {
						return card1;
					} else {
						return card2;
					}
				} else {
					return card1;
				}
			} else if (card2.suit == trump) {
				return card2;
			} else if (card1.suit == turnSuit && card2.suit == turnSuit) {
				if (card1.rank > card2.rank) {
					return card1;
				} else {
					return card2;
				}
			} else if (card1.suit == turnSuit && card2.suit != turnSuit) {
				return card1;
			} else if (card1.suit != turnSuit && card2.suit == turnSuit) {
				return card2;
			} else {
				if (card1.rank > card2.rank) {
					return card1;
				} else {
					return card2;
				}
			}
		}
	}, {
		key: 'checkTurnSkip',
		value: function checkTurnSkip() {
			var activePlayer = this.players[this.activePlayerPos];
			if (activePlayer.state == 'SKIP_TURN') {
				setTimeout(function () {
					GameActions.skipTurn(activePlayer.position);
				}, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
			}
		}
	}, {
		key: 'playBot',
		value: function playBot() {
			var activeBot = this.players[this.activePlayerPos];
			if (activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY' && this.state == 'SET_TRUMP') {
				activeBot.setTrump();
			} else if (activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY') {
				this.botState = 'BOT_PLAYING_CARD';
				activeBot.playCard();
			}
		}
	}, {
		key: 'shouldMoveHand',
		value: function shouldMoveHand() {
			if (this.gameTurn >= 3 && this.gameTurn % this.players.length == 0) {
				return true;
			}
			return false;
		}
	}, {
		key: 'assignPosToCardsToBeMoved',
		value: function assignPosToCardsToBeMoved() {
			this.getTurnWinner();
			delete this.turnSuit;
			var cards = [];
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.deck[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var deckcard = _step3.value;

					if (deckcard.state == 'PLAYED') {
						deckcard.state = 'MOVE_HAND';
						deckcard.ownerPos = this.winnerId;
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3['return']) {
						_iterator3['return']();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'playCard',
		value: function playCard(card) {
			if (card.ownerPos == this.activePlayerPos && this.state == 'READY_TO_PLAY_NEXT') {
				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = this.deck[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var deckcard = _step4.value;

						if (card.rank == deckcard.rank && card.suit == deckcard.suit) {
							this.cardPlayed = deckcard;
							deckcard.state = 'BEING_PLAYED';
							deckcard.delay = _constantsSattiHelper.timeConstants.PLAY_DELAY;
							deckcard.animTime = _constantsSattiHelper.timeConstants.PLAY_ANIM;
							if (!this.turnSuit) {
								this.turnSuit = deckcard.suit;
							}
						}
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4['return']) {
							_iterator4['return']();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
				}

				this.updateCardIndex();
				this.state = 'PLAYING_CARD';
			}
			if (card.ownerPos == this.otherPlayerId && this.state == 'GAME325_WITHDRAW_CARD') {
				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = this.deck[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var deckcard = _step5.value;

						if (card.rank == deckcard.rank && card.suit == deckcard.suit) {
							this.cardPlayed = deckcard;
							deckcard.ownerPos = this.activePlayerId;
							this.updateCardIndex();
						}
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5['return']) {
							_iterator5['return']();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
				}

				this.state = 'GAME325_WITHDRAWING_CARD';
			}
			if (card.ownerPos == this.activePlayerPos && this.state == 'GAME325_RETURN_CARD') {
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = this.deck[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var deckcard = _step6.value;

						if (card.rank == deckcard.rank && card.suit == deckcard.suit) {
							this.cardPlayed = deckcard;
							deckcard.ownerPos = this.otherPlayerId;
							this.updateCardIndex();
							this.players[this.activePlayerPos].handsMadeInLR--;
							this.players[this.otherPlayerId].handsMadeInLR++;
						}
					}
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6['return']) {
							_iterator6['return']();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

				this.state = 'GAME325_RETURNING_CARD';
			}
		}
	}, {
		key: 'updateHandsToMake',
		value: function updateHandsToMake() {
			var arrHands = [2, 3, 5];
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = this.players[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var player = _step7.value;

					var scoreObj = new _utilsScore3252['default']();
					player.score.push(scoreObj);
					player.score[this.gameRound].handsToMake = player.handsToMake;
					player.handsMadeInLR = player.handsMade;
					player.handsToMakeInLR = player.handsToMake;
					player.score[this.gameRound].handsMade = player.handsMade;
					player.score[this.gameRound].handsToMake = player.handsToMake;
					player.handsMade = 0;
					var c = arrHands.indexOf(player.handsToMake);
					if (c == 2) {
						c = 0;
					} else {
						c++;
					}
					player.handsToMake = arrHands[c];
				}
			} catch (err) {
				_didIteratorError7 = true;
				_iteratorError7 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion7 && _iterator7['return']) {
						_iterator7['return']();
					}
				} finally {
					if (_didIteratorError7) {
						throw _iteratorError7;
					}
				}
			}
		}
	}, {
		key: 'hideMovedCards',
		value: function hideMovedCards() {
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = this.deck[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var deckcard = _step8.value;

					if (deckcard.state == 'MOVE_HAND') {
						// deckcard.state = 'HIDE_CARD';
					}
				}
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8['return']) {
						_iterator8['return']();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}
		}
	}, {
		key: 'updateCardState',
		value: function updateCardState(card, state) {
			var _this = this;

			this.deck.map(function (deckcard) {
				if (deckcard.rank == card.rank && deckcard.suit == card.suit) {
					_this.players[_this.activePlayerPos].cardPlayed = Object.assign(deckcard);
					deckcard.state = state;
				}
			});
		}
	}, {
		key: 'updateCardIndex',
		value: function updateCardIndex() {
			var i = 0;
			var _iteratorNormalCompletion9 = true;
			var _didIteratorError9 = false;
			var _iteratorError9 = undefined;

			try {
				for (var _iterator9 = this.deck[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
					var deckcard = _step9.value;

					if (deckcard.ownerPos == this.activePlayerPos && deckcard.state == 'DISTRIBUTED') {
						deckcard.index = i;
						i++;
					}
				}
			} catch (err) {
				_didIteratorError9 = true;
				_iteratorError9 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion9 && _iterator9['return']) {
						_iterator9['return']();
					}
				} finally {
					if (_didIteratorError9) {
						throw _iteratorError9;
					}
				}
			}

			var _iteratorNormalCompletion10 = true;
			var _didIteratorError10 = false;
			var _iteratorError10 = undefined;

			try {
				for (var _iterator10 = this.deck[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
					var deckcard = _step10.value;

					if (deckcard.ownerPos == this.activePlayerPos && deckcard.state == 'DISTRIBUTED') {
						deckcard.totalIndex = i - 1;
					}
				}
			} catch (err) {
				_didIteratorError10 = true;
				_iteratorError10 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion10 && _iterator10['return']) {
						_iterator10['return']();
					}
				} finally {
					if (_didIteratorError10) {
						throw _iteratorError10;
					}
				}
			}
		}
	}, {
		key: 'addPlayedCard',
		value: function addPlayedCard(cardToAdd) {
			if (!cardToAdd) return false;
			var _iteratorNormalCompletion11 = true;
			var _didIteratorError11 = false;
			var _iteratorError11 = undefined;

			try {
				for (var _iterator11 = this.playedCards[cardToAdd.suit].cards[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
					var playedCard = _step11.value;

					if (cardToAdd.rank == playedCard.rank && cardToAdd.suit == playedCard.suit) {
						return false;
					}
				}
			} catch (err) {
				_didIteratorError11 = true;
				_iteratorError11 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion11 && _iterator11['return']) {
						_iterator11['return']();
					}
				} finally {
					if (_didIteratorError11) {
						throw _iteratorError11;
					}
				}
			}

			var suit = cardToAdd.suit;
			this.playedCards[suit].cards.push(cardToAdd);
			return true;
		}
	}, {
		key: 'removePlayableCard',
		value: function removePlayableCard(cardToRemove) {
			var _iteratorNormalCompletion12 = true;
			var _didIteratorError12 = false;
			var _iteratorError12 = undefined;

			try {
				for (var _iterator12 = this.deck[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
					var deckcard = _step12.value;

					if (deckcard.rank == cardToRemove.rank && deckcard.suit == cardToRemove.suit) {
						deckcard.isPlayable = false;
						deckcard.bgColor = 'rgb(250,255,255)';
					}
				}
			} catch (err) {
				_didIteratorError12 = true;
				_iteratorError12 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion12 && _iterator12['return']) {
						_iterator12['return']();
					}
				} finally {
					if (_didIteratorError12) {
						throw _iteratorError12;
					}
				}
			}

			for (var i = 0; i < this.playableCards.length; i++) {
				var playableCard = this.playableCards[i];
				if (playableCard.rank == cardToRemove.rank && playableCard.suit == cardToRemove.suit) {
					this.playableCards.splice(i, 1);
					return true;
				}
			};
			return false;
		}
	}, {
		key: 'checkTurnEnd',
		value: function checkTurnEnd() {
			var playedCards = 0;
			for (var i = this.players.length - 1; i >= 0; i--) {
				if (typeof this.players[i].cardPlayed === 'object') {
					playedCards++;
				}
			}
			if (playedCards == this.players.length) {
				this.state = 'MOVE_HAND';
				return true;
			}
			return false;
		}
	}, {
		key: 'assignPlayerIds',
		value: function assignPlayerIds() {
			this.playerIds = [];
			var _iteratorNormalCompletion13 = true;
			var _didIteratorError13 = false;
			var _iteratorError13 = undefined;

			try {
				for (var _iterator13 = this.players[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
					var player = _step13.value;

					this.playerIds.push(player.id);
				}
			} catch (err) {
				_didIteratorError13 = true;
				_iteratorError13 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion13 && _iterator13['return']) {
						_iterator13['return']();
					}
				} finally {
					if (_didIteratorError13) {
						throw _iteratorError13;
					}
				}
			}
		}
	}, {
		key: 'getTurnWinner',
		value: function getTurnWinner() {
			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = this.deck[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var deckcard = _step14.value;

					if (deckcard.state == 'PLAYED') {
						this.players[deckcard.ownerPos].cardPlayed = deckcard;
					}
				}
			} catch (err) {
				_didIteratorError14 = true;
				_iteratorError14 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion14 && _iterator14['return']) {
						_iterator14['return']();
					}
				} finally {
					if (_didIteratorError14) {
						throw _iteratorError14;
					}
				}
			}

			var biggestCard = null;
			for (var i = 0; i < this.players.length; i++) {
				biggestCard = this.getBiggestCard(biggestCard, this.players[i].cardPlayed, this.turnSuit, this.trump);
			}
			this.turnSuit = '';
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].cardPlayed == biggestCard) {
					this.lastGameWinner = this.players[i].id;
					this.players[i].handsMade++;
					this.winnerId = this.players[i].id;
					this.activePlayerId = this.winnerId;
					this.activePlayerPos = this.winnerId;
					this.players[i].score[this.gameRound - 1].handsMade++;
				}
			}
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].cardPlayed = '';
			}
		}
	}, {
		key: 'checkRoundEnd',
		value: function checkRoundEnd() {
			if (this.gameTurn % 30 == 0) {
				this.state = 'ROUND_END';
				return true;
			}
			return false;
		}
	}, {
		key: 'isWithdrawCard',
		value: function isWithdrawCard() {
			var array = new Array();
			var arrayId = new Array();
			var arrayVal = new Array();
			var handsDiffObj = function handsDiffObj(id, handsDiff) {
				return {
					id: id,
					value: handsDiff
				};
			};
			var _iteratorNormalCompletion15 = true;
			var _didIteratorError15 = false;
			var _iteratorError15 = undefined;

			try {
				for (var _iterator15 = this.players[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
					var player = _step15.value;

					var handsDiff = player.handsToMakeInLR - player.handsMadeInLR;
					var j = new handsDiffObj(player.id, handsDiff);
					array.push(j);
				}
			} catch (err) {
				_didIteratorError15 = true;
				_iteratorError15 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion15 && _iterator15['return']) {
						_iterator15['return']();
					}
				} finally {
					if (_didIteratorError15) {
						throw _iteratorError15;
					}
				}
			}

			array.sort(function (a, b) {
				if (a.value > b.value) {
					return 1;
				}
				if (a.value < b.value) {
					return -1;
				}
				return 0;
			});
			for (var i = 0; i < array.length; i++) {
				arrayId.push(array[i].id);
				arrayVal.push(array[i].value);
			}

			if (arrayVal[0] == 0 && arrayVal[2] == 0) {
				this.withdraw = false;
			} else {
				this.activePlayerId = arrayId[0];
				this.activePlayerPos = this.activePlayerId;
				this.otherPlayerId = arrayId[2];
				this.withdraw = true;
			}
			return this.withdraw;
		}
	}, {
		key: 'withdrawCard',
		value: function withdrawCard(card) {
			var _iteratorNormalCompletion16 = true;
			var _didIteratorError16 = false;
			var _iteratorError16 = undefined;

			try {
				for (var _iterator16 = this.deck[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
					var deckcard = _step16.value;

					if (deckcard.suit == card.suit && deckcard.rank == card.rank) {
						deckcard.ownerPos = this.activePlayerPos;
					}
				}
			} catch (err) {
				_didIteratorError16 = true;
				_iteratorError16 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion16 && _iterator16['return']) {
						_iterator16['return']();
					}
				} finally {
					if (_didIteratorError16) {
						throw _iteratorError16;
					}
				}
			}
		}
	}, {
		key: 'returnCard',
		value: function returnCard(card) {
			var _iteratorNormalCompletion17 = true;
			var _didIteratorError17 = false;
			var _iteratorError17 = undefined;

			try {
				for (var _iterator17 = this.deck[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
					var deckcard = _step17.value;

					if (deckcard.suit == card.suit && deckcard.rank == card.rank) {
						deckcard.ownerPos = this.activePlayerPos;
						this.players[this.activePlayerPos].handsMadeInLR--;
						this.players[this.otherPlayerId].handsMadeInLR++;
					}
				}
			} catch (err) {
				_didIteratorError17 = true;
				_iteratorError17 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion17 && _iterator17['return']) {
						_iterator17['return']();
					}
				} finally {
					if (_didIteratorError17) {
						throw _iteratorError17;
					}
				}
			}
		}
	}, {
		key: 'addPlayableCard',
		value: function addPlayableCard(cardToAdd) {
			var suits = ['S', 'H', 'C', 'D'];
			var _iteratorNormalCompletion18 = true;
			var _didIteratorError18 = false;
			var _iteratorError18 = undefined;

			try {
				for (var _iterator18 = suits[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
					var suit = _step18.value;
					var _iteratorNormalCompletion21 = true;
					var _didIteratorError21 = false;
					var _iteratorError21 = undefined;

					try {
						for (var _iterator21 = this.playedCards[suit].cards[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
							var playedCard = _step21.value;

							if (playedCard.suit == cardToAdd.suit && playedCard.rank == cardToAdd.rank) {
								return false;
							}
						}
					} catch (err) {
						_didIteratorError21 = true;
						_iteratorError21 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion21 && _iterator21['return']) {
								_iterator21['return']();
							}
						} finally {
							if (_didIteratorError21) {
								throw _iteratorError21;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError18 = true;
				_iteratorError18 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion18 && _iterator18['return']) {
						_iterator18['return']();
					}
				} finally {
					if (_didIteratorError18) {
						throw _iteratorError18;
					}
				}
			}

			var _iteratorNormalCompletion19 = true;
			var _didIteratorError19 = false;
			var _iteratorError19 = undefined;

			try {
				for (var _iterator19 = this.deck[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
					var deckcard = _step19.value;

					if (deckcard.rank == cardToAdd.rank && deckcard.suit == cardToAdd.suit) {
						deckcard.isPlayable = true;
						deckcard.bgColor = '#fff';
						// deckcard.setPositionByState();
					}
				}
			} catch (err) {
				_didIteratorError19 = true;
				_iteratorError19 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion19 && _iterator19['return']) {
						_iterator19['return']();
					}
				} finally {
					if (_didIteratorError19) {
						throw _iteratorError19;
					}
				}
			}

			var _iteratorNormalCompletion20 = true;
			var _didIteratorError20 = false;
			var _iteratorError20 = undefined;

			try {
				for (var _iterator20 = this.playableCards[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
					var playableCard = _step20.value;

					if (cardToAdd.rank == playableCard.rank && cardToAdd.suit == playableCard.suit) {
						return false;
					}
				}
			} catch (err) {
				_didIteratorError20 = true;
				_iteratorError20 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion20 && _iterator20['return']) {
						_iterator20['return']();
					}
				} finally {
					if (_didIteratorError20) {
						throw _iteratorError20;
					}
				}
			}

			this.playableCards.push(cardToAdd);
			return true;
		}
	}, {
		key: 'setGameState',
		value: function setGameState(state) {
			switch (state) {
				case 'RETURN_CARD':
					var tempId = this.otherPlayerId;
					this.otherPlayerId = this.activePlayerId;
					this.activePlayerId = tempId;
			}
		}
	}, {
		key: 'updatePlayableCards',
		value: function updatePlayableCards() {
			var c = 0;
			var _iteratorNormalCompletion22 = true;
			var _didIteratorError22 = false;
			var _iteratorError22 = undefined;

			try {
				for (var _iterator22 = this.deck[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
					var deckcard = _step22.value;

					if (deckcard.ownerPos == this.activePlayerPos && deckcard.suit == this.turnSuit) {
						c++;
					}
				}
			} catch (err) {
				_didIteratorError22 = true;
				_iteratorError22 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion22 && _iterator22['return']) {
						_iterator22['return']();
					}
				} finally {
					if (_didIteratorError22) {
						throw _iteratorError22;
					}
				}
			}

			if (c == 0) {
				var _iteratorNormalCompletion23 = true;
				var _didIteratorError23 = false;
				var _iteratorError23 = undefined;

				try {
					for (var _iterator23 = this.deck[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
						var deckcard = _step23.value;

						if (deckcard.ownerPos == this.activePlayerPos) {
							deckcard.isPlayable = true;
						} else {
							deckcard.isPlayable = false;
						}
					}
				} catch (err) {
					_didIteratorError23 = true;
					_iteratorError23 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion23 && _iterator23['return']) {
							_iterator23['return']();
						}
					} finally {
						if (_didIteratorError23) {
							throw _iteratorError23;
						}
					}
				}
			} else {
				var _iteratorNormalCompletion24 = true;
				var _didIteratorError24 = false;
				var _iteratorError24 = undefined;

				try {
					for (var _iterator24 = this.deck[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
						var deckcard = _step24.value;

						if (deckcard.ownerPos == this.activePlayerPos) {
							if (deckcard.suit == this.turnSuit) {
								deckcard.isPlayable = true;
							} else {
								deckcard.isPlayable = true;
							}
						} else {
							deckcard.isPlayable = false;
						}
					}
				} catch (err) {
					_didIteratorError24 = true;
					_iteratorError24 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion24 && _iterator24['return']) {
							_iterator24['return']();
						}
					} finally {
						if (_didIteratorError24) {
							throw _iteratorError24;
						}
					}
				}
			}
		}
	}, {
		key: 'getExtremeCards',
		value: function getExtremeCards(cards) {
			var extremes = undefined;
			if (cards.length == 0) {
				extremes = [];
			} else {
				extremes = [cards[0], cards[0]];
				var _iteratorNormalCompletion25 = true;
				var _didIteratorError25 = false;
				var _iteratorError25 = undefined;

				try {
					for (var _iterator25 = cards[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
						var card = _step25.value;

						if (card.place == 'UP' && card.storey > extremes[0].storey) {
							extremes[0] = card;
						}
						if (card.place == 'DOWN' && card.storey > extremes[1].storey) {
							extremes[1] = card;
						}
					}
				} catch (err) {
					_didIteratorError25 = true;
					_iteratorError25 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion25 && _iterator25['return']) {
							_iterator25['return']();
						}
					} finally {
						if (_didIteratorError25) {
							throw _iteratorError25;
						}
					}
				}
			}
			return extremes;
		}
	}, {
		key: 'getNextPlayableCards',
		value: function getNextPlayableCards(extremes) {
			var nextCards = [];
			var _iteratorNormalCompletion26 = true;
			var _didIteratorError26 = false;
			var _iteratorError26 = undefined;

			try {
				for (var _iterator26 = extremes[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
					var extremecard = _step26.value;

					if (extremecard.place == 'MID') {
						nextCards.push(this.getCardByStorey(extremecard.suit, extremecard.storey + 1, 'UP'));
						nextCards.push(this.getCardByStorey(extremecard.suit, extremecard.storey + 1, 'DOWN'));
					} else {
						var card = this.getCardByStorey(extremecard.suit, extremecard.storey + 1, extremecard.place);
						if (card) {
							nextCards.push(card);
						}
					}
				}
			} catch (err) {
				_didIteratorError26 = true;
				_iteratorError26 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion26 && _iterator26['return']) {
						_iterator26['return']();
					}
				} finally {
					if (_didIteratorError26) {
						throw _iteratorError26;
					}
				}
			}

			return nextCards;
		}
	}, {
		key: 'getCard',
		value: function getCard(suit, rank) {
			var _iteratorNormalCompletion27 = true;
			var _didIteratorError27 = false;
			var _iteratorError27 = undefined;

			try {
				for (var _iterator27 = this.deck[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
					var deckcard = _step27.value;

					if (deckcard.suit == suit && deckcard.rank == rank) {
						return deckcard;
					}
				}
			} catch (err) {
				_didIteratorError27 = true;
				_iteratorError27 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion27 && _iterator27['return']) {
						_iterator27['return']();
					}
				} finally {
					if (_didIteratorError27) {
						throw _iteratorError27;
					}
				}
			}

			return null;
		}
	}, {
		key: 'getCardByStorey',
		value: function getCardByStorey(suit, storey, place) {
			var _iteratorNormalCompletion28 = true;
			var _didIteratorError28 = false;
			var _iteratorError28 = undefined;

			try {
				for (var _iterator28 = this.deck[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
					var deckcard = _step28.value;

					if (deckcard.suit == suit && deckcard.storey == storey && deckcard.place == place) {
						return deckcard;
					}
				}
			} catch (err) {
				_didIteratorError28 = true;
				_iteratorError28 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion28 && _iterator28['return']) {
						_iterator28['return']();
					}
				} finally {
					if (_didIteratorError28) {
						throw _iteratorError28;
					}
				}
			}

			return null;
		}
	}, {
		key: 'nextTurn',
		value: function nextTurn() {
			if (this.state !== 'MOVE_HAND') {
				this.gameTurn++;
				this.setNextActivePlayerPos();
			}
			if (this.state !== 'GAME325_WITHDRAW_CARD' && this.state !== 'GAME325_RETURN_CARD' && this.state !== 'SET_TRUMP') {
				this.state = 'READY_TO_PLAY_NEXT';
			}
		}
	}, {
		key: 'updateScores',
		value: function updateScores() {
			var gameEnd = false;
			var scores = [0, 0, 0, 0];
			this.players.map(function (player) {
				// player.score.penalty.push(player.score.roundPenalty.total);
				// player.score.roundPenalty.total = 0;
				// player.score.roundPenalty.isNotPlayable = 0;
				// scores[player.position] = player.score.getTotalPenalty();
				// if(player.score.getTotalPenalty() > 100){
				// 	gameEnd = true;
				// }
			});
			// var sorted = scores.slice().sort(function(a,b){return a-b;});
			// var ranks = scores.slice().map(function(v) {return sorted.indexOf(v)+1});
			// this.players.map(player=>{
			// 	player.rank = ranks[player.position];
			// })
		}
	}, {
		key: 'roundEnd',
		value: function roundEnd() {
			this.state = 'ROUND_END';
			this.updateScores();
		}
	}, {
		key: 'getCardState',
		value: function getCardState(card) {
			var _iteratorNormalCompletion29 = true;
			var _didIteratorError29 = false;
			var _iteratorError29 = undefined;

			try {
				for (var _iterator29 = this.deck[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
					var deckcard = _step29.value;

					if (deckcard.rank == card.rank && deckcard.suit == card.suit) {
						return deckcard.state;
					}
				}
			} catch (err) {
				_didIteratorError29 = true;
				_iteratorError29 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion29 && _iterator29['return']) {
						_iterator29['return']();
					}
				} finally {
					if (_didIteratorError29) {
						throw _iteratorError29;
					}
				}
			}

			return false;
		}
	}, {
		key: 'getPlayerByID',
		value: function getPlayerByID() {}
	}, {
		key: 'setNextActivePlayerPos',
		value: function setNextActivePlayerPos() {
			if (this.gameTurn > 3 && this.gameTurn % 3 == 1) {
				this.activePlayerPos = this.winnerId;
			} else {
				if (this.gameTurn == 1) {
					this.activePlayerPos = 0;
				} else {
					if (this.activePlayerPos == _constantsSattiHelper.gameVars.noOfPlayers - 1) {
						this.activePlayerPos = 0;
					} else {
						this.activePlayerPos++;
					}
				}
			}
			// this.updatePlayableCards();
		}
	}]);

	return Game325;
})();

exports['default'] = Game325;
module.exports = exports['default'];