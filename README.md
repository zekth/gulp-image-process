# gulp-image-process
Gulp task for processing images

## Usage

```javascript
const imageProcess = require('./src/index')
const gulp = require('gulp')
const path = require('path')

gulp.task('watermark', () => {
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
    ).pipe(gulp.dest(path.resolve('test', 'result')))
})
```

## API

### options

#### options.verboseLogging
Type: `Boolean`<br>
Default: `false`

Enable the verbose logging.

#### options.watermark
Type: `Object`<br>
Default: `null`

##### options.watermark.filePath
Type: `String`<br>
Default: `''`<br>
Is Mandatory: `True`

Path of the watermark file.

##### options.watermark.position
Type: `String`<br>
Default: `''`<br>
Is Mandatory: `True`

Position of the watermark on the image.<br>
Possible values:
```
  center
  centerTop
  centerBottom
  centerLeft
  centerRight
  upperLeft
  upperRight
  downLeft
  downRigth
```

##### options.watermark.maxSize
Type: `Number`<br>
Default: `-1`<br>

Max Size in Percent of the watermark on the image. If default value is used, the watermark will get its original size.

##### options.watermark.margin
Type: `Number`<br>
Default: `0`<br>

Margin of the watermark from the border of the image. Applied to all coordinates. Similar of css attribute `margin:<value>px;`


## TODO

- keep exif datas
- Optimize output
- manage resize
- tinypng implementation

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
