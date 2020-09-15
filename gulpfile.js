
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var del = require('del'); 
var runSequence = require('run-sequence');
var tscConfig = require('./tsconfig.json');

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('build', function (next) {
  runSequence('clean', ['compile', 'copy:assets'], next);
});

gulp.task('copy:assets', function () {
  return gulp.src(['app/**/*', '!app/**/*.ts'])
    .pipe(gulp.dest('dist'))
});

gulp.task('compile', function () {
  var tsResult = gulp.src(['app/**/*.ts', '!app/client/**/*.ts'])
    .pipe(sourcemaps.init())
    .pipe(ts(tscConfig.compilerOptions));

  return tsResult.js
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series(gulp.parallel('build')));
