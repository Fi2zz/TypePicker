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
        input: "./transform/index.js",
        output: {
            file: path.resolve("dist", "datepicker.min.js"),
            format: "umd",
            name: "DatePicker"
        },

    }
};
