import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

export default {
  debug: true,
  devtool: 'source-map',
  noInfo: true,
  entry: './src/index',
  target: 'web',
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: '[name].[chunkhash].js'
  },
  plugins: [
    new WebpackMd5Hash(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      inject: true,
      trackJSToken: ''
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/, include: path.join(__dirname, 'src'),
        loaders: ['babel']
      },
      {
        test: /\.eot(\?v=\d+.\d+.\d+)?$/,
        loader: 'file'
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "url-loader?limit=10000&mimetype=application/font-woff"
      },
      {
        test: /\.ttf(\?v=\d+.\d+.\d+)?$/,
        loader: 'file-loader?limit=10000&mimetype=application/octet-stream'},
      {
        test: /\.svg(\?v=\d+.\d+.\d+)?$/,
        loader: 'file-loader?limit=10000&mimetype=image/svg+xml'},
      {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: ['file']},
      {
        test: /\.ico$/,
        loader: 'file-loader?name=[name].[ext]'
      },
      {
        test: /(\.css|\.scss)$/,
        loader: ExtractTextPlugin.extract('css?sourceMap!sass?sourceMap')
      }
    ]
  }
}
