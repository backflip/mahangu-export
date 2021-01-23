const chalk = require("chalk");

/**
 * Log to console
 */
class Logger {
  /**
   * @param {Object} options
   * @param {String} options.group
   */
  constructor({ group } = options) {
    this.group = group;
  }

  /**
   * @param {String} message
   * @param {Object} options
   * @param {String} options.type
   * @returns {String}
   */
  log(message, { type } = {}) {
    let log = `${this.group ? `[${this.group}] ` : ""}${message}`;

    switch (type) {
      case "success":
        log = chalk.green(log);
        break;
      case "error":
        log = chalk.red(log);
        break;
    }

    console.log(log);

    return log;
  }
}

module.exports = {
  Logger,
};
