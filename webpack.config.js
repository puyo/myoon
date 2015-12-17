var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',

  entry: [
    'webpack-dev-server/client?http://0.0.0.0:8080',    //path to js files (client)
    'webpack/hot/only-dev-server',                        //path to js files (server) with our plugin it ll send pieces of changed code
    './src/main.js'
  ],

  output: {
    path: path.resolve('build'),    //the name of folder where bundle.js ll live
    filename: 'bundle.js',
    publicPath: 'public'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  resolve: {
    extensions: ['', '.js']
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: [path.resolve('src')]
      },
      {
        test: /\.css$/,
        loader: 'style!css?sourceMap&modules',
        include: [path.resolve('scripts')]
      }
    ]
  },
  stats: {
    colors: true
  },
  devServer: {
    hot: true,
    contentBase: "./public",
    stats: {
      chunkModules: false,
      colors: true
    }
  }
};
