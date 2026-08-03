# Interactive Chernarus POI Map

The dashboard now uses one custom vector road map instead of multiple raster
layers.

## Current implementation

- One locally hosted `assets/chernarus-vector.svg` base map.
- Highlighted major and secondary roads, tracks, coastline, forests, grid,
  settlement labels and CE settlement footprints.
- Vector line work and text stay sharp at every zoom level.
- No third-party map scripts, embeds, tiles, cookies or tracking.
- Native mouse, touch and keyboard pan and zoom.
- Validated public JSON POIs with search, filters and accessible details.
- DayZ X/Z coordinate readout and marker positioning on a 15360 m map.
- Responsive desktop, tablet and mobile layouts.

Public markers live in `assets/chernarus-pois.json`. Every entry must contain a
unique ID, category, name, description, X/Z DayZ coordinates and
`"visibility": "public"`. The browser rejects malformed, duplicate,
out-of-bounds or non-public entries.

## Access model

- Visitors and members can view public POIs.
- Admins may later receive approved moderation overlays only from protected
  Railway endpoints.
- Owners may later create, edit or remove POIs through confirmed and
  audit-logged endpoints.
- Hidden controls are only presentation; Railway must authorize every future
  map-management request again.

Never publish live player locations, private bases, Admin positions or
unpublished event coordinates.

## Future stages

1. Replace the initial navigation landmarks with confirmed World War Z
   community POIs such as traders, safe zones and event areas.
2. Add Railway-backed POI storage and strict validation.
3. Add an Owner editor with confirmation, audit history and rollback.
4. Add protected Admin overlays only where operationally safe.

## Sources

- Official source repository: https://github.com/BohemiaInteractive/DayZ-Central-Economy
- ADPL-SA licence: https://www.bohemia.net/en/licenses/arma-and-dayz-public-license-share-alike-adpl-sa
- Full attribution and modification notice: `MAP_ATTRIBUTION.md`
