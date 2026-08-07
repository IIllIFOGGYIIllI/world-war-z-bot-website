# Version 1.22.32

## Trader Refund Confirmation Cleanup

- Removes the Reason textarea entirely from Cancel & Refund / Refund Order confirmation dialogs.
- Cancel/refund actions no longer require staff to type a 3–1,000 character reason before confirming.
- Processing and fulfilment actions keep their optional Action note field.
- The refund, stock restoration, order-history and protected Railway action flow are unchanged.
- Pairs with Bot v1.18.30, which accepts an empty cancellation/refund note.
- No map, satellite, road, authentication or database-reset behaviour changed.

---

# Version 1.22.31

## Shared Admin Public Map Markers

- Retires the old hard-coded public landmark pins now that the authoritative bilingual settlement overlay provides built-in place navigation.
- Keeps `assets/data/chernarus/pois.json` as map metadata but intentionally sets its legacy `pois` array to empty.
- Loads shared public markers from Railway `GET /api/map/markers`.
- Adds Admin-only **Create Public Marker**, edit and delete controls for authenticated `staff` / `owner` users.
- Publishes public marker writes through protected `POST /api/admin/map/markers/action`; Bot v1.18.27 performs the real server-side Discord permission check.
- Public markers support name, category, description, colour and one-decimal DayZ X/Z coordinates.
- Member/guest custom pins remain browser-local and private; they are never sent to Railway.
- Private pin export/import remains private-only.
- Adds an access-change event so the map immediately gains or loses Admin controls after Discord sign-in/sign-out.
- Preserves the 77 authoritative bilingual settlement labels, 4,810 corrected satellite JPGs and 52,006 production road line parts unchanged.
- Pairs with Bot v1.18.27. Deploy the bot first so the Railway marker API/table exists before publishing the website.
- No existing Railway record is reset or replaced; `/app/data/players.db` is never included in this website patch.

## Deployment

No satellite reinstall is required. After Bot v1.18.27 is deployed to Railway, apply this website patch and run:

```powershell
py .\scripts\validate_site.py --require-map-assets
git add .
git commit -m "Add admin public map markers"
git push
```

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
