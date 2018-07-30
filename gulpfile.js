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
        output: 'webp',
        verboseLogging: true,
        multipleResize: [150,300],
        watermark: {
          filePath: 'test/ressources/src/watermark.png',
          position: 'north',
          margin: 50
        }
      })
    )
    .pipe(gulp.dest(path.resolve('test', 'result')))
  })
