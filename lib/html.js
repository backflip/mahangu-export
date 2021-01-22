const fsExtra = require("fs-extra");
const path = require("path");
const ejs = require("ejs");

const srcDirectory = path.join(__dirname, "../public");
const template = fsExtra.readFileSync(`${srcDirectory}/index.html`, "utf8");

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
  const waypointsExtended = waypoints.map((waypoint) => {
    waypoint.description = waypoint.description.replace(/\n/g, "<br>");
    waypoint.photos = waypoint.photos.map((config) => {
      const photo = photos.find((photo) => photo.id === config.id);

      return photo;
    });

    return waypoint;
  });

  const html = ejs.render(template, {
    lang,
    meta,
    waypoints: waypointsExtended,
  });

  // Save
  fsExtra.ensureDirSync(directory);
  fsExtra.writeFileSync(`${directory}/index.html`, html);

  console.log(`[HTML] Saved index.html`);

  // Copy assets
  fsExtra.copySync(`${srcDirectory}/assets`, `${directory}/assets`);

  console.log(`[HTML] Copied assets`);

  return html;
}

module.exports = {
  saveHtml,
};
