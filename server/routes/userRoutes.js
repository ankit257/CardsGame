var User = require('../models/user');
var Score = require('../models/score');
var passport = require('passport');

module.exports = function (app, passport) {
	/**
	* Route to get Logged in User Object
	*/
	app.post('/api/auth', function (req, res){
		// console.log(req)
		res.json({'req' : req.user})
	});
	/**
	* Log in User with User Object retrieved from Client Side
	*/
	app.post('/api/login', passport.authenticate('local'), function (req, res) {
	    res.json({'req': req.user});
	});
	/**
	* Form Submit
	*/
	app.post('/api/formsubmit', function (req, res) {
		fs.readFile(req.files.displayImage.path, function (err, data) {
			var newPath = __dirname + "/uploads/uploadedFileName";
			fs.writeFile(newPath, data, function (err) {
			res.redirect("back");
			});
		});
	});
	/**
	* Log out user and destroy Session
	*/
	app.post('/api/logout', function (req, res){
		req.logout();
		res.json({'req': req.user});
	});
	

	app.post('/api/scores', function(req, res){
		if(req.user && req.user.id){
			Score.findByUser(req.user.id, function(score){
				res.json({score: score});
			});
		}else{
			res.json({});
		}
	})

	app.post('/api/game7/scores', function(req, res){
		clientScore = req.body.score;
		if(req.user && req.user.id && clientScore && clientScore.stats && clientScore.stats.roundsPlayed !== undefined){
			Score.findByUser(req.user.id, function(score){
				if(score.game7.stats.roundsPlayed > clientScore.stats.roundsPlayed){
					res.json({score: score, game: 'game7'});
				}else{
					score.game7.stats.roundsPlayed = clientScore.stats.roundsPlayed;
					score.game7.stats.xp = clientScore.stats.xp;
					score.save(function(err){
						if(err) console.log(err);
						res.json({score: score, game: 'game7'});
					})
				}
			});
		}else{
			res.json({});
		}
	})	
}