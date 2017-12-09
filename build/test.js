const rollup = require('rollup')
const fs = require("fs");
const path = require("path");
const config = require("../config").test;
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


        console.log("> start building ...");
        fs.writeFile(output.file, code, err => {
            if (err) console.log(err);
            console.log("> start compressing");

            console.log("> start compiling style ....");
            exec("stylus ./src/style.styl -c -o ./test");
            console.log("> build done !")


        });


    });