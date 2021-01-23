const fsExtra = require("fs-extra");
const { Logger } = require("./logger");

const logger = new Logger("Screenshots");

/**
 * Remove irrelevant elements, set background to white
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Buffer}
 */
async function preparePage({ page } = {}) {
  await page.evaluate(async () => {
    // Remove cookie banners
    const elements = document.querySelectorAll(".cc-window");

    for (const element of elements) {
      element.remove();
    }

    // Set white background
    document.body.style.background = "white";
  });
}

/**
 * Create screenshot of map
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Buffer}
 */
async function createMapScreenshot({ page } = {}) {
  const element = await page.$("#map");

  if (!element) {
    return null;
  }

  // Prepare
  await element.evaluate(async (element) => {
    // Enlarge map
    const enlarge = element.querySelector(".controls .resize");

    enlarge.click();

    // Remove controls
    const controls = document.querySelectorAll(
      ".controls, .gm-control-active, .gm-bundled-control"
    );

    for (const control of controls) {
      control.remove();
    }
  });

  // Wait for proper sizing / centering
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Take screenshot
  const screenshot = await element.screenshot();

  return screenshot;
}

/**
 * Create screenshot of facebook comments
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Buffer}
 */
async function createCommentsScreenshot({ page } = {}) {
  const element = await page.$(
    'iframe[src*="facebook.com/plugins/comments.php"]'
  );

  try {
    const screenshot = await element.screenshot();

    return screenshot;
  } catch (err) {
    logger.log(err.message, { type: "error" });

    return null;
  }
}

/**
 * Create screenshot of trip card
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Buffer}
 */
async function createTripCardScreenshot({ page } = {}) {
  const element = await page.$(".trip-view .trip");

  // Increase area
  await element.evaluate(async (element) => {
    element.style.padding = "0.5em";
  });

  // Take screenshot
  const screenshot = await element.screenshot();

  return screenshot;
}

/**
 * Create screenshots of users
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Array.<Buffer>}
 */
async function createUserScreenshots({ page } = {}) {
  const elements = await page.$$(".trip-view .user");

  const screenshots = await Promise.all(
    elements.map(async (element) => {
      // Increase area
      await element.evaluate(async (element) => {
        const image = element.querySelector("img");

        image.style.boxShadow = window.getComputedStyle(element).boxShadow;

        element.style.boxShadow = "none";
        element.style.padding = "0.5em";
      });

      // Take screenshot
      const screenshot = await element.screenshot();

      return screenshot;
    })
  );

  return screenshots;
}

/**
 * Save screenshots of interesting areas
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @param {String} options.trip Trip ID
 * @param {Array.<Object>} options.waypoints
 * @param {String} options.directory Where to save the files
 */
async function saveScreenshots({ page, trip, waypoints, directory } = {}) {
  // Prepare
  await preparePage({ page });

  fsExtra.ensureDirSync(directory);

  // Create trip card screenshot
  const card = await createTripCardScreenshot({ page });

  fsExtra.writeFileSync(`${directory}/card.png`, card);

  logger.log(`Saved card`, { type: "success" });

  // Create user screenshots
  const users = await createUserScreenshots({ page });

  users.forEach((user, i) => {
    fsExtra.writeFileSync(`${directory}/user-${i + 1}.png`, user);
  });

  logger.log(`Saved ${users.length} users`, { type: "success" });

  // Create comments screenshots
  fsExtra.ensureDirSync(`${directory}/comments`);

  for (const { id, index } of waypoints) {
    const url = `https://www.mahangu.com/en/trip/${trip}/waypoint-${index}`;

    if (url !== page.url()) {
      const response = await page.goto(url, {
        waitUntil: "networkidle2",
      });

      if (response.status() >= 400) {
        logger.log(`Waypoint page ${url} not found`, { type: "error" });

        continue;
      }

      await preparePage({ page });

      // Wait 1s for comments to load
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const comments = await createCommentsScreenshot({ page });

    if (comments) {
      fsExtra.writeFileSync(
        `${directory}/comments/comments-${id}.png`,
        comments
      );

      logger.log(`Saved comments for waypoint ${id}`, { type: "success" });
    }
  }

  // Create map screenshot (last step as map is increased and content hidden)
  const map = await createMapScreenshot({ page });

  if (map) {
    fsExtra.writeFileSync(`${directory}/map.png`, map);

    logger.log(`Saved map`, { type: "success" });
  } else {
    logger.log(`Map not found`, { type: "error" });
  }
}

module.exports = {
  saveScreenshots,
};
