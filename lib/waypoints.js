const fsExtra = require("fs-extra");
const fetch = require("node-fetch");

/**
 * Get waypoint details via API
 * @param {Object} options
 * @param {String} options.id
 * @returns {Object}
 */
async function getWaypointDetails({ id } = {}) {
  console.log(`[Waypoint] Getting details for ${id}...`);

  const response = await fetch(
    `https://www.mahangu.com/request/get?format=json&type=waypoint&id=${id}`
  );
  const { waypoint } = await response.json();

  console.log(`[Waypoint] Received details for ${id}`);

  return waypoint;
}

/**
 * Get all waypoint details
 * @param {Object} options
 * @param {Array.<Object>} options.waypoints
 * @returns {Array.<Object>}
 */
async function getWaypointsDetails({ waypoints } = {}) {
  const getDetails = waypoints.map(async (waypoint) => {
    waypoint.details = await getWaypointDetails({ id: waypoint.id });

    return waypoint;
  });
  const detailedWaypoints = await Promise.all(getDetails);

  return detailedWaypoints;
}

/**
 * Save waypoints
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @param {String} options.directory Where to save the data
 * @returns {Array.<Object>}
 */
async function saveWaypoints({ page, directory } = {}) {
  // Extract basic info from DOM
  const basicWaypoints = await page.evaluate(async () => {
    /**
     * We need to request `/waypoint-2` in order to read the first waypoint's ID from the DOM
     * @returns {String}
     */
    async function getFirstWaypointId() {
      const response = await fetch("waypoint-2");
      const body = await response.text();
      const [, id] = body.match(/id="waypoint0" data-id="(.*?)"/);

      return id;
    }

    const firstWaypointId = await getFirstWaypointId();
    const otherWaypointIds = [].map.call(
      document.querySelectorAll("[data-id]"),
      (item) => parseInt(item.dataset.id, 10)
    );
    const waypointIds = [firstWaypointId].concat(otherWaypointIds);
    const waypoints = waypointIds.map((id) => ({
      id,
      ...window.tripData.waypoints.find((item) => item.id === id),
    }));

    return waypoints;
  });

  // Get details for every waypoint
  const detailedWaypoints = await getWaypointsDetails({
    waypoints: basicWaypoints,
  });

  // Clean up data, remove irrelevant or duplicated fields
  const waypoints = detailedWaypoints.map((waypoint) => {
    const { id, coords, country, type } = waypoint;
    const { title, description, date } = waypoint.details;
    const photos = waypoint.details.photos.map((photo) => ({
      url: photo.link,
      id: photo.id,
      urlSmall: photo.urlS,
    }));
    const url = waypoint.details.commentsurl;
    const index = waypoint.details.order;

    return {
      id,
      date,
      title,
      description,
      country,
      coords,
      type,
      url,
      photos,
      index,
    };
  });

  // Save
  fsExtra.ensureDirSync(directory);
  fsExtra.writeFileSync(
    `${directory}/waypoints.json`,
    JSON.stringify(waypoints, null, "\t")
  );

  return waypoints;
}

module.exports = {
  saveWaypoints,
};
