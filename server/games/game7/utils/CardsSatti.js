'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _PlayingCard = require('./PlayingCard');

var _PlayingCard2 = _interopRequireDefault(_PlayingCard);

var CardsSatti = (function () {
	function CardsSatti() {
		_classCallCheck(this, CardsSatti);

		this.deck = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = this._defaultDeck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var card = _step.value;

				this.deck.push(new _PlayingCard2['default'](card));
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
	}

	_createClass(CardsSatti, [{
		key: 'shuffle',
		value: function shuffle(array) {
			if (!array) var array = this.deck;
			var currentIndex = array.length,
			    temporaryValue,
			    randomIndex;
			//While there remain elements to shuffle...
			while (0 !== currentIndex) {
				//Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				//And swap it with the current element.
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		}
	},{
		key: '_defaultDeck',
		value: [{
							suit	: 'S',
							rank	: 13,
							order	: 1,
							storey	: 7,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 12,
							order	: 2,
							storey	: 6,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 11,
							order	: 3,
							storey	: 5,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 10,
							order	: 4,
							storey	: 4,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 9,
							order	: 5,
							storey	: 3,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 8,
							order	: 6,
							storey	: 2,
							place	: 'UP'
						},
						{
							suit	: 'S',
							rank	: 7,
							order	: 7,
							storey	: 1,
							place	: 'MID'
						},
						{
							suit	: 'S',
							rank	: 6,
							order	: 8,
							storey	: 2,
							place	: 'DOWN'
						},
						{
							suit	: 'S',
							rank	: 5,
							order	: 9,
							storey	: 3,
							place	: 'DOWN'
						},
						{
							suit	: 'S',
							rank	: 4,
							order	: 10,
							storey	: 4,
							place	: 'DOWN'
						},
						{
							suit	: 'S',
							rank	: 3,
							order	: 11,
							storey	: 5,
							place	: 'DOWN'
						},
						{
							suit	: 'S',
							rank	: 2,
							order	: 12,
							storey	: 6,
							place	: 'DOWN'
						},
						{
							suit	: 'S',
							rank	: 1,
							order	: 13,
							storey	: 7,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 13,
							order	: 14,
							storey	: 7,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 12,
							order	: 15,
							storey	: 6,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 11,
							order	: 16,
							storey	: 5,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 10,
							order	: 17,
							storey	: 4,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 9,
							order	: 18,
							storey	: 3,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 8,
							order	: 19,
							storey	: 2,
							place	: 'UP'
						},
						{
							suit	: 'H',
							rank	: 7,
							order	: 20,
							storey	: 1,
							place	: 'MID'
						},
						{
							suit	: 'H',
							rank	: 6,
							order	: 21,
							storey	: 2,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 5,
							order	: 22,
							storey	: 3,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 4,
							order	: 23,
							storey	: 4,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 3,
							order	: 24,
							storey	: 5,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 2,
							order	: 25,
							storey	: 6,
							place	: 'DOWN'
						},
						{
							suit	: 'H',
							rank	: 1,
							order	: 26,
							storey	: 7,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 13,
							order	: 27,
							storey	: 7,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 12,
							order	: 28,
							storey	: 6,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 11,
							order	: 29,
							storey	: 5,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 10,
							order	: 30,
							storey	: 4,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 9,
							order	: 31,
							storey	: 3,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 8,
							order	: 32,
							storey	: 2,
							place	: 'UP'
						},
						{
							suit	: 'C',
							rank	: 7,
							order	: 33,
							storey	: 1,
							place	: 'MID'
						},
						{
							suit	: 'C',
							rank	: 6,
							order	: 34,
							storey	: 2,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 5,
							order	: 35,
							storey	: 3,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 4,
							order	: 36,
							storey	: 4,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 3,
							order	: 37,
							storey	: 5,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 2,
							order	: 38,
							storey	: 6,
							place	: 'DOWN'
						},
						{
							suit	: 'C',
							rank	: 1,
							order	: 39,
							storey	: 7,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 13,
							order	: 40,
							storey	: 7,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 12,
							order	: 41,
							storey	: 6,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 11,
							order	: 42,
							storey	: 5,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 10,
							order	: 43,
							storey	: 4,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 9,
							order	: 44,
							storey	: 3,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 8,
							order	: 45,
							storey	: 2,
							place	: 'UP'
						},
						{
							suit	: 'D',
							rank	: 7,
							order	: 46,
							storey	: 1,
							place	: 'MID'
						},
						{
							suit	: 'D',
							rank	: 6,
							order	: 47,
							storey	: 2,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 5,
							order	: 48,
							storey	: 3,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 4,
							order	: 49,
							storey	: 4,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 3,
							order	: 50,
							storey	: 5,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 2,
							order	: 51,
							storey	: 6,
							place	: 'DOWN'
						},
						{
							suit	: 'D',
							rank	: 1,
							order	: 52,
							storey	: 7,
							place	: 'DOWN'
						}
					]
	}]);

	return CardsSatti;
})();

exports['default'] = CardsSatti;
module.exports = exports['default'];