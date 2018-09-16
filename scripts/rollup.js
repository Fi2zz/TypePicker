const rollup = require("rollup").rollup;
const fs = require("fs");
const path = require("path");
const colorful = require("colors/safe");
const uglify = require("uglify-js");

const commonJs = require("rollup-plugin-commonjs");
const typescript = require("rollup-plugin-typescript");
const fse = require("fs-extra");

const log = (msg, color) => console.log(colorful[color](msg));
function stylus(source) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(source, "utf-8");
    require("stylus")(data)
      .set("compress", true)
      .render(function(err, css) {
        if (err) {
          reject(err);
          return;
        }
        resolve(css);
      });
  });
}
function banner(version, license) {
  log("> Create banner", "green");
  return function(code) {
    return `  
    /*
    *  TypePicker v${version}
    *  Fi2zz / wenjingbiao@outlook.com
    *  https://github.com/Fi2zz/datepicker
    *  (c) 2017-${new Date().getFullYear()}, wenjingbiao@outlook.com
    *  ${license} License
    */
    ${code}
      `;
  };
}
async function versioner(pkg) {
  let version = pkg.version;
  version = version.split(".").map(item => parseInt(item));
  let main = version[0];
  let min = version[1];
  let patch = version[2];
  patch += 1;
  if (patch >= 10) {
    min += 1;
    patch = 0;
  }
  if (min >= 10) {
    min = 0;
    main += 1;
  }
  pkg.version = `${main}.${min}.${patch}`;
  return pkg;
}

function write(file) {
  return function(code) {
    return new Promise((resolve, reject) => {
      fs.writeFile(file, code, err => {
        if (err) {
          return reject(err);
        }
        resolve(path.basename(file));
      });
    });
  };
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
async function create({ entry, bundle, css, dist, name }, plugins, banner) {
  log("> Start bundling...", "green");

  fse.emptyDirSync(dist);
  let build = {
    input: entry.ts,
    name,
    plugins
  };
  for (let key in bundle) {
    build.file = path.resolve(dist, bundle[key]);
    build.format = key;
    let roll = await rollup(build);
    let { code } = await roll.generate(build);
    code = banner(key === "umd" ? ugly(code) : code);
    await write(build.file)(code);
  }
  let csscodes = await stylus(entry.style);
  let cssfilename = path.resolve(dist, css);
  await write(cssfilename)(banner(csscodes));
  return true;
}

function build(pkg) {
  return function(plugins) {
    return function(banner) {
      return function(versioner) {
        return async function(bundler) {
          pkg = await versioner(pkg);
          await bundler(pkg.build, plugins, banner(pkg.version, pkg.license));
          log("> Updating package version", "green");
          await write("./package.json")(JSON.stringify(pkg, null, 2));
          log("> Build complete", "green");
        };
      };
    };
  };
}

build(require("../package.json"))([
  commonJs(),
  typescript({ typescript: require("typescript") })
])(banner)(versioner)(create);
