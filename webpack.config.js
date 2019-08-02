const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
module.exports = function(env, options) {
  const isEnvProduction = options.mode === "production";
  const isEnvDevelopment = options.mode === "development";
  const useSourceMap = options.sourceMap || isEnvDevelopment;
  const entry = isEnvProduction ? "./index.ts" : "./example/index.ts";
  const output = {
    path: path.resolve(__dirname, "example"),
    publicPath: "/",
    filename: "[name].js",
    pathinfo: isEnvDevelopment
  };
  if (isEnvProduction) {
    Object.assign(output, {
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "commonjs2",
      filename: options.filename,
      library: "TypePicker",
      globalObject: "this"
    });
  }
  const config = {
    entry,
    output,
    module: {
      rules: [
        isEnvDevelopment && {
          enforce: "pre",
          test: /\.js|ts$/,
          loader: "source-map-loader"
        },
        {
          test: /\.ts$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                configFile: false,
                presets: ["@babel/preset-env"]
              }
            },
            "ts-loader"
          ]
        }
      ].filter(Boolean)
    },
    resolve: {
      extensions: [".js", ".json", ".ts", ".tsx"]
    },
    devtool: useSourceMap && "#eval-source-map",
    plugins: [
      isEnvProduction &&
        new webpack.BannerPlugin({
          test: /\.js|css$/,
          banner() {
            const pkg = require("./package");
            const now = new Date();
            return [
              `${pkg.bannerName} v${pkg.version}`,
              `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`,
              `${pkg.description}`,
              `(c) 2017-${now.getFullYear()},${pkg.author}`,
              `${pkg.repository.url}`,
              `${pkg.license} License`
            ].join("\n");
          }
        }),
      new ForkTsCheckerWebpackPlugin()
    ].filter(Boolean)
  };
  if (options.type === "development") {
    config.optimization = {
      minimize: false
    };
  }
  config.mode = options.mode;
  return config;
};
