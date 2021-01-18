const fs = require("fs");
const puppeteer = require("puppeteer");
const del = require("del");
const minimist = require("minimist");

const { saveMeta } = require("./lib/meta");
const { saveWaypoints } = require("./lib/waypoints");
const { saveScreenshots } = require("./lib/screenshots");
const { savePhotos } = require("./lib/photos");
const { saveHtml } = require("./lib/html");

const { trip, debug, clean, skipDownloads } = minimist(process.argv.slice(2));

const DIR = "build";

(async function main() {
  try {
    let meta, waypoints, photos;

    if (!skipDownloads) {
      if (clean) {
        await del(DIR);
      }

      if (!fs.existsSync(DIR)) {
        fs.mkdirSync(DIR);
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      if (debug) {
        await page.setRequestInterception(true);

        page.on("request", (request) => {
          console.log(">>", request.method(), request.url());

          request.continue();
        });
      }

      await page.setViewport({
        width: 1600 + 393, // Map width + content area
        height: 900, // Map height
      });

      await page.goto(`https://www.mahangu.com/en/trip/${trip}`, {
        waitUntil: "networkidle2",
      });

      // Meta data
      meta = await saveMeta({ page, directory: DIR });

      // Waypoints
      waypoints = await saveWaypoints({ page, directory: DIR });

      // Photos
      photos = await savePhotos({
        directory: `${DIR}/photos`,
        waypoints,
        trip,
      });

      // Screenshots of specific UI elements
      await saveScreenshots({
        page,
        trip,
        waypoints,
        directory: `${DIR}/screenshots`,
      });

      await browser.close();
    } else {
      meta = require(`./${DIR}/meta.json`);
      waypoints = require(`./${DIR}/waypoints.json`);
      photos = require(`./${DIR}/photos.json`);
    }

    // Generate HTML
    await saveHtml({ meta, waypoints, photos, directory: DIR });
  } catch (err) {
    console.error(err);
  }
})();
