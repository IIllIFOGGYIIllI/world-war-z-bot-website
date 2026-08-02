# World War Z Bot Website — Patch Notes

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
