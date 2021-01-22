const path = require("path");
const fsExtra = require("fs-extra");
const puppeteer = require("puppeteer");
const minimist = require("minimist");

const { saveMeta } = require("./lib/meta");
const { saveWaypoints } = require("./lib/waypoints");
const { saveScreenshots } = require("./lib/screenshots");
const { savePhotos } = require("./lib/photos");
const { saveHtml } = require("./lib/html");

const { trip, secret, debug, clean, skipDownloads } = minimist(
  process.argv.slice(2)
);

const DIR = path.resolve(`./build/${trip}/`);

// Prevent path traversal
if (!DIR.includes(__dirname)) {
  throw new Error("Nice try");
}

(async function main() {
  let browser;

  try {
    let meta, waypoints, photos, nodeFetchOptions;

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

      const url = `https://www.mahangu.com/en/trip/${trip}${
        secret ? `?access=${secret}` : ""
      }`;
      const response = await page.goto(url, {
        waitUntil: "networkidle2",
      });

      if (response.status() >= 400) {
        throw new Error(`Trip not found on ${url}`);
      }

      const isPrivate = await page.$eval(
        "h2",
        (el) => el.innerText === "Holy Tabula Rasa!"
      );

      if (isPrivate) {
        throw new Error(
          `Trip is private. Please add "--secret SECRET_ACCESS_CODE"`
        );
      }

      // Extract session cookie for private trips
      if (secret) {
        const cookies = await page.cookies();
        const sessionCookie = cookies.find(
          (cookie) => cookie.name === "PHPSESSID"
        );

        nodeFetchOptions = {
          headers: {
            cookie: `${sessionCookie.name}=${sessionCookie.value}`,
          },
        };
      }

      // Meta data
      meta = await saveMeta({ page, directory: DIR });

      // Waypoints
      waypoints = await saveWaypoints({
        page,
        directory: DIR,
        nodeFetchOptions,
      });

      // Photos
      photos = await savePhotos({
        directory: `${DIR}/photos`,
        waypoints,
        trip,
        nodeFetchOptions,
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
