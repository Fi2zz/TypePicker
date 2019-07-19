const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
module.exports = function(_, options) {
  const isEnvProduction = options.mode === "production";
  const isEnvDevelopment = options.mode === "development";
  const useSourceMap = options.sourceMap || isEnvDevelopment;
  const output = {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].js"
  };
  if (isEnvProduction) {
    output.library = "TypePicker";
    if (options.module) {
      //for  import TypePicker from '/path/to/typepicker.js'
      output.libraryTarget = "umd";
      output.filename = "typepicker.esm.js";
    } else {
      output.libraryExport = "default"; // string | [...modules]
      output.filename = "typepicker.js";
    }
  }
  return {
    mode: options.mode,
    entry: isEnvDevelopment ? "./example/index.ts" : "./src/index.ts",
    output,
    module: {
      rules: [
        {
          enforce: "pre",
          test: /\.js$/,
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
          test: /\.css$/,
          use: [
            isEnvProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader"
          ]
        },
        {
          test: /\.js$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                babelrc: false,
                configFile: false,
                presets: ["@babel/preset-env"]
              }
            }
          ]
        },
        {
          test: /\.tsx?$/,
          use: ["ts-loader"]
        }
      ].filter(Boolean)
    },
    resolve: {
      extensions: [".js", ".json", ".ts", ".tsx"]
    },
    devtool: useSourceMap && "#eval-source-map",
    optimization: {
      minimizer: [
        isEnvProduction &&
          new TerserPlugin({
            terserOptions: {
              parse: {
                ecma: 8
              },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2
              },
              mangle: {
                safari10: true
              },
              output: {
                ecma: 5,
                ascii_only: true,
                comments: /^\**!|@preserve|@license|@cc_on/i //保留banner信息
              }
            },
            extractComments: false
          }),
        isEnvProduction && new OptimizeCSSAssetsPlugin()
      ].filter(Boolean)
    },
    plugins: [
      isEnvProduction &&
        new webpack.BannerPlugin({
          test: /\.js|css$/,
          banner() {
            const pkg = require("./package");

            const now = new Date();
            return [
              `TypePicker v${pkg.version}`,
              `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`,
              `${pkg.description}`,
              `(c) 2017-${now.getFullYear()},${pkg.author}`,
              `${pkg.repository.url}`,
              `${pkg.license} License`
            ].join("\n");
          }
        }),
      new ForkTsCheckerWebpackPlugin(),
      new webpack.DefinePlugin({
        "process.env": {
          NODE_ENV: `"${options.mode}"`
        }
      }),
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: "style.css"
        })
    ].filter(Boolean)
  };
};
