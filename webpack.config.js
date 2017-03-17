var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',

  entry: [
    './src/main.js'
  ],

  output: {
    path: path.resolve('public'),    //the name of folder where bundle.js will live
    filename: 'bundle.js'
  },

  plugins: [
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
