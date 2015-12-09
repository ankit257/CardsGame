'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _CardsSatti = require('../utils/CardsSatti');

var _CardsSatti2 = _interopRequireDefault(_CardsSatti);

var _constantsSattiHelper = require('../constants/SattiHelper');

var _utilsPlayerSatti = require('../utils/PlayerSatti');

var _utilsPlayerSatti2 = _interopRequireDefault(_utilsPlayerSatti);

var _utilsBotSatti = require('../utils/BotSatti');

var _utilsBotSatti2 = _interopRequireDefault(_utilsBotSatti);

var _utilsScoreSatti = require('../utils/ScoreSatti');

var _utilsScoreSatti2 = _interopRequireDefault(_utilsScoreSatti);

var _actionsGameActions = require('../actions/GameActions');

var GameActions = _interopRequireWildcard(_actionsGameActions);

var cardsSatti = new _CardsSatti2['default']();

var GameSatti = (function () {
	function GameSatti() {
		_classCallCheck(this, GameSatti);

		Object.assign(this, {
			adminId: null,
			maxPlayers: 4,
			players: [],
			deck: [],
			gameTurn: 0,
			gameRound: 0,
			state: 'CONSTRUCTED',
			botState: 'UNINITIATED',
			cardPlayed: {},
			playedCards: {},
			playableCards: [],
			activePlayerPos: null,
			activePlayerId: null,
			pauseState: false
		});
	}

	_createClass(GameSatti, [{
		key: 'initDeck',
		value: function initDeck() {
			this.deck = cardsSatti.shuffle(cardsSatti.deck);
			// this.setDeckIndex();
			// this.deck.map(deckcard=> deckcard.setPositionByState());
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
		key: 'initRound',
		value: function initRound() {
			this.deck = cardsSatti.shuffle(this.deck);
			this.deck.map(function (card) {
				card.setDefaultState();
				// card.setPositionByState();
			});
			// this.setDeckIndex();
			this.state = 'INIT_ROUND';
			this.playedCards = {
				S: { cards: [], extremes: [] },
				D: { cards: [], extremes: [] },
				H: { cards: [], extremes: [] },
				C: { cards: [], extremes: [] }
			};
			this.playableCards = [];
			this.activePlayerPos = null;
			this.activePlayerId = null;
			this.botState = 'UNINITIATED';
			this.pauseState = false;
			this.gameTurn = 1;
			this.gameRound++;
			this.players.map(function (player) {
				return player.state = 'INIT';
			});
		}
	}, {
		key: 'initBots',
		value: function initBots(roomId) {
			for (var i = 0; i < _constantsSattiHelper.gameVars.noOfPlayers; i++) {
				var player = undefined;
				var botNames = ['Player0', 'Player1', 'Player2', 'Player3'];
					player = new _utilsBotSatti2['default']({ id: roomId+i, name: botNames[i], img: 'IMAGE_BOT' });
				player.position = i;
				this.players.push(player);
			};
			this.state = 'INIT_PLAYERS';
			this.botState = 'BOT_READY';
		}
	},{
		key: 'initPlayers',
		value: function initPlayers() {
			for (var i = 0; i < _constantsSattiHelper.gameVars.noOfPlayers; i++) {
				var player = undefined;
				var botNames = ['Player0', 'Player1', 'Player2', 'Player3'];
				if (i == 0) {
					player = new _utilsPlayerSatti2['default']({ id: i, name: 'You', img: 'IMAGE_YOU', type: 'HUMAN' });
				} else {
					player = new _utilsBotSatti2['default']({ id: 'BOT', name: botNames[i], img: 'IMAGE_BOT' });
				}
				player.position = i;
				this.players.push(player);
			};
			this.state = 'INIT_PLAYERS';
			this.botState = 'BOT_READY';
		}
	}, {
		key: 'distributeCards',
		value: function distributeCards() {
			var n = 13;
			var index = 0;
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < this.players.length; j++) {
					var card = this.deck[index];
					if (card.state == 'IN_DECK') {
						card.state = 'DISTRIBUTED';
						card.animTime = _constantsSattiHelper.timeConstants.SINGLE_DISTR_ANIM;
						card.delay = _constantsSattiHelper.timeConstants.SINGLE_DISTR_DELAY * (52 - index);
						card.ownerPos = this.players[j].position;
						index++;
						card.zIndex = _constantsSattiHelper.gameCSSConstants.zIndex.DISTR + i;
						// card.setPositionByState();
					}
				}
			}
			this.state = 'DISTRIBUTING_CARDS';
		}
	}, {
		key: 'distributionDone',
		value: function distributionDone() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.deck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var deckcard = _step.value;

					deckcard.delay = 0;
					deckcard.animTime = _constantsSattiHelper.timeConstants.REARRANGE_ANIM;
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

			this.gameTurn = 0;
		}
	}, {
		key: 'checkBotPlay',
		value: function checkBotPlay() {
			var activePlayer = {};
			var self = this;
			this.players.map(function(player){
				if(player.position == self.activePlayerPos){
					activePlayer = player;
				}
			})
			if (activePlayer.type == 'BOT') {
				this.botState = 'BOT_SHOULD_PLAY';
			} else {
				this.botState = 'BOT_CANNOT_PLAY';
			}
		}
	}, {
		key: 'checkTurnSkip',
		value: function checkTurnSkip() {
			var activePlayer;
			var self = this;
			this.players.map(function(player){
				if(player.position == self.activePlayerPos){
					activePlayer = player;
				}
			})
			if (activePlayer.state == 'SKIP_TURN') {
				setTimeout(function () {
					GameActions.skipTurn(activePlayer.position);
				}, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
			}
		}
	}, {
		key: 'playBot',
		value: function playBot(botCards) {
			var activeBot = {};
			var self = this;
			this.players.map(function(player){
				if(player.position == self.activePlayerPos){
					activeBot = player;
				}
			})
			if (activeBot.type == 'BOT' && this.botState == 'BOT_SHOULD_PLAY') {
				this.botState = 'BOT_PLAYING_CARD';
				return activeBot.playCard(botCards);
			}
		}
	}, {
		key: 'playCard',
		value: function playCard(card, callerLocation) {
			if((card && (callerLocation == 'client' && card.ownerPos == this.activePlayerPos) || (callerLocation == 'server' && card.ownerId == this.activePlayerId)) && this.state == 'READY_TO_PLAY_NEXT'){
				var _iteratorNormalCompletion2 = true;
				var _didIteratorError2 = false;
				var _iteratorError2 = undefined;

				try {
					for (var _iterator2 = this.deck[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
						var deckcard = _step2.value;

						if (card.rank == deckcard.rank && card.suit == deckcard.suit) {
							this.cardPlayed = deckcard;
							deckcard.state = 'BEING_PLAYED';
							this.removePlayableCard(deckcard);
							deckcard.delay = _constantsSattiHelper.timeConstants.PLAY_DELAY;
							deckcard.animTime = _constantsSattiHelper.timeConstants.PLAY_ANIM;
						}
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

				this.state = 'PLAYING_CARD';
			}
		}
	}, {
		key: 'updateCardState',
		value: function updateCardState(card, state) {
			this.deck.map(function (deckcard) {
				if (deckcard.rank == card.rank && deckcard.suit == card.suit) {
					deckcard.state = state;
				}
			});
		}
	}, {
		key: 'addPlayedCard',
		value: function addPlayedCard(cardToAdd) {
			if (!cardToAdd) return false;
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.playedCards[cardToAdd.suit].cards[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var playedCard = _step3.value;

					if (cardToAdd.rank == playedCard.rank && cardToAdd.suit == playedCard.suit) {
						return false;
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

			var suit = cardToAdd.suit;
			this.playedCards[suit].cards.push(cardToAdd);
			return true;
		}
	}, {
		key: 'removePlayableCard',
		value: function removePlayableCard(cardToRemove) {
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.deck[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var deckcard = _step4.value;

					if (deckcard.rank == cardToRemove.rank && deckcard.suit == cardToRemove.suit) {
						deckcard.isPlayable = false;
						deckcard.bgColor = 'rgb(250,255,255)';
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
		key: 'addPlayableCard',
		value: function addPlayableCard(cardToAdd) {
			var suits = ['S', 'H', 'C', 'D'];
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = suits[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var suit = _step5.value;
					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = this.playedCards[suit].cards[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var playedCard = _step8.value;

							if (playedCard.suit == cardToAdd.suit && playedCard.rank == cardToAdd.rank) {
								return false;
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

			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = this.deck[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var deckcard = _step6.value;

					if (deckcard.rank == cardToAdd.rank && deckcard.suit == cardToAdd.suit) {
						deckcard.isPlayable = true;
						deckcard.bgColor = '#fff';
						// deckcard.setPositionByState();
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

			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = this.playableCards[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var playableCard = _step7.value;

					if (cardToAdd.rank == playableCard.rank && cardToAdd.suit == playableCard.suit) {
						return false;
					}
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

			this.playableCards.push(cardToAdd);
			return true;
		}
	}, {
		key: 'updatePlayableCards',
		value: function updatePlayableCards() {
			var _this = this;

			var suits = ['S', 'H', 'C', 'D'];
			if (this.gameTurn == 1) {
				this.addPlayableCard(this.getCard('S', 7));
			} else {
				var _iteratorNormalCompletion9 = true;
				var _didIteratorError9 = false;
				var _iteratorError9 = undefined;

				try {
					for (var _iterator9 = suits[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
						var suit = _step9.value;

						this.playedCards[suit].extremes = this.getExtremeCards(this.playedCards[suit].cards);
						var nextCards = this.getNextPlayableCards(this.playedCards[suit].extremes);
						if (nextCards.length == 0) {
							this.addPlayableCard(this.getCard(suit, 7));
						} else {
							nextCards.map(function (card) {
								return _this.addPlayableCard(card);
							});
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
			}
			// this.deck.map(card=> card.isPlayable = false);
			// this.playableCards = [];
		}
	}, {
		key: 'getExtremeCards',
		value: function getExtremeCards(cards) {
			var extremes = undefined;
			if (cards.length == 0) {
				extremes = [];
			} else {
				extremes = [cards[0], cards[0]];
				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = cards[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var card = _step10.value;

						if (card.place == 'UP' && card.storey > extremes[0].storey) {
							extremes[0] = card;
						}
						if (card.place == 'DOWN' && card.storey > extremes[1].storey) {
							extremes[1] = card;
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
			return extremes;
		}
	}, {
		key: 'getNextPlayableCards',
		value: function getNextPlayableCards(extremes) {
			var nextCards = [];
			var _iteratorNormalCompletion11 = true;
			var _didIteratorError11 = false;
			var _iteratorError11 = undefined;

			try {
				for (var _iterator11 = extremes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
					var extremecard = _step11.value;

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

			return nextCards;
		}
	}, {
		key: 'getCard',
		value: function getCard(suit, rank) {
			var _iteratorNormalCompletion12 = true;
			var _didIteratorError12 = false;
			var _iteratorError12 = undefined;

			try {
				for (var _iterator12 = this.deck[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
					var deckcard = _step12.value;

					if (deckcard.suit == suit && deckcard.rank == rank) {
						return deckcard;
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

			return null;
		}
	}, {
		key: 'getCardByStorey',
		value: function getCardByStorey(suit, storey, place) {
			var _iteratorNormalCompletion13 = true;
			var _didIteratorError13 = false;
			var _iteratorError13 = undefined;

			try {
				for (var _iterator13 = this.deck[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
					var deckcard = _step13.value;

					if (deckcard.suit == suit && deckcard.storey == storey && deckcard.place == place) {
						return deckcard;
					}
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

			return null;
		}
	}, {
		key: 'nextTurn',
		value: function nextTurn() {
			this.gameTurn++;
			this.setNextActivePlayerPos();
			this.state = 'READY_TO_PLAY_NEXT';
		}
	}, {
		key: 'updatePenalties',
		value: function updatePenalties() {
			var gameEnd = false;
			var scores = [0, 0, 0, 0];
			this.players.map(function (player) {
				player.score.penalty.push(player.score.roundPenalty.total);
				player.score.roundPenalty.total = 0;
				player.score.roundPenalty.isNotPlayable = 0;
				scores[player.position] = player.score.getTotalPenalty();
				if (player.score.getTotalPenalty() > 100) {
					gameEnd = true;
				}
			});
			var sorted = scores.slice().sort(function (a, b) {
				return a - b;
			});
			var ranks = scores.slice().map(function (v) {
				return sorted.indexOf(v) + 1;
			});
			this.players.map(function (player) {
				player.rank = ranks[player.position];
			});
		}
	}, {
		key: 'roundEnd',
		value: function roundEnd() {
			this.state = 'ROUND_END';
			this.updatePenalties();
		}
	}, {
		key: 'getCardState',
		value: function getCardState(card) {
			var _iteratorNormalCompletion14 = true;
			var _didIteratorError14 = false;
			var _iteratorError14 = undefined;

			try {
				for (var _iterator14 = this.deck[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
					var deckcard = _step14.value;

					if (deckcard.rank == card.rank && deckcard.suit == card.suit) {
						return deckcard.state;
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

			return false;
		}
	}, {
		key: 'getPlayerByID',
		value: function getPlayerByID() {}

		// assignFirstPlayer(){
		// 	for(let deckcard of this.deck){
		// 		if(deckcard.rank == 7 && deckcard.suit == 'S'){
		// 			this.activePlayerPos = deckcard.ownerPos;
		// 		}
		// 	}
		// }
	}, {
		key: 'setNextActivePlayerPos',
		value: function setNextActivePlayerPos() {
			var _this2 = this;

			if (this.gameTurn == 1) {
				this.deck.map(function (deckcard) {
					if (deckcard.rank == 7 && deckcard.suit == 'S') {
						_this2.activePlayerPos = deckcard.ownerPos;
					}
				});
			} else {
				if (this.activePlayerPos == _constantsSattiHelper.gameVars.noOfPlayers - 1) {
					this.activePlayerPos = 0;
				} else {
					this.activePlayerPos++;
				}
			}
		}
	}]);

	return GameSatti;
})();

exports['default'] = GameSatti;
module.exports = exports['default'];