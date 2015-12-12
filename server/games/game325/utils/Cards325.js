'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _PlayingCard = require('./PlayingCard');

var _PlayingCard2 = _interopRequireDefault(_PlayingCard);

var Cards325 = (function () {
	function Cards325() {
		_classCallCheck(this, Cards325);

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

	_createClass(Cards325, [{
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
	},
	{
		key : '_defaultDeck',
		value : [{
				suit : 'S',
				rank : 13,
				order : 1,
			},
			{
				suit : 'S',
				rank : 12,
				order : 2,
			},
			{
				suit : 'S',
				rank : 11,
				order : 3
			},
			{
				suit : 'S',
				rank : 10,
				order : 4
			},
			{
				suit : 'S',
				rank : 9,
				order : 5
			},
			{
				suit : 'S',
				rank : 8,
				order : 6
			},
			{
				suit : 'S',
				rank : 7,
				order : 7
			},
			{
				suit : 'S',
				rank : 6,
				order : 8
			},
			{
				suit : 'H',
				rank : 13,
				order : 9
			},
			{
				suit : 'H',
				rank : 12,
				order : 10
			},
			{
				suit : 'H',
				rank : 11,
				order : 11
			},
			{
				suit : 'H',
				rank : 10,
				order : 12
			},
			{
				suit : 'H',
				rank : 9,
				order : 13
			},
			{
				suit : 'H',
				rank : 8,
				order : 14
			},
			{
				suit : 'H',
				rank : 7,
				order : 15
			},
			{
				suit : 'H',
				rank : 6,
				order : 16
			},
			{
				suit : 'C',
				rank : 13,
				order : 17
			},
			{
				suit : 'C',
				rank : 12,
				order : 18
			},
			{
				suit : 'C',
				rank : 11,
				order : 19
			},
			{
				suit : 'C',
				rank : 10,
				order : 20
			},
			{
				suit : 'C',
				rank : 9,
				order : 21
			},
			{
				suit : 'C',
				rank : 8,
				order : 22
			},
			{
				suit : 'C',
				rank : 7,
				order : 23
			},
			{
				suit : 'D',
				rank : 13,
				order : 24
			},
			{
				suit : 'D',
				rank : 12,
				order : 25
			},
			{
				suit : 'D',
				rank : 11,
				order : 26
			},
			{
				suit : 'D',
				rank : 10,
				order : 27
			},
			{
				suit : 'D',
				rank : 9,
				order : 28
			},
			{
				suit : 'D',
				rank : 8,
				order : 29
			},
			{
				suit : 'D',
				rank : 7,
				order : 30
			}
	]}]);
	return Cards325;
})();

exports['default'] = Cards325;
module.exports = exports['default'];