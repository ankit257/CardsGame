// var io = require('socket.io');
var Game325 = require('./games/Game325');
var Game7Center = require('./games/Game7Center');

module.exports = function (io, app) {
	io.on('connection', function (socket){
		var redisClient = app.get('redisClient');
		var roomId;
		var game;
		socket.on('getRooms', function (err, rooms){
			redisClient.smembers('rooms', function (err, roomsData){
				socket.emit('rooms', {'roomNo' : roomsData})
			})
		});
		socket.on('join_room', function (data){
			roomId = data.roomId;
			var profile = data.profile;
			game = data.game;
			redisClient.get('Game:'+roomId, function (err, gameData){
				if(err)
					throw err;
				gameData = JSON.parse(gameData);
				if(!gameData || gameData === null || (Object.keys(gameData).length==0)){
					if(gameData == null || (Object.keys(gameData).length==0)){
						redisClient.del('Game:'+roomId, function (err, gameData){})
					}
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(roomData[game] && roomData[game][roomId]){
							delete roomData[game][roomId];
						}
						redisClient.set('roomData', JSON.stringify(roomData), function (err, roomData){
							if(err)
								throw err;
							console.log(roomData);
							socket.emit('invalid_room', {});	
						})
					})
				}else{
					gameData.roomAvailabilityIndex = -1;
					var playersJoined = 0;
					var activePlayers = 0;
					for (var i = gameData.players.length-1; i >= 0; i--) {
						if(gameData.players[i].id == 'BOT'){
							gameData.roomAvailabilityIndex = i;
						}
					}
					if(gameData.roomAvailabilityIndex == -1){
						socket.emit('room_full');
					}else{
						socket.join(roomId); //
						gameData.players[gameData.roomAvailabilityIndex].id = socket.id;
						if(gameData.roomAvailabilityIndex === 0){
							gameData.activePlayerId = socket.id;
						}
						gameData.players[gameData.roomAvailabilityIndex].profile = profile;
						for (var i = 0; i < gameData.players.length; i++) {
							if(gameData.players[i].id !== 'BOT'){
								playersJoined++;
							}
						}
						redisClient.get('roomData', function (err, roomData){
							console.log(roomData)
							var roomData = JSON.parse(roomData);
							if(playersJoined == gameData.players.length){
								delete roomData[game][roomId];
							}else{
								roomData[game][roomId][0] = playersJoined;
							}
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
								if(err)
									throw err;
								redisClient.set('Game:'+roomId, JSON.stringify(gameData), function (err, success){
									io.sockets.in(roomId).emit('room_joined', {'data': JSON.stringify(gameData)});
									if(playersJoined === gameData.players.length){
										io.sockets.in(roomId).emit('start_game', {'data': JSON.stringify(gameData)});
									}	
								});
							});
						});
					}
				}
			});
		});
		socket.on('leave_room', function (data){
			var game = data.game;
			socket.leave(roomId); //
			redisClient.get('Game:'+roomId, function (err, gameData){
				var gameObj = JSON.parse(gameData);
				if(err)
					throw err;
				var noOfBots = 0;
				var activePlayers = 0
				if(gameData && gameData != null){
					for (var i = gameObj.players.length - 1; i >= 0; i--){
						if(gameObj.players[i].id == socket.id)
							gameObj.players[i].id = 'BOT';
						if(gameObj.players[i].id == 'BOT')
							noOfBots++;
					}
					activePlayers = gameObj.players.length - noOfBots;
				}
				redisClient.get('roomData', function (err, roomData){
					roomData = JSON.parse(roomData);
					if(!gameData || gameData == null || activePlayers == 0){
						delete roomData[game][roomId];
					}else{
						gameObj.status = 'PLAYER_LEFT';
						roomData[gameObj.game][roomId] = [activePlayers, gameObj.game];
					}
					redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
						if(err)
							throw err;
						if(gameData && gameData != null && activePlayers != 0){
							redisClient.set('Game:'+roomId, JSON.stringify(gameObj), function (err, success){
								if(err)
									throw err;
								io.sockets.in(roomId).emit('player_changed', {'data': JSON.stringify(gameObj)});
							});
						}else{
							redisClient.del('Game:'+roomId);
						}
					})
				})
			});
		});
		socket.on('disconnect', function(){
			if(!roomId){
				return false;
			}
			socket.leave(roomId); //
			redisClient.get('Game:'+roomId, function (err, gameData){
				var gameObj = JSON.parse(gameData);
				if(err)
					throw err;
				var noOfBots = 0;
				var activePlayers = 0
				if(gameData && gameData != null){
					for (var i = gameObj.players.length - 1; i >= 0; i--){
						if(gameObj.players[i].id == socket.id)
							gameObj.players[i].id = 'BOT';
						if(gameObj.players[i].id == 'BOT')
							noOfBots++;
					}
					activePlayers = gameObj.players.length - noOfBots;
				}
				redisClient.get('roomData', function (err, roomData){
					roomData = JSON.parse(roomData);
					if(!gameData || gameData == null || activePlayers == 0){
						delete roomData[game][roomId];
					}else{
						gameObj.status = 'PLAYER_LEFT';
						roomData[gameObj.game][roomId] = [activePlayers, gameObj.game];
					}
					redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
						if(err)
							throw err;
						if(gameData && gameData != null && activePlayers != 0){
							redisClient.set('Game:'+roomId, JSON.stringify(gameObj), function (err, success){
								if(err)
									throw err;
								io.sockets.in(roomId).emit('player_changed', {'data': JSON.stringify(gameObj)});
							});
						}else{
							redisClient.del('Game:'+roomId);
						}
					})
				})
			});
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

