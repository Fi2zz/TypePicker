const gulp = require("gulp");
const through = require("through2");
const path = require("path");
const webpack = require("webpack-stream");
const fs = require("fs");
function clean(dir) {
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

function version(op) {
  return through.obj(function(file, env, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    try {
      const contentString = file.contents.toString();
      const contentObject = JSON.parse(contentString);
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
      file.contents = Buffer.from(JSON.stringify(contentObject, null, 2));
    } catch (e) {
      throw new Error(e);
    }
    cb(null, file);
  });
}

gulp.task("build:clean", done => {
  clean("./dist");
  done();
});

gulp.task("build:version", function() {
  return gulp
    .src(path.resolve("./package.json"))
    .pipe(version())
    .pipe(gulp.dest(process.cwd()));
});
gulp.task("build:umd", function() {
  return gulp
    .src("./src/index.ts")
    .pipe(
      webpack({
        config: require("./webpack.config")(null, { mode: "production" })
      })
    )
    .pipe(gulp.dest("./dist"));
});
gulp.task("build:esm", function() {
  return gulp
    .src("./src/index.ts")
    .pipe(
      webpack({
        config: require("./webpack.config")(null, {
          mode: "production",
          module: true
        })
      })
    )
    .pipe(gulp.dest("./dist"));
});
