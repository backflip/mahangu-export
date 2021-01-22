const path = require("path");
const fsExtra = require("fs-extra");
const puppeteer = require("puppeteer");
const minimist = require("minimist");

const { saveMeta } = require("./lib/meta");
const { saveWaypoints } = require("./lib/waypoints");
const { saveScreenshots } = require("./lib/screenshots");
const { savePhotos } = require("./lib/photos");
const { saveHtml } = require("./lib/html");

const { trip, debug, clean, skipDownloads } = minimist(process.argv.slice(2));

const DIR = path.resolve(`./build/${trip}/`);

// Prevent path traversal
if (!DIR.includes(__dirname)) {
  throw new Error("Nice try");
}

(async function main() {
  let browser;

  try {
    let meta, waypoints, photos;

    if (!skipDownloads) {
      if (clean) {
        fsExtra.removeSync(DIR);
      }

      fsExtra.ensureDirSync(DIR);

      // Start puppeteer
      browser = await puppeteer.launch();

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

      const url = `https://www.mahangu.com/en/trip/${trip}`;
      const response = await page.goto(url, {
        waitUntil: "networkidle2",
      });

      if (response.status() >= 400) {
        throw new Error(`Trip not found on ${url}`);
      }

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

    if (browser) {
      await browser.close();
    }
  }
})();
