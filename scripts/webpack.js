const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackDevServer = require("webpack-dev-server");
const config = {
  mode: "development",
  entry: {
    app: ["./example/index.ts", "./src/style.styl", "./example/style.styl"]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
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
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: `"development"`
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./example/index.html",
      inject: true
    })
  ]
};

const devSeverConfig = {
  clientLogLevel: "error",
  hot: true,
  contentBase: ".",
  publicPath: "/",
  historyApiFallback: true,
  noInfo: true,
  overlay: true,
  port: 8100,
  host: "localhost"
};

const devServer = new WebpackDevServer(webpack(config), devSeverConfig);
devServer.listen(devSeverConfig.port, devSeverConfig.host, () => {
  console.log(
    "your app is running on http://" +
      devSeverConfig.host +
      ":" +
      devSeverConfig.port
  );
});
