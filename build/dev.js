const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function config() {
  return {
    entry: {
      app: "./test/app.ts"
    },
    output: {
      path: path.resolve(__dirname, "./test"),
      publicPath: "/",
      filename: "app.js"
    },
    module: {
      rules: [
        {
          test: /\.(css|styl)$/,
          use: ["style-loader", "css-loader", "stylus-loader"]
        },
        {
          test: /\.js$/,
          use: ["babel-loader"],
          exclude: /node_modules/
        },
        {
          test: /\.tsx?$/,
          use: ["awesome-typescript-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".js", ".json", ".ts", ".tsx"]
    },
    devtool: "#eval-source-map",
    devServer: {
      clientLogLevel: "error",
      hot: true,
      contentBase: false, //'../test',
      port: 8300,
      publicPath: "/",
      historyApiFallback: true,
      noInfo: true,
      overlay: true
    },
    plugins: [
      // new webpack.DefinePlugin({
      //     'process.env': { NODE_ENV: '"development"' }
      // }),
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./test/index.html",
        inject: true
      })
    ]
  };
}
module.exports = new Promise((resolve, reject) => resolve(config()));
