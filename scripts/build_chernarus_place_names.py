from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

INCLUDED_TYPES = {"Capital", "City", "Village"}
MIN_ZOOM = {"Capital": 0, "City": 2, "Village": 4}


def names_block(source: str) -> str:
    match = re.search(r"\bclass\s+Names\s*\{", source)
    if not match:
        raise ValueError("Could not find class Names in the supplied ChernarusPlus config.")
    start = match.end() - 1
    depth = 0
    for index in range(start, len(source)):
        if source[index] == "{":
            depth += 1
        elif source[index] == "}":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
    raise ValueError("class Names is not terminated correctly.")


def latin_name(source_class: str) -> str:
    suffix = source_class.split("_", 1)[1] if "_" in source_class else source_class
    parts = re.findall(r"[A-Z]+(?=[A-Z][a-z]|$)|[A-Z]?[a-z]+|\d+", suffix)
    return " ".join(parts)


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def parse_names(source: str) -> list[dict[str, object]]:
    pattern = re.compile(
        r'class\s+([A-Za-z0-9_]+)\s*\{\s*'
        r'name="([^"]*)";\s*'
        r'position\[\]=\{([^}]*)\};\s*'
        r'type="([^"]+)";\s*\};',
        re.S,
    )
    records: list[dict[str, object]] = []
    for match in pattern.finditer(names_block(source)):
        coordinates = [float(item.strip()) for item in match.group(3).split(",") if item.strip()]
        if len(coordinates) != 2:
            continue
        records.append(
            {
                "sourceClass": match.group(1),
                "nativeName": match.group(2),
                "x": coordinates[0],
                "z": coordinates[1],
                "sourceType": match.group(4),
            }
        )
    return records


def build_payload(records: list[dict[str, object]]) -> dict[str, object]:
    places: list[dict[str, object]] = []
    for record in records:
        source_type = str(record["sourceType"])
        if source_type not in INCLUDED_TYPES:
            continue
        display_name = latin_name(str(record["sourceClass"]))
        places.append(
            {
                "id": slug(display_name),
                "sourceClass": record["sourceClass"],
                "name": display_name,
                "nativeName": record["nativeName"],
                "type": source_type.lower(),
                "sourceType": source_type,
                "x": record["x"],
                "z": record["z"],
                "minZoom": MIN_ZOOM[source_type],
            }
        )

    return {
        "version": 2,
        "map": "ChernarusPlus",
        "coordinateSystem": "DayZ X/Z metres",
        "source": {
            "file": r"DZ\worlds\chernarusplus\world\config.cpp",
            "section": "CfgWorlds > ChernarusPlus > Names",
            "includedTypes": ["Capital", "City", "Village"],
            "sourceRecordsInNames": len(records),
            "includedSettlementRecords": len(places),
        },
        "note": (
            "Authoritative settlement anchors and Cyrillic names are extracted from the "
            "ChernarusPlus world config. Latin display names are derived from Settlement_* "
            "class identifiers. Road geometry and satellite imagery are independent."
        ),
        "places": places,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build the Chernarus settlement label dataset from config.cpp.")
    parser.add_argument("config", type=Path, help="Path to ChernarusPlus world/config.cpp")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/data/chernarus/place-names.json"),
        help="Output JSON path",
    )
    args = parser.parse_args()

    source = args.config.read_text(encoding="utf-8")
    records = parse_names(source)
    payload = build_payload(records)
    places = payload["places"]
    if len(records) != 306:
        raise SystemExit(f"Expected 306 Chernarus Names records, found {len(records)}.")
    if len(places) != 77:
        raise SystemExit(f"Expected 77 settlement labels, found {len(places)}.")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(places)} authoritative Chernarus settlement labels to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
