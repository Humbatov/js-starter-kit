var gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify = require("babelify"),
    watchify   = require('watchify'),
    uglify     = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    derequire  = require('gulp-derequire'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    rename     = require('gulp-rename'),
    header     = require('gulp-header'),
    gulpif     = require('gulp-if'),
    notifier   = require('../helpers/notifier'),
    config     = require('../config').scripts;


gulp.task('scripts', function(cb) {

  // считаем кол-во бандлов
  var queue = config.bundles.length;

  // поскольку бандлов может быть несколько, оборачиваем сборщик в функцию, 
  // которая в качестве аргумента принимает bundle-объект с параметрами
  // позже запустим её в цикл
  var buildThis = function(bundle) {

    // отдаем bundle browserify
    var pack = browserify({
      // это для sourcemaps
      cache: {}, packageCache: {}, fullPaths: devBuild,
      // путь до end-point (app.js)
      entries: bundle.src,
      // если пишем модуль, то через этот параметр
      // browserify обернет всё в UMD-обертку
      // и при подключении объект будет доступен как bundle.global
      standalone: bundle.global,
      // дополнительные расширения
      extensions: config.extensions,
      // пишем sourcemaps?
      debug: devBuild
    });

    // сборка
    var build = function() {
      console.log(bundle);
      console.log(devBuild);
      // pack.transform(babelify, {presets: ["es2015"]});
      return (
          // browserify-сборка
          pack.bundle()
              // превращаем browserify-сборку в vinyl
              .pipe(source(bundle.destFile))
              // эта штука нужна, чтобы нормально работал `require` собранной библиотеки
              .pipe(derequire())
              // если dev-окружение, то сохрани неминифицированную версию в `public/` (зачем - не помню))
              .pipe(gulpif(devBuild, gulp.dest(bundle.destPublicDir)))
              // если сохраняем в папку `dist` - сохраняем
              // .pipe(gulpif(bundle.saveToDist, gulp.dest(bundle.destDistDir)))
              // это для нормальной работы sourcemaps при минификации
              .pipe(gulpif(bundle.compress, buffer()))
              // если dev-окружение и нужна минификация — инициализируем sourcemaps
              .pipe(gulpif(bundle.compress && devBuild, sourcemaps.init({loadMaps: true})))
              // минифицируем
              .pipe(gulpif(bundle.compress, uglify()))
              // к минифицированной версии добавляем суффикс `.min`
              .pipe(gulpif(bundle.compress, rename({suffix: '.min'})))
              // если собираем для production - добавляем баннер с названием и версией релиза
              .pipe(gulpif(!devBuild, header(config.banner)))
              // пишем sourcemaps
              .pipe(gulpif(bundle.compress && devBuild, sourcemaps.write('./')))
              // сохраняем минифицированную версию в `/dist`
              // .pipe(gulpif(bundle.saveToDist, gulp.dest(bundle.destDistDir)))
              // и в `public`
              .pipe(gulp.dest(bundle.destPublicDir))
              // в конце исполняем callback handleQueue (определен ниже)
              .on('end', handleQueue)
      );

    };

    // если нужны watchers
    if (global.isWatching) {
      // оборачиваем browserify-сборку в watchify
      pack = watchify(pack);
      // при обновлении файлов из сборки - пересобираем бандл
      pack.on('update', build);
    }

    // в конце сборки бандла
    var handleQueue = function() {
      // сообщаем, что всё собрали
      notifier(bundle.destFile);
      // если есть очередь
      if (queue) {
        // уменьшаем на 1
        queue--;
        // если бандлов больше нет, то сообщаем, что таск завершен 
        if (queue === 0) cb();
      }
    };

    return build();
  };

  // запускаем массив бандлов в цикл
  config.bundles.forEach(buildThis);

});