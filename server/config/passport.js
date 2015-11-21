var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var configAuth = require('./authConfig');

module.exports = function(app, passport){
    //Serialize User
    passport.serializeUser(function (user, done){
        done(null, user.id);
    });
    //Deserialize User
    passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use(new LocalStrategy(
        {passReqToCallback: true},
        function (req, username, password, done){
            process.nextTick(function() {
                var profile = req.body;
                console.log(profile)
                User.findOne({'facebook.id' : profile.id}, function (err, user) {
                    if(err) return err;
                    if(user){
                        console.log(user)
                        return done(null, user);
                    }else{
                        var newUser                 = new User();
                        newUser.facebook.id         = profile.id;
                        newUser.facebook.firstName  = profile.first_name;
                        newUser.facebook.lastName   = profile.last_name;
                        newUser.facebook.token      = profile.id;
                        newUser.email               = profile.email;
                        newUser.facebook.img        = profile.picture.data.url;
                        // Save user into the database
                        newUser.save(function(err) {
                            console.log(123);
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    } 
                })
            })
        }
    ));
}