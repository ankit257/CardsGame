// var io = require('socket.io');

/* roomData Format
	roomData[game][roomId] = [numberOfPlayers gameType gameState showOrHide]
	numberOfPlayers: 
	gameType  : 'game325' || 'game7'   || anyOtherGame
	gameState : 'waiting' || 'running'
	showOrHide: 'show'    || 'hide'
*/

var Game325 = require('./games/game325/Game325');
var Game7Centre = require('./games/game7/Game7Centre');

module.exports = function (io, app) {
	io.on('connection', function (socket){
		var redisClient = app.get('redisClient');
		var roomId;
		var game;
		// socket.on('getRooms', function (err, rooms){
		// 	redisClient.smembers('rooms', function (err, roomsData){
		// 		socket.emit('rooms', {'roomNo' : roomsData})
		// 	})
		// });
		socket.on('join_room', function (data){
			roomId = data.roomId;
			game = data.game;
			var profile = data.profile;
			if(!roomId || !profile || !game){
				socket.emit('invalid_room', {});
				return;
			}
			redisClient.get('Game:'+roomId, function (err, gameData){  						// get GameData from roomId
				if(err)
					throw err;
				gameData = JSON.parse(gameData);
				if(!gameData || gameData === null || (Object.keys(gameData).length==0)){ 	
					redisClient.del('Game:'+roomId)
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(roomData[game] && roomData[game][roomId]){
							delete roomData[game][roomId];									// *ROOM_DATA_DESTROYED_HERE* if gameData does not exist, destroy roomId key
						}
						redisClient.set('roomData', JSON.stringify(roomData), function (err, roomData){
							if(err)
								throw err;
							socket.emit('invalid_room', {});	
						})
					})
				}else{ // if gameData exists for roomId
					gameData.roomAvailabilityIndex = -1;
					var humansJoined = 0;
					var activePlayers = 0;
					for (var i = gameData.players.length-1; i >= 0; i--) {  // set roomAvailabilityIndex to appropriate bot location 
						if(gameData.players[i].type == 'BOT'){
							gameData.roomAvailabilityIndex = i;
						}
					}
					if(gameData.roomAvailabilityIndex == -1){              // if no bots found, emit room_full
						socket.emit('room_full');
					}else{												   // if bot(s) found, check if game waiting or running
						redisClient.get('roomData', function (err, roomData){
							var roomData = JSON.parse(roomData);
							if(!roomData[game][roomId]){
								socket.emit('invalid_room', {});
								return;
							}
							var thisPlayerId = '';
							socket.join(roomId);
							if(roomData[game] && roomData[game][roomId] && roomData[game][roomId][2] == 'waiting')
							{
								var joinindex = gameData.roomAvailabilityIndex;
								thisPlayerId = roomId+joinindex;
								gameData.players[joinindex].socket = socket.id;
								gameData.players[joinindex].id = thisPlayerId;
								gameData.players[joinindex].type = 'HUMAN';
								gameData.players[joinindex].profile = profile;
								// set admin
								var adminFound = false;
								for (var i = 0; i < gameData.players.length; i++) {
									if(gameData.players[i].type == 'ADMIN'){
										adminFound = true;
									}
								}
								if(!adminFound){
									for (var i = 0; i < gameData.players.length; i++) {
										if(gameData.players[i].type == 'HUMAN'){
											gameData.players[i].type = 'ADMIN';
											gameData.adminId = gameData.players[i].id;
											break;
										}
									};
								}
							}else if(roomData[game] && roomData[game][roomId] && roomData[game][roomId][2] == 'running'){
								var joinindex = gameData.roomAvailabilityIndex;
								thisPlayerId = roomId+joinindex;
								gameData.players[joinindex].socket = socket.id;
								gameData.players[joinindex].id = thisPlayerId;
								gameData.players[joinindex].type = 'SPECTATOR';
								gameData.players[joinindex].profile = profile;
							}else{
								socket.emit('invalid_room');
								return;
							}
							for (var i = 0; i < gameData.players.length; i++) {
									if(gameData.players[i].type !== 'BOT'){
										humansJoined++;
									}
							}
							if(humansJoined == gameData.players.length){
								roomData[game][roomId][3] = 'hide';       // <- This line gives error
							}else{
								roomData[game][roomId][0] = humansJoined; 
							}
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
								if(err)
									throw err;
								redisClient.set('Game:'+roomId, JSON.stringify(gameData), function (err, success){
									var clientData = {'action': 'SET_ID', 'id': thisPlayerId}
									io.sockets.connected[socket.id].emit('game_state', {clientData : clientData});
									io.sockets.in(roomId).emit('room_joined', {'data': gameData});
								});
							});
						});
					}
				}
			});
		});
		socket.on('leave_room', function (data){
			var game = data.game;
			roomId = data.roomId;
			socket.leave(roomId); //
			var noOfBots = 0;
			var activePlayers = 0;
			var spectatorLeft = false;
			redisClient.get('Game:'+roomId, function (err, gameData){
				var gameObj = JSON.parse(gameData);
				if(err)
					throw err;
				if(!gameObj || gameObj === null || (Object.keys(gameObj).length==0)){ 	
					redisClient.del('Game:'+roomId);
					if(roomId) {io.sockets.in(roomId).emit('invalid_room', {})};	
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(roomData[game] && roomData[game][roomId]){
							delete roomData[game][roomId];									// *ROOM_DATA_DESTROYED_HERE* if gameData does not exist, destroy roomId key
						}
						redisClient.set('roomData', JSON.stringify(roomData), function (err, roomData){})
					})
				}
				else
				{
					for (var i = gameObj.players.length - 1; i >= 0; i--){
						if(gameObj.players[i].socket == socket.id){
							gameObj.players[i].type = 'BOT';
							gameObj.players[i].socket = '';
							if(gameObj.players[i].type == 'SPECTATOR'){
								spectatorLeft = true;
								console.log('spectator left');
							}
						}

						if(gameObj.players[i] && (gameObj.players[i].type == 'BOT' || gameObj.players[i].type == 'SPECTATOR'))
							noOfBots++;
					}
					activePlayers = gameObj.players.length - noOfBots;
					// set admin
					var adminFound = false;
					for (var i = 0; i < gameObj.players.length; i++) {
						if(gameObj.players[i].type == 'ADMIN'){
							adminFound = true;
						}
					}
					if(!adminFound){
						for (var i = 0; i < gameObj.players.length; i++) {
							if(gameObj.players[i].type == 'ADMIN') break;
							if(gameObj.players[i].type == 'HUMAN'){
								gameObj.players[i].type = 'ADMIN';
								gameObj.adminId = gameObj.players[i].id;
								break;
							}
						};
					}
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(!roomData[game][roomId]){
							redisClient.del('Game:'+roomId)
							if(roomId) {io.sockets.in(roomId).emit('invalid_room', {})};	
							return;
						}
						if(activePlayers == 0){
							delete roomData[game][roomId];
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){});
							if(roomId){
								redisClient.del('Game:'+roomId);
								io.sockets.in(roomId).emit('invalid_room', {});
							}
						}else{
							// gameObj.status = 'PLAYER_LEFT';
							roomData[gameObj.game][roomId][0] = activePlayers;
							roomData[gameObj.game][roomId][3] = 'show';
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
								if(err)
									throw err;
								redisClient.set('Game:'+roomId, JSON.stringify(gameObj), function (err, success){
									if(err)
										throw err;
									if(!spectatorLeft){
										io.sockets.in(roomId).emit('player_changed', {'game': gameObj.game, 'players': gameObj.players});	
										// console.log('player_changed');
									}
								});
							})
						}
					})
				}
			});
		});
		socket.on('disconnect', function(){
			console.log('disconnect');
			if(!roomId){
				return false;
			}
			console.log(roomId);
			socket.leave(roomId); //
			var noOfBots = 0;
			var activePlayers = 0;
			var spectatorLeft = false;
			redisClient.get('Game:'+roomId, function (err, gameData){
				var gameObj = JSON.parse(gameData);
				if(err)
					throw err;
				if(!gameObj || gameObj === null || (Object.keys(gameObj).length==0)){ 	
					redisClient.del('Game:'+roomId);
					if(roomId) {io.sockets.in(roomId).emit('invalid_room', {})};	
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(roomData[game] && roomData[game][roomId]){
							delete roomData[game][roomId];									// *ROOM_DATA_DESTROYED_HERE* if gameData does not exist, destroy roomId key
						}
						redisClient.set('roomData', JSON.stringify(roomData), function (err, roomData){})
					})
				}
				else
				{
					for (var i = gameObj.players.length - 1; i >= 0; i--){
						if(gameObj.players[i].socket == socket.id){
							gameObj.players[i].type = 'BOT';
							gameObj.players[i].socket = '';
							if(gameObj.players[i].type == 'SPECTATOR'){
								spectatorLeft = true;
								console.log('spectator left');
							}
						}

						if(gameObj.players[i] && (gameObj.players[i].type == 'BOT' || gameObj.players[i].type == 'SPECTATOR'))
							noOfBots++;
					}
					activePlayers = gameObj.players.length - noOfBots;
					// set admin
					var adminFound = false;
					for (var i = 0; i < gameObj.players.length; i++) {
						if(gameObj.players[i].type == 'ADMIN'){
							adminFound = true;
						}
					}
					if(!adminFound){
						for (var i = 0; i < gameObj.players.length; i++) {
							if(gameObj.players[i].type == 'ADMIN') break;
							if(gameObj.players[i].type == 'HUMAN'){
								gameObj.players[i].type = 'ADMIN';
								gameObj.adminId = gameObj.players[i].id;
								break;
							}
						};
					}
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(!roomData[game][roomId]){
							if(roomId) {io.sockets.in(roomId).emit('invalid_room', {})}
							return;
						}
						if(activePlayers == 0){
							redisClient.del('Game:'+roomId);
							delete roomData[game][roomId];
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){});
							if(roomId){
								redisClient.del('Game:'+roomId);
								io.sockets.in(roomId).emit('invalid_room', {});
							}
						}else{
							// gameObj.status = 'PLAYER_LEFT';
							roomData[gameObj.game][roomId][0] = activePlayers;
							roomData[gameObj.game][roomId][3] = 'show';
							redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
								if(err)
									throw err;
								redisClient.set('Game:'+roomId, JSON.stringify(gameObj), function (err, success){
									if(err)
										throw err;
									if(!spectatorLeft){
										io.sockets.in(roomId).emit('player_changed', {'game': gameObj.game, 'players': gameObj.players});	
										// console.log('player_changed');
									}
								});
							})
						}
					})
				}
			});
		});
		socket.on('play_card', function (clientData){
			redisClient.get('Game:'+roomId, function (err, gameData){
				if(err)
					throw err;
				gameData = JSON.parse(gameData);
				if(!gameData || gameData === null || (Object.keys(gameData).length==0)){ // if gameData does not exist, destroy roomData
					redisClient.del('Game:'+roomId);
					redisClient.get('roomData', function (err, roomData){
						roomData = JSON.parse(roomData);
						if(roomData[game] && roomData[game][roomId]){
							delete roomData[game][roomId];
						}
						redisClient.set('roomData', JSON.stringify(roomData), function (err, roomData){
							if(err)
								throw err;
							socket.emit('invalid_room', {});	
						})
					})
				}else{ 
					// if gameData exists for roomId
					redisClient.get('roomData', function (err, roomData){  // Set GameStatus in roomData = 'running'
						var roomData = JSON.parse(roomData);
						roomData[game][roomId][2] = 'running'; 
						redisClient.set('roomData', JSON.stringify(roomData), function (err, success){
							if(err)
								throw err;
									// redisClient.set('Game:'+roomId, JSON.stringify(gameData), function (err, success){
									// Now handle play_card
									var newClientData = {}, newGameData = {}, newData;
									switch(gameData.game){
										case 'game325':
											newData = Game325.handlePlayCard({clientData: clientData, gameData: gameData});
										case 'game7':
											newData = Game7Centre.handlePlayCard({clientData: clientData, gameData: gameData});
									}
									if(typeof newData === 'undefined'){
												return;
									}else{
										newClientData = newData.clientData;
										newGameData   = newData.gameData;
										redisClient.set('Game:'+roomId, JSON.stringify(newGameData), function (err, success){
											io.sockets.in(roomId).emit('game_state', {'clientData': newClientData});
										})
									}
									// play card handle end
							// });
						});
					});
				} // gameData exists elseblock end
			})
		})// socket.on('play_card') end
	})
}

