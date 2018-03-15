const rollup = require("rollup").rollup;
const fs = require("fs");
const path = require("path");
const stylus = require("stylus");
const colorful = require("colors/safe");
const uglify = require("uglify-js");
const pkg = require("../package.json")
const commonJs = require("rollup-plugin-commonjs");
const typescript = require("rollup-plugin-typescript");
const config = {
    dest: "./dist",
    filename: "datepicker",
    build: {
        input: "./src/index.ts",
        output: dest => bundleTypes("DatePicker", dest),
        plugins: [commonJs(), typescript({ typescript: require("typescript") })]
    },
    style: "./src/style.styl"
};

function bundleTypes(name) {
    const types = [{
            format: "umd",
            compress: false
        },
        {
            format: "es",
            compress: false
        },
        {
            format: "umd",
            compress: true
        }
    ];
    return types.map(item => ({
        name,
        format: item.format,
        compress: item.compress
    }));
}

function toString(object) {
    return Object.prototype.toString.call(object);
}

function type(object, type) {
    return toString(object) === `[object ${type}]`;
}

function loggerError(err) {
    let message = err;
    if (type(err, "Object") || type(err, "Array")) {
        message = JSON.stringify(err, null, 4);
    }
    console.error(message);
}

function stylusCompiler(config, dest, resolve) {
    return new Promise((resolve, reject) => {
        fs.readFile(config, "utf-8", (err, data) => {
            stylus(data)
                .set("compress", true)
                .render(function(err, css) {
                    if (err) return reject(err);
                    resolve(css);
                });
        });
    });
}

function banner(code) {
    return `  /*
   *  TypePicker v${pkg.version}
   *  Fi2zz / wenjingbiao@outlook.com
   *  https://github.com/Fi2zz/datepicker
   *  (c) 2017-${new Date().getFullYear()}, wenjingbiao@outlook.com
   *  ${pkg.license} License
  */
  
  
${code}
  `;
}

function write(file, code) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, banner(code), err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function ugly(code) {
    return uglify.minify(code, {
        output: {
            ascii_only: true
        },
        compress: {
            pure_funcs: ["makeMap"]
        }
    }).code;
}

function log(msg, color) {
    console.log(colorful[color](msg));
}

function noop() {}

function work(config) {
    const { dest, build, style, filename } = config;
    const { output } = build;
    output(dest).forEach((item, index, { length }) => {
        rollup(build)
            .then(bundle => bundle.generate(item))
            .then(({ code }) => {
                let filepath = "",
                    codes = code;
                if (item.compress) {
                    filepath = path.resolve(dest, `${filename}.min.js`);
                    codes = ugly(code);
                } else {
                    if (item.format === "es") {
                        filepath = path.resolve(dest, `${filename}.esm.js`);
                    } else {
                        filepath = path.resolve(dest, `${filename}.js`);
                    }
                }

                write(filepath, codes).then(res => {
                    if (index === length - 1) {
                        stylusCompiler(style, dest)
                            .then(css => {
                                write(path.resolve(dest, "style.css"), css).then(() =>
                                    log("> style compiled\n> build done !", "green")
                                );
                            })
                            .catch(err => loggerError(err));
                    }
                });
            });
    });
}

function build(config) {
    log("> building...", "green");
    if (!fs.existsSync(config.dest)) {
        fs.mkdirSync(config.dest);
    }
    work(config);
}

build(config);