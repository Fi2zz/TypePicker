const rollup = require("rollup").rollup;
const fs = require("fs");
const path = require("path");
const stylusApp = require("stylus");
const colorful = require("colors/safe");
const uglify = require("uglify-js");
const pkg = require("../package.json");
const commonJs = require("rollup-plugin-commonjs");
const typescript = require("rollup-plugin-typescript");
const fse = require("fs-extra");
const WORK_TYPES = {
  TS: "ts",
  CSS: "css"
};
const ROLLUP_PLUGINS = [
  commonJs(),
  typescript({ typescript: require("typescript") })
];
const PKG_CONFIG = pkg.config;
const BUNDLE_TO = PKG_CONFIG.target;
const BUNDLE_NAME = PKG_CONFIG.bundleName;
const BUNDLE_SOURCE = PKG_CONFIG.source;
const BUNDLE_STYLE_FILE = PKG_CONFIG.style;
const BUNDLE_TYPES = {
  UMD: {
    name: "umd",
    suffix: ".min.js"
  },
  ESM: {
    name: "es",
    suffix: ".esm.js"
  },
  CSS: {
    name: "css",
    suffix: ".css"
  }
};
const BUILD_CONFIG = [
  {
    file: PKG_CONFIG.testBundleFilename,
    input: PKG_CONFIG.test,
    name: PKG_CONFIG.testBundleName,
    format: BUNDLE_TYPES.UMD.name,
    suffix: BUNDLE_TYPES.UMD.suffix,
    plugins: ROLLUP_PLUGINS,
    uglify: false,
    type: WORK_TYPES.TS
  },
  {
    file: BUNDLE_TO,
    input: BUNDLE_SOURCE,
    name: BUNDLE_NAME,
    format: BUNDLE_TYPES.ESM.name,
    suffix: BUNDLE_TYPES.ESM.suffix,
    plugins: ROLLUP_PLUGINS,
    uglify: false,
    type: WORK_TYPES.TS
  },

  {
    file: BUNDLE_TO,
    input: BUNDLE_SOURCE,
    name: BUNDLE_NAME,
    format: BUNDLE_TYPES.UMD.name,
    suffix: BUNDLE_TYPES.UMD.suffix,
    plugins: ROLLUP_PLUGINS,
    uglify: true,
    type: WORK_TYPES.TS
  },
  {
    file: BUNDLE_TO,
    input: BUNDLE_STYLE_FILE,
    name: PKG_CONFIG.cssFilename,
    type: WORK_TYPES.CSS,
    suffix: BUNDLE_TYPES.CSS.suffix
  }
];
const log = (msg, color) => {
  console.log(colorful[color](msg));
};
function stylus(source) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(source, "utf-8");
    stylusApp(data)
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
function banner(code) {
  const pkg = require("../package.json");
  return `  
/*
*  TypePicker v${pkg.version}
*  Fi2zz / wenjingbiao@outlook.com
*  https://github.com/Fi2zz/datepicker
*  (c) 2017-${new Date().getFullYear()}, wenjingbiao@outlook.com
*  ${pkg.license} License
*/
${code}
  `;
}
function updatePackageVersion(pkg) {
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
  let newVersion = pkg.version;
  log("> Updating package veresion", "green");
  return write({
    filename: "./package.json",
    data: JSON.stringify(pkg, null, 2),
    bannered: false
  }).then(() => {
    log(`> Package version updated ,new version: ${newVersion}`, "green");
  });
}
function write({ filename: file, data: code, bannered = true }) {
  if (bannered) {
    code = banner(code);
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(file, code, err => {
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
function emptyDir(dir) {
  log("> Clean up last build", "green");
  fse.emptyDirSync(dir);
}
function build(build) {
  log("> Start bundling...", "green");
  build.forEach(item => {
    const { type, file, suffix } = item;
    let filename = file.replace(".js", suffix).trim();
    if (type === WORK_TYPES.TS) {
      delete item.suffix;
      delete item.type;
      delete item.uglify;
      rollup(item)
        .then(bundle => bundle.generate(item))
        .then(gen => gen.code)
        .then(code => ({
          filename,
          data: item.uglify ? ugly(code) : code
        }))
        .then(write);
    } else if (type === WORK_TYPES.CSS) {
      stylus(item.input)
        .then(css => ({ filename, data: css }))
        .then(write)
        .then(() => {
          log("> Build complete", "green");
        });
    }
  });
}

updatePackageVersion(pkg)
  .then(() => emptyDir(PKG_CONFIG.dist))
  .then(() => build(BUILD_CONFIG));
