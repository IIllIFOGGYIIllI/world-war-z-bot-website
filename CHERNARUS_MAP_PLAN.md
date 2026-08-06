# Chernarus Satellite Map Implementation

## Current implementation

Version 1.22.4 corrects the source-tile gutter discovered after the first live deployment. The uploaded files remain a complete north-up 32 × 32 grid:

- first filename number: horizontal column, west to east;
- second filename number: vertical row, north to south;
- horizontal flip: none;
- vertical flip: none;
- source file dimensions: 512 × 512 pixels;
- duplicated perimeter gutter: 16 pixels on every edge;
- shared imagery between neighbours: 32 pixels;
- unique pixels per source tile: 480 × 480;
- corrected native map square: 15,360 × 15,360 pixels;
- DayZ coordinate square: X/Z 0 through 15,360.

Every adjacent border was compared exactly. All 992 horizontal pairs and all 992 vertical pairs contain the expected identical 32-pixel overlap. Cropping 16 pixels from each edge removes the duplicated area and creates a direct one-pixel-to-one-metre map. X increases west to east. Z increases south to north.

## Browser tile pyramid

The corrected pyramid uses 480 px WebP tiles:

- zoom 0: 1 tile;
- zoom 1: 4 tiles;
- zoom 2: 16 tiles;
- zoom 3: 64 tiles;
- zoom 4: 256 tiles;
- zoom 5: 1,024 tiles;
- total: 1,365 tiles.

Only visible tiles and a one-tile buffer are inserted into the page. The tile URLs include the current patch version so GitHub Pages and browsers do not retain the misaligned v1.22.3 files.

## Controls

The public map supports mouse-wheel zoom, pointer and touch dragging, two-finger pinch zoom, keyboard navigation, Reset, Fullscreen, pointer coordinates, click/tap X/Z selection, coordinate copying, public POI search and category filtering.

## Privacy and access

The map is public and read only. It renders only POIs explicitly marked `visibility: public` in `assets/data/chernarus/pois.json`. Private bases, live player locations, Admin positions and protected Railway data are not loaded by the map. Admin-only and Owner-only dashboard functions continue to use the existing Railway-verified visibility controls.
