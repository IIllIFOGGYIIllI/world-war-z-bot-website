# World War Z Bot Website — Patch Notes

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
- Discord authentication and all protected account, staff and owner features remain locked for future stages.

## Version 1.1.0 — Dashboard Preview

### Added

- Interactive dashboard preview designed for the future Railway backend.
- Responsive dashboard navigation for desktop, tablet and mobile devices.
- Overview, server status, commands, economy, players, tickets, staff, configuration and settings views.
- Searchable 25-command preview catalogue with category filters.
- Discord login preview explaining the future authentication process.
- Visitor, member, staff and owner access-level previews.
- Clearly labelled fictional server, player, activity, economy and backup data.
- Disabled owner and staff controls showing the planned secure workflows.
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
