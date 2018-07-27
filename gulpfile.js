const imageProcess = require('./index.js')
const gulp = require('gulp')
const path = require('path')

gulp.task('images', () => {
  let imageFolder = path.resolve('test', 'ressources', 'src', '*.jpg')
  return gulp
    .src(imageFolder)
    .pipe(
      imageProcess({
        quality:100,
        progressive:false,
        verboseLogging: true,
        width:200,
        heigth:200,
        ignoreRatio:false,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'north',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(gulp.dest(path.resolve('test', 'result')))
})
