const gulp = require('gulp');
const through = require('through2');
const path = require('path')
const webpack = require('webpack-stream');

function version(op) {
    return through.obj(function (file, env, cb) {
        if (file.isNull()) {
            cb(null, file);
            return
        }
        try {
            const contentString = file.contents.toString();
            const contentObject = JSON.parse(contentString);
            contentObject.version = contentObject.version.split(".").reduce((acc, curr, index, list) => {
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
            file.contents = Buffer.from(JSON.stringify(contentObject, null, 2))
        } catch (e) {
            throw new Error(e)
        }
        cb(null, file)
    })
}

gulp.task('package', function () {
    return gulp.src(path.resolve('./package.json'))
        .pipe(version())
        .pipe(gulp.dest(process.cwd()))

});
gulp.task('build', function () {
    return gulp.src('./src/index.ts')
        .pipe(webpack({
            config: require('./webpack.config')(null, {mode: 'production'})
        })).pipe(gulp.dest('./dist'))
});
gulp.task('build:esm', function () {
    return gulp.src('./src/index.ts')
        .pipe(webpack({
            config: require('./webpack.config')(null, {mode: 'production', module: true})
        })).pipe(gulp.dest('./dist'))
});
