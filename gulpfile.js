const gulp = require("gulp");
const through = require("through2");
const path = require("path");
const webpack = require("webpack-stream");
const fs = require("fs");

const webpackConfig = require("./webpack.config");

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
const dest = dest => gulp.dest(dest ? dest : "./dist");
const src = "./index.ts";
exports.default = async next => {
  try {
    await cleanBuildDirectory("./dist");
    await next();
    await gulp
      .src(path.resolve("./package.json"))
      .pipe(createNewVersion())
      .pipe(dest(process.cwd()));
    await next();
    await gulp
      .src(src)
      .pipe(
        webpack(
          webpackConfig(null, {
            mode: "production",
            filename: "typepicker.production.js",
            type: "production"
          })
        )
      )
      .pipe(dest());
    await next();
    await gulp
      .src(src)
      .pipe(
        webpack(
          webpackConfig(null, {
            mode: "production",
            filename: "typepicker.development.js",
            type: "development"
          })
        )
      )
      .pipe(dest());
    await next();
  } catch (error) {
    console.error("Build Error:", error);
  }
};
