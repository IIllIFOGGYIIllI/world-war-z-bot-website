from __future__ import annotations

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
MAP_ROOT = ROOT / "assets/chernarus-map"
SATELLITE_ROOT = MAP_ROOT / "satellite-corrected"
ROAD_FILE = MAP_ROOT / "overlays/roads/chernarus-roads-overlay-final.geojson"
OPTIONAL_PATCH_ASSET_PREFIXES = (
    "assets/chernarus-map/satellite-corrected/",
    "assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson",
)
RETIRED_MAP_PATHS = (
    MAP_ROOT / "overview.webp",
    MAP_ROOT / "tile-report.json",
    MAP_ROOT / "tiles",
    ROOT / "assets/images/maps/chernarus-vector.svg",
)
EXPECTED_ASSET_VERSION = "1.22.34"

EXPECTED_ROAD_GROUPS = {
    "paved_primary",
    "paved_secondary",
    "paved_local",
    "city",
    "bridge",
    "paved_other",
    "gravel",
    "mud",
    "trail",
}


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        values = dict(attrs)
        for attribute in ("src", "href"):
            value = values.get(attribute)
            if value:
                self.references.append((tag, attribute, value))


class InteractionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.forms: list[dict[str, object]] = []
        self.form_stack: list[dict[str, object]] = []
        self.buttons: list[dict[str, object]] = []
        self.inputs: list[dict[str, str | None]] = []

    @staticmethod
    def _attrs(attrs) -> dict[str, str | None]:
        return {str(key): value for key, value in attrs}

    def handle_starttag(self, tag: str, attrs) -> None:
        values = self._attrs(attrs)
        if tag == "form":
            form = {
                "attrs": values,
                "data_attrs": [key for key in values if key.startswith("data-")],
                "submit_buttons": 0,
            }
            self.forms.append(form)
            self.form_stack.append(form)
            return
        if tag == "button":
            form = self.form_stack[-1] if self.form_stack else None
            button_type = str(values.get("type") or ("submit" if form else "button")).lower()
            if form is not None and button_type == "submit":
                form["submit_buttons"] = int(form["submit_buttons"]) + 1
            self.buttons.append({
                "attrs": values,
                "data_attrs": [key for key in values if key.startswith("data-")],
                "form": form,
                "type": button_type,
            })
            return
        if tag in {"input", "select", "textarea"}:
            self.inputs.append(values)

    def handle_endtag(self, tag: str) -> None:
        if tag == "form" and self.form_stack:
            self.form_stack.pop()


def is_external(reference: str) -> bool:
    return reference.startswith((
        "#",
        "http://",
        "https://",
        "mailto:",
        "tel:",
        "data:",
        "javascript:",
    ))


def optional_patch_asset(reference: str) -> bool:
    path = urlsplit(reference).path
    return any(path.startswith(prefix) for prefix in OPTIONAL_PATCH_ASSET_PREFIXES)


def validate_html_references(errors: list[str], *, require_map_assets: bool) -> None:
    for html_path in sorted(ROOT.glob("*.html")):
        parser = ReferenceParser()
        parser.feed(html_path.read_text(encoding="utf-8"))
        for _, _, reference in parser.references:
            if is_external(reference):
                continue
            local_path = urlsplit(reference).path
            if not local_path:
                continue
            target = (html_path.parent / local_path).resolve()
            try:
                target.relative_to(ROOT)
            except ValueError:
                errors.append(f"{html_path.name}: reference leaves repository: {reference}")
                continue
            if not target.exists() and not (optional_patch_asset(reference) and not require_map_assets):
                errors.append(f"{html_path.name}: missing local asset: {reference}")


def validate_css_references(errors: list[str]) -> None:
    pattern = re.compile(r"url\((?:\"|')?([^\"')]+)")
    for css_path in sorted(ROOT.rglob("*.css")):
        source = css_path.read_text(encoding="utf-8")
        for reference in pattern.findall(source):
            if reference.startswith(("data:", "http://", "https://", "#", "%23")):
                continue
            target = (css_path.parent / urlsplit(reference).path).resolve()
            if not target.exists():
                errors.append(
                    f"{css_path.relative_to(ROOT)}: missing CSS asset: {reference}"
                )


