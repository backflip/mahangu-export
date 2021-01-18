const fs = require("fs");
const puppeteer = require("puppeteer");
const del = require("del");
const minimist = require("minimist");

const { saveMeta } = require("./lib/meta");
const { saveWaypoints } = require("./lib/waypoints");
const { saveScreenshots } = require("./lib/screenshots");

const { trip } = minimist(process.argv.slice(2));

const DIR = "build";

(async function main() {
  try {
    await del(DIR);
    fs.mkdirSync(DIR);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({
      width: 1600 + 393, // Map width + content area
      height: 900, // Map height
    });

    await page.goto(`https://www.mahangu.com/en/trip/${trip}`, {
      waitUntil: "networkidle2",
    });

    await saveMeta({ page, directory: DIR });
    await saveWaypoints({ page, directory: DIR, trip });
    await saveScreenshots({ page, directory: `${DIR}/screenshots` });

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
