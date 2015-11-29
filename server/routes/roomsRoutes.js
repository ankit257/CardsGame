var User = require('../models/user');
var gameRules = require('../config/gameRules');
var express  = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var GameRoomData = { 'game325':{}, 'game7' : {} }
var getRoomObj = function(roomId, game){
	switch(game){
		case 'game325':
			var players = 3;
		case 'game7':
			var players = 4;
	}
	return {roomId : players};
}

var Game325 = require('../utils/game325');

module.exports = function (app, passport) {
	var redisClient = app.get('redisClient');
	var GameRoomData = {
		'game325' : {},
		'game7' : {},
	}
	redisClient.set('roomData', JSON.stringify(GameRoomData));
	/**
	* Route to create Game Room
	*/
	app.post('/api/createroom', function (req, res){
		var game = req.body.game;
		var type = req.body.type;
		var roomId = randomstring.generate(5);
		switch(game){
			case 'game325':
				var gameInstance = new Game325();
				gameInstance.init();
				gameInstance.type = type;
				gameInstance.game = game;
				break;
		}
		var key = 'Game:'+roomId;
		redisClient.get('roomData', function (err, roomData){
			roomData = JSON.parse(roomData);
			roomData[game][roomId] = [0, type];
			redisClient.set('roomData', JSON.stringify(roomData), function (err, done){
				if(err)
					throw err;
				redisClient.set(key, JSON.stringify(gameInstance), function (err, gameRoomAdded){
					res.json({'roomId': roomId, 'game': game});
				})	
			})	
		});
	});
	app.post('/api/getrooms', function (req, res){
		redisClient.get('roomData', function (err, roomData){
			roomData = JSON.parse(roomData);
			res.json({'data' : roomData})
		})
	})
	
}