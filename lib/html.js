const fs = require("fs");
const { template } = require("./template");

/**
 * Save HTML
 * @param {Object} options
 * @param {Object} options.meta
 * @param {Array.<Object>} options.waypoints
 * @param {Array.<Object>} options.photos
 * @param {Array.<Object>} options.directory
 * @returns {String}
 */
function saveHtml({ meta, waypoints, photos, directory } = {}) {
  const lang = "en";
  const html = template({ lang, meta, waypoints, photos });

  // Save
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(`${directory}/index.html`, html);

  console.log(`[HTML] Saved index.html`);

  return html;
}

module.exports = {
  saveHtml,
};
