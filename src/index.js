'use strict'
const through = require('through2')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const chalk = require('chalk')
const log = require('fancy-log')
const PluginError = require('plugin-error')
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']

const TASK_NAME = 'gulp-image-process'
const WATERMARK_POSITION = {
  center: 'center',
  north: 'north',
  south: 'south',
  west: 'west',
  east: 'east',
  northwest: 'northwest',
  northeast: 'northeast',
  southwest: 'southwest',
  southeast: 'southeast'
}
let verbose = false
let verboseLog = (...Args) => {
  if (verbose) {
    log(...Args)
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
  parameters.keepRatio = param.keepRatio
  parameters.width = param.width || null
  parameters.heigth = param.heigth || null
  parameters.keepMetadata = param.keepMetadata || false
  parameters.quality = param.quality || 100
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
    let imageMetadata
    let watermarkMetadata
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
      verboseLog(`Watermark size: width:${watermarkMetadata.width} height:${watermarkMetadata.height}`)
      let widthIsMax = watermarkMetadata.width > watermarkMetadata.height
      if (widthIsMax) {
        let maxWidth = getMaxSize(imageMetadata.width, parameters.watermark.maxSize)
        if (watermarkMetadata.width > maxWidth) {
          watermark.resize(Math.round(getRatio(maxWidth, watermarkMetadata.width) * watermarkMetadata.width), null)
        }
      } else {
        let maxHeight = getMaxSize(imageMetadata.height, parameters.watermark.maxSize)
        if (watermarkMetadata.height > maxHeight) {
          watermark.resize(null, Math.round(getRatio(maxHeight, watermarkMetadata.height) * watermarkMetadata.height))
        }
      }
      verboseLog(`Watermark resized`)
      return waterMark
    }
    let getCompositeCoordinates = (watermarkPosition, margin = 0) => {
      let xComposite
      let yComposite
      let xOffset = watermarkMetadata.width / 2
      let yOffset = watermarkMetadata.height / 2

      switch (watermarkPosition) {
        case WATERMARK_POSITION.south:
          xComposite = imageMetadata.width / 2 - xOffset
          yComposite = imageMetadata.height - watermarkMetadata.height - margin
          break
        case WATERMARK_POSITION.north:
          xComposite = imageMetadata.width / 2 - xOffset
          yComposite = 0 + margin
          break
        case WATERMARK_POSITION.center:
          xComposite = imageMetadata.width / 2 - xOffset
          yComposite = imageMetadata.height / 2 - yOffset
          break
        case WATERMARK_POSITION.northwest:
          xComposite = 0 + margin
          yComposite = 0 + margin
          break
        case WATERMARK_POSITION.west:
          xComposite = 0 + margin
          yComposite = imageMetadata.height / 2 - yOffset
          break
        case WATERMARK_POSITION.southwest:
          xComposite = 0 + margin
          yComposite = imageMetadata.height - watermarkMetadata.height - margin
          break
        case WATERMARK_POSITION.northeast:
          yComposite = 0 + margin
          xComposite = imageMetadata.width - watermarkMetadata.width - margin
          break
        case WATERMARK_POSITION.east:
          yComposite = imageMetadata.height / 2 - yOffset
          xComposite = imageMetadata.width - watermarkMetadata.width - margin
          break
        case WATERMARK_POSITION.southeast:
          yComposite = imageMetadata.height - watermarkMetadata.height - margin
          xComposite = imageMetadata.width - watermarkMetadata.width - margin
          break
      }
      verboseLog(xOffset, yOffset, xComposite, yComposite)
      return [Math.round(xComposite), Math.round(yComposite)]
    }
    imageMetadata = await image.metadata()
    let waterMark = await sharp(parameters.watermark.filePath)
    watermarkMetadata = await waterMark.metadata()
    if (parameters.watermark.maxSize !== -1) {
      waterMark = processWatermarkResize(waterMark)
    }
    watermarkMetadata = await sharp(await waterMark.toBuffer()).metadata()
    let waterMarkCoordinates = getCompositeCoordinates(parameters.watermark.position, parameters.watermark.margin)
    if (verbose) {
      verboseLog(`xComposite:${waterMarkCoordinates[0]}, yComposite:${waterMarkCoordinates[1]}`)
    }
    image.overlayWith(await waterMark.toBuffer(), { left: waterMarkCoordinates[0], top: waterMarkCoordinates[1] })
    return await sharp(await image.toBuffer())
  }

  let imageProcess = async (file, enc, cb) => {
    if (file.isNull()) {
      if (verbose) {
        verboseLog('File is null. Skipping it')
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
        verboseLog('File type is not supported. Skipping it.')
      }
      cb(null, file)
      return
    }
    let img = sharp(file.path)
    if (parameters.keepMetadata) {
      img.withMetadata()
    }
    if (parameters.watermark) {
      if (!fs.existsSync(parameters.watermark.filePath)) {
        throw new PluginError(TASK_NAME, 'Watermark file not found!')
      }
      img = await processWatermark(img, parameters)
    }
    if (parameters.width || parameters.heigth) {
      verboseLog(`Resizing to ${parameters.width}x${parameters.heigth}`)
      img.resize(parameters.width, parameters.heigth)
    }
    if (parameters.keepRatio) {
      verboseLog(`Keeping Image Ratio`)
      img.max()
    }
    img.toBuffer().then((data, info) => {
      file.contents = data
      cb(null, file)
    })
  }
  return through.obj(imageProcess)
}
