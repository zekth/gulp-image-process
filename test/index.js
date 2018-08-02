'use strict'
const Rembrandt = require('rembrandt')
const assert = require('assert')
const fs = require('fs')
const sinon = require('sinon')
const path = require('path')
const gulp = require('gulp')
const imageProcess = require('../lib/image-process')
const Logger = require('../lib/log')
const flog = require('fancy-log')
const Vinyl = require('vinyl')

const Readable = require('stream').Readable

let resultFolder = 'test/ressources/result'
let expectedFolder = 'test/ressources/expected'
let ressourceFolder = 'test/ressources/src'

let comparer = function(pathExpected, pathResult) {
  return new Rembrandt({
    imageA: fs.readFileSync(pathExpected),
    imageB: fs.readFileSync(pathResult),
    thresholdType: Rembrandt.THRESHOLD_PERCENT,
    maxThreshold: 0.001,
    maxOffset: 0
  })
}

beforeEach(function() {
  for (const file of fs.readdirSync(resultFolder)) {
    fs.unlinkSync(path.join(resultFolder, file))
  }
})
afterEach(function() {
  for (const file of fs.readdirSync(resultFolder)) {
    fs.unlinkSync(path.join(resultFolder, file))
  }
})
describe('Error Handling', function() {
  it('Should skip if file type no supported', function(done) {
    gulp
      .src(path.join(ressourceFolder, 'foo.txt'))
      .pipe(imageProcess({ quality: 100 }))
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (fs.readdirSync(resultFolder).length !== 0) {
          console.log(fs.readdirSync(resultFolder))
          done('Unsupported file has been processed')
        } else {
          done()
        }
      })
  })

  // it('Should throw and error if file is stream', function(done) {
  //   try {
  //     gulp
  //       .src(path.join(ressourceFolder, 'foo.txt'), { buffer: false })
  //       .pipe(imageProcess({ quality: 100 }).on('error', function(e) {
  //         console.log(e)
  //         done()
  //       }))
  //       .pipe(gulp.dest(resultFolder))
  //       .on('end', function() {
  //         done('No error was thrown')
  //       })
  //   } catch (err) {
  //     console.log(err)
  //     done()
  //   }
  // })
})
describe('Simple Manipulations', function() {
  it('Should throw an error with no parameters', function(done) {
    try {
      gulp
        .src(path.join(ressourceFolder, '1.jpg'))
        .pipe(imageProcess())
        .pipe(gulp.dest(resultFolder))
        .on('end', function() {
          done('No error has been thrown')
        })
    } catch (e) {
      done()
    }
  })
  it('Should copy the image', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is not copied')
        }
        let r = comparer(path.join(expectedFolder, '1.jpg'), path.join(resultFolder, '1.jpg'))
        r.compare().then(function(result) {
          if (result.passed) {
            done()
          } else {
            console.log(
              'Pixel Difference:',
              result.differences,
              'Percentage Difference',
              result.percentageDifference,
              '%'
            )
            console.log('Composition image buffer:', result.compositionImage)
            done('Difference between Expected and result')
          }
        })
      })
  })
  it('Should handle an innapropriate quality value over limit', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 5000
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is not copied')
        }
        let r = comparer(path.join(expectedFolder, '1.jpg'), path.join(resultFolder, '1.jpg'))
        r.compare().then(function(result) {
          if (result.passed) {
            done()
          } else {
            console.log(
              'Pixel Difference:',
              result.differences,
              'Percentage Difference',
              result.percentageDifference,
              '%'
            )
            console.log('Composition image buffer:', result.compositionImage)
            done('Difference between Expected and result')
          }
        })
      })
  })
  it('Should handle an innapropriate quality value. Negative one.', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: -5000
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is not copied')
        }
        let r = comparer(path.join(expectedFolder, '1-quality-0.jpg'), path.join(resultFolder, '1.jpg'))
        r.compare().then(function(result) {
          if (result.passed) {
            done()
          } else {
            console.log(
              'Pixel Difference:',
              result.differences,
              'Percentage Difference',
              result.percentageDifference,
              '%'
            )
            console.log('Composition image buffer:', result.compositionImage)
            done('Difference between Expected and result')
          }
        })
      })
  })
  it('Should copy the image and call verbose logging', function(done) {
    let verboseStub = sinon.spy(Logger.prototype, 'verboseLog')
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          verboseLogging: true
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is not copied')
        }
        let r = comparer(path.join(expectedFolder, '1.jpg'), path.join(resultFolder, '1.jpg'))
        r.compare().then(function(result) {
          if (!verboseStub.called) {
            done('verbose log has no been called')
          }
          if (result.passed) {
            done()
          } else {
            console.log(
              'Pixel Difference:',
              result.differences,
              'Percentage Difference',
              result.percentageDifference,
              '%'
            )
            console.log('Composition image buffer:', result.compositionImage)
            done('Difference between Expected and result')
          }
        })
      })
  })
})

