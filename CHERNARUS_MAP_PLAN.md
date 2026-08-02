# Interactive Chernarus POI Map Plan

The Server Status page is prepared for a later interactive Chernarus
map. This should be a separate dashboard stage after member account data
is stable.

## Recommended approach

- Host the map image inside the website repository so visitors are not
  tracked by an unknown tile provider.
- Use a map image the World War Z community has permission to publish.
- Vendor Leaflet locally under its BSD 2-Clause licence rather than
  loading scripts from a third-party CDN.
- Use Leaflet `CRS.Simple` with an image overlay so DayZ coordinates can
  be converted to map positions without geographic map tiles.
- Store public POIs as validated JSON containing an ID, category, name,
  description, X/Z DayZ coordinates and visibility.
- Add pan, zoom, category filters, search and accessible POI details.

## Access model

- Visitors and members can view public POIs.
- Admins can receive approved moderation overlays only from protected
  Railway endpoints.
- Owners can later create, edit or remove POIs through confirmed,
  audit-logged endpoints.
- Hidden buttons are only presentation; Railway must authorize every
  map-management request again.

## Suggested POI categories

- Safe zones
- Trader locations
- Public builder sheds
- Event areas
- Teleporters
- PvP landmarks
- Community services

Do not expose live player locations, private bases, admin positions or
unpublished event coordinates through the public website.

## Implementation stages

1. Licensed local Chernarus image with pan and zoom.
2. Public read-only POI markers and category filters.
3. Railway-backed POI storage and validation.
4. Owner editor with confirmation, audit history and rollback.

References:

- Leaflet reference: https://leafletjs.com/reference.html
- Leaflet licence: https://github.com/Leaflet/Leaflet/blob/main/LICENSE
