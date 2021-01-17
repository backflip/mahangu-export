const fs = require("fs");

/**
 * Create screenshot of map
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @returns {Buffer}
 */
async function createMapScreenshot({ page } = {}) {
  const element = await page.$("#map");

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

  const screenshot = await element.screenshot();

  return screenshot;
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
 * @param {String} options.directory Where to save the files
 */
async function saveScreenshots({ page, directory } = {}) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  // Prepare
  await page.evaluate(async () => {
    // Remove cookie banners
    const elements = document.querySelectorAll(".cc-window");

    for (const element of elements) {
      element.remove();
    }

    // Set white background
    document.body.style.background = "white";
  });

  // Create trip card screenshot
  const card = await createTripCardScreenshot({ page });

  fs.writeFileSync(`${directory}/card.png`, card);

  // Create user screenshots
  const users = await createUserScreenshots({ page });

  users.forEach((user, i) => {
    fs.writeFileSync(`${directory}/user-${i + 1}.png`, user);
  });

  // Create comments screenshot
  const comments = await createCommentsScreenshot({ page });

  fs.writeFileSync(`${directory}/comments.png`, comments);

  // Create map screenshot
  const map = await createMapScreenshot({ page });

  fs.writeFileSync(`${directory}/map.png`, map);
}

module.exports = {
  saveScreenshots,
};
