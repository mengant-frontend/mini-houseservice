const gulp = require('gulp')
const babel = require('gulp-babel')
const postcss = require('gulp-postcss')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const jsonmin = require('gulp-jsonmin')
const plumber = require('gulp-plumber')
const less = require('gulp-less')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
gulp.task('default', ['babel', 'less', 'wxml', 'json', 'fonts', 'images'], () => {
  console.log('tasks have started successfully')
})

gulp.task('babel', cb => {
  return gulp
          .src('src/**/*.js')
          .pipe(plumber())
          .pipe(babel())
          .pipe(uglify())
          .pipe(gulp.dest('dist/'))
})
gulp.task('less', cb => {
  return gulp
          .src(['src/**/*.less', 'src/**/*.wxss'])
          .pipe(plumber())
          .pipe(less())
          .pipe(postcss())
          .pipe(rename((path) => {
              path.extname = '.wxss';
          }))
          .pipe(gulp.dest('dist'))
})

gulp.task('wxml', cb => {
  return gulp
          .src('src/**/*.wxml')
          // .pipe(htmlmin({
          //   collapseWhitespace: true
          // }))
          .pipe(gulp.dest('dist'))
})

gulp.task('json', cb => {
  return gulp
          .src('src/**/*.json')
          .pipe(plumber())
          .pipe(jsonmin())
          .pipe(plumber.stop())
          .pipe(gulp.dest('dist'))

})

gulp.task('images', cb => {
  return gulp
          .src('src/images/**/*')
          .pipe(imagemin())
          .pipe(gulp.dest('dist/images'))
})

gulp.task('fonts', cb => {
  return gulp
          .src('src/fonts/**/*')
          .pipe(gulp.dest('dist/fonts'))
})


gulp.task('dev', ['default'], cb => {
  gulp.watch('src/**/*.js', ['babel'], watch)
  gulp.watch(['src/**/*.less', 'src/**/*.wxss'], ['less'], watch)
  gulp.watch('src/**/*.wxml', ['wxml'], watch)
  gulp.watch('src/**/*.json', ['json'], watch)
  gulp.watch('src/fonts/**/*', ['fonts'], watch)
  gulp.watch('src/images/**/*', ['images'], watch)
})
function watch(e){
  console.log('File' + e.path + ' was ' + e.type + ' , running tasks')
}