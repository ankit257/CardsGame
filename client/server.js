var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config');

var app = express();
var compiler = webpack(config);

//config.output.publicPath = "http://" + 'localhost' + ":" + '3000' +
//    config.output.publicPath;

app.use(require('webpack-dev-middleware')(compiler, {
	hot: true,
    noInfo: true,
    publicPath: config.output.publicPath,
    stats: {
    	colors: true,
    }
}));

app.use(require('webpack-hot-middleware')(compiler, {
	log: console.log,
	heartbeat: 10 * 1000,
}));

// app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

var port = 3000;
app.listen(port, 'localhost', function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:'+port);
});
