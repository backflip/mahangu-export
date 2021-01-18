const fs = require("fs");

/**
 * Save meta data like trip title, users etc.
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @param {String} options.directory Where to save the data
 * @returns {Object}
 */
async function saveMeta({ page, directory } = {}) {
  // Extract
  const data = await page.evaluate(async () => {
    const title = document.querySelector(".desc-wrapper h2").innerText.trim();
    const description = document
      .querySelector(".desc-wrapper .desc")
      .innerHTML.trim();
    const date = document.querySelector(".info-wrapper .year").innerText.trim();
    const users = [].map.call(
      document.querySelectorAll(".users-wrapper .user .desc"),
      (user) => user.innerText.trim()
    );

    return {
      title,
      description,
      date,
      users,
    };
  });

  // Save
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(`${directory}/meta.json`, JSON.stringify(data, null, "\t"));

  return data;
}

module.exports = {
  saveMeta,
};
