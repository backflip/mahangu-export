const fsExtra = require("fs-extra");
const nodeFetch = require("node-fetch");
const mime = require("mime-types");
const xml2js = require("xml2js");
const { Logger } = require("./logger");

const logger = new Logger("Photos");

/**
 * Get photo information via API
 * @param {Object} options
 * @param {String} options.id
 * @param {String} options.trip
 * @param {Object} [options.nodeFetchOptions]
 * @returns {Object}
 */
async function getPhotoDetails({ trip, id, nodeFetchOptions } = {}) {
  logger.log(`Getting details for ${id}...`);

  const response = await nodeFetch(
    `https://www.mahangu.com/request/getphotoinfo?trip=${trip}&id=${id}`,
    nodeFetchOptions
  );
  const xml = await response.text();

  try {
    const parsed = await xml2js.parseStringPromise(xml);

    if (parsed.errorinfo) {
      logger.log(`Cannot access details for ${id}`, {
        type: "error",
      });

      throw new Error(parsed.errorinfo.$.message);
    }

    logger.log(`Received details for ${id}`, {
      type: "success",
    });

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
  const response = await nodeFetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const photo = {
    data: Buffer.from(arrayBuffer),
    contentType: response.headers.get("Content-Type"),
  };

  return photo;
}

/**
 * Save small and large photo
 * @param {Object} options
 * @param {Object} options.config
 * @param {String} options.directory
 * @returns {Array.<{ data: Buffer, contentType: String }>} options.id
 */
async function downloadPhotos({ config, directory }) {
  const { urlSmall, urlLarge, id } = config;
  const urls = [{ url: urlSmall, id: `${id}-small` }];

  if (urlLarge) {
    urls.push({ url: urlLarge, id: `${id}-large` });
  }

  const getPhotos = urls.map(async ({ url, id }) => {
    try {
      logger.log(`Getting photo ${id}...`);

      const photo = await getPhoto({ url });

      const { data, contentType } = photo;
      const extension = mime.extension(contentType);

      fsExtra.writeFileSync(`${directory}/${id}.${extension}`, data);

      logger.log(`Saved photo ${id}`, { type: "success" });

      return photo;
    } catch (err) {
      logger.log(err.message, { type: "error" });

      return {
        id,
        err: err.message,
      };
    }
  });

  const photos = await Promise.all(getPhotos);

  return photos;
}

/**
 * Save photos
 * @param {Object} options
 * @param {String} options.directory Where to save the files
 * @param {Array} options.waypoints
 * @param {String} options.trip Trip ID
 * @param {Object} [options.nodeFetchOptions] E.g. session cookie
 * @returns {Array.<Object>}
 */
async function savePhotos({
  directory,
  waypoints,
  trip,
  nodeFetchOptions,
} = {}) {
  // Flatten
  const urls = waypoints.reduce((acc, waypoint) => {
    acc = acc.concat(waypoint.photos);

    return acc;
  }, []);

  // Get details sequentially
  const configs = [];

  for (const config of urls) {
    const { id } = config;
    const details = await getPhotoDetails({ id, trip, nodeFetchOptions });

    configs.push({
      ...config,
      ...details,
    });
  }

  // Save details
  fsExtra.ensureDirSync(directory);
  fsExtra.writeFileSync(
    `${directory}/../photos.json`,
    JSON.stringify(configs, null, "\t")
  );

  // Download sequentially
  for (const config of configs) {
    await downloadPhotos({ config, directory, nodeFetchOptions });
  }

  return configs;
}

module.exports = {
  savePhotos,
};