def validate_interactions(errors: list[str], info: list[str]) -> None:
    js_source = "\n".join(
        path.read_text(encoding="utf-8")
        for path in sorted((ROOT / "assets/js").rglob("*.js"))
    )
    button_count = 0
    enabled_count = 0

    for html_path in sorted(ROOT.glob("*.html")):
        parser = InteractionParser()
        parser.feed(html_path.read_text(encoding="utf-8"))

        for button in parser.buttons:
            button_count += 1
            attrs = button["attrs"]
            if "disabled" in attrs:
                continue
            enabled_count += 1
            data_attrs = button["data_attrs"]
            form = button["form"]

            if any(data_attr in js_source for data_attr in data_attrs):
                continue

            if form is not None and button["type"] == "submit":
                form_attrs = form["attrs"]
                form_data_attrs = form["data_attrs"]
                if str(form_attrs.get("method") or "").lower() == "dialog":
                    continue
                if form_attrs.get("action"):
                    continue
                if any(data_attr in js_source for data_attr in form_data_attrs):
                    continue

            if (
                form is not None
                and str(form["attrs"].get("method") or "").lower() == "dialog"
                and str(attrs.get("value") or "").lower() == "close"
            ):
                continue

            errors.append(
                f"{html_path.name}: enabled button has no JavaScript/native form wiring: "
                + ", ".join(data_attrs or ["no data-* action"])
            )

    dynamic_button_count = 0
    for js_path in sorted((ROOT / "assets/js").rglob("*.js")):
        lines = js_path.read_text(encoding="utf-8").splitlines()
        for index, line in enumerate(lines):
            if "createElement('button')" not in line and 'createElement("button")' not in line:
                continue
            dynamic_button_count += 1
            nearby = "\n".join(lines[index:index + 40])
            if "addEventListener" not in nearby and ".onclick" not in nearby and "disabled" not in nearby:
                errors.append(
                    f"{js_path.relative_to(ROOT)}:{index + 1}: dynamically created button has no nearby handler/disabled state"
                )

    info.append(
        f"Button wiring audit: {button_count} static buttons ({enabled_count} enabled/native checked) + "
        f"{dynamic_button_count} dynamic button builders"
    )


def validate_asset_versions(errors: list[str]) -> None:
    pattern = re.compile(
        r"(?:src|href)=[\"'](assets/(?:js|css)/[^\"'?#]+\?v=([^\"'&]+))[\"']",
        re.IGNORECASE,
    )
    for html_path in sorted(ROOT.glob("*.html")):
        source = html_path.read_text(encoding="utf-8")
        for reference, version in pattern.findall(source):
            if version != EXPECTED_ASSET_VERSION:
                errors.append(
                    f"{html_path.name}: stale local asset cache version {version!r} in {reference}; "
                    f"expected {EXPECTED_ASSET_VERSION}"
                )


def validate_checkout_compatibility(errors: list[str]) -> None:
    coordinate_fields = (
        "data-map-custom-x",
        "data-map-custom-z",
        "data-location-x",
        "data-location-y",
        "data-location-z",
        "data-location-rotation",
        "data-shop-delivery-x",
        "data-shop-delivery-y",
        "data-shop-delivery-z",
        "data-shop-delivery-rotation",
        "data-member-delivery-x",
        "data-member-delivery-y",
        "data-member-delivery-z",
        "data-member-delivery-rotation",
    )
    html_source = "\n".join(
        path.read_text(encoding="utf-8")
        for path in (ROOT / "dashboard.html", ROOT / "shop.html")
    )
    for data_attr in coordinate_fields:
        match = re.search(
            rf"<input\b(?=[^>]*\b{re.escape(data_attr)}(?:=|\s|>))[^>]*>",
            html_source,
            re.IGNORECASE,
        )
        if not match:
            errors.append(f"Missing coordinate input: {data_attr}")
            continue
        if not re.search(r"\bstep=[\"']any[\"']", match.group(0), re.IGNORECASE):
            errors.append(
                f"{data_attr}: coordinate input must use step=any for legacy saved-location compatibility"
            )

    standalone_shop = (ROOT / "assets/js/pages/shop.js").read_text(encoding="utf-8")
    dashboard_shop = (ROOT / "assets/js/dashboard/shop.js").read_text(encoding="utf-8")
    if "input.disabled = saved;" not in standalone_shop:
        errors.append(
            "Standalone shop must disable hidden manual coordinate inputs when a saved location is selected."
        )
    if "input.disabled = usesSavedLocation;" not in dashboard_shop:
        errors.append(
            "Dashboard shop must disable hidden manual coordinate inputs when a saved location is selected."
        )


