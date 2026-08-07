# Production Chernarus road overlay

Website v1.22.27 expects the approved production GeoJSON at:

`assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson`

Copy it from the completed local map project:

`D:\Project Drive\DZ\road-overlay-work\chernarus-map\test\data\chernarus-roads-overlay-final.geojson`

The browser renderer groups the geometry into the approved nine production classes and converts native DayZ `[X,Z]` points with `worldToLeaflet()` before drawing non-interactive `L.polyline()` layers. Do not replace this with raw `L.geoJSON()` coordinate interpretation.

The 15 unresolved records and the 68 centerline diagnostic records are intentionally excluded from the production dataset and must not be reintroduced.
