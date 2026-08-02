# Interactive Chernarus POI Map

Map Stage 1 is implemented as a dedicated public dashboard view.

## Current implementation

- Official ChernarusPlus satellite image hosted inside this website repository.
- Enhanced 4096px Roads view with a Roads/Satellite layer switch.
- No third-party map scripts, embeds, tiles, cookies or tracking.
- Native mouse, touch and keyboard pan and zoom.
- Validated public JSON POIs with search, filters and accessible details.
- DayZ X/Z coordinate readout and marker positioning on a 15360 m map.
- Responsive desktop, tablet and mobile layouts.
- The current position and approved markers remain aligned when layers change.

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

- Official map source: https://github.com/BohemiaInteractive/DayZ-Central-Economy/tree/master/CETool/ChernarusPlus
- ADPL-SA licence: https://www.bohemia.net/community/licenses/arma-and-dayz-public-license-share-alike-adpl-sa
