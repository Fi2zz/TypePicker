const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackDevServer = require("webpack-dev-server");
const argv = process.argv;
const mode = argv[argv.length - 1];
const modes = {
    development: "development",
    devDocs: "dev:docs",
    buildDocs: "build:docs"
};
const options = {
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
};


let port, host, template;
const devSever = {
    clientLogLevel: "error",
    hot: true,
    contentBase: false,
    publicPath: "/",
    historyApiFallback: true,
    noInfo: true,
    overlay: true
};


if (mode === modes.development) {
    port = 8300;
    host = "localhost";
    options.entry = [
        `webpack-dev-server/client?http://${host}:${port}/`,
        'webpack/hot/dev-server',
        "./test/app.ts"];
    options.devtool = "#eval-source-map";
    options.output = {
        path: path.resolve(__dirname, "./test"),
        publicPath: "/",
        filename: "app.js"
    };
    template = "./test/index.html"
}
else if (mode === modes.devDocs) {
    port = 8090;
    host = "localhost";
    options.entry = [
        `webpack-dev-server/client?http://${host}:${port}/`,
        'webpack/hot/dev-server',
        "./test/docs.ts"];
    template = "./test/docs.html"
}

if (mode === modes.devDocs || mode === modes.development) {
    options.plugins = [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template,
            inject: true
        })
    ];
    const server = new WebpackDevServer(webpack(options), devSever);
    server.listen(port, host, () => {
        console.log("your app is running on http://" + host + ":" + port)
    });
}


if (mode === modes.buildDocs) {

    options.entry = [
        "./test/docs.ts"
    ];
    template = "./test/docs.html";
    options.output = {
        path: path.resolve(__dirname, "../docs"),
        publicPath: "",
        filename: "docs.js"
    };
    options.devtool = false;

    options.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: false
        }),

        new HtmlWebpackPlugin({
            filename: "index.html",
            template,
            inject: true
        })
    ];
    webpack(options, (err, stats) => {
        if (err) throw  new Error(err);
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }));
    })
}







