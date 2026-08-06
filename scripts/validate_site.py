from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


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


def validate_html_references(errors: list[str]) -> None:
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
            if not target.exists():
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


def validate_json(errors: list[str]) -> None:
    required_json = (
        ROOT / "assets/data/chernarus/pois.json",
        ROOT / "assets/chernarus-map/tile-report.json",
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
        "assets/world-war-z-banner.webp",
    )
    for relative_path in required:
        if not (ROOT / relative_path).is_file():
            errors.append(f"Missing required website file: {relative_path}")


def main() -> int:
    errors: list[str] = []
    validate_required_files(errors)
    validate_html_references(errors)
    validate_css_references(errors)
    validate_json(errors)

    if errors:
        print("World War Z website validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    tile_count = len(list((ROOT / "assets/chernarus-map/tiles").rglob("*.webp")))
    print("World War Z website validation passed.")
    print(f"HTML pages: {len(list(ROOT.glob('*.html')))}")
    print(f"JavaScript files: {len(list(ROOT.rglob('*.js')))}")
    print(f"Chernarus tiles: {tile_count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
