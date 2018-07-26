const imageProcess = require('./src/index')
const gulp = require('gulp')
const path = require('path')

gulp.task('images', () => {
  let imageFolder = path.resolve('test', 'ressources', 'src', '*.jpg')
  gulp
    .src(imageFolder)
    .pipe(
      imageProcess({
        verboseLogging: true,
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
