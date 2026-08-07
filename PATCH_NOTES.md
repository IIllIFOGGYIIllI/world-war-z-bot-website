# Version 1.22.29

## Map Pins And Place Names

- Replaces the circular public/custom POI dots on the main Chernarus map with proper location-pin markers.
- Shows each public or personal custom location name beside its map pin.
- Highlights the existing marker when a saved/public location is selected instead of stacking a second coordinate-selection marker on top of it.
- Keeps unsaved click selections visually distinct with the same location-pin language.
- Adds a new `Names` overlay control beside Roads and Trails.
- Adds `assets/data/chernarus/place-names.json` with an initial zoom-aware city/town/village label set.
- Settlement labels are drawn as a separate non-interactive Leaflet layer and do not modify satellite tiles or road geometry.
- Duplicate place text is suppressed when a currently visible public/custom location marker already carries the same name.
- Adds validation for the place-name data structure, supported settlement types, coordinates, zoom thresholds and unique IDs.
- Preserves v1.22.28 browser-local custom pins, filtering, search, editing, delete, import/export and privacy behaviour.
- Preserves the corrected 4,810 JPG satellite tiles, native zooms 0–6, overzoom to 14 and the final 52,006-part road overlay.
- Pairs with Bot v1.18.26.
- No Railway API, authentication, permission, moderation, shop/rental API contract or database behaviour changed.
- `/app/data/players.db` is not included, reset, replaced or modified.

## Follow-up label polish

The place-name overlay is intentionally independent from the production map geometry. A later patch can refine bilingual/Cyrillic labels, individual anchor placement and settlement hierarchy without touching the corrected satellite pyramid or WRP road network.

## Deployment

This is an incremental website patch. The corrected satellite tiles and final production road GeoJSON already in the repository do not need to be reinstalled.

Run:

```powershell
py .\scripts\validate_site.py --require-map-assets
git add .
git commit -m "Add Chernarus map labels"
git push
```
