'use strict'
const through = require('through2')
const path = require('path')
const fs = require('fs')
const jimp = require('jimp')
const chalk = require('chalk')
const log = require('fancy-log')
const PluginError = require('plugin-error')
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']

const TASK_NAME = 'gulp-image-process'
const WATERMARK_POSITION = {
  center: 'center',
  centerTop: 'centerTop',
  centerBottom: 'centerBottom',
  centerLeft: 'centerLeft',
  centerRight: 'centerRight',
  upperLeft: 'upperLeft',
  upperRight: 'upperRight',
  downLeft: 'downLeft',
  downRigth: 'downRight'
}
let verbose = false
let verboseLog = (...Args) => {
  if (verbose) {
    log(Args)
  }
}
module.exports.watermarkPosition = WATERMARK_POSITION
module.exports = function(param) {
  if (!param) {
    throw new PluginError(
      TASK_NAME,
      'Parameters are mandatory. Please read documentation: https://github.com/zekth/gulp-image-process#readme'
    )
  }
  verbose = param.verboseLogging || false

  verboseLog('Verbose Logging is enabled')

  let parameters = {}
  parameters.watermark = param.watermark || false
  parameters.optimize = param.optimize || false
  parameters.watermark.maxSize = param.watermark.maxSize || -1
  verboseLog('Parameters', parameters)

  let extensionFile = filePath => {
    return path.extname(filePath).toLowerCase()
  }
  let getJimpFormat = filepath => {
    switch (extensionFile(filepath)) {
      case 'png':
        return jimp.MIME_PNG
      case 'gif':
        return jimp.MIME_GIF
      case 'bmp':
        return jimp.MIME_BMP
      default:
        return jimp.MIME_JPEG
    }
  }
  let processWatermark = async image => {
    let getRatio = (maxSize, actualSize) => {
      let ratio = (maxSize / actualSize).toFixed(2)
      verboseLog(`Watermark resize with ratio:${ratio}`)
      return ratio
    }
    let getMaxSize = (imageSize, watermarkSize) => {
      let maxSize = Math.round(imageSize * (watermarkSize / 100))
      verboseLog(`Watermark maxSize:${maxSize}`)
      return maxSize
    }
    let processWatermarkResize = watermark => {
      verboseLog(`Watermark size: width:${watermark.bitmap.width} height:${watermark.bitmap.height}`)
      let widthIsMax = watermark.bitmap.width > watermark.bitmap.height
      if (widthIsMax) {
        let maxWidth = getMaxSize(image.bitmap.width, parameters.watermark.maxSize)
        if (watermark.bitmap.width > maxWidth) {
          watermark.resize(Math.round(getRatio(maxWidth, watermark.bitmap.width) * watermark.bitmap.width), jimp.AUTO)
        }
      } else {
        let maxHeight = getMaxSize(image.bitmap.height, parameters.watermark.maxSize)
        if (watermark.bitmap.height > maxHeight) {
          watermark.resize(
            Math.round(getRatio(maxHeight, watermark.bitmap.height) * watermark.bitmap.height),
            jimp.AUTO
          )
        }
      }
      return waterMark
    }
    let getCompositeCoordinates = (processedWatermark, watermarkPosition, margin = 0) => {
      let xComposite
      let yComposite
      let xOffset = processedWatermark.bitmap.width / 2
      let yOffset = processedWatermark.bitmap.height / 2
      switch (watermarkPosition) {
        case WATERMARK_POSITION.centerBottom:
          xComposite = image.bitmap.width / 2 - xOffset
          yComposite = image.bitmap.height - processedWatermark.bitmap.height - margin
          break
        case WATERMARK_POSITION.centerTop:
          xComposite = image.bitmap.width / 2 - xOffset
          yComposite = 0 + margin
          break
        case WATERMARK_POSITION.center:
          xComposite = image.bitmap.width / 2 - xOffset
          yComposite = image.bitmap.height / 2 - yOffset
          break
        case WATERMARK_POSITION.upperLeft:
          xComposite = 0 + margin
          yComposite = 0 + margin
          break
        case WATERMARK_POSITION.centerLeft:
          xComposite = 0 + margin
          yComposite = image.bitmap.height / 2 - yOffset
          break
        case WATERMARK_POSITION.downLeft:
          xComposite = 0 + margin
          yComposite = image.bitmap.height - processedWatermark.bitmap.height - margin
          break
        case WATERMARK_POSITION.upperRight:
          yComposite = 0 + margin
          xComposite = image.bitmap.width - processedWatermark.bitmap.width - margin
          break
        case WATERMARK_POSITION.centerRight:
          yComposite = image.bitmap.height / 2 - yOffset
          xComposite = image.bitmap.width - processedWatermark.bitmap.width - margin
          break
        case WATERMARK_POSITION.downRigth:
          yComposite = image.bitmap.height - processedWatermark.bitmap.height - margin
          xComposite = image.bitmap.width - processedWatermark.bitmap.width - margin
          break
      }
      return [xComposite, yComposite]
    }
    let waterMark = await jimp.read(parameters.watermark.filePath)
    if (parameters.watermark.maxSize !== -1) {
      waterMark = processWatermarkResize(waterMark)
    }
    let waterMarkCoordinates = getCompositeCoordinates(
      waterMark,
      parameters.watermark.position,
      parameters.watermark.margin
    )
    if (verbose) {
      log(`xComposite:${waterMarkCoordinates[0]}, yComposite:${waterMarkCoordinates[1]}`)
    }
    image.composite(waterMark, waterMarkCoordinates[0], waterMarkCoordinates[1])
  }

  let imageProcess = (file, enc, cb) => {
    if (file.isNull()) {
      if (verbose) {
        log('File is null. Skipping it')
      }
      cb(null, file)
      return
    }
    if (file.isStream()) {
      cb(new PluginError(TASK_NAME, 'Streaming not supported'))
      return
    }
    if (!supportedExtensions.includes(extensionFile(file.path))) {
      if (verbose) {
        log('File type is not supported. Skipping it.')
      }
      cb(null, file)
      return
    }

    jimp.read(file.contents, async (err, image) => {
      if (err) {
        throw new PluginError(TASK_NAME, err)
      }
      if (parameters.watermark) {
        if (!fs.existsSync(parameters.watermark.filePath)) {
          throw new PluginError(TASK_NAME, 'Watermark file not found!')
        }
        await processWatermark(image, parameters)
      }

      image.getBuffer(getJimpFormat(file.path), (err, buffer) => {
        file.contents = buffer
        cb(null, file)
      })
    })
  }
  return through.obj(imageProcess)
}
