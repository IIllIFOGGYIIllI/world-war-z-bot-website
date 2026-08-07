# Version 1.22.30

## Authoritative Bilingual Chernarus Labels

- Replaces the temporary hand-built 74-place settlement dataset with **77 authoritative settlement anchors** extracted from `CfgWorlds > ChernarusPlus > Names` in the ChernarusPlus world `config.cpp`.
- Preserves the exact game-config X/Z positions and Cyrillic `name` values.
- Uses the `Settlement_*` class identifiers for the familiar Latin/transliterated map names.
- Preserves the game config's own settlement hierarchy instead of inventing a `town` tier:
  - 2 `Capital`
  - 16 `City`
  - 59 `Village`
- Adds the three settlements that were absent from the first manual pass: **Drozhino, Karmanovka and Krasnoye**.
- Renders settlement labels as two lines: Cyrillic above, Latin/transliterated name below.
- Uses zoom-aware hierarchy: capitals from zoom 0, cities from zoom 2 and villages from zoom 4.
- Adds lightweight label-collision suppression with Capital → City → Village priority so lower-priority labels do not overwhelm the map.
- Gives place names their own non-interactive Leaflet pane below public/custom location pins and above the production road/satellite layers.
- Suppresses a settlement label when a visible public/custom marker already displays the same Latin or Cyrillic name.
- Adds `scripts/build_chernarus_place_names.py` so the JSON can be regenerated directly from an extracted ChernarusPlus `world/config.cpp`.
- Strengthens validation to require the authoritative 306-name source count and exact 77-settlement / 2+16+59 breakdown.
- Preserves v1.22.29 location-pin markers and v1.22.28 browser-local custom pins.
- Preserves the corrected 4,810 JPG satellite tiles and final 52,006-part road overlay unchanged.
- Pairs with Bot v1.18.26.
- No Railway API, authentication, permission, moderation, shop/rental API contract or database behaviour changed.
- `/app/data/players.db` is not included, reset, replaced or modified.

## Deployment

This is an incremental website patch. **Do not rerun the satellite installer** if the 4,810 production JPG tiles are already present in your repository.

Run:

```powershell
py .\scripts\validate_site.py --require-map-assets
git add .
git commit -m "Refine Chernarus place labels"
git push
```

Optional regeneration from the extracted game config:

```powershell
py .\scripts\build_chernarus_place_names.py "D:\Project Drive\DZ\worlds\chernarusplus\world\config.cpp"
```
