# Chernarus Production Map Architecture

## Version 1.22.27

The website now has one canonical Chernarus map renderer: `assets/js/map/chernarus-map.js`. The dashboard map, both shop coordinate pickers and Saved Delivery Locations all consume this shared implementation instead of maintaining separate map engines.

## Production raster

Source to install:

`D:\Project Drive\DZ\road-overlay-work\chernarus-map\satellite-corrected`

Repository target:

`assets/chernarus-map/satellite-corrected/{z}/{x}/{y}.jpg`

- JPG only.
- Native zooms 0–6.
- 4,810 generated production tiles.
- Browser overzoom allowed through zoom 14.
- The corrected pyramid already removes the duplicated 16 px edge gutters from the original 512 px converted source tiles.
- Effective map dimensions are 15,360 × 15,360 m.

## Coordinate system

Leaflet uses `L.CRS.Simple` with bounds:

```text
[-240, 0]
[0, 240]
```

Constants:

```text
MAP_METRES = 15360
MAP_UNITS  = 240
SCALE      = 240 / 15360 = 0.015625
```

DayZ X/Z to Leaflet:

```text
lat = (Z - 15360) * SCALE
lng = X * SCALE
```

Leaflet to DayZ:

```text
X = lng / SCALE
Z = (lat / SCALE) + 15360
```

Displayed and copied coordinates use one decimal place.

## Production roads

Source to install:

`D:\Project Drive\DZ\road-overlay-work\chernarus-map\test\data\chernarus-roads-overlay-final.geojson`

Repository target:

`assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson`

Production data:

- 51,416 source features.
- 52,006 renderable line parts.
- Nine groups: `paved_primary`, `paved_secondary`, `paved_local`, `city`, `bridge`, `paved_other`, `gravel`, `mud`, `trail`.
- The 15 unresolved navigation records are excluded.
- The 68 centerline diagnostic features are excluded.

The renderer deliberately does **not** use `L.geoJSON()` for road coordinates. It manually converts native `[X,Z]` coordinates with `worldToLeaflet()` and draws grouped non-interactive `L.polyline()` geometry on Canvas renderers with `padding: 0.55`.

Road casing and road surfaces use separate Canvas panes so thick casing is drawn consistently below all surfaces. Roads never own click interaction; selection belongs to the map itself.

## Approved road detail

The production width multiplier is fixed at **1.80**.

Base zoom width profile:

| Zoom | Multiplier |
|---:|---:|
| ≤0 | 0.38 |
| 1 | 0.45 |
| 2 | 0.55 |
| 3 | 0.68 |
| 4 | 0.82 |
| 5 | 0.96 |
| 6 | 1.10 |
| >6 | `1.10 + ((zoom - 6) * 0.18)`, capped at 2.45 |

Automatic detail thresholds:

| Group | Minimum zoom |
|---|---:|
| Primary paved | 0 |
| Secondary paved | 2 |
| Bridges | 2 |
| Local paved | 3 |
| Town / city | 3 |
| Gravel | 3 |
| Dirt / mud | 4 |
| Other paved / special | 4 |
| Trails / paths | 5 |

## Shared modes

**Full map** provides zoom/pan, reset, fullscreen, pointer coordinates, click-to-copy, public POIs and independent Roads/Trails visibility.

**Coordinate picker** provides compact zoom/reset/fullscreen controls, click selection and direct X/Z field population without the large diagnostic layer panel.

**Saved location picker** uses the same compact renderer and can show an existing saved point while selection is locked.

Events & Zones are not given a new map merely because the renderer exists. A shared map is used only where the website currently has a genuine Chernarus coordinate workflow.

## Performance

- The road GeoJSON is fetched once per page and cached through a shared Promise.
- The nine production groups are rendered as grouped polylines, not tens of thousands of interactive Leaflet objects.
- Road layers use Canvas and `interactive: false`.
- Satellite tiles are local static GitHub Pages assets.
- Map instances lazy-initialise in hidden dashboard views only when needed.

## v1.22.29 — map pins and place-name overlay

- Public and browser-local custom map locations use named location-pin markers instead of circular dots.
- Marker labels are presentation-only and do not change stored DayZ X/Z coordinates.
- Selecting an existing location highlights its real marker; the separate unsaved-selection pin is reserved for direct map clicks.
- The main map exposes a `Names` layer beside Roads and Trails.
- `assets/data/chernarus/place-names.json` stores settlement label anchors independently from WRP road geometry.
- City, town and village labels are zoom-aware and non-interactive.
- If a visible public/custom marker has the same name as a settlement label, the generic settlement label is suppressed to avoid duplicate text.
- This architecture allows later bilingual/Cyrillic text, label hierarchy and anchor-position polish without rebuilding satellite tiles or touching road coordinates.
