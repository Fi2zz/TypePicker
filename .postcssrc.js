// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": [
    // to edit target browsers: use "browserlist" field in package.json
    // "autoprefixer": {}
    require('autoprefixer')([
      [
        "> 1%",
        "last 2 versions",
        "not ie <= 8"
      ]
    ])
  ]
}
