'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilsPlayerSatti = require('../utils/PlayerSatti');

var _utilsPlayerSatti2 = _interopRequireDefault(_utilsPlayerSatti);

var _actionsGameActions = require('../actions/GameActions');

var GameActions = _interopRequireWildcard(_actionsGameActions);

var _constantsSattiHelper = require('../constants/SattiHelper');

var BotSatti = (function (_PlayerSatti) {
	_inherits(BotSatti, _PlayerSatti);

	function BotSatti(player) {
		_classCallCheck(this, BotSatti);

		if(player.type == 'SPECTATOR'){
			player.type = 'SPECTATOR';
		}else{
			player.type = 'BOT';
		}
		_get(Object.getPrototypeOf(BotSatti.prototype), 'constructor', this).call(this, player);
		this.cards = [];
	}

	_createClass(BotSatti, [{
		key: 'updateMyCards',
		value: function updateMyCards(botCards) {
			this.cards = botCards;
		}
	}, {
		key: 'playCard',
		value: function playCard(botCards) {
			this.updateMyCards(botCards);
			var myPlayableCards = [];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this.cards[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var myCard = _step.value;

					if (myCard.isPlayable) {
						myPlayableCards.push(myCard);
					}
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

			if (myPlayableCards.length == 0) {
				console.log('I GOT NO CARD TO PLAY!');
				var self = this;
				// this.state = 'SKIP_TURN'
			} else {
					var card = myPlayableCards.pop();
					return card;
				}
		}
	}]);

	return BotSatti;
})(_utilsPlayerSatti2['default']);

exports['default'] = BotSatti;
module.exports = exports['default'];