def validate_json(errors: list[str]) -> None:
    required_json = (
        ROOT / "assets/data/chernarus/pois.json",
        ROOT / "assets/data/chernarus/place-names.json",
    )
    for json_path in required_json:
        if not json_path.is_file():
            errors.append(f"Missing JSON file: {json_path.relative_to(ROOT)}")
            continue
        try:
            json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            errors.append(f"Invalid JSON in {json_path.relative_to(ROOT)}: {error}")


def validate_required_files(errors: list[str]) -> None:
    required = (
        "index.html",
        "dashboard.html",
        "shop.html",
        "assets/css/pages/home.css",
        "assets/css/dashboard/core.css",
        "assets/css/dashboard/moderation.css",
        "assets/css/dashboard/workspace.css",
        "assets/css/dashboard/catalogue.css",
        "assets/css/components/chernarus-map.css",
        "assets/css/pages/shop.css",
        "assets/css/pages/policies.css",
        "assets/js/core/http.js",
        "assets/js/pages/home.js",
        "assets/js/dashboard/shell.js",
        "assets/js/dashboard/core.js",
        "assets/js/dashboard/administration.js",
        "assets/js/dashboard/account.js",
        "assets/js/dashboard/shop.js",
        "assets/js/dashboard/delivery.js",
        "assets/js/pages/dashboard-map-loader.js",
        "assets/js/pages/shop.js",
        "assets/js/map/chernarus-map.js",
        "assets/js/data/command-library.js",
        "assets/data/chernarus/place-names.json",
        "assets/chernarus-map/satellite-corrected/README.md",
        "assets/chernarus-map/overlays/roads/README.md",
        "assets/world-war-z-banner.webp",
    )
    for relative_path in required:
        if not (ROOT / relative_path).is_file():
            errors.append(f"Missing required website file: {relative_path}")


def validate_retired_map_assets(errors: list[str]) -> None:
    for path in RETIRED_MAP_PATHS:
        if path.exists():
            errors.append(
                f"Retired Chernarus map asset still exists: {path.relative_to(ROOT)}"
            )

    retired_references = (
        "assets/chernarus-map/overview.webp",
        "assets/chernarus-map/tiles/",
        "assets/chernarus-map/overlays/roads/overview.webp",
        "assets/chernarus-map/overlays/roads/tiles/",
        "assets/images/maps/chernarus-vector.svg",
    )
    scan_paths = [ROOT / "dashboard.html", ROOT / "shop.html"]
    scan_paths += list((ROOT / "assets/js").rglob("*.js"))
    scan_paths += list((ROOT / "assets/css").rglob("*.css"))
    scan_paths += [ROOT / "assets/data/chernarus/pois.json", ROOT / "assets/data/chernarus/place-names.json"]
    for path in scan_paths:
        if not path.is_file():
            continue
        source = path.read_text(encoding="utf-8")
        for reference in retired_references:
            if reference in source:
                errors.append(
                    f"{path.relative_to(ROOT)}: retired map reference remains: {reference}"
                )


