var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-minify-css');
var sourceMaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var handlebars = require('gulp-compile-handlebars');
var rename = require('gulp-rename');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var menu = require('./menu.json');

gulp.task('templates', function(){

    var data = {
        year: new Date().getFullYear(),
        menu: menu.menuItems
    };

    var options = {
        batch: ['src/templates/partials']
    }

    return gulp.src(['src/templates/**/*.hbs', '!src/templates/partials/**/*.hbs'])
            .pipe(handlebars(data, options))
            .pipe(rename(function(path) {
                path.extname = '.html';
            }))
            .pipe(gulp.dest('./'))
});

gulp.task('images', function() {
    gulp.src(['src/img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function(){
    var b = browserify({
        entries: 'src/scripts/main.js',
        debug: true
    });

    b.bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(sourceMaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourceMaps.write('./'))
        .pipe(gulp.dest('dist/scripts/'))
        .pipe(browserSync.stream());

    // old
    // gulp.src(['src/scripts/**/*.js'])
    //     .pipe(sourceMaps.init())
    //     .pipe(uglify())
    //     .pipe(sourceMaps.write())
    //     .pipe(gulp.dest('dist/scripts'))
    //     .pipe(browserSync.stream());
});

gulp.task('styles', function(){
    gulp.src(['src/styles/**/*.less'])
        .pipe(sourceMaps.init())
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(minifyCss())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['styles', 'images', 'scripts', 'templates'] , function(){
    browserSync.init({
        server: './'
    });
    // gulp.watch('src/**/*', browserSync.reload);

    // watch changes and perform task
    gulp.watch('src/templates/**/*.hbs', ['templates']);
    gulp.watch('src/img/**/*', ['images']);
    gulp.watch('src/styles/**/*.less', ['styles']);
    gulp.watch('src/scripts/**/*js', ['scripts']);
    gulp.watch('*.html', browserSync.reload);
});