describe('Output', function() {
  it('It should force the jpg output', function(done) {
    gulp
      .src(path.join(ressourceFolder, 'watermark.png'))
      .pipe(
        imageProcess({
          quality: 100,
          output: 'jpg'
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, 'watermark.jpeg'))) {
          done('File is not generated')
        } else {
          let r = comparer(path.join(expectedFolder, 'png-to-jpg.jpeg'), path.join(resultFolder, 'watermark.jpeg'))
          r.compare().then(function(result) {
            if (result.passed) {
              done()
            } else {
              console.log(
                'Pixel Difference:',
                result.differences,
                'Percentage Difference',
                result.percentageDifference,
                '%'
              )
              console.log('Composition image buffer:', result.compositionImage)
              done('Difference between Expected and result')
            }
          })
        }
      })
  })
  it('It should force the jpg output with jpeg input', function(done) {
    gulp
      .src(path.join(ressourceFolder, 'watermark.png'))
      .pipe(
        imageProcess({
          quality: 100,
          output: 'jpeg'
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, 'watermark.jpeg'))) {
          done('File is not generated')
        } else {
          let r = comparer(path.join(expectedFolder, 'png-to-jpg.jpeg'), path.join(resultFolder, 'watermark.jpeg'))
          r.compare().then(function(result) {
            if (result.passed) {
              done()
            } else {
              console.log(
                'Pixel Difference:',
                result.differences,
                'Percentage Difference',
                result.percentageDifference,
                '%'
              )
              console.log('Composition image buffer:', result.compositionImage)
              done('Difference between Expected and result')
            }
          })
        }
      })
  })
  it('It should force the png output', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          output: 'png'
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.png'))) {
          done('File is not generated')
        } else {
          let r = comparer(path.join(expectedFolder, '1.png'), path.join(resultFolder, '1.png'))
          r.compare().then(function(result) {
            if (result.passed) {
              done()
            } else {
              console.log(
                'Pixel Difference:',
                result.differences,
                'Percentage Difference',
                result.percentageDifference,
                '%'
              )
              console.log('Composition image buffer:', result.compositionImage)
              done('Difference between Expected and result')
            }
          })
        }
      })
  })
  it('It should force the webp output', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          output: 'webp'
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', function() {
        if (!fs.existsSync(path.join(resultFolder, '1.webp'))) {
          done('File is not generated')
        } else {
          let r = comparer(path.join(expectedFolder, '1.webp'), path.join(resultFolder, '1.webp'))
          r.compare().then(function(result) {
            if (result.passed) {
              done()
            } else {
              console.log(
                'Pixel Difference:',
                result.differences,
                'Percentage Difference',
                result.percentageDifference,
                '%'
              )
              console.log('Composition image buffer:', result.compositionImage)
              done('Difference between Expected and result')
            }
          })
        }
      })
  })
})

describe('Resize', function() {
  it('Should do simple resize', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          width: 300
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-300.jpg'), path.join(resultFolder, '1.jpg')).compare()
          console.log(r)
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('Should do multiple resize', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          multipleResize: [150, 300]
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (
          !fs.existsSync(path.join(resultFolder, '1-150.jpg')) ||
          !fs.existsSync(path.join(resultFolder, '1-300.jpg')) ||
          !fs.existsSync(path.join(resultFolder, '1.jpg'))
        ) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1.jpg'), path.join(resultFolder, '1.jpg')).compare()
          let r150 = await comparer(
            path.join(expectedFolder, '1-150.jpg'),
            path.join(resultFolder, '1-150.jpg')
          ).compare()
          let r300 = await comparer(
            path.join(expectedFolder, '1-300.jpg'),
            path.join(resultFolder, '1-300.jpg')
          ).compare()
          if (!r.passed || !r150.passed || !r300.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
})

describe('Watermark', function() {
  it('NORTH', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'north',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-north.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('SOUTH', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'south',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-south.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('CENTER', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'center',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-center.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('WEST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'west',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-west.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('EAST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'east',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-east.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('NORTHWEST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'northwest',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-northwest.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('NORTHEAST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'northeast',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-northeast.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('SOUTHWEST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'southwest',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-southwest.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
  it('SOUTHEAST', function(done) {
    gulp
      .src(path.join(ressourceFolder, '1.jpg'))
      .pipe(
        imageProcess({
          quality: 100,
          watermark: {
            filePath: path.join(ressourceFolder, 'watermark.png'),
            position: 'southeast',
            maxSize: 20
          }
        })
      )
      .pipe(gulp.dest(resultFolder))
      .on('end', async function() {
        if (!fs.existsSync(path.join(resultFolder, '1.jpg'))) {
          done('File is missing')
        } else {
          let r = await comparer(path.join(expectedFolder, '1-southeast.jpg'), path.join(resultFolder, '1.jpg')).compare()
          if (!r.passed) {
            done('expected image not passed')
          } else {
            done()
          }
        }
      })
  })
})
