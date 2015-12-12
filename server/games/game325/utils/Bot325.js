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

var _utilsPlayer325 = require('../utils/Player325');

var _utilsPlayer3252 = _interopRequireDefault(_utilsPlayer325);

var _actionsGameActions = require('../actions/GameActions');

var GameActions = _interopRequireWildcard(_actionsGameActions);

var _constantsSattiHelper = require('../constants/SattiHelper');

var Bot325 = (function (_Player325) {
    _inherits(Bot325, _Player325);

    function Bot325(player) {
        _classCallCheck(this, Bot325);

        player.type = 'BOT';
        _get(Object.getPrototypeOf(Bot325.prototype), 'constructor', this).call(this, player);
        this.cards = [];
        this.game = {};
    }

    _createClass(Bot325, [
    {
        key: 'getRandomCardFromPlayersDeck',
        value: function getRandomCardFromPlayersDeck(playerId) {
            var deck = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.game.deck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var deckCard = _step.value;

                    if (deckCard.ownerPos === playerId) {
                        deck.push(deckCard);
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

            var randomInt = Math.floor(Math.random() * 9) + 1;
            return deck[randomInt];
        }
    }, {
        key: 'setTrump',
        value: function setTrump() {
            setTimeout(function () {
                GameActions.setTrump('H');
            }, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
        }
    }, {
        key: 'playCard',
        value: function playCard() {
            var _this = this;

            this.updateState();
            var otherPlayerId = this.game.otherPlayerId;
            var activePlayerId = this.game.activePlayerId;
            var state = this.game.state;
            if (state == 'GAME325_WITHDRAW_CARD') {
                var card = this.getRandomCardFromPlayersDeck(otherPlayerId);
                setTimeout(function () {
                    GameActions.playCard(card);
                }, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
            } else if (state == 'GAME325_RETURN_CARD') {
                var card = this.getRandomCardFromPlayersDeck(activePlayerId);
                setTimeout(function () {
                    GameActions.playCard(card);
                }, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
            } else {
                var _iteratorNormalCompletion2;

                var _didIteratorError2;

                var _iteratorError2;

                var _iterator2, _step2;

                var self;

                (function () {
                    var myPlayableCards = [];
                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;

                    try {
                        for (_iterator2 = _this.cards[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var myCard = _step2.value;

                            if (myCard.isPlayable) {
                                myPlayableCards.push(myCard);
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

                    if (myPlayableCards.length == 0) {
                        console.log('I GOT NO CARD TO PLAY!');
                        self = _this;
                    } else {
                        setTimeout(function () {
                            GameActions.playCard(myPlayableCards.pop());
                        }, _constantsSattiHelper.timeConstants.DISPATCH_DELAY);
                    }
                })();
            }
        }
    }, {
        key: 'playCardv',
        value: function playCardv() {
            this.updateState();
            switch (this.gameState) {
                case 'PLAY_CARD':
                    var e = this.game.activePlayerId;
                    var trump = this.game.trump;
                    var turnSuit = this.game.turnSuit;
                    var deck = this.game.players[e].cards;
                    var playableCards = Array();
                    var trumpCards = Array();
                    var cardToPlay = '';
                    var minSuit = '';
                    var suitCount = [{
                        suit: 'S',
                        count: 0
                    }, {
                        suit: 'H',
                        count: 0
                    }, {
                        suit: 'D',
                        count: 0
                    }, {
                        suit: 'C',
                        count: 0
                    }];
                    for (var i = 0; i < deck.length; i++) {
                        for (var j = suitCount.length - 1; j >= 0; j--) {
                            if (deck[i].suit == suitCount[j].suit) {
                                suitCount[j].count++;
                            }
                        };
                        deck[i].winningProbability = 0;
                    }
                    deck = this.getWinningProbability(deck, suitCount);
                    for (var i = 0; i < deck.length; i++) {
                        if (deck[i].suit == turnSuit) {
                            var a = deck[i];
                            playableCards.push(a);
                        }
                        if (deck[i].suit == trump) {
                            var a = deck[i];
                            trumpCards.push(a);
                        }
                    }
                    if (this.getCurrentPosition() == 0) {
                        cardToPlay = '';
                        minSuit = '';
                        for (var i = trumpCards.length - 1; i >= 0; i--) {
                            if (trumpCards[i].winningProbability == 1) {
                                cardToPlay = trumpCards[i];
                                // console.log('Trump waali chaal :)');
                                break;
                            }
                        };
                        if (cardToPlay != '') {
                            this.cardPlayed(cardToPlay);
                            break;
                        }
                        for (var i = deck.length - 1; i >= 0; i--) {
                            if (deck[i].winningProbability == 1) {
                                cardToPlay = deck[i];
                                // console.log('I played my largest card xD');
                                break;
                            }
                        };
                        if (cardToPlay != '') {
                            this.cardPlayed(cardToPlay);
                            break;
                        }
                        var validMinSuit = Array();
                        for (var i = suitCount.length - 1; i >= 0; i--) {
                            if (suitCount[i].count != 0 && suitCount[i].suit != trump) {
                                validMinSuit.push(suitCount[i]);
                            }
                        };
                        if (validMinSuit.length != 0) {
                            minSuit = validMinSuit[validMinSuit.length - 1];
                            for (var i = validMinSuit.length - 1; i >= 0; i--) {
                                if (validMinSuit[i].count < minSuit.count) {
                                    minSuit = validMinSuit[i];
                                }
                            };
                            // // console.log(minSuit);
                            var minSuitCards = Array();
                            for (var i = deck.length - 1; i >= 0; i--) {
                                if (deck[i].suit == minSuit.suit) {
                                    minSuitCards.push(deck[i]);
                                }
                            };
                            var card = minSuitCards[0];
                            for (var i = 0; i <= minSuitCards.length - 1; i++) {
                                if (minSuitCards[i].currentSuitOrder > card.currentSuitOrder) {
                                    card = minSuitCards[i];
                                }
                            };
                            if (card.currentSuitOrder > 2) {
                                cardToPlay = card;
                                // console.log('Just removing this suit from my deck 8)');
                            } else {
                                    cardToPlay = this.getSmallestCard(deck);
                                    // console.log('This was my smallest card, no options with me ;(');
                                }
                        } else {
                                cardToPlay = this.getSmallestCard(deck);
                                // console.log('This was my smallest card, no options with me ;(');
                            }
                        if (cardToPlay != '') {
                            this.cardPlayed(cardToPlay);
                            break;
                        } else {
                            // console.log('What the Fuck! Nothing to play.')
                        }
                    } else if (this.getCurrentPosition() == 1 || this.getCurrentPosition() == 2) {
                            var playedCards = this.game.playedCards;
                            var oppCard = Array();
                            var greaterCards = Array();
                            var cardToPlay = '';
                            for (var i = playedCards.length - 1; i >= 0; i--) {
                                for (var key in this.game.playedCards[i]) {
                                    if (this.game.playedCards[i].hasOwnProperty(key)) {
                                        oppCard.push(playedCards[i]);
                                        break;
                                    }
                                }
                            };
                            // // console.log(playableCards);
                            // // console.log(trumpCards);
                            if (playableCards.length > 0) {
                                var trumpHit = false;
                                var smallestPlayable = playableCards[playableCards.length - 1];
                                for (var i = playableCards.length - 1; i >= 0; i--) {
                                    if (this.getCurrentPosition() == 1) {
                                        if (playableCards[i].winningProbability == 1) {
                                            cardToPlay = playableCards[i];
                                            // console.log('I played the largest card :D');
                                            break;
                                        }
                                        if (playableCards[i].rank > oppCard[0].rank) {
                                            greaterCards.push(playableCards[i]);
                                        }
                                    } else {
                                        if (playableCards[i].rank > oppCard[0].rank && playableCards[i].rank > oppCard[1].rank) {
                                            greaterCards.push(playableCards[i]);
                                        }
                                        if (oppCard[0].suit == trump && oppCard[1].suit != trump || oppCard[0].suit != trump && oppCard[1].suit == trump) {
                                            trumpHit = true;
                                        }
                                    }
                                    if (playableCards[i].currentSuitOrder > smallestPlayable.currentSuitOrder) {
                                        smallestPlayable = playableCards[i];
                                    }
                                };
                                if (trumpHit) {
                                    cardToPlay = smallestPlayable;
                                    // console.log('Only smaller cards to be sacrificed to a trump');
                                }
                                if (cardToPlay != '') {
                                    this.cardPlayed(cardToPlay);
                                    break;
                                }
                                var cardToPlay = greaterCards[greaterCards.length - 1];
                                for (var i = greaterCards.length - 1; i >= 1; i--) {
                                    if (greaterCards[i].currentSuitOrder > cardToPlay.currentSuitOrder) {
                                        cardToPlay = greaterCards[i];
                                    }
                                };
                                if (greaterCards.length > 0) {
                                    this.cardPlayed(cardToPlay);
                                    // console.log('I played a larger card :)');
                                    break;
                                } else {
                                    this.cardPlayed(smallestPlayable);
                                    // console.log('I played the smallest playable card :(');
                                    break;
                                }
                            } else if (trumpCards.length > 0) {
                                var trumpHit = false;
                                if (this.getCurrentPosition() == 2) {
                                    if (oppCard[0].suit == trump && oppCard[1].suit != trump) {
                                        trumpHit = true;
                                        var oppTrump = oppCard[0];
                                    }
                                    if (oppCard[0].suit != trump && oppCard[1].suit == trump) {
                                        trumpHit = true;
                                        var oppTrump = oppCard[1];
                                    }
                                }
                                if (trumpHit) {
                                    var greaterTrumps = Array();
                                    for (var i = trumpCards.length - 1; i >= 0; i--) {
                                        if (trumpCards[i].rank > oppTrump.rank) {
                                            greaterTrumps.push(trumpCards[i]);
                                        }
                                    };
                                    // console.log(greaterTrumps);
                                    var cardToPlay = greaterTrumps[greaterTrumps.length - 1];
                                    for (var i = greaterTrumps.length - 1; i >= 0; i--) {
                                        if (greaterTrumps[i].currentSuitOrder > cardToPlay.currentSuitOrder) {
                                            cardToPlay = greaterTrumps[i];
                                        }
                                    };
                                    if (greaterTrumps.length > 0 && cardToPlay != '') {
                                        this.cardPlayed(cardToPlay);
                                        // console.log('Guess what, I have a bigger trump, bitch! xD');
                                        break;
                                    }
                                }
                                var cardToPlay = trumpCards[trumpCards.length - 1];
                                for (var i = trumpCards.length - 1; i >= 1; i--) {
                                    if (trumpCards[i].currentSuitOrder > cardToPlay.currentSuitOrder) {
                                        cardToPlay = trumpCards[i];
                                    }
                                };
                                this.cardPlayed(cardToPlay);
                                // console.log('Taste my little trump, bitch! xD');
                                break;
                            } else {
                                var validMinSuit = Array();
                                for (var i = suitCount.length - 1; i >= 0; i--) {
                                    if (suitCount[i].count != 0 && suitCount[i].suit != trump) {
                                        validMinSuit.push(suitCount[i]);
                                    }
                                };
                                minSuit = validMinSuit[validMinSuit.length - 1];
                                for (var i = validMinSuit.length - 1; i >= 0; i--) {
                                    if (validMinSuit[i].count < minSuit.count) {
                                        minSuit = validMinSuit[i];
                                    }
                                };
                                // // console.log(validMinSuit);
                                var minSuitCards = Array();
                                for (var i = deck.length - 1; i >= 0; i--) {
                                    if (deck[i].suit == minSuit.suit) {
                                        minSuitCards.push(deck[i]);
                                    }
                                };
                                var card = minSuitCards[0];
                                for (var i = 0; i <= minSuitCards.length - 1; i++) {
                                    if (minSuitCards[i].currentSuitOrder > card.currentSuitOrder) {
                                        card = minSuitCards[i];
                                    }
                                };
                                if (card.currentSuitOrder > 2) {
                                    this.cardPlayed(card);
                                    // console.log('Just removing this suit from my deck 8)');
                                    break;
                                } else {
                                    var card = this.getSmallestCard(deck);
                                    this.cardPlayed(card);
                                    // console.log('This was my smallest card, no options with me ;(');
                                    break;
                                }
                            }
                        }
                    // console.log('No cards to Play! Fuck!');
                    break;
                case 'SET_TRUMP':
                    // // console.log('bot setting Trump now');
                    var e = this.game.activePlayerId;
                    var deck = this.game.players[e].cards;
                    // var trumps = ['S', 'H', 'C', 'D'];
                    var suitWeight = [{
                        suit: 'S',
                        weight: 0
                    }, {
                        suit: 'H',
                        weight: 0
                    }, {
                        suit: 'C',
                        weight: 0
                    }, {
                        suit: 'D',
                        weight: 0
                    }];
                    // var trump = trumps[Math.floor(Math.random()*trumps.length)];
                    for (var i = deck.length - 1; i >= 0; i--) {
                        for (var j = suitWeight.length - 1; j >= 0; j--) {
                            if (deck[i].suit == suitWeight[j].suit) {
                                suitWeight[j].weight += deck[i].rank;
                            }
                        };
                    };
                    // // console.log(suitWeight);
                    maxSuitWeight = suitWeight[suitWeight.length - 1];
                    for (var i = suitWeight.length - 1; i >= 0; i--) {
                        if (suitWeight[i].weight > maxSuitWeight.weight) {
                            maxSuitWeight = suitWeight[i];
                        }
                    };
                    var trump = maxSuitWeight.suit;
                    var self = this;
                    var fn = function fn() {
                        self.setTrump(trump);
                    };
                    delayService.asyncTask(1000, fn);
                    break;
                case 'WITHDRAW_CARD':
                    var cardIndex = Math.floor(Math.random() * 10);
                    var self = this;
                    var data = {
                        gameState: 'WITHDRAW_CARD',
                        gameEvent: 'WITHDRAW_CARD',
                        card: cardIndex
                    };
                    var fn = function fn() {
                        self.clickHandler(data);
                    };
                    delayService.asyncTask(2000, fn);
                    // socket.emit('GAME', {data : data});
                    break;
                case 'RETURN_CARD':
                    var e = this.game.activePlayerId;
                    var deck = this.game.players[e].cards;
                    var trump = this.game.trump;
                    var minSuit = '';
                    var suitCount = [{
                        suit: 'S',
                        count: 0
                    }, {
                        suit: 'H',
                        count: 0
                    }, {
                        suit: 'D',
                        count: 0
                    }, {
                        suit: 'C',
                        count: 0
                    }];
                    for (var i = 0; i < deck.length; i++) {
                        for (var j = suitCount.length - 1; j >= 0; j--) {
                            if (deck[i].suit == suitCount[j].suit) {
                                suitCount[j].count++;
                            }
                        };
                    }
                    var validMinSuit = Array();
                    for (var i = suitCount.length - 1; i >= 0; i--) {
                        if (suitCount[i].count != 0 && suitCount[i].suit != trump) {
                            validMinSuit.push(suitCount[i]);
                        }
                    };
                    minSuit = validMinSuit[validMinSuit.length - 1];
                    for (var i = validMinSuit.length - 1; i >= 0; i--) {
                        if (validMinSuit[i].count < minSuit.count) {
                            minSuit = validMinSuit[i];
                        }
                    };
                    var minSuitCardIndex = Array();
                    for (var i = deck.length - 1; i >= 0; i--) {
                        if (deck[i].suit == minSuit.suit) {
                            minSuitCardIndex.push(i);
                        }
                    };
                    var cardIndex = minSuitCardIndex[0];
                    for (var i = 0; i <= minSuitCardIndex.length - 1; i++) {
                        if (deck[minSuitCardIndex[i]].rank < deck[cardIndex].rank) {
                            cardIndex = minSuitCardIndex[i];
                        }
                    };
                    if (deck[cardIndex].rank < 11) {
                        var selectedCardIndex = cardIndex;
                    } else {
                        var smallestIndex = deck.length - 1;
                        for (var i = deck.length - 1; i >= 1; i--) {
                            if (deck[smallestIndex].suit == trump && deck[i].suit != trump) {
                                smallestIndex = i;
                            }
                            if (deck[i].rank < deck[smallestIndex].rank && deck[i].suit != trump) {
                                smallestIndex = i;
                            }
                        };
                        var selectedCardIndex = smallestIndex;
                    }
                    var self = this;
                    var data = {
                        gameState: 'RETURN_CARD',
                        gameEvent: 'RETURN_CARD',
                        card: selectedCardIndex
                    };
                    var fn = function fn() {
                        self.clickHandler(data);
                    };
                    delayService.asyncTask(2000, fn);
                    break;
                default:
                    break;
            }
        }
    }]);

    return Bot325;
})(_utilsPlayer3252['default']);

exports['default'] = Bot325;
module.exports = exports['default'];