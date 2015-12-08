'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constantsSattiHelper = require('../constants/SattiHelper');

var PlayingCard = (function () {
	function PlayingCard(card) {
		_classCallCheck(this, PlayingCard);

		// console.log(card);
		var suit = card.suit;
		var rank = card.rank;
		var order = card.order;
		var storey = card.storey;
		var place = card.place;

		Object.assign(this, { suit: suit, rank: rank, order: order, storey: storey, place: place });
		Object.assign(this, {
			state: 'IN_DECK',
			oldX: 0,
			oldY: 0,
			oldZ: 0,
			oldTheta: 0,
			oldShowFace: false,
			x: 0,
			y: 0,
			z: 0,
			dx: 0,
			dy: 0,
			ox: 0,
			oy: 0,
			animTime: 200,
			delay: 0,
			showFace: false,
			ownerPos: null,
			ownerId: null,
			index: null,
			similar: null,
			theta: 0,
			ytheta: 0,
			zIndex: 0,
			isPlayable: false,
			bgColor: '#ddd',
			animState: 0
		});
		this.key = this.suit + this.rank;
		this.setPositionByState();
		this.oldX = this.x;
		this.oldY = this.y;
		this.oldTheta = this.theta;
	}

	_createClass(PlayingCard, [{
		key: 'setDefaultState',
		value: function setDefaultState() {
			Object.assign(this, {
				state: 'IN_DECK',
				oldX: 0,
				oldY: 0,
				oldZ: 0,
				oldTheta: 0,
				oldShowFace: false,
				x: 0,
				y: 0,
				z: 0,
				dx: 0,
				dy: 0,
				ox: 0,
				oy: 0,
				animTime: 200,
				delay: 0,
				showFace: false,
				ownerPos: null,
				index: null,
				similar: null,
				theta: 0,
				ytheta: 0,
				zIndex: 0,
				isPlayable: false,
				bgColor: '#ddd',
				animState: 0
			});
			this.key = this.suit + this.rank;
			this.setPositionByState();
			this.oldX = this.x;
			this.oldY = this.y;
			this.oldTheta = this.theta;
		}
	}, {
		key: 'setRoundEndPosition',
		value: function setRoundEndPosition() {
			this.oldShowFace = this.showFace;
			this.oldTheta = this.theta;
			this.oldX = this.x;
			this.oldY = this.y;
			this.animState = 0;
			this.delay = 0;
			this.animTime = _constantsSattiHelper.timeConstants.ROUND_END_WAIT;
			switch (this.state) {
				case 'DISTRIBUTED':
					this.showFace = true;
					break;
				case 'PLAYED':
					var boundSep = (_constantsSattiHelper.gameCSSConstants.gameBody.width - 4 * _constantsSattiHelper.gameCSSConstants.score.width - 3 * _constantsSattiHelper.gameCSSConstants.score.sep) / 2;
					this.ox = 50;
					this.oy = 250;
					this.theta = 90;
					this.dx = 0;
					this.dy = 0;
					this.showFace = false;
					break;
			}
			this.calculateActualPosition();
		}
	}, {
		key: 'setPositionByState',
		value: function setPositionByState() {
			this.oldShowFace = this.showFace;
			this.oldTheta = this.theta;
			this.oldX = this.x;
			this.oldY = this.y;
			this.oldZ = this.z;
			this.animState = 0;
			switch (this.state) {
				case 'IN_DECK':
					this.ox = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
					this.oy = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.height / 2;
					this.delay = _constantsSattiHelper.timeConstants.DECK_DELAY;
					this.animTime = _constantsSattiHelper.timeConstants.DECK_ANIM;
					// this.zIndex     = gameCSSConstants.zIndex.DECK + this.index;
					this.showFace = false;
					break;
				case 'DISTRIBUTED':
					var smallOffset = _constantsSattiHelper.gameCSSConstants.cardOffset.small * _constantsSattiHelper.gameCSSConstants.cardSize.width;
					var largeOffset = _constantsSattiHelper.gameCSSConstants.cardOffset.large * _constantsSattiHelper.gameCSSConstants.cardSize.width;
					var screenOutOffset = -1 * _constantsSattiHelper.gameCSSConstants.cardOffset.screenOut * _constantsSattiHelper.gameCSSConstants.cardSize.height;
					var widthLargeCardArrayBy2 = ((this.similar - 1) * largeOffset + _constantsSattiHelper.gameCSSConstants.cardSize.width) / 2;
					var widthSmallCardArrayBy2 = ((this.similar - 1) * smallOffset + _constantsSattiHelper.gameCSSConstants.cardSize.width) / 2;
					switch (this.ownerPos) {
						case 0:
							this.ox = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.oy = _constantsSattiHelper.gameCSSConstants.gameBody.height - _constantsSattiHelper.gameCSSConstants.cardSize.height - _constantsSattiHelper.gameCSSConstants.gameBody.padding;
							this.dx = -1 * widthLargeCardArrayBy2 + largeOffset * this.index + _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.dy = 0;
							this.theta = 0;
							this.showFace = true;
							if (this.isPlayable) {
								this.dy = -5;
							}
							break;
						case 1:
							// this.ox 		=  2*gameCSSConstants.gameBody.padding;
							this.ox = _constantsSattiHelper.gameCSSConstants.cardSize.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2 + screenOutOffset;
							this.oy = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.height / 2;
							this.dx = 0;
							this.dy = -1 * widthSmallCardArrayBy2 + smallOffset * this.index + _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.theta = 90;
							this.showFace = false;
							break;
						case 2:
							this.ox = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							// this.oy 		= gameCSSConstants.gameBody.padding;
							this.oy = screenOutOffset;
							this.dx = widthSmallCardArrayBy2 - smallOffset * this.index - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.dy = 0;
							this.theta = 180;
							this.showFace = false;
							break;
						case 3:
							this.ox = _constantsSattiHelper.gameCSSConstants.gameBody.width + (_constantsSattiHelper.gameCSSConstants.cardSize.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2) - _constantsSattiHelper.gameCSSConstants.cardSize.height - screenOutOffset;
							this.oy = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.height / 2;
							this.dx = 0;
							this.dy = widthSmallCardArrayBy2 - smallOffset * this.index - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.theta = 270;
							this.showFace = false;
							break;
					}
					this.zIndex = _constantsSattiHelper.gameCSSConstants.zIndex.DISTR + this.index;
					// this.showFace = true;
					break;
				case 'BEING_PLAYED':
				case 'PLAYED':
					this.z = 150;
					var offset = {
						horz: _constantsSattiHelper.gameCSSConstants.cardOffset.playedH * _constantsSattiHelper.gameCSSConstants.cardSize.width / 2,
						vert: _constantsSattiHelper.gameCSSConstants.cardOffset.playedV * _constantsSattiHelper.gameCSSConstants.cardSize.height / 2,
						stackV: _constantsSattiHelper.gameCSSConstants.cardOffset.playedStackV * _constantsSattiHelper.gameCSSConstants.cardSize.height,
						stackH: _constantsSattiHelper.gameCSSConstants.cardOffset.playedStackH * _constantsSattiHelper.gameCSSConstants.cardSize.width,
						screenOut: -1 * _constantsSattiHelper.gameCSSConstants.cardOffset.screenOut * _constantsSattiHelper.gameCSSConstants.cardSize.height
					};
					var stackDir = this.place == 'UP' ? -1 : this.place == 'DOWN' ? 1 : 0;
					var zIndex = {
						S: _constantsSattiHelper.gameCSSConstants.zIndex.PLAYED + 0,
						H: _constantsSattiHelper.gameCSSConstants.zIndex.PLAYED + 10,
						C: _constantsSattiHelper.gameCSSConstants.zIndex.PLAYED + 20,
						D: _constantsSattiHelper.gameCSSConstants.zIndex.PLAYED + 30
					};
					this.ox = _constantsSattiHelper.gameCSSConstants.gameBody.width / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.width / 2 + offset.stackH * this.storey * stackDir;
					this.oy = _constantsSattiHelper.gameCSSConstants.gameBody.height / 2 - _constantsSattiHelper.gameCSSConstants.cardSize.height / 2 - _constantsSattiHelper.gameCSSConstants.gameBody.padding + offset.screenOut + offset.stackV * this.storey * stackDir - 10;
					this.dx = 0;
					this.dy = 0;
					this.theta = 0;
					this.showFace = true;
					switch (this.suit) {
						case 'S':
							this.dx = -3 * offset.horz - 3 * _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.zIndex = zIndex.S + this.storey;
							break;
						case 'H':
							this.dx = -1 * offset.horz - 1 * _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.zIndex = zIndex.H + this.storey;
							break;
						case 'C':
							this.dx = 1 * offset.horz + 1 * _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.zIndex = zIndex.C + this.storey;
							break;
						case 'D':
							this.dx = 3 * offset.horz + 3 * _constantsSattiHelper.gameCSSConstants.cardSize.width / 2;
							this.zIndex = zIndex.D + this.storey;
							break;
					}
					switch (this.place) {
						case 'UP':
							this.dy = -(1 * offset.vert + 1 * _constantsSattiHelper.gameCSSConstants.cardSize.height / 2);
							this.theta = 0;
							break;
						case 'MID':
							this.dy = 0;
							this.theta = -54;
							break;
						case 'DOWN':
							this.dy = 1 * offset.vert + 1 * _constantsSattiHelper.gameCSSConstants.cardSize.height / 2;
							this.theta = 0;
							break;
					}
					if (this.storey == 7) {
						// if(this.suit == 'D' || this.suit == 'H'){
						// this.bgColor = 'rgb(255,244,244)';	
						// }else{
						this.bgColor = 'rgb(244,244,244)';
						// }
					}
					this.showFace = true;
					break;
			}
			if (this.state == 'BEING_PLAYED') {
				this.zIndex = _constantsSattiHelper.gameCSSConstants.zIndex.BEING_PLAYED;
			}
			// console.log(this);
			this.calculateActualPosition();
		}
	}, {
		key: 'calculateActualPosition',
		value: function calculateActualPosition() {
			this.x = this.ox + this.dx;
			this.y = this.oy + this.dy;
			this.dx = 0;
			this.dy = 0;
			if (!this.x || !this.y) {
				// console.log(this);
			}
		}
	}]);

	return PlayingCard;
})();

exports['default'] = PlayingCard;
module.exports = exports['default'];