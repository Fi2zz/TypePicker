const rollup = require('rollup')
const fs = require("fs");
const path = require("path");
const config = require("../config").build;
const uglify = require('uglify-js');
const buble = require('rollup-plugin-buble');
const alias = require('rollup-plugin-alias');
const cjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const node = require('rollup-plugin-node-resolve');

config.plugins = [buble(),
    cjs(),
    node(),
];
const mkdirp = require("mkdirp");
const exec = require("shelljs").exec;

const output = config.output;

rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({code}) => {
        const minified = uglify.minify(code, {
            output: {
                ascii_only: true
            },
            compress: {
                pure_funcs: ['makeMap']
            }
        }).code;


        async function generate() {
            console.log("> start building ...");
            await function () {
                fs.writeFile(output.file.normal, code, err => {
                    if (err) console.log(err);
                    console.log("> start compressing");
                });
            };
            fs.writeFile(output.file.compressed, minified, err => {
                if (err) console.log(err);
                console.log("> start compiling style ....");
                exec("stylus ./src/style.styl -c -o ./dist");
                console.log("> build done !")
            })
        }

        generate()


    });