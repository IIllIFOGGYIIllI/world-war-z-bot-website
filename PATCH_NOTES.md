# World War Z Bot Website — Patch Notes

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
