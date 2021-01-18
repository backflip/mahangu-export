const fs = require("fs");
const xml2js = require("xml2js");

/**
 * Save waypoints
 * @param {Object} options
 * @param {Object} options.page Page instance
 * @param {String} options.directory Where to save the data
 * @param {String} options.trip Trip ID
 */
async function saveWaypoints({ page, directory, trip } = {}) {
  // Extract
  const waypoints = await page.evaluate(
    async ({ trip } = {}) => {
      // We need to request `/waypoint-2` in order to read the first waypoint's ID from the DOM
      const response = await fetch("waypoint-2");
      const body = await response.text();
      const [, firstWaypointId] = body.match(/id="waypoint0" data-id="(.*?)"/);

      // Merge first waypoint with others
      const initialData = [{ id: firstWaypointId }].concat(
        window.tripData.waypoints
      );

      // Load extended data
      const getExtendedData = initialData.map(async (initialWaypoint) => {
        const response = await fetch(
          `/request/get?format=json&type=waypoint&id=${initialWaypoint.id}`
        );
        const data = await response.json();

        const extendedWaypoint = {
          ...initialWaypoint,
          extended: data.waypoint,
        };

        const getPhotos = extendedWaypoint.extended.photos.map(
          async (photo) => {
            const response = await fetch(
              `/request/getphotoinfo?trip=${trip}&id=${photo.id}`
            );
            const xml = await response.text();

            return {
              ...photo,
              extended: xml,
            };
          }
        );

        extendedWaypoint.extended.photos = await Promise.all(getPhotos);

        return extendedWaypoint;
      });
      const extendedData = await Promise.all(getExtendedData);

      return extendedData;
    },
    { trip }
  );

  // Parse XML
  const getParsedWaypoints = waypoints.map(async (waypoint) => {
    const getPhotos = waypoint.extended.photos.map(async (photo) => {
      let extended;

      try {
        const { photodata } = await xml2js.parseStringPromise(photo.extended);

        extended = photodata.$;
      } catch (err) {
        console.log(
          `Failed parsing xml from "/request/getphotoinfo?trip=${trip}&id=${photo.id}"`
        );
        console.log(err);
      }

      photo.extended = extended;

      return photo;
    });

    waypoint.extended.photos = await Promise.all(getPhotos);

    return waypoint;
  });

  const parsedWaypoints = await Promise.all(getParsedWaypoints);

  // Save
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(
    `${directory}/waypoints.json`,
    JSON.stringify(parsedWaypoints, null, "\t")
  );
}

module.exports = {
  saveWaypoints,
};
