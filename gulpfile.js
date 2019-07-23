const gulp = require("gulp");
const through = require("through2");
const path = require("path");
const webpack = require("webpack-stream");
const fs = require("fs");

const webpackConfig = require("./webpack.config");

const extraWebpackConfig = rest =>
  webpackConfig(null, Object.assign({ mode: "production" }, rest));

const buildESMWebpackConfig = extraWebpackConfig({
  output: {
    libraryTarget: "umd",
    filename: "typepicker.esm.js",
    library: "TypePicker"
  },
  entry: "./src/index.ts"
});
const buildWebpackConfig = extraWebpackConfig({
  output: {
    libraryExport: "default",
    filename: "typepicker.js",
    library: "TypePicker"
  },
  entry: "./src/index.ts"
});

const buildCoreWebpackConfig = extraWebpackConfig({
  output: {
    libraryExport: "default",
    filename: "typepicker.core.js",
    library: "TypePickerCore"
  },
  entry: "./src/core.ts"
});

const buildESMCoreWebpackConfig = extraWebpackConfig({
  output: {
    libraryTarget: "umd",
    filename: "typepicker.core.esm.js",
    library: "TypePickerCore"
  },
  entry: "./src/core.ts"
});

function cleanBuildDirectory(dir) {
  let files = [];
  try {
    files = fs.readdirSync(path.resolve(dir));
  } catch (error) {
    return false;
  }
  for (let file of files)
    try {
      fs.unlinkSync(path.resolve(dir + "/" + file), () => {});
    } catch (error) {
      return false;
    }
  return true;
}

function createNewVersion(op) {
  return through.obj(function(file, env, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    try {
      const contentString = file.contents.toString();
      const contentObject = JSON.parse(contentString);
      console.log("\n");
      console.log("/**** Current Version", contentObject.version, "*****/");
      contentObject.version = contentObject.version
        .split(".")
        .reduce((acc, curr, index, list) => {
          let [main, min, patch] = list;
          main = parseInt(main);
          min = parseInt(min);
          patch = parseInt(patch);
          patch += 1;
          if (patch >= 10) {
            patch = 0;
            min += 1;
          }
          if (min >= 10) {
            min = 0;
            main += 1;
          }
          return [main, min, patch].join(".");
        });

      console.log("/**** New Version", contentObject.version, "*****/");
      console.log("\n");
      file.contents = Buffer.from(JSON.stringify(contentObject, null, 2));
    } catch (e) {
      throw new Error(e);
    }
    cb(null, file);
  });
}

function createCompiler(config) {
  return webpack(config);
}
const dest = dest => gulp.dest(dest ? dest : "./dist");
const src = "./src/index.ts";

const cleanBuild = done => {
  cleanBuildDirectory("./dist");
  done();
};

const buildVersion = done => {
  gulp
    .src(path.resolve("./package.json"))
    .pipe(createNewVersion())
    .pipe(dest(process.cwd()));
  done();
};

const buildUMD = done => {
  gulp
    .src(src)
    .pipe(createCompiler(buildWebpackConfig))
    .pipe(dest());
  done();
};

const buildESM = done => {
  gulp
    .src(src)
    .pipe(createCompiler(buildESMWebpackConfig))
    .pipe(dest());
  done();
};

const buildCore = done => {
  gulp
    .src(src)
    .pipe(createCompiler(buildCoreWebpackConfig))
    .pipe(dest());
  done();
};

const buildCoreESM = done => {
  gulp
    .src(src)
    .pipe(createCompiler(buildESMCoreWebpackConfig))
    .pipe(dest());
  done();
};

exports.default = async done => {
  await cleanBuild(done);
  await buildVersion(done);
  await buildCore(done);
  await buildCoreESM(done);
  await buildUMD(done);
  await buildESM(done);
};
