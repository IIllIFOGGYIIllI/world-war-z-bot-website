# Chernarus Production Map Validation

## Required production assets

The v1.22.27 code patch does not fabricate or substitute the completed map binaries. Before GitHub Pages deployment the repository must contain:

```text
assets/chernarus-map/satellite-corrected/0/0/0.jpg
...
assets/chernarus-map/satellite-corrected/6/<x>/<y>.jpg
assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson
```

Expected corrected satellite pyramid:

- native zooms 0–6;
- JPG only;
- 4,810 JPG tiles total;
- corrected 15,360 × 15,360 map;
- no retired WebP pyramid or overview image.

Expected production road dataset:

- nine production groups;
- 52,006 renderable line parts;
- 51,416 production source features in the approved source build;
- no reintroduction of the 15 unresolved records;
- no reintroduction of the 68 centerline diagnostics.

## Recommended Windows installation

From the root of a local clone of `world-war-z-website`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_chernarus_map_assets.ps1
```

The script uses the approved local map project paths by default, removes retired map assets, copies the corrected JPG pyramid and final road GeoJSON, validates the tile count and then runs strict website validation.

## Website validation

Patch-development validation, which permits the production binaries to be absent:

```powershell
py .\scripts\validate_site.py
```

Deployment validation, which requires the real production assets:

```powershell
py .\scripts\validate_site.py --require-map-assets
```

The included GitHub Pages workflow runs the strict command automatically. A deployment therefore fails before publishing if the new map assets have not been copied or if retired map assets remain.

## Browser checks after local installation

Verify all of these before publishing:

1. Main Chernarus map satellite imagery loads at full-map view and overzooms beyond native zoom 6.
2. Primary roads are visible from zoom 0; secondary/bridge from 2; local/city/gravel from 3; mud/other paved from 4; trails from 5.
3. Roads align with satellite features and preserve the approved 180% width profile.
4. Map click copies `X, Z` with one decimal place.
5. Dashboard checkout map fills X/Z fields correctly.
6. Standalone Survivor Shop checkout map fills X/Z fields correctly.
7. Saved Delivery Locations can select and edit native X/Z positions correctly.
8. Fullscreen/reset/zoom controls do not accidentally select coordinates.
9. Roads and Trails toggles on the full map work independently.
10. Railway-backed public marker search/details work when Bot v1.18.27 is available; the retired hard-coded POI list remains empty.

Do not reopen WRP geometry reconstruction for minor thick-line intersection seams; those are renderer polish unless a genuine alignment defect is demonstrated.

## v1.22.30 authoritative label checks

`assets/data/chernarus/place-names.json` is expected to be a generated representation of the ChernarusPlus world config `Names` section.

Validation requires:

- source section `CfgWorlds > ChernarusPlus > Names`;
- 306 parsed source `Names` records;
- exactly 77 included settlement labels;
- exactly 2 `capital`, 16 `city` and 59 `village` records;
- unique IDs and unique `Settlement_*` source classes;
- non-empty Latin and Cyrillic names;
- matching `sourceType` values (`Capital`, `City`, `Village`);
- every X/Z anchor inside 0–15,360 m;
- every minimum zoom inside Leaflet 0–14.

Browser checks:

1. At world overview, Chernogorsk and Novodmitrovsk are the highest-priority settlement labels.
2. Labels display Cyrillic on the first line and Latin/transliterated text below.
3. City labels appear as zoom increases; Village labels appear from zoom 4.
4. Dense areas suppress lower-priority collisions rather than stacking unreadable text.
5. Public/custom location pins remain above the settlement-name layer.
6. The Names control toggles labels without redrawing or modifying road geometry.
7. Existing visible pins with a matching settlement name suppress the duplicate generic label.

Location labels are UI overlays only; satellite tile counts and production road line-part validation remain unchanged.
## v1.22.31 shared-marker checks

1. With no Discord sign-in, public markers load but public create/edit/delete controls stay hidden.
2. An ordinary member can create/edit/delete only browser-private pins and never sees public publishing controls.
3. A verified Admin/Owner sees **+ Public Marker**, can publish a marker, and every browser sees it after refresh.
4. Editing/deleting a public marker persists through Railway; editing/deleting a private pin changes only the current browser.
5. Direct calls to the public-marker write endpoint as an ordinary member receive HTTP 403.
6. Private pin export/import contains only browser-private locations, never Railway public markers.
7. `assets/data/chernarus/pois.json` contains no retired hard-coded marker entries.
8. Public/private markers remain above the bilingual settlement-name pane without modifying road geometry.
9. Sign-out immediately hides Admin publishing controls and closes any open public-marker editor.
10. Existing satellite tile, road line-part and 77-settlement validation counts remain unchanged.

