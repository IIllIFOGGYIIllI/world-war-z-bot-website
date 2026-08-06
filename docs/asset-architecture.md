# Website asset architecture

Version 1.22.18 keeps every public HTML route at the repository root and divides the dashboard implementation into ordered responsibility bundles.

```text
assets/
├── css/
│   ├── dashboard/
│   │   ├── core.css
│   │   ├── moderation.css
│   │   ├── workspace.css
│   │   └── catalogue.css
│   └── pages/              Smaller page-specific styles
├── data/chernarus/         Public read-only map data
├── images/maps/            Map fallbacks and supporting imagery
└── js/
    ├── core/               Shared browser infrastructure
    ├── dashboard/
    │   ├── shell.js
    │   ├── core.js
    │   ├── administration.js
    │   ├── account.js
    │   ├── shop.js
    │   └── delivery.js
    ├── data/               Static command catalogue data
    ├── map/                Interactive map implementation
    └── pages/              Smaller page entry points
```

The dashboard scripts are classic deferred scripts loaded in the listed order. Their concatenated source is byte-for-byte equivalent to the previous `dashboard.js`, preserving shared lexical bindings and execution order. The style bundles are also loaded in their original cascade order.

The Chernarus map remains lazy-loaded only when its workspace is requested. HTML routes, API routes, Railway authentication, CSP restrictions and map tile URLs remain unchanged.

The Pages workflow runs `scripts/validate_site.py` and `node --check` before artifact upload, so broken local references, required files, JSON or JavaScript prevent publication.
