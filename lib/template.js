const template = ({ lang, meta, screenshots, waypoints, photos } = {}) => `
<!doctype HTML>
<html lang="${lang}">
<head>
  <title>${meta.title}</title>
	<meta name="viewport" content="width=device-width">
  <style>
    body {
      font-family: sans-serif;
      margin: 2rem;
    }
    .meta {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .card {
      flex-shrink: 0;
      margin-right: 2rem;
      margin-bottom: 2rem;
    }
    .description {
      flex: 1;
    }
    .users {
      list-style: none;
      padding: 0;
      margin-left: 2rem;
    }
    .map {
      display: block;
      width: 100%;
      height: auto;
      margin: 2rem 0;
    }
    .photos {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
    }
    .photos a,
    .photos img {
      display: block;
    }
    details {
      border-top: 1px solid black;
    }
    details[open] {
      border-top: 2px solid black;
      border-bottom: 3px solid black;
      padding-bottom: 4rem;
    }
    summary {
      padding: 1rem 0;
    }
    details[open] summary {
      margin-bottom: 4rem;
      font-weight: bold;
    }
    .comments {
      margin-top: 4rem;
      overflow: auto;
    }
  </style>
</head>
<body>
  <h1>${meta.title}</h1>

  <div class="meta">
    <img src="screenshots/card.png" alt="" class="card">

    <div class="description">${meta.description}</div>

    <ul class="users">
      ${meta.users
        .map(
          (user, i) => `
            <li>
              <img src="screenshots/user-${i + 1}.png" alt="${user}">
            </li>
          `
        )
        .join("")}
    </ul>
  </div>

  <img src="screenshots/map.png" alt="" class="map">

  <div class="waypoints">
    ${waypoints
      .map(
        (waypoint) => `
          <details>
            <summary>${waypoint.date} – ${waypoint.title}</summary>

            <div>${waypoint.description.replace(/\n/g, "<br>")}</div>

            <ul class="photos">
            ${waypoint.photos
              .map((config) => {
                const photo = photos.find((photo) => photo.id === config.id);

                return photo
                  ? `
                      <li>
                        <a href="photos/${photo.id}-large.jpeg">
                          <img src="photos/${photo.id}-small.jpeg" alt="${photo.description}" title="${photo.description}">
                        </a>
                      </li>
                    `
                  : "";
              })
              .join("")}
            </ul>

            <div class="comments">
              <img src="screenshots/comments/comments-${
                waypoint.id
              }.png" alt="Screenshot of Facebook comments">
            </div>
          </details>
        `
      )
      .join("")}
  </div>
</body>
</html>
`;

module.exports = {
  template,
};
