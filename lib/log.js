const log = require('fancy-log')

let verboseLog = (...Args) => {
  let verbose = process.env.IMG_PROCESS_VERBOSE === 'true'
  if (verbose) {
    log(...Args)
  }
}
module.exports = {
  log: log,
  verboseLog: verboseLog
}
