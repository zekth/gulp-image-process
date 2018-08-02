const flog = require('fancy-log')
class Logger {
  constructor(verbose=false) {
    this.verbose = verbose
  }
  verboseLog(...Args) {
    if (this.verbose) {
      this.log(...Args)
    }
  }
  log(...Args) {
    flog(...Args)
  }
}
module.exports = Logger
