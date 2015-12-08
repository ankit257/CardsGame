'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsScoreSatti = require('../utils/ScoreSatti');

var _utilsScoreSatti2 = _interopRequireDefault(_utilsScoreSatti);

var _constantsSattiHelper = require('../constants/SattiHelper');

var PlayerSatti = (function () {
	function PlayerSatti(player) {
		_classCallCheck(this, PlayerSatti);

		var id = player.id;
		var name = player.name;
		var img = player.img;
		var type = player.type;

		Object.assign(this, { id: id, name: name, img: img, type: type });
		Object.assign(this, {
			position: null,
			score: new _utilsScoreSatti2['default'](),
			rank: 0,
			width: 0,
			height: 0,
			state: 'INIT',
			x: 0,
			y: 0,
			theta: 0,
			bgColor: 'rgba(100,100,100,0.9)',
			animTime: 100,
			delay: 0,
			socket: ''
		});
	}

	_createClass(PlayerSatti, [{
		key: 'updatePosition',
		value: function updatePosition(activePlayerPos, touched, showScores) {
			if (!showScores) {
				this.delay = 50;
				this.animTime = 200;
				this.width = _constantsSattiHelper.gameCSSConstants.player.largeDim;
				this.height = _constantsSattiHelper.gameCSSConstants.player.smallDim;
				var screenOut = _constantsSattiHelper.gameCSSConstants.player.screenOut * this.height;
				switch (this.position) {
					case 0:
						this.x = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 - this.width / 2;
						this.y = _constantsSattiHelper.gameCSSConstants.gameBody.height - _constantsSattiHelper.gameCSSConstants.player.smallDim + screenOut;
						this.theta = 0;
						if (touched) {
							this.y -= screenOut;
						}
						break;
					case 1:
						this.x = this.height - screenOut;
						this.y = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - this.width / 2;
						this.theta = 90;
						if (touched) {
							this.x += screenOut;
						}
						break;
					case 2:
						this.x = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 + this.width / 2;
						this.y = this.height - screenOut;
						this.theta = 180;
						if (touched) {
							this.y += screenOut;
						}
						break;
					case 3:
						this.x = _constantsSattiHelper.gameCSSConstants.gameBody.width - this.height + screenOut;
						this.y = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 + this.width / 2;
						this.theta = 270;
						if (touched) {
							this.x -= screenOut;
						}
						break;
				}
			} else {
				this.delay = 200;
				this.animTime = 200;
				this.width = _constantsSattiHelper.gameCSSConstants.score.width;
				this.height = _constantsSattiHelper.gameCSSConstants.score.height;
				var boundSep = (_constantsSattiHelper.gameCSSConstants.gameBody.width - 4 * _constantsSattiHelper.gameCSSConstants.score.width - 3 * _constantsSattiHelper.gameCSSConstants.score.sep) / 2;
				this.y = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - _constantsSattiHelper.gameCSSConstants.score.height / 2;
				this.theta = 0;
				var switchvar = undefined;
				if (this.rank == 0) {
					switchvar = this.position + 1;
				} else {
					switchvar = this.position + 1;
				}
				switch (switchvar) {
					case 2:
						this.x = boundSep + this.width + _constantsSattiHelper.gameCSSConstants.score.sep;
						break;
					case 1:
						this.x = boundSep;
						break;
					case 3:
						this.x = boundSep + 2 * this.width + 2 * _constantsSattiHelper.gameCSSConstants.score.sep;
						break;
					case 4:
						this.x = boundSep + 3 * this.width + 3 * _constantsSattiHelper.gameCSSConstants.score.sep;
						break;
				}
			}
			if (this.position == activePlayerPos) {
				switch (this.state) {
					case 'INIT':
						// this.bgColor		= 'rgba(0,0,200,0.9)';
						break;
					case 'SKIP_TURN':
						this.bgColor = 'rgba(243,80,68,0.8)';
						break;
					case 'CAN_PLAY':
						this.bgColor = 'rgba(0,146,132,0.8)';
						break;
					default:
						this.bgColor = 'rgba(100,100,100,0.8)';
						break;
				}
			} else {
				this.bgColor = 'rgba(62,43,36,0.8)';
			}
			if (this.state == 'CLEARED') {
				this.bgColor = 'rgba(226,93,138,0.8)';
			}
		}
	}]);

	return PlayerSatti;
})();

exports['default'] = PlayerSatti;
module.exports = exports['default'];