def validate_place_names(errors: list[str]) -> None:
    path = ROOT / "assets/data/chernarus/place-names.json"
    if not path.is_file():
        return
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return

    places = payload.get("places") if isinstance(payload, dict) else None
    if not isinstance(places, list) or not places:
        errors.append("assets/data/chernarus/place-names.json: places must be a non-empty array")
        return

    source = payload.get("source") if isinstance(payload, dict) else None
    if not isinstance(source, dict):
        errors.append("place-names.json: missing authoritative source metadata")
    else:
        if source.get("section") != "CfgWorlds > ChernarusPlus > Names":
            errors.append("place-names.json: unexpected source section")
        if source.get("sourceRecordsInNames") != 306:
            errors.append("place-names.json: source record count must be 306")
        if source.get("includedSettlementRecords") != 77:
            errors.append("place-names.json: included settlement record count must be 77")

    valid_types = {"capital", "city", "village"}
    expected_type_counts = {"capital": 2, "city": 16, "village": 59}
    type_counts = {kind: 0 for kind in valid_types}
    seen_ids: set[str] = set()
    seen_source_classes: set[str] = set()
    for index, place in enumerate(places):
        if not isinstance(place, dict):
            errors.append(f"place-names.json: entry {index} is not an object")
            continue
        place_id = str(place.get("id") or "").strip()
        name = str(place.get("name") or "").strip()
        native_name = str(place.get("nativeName") or "").strip()
        source_class = str(place.get("sourceClass") or "").strip()
        source_type = str(place.get("sourceType") or "").strip()
        place_type = str(place.get("type") or "").strip().lower()
        if not place_id or not name or not native_name:
            errors.append(f"place-names.json: entry {index} is missing id/name/nativeName")
        elif place_id in seen_ids:
            errors.append(f"place-names.json: duplicate id {place_id}")
        else:
            seen_ids.add(place_id)
        if not source_class.startswith("Settlement_"):
            errors.append(f"place-names.json: {place_id or index} has invalid sourceClass")
        elif source_class in seen_source_classes:
            errors.append(f"place-names.json: duplicate sourceClass {source_class}")
        else:
            seen_source_classes.add(source_class)
        if place_type not in valid_types:
            errors.append(f"place-names.json: {place_id or index} has unsupported type {place_type!r}")
        else:
            type_counts[place_type] += 1
            expected_source_type = place_type.capitalize()
            if source_type != expected_source_type:
                errors.append(
                    f"place-names.json: {place_id or index} sourceType {source_type!r} "
                    f"does not match {expected_source_type!r}"
                )
        for axis in ("x", "z"):
            value = place.get(axis)
            if not isinstance(value, (int, float)) or not 0 <= float(value) <= 15360:
                errors.append(f"place-names.json: {place_id or index} has invalid {axis}")
        zoom = place.get("minZoom")
        if not isinstance(zoom, (int, float)) or not 0 <= float(zoom) <= 14:
            errors.append(f"place-names.json: {place_id or index} has invalid minZoom")

    if len(places) != 77:
        errors.append(f"place-names.json: contains {len(places)} settlement labels; expected 77")
    for place_type, expected in expected_type_counts.items():
        if type_counts[place_type] != expected:
            errors.append(
                f"place-names.json: {place_type} count is {type_counts[place_type]}; expected {expected}"
            )


def normalise_group(value: object) -> str | None:
    text = re.sub(r"[^a-z0-9]+", "_", str(value or "").strip().lower()).strip("_")
    if text in EXPECTED_ROAD_GROUPS:
        return text
    if "primary" in text:
        return "paved_primary"
    if "secondary" in text:
        return "paved_secondary"
    if "local" in text:
        return "paved_local"
    if "city" in text or "town" in text:
        return "city"
    if "bridge" in text:
        return "bridge"
    if "gravel" in text or "grav" in text:
        return "gravel"
    if "mud" in text or "dirt" in text:
        return "mud"
    if "trail" in text or "path" in text:
        return "trail"
    if "paved" in text or "asphalt" in text or "taxiway" in text:
        return "paved_other"
    return None


def line_part_count(geometry: object) -> int:
    if not isinstance(geometry, dict):
        return 0
    kind = geometry.get("type")
    coordinates = geometry.get("coordinates")
    if kind == "LineString":
        return 1 if isinstance(coordinates, list) and len(coordinates) >= 2 else 0
    if kind == "MultiLineString":
        return sum(1 for line in coordinates or [] if isinstance(line, list) and len(line) >= 2)
    if kind == "GeometryCollection":
        return sum(line_part_count(item) for item in geometry.get("geometries") or [])
    return 0


