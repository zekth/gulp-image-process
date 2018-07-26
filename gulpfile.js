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
          position: 'centerBottom',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'center',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'centerTop',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'upperLeft',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'centerLeft',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'downLeft',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'upperRight',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'centerRight',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(
      imageProcess({
        verboseLogging: true,
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'downRight',
          maxSize: 20,
          margin: 30
        }
      })
    )
    .pipe(gulp.dest(path.resolve('test', 'result')))
})
