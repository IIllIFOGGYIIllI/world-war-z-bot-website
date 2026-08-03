# World War Z Bot Website — Patch Notes

## Version 1.8.1 — Restart Confirmation Prompt

### Changed

- Replaced the typed `RESTART` requirement with a clear confirmation prompt.
- Admins now choose **Yes, restart server** or **No, cancel and return**.
- Added a short checklist explaining player disconnection, fresh permission
  verification and audit logging before confirmation.
- Kept the optional restart reason.

### Security

- The browser still sends Railway's required internal confirmation value only
  after the Admin selects **Yes, restart server**.
- Railway continues to perform the real authorization check, shared cooldown,
  in-progress protection and permanent audit logging.
- The change removes typing only; it does not weaken the protected backend.

## Version 1.8.0 — Secure Admin Restart

### Added

- Connected the verified Admin **Restart server** control to Railway's
  protected restart endpoint.
- Added an explicit confirmation dialog requiring `RESTART` exactly.
- Added an optional 200-character audit reason.
- Added clear accepted, cooldown, already-in-progress, expired-session,
  unavailable and failed-request states.
- Connected both the Admin tools control and Admin-only Overview shortcut.
- Added delayed live-status refreshes after an accepted request.

### Security

- The control is visible only to verified Admins and the Owner.
- Railway still performs a fresh Discord membership and role check for every
  restart request; hidden website controls are not the security boundary.
- The browser submits only the opaque dashboard session, confirmation and
  optional reason. Nitrado, Discord and OAuth secrets remain on Railway.
- The button locks while a request is running to prevent double submission.
- Railway shares cooldown and in-progress protection with Discord controls and
  writes the permanent database and Discord audit records.
- Stop and Start remain disabled until separate protected endpoints exist.

## Version 1.7.0 — Vector Road Map

### Added and improved

- Replaced the raster map stack with one custom **WWZ Vector Road Map**.
- Added crisp highlighted major roads, secondary roads, tracks, labels,
  forests, coastline, grid and official CE settlement footprints.
- Increased supported zoom while keeping the existing POIs aligned to DayZ
  X/Z coordinates.
- Added the official Bohemia Interactive fan-project disclaimer to the site.

### Removed

- Removed the blurry Tactical, Roads and Satellite image files.
- Removed the unused three-way map layer selector and duplicate coordinate
  grid overlay.

### Source and privacy

- The vector map is a schematic adaptation based on the official Bohemia
  Interactive DayZ Central Economy repository and is distributed under
  ADPL-SA.
- iZurvive artwork, labels and tiles are not included, copied or requested.
- The SVG and POI data are locally hosted; no third-party map service receives
  visitor requests.

## Version 1.6.0 — WWZ Tactical Map

### Added and improved

- Added a custom 4096px **WWZ Tactical** view derived from the official
  Bohemia Interactive ChernarusPlus image.
- Added a pale tactical base, stronger real feature edges and restrained amber
  emphasis to make roads, towns and structures easier to distinguish.
- Added a three-way **Tactical / Roads / Satellite** selector.
- Tactical opens by default, supports closer zoom and remains aligned with all
  existing POI coordinates.
- Updated the Server Status preview to use the new tactical artwork.

### Source and privacy

- The new view is an original World War Z presentation of the official source
  and is distributed under ADPL-SA.
- It does not add, redraw or relocate geographic features.
- iZurvive artwork, labels and tiles are not included, copied or requested.
- All three map images are hosted locally, so visitors do not contact a
  third-party map service.

## Version 1.5.2 — Admin Server Controls

### Changed

- Moved **Protected server controls** from the public Server Status page into
  the verified **Admin tools** page.
- Admins and the Owner can now see the protected Restart, Stop and Start
  controls after Railway verifies their Discord role.
- Changed the Overview restart shortcut from Owner-only to Admin access.
- Kept the Owner Configuration page and its future file-management operations
  owner-only.

### Security

- The server controls remain disabled until protected Railway endpoints,
  confirmation prompts and audit logging are connected.
- Moving or hiding controls does not replace backend authorization; Railway
  must verify Admin permission again before every future server action.

## Version 1.5.1 — Clearer Map Layers

### Added and improved

- Added a locally hosted 4096px **Roads** view for clearer navigation.
- Added an in-map **Roads / Satellite** layer switch.
- Roads opens by default and the selected layer is remembered for the tab.
- Switching layers preserves the current position, markers and coordinates.
- Satellite zoom is capped closer to its native resolution to reduce blur.

### Source and privacy

- Both views are derived from the official Bohemia Interactive ChernarusPlus
  source and remain covered by ADPL-SA attribution.
- The enhanced Roads view changes presentation only; it does not invent or
  redraw geographic features.
- iZurvive imagery and tiles are not copied, embedded or requested.
- No third-party map provider receives visitor requests.

## Version 1.5.0 — Interactive Chernarus Map

### Added

