
var gulp        = require('gulp'),
    jade        = require('gulp-jade'),
    jadeInherit = require('gulp-jade-inheritance'),
    gulpif      = require('gulp-if'),
    changed     = require('gulp-changed'),
    filter      = require('gulp-filter'),
    notifier    = require('../helpers/notifier'),
    config      = require('../config').html;

gulp.task('html', function(cb) {
  console.log(config.src + '*.jade');
  // берём все jade-файлы из директории src/html
  gulp.src(config.src + '*.jade')
  // gulp.src('./src/jade/views/*.jade')
      // если dev-сборка, то watcher пересобирает только изменённые файлы
      .pipe(gulpif(devBuild, changed(config.dest)))
      // корректно обрабатываем зависимости
      .pipe(jadeInherit({basedir: config.src}))
      // отфильтровываем не-партиалы (без `_` вначале)
      .pipe(filter(function(file) {
        return !/\/_/.test(file.path) || !/^_/.test(file.relative);
      }))
      // преобразуем jade в html
      .pipe(jade(config.params))
      // пишем html-файлы
      .pipe(gulp.dest(config.dest))
      // .pipe(gulp.dest('./views'))
      // по окончании запускаем функцию
      .on('end', function() {
        notifier('html');  // уведомление (в консоли + всплывашка)
        cb();              // gulp-callback, сигнализирующий о завершении таска
      });

});