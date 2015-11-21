var User = require('../models/user');
var passport = require('passport');

module.exports = function (app, passport) {
	/**
	* Route to get Logged in User Object
	*/
	app.post('/api/auth', function (req, res){
		// console.log(req)
		res.json({'req' : req.headers})
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
	
}