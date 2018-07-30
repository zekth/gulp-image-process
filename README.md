# gulp-image-process

A Gulp task for processing images base on [sharp](https://github.com/lovell/sharp) for its speed, features and easiness of deployement.

## Installation

```
  npm install gulp gulp-image-process --save-dev
```

## Usage

```javascript
'use strict'
const imageProcess = require('gulp-image-process')
const gulp = require('gulp')
const path = require('path')

gulp.task('images', () => {
  let imageFolder = path.resolve('test', 'ressources', 'src', '*.jpg')
  return gulp
    .src(imageFolder)
    .pipe(
      imageProcess({
        verboseLogging: true,
        progressive:true,
        width:200,
        heigth:200,
        ignoreRatio:false,
        multipleResize: [150,300],
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

#### options.multipleResize
Type: `Array<Number>`<br>
Default: `false`

Will perform multiple resize of the values passed in parameter. Resizes are made on the rendered images, for example it will resize the image with the watermark.

### options.keepMetadata
Type: `Boolean`<br>
Default: `false`

Keep the EXIF file on the output file.

### options.progressive
Type: `Boolean`<br>
Default: `false`

Output using progressive scan. Only available for jpeg output.

### options.ignoreRatio
Type: `Boolean`<br>
Default: `false`

While resizing it will ignore the base ratio of the image with a crop.

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

Little reminder:
```
northwest   north     northeast
        \     |     /
          \   |   /
west   ---- center ----   east
          /   |   \
        /     |     \
southwest   south     southeast

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

- Unit tests :v
- WebP support
- Optimization prompt (diff input / ouput size)

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
