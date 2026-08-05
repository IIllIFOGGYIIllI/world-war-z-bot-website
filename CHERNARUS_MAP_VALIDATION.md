# Chernarus Tile Validation — Version 1.22.4

## Source set

- Expected files: 1,024
- Validated files: 1,024
- Expected coordinate range: `000` through `031` for both filename indices
- Missing tiles: 0
- Extra tiles: 0
- Duplicate SHA-256 image groups: 0
- Source dimensions: 512 × 512 for every tile
- Colour mode: RGBA for every source tile

## Orientation and overlap

- First filename index = map column
- Second filename index = map row
- Horizontal inversion = none
- Vertical inversion = none
- North = top
- Coastline = east and south
- Exact shared border = 32 pixels
- Crop applied = 16 pixels from every edge
- Horizontal overlap pairs verified = 992 of 992
- Vertical overlap pairs verified = 992 of 992
- Unique source area per file = 480 × 480 pixels
- Corrected native map = 15,360 × 15,360 pixels
- Coordinate scale = one map pixel per DayZ metre

The v1.22.3 road offsets were caused by assembling all 512 pixels from each source file even though neighbouring files duplicate a 32-pixel strip. Version 1.22.4 removes the equal 16-pixel perimeter gutter before any stitching or downsampling.

## Generated output

- Tile format: WebP
- Tile size: 480 × 480
- Zoom levels: 0–5
- Generated map tiles: 1,365
- Coordinate-picker overview: 3,840 × 3,840 WebP
- Total processed map assets: 47,655,554 bytes before ZIP compression
- Output path: `assets/chernarus-map/`

The exact machine-readable validation result is stored in `assets/chernarus-map/tile-report.json`.
