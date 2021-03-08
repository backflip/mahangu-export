# Mahangu export

Export trip from mahangu.com.

## Setup

Requires Node.js, tested on v14.

`npm install`

## Run

`npm run export -- --trip ID`

Optional flags:

- `--secret`: Access code
- `--debug`: Log stuff
- `--clean`: Delete `./build`
- `--skipDownloads`: Use pre-downloaded JSON files
