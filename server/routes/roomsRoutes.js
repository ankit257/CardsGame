var User = require('../models/user');
var gameRules = require('../config/gameRules');
var express  = require('express');
var router = express.Router();
var randomstring = require("randomstring");

var Game325 = require('../utils/game325');

module.exports = function (app, passport) {
	/**
	* Route to create Game Room
	*/
	app.post('/api/createroom', function (req, res){
		var redisClient = app.get('redisClient');
		var game = req.body.game;
		var type = req.body.type;
		var roomId = randomstring.generate(5);
		switch(game){
			case 'game325':
				var gameInstance = new Game325();
				gameInstance.init();
				gameInstance.type = type;
				break;
		}
		var key = 'Game:'+roomId;
		redisClient.sadd('rooms', roomId, function (err, done){
			redisClient.set(key, JSON.stringify(gameInstance), function (err, gameRoomAdded){
				console.log(key)
				res.json({'roomId': roomId, 'game': game});
			})	
		})
		
		
	});
	
}