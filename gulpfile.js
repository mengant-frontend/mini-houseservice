const gulp = require('gulp')
const babel = require('gulp-babel')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const jsonmin = require('gulp-jsonmin')
const plumber = require('gulp-plumber')
const clean = require('gulp-clean')
const uglify = require('gulp-uglify')
const pump = require('pump')
gulp.task('default', ['babel', 'less', 'wxml', 'json'], () => {
  console.log('tasks have started successfully')
})

gulp.task('babel', ['clean-js'], cb => {
  return gulp
          .src('src/**/*.js')
          .pipe(plumber())
          .pipe(babel())
          .pipe(uglify())
          .pipe(gulp.dest('dist/'))
})
gulp.task('clean-js', cb => {
  return gulp
          .src('dist/**/*.js')
          .pipe(clean())
})

gulp.task('less', ['clean-wxss'], cb => {
  return gulp
          .src(['src/**/*.less', 'src/**/*.wxss'])
          .pipe(plumber())
          .pipe(postcss())
          .pipe(rename(path => {
            path.extname = '.wxss'
          }))
          .pipe(gulp.dest('dist'))
})
gulp.task('clean-wxss', cb => {
  return gulp
          .src('dist/**/*.wxss')
          .pipe(clean())
})

gulp.task('wxml', ['clean-wxml'], cb => {
  return gulp
          .src('src/**/*.wxml')
          // .pipe(htmlmin({
          //   collapseWhitespace: true
          // }))
          .pipe(gulp.dest('dist'))
})
gulp.task('clean-wxml', cb => {
  return gulp
          .src('dist/**/*.wxml')
          .pipe(clean())
})

gulp.task('json', ['clean-json'], cb => {
  return gulp
          .src('src/**/*.json')
          .pipe(plumber())
          .pipe(jsonmin())
          .pipe(gulp.dest('dist'))

})
gulp.task('clean-json', cb => {
  return gulp
          .src('dist/**/*.json')
          .pipe(clean())
})

gulp.task('watch', ['default'], cb => {
  let watcher = gulp.watch('src/**/*', ['default'])
  watcher.on('change', e => {
    console.log('File' + e.path + ' was ' + e.type + ' , running tasks')
  })
})
