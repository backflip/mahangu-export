const fs = require("fs");

/**
 * Save waypoints
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @param {String} options.directory Where to save the data
 */
async function saveWaypoints({ page, directory } = {}) {
  // Extract
  const data = await page.evaluate(async () => {
    // We need to request `/waypoint-2` in order to read the first waypoint's ID from the DOM
    const response = await fetch("waypoint-2");
    const body = await response.text();
    const [, firstWaypointId] = body.match(/id="waypoint0" data-id="(.*?)"/);

    // Merge
    const initialData = [{ id: firstWaypointId }, ...window.tripData.waypoints];

    // Load extended data
    const getExtendedData = initialData.map(async (minimalWaypoint) => {
      const response = await fetch(
        `/request/get?format=json&type=waypoint&id=${minimalWaypoint.id}`
      );
      const { waypoint } = await response.json();

      return {
        ...minimalWaypoint,
        ...waypoint,
      };
    });
    const data = await Promise.all(getExtendedData);

    return data;
  });

  // Save
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(
    `${directory}/waypoints.json`,
    JSON.stringify(data, null, "\t")
  );
}

module.exports = {
  saveWaypoints,
};
