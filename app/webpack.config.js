/* eslint-disable no-var */
var path = require('path');
var webpack = require('webpack');
var CordovaPlugin = require('webpack-cordova-plugin');

module.exports = {
  entry: [
    // 'webpack-hot-middleware/client?http://localhost:3000',
    './scripts/index',
  ],
  devtool: 'eval-source-map',
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new CordovaPlugin({
        config: 'config.xml',  // Location of Cordova' config.xml (will be created if not found)
        src: 'index.html',     // Set entry-point of cordova in config.xml
        platform: 'android', // Set `webpack-dev-server` to correct `contentBase` to use Cordova plugins.
        version: true,         // Set config.xml' version. (true = use version from package.json)
      })
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'scripts')
    },
    { test: /\.css$/, loader: "style-loader!css-loader?importLoaders=1", include : path.join(__dirname, 'assets') },
    { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
    { test: /\.md$/, loader: "html!markdown" },
    { test: /\.json$/, loader: 'json-loader' },
    { test: /\.html$/, loader: 'html-loader' }]
  }
};
