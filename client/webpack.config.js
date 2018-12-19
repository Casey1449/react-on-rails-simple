const path = require('path');
const webpack = require("webpack")
const ManifestPlugin = require('webpack-manifest-plugin'); // we'll use this later

const webpackConfigLoader = require('react-on-rails/webpackConfigLoader');
const configPath = path.resolve('..', 'config');
const { output, settings } = webpackConfigLoader(configPath);

const nodeEnv = process.env.NODE_ENV || "development"

const config = {
  mode: "development",
  entry: [
    `webpack-dev-server/client?http://${settings.dev_server.host}:${settings.dev_server.port}`,
    "webpack/hot/only-dev-server",
    "app"
  ],

  output: {
    filename: '[name]-[hash].js', // [chunkhash] because we've got to do our own cache-busting now
    path: output.path,
    publicPath: output.publicPath,
  },

  resolve: {
    modules: [path.resolve("./app"), "node_modules"],
    extensions: [".js"],
  },

  plugins: [
    new ManifestPlugin({
      publicPath: output.publicPath,
      writeToFileEmit: true
    }),
    new webpack.DefinePlugin({
      "process.env": { NODE_ENV: JSON.stringify(nodeEnv) }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: [path.resolve("./app")],
        options: {
          cacheDirectory: true,
          plugins: ['react-hot-loader/babel'],
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 0,
              localIdentName: '[name]__[local]__[hash:base64:5]'
            }
          },
        ]
      },
    ]
  },

  devServer: {
    host: settings.dev_server.host,
    port: settings.dev_server.port,
    headers: { "Access-Control-Allow-Origin": "*" },
    hot: true,
    contentBase: './app',
    stats: {
      hash: false,
      version: false,
      chunks: false
    }
  }
}

if (nodeEnv !== "production") {
  config.plugins.push(new webpack.NoEmitOnErrorsPlugin())
  config.devtool = "cheap-module-source-map"
} else {
  config.devtool = "eval"
}

module.exports = config
