const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
module.exports = function(env, options) {
  const isEnvProduction = options.mode === "production";
  const isEnvDevelopment = options.mode === "development";
  const useSourceMap = options.sourceMap || isEnvDevelopment;
  const entry = isEnvProduction ? "./src/index" : "./example/index.ts";
  const output = {
    path: path.resolve(__dirname, "example"),
    publicPath: "/",
    filename: "[name].js"
  };
  if (isEnvProduction) {
    output.path = path.resolve(__dirname, "dist");
    Object.assign(output, {
      libraryTarget: "umd",
      filename: "typepicker.js",
      library: "TypePicker",
      globalObject: "this",
      pathinfo: false
    });
  }
  return {
    mode: options.mode,
    entry,
    output,
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js|ts$/,
          loader: "source-map-loader"
        },
        {
          enforce: "pre",
          test: /\.(css|ts)$/,
          loader: "defines-loader",
          options: {
            defines: {
              DEBUG: isEnvDevelopment,
              TEST: process.env.NODE_ENV === "test"
            }
          }
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
            {
              loader: "ts-loader",
              options: {
                experimentalWatchApi: true
              }
            }
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
};
