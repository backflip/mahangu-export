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
  const screenshots = {
    card: `screenshots/card.png`,
    map: `screenshots/map.png`,
    comments: `screenshots/comments.png`,
    users: meta.users.map((user, i) => `screenshots/user-${i + 1}.png`),
  };
  const html = template({ lang, meta, screenshots, waypoints, photos });

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
