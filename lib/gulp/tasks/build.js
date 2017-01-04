"use strict";

var gulp = require('gulp');

gulp.task('bundle', ['scripts', 'css', 'html'], function() {
  if (devBuild) global.doBeep = true;
});

gulp.task('build', ['lint'], function() {
  gulp.start('bundle');
});