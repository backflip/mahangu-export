const fs = require("fs");
const fetch = require("node-fetch");
const mime = require("mime-types");
const xml2js = require("xml2js");

/**
 * Get photo information via API
 * @param {Object} options
 * @param {String} options.id
 * @param {String} options.trip
 * @returns {Object}
 */
async function getPhotoDetails({ trip, id } = {}) {
  const response = await fetch(
    `https://www.mahangu.com/request/getphotoinfo?trip=${trip}&id=${id}`
  );
  const xml = await response.text();

  try {
    const parsed = await xml2js.parseStringPromise(xml);
    const {
      url,
      origwidth,
      origheight,
      latitude,
      longitude,
      model,
      size,
      mime,
      lens,
      iso,
      focallength,
      exposurecomp,
      fnumber,
      exposure,
      description,
      taken,
    } = parsed.photoinfo.$;
    const data = {
      urlLarge: url,
      description,
      meta: {
        width: origwidth,
        height: origheight,
        latitude,
        longitude,
        model,
        size,
        mime,
        lens,
        iso,
        focallength,
        exposurecomp,
        fnumber,
        exposure,
        date: taken,
      },
    };

    return data;
  } catch (err) {
    return {
      err: err.message,
      xml,
    };
  }
}

/**
 * Get photo data
 * @param {Object} options
 * @param {String} options.url
 * @returns {{ data: Buffer, contentType: String }}
 */
async function getPhoto({ url } = {}) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const photo = {
    data: Buffer.from(arrayBuffer),
    contentType: response.headers.get("Content-Type"),
  };

  return photo;
}

/**
 * Save photos
 * @param {Object} options
 * @param {String} options.directory Where to save the files
 * @param {Array} options.waypoints
 * @param {String} options.trip Trip ID
 * @param {Boolean} options.debug
 * @returns {Array.<Object>}
 */
async function savePhotos({ directory, waypoints, trip, debug } = {}) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  // Flatten
  const urls = waypoints.reduce((acc, waypoint) => {
    acc = acc.concat(waypoint.photos);

    return acc;
  }, []);

  // Get details
  const getDetails = urls.map(async (config) => {
    const { id } = config;

    if (debug) {
      console.log(`>> Getting photo details for ${id}`);
    }

    const details = await getPhotoDetails({ id, trip });

    return {
      ...config,
      ...details,
    };
  });

  const details = await Promise.all(getDetails);

  // Save details
  fs.writeFileSync(
    `${directory}/../photos.json`,
    JSON.stringify(details, null, "\t")
  );

  // Download
  const getPhotos = details.map(async ({ urlSmall, urlLarge, id }) => {
    const urls = [
      { url: urlSmall, id: `${id}-small` },
      { url: urlLarge, id: `${id}-large` },
    ].filter((photo) => photo.url);

    const getPhotos = urls.map(async ({ url, id }) => {
      try {
        if (debug) {
          console.log(`>> Downloading ${id}`);
        }

        const photo = await getPhoto({ url });

        return {
          ...photo,
          id,
        };
      } catch (err) {
        console.log(err);

        return {
          id,
          err: err.message,
        };
      }
    });

    const photos = await Promise.all(getPhotos);

    return photos;
  });

  // Flatten
  const photos = (await Promise.all(getPhotos)).reduce((acc, photos) => {
    acc = acc.concat(photos);

    return acc;
  }, []);

  // Save
  photos.forEach(({ id, data, contentType }) => {
    if (data) {
      const extension = mime.extension(contentType);

      fs.writeFileSync(`${directory}/${id}.${extension}`, data);
    }
  });

  return details;
}

module.exports = {
  savePhotos,
};
