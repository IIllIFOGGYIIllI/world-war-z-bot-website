# Version 1.22.26

## Road Overlay Foundation

- Added an independent transparent road-tile layer to the interactive Chernarus map engine.
- Added matching road-overlay image slots to both shop coordinate pickers.
- Added hidden road-layer toggles that automatically appear only when a valid overlay source is enabled.
- Added central `map.road_overlay` configuration to `assets/data/chernarus/pois.json`.
- Added `assets/chernarus-map/overlays/roads/README.md` describing the expected final overlay pyramid.
- The road overlay remains disabled until a clean source is generated, so production visuals are unchanged.
- Pairs with Bot v1.18.26.
- No Railway API, database, moderation, shop-delivery or rental logic changed.
