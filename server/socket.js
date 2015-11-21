// var io = require('socket.io');
var Game325 = require('./games/Game325');
var Game7Center = require('./games/Game7Center');

module.exports = function (io, app) {
	io.on('connection', function (socket){
		var redisClient = app.get('redisClient');
		var roomId;
		socket.on('getRooms', function (err, rooms){
			redisClient.smembers('rooms', function (err, roomsData){
				socket.emit('rooms', {'roomNo' : roomsData})
			})
		});
		socket.on('join_room', function (data){
			roomId = data.roomId;
			var profile = data.profile;
			socket.join(roomId);
			redisClient.get('Game:'+roomId, function (err, gameData){
				gameData = JSON.parse(gameData);
				gameData.roomAvailabilityIndex = -1;
				var playersJoined = 0;
				for (var i = gameData.players.length-1; i >= 0; i--) {
					if(gameData.players[i].id == 'BOT'){
						gameData.roomAvailabilityIndex = i;
						playersJoined++;
					}
				}
				if(gameData.roomAvailabilityIndex == -1){
					socket.emit('room_full');
				}else{
					gameData.players[gameData.roomAvailabilityIndex].id = socket.id;
					if(gameData.roomAvailabilityIndex === 0){
						gameData.activePlayerId = socket.id;
					}
					gameData.players[gameData.roomAvailabilityIndex].profile = profile;
					// socket.in(roomId).emit('room_joined', {'data': JSON.stringify(gameData)});
					io.sockets.in(roomId).emit('room_joined', {'data': JSON.stringify(gameData)});
					if(playersJoined === gameData.players.length){
						// socket.in(roomId).emit('start_game', {'data': JSON.stringify(gameData)});
						io.sockets.in(roomId).emit('start_game', {'data': JSON.stringify(gameData)});
					}
				}
				
			})
		});
		socket.on('leave_room', function (data){
			redisClient.get('Game:'+roomId, function (err, gameData){
				if(!roomId)
					return false;
				if(err)
					throw err;
				var gameObj = JSON.parse(gameData);
				var noOfBots = 0;
				for (var i = gameObj.players.length - 1; i >= 0; i--) {
					if(gameObj.players[i].id == socket.id){
						gameObj.players[i].id = 'BOT';
					}
					if(gameObj.players[i].id == 'BOT'){
						noOfBots++;
					}
				}
				if(noOfBots == gameObj.players.length){
					//delete gameRoom
				}else{
					gameObj.status = 'PLAYER_LEFT';
					redisClient.set('Game:'+roomId, JSON.stringify(gameObj) function (err, gameData){
						io.sockets.in(roomId).emit('player_changed', {'data': JSON.stringify(gameData)});
					})
				}
			})
		});
		socket.on('disconnect', function(){
			redisClient.get('Game:'+roomId, function (err, gameData){
				if(!roomId)
					return false;
				if(err)
					throw err;
				var gameObj = JSON.parse(gameData);
				for (var i = gameObj.players.length - 1; i >= 0; i--) {
					if(gameObj.players[i].id == socket.id){
						gameObj.players[i].id = 'BOT';
					}
				};
			})
		});
		socket.on('play_card', function (data){
			redisClient.get('Game:'+roomId, function (err, gameData){
				switch(gameData.game){
					case 'Game325':
						var newGame = Game325.call(data);
					case 'Game7Center':
						var newGame = Game7Center.call(data);
				}

				redisClient.set('Game:'+roomId, function (err, gameData){
					socket.in(roomId).emit('game_state', {'gameData': gameData});
				})
			})

		})

	})
}

