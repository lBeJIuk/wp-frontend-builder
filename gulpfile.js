'use strict';
var timer = require('gulp-timemanager');

var gulp=  require('gulp');
// var less = require('gulp-less');
var sass = require('gulp-sass');

var changed = require('gulp-changed');

var browserSync = require('browser-sync');

var notify = require('gulp-notify');
var combiner = require('stream-combiner2').obj;

var rigger = require('gulp-rigger');
var uglify = require('gulp-uglify');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var rimraf = require('rimraf');

var postcss = require('gulp-postcss');
var postcsssvgtwo = require('postcss-inline-svg');
var mqPacker = require("css-mqpacker");
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var rename = require('gulp-rename');

var publicPath = '../htdocs/wp-content/themes/lBeJIuk/';
var srcPath = '../htdocs/wp-content/themes/lBeJIuk-src/';

var path = {
    public: {
       php: publicPath,
        js: publicPath + 'js/',
        style: publicPath + 'style/',
        img: publicPath + 'img/',
        fonts: publicPath + 'fonts/'
    },
    src: {
        php: srcPath + '*.php',
        js: srcPath + 'js/script.js',
        style: srcPath + 'style/style.scss',
        img: srcPath + 'img/**/*.*',
        fonts: srcPath + 'fonts/**/*.*'
    },
    watch: {
       php: srcPath + '**/*.php',
       js: srcPath + 'js/**/*.js',
       style: srcPath + 'style/**/*.scss',
       img: srcPath + 'img/**/*.*',
       fonts: srcPath + 'fonts/**/*.*'
   },
   watchPub: {
       php: publicPath + '**/*.php',
       js: publicPath + 'js/**/*.js',
       style: publicPath + 'style/min-style.css',
       img: publicPath + 'img/**/*.*',
       fonts: publicPath + 'fonts/**/*.*'
   },
    clean: publicPath
};



// ******************* Compiling


  //less transform
// gulp.task('less', function () {
//   return combiner(
//    gulp.src(path.src.style),
//    less(),
//    postcss([postcsssvgtwo,mqPacker,autoprefixer({browsers: ['last 2 versions', '> 2%']})]),
//    gulp.dest(path.public.style),
//    postcss([cssnano]),
//    rename({prefix : 'min-'}),
//    gulp.dest(path.public.style)).on('error', notify.onError());
// });

//sass transform
gulp.task('sass', function () {
  return combiner(
    gulp.src(path.src.style),
    sass(),
    postcss([postcsssvgtwo,mqPacker,autoprefixer({browsers: ['last 2 versions', '> 2%']})]),
    gulp.dest(path.public.style),
    postcss([cssnano]),
    rename({prefix : 'min-'}),
    gulp.dest(path.public.style)
  ).on('error', notify.onError());
});



//delete public
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

//  "compiling" php
gulp.task('php', function () {
    return combiner(
        gulp.src(path.src.php),
        changed(path.public.php),
        gulp.dest(path.public.php)
    ).on('error', notify.onError());
});

//minify js
gulp.task('js', function () {
  return combiner(
    gulp.src(path.src.js),
    gulp.dest(path.public.js),
    rigger(),
    uglify(),
    rename({prefix : 'min-'}),
    gulp.dest(path.public.js)
  ).on('error', notify.onError());
});

//copy img
gulp.task('img', function () {
  return combiner(
    gulp.src(path.src.img),
    changed(path.public.img),
    gulp.dest(path.public.img)
  ).on('error', notify.onError());
});

//optimization + copy img
gulp.task('img-optim', function () {
    return combiner(
    gulp.src(path.src.img),
      imagemin({
            progressive: true,
            optimizationLevel:3,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }),
        gulp.dest(path.public.img)
    ).on('error', notify.onError());
});

//copy fonts
gulp.task('fonts', function() {
  return combiner(
    gulp.src(path.src.fonts),
    gulp.dest(path.public.fonts)
  ).on('error', notify.onError());
});
// ******************* Compiling


//watcher
gulp.task('watch' , function(){
  // gulp.watch([path.watch.style], gulp.series('less'));
  gulp.watch([path.watch.style], gulp.series('sass'));
  gulp.watch([path.watch.js], gulp.series('js'));
  gulp.watch([path.watch.fonts], gulp.series('fonts'));
  gulp.watch([path.watch.img], gulp.series('img'));
  gulp.watch([path.watch.php], gulp.series('php'));
  gulp.watch([path.watchPub.php , path.watchPub.js, path.watchPub.style, path.watchPub.img, path.watchPub.fonts]).on("change", timer().count);
});

gulp.task('timer', function(cb) {
  timer().init();
  cb();
});

//*************************** Proxy server
gulp.task('browser-sync', function() {
    browserSync.init({
        host: 'localhost',
        port: 9000,
        notify: false,
        proxy: 'zp.my',
        reloadDebounce: 200,
        files: [
          publicPath + '**/*.*'
        ]
    });
});

//task for development
gulp.task('dev' , gulp.series(/*'less' */'sass','php','js', 'fonts','timer', gulp.parallel('watch' , 'browser-sync')));

//task for final test
gulp.task('build' , gulp.series('clean',/*'less' */'sass', 'js', 'fonts','img-optim', 'browser-sync'));
