const rollup = require('rollup')
let config = require("../config").build;
const fs = require("fs");
const uglify = require('uglify-js');

const buble = require('rollup-plugin-buble');
const alias = require('rollup-plugin-alias');
const cjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const node = require('rollup-plugin-node-resolve');


const output = config.output;
const path = require("path");

config.plugins = [buble(),
    cjs(),
    node(),

]

const mkdirp = require("mkdirp")

const ugly = function (code) {

    const minified = uglify.minify(code, {
        output: {
            ascii_only: true
        },
        compress: {
            pure_funcs: ['makeMap']
        }
    }).code

    return minified


};
const exec =require("shelljs").exec;

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


        fs.writeFile(output.file, minified, err => {
            if (err) {
                console.log(err)
            }

            exec("stylus ./src/style.styl -c -o ./dist")

            console.log("> build done")
        })

    });