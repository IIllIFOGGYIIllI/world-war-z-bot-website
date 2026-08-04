# Chernarus Tile Validation — Version 1.22.3

## Source set

- Expected files: 1,024
- Validated files: 1,024
- Expected coordinate range: `000` through `031` for both filename indices
- Missing tiles: 0
- Extra tiles: 0
- Duplicate SHA-256 image groups: 0
- Dimensions: 512 × 512 for every source tile
- Colour mode: RGBA for every source tile
- Alpha channel: fully opaque for every source tile

## Orientation

Seam comparison and visual landmark alignment confirmed:

- first filename index = map column;
- second filename index = map row;
- no horizontal inversion;
- no vertical inversion;
- north is at the top;
- the coastline is on the east and south;
- Northwest Airfield, Chernogorsk, Elektrozavodsk, Berezino and the existing public POIs align with their X/Z coordinates.

## Generated output

- Tile format: WebP
- Tile size: 512 × 512
- Zoom levels: 0–5
- Generated map tiles: 1,365
- Coordinate-picker overview: 4,096 × 4,096 WebP
- Total processed map assets: 58,839,050 bytes before ZIP compression
- Output path: `assets/chernarus-map/`

The exact machine-readable validation result is stored in `assets/chernarus-map/tile-report.json`.