def validate_road_asset(errors: list[str], info: list[str], *, required: bool) -> None:
    if not ROAD_FILE.is_file():
        if required:
            errors.append(
                "Missing production road asset: "
                "assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson"
            )
        else:
            info.append("Production road GeoJSON: not installed in this patch archive")
        return

    try:
        data = json.loads(ROAD_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as error:
        errors.append(f"Invalid production road GeoJSON: {error}")
        return

    groups: set[str] = set()
    parts = 0
    if isinstance(data, dict) and isinstance(data.get("groups"), dict):
        for raw_group, geometry in data["groups"].items():
            group = normalise_group(raw_group)
            if group:
                groups.add(group)
            if isinstance(geometry, dict) and geometry.get("type") == "Feature":
                geometry = geometry.get("geometry")
            elif isinstance(geometry, dict) and "geometry" in geometry:
                geometry = geometry.get("geometry")
            parts += line_part_count(geometry)
    else:
        features = []
        if isinstance(data, dict) and data.get("type") == "FeatureCollection":
            features = data.get("features") or []
        elif isinstance(data, dict) and data.get("type") == "Feature":
            features = [data]
        for feature in features:
            if not isinstance(feature, dict):
                continue
            properties = feature.get("properties") or {}
            candidates = (
                properties.get("group"),
                properties.get("road_group"),
                properties.get("production_group"),
                properties.get("category"),
                properties.get("class"),
                properties.get("style"),
                properties.get("surface"),
                properties.get("type"),
                feature.get("id"),
            )
            for candidate in candidates:
                group = normalise_group(candidate)
                if group:
                    groups.add(group)
                    break
            parts += line_part_count(feature.get("geometry"))

    missing_groups = EXPECTED_ROAD_GROUPS - groups
    if missing_groups:
        errors.append(
            "Production road GeoJSON is missing expected groups: "
            + ", ".join(sorted(missing_groups))
        )
    if parts != 52006:
        errors.append(
            f"Production road GeoJSON line-part count is {parts:,}; expected 52,006."
        )
    info.append(
        f"Production road GeoJSON: {len(groups)} groups, {parts:,} renderable line parts"
    )


def validate_satellite_assets(errors: list[str], info: list[str], *, required: bool) -> None:
    root_tile = SATELLITE_ROOT / "0/0/0.jpg"
    if not root_tile.is_file():
        if required:
            errors.append(
                "Missing corrected satellite pyramid root tile: "
                "assets/chernarus-map/satellite-corrected/0/0/0.jpg"
            )
        else:
            info.append("Corrected JPG satellite pyramid: not installed in this patch archive")
        return

    missing_zooms = [zoom for zoom in range(7) if not any((SATELLITE_ROOT / str(zoom)).rglob("*.jpg"))]
    if missing_zooms:
        errors.append(
            "Corrected satellite pyramid has no JPG tiles for native zoom(s): "
            + ", ".join(map(str, missing_zooms))
        )
    non_jpg = [
        path for path in SATELLITE_ROOT.rglob("*")
        if path.is_file() and path.name != "README.md" and path.suffix.lower() != ".jpg"
    ]
    if non_jpg:
        errors.append(
            f"Corrected satellite directory contains {len(non_jpg)} non-JPG production file(s)."
        )
    tile_count = len(list(SATELLITE_ROOT.rglob("*.jpg")))
    if tile_count != 4810:
        errors.append(
            f"Corrected satellite pyramid contains {tile_count:,} JPG tiles; expected 4,810."
        )
    info.append(f"Corrected JPG satellite tiles: {tile_count:,} across native zooms 0–6")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate the World War Z static website.")
    parser.add_argument(
        "--require-map-assets",
        action="store_true",
        help="Require the corrected JPG satellite pyramid and final production road GeoJSON.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    info: list[str] = []
    validate_required_files(errors)
    validate_html_references(errors, require_map_assets=args.require_map_assets)
    validate_css_references(errors)
    validate_interactions(errors, info)
    validate_asset_versions(errors)
    validate_checkout_compatibility(errors)
    validate_json(errors)
    validate_place_names(errors)
    validate_retired_map_assets(errors)
    validate_satellite_assets(errors, info, required=args.require_map_assets)
    validate_road_asset(errors, info, required=args.require_map_assets)

    if errors:
        print("World War Z website validation failed:")
        for error in errors:
            print(f"- {error}")
        for line in info:
            print(f"- {line}")
        return 1

    print("World War Z website validation passed.")
    print(f"HTML pages: {len(list(ROOT.glob('*.html')))}")
    print(f"JavaScript files: {len(list(ROOT.rglob('*.js')))}")
    for line in info:
        print(line)
    if not args.require_map_assets:
        print("Map asset enforcement: optional patch-build mode")
    return 0


if __name__ == "__main__":
    sys.exit(main())
