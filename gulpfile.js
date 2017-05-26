var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-minify-css');
var sourceMaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var nodemon = require('gulp-nodemon');
var es = require('event-stream');

gulp.task('images', function() {
    gulp.src(['public/img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

// create multiple bundles or just one?
gulp.task('scripts', function(){

    // files to be bundled
    var files = ['public/scripts/main.js', 'public/scripts/validator.js'];

    var tasks = files.map(file => {
        return browserify({
            entries: [file],
            debug: true
        })
        .bundle()
            .pipe(source(file.split('/').slice(-1).pop()))
            .pipe(buffer())
            .pipe(sourceMaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourceMaps.write('./'))
            .pipe(gulp.dest('dist/scripts/'))
            .pipe(browserSync.stream());
    });
    // merge multiple streams (each creates a bundle)
    return es.merge.apply(null, tasks);
});

gulp.task('styles', function(){
    gulp.src(['public/styles/main.less'])
        .pipe(sourceMaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream());
});

gulp.task('browser-sync', ['nodemon'], function() {
  setTimeout(() => { 
      browserSync.init({
          proxy: "localhost:3000",  // local node app address
          port: 5000,  // use *different* port than above
          notify: true
        }) 
    }, 5000);
});

gulp.task('nodemon', function(){
    var stream = nodemon({ 
            exec: 'node --debug',
            script: 'app.js',
            ignore: ['public/**/*', 'dist/**/*'] // ignore frontend js changes
        });
 
    stream
        .on('restart', function () {
            console.log('restarted!');
            setTimeout(() => browserSync.reload(), 8000);
        })
        .on('crash', function() {
            console.error('Application has crashed!\n');
            stream.emit('restart', 10);  // restart the server in 10 seconds 
        });
});

gulp.task('default', ['styles', 'images', 'scripts', 'browser-sync'] , function(){
    // watch changes and perform task
    gulp.watch('public/img/**/*', ['images']);
    gulp.watch('public/styles/**/*.less', ['styles']);
    gulp.watch('public/scripts/**/*.js', ['scripts']);
    gulp.watch('views/**/*.hbs', browserSync.reload);
});