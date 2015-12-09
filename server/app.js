var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var redis = require('redis');
var session = require('express-session');
var cors = require('cors');
var router = express.Router();
var passport = require('passport');

if(process.env.REDISCLOUD_URL)
{
	var url = require('url');
	var redisURL = url.parse(process.env.REDISCLOUD_URL);
	var redisClient = redis.createClient(redisURL.port, redisURL.hostname);
	redisClient.auth(redisURL.auth.split(":")[1]);
}else{
  // console.log(999990000)
  var redisClient = redis.createClient();
}

var redisStore = require('connect-redis')(session);
var config = {
    'session': {
      'secret': 'walterwhite'
    }
}

var mongoose = require('mongoose');
var configDB = require('./config/dbConfig').local;
mongoose.connect(configDB.url);

var app = express();

var corsOptions = { origin: 'http://localhost:3000', 'credentials' : true }
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('sessionStore', new redisStore({
  client: redisClient
}));
app.set('rootDir', __dirname);
app.set('config', config);


app.set('redisClient', redisClient);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.session.secret));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  key: 'bookTrade',
  store: app.get('sessionStore'),
  secret: 'crystalmeth'
}));


require('./models/user');
require('./config/passport')(app, passport);



app.use(passport.initialize());
app.use(passport.session());

app.use(express.Router());

// var routes = require('./routes/index');
// var roomsRoutes = require('./routes/roomsRoutes');
// var userRoutes = require('./routes/userRoutes');

// app.use('/', routes);
// app.use(roomsRoutes);
// app.use(userRoutes);
require('./routes/userRoutes')(app, passport);
require('./routes/roomsRoutes')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
