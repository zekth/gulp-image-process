const sharp = require('sharp')
const chalk = require('chalk')
const logger = require('./log')
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

module.exports = async (image, parameters) => {
  let imageMetadata
  let watermarkMetadata
  let getRatio = (maxSize, actualSize) => {
    let ratio = (maxSize / actualSize).toFixed(2)
    logger.verboseLog(`${chalk.yellow('Watermark')} resize with ratio:${ratio}`)
    return ratio
  }
  let getMaxSize = (imageSize, watermarkPercentSize) => {
    let maxSize = Math.round(imageSize * (watermarkPercentSize / 100))
    logger.verboseLog(
      `${chalk.yellow(
        'Watermark'
      )} imagePxSize:${imageSize} watermarkPercentSize:${watermarkPercentSize} maxPxSize:${maxSize}`
    )
    return maxSize
  }
  let processWatermarkResize = (watermark, size) => {
    logger.verboseLog(
      `${chalk.yellow('Watermark')} size: max Percent:${size}% width:${watermarkMetadata.width} height:${
        watermarkMetadata.height
      }`
    )

    // calculate the max difference between watermark and image to choose which between
    // heigth and width to calculate the resize ratio
    let heightDiff = watermarkMetadata.height - imageMetadata.height
    let widthDiff = watermarkMetadata.width - imageMetadata.width
    logger.verboseLog(`${chalk.yellow('Watermark')} heightDiff:${heightDiff} widthDiff:${widthDiff}`)

    let widthIsMax = widthDiff > heightDiff
    if (widthIsMax) {
      let maxWidth = getMaxSize(imageMetadata.width, size)
      if (watermarkMetadata.width > maxWidth) {
        watermark.resize(Math.round(getRatio(maxWidth, watermarkMetadata.width) * watermarkMetadata.width), null)
      }
    } else {
      let maxHeight = getMaxSize(imageMetadata.height, size)
      if (watermarkMetadata.height > maxHeight) {
        watermark.resize(null, Math.round(getRatio(maxHeight, watermarkMetadata.height) * watermarkMetadata.height))
      }
    }
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
    xComposite = Math.round(xComposite)
    if (xComposite < 0) {
      xComposite = 0
    }
    yComposite = Math.round(yComposite)
    if (yComposite < 0) {
      yComposite = 0
    }
    return [xComposite, yComposite]
  }
  imageMetadata = await image.metadata()
  let waterMark = await sharp(parameters.watermark.filePath)
  watermarkMetadata = await waterMark.metadata()
  let needResize = imageMetadata.width < watermarkMetadata.width || imageMetadata.height < watermarkMetadata.height
  if (needResize || parameters.watermark.maxSize !== -1) {
    let size = 100
    if (parameters.watermark.maxSize && parameters.watermark.maxSize !== -1) {
      size = parameters.watermark.maxSize
    }
    waterMark = processWatermarkResize(waterMark, size)
  }
  watermarkMetadata = await sharp(await waterMark.toBuffer()).metadata()
  let waterMarkCoordinates = getCompositeCoordinates(parameters.watermark.position, parameters.watermark.margin)
  logger.verboseLog(
    `${chalk.yellow('Watermark')} xComposite:${waterMarkCoordinates[0]}, yComposite:${waterMarkCoordinates[1]}`
  )
  image.overlayWith(await waterMark.toBuffer(), { left: waterMarkCoordinates[0], top: waterMarkCoordinates[1] })
  return await sharp(await image.toBuffer())
}
