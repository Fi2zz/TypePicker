const path = require("path")
module.exports = {
    dev: {
        env: require('./dev.env'),
        port: process.env.PORT || 8300,
        autoOpenBrowser: false,
        assetsSubDirectory: 'static',
        assetsPublicPath: '/',
        proxyTable: {},
        cssSourceMap: false
    },
    build: {
        input: "./lib/index.js",
        output: {
            file: {
                compressed: path.resolve("dist", "datepicker.min.js"),
                normal: path.resolve("dist", "datepicker.js")
            },
            format: "umd",
            name: "DatePicker"
        },

    },
    test: {
        input: "./lib/test/app.js",
        output: {
            file: path.resolve("test", "app.js"),
            format: "umd",
            name: "App"
        }

    }
};
