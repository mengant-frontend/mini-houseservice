const { series, parallel, src, dest, watch } = require("gulp")
const jsonmin = require('gulp-jsonmin')
const postcss = require('gulp-postcss')
const less = require('gulp-less')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify');
//脚本
const script_src = [
  './src/**/*.js'
]
function script(cb) {
  return src(script_src)
    .pipe(plumber())
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(uglify())
    .pipe(dest('dist'))
}
//样式
const style_src = ['./src/**/*.less', './src/**/*.wxss']
function style(cb) {
  return src(style_src)
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss())
    .pipe(rename((path) => {
      path.extname = '.wxss';
    }))
    .pipe(dest('dist'))
}
//页面
const wxml_src = [
  './src/**/*.wxml'
]
function wxml(cb) {
  return src(wxml_src)
    .pipe(dest('dist'))
}
//json
const json_src = ['./src/**/*.json']
function json(cb) {
  return src(json_src)
    .pipe(plumber())
    .pipe(jsonmin())
    .pipe(plumber.stop())
    .pipe(dest('dist'))
}

//图片
const img_src = [
  'src/images/**/*'
]
function img(cb) {
  return src(img_src)
    .pipe(imagemin())
    .pipe(dest('dist/images'))
}
//监听
function watchFn(){
  watch(script_src, script)
  watch(style_src, style)
  watch(json_src, json)
  watch(wxml_src, wxml)
  watch(img_src, img)
}
exports.watch = series(parallel(script, style, wxml, json, img), watchFn )
exports.default = parallel(script, style, wxml, json)