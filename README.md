# gulp-image-process
Gulp task for processing images

## Usage

```javascript
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
        width:200,
        heigth:200,
        keepRatio:false,
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
```

## API

### options

##### options.quality
Type: `Number`<br>
Default: `100`<br>

Quality of the output image. From 0 to 100.

#### options.verboseLogging
Type: `Boolean`<br>
Default: `false`

Enable the verbose logging.

### options.keepMetadata
Type: `Boolean`<br>
Default: `false`

Keep the EXIF file on the output file.

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
  north
  south
  west
  east
  northwest
  northeast
  southwest
  southeast
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

- Optimize output

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
