# Chernarus Satellite Map Implementation

## Current implementation

Version 1.22.3 replaces the public Coming Soon map with a locally hosted satellite explorer generated from the uploaded Chernarus layer tiles.

The source tiles are ordered as follows:

- first filename number: horizontal column, west to east;
- second filename number: vertical row, north to south;
- horizontal flip: none;
- vertical flip: none;
- source grid: 32 × 32;
- native source square: 16,384 × 16,384 pixels;
- DayZ coordinate square: X/Z 0 through 15,360.

The complete 16,384 px source square maps linearly to the 15,360 metre Chernarus coordinate system. X increases from west to east. Z increases from south to north.

## Browser tile pyramid

The generated pyramid uses 512 px WebP tiles:

- zoom 0: 1 tile;
- zoom 1: 4 tiles;
- zoom 2: 16 tiles;
- zoom 3: 64 tiles;
- zoom 4: 256 tiles;
- zoom 5: 1,024 tiles;
- total: 1,365 tiles.

Only visible tiles and a one-tile buffer are inserted into the page. This prevents the browser from downloading the complete high-resolution map during ordinary use.

## Controls

The public map supports:

- mouse-wheel zoom;
- pointer and touch dragging;
- two-finger pinch zoom;
- keyboard arrows, plus, minus and zero;
- Reset and Fullscreen controls;
- pointer coordinate display;
- click/tap coordinate selection;
- copied X/Z values with three decimal places;
- public POI search, category filtering and centring.

## Privacy and access

The map is public and read only. It renders only POIs explicitly marked `visibility: public` in `assets/chernarus-pois.json`. Private bases, live player locations, Admin positions and protected Railway data are not loaded by the map.

Admin-only and Owner-only dashboard functions continue to use the existing Railway-verified visibility controls.
