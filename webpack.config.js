const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs-extra')


module.exports = function (_, options) {
    const isEnvProduction = options.mode === "production";
    const isEnvDevelopment = options.mode === "development";
    const output = {
        path: isEnvDevelopment
            ? path.resolve(__dirname, "example")
            : path.resolve(__dirname, "dist"),
        publicPath: "/",
        filename: isEnvProduction ? "typepicker.js" : 'example.js',
    };
    if (isEnvProduction) {
        output.library = 'TypePicker';
        output.libraryExport = 'default' // string | [...modules]
    }
    return {
        mode: options.mode,
        entry: isEnvDevelopment
            ? ["./example/index.ts", "./example/style.css"]
            : './src/index.ts',
        output,
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        isEnvDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                },
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    options: {
                        babelrc: false,
                        configFile: false,
                        presets: ['@babel/preset-env']
                    }
                },
                {
                    test: /\.tsx?$/,
                    use: ["ts-loader"]
                }
            ]
        },
        resolve: {
            extensions: [".js", ".json", ".ts", ".tsx"]
        },
        devtool: isEnvDevelopment && "#eval-source-map",

        optimization: {

            minimizer: [
                isEnvProduction && new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true,
                        },
                        output: {
                            ecma: 5,
                            ascii_only: true,
                            comments: /^\**!|@preserve|@license|@cc_on/i, //保留banner信息
                        },
                    },
                    extractComments: false
                }),
                isEnvProduction && new OptimizeCSSAssetsPlugin(),

            ].filter(Boolean)
        },
        plugins: [
            isEnvProduction && new webpack.BannerPlugin({
                test: /\.js|css$/,
                banner() {
                    const pkg = require('./package');

                    function increaseVersion(version) {
                        version = version.split(".").map(item => parseInt(item));
                        let main = version[0];
                        let min = version[1];
                        min += 1;
                        if (min >= 10) {
                            min = 0;
                            main += 1;
                        }
                        return `${main}.${min}.0`;
                    }


                    pkg.version = increaseVersion(pkg.version);
                    fs.writeFileSync(path.resolve('./package.json'), JSON.stringify(pkg, null, 2))
                    let banner = [
                        `TypePicker v${pkg.version}\n`,
                        `${pkg.description}\n`,
                        `(c) 2017-${new Date().getFullYear()},${pkg.author}\n`,
                        `${pkg.repository.url}\n`,
                        `${pkg.license} License\n`,
                    ];
                    return banner.join('')
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
