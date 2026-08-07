# Chernarus Map Attribution

The World War Z website is an unofficial community dashboard and is not affiliated with or endorsed by Bohemia Interactive.

## Source material

The production Chernarus map uses the user's own converted ChernarusPlus satellite source material and the user's own WRP-derived road geometry work.

Production browser assets are:

- corrected local satellite pyramid: `assets/chernarus-map/satellite-corrected/{z}/{x}/{y}.jpg`;
- final local road dataset: `assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson`.

The website does not request satellite or road-map data from a third-party map service at runtime. Leaflet is used only as the browser mapping software/runtime.

## Transformations

The original converted 32 × 32 satellite source was corrected for duplicated tile-edge gutters and rebuilt as a browser JPG pyramid. The road overlay was reconstructed, reviewed and grouped from Chernarus WRP navigation geometry for efficient browser rendering.

Map coordinates remain native DayZ Chernarus X/Z values over a 15,360 m × 15,360 m world.

Chernarus, DayZ and associated source imagery remain © Bohemia Interactive. The World War Z community project claims no ownership of Bohemia Interactive game assets or trademarks.

## Settlement name overlay

Version 1.22.30 derives the local settlement-name dataset from the extracted ChernarusPlus world configuration section `CfgWorlds > ChernarusPlus > Names`. The website retains the config's exact Cyrillic names, DayZ X/Z anchors and `Capital` / `City` / `Village` classifications; Latin/transliterated display names are derived from the corresponding `Settlement_*` class identifiers.

The iZurvive screenshots supplied during development are used only as a visual behaviour reference for bilingual label presentation. This website does not include iZurvive map imagery, icons, tiles, label data or copied overlay assets. The resulting 77-label dataset is stored locally in `assets/data/chernarus/place-names.json`.
## Shared marker data

Website v1.22.31 does not derive shared public marker names or descriptions from a third-party map provider. Shared markers are community/Admin-authored records stored by the World War Z Railway service. Member private pins stay in browser local storage. The underlying Chernarus imagery and config-derived settlement names retain the attribution above.

