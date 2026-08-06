# Website asset architecture

Version 1.22.17 keeps every public HTML route at the repository root and organises implementation assets by responsibility.

```text
assets/
├── css/pages/        Page-specific style bundles
├── data/chernarus/   Public read-only map data
├── images/maps/      Map fallbacks and supporting imagery
└── js/
    ├── core/         Shared browser infrastructure
    ├── data/         Static command catalogue data
    ├── map/          Interactive map implementation
    └── pages/        Page entry points
```

The dashboard map is loaded only when the map workspace is requested. HTML routes, API routes, Railway authentication, CSP restrictions and map tile URLs remain unchanged.

The Pages workflow runs `scripts/validate_site.py` and `node --check` before artifact upload, so broken local references, required files, JSON or JavaScript prevent publication.
