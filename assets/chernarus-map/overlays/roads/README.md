# Chernarus Road Overlay

This directory is reserved for the optional high-resolution road overlay.

Expected generated assets when the overlay is ready:

- `overview.webp` — 3840 × 3840 transparent preview used by shop coordinate pickers.
- `tiles/{z}/{x}/{y}.webp` — transparent 480 px road overlay tiles matching the existing satellite pyramid.
- Zooms `0` through `5`, with the same 15360 px native square and north-up orientation as the satellite map.

The road overlay is intentionally disabled in `assets/data/chernarus/pois.json` until a clean source is generated and validated. Enabling it requires no JavaScript changes; set `map.road_overlay.enabled` to `true` after the full overlay pyramid exists.
