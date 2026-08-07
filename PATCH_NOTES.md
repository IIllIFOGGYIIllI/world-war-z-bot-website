# Version 1.22.27

## Unified Production Chernarus Map

- Replaced the retired custom/WebP Chernarus renderer with one shared Leaflet-based production map runtime.
- Uses the corrected local JPG satellite pyramid at native zooms 0–6 with browser overzoom through zoom 14.
- Uses the final grouped WRP-derived road overlay with 51,416 production source features, 52,006 line parts and nine production groups.
- Preserves the proven 15,360 m × 15,360 m DayZ coordinate system and manual DayZ `[X,Z]` → Leaflet conversion.
- Preserves the approved 180% production road-width multiplier and automatic detail-by-zoom thresholds.
- Uses non-interactive Canvas-rendered road casing/surfaces so road geometry does not intercept map interaction.
- Replaced the main dashboard Chernarus map, dashboard shop coordinate picker, standalone Survivor Shop coordinate picker and Saved Delivery Locations coordinate picker with the shared renderer.
- Replaced the Server Status map preview with the corrected production satellite root tile.
- Added full-map Roads and Trails visibility controls, fullscreen, reset, coordinate readout and click-to-copy behaviour.
- Coordinate pickers populate native DayZ X/Z with one decimal place and retain existing saved-location and checkout behaviour.
- Did not add a map to Events & Zones because the current website does not expose a coordinate-map workflow there; Event Zone remains optional where already supported.
- Retired the old WebP tile pyramid, overview image, tile report and legacy vector map fallback.
- Added a PowerShell asset installer for copying the user's completed corrected satellite pyramid and final road GeoJSON into the repository safely.
- GitHub Pages validation now refuses deployment if the production map assets are missing or retired map assets remain.
- Pairs with Bot v1.18.26.
- No Railway API, authentication, permission, moderation, shop/rental API contract or database behaviour changed.
- `/app/data/players.db` is not included, replaced, reset or modified.

## Production asset prerequisite

The binary production map assets were not present in the uploaded website archive. Before deployment, copy:

- `D:\Project Drive\DZ\road-overlay-work\chernarus-map\satellite-corrected\` → `assets/chernarus-map/satellite-corrected/`
- `D:\Project Drive\DZ\road-overlay-work\chernarus-map\test\data\chernarus-roads-overlay-final.geojson` → `assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson`

Run `scripts/install_chernarus_map_assets.ps1` from PowerShell to perform that copy, remove retired map assets and run strict validation automatically.