- A dedicated **Chernarus map** tab under Community navigation.
- Official locally hosted ChernarusPlus imagery from Bohemia Interactive.
- Mouse, touch and keyboard pan and zoom controls.
- Public map markers with category filters, search and a location list.
- Clickable location details with DayZ X/Z coordinates.
- Responsive desktop, tablet and mobile map layouts.
- A compact map shortcut on the Server Status page.

### Access and safety

- The map is public and read only; Discord sign-in is not required.
- Only JSON entries explicitly marked `public` are displayed.
- Live players, private bases, Admin positions and unpublished events are excluded.
- The map image is stored in the website repository, so no third-party map
  provider receives visitor requests.
- Future Owner editing remains locked until Railway provides validation,
  permission checks, confirmation and audit history.

## Version 1.4.0 — Member Profile & Economy

### Added

- Live read-only survivor profile for the signed-in member.
- PlayStation ID, online state, playtime, sessions, server history,
  faction, reputation and PvP statistics.
- Live wallet, community jackpot, heat, daily streak, lifetime totals
  and six recent personal ledger entries.
- Clear linked, unlinked, loading and unavailable account states.
- A future interactive Chernarus POI-map foundation on Server Status.

### Access and security

- Admin and Owner tabs and buttons are hidden unless Railway verifies
  the corresponding Discord access.
- The backend still enforces authorization; hidden UI is not treated as
  the security boundary.
- The browser cannot choose another member's Discord ID.
- Warnings, Admin notes, Discord IDs and transaction counterparties are
  not returned.
- The connected-account **Sign in with Discord** button now correctly
  disappears while **Sign out** remains available.
- The existing backend `staff` key is displayed as **Admin** throughout
  the website for compatibility with current Railway configuration.

## Version 1.3.0 — Secure Discord Sign-In

### Added

- Real Discord OAuth sign-in through the existing Railway bot service.
- Live World War Z Discord membership and role verification.
- Verified member, Admin and owner access labels in the dashboard.
- Automatic session restoration within the same browser tab.
- Secure sign-out and clear sign-in error messages.
- Updated homepage, privacy information and browser changelog.

### Security

- Discord requests only the basic `identify` permission.
- The OAuth client secret and Discord access token never enter the
  GitHub Pages website.
- The one-time login ticket is returned in the URL fragment, exchanged
  immediately and removed from the address bar.
- The dashboard session is kept in `sessionStorage`, disappears when
  the tab closes and expires on Railway after 12 hours.
- Railway rechecks current guild membership and roles before returning
  authenticated identity information.
- Private profiles, economy records, moderation information and all
  server-changing controls remain locked for later stages.

## Version 1.2.0 — Live Server Status

### Added

- Live read-only DayZ server status from the World War Z Bot API on Railway.
- Live player count, capacity, map, platform and API update time.
- Automatic status refresh every 30 seconds and a manual refresh action.
- Online, restarting, offline and temporarily unavailable display states.
- Complete current catalogue of 30 top-level Discord commands.
- Updated homepage roadmap, dashboard help, privacy information and browser changelog.

### Security

- The public website cannot perform server-changing actions.
- Online player names, Discord member records, bot credentials and Nitrado credentials are not requested or displayed.
- Discord authentication and all protected account, Admin and owner features remain locked for future stages.

## Version 1.1.0 — Dashboard Preview

### Added

- Interactive dashboard preview designed for the future Railway backend.
- Responsive dashboard navigation for desktop, tablet and mobile devices.
- Overview, server status, commands, economy, players, tickets, Admin, configuration and settings views.
- Searchable 25-command preview catalogue with category filters.
- Discord login preview explaining the future authentication process.
- Visitor, member, Admin and owner access-level previews.
- Clearly labelled fictional server, player, activity, economy and backup data.
- Disabled owner and Admin controls showing the planned secure workflows.
- Frequently asked questions on the public homepage.
- Dedicated privacy and browser-readable changelog pages.
- Dashboard links in the public navigation, hero and footer.

### Security

- No live Discord, Railway, Nitrado or SQLite connection is made by the preview.
- Bot tokens, API credentials, client secrets and member records remain absent from the public website.
- Live actions stay disabled until authentication, permission checks, confirmations and audit logging are implemented on Railway.
- Real Discord login is deliberately unavailable until the backend is ready.

## Version 1.0.0 — Initial Website Release

### Added

- Dark red, black and weathered visual theme matching the supplied community banner.
- Responsive homepage for desktop, tablet and mobile devices.
- Navigation for Overview, Systems, Commands and Roadmap sections.
- World War Z community and DayZ server overview.
- Six bot system cards covering server integration, profiles, economy, moderation, tickets and configuration control.
- Slash-command showcase including the separate `/slots` command structure.
- Development roadmap for the Configuration Control Centre and future second-server support.
- Discord invite buttons using `discord.gg/worldwarzps`.
- Custom 404 page for invalid website links.
- Accessibility support including keyboard navigation, a skip link, labelled controls and reduced-motion handling.
- Social sharing and search description metadata.
- Independent-project trademark disclaimer.
- GitHub-to-Discord website update webhook setup guide.

### Security

- No Discord or Nitrado credentials are stored in the website.
- No external scripts, analytics or tracking services are included.
