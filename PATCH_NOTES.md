# Version 1.22.15

## Reliable GitHub Pages deployment

- Added a dedicated GitHub Actions workflow for the static website.
- Increased the Pages deployment polling timeout from the default 10 minutes to 30 minutes.
- Added workflow concurrency protection so multiple Pages deployments do not stack up.
- Added manual workflow dispatch so the website can be redeployed without editing site files.
- Updated the dashboard version and cache-busting references.
- No bot code, Railway database, shop data or Chernarus map assets were changed.

# Version 1.22.14

## Vehicle attachment guidance

- Clarified that blank Event Item Attachments and Cargo fields inherit the live `cfgspawnabletypes.xml` profile.
- Clarified that each line represents an independent attachment/cargo group.
- Documented that duplicate attachment classnames are intentional for multi-slot parts such as wheels and headlights.
- Updated the dashboard cache version and visible release marker.
- Requires Bot v1.18.13 for the corrected Railway merge and backup-recovery behaviour.

# Version 1.22.13

## Command library recovery

- Fixed the dashboard Command Library remaining at `0 command paths`.
- Moved the searchable bot-command catalogue into the independent `command-library.js` runtime.
- The command list now loads even when an unrelated protected dashboard module encounters a runtime or API error.
- Restored filtering and search results for `/rental`, `/adminrental` and every existing command path.
- Added a cache-busted command-library asset and updated the dashboard version marker.
- No bot code, Railway database, shop data or Chernarus map assets were changed.

# Version 1.22.12

## Railway domain and repository migration

- Updated the dashboard and member shop API base URL from the retired Railway domain to `https://world-war-z.up.railway.app`.
- Updated the dashboard Content Security Policy so browser requests may reach the new Railway API.
- Updated canonical URLs, Open Graph metadata, sitemap entries, robots.txt and internal documentation for the renamed `world-war-z-website` repository.
- Updated dashboard and shop cache-busting versions so browsers do not retain the old API address.
- No bot code, database or Chernarus map assets were changed.

# Version 1.22.11

- Added `/rental` and `/adminrental` groups and all six rental command paths to the searchable command library.
- Changed the library label from top-level commands to command paths so grouped subcommands are represented accurately.
- Added a clear partial-source notice when Nitrado's live DayZ ban list is unavailable and Railway displays active bot-managed cases instead.
- Labelled fallback entries as bot-managed DayZ bans rather than implying that the unavailable Nitrado list was read successfully.
- Requires bot version 1.18.10 for restored rental registration, configuration-command sync and dashboard availability fallbacks.
- No Chernarus map, shop, catalogue or member-order files were changed.

# Version 1.22.10

- Made the member-shop checkout map fully interactive with click/tap coordinate selection, drag panning, wheel/button zoom, Reset, Fullscreen and a persistent X/Z marker/readout.
- Required a saved location or complete X, Y and Z coordinates for both normal Items and Event Items because all Discord/website catalogue orders now use automatic in-game delivery.
- Reworded the member shop and order states around automatic Railway preparation and next-restart delivery.
- Replaced the legacy Event Item Admin-approval option with a fixed Automatic Railway delivery notice.
- Replaced the old approval/staging/verification interface with an automatic-delivery monitor.
- Restricted Manual Fulfilment to ticket-created in-game trader orders.
- Made processing and fulfilment notes optional while keeping cancellation and refund reasons required.
- Added automatic-order cancellation/refund controls without exposing manual stage or verify actions.
- Preserved the existing World War Z theme, Chernarus assets, member privacy, role visibility and Railway authorization.
- Requires bot version 1.18.7.
- No website files need to be deleted.

# Version 1.22.9

- Event Zone is now optional in Create/Edit Event Item while Event XML remains required.
- Blank Event Zone fields validate successfully and clearly state that Railway will create the order position without a `<zone>` child.
- Existing saved Event Zones remain editable and continue to be preserved in `cfgeventspawns.xml`.
- Added Local and Global catalogue-scope controls to normal Item creation, matching the familiar administration layout.
- Added up to 15 item-specific Discord role discounts directly inside Create/Edit Item.
- Item-specific and global role discounts do not stack; Railway selects the single greatest eligible saving.
- Added the stored scope to the Owner Items table and moved Hidden beside the normal item details.
- Normal items remain separate from event-only XML and zone controls.
- `cfgEffectArea.json` is not presented as an item or rental control because the World War Z workflow does not modify it.
- Requires bot version 1.18.6 for optional zones and persisted catalogue scope.
- No website files need to be deleted.

# Version 1.22.8

- Corrected the Item and Event Item editor viewport at desktop and laptop resolutions.
- Gave the Item details and Rules columns independent vertical scrolling so one long column no longer leaves a large blank area beneath the other.
- Prevented Event XML and Event Zone editors from being clipped by the modal body.
- Reduced the height and spacing of the required-role selector and purchase-rule cards without changing their behaviour.
- Kept the title bar and sticky Cancel/Create action bar visible while editing long items.
- Removed the background-page scrollbar while a catalogue editor is open.
- Preserved the familiar v1.22.7 field names, Railway-backed validation, member shop, Chernarus map and all existing shop data.
- No bot or Railway deployment change is required.
- No website files need to be deleted.

# Version 1.22.7

- Rebuilt both Owner creation windows around the familiar DayZ++ field names and order while preserving the World War Z theme.
- Normal Item creation now starts with Name, Price, Types and Category, with the actual DayZ classnames entered one per line.
- Event Item creation now starts with Name, Price per restart, Event XML, Event Zone, Category and Event group.
- Added per-item Required roles, all-role matching, Purchase cooldown, shared-limit, Max purchases and Per (seconds) controls.
- Renamed the inactive state to Hidden inside the creation window.
- Moved SKU, sort order, internal instructions, attachments and cargo into Advanced internal details.
- SKU and a basic player-facing description are generated automatically when left blank.
- Preserved Event XML validation, Event Zone validation, the 30,000 restart cap and the separate member-facing shop page.
- Requires bot version 1.18.5 for DayZ types, per-item role access and purchase-window enforcement.
- No website files need to be deleted.

# Version 1.22.6

- Added a dedicated `shop.html` member-facing Survivor Shop separate from Owner administration.
- Added member catalogue tabs for Items and Event Items, search, category filters, wallet status and private order history.
- Added protected purchase confirmation with saved locations or exact Chernarus X/Y/Z/rotation selection for event deliveries.
- Added role-discount pricing that shows the original price, effective price and qualifying discount returned by Railway.
- Added member access states for shop disabled, missing required role, unlinked PlayStation account and purchase-ready accounts.
- Reorganised the dashboard Shop navigation into Owner-only Items, Event Items and Configuration workspaces plus separate member links.
- Added Owner configuration cards for core shop state, member-shop website access, required Discord role, global restart limits and role discounts.
- Added standalone Owner item and event-item administration tables while preserving the existing create/edit windows and Event XML/Zone editors.
- Added homepage, footer and sitemap links to the member shop.
- Preserved the v1.22.4 Chernarus map, all existing catalogue data, delivery workflows, moderation tools and permission gating.
- Requires bot v1.18.4 before enabling required-role access or discounts.
- No website files need to be deleted.

# Version 1.22.5

- Added full Event XML and Event Zone editors to the existing compact Create/Edit Event Item window.
- Added Format, Minify, Copy and Clear tools for both XML snippets.
- Added live character counts, validation states and detected child-classname feedback.
- Added browser-side validation matching Railway for required event elements, numeric values, flags, fixed positioning, event limits, one child classname and zone bounds.
- Preserved the current World War Z dark-red theme, sticky action bar and responsive desktop, tablet and mobile modal layout.
- Existing event items open with their saved templates; legacy profiles receive generated templates without destructive migration.
- Event XML and Event Zone values are now sent to Railway and are not cosmetic-only fields.
- The Chernarus map, map tiles, public map controls and coordinate checkout remain unchanged from v1.22.4.
- No website files need to be deleted.

# Version 1.22.4

- Fixed roads, field boundaries and terrain features shifting at source-tile joins.
- Confirmed every adjacent source pair shares an exact 32-pixel border: 992 horizontal pairs and 992 vertical pairs.
- Identified the converted 512 × 512 source tiles as 480 × 480 unique map pixels surrounded by a 16-pixel gutter on every edge.
- Rebuilt all zoom levels after cropping the 16-pixel gutters before any stitching or downsampling.
- Corrected the native browser map from 16,384 pixels to 15,360 pixels, providing a direct one-pixel-to-one-DayZ-metre X/Z mapping.
- Rebuilt the event-item coordinate overview from the corrected map output.
- Added map-asset cache versioning so GitHub Pages and browsers request the corrected tile files immediately.
- Reduced map asset size while retaining the full zoom 0–5 pyramid and all 1,365 browser tiles.
- No bot, Railway API, permission or database change is required.
- No website files need to be deleted.

# Version 1.22.3

- Validated all 1,024 uploaded Chernarus satellite PNG tiles as a complete 32 × 32 grid of 512 × 512 RGBA images.
- Confirmed there are no missing coordinates, extra coordinates or duplicate file hashes.
- Confirmed the correct north-up layout: the first filename number is the column, the second is the row, and no horizontal or vertical flip is required.
- Generated a locally hosted 512 px WebP tile pyramid from zoom 0 through zoom 5, containing 1,365 browser tiles plus a 4,096 px overview image.
- Added a high-detail responsive satellite map with smooth wheel, pointer, touch, pinch and keyboard navigation.
- Added Zoom In, Zoom Out, Reset and Fullscreen map controls.
- Added accurate DayZ X/Z selection, a visible pointer and selected-coordinate readout, and a Copy button.
- Restored searchable and filterable public POI markers without exposing private bases, live players or operational locations.
- Updated the event-item checkout coordinate selector to use the uploaded satellite imagery rather than the legacy vector preview.
- Added Bohemia Interactive attribution and documented the tile validation, orientation and output structure.
- No bot, Railway API, permission or database change is required.
- No website files need to be deleted.

# Version 1.22.2

- Reworked the Create Item and Create Event Item dialogs into compact application windows based on the supplied reference screens.
- Added simple Item and Event Item title bars with operation-specific subtitles.
- Reduced oversized headings and nested-card visual weight while preserving the dark red World War Z theme.
- Added a stronger dimmed backdrop, internal scrolling and a sticky action footer.
- Moved Cancel and Create/Save actions to a compact left-aligned footer and updated the submit label for create versus edit operations.
- Improved desktop, tablet and mobile modal sizing without changing shop data, Railway APIs or permissions.
- No website files need to be deleted.
- No bot or Railway deployment change is required.

# Version 1.22.1

- Finished the World War Z themed Create Item and Create Event Item workspaces inspired by the supplied DayZ++ reference screens.
- Added responsive main/rules panels, quick price and category chips, inline editing and event restart controls capped at 30,000.
- Fixed saved-location X, Y, Z and rotation inputs overlapping at desktop and narrower widths.
- Added Owner-only Discord log channel configuration with search, connect, update, test and disconnect actions.
- Added compact and mobile layouts for the new shop, location and logging controls.
- Restored the missing `.nojekyll` marker so GitHub Pages publishes the static dashboard exactly as packaged.
- Requires bot version 1.18.2 before using the Discord log configuration page.
- No website files need to be deleted.

# Version 1.22.0

- Split trader catalogue into Items and Event Items.
- Added click-to-coordinate checkout using the local Chernarus vector map.
- Replaced the public interactive map with a Coming Soon workspace.
- Added rich Discord/social link preview metadata and a 1200×630 preview asset.
- Added owner search/filter tables and 30,000 restart limits.

# World War Z Bot Website Patch Notes

## Version 1.21.0 — Trader Delivery and DayZ Control Centre

**Release date:** 5 August 2026

### Git commit message

```text
Add trader delivery and server control
```

### Member account and delivery locations

- Added real Discord profile avatars with safe initials fallback.
- Added an Account Centre card with direct wallet, order, location and appeal links.
- Added private named Chernarus X, Y, Z and rotation locations for future orders.
- Event-item checkout accepts a saved location or new exact coordinates and can save the new point.

### Event items and delivery operations

- Added separate Event Items catalogue management for vehicles, containers and restart-bound orders.
- Added Owner profile fields for child classname, lifetime, event flags, attachments and cargo.
- Added an Admin event-delivery queue with approval, XML preview, stopped-server staging, Nitrado start, verification and rollback actions.
- Preserved the existing manual fulfilment queue for normal trader orders.

### DayZ server configuration

- Added an Owner service overview, live mission-file editor, validation and exact diff output.
- Added live Central Economy event, child, population, position and zone summaries.
- Added an empty `.nojekyll` marker so GitHub Pages deploys the custom static application directly.

### Deployment

- Deploy bot version 1.18.0 before this website version.
- Upload the version 1.21.0 website patch and use Ctrl+F5 after GitHub Pages publishes.
- No existing website file needs to be deleted.


## Version 1.20.0 — Command Centre Layout Overhaul

- Rebuilt the dashboard sidebar into collapsible, task-focused workspaces.
- Added direct Shop catalogue, order, fulfilment and configuration navigation.
- Added a persistent service context card and active workspace label.
- Added Ctrl+K and `/` global dashboard search with permission-aware results.
- Improved table density, settings cards, filters, buttons and responsive behaviour.
- Preserved all existing authentication, moderation, appeals, webhook and shop functions.
- No API, database or Railway configuration change is required.

## Version 1.19.0 — Economy-Linked Survivor Shop

**Release date:** 5 August 2026

### Git commit message

```text
Add economy-linked survivor shop
```

### Member shop

- Added direct sidebar access to the Survivor Shop and My Shop Orders.
- Added a searchable and category-filtered public catalogue.
- Signed-in linked members see their current wallet, per-player limits and recent order history.
- Purchases use a confirmation dialog, quantity controls, delivery notes and unique idempotency keys.
- Added clear guest, unlinked, loading, closed, unavailable and empty states.
- Order tracking shows pending, processing, fulfilled, cancelled and refunded states plus staff updates.

### Admin fulfilment

- Added a direct Shop Fulfilment sidebar destination for current Admins and the Owner.
- Added open/all/status filters, queue summaries and required-note action dialogs.
- Admins can begin processing, fulfil, cancel or refund supported orders.
- Successful actions refresh the queue, member shop state and managed notification routes.

### Owner catalogue controls

- Added an Owner-only Shop Catalogue destination.
- Owners can enable or pause purchases and edit the public title, description and purchase instructions.
- Added item creation and editing for SKU, category, price, finite/unlimited stock, per-order and per-player limits, sort order and active state.
- Internal fulfilment instructions are not returned through public or member catalogue responses.

### Policy and command updates

- Updated Terms, Privacy and Community Guidelines for virtual shop orders, manual in-game fulfilment, order records, refunds and abuse prevention.
- Expanded the searchable command library from 83 to 87 commands with `/shop`, `/buy`, `/orders` and `/order`.

### Deployment

- Deploy bot version 1.17.0 before this website version.
- Upload the version 1.19.0 website patch.
- Wait for GitHub Pages to publish, then use Ctrl+F5.
- No website files need to be deleted.

## Version 1.18.0 — Member Appeals and Complete Command Access

**Release date:** 5 August 2026

### Git commit message

```text
Add member appeals and command library
```

### Member appeals

- Added a protected My Appeals area for linked members.
- Members can view only their own eligible moderation cases and appeal history.
- Added bounded appeal statements, up to five evidence references, deadlines, cooldowns and duplicate protection.
- Added optional editing before assignment and safe withdrawal before a decision.
- Added optional case-linked Discord appeal tickets while Railway remains the authoritative case record.
- Added clear upheld, reduced and overturned outcome states without exposing staff-only notes or evidence.

### Owner configuration

- Added Owner controls for appeal availability, deadline, ticket creation, ticket category, ticket support role, editing policy and member instructions.
- Discord category and role selections use opaque keys; raw Discord IDs are not placed in the browser.
- Appeal writes remain behind the existing Railway protected-action switch and live Discord verification.

### Command access

- Expanded the searchable command library from 30 to 83 top-level commands.
- Added the new direct `/appeal` and `/support` commands plus direct member and Admin shortcuts.
- Retained advanced groups where a grouped workflow remains clearer.
- All direct shortcuts remain server-only and the complete command total stays below Discord's 100-command limit.

### Deployment

- Deploy bot version 1.16.0 before this website version.
- Upload the version 1.18.0 website patch.
- Wait for GitHub Pages to publish, then use Ctrl+F5.
- No website files need to be deleted.

## Version 1.17.0 — Moderation Operations and Webhooks

**Release date:** 4 August 2026

### Git commit message

```text
Add moderation queue and webhooks
```

### Added

- Dedicated Moderation Queue navigation with assignments, priorities and review deadlines.
- Queue counters for active appeals, reviews, expiring bans, overdue work and cases assigned to the signed-in Admin.
- Operational Failures navigation with safe retry controls for automatic-unban and notification-delivery failures.
- Owner-only Notifications & Webhooks navigation.
- Managed Discord webhook creation from allowlisted current text channels.
- Test and remove controls for each managed destination.
- Per-event notification routing for ten moderation and operational event categories.
- Permanent recent webhook-configuration audit showing accepted and rejected actions.
- Sidebar badges for unresolved queue work and service failures.

### Security and privacy

- The website never asks for or displays a Discord webhook URL or token.
- Discord member, channel and webhook IDs remain server-side and are represented with opaque browser keys where selection is required.
- Every queue, retry and webhook request repeats live Discord role verification on Railway.
- Webhook changes are Owner-only and remain behind the existing Railway write-action safety switch.
- Dynamic moderation and webhook content continues to use text rendering rather than `innerHTML`.

### Deployment

- Deploy bot version 1.15.0 before this website version.
- Upload the version 1.17.0 website patch.
- Wait for GitHub Pages to publish, then use Ctrl+F5.
- No website files need to be deleted.

## Version 1.16.0 — Direct-Access Dashboard Navigation

### Added

- Rebuilt the dashboard sidebar around direct links to individual tools and data areas.
- Added dedicated navigation entries for overview actions, activity, server health, map locations, wallet, ledger, profile activity, moderation cases, current ban lists, player administration, server controls, server audit, configuration workflow, backup history, Discord connection, access levels and help.
- Added section-aware URLs such as `#staff/cases` and `#economy/ledger` so browser Back/Forward and copied links return to the correct dashboard area.
- Added section-specific active states and breadcrumbs.

### Improved

- Admin tools no longer require scrolling through the entire Administration Centre to reach a specific function.
- The sidebar is wider, clearer and independently scrollable on desktop and mobile.
- Discord sign-in now remembers the exact dashboard section rather than only the broad page.
- Existing quick-action buttons can route directly to the relevant subsection.

### Safety

- Website-only navigation update.
- No API route, bot permission, moderation action or Railway database behaviour changed.
- Existing Admin and Owner navigation remains hidden until Railway verifies the required access level.

### Deployment

- Upload the version 1.16.0 website patch.
- No bot update, database migration or Railway setting change is required.
- Hard refresh after GitHub Pages publishes.


## Version 1.15.1 — Moderation Case Dialog Hotfix

### Fixed

- Fixed the moderation case dialog failing with `handleProtectedAuthFailure is not defined`.
- Restored the existing protected-session and Admin authorization handler for case-detail reads and case actions.
- Rejected case actions continue to show their real Railway response without incorrectly removing valid Admin access.

### Deployment

- Website-only update.
- No bot update, database migration or Railway setting change is required.
- Upload the version 1.15.1 patch and hard refresh after GitHub Pages publishes.


## Version 1.15.0 — Moderation Evidence, Reviews and Appeals

### Added

- Added protected case-detail views for every numbered moderation case.
- Added evidence links or references, summaries, editing and audited removal.
- Added staff reviews and manually recorded player appeals.
- Added upheld, reduced and overturned review decisions.
- Added real warning removal, Discord unban and Nitrado DayZ unban for supported overturned active cases.
- Added Under Review and Appealed case summary counts.

### Safety

- Regular Admins cannot decide reviews of actions they originally issued.
- Owner overrides are explicitly recorded.
- Evidence accepts safe HTTP(S) links or plain-text references only; large media is not uploaded.
- Original cases and previous evidence versions remain preserved.
- Railway remains the authorization boundary for every read and write.

### Deployment

- Deploy bot version 1.14.0 before this website update.
- No database reset, replacement or manual migration is required.
- Replace the website files with the version 1.15.0 patch and hard refresh after GitHub Pages publishes.


## Version 1.14.2 — Policy Suite and Version-Only Releases

### Added

- Added `legal.html` as the central Legal & Policies hub.
- Added community Terms of Service.
- Added Community Guidelines covering safety, fair play, account misuse, scams,
  evidence and ban evasion.
- Added a Moderation & Appeals Policy covering numbered cases, evidence, temporary
  and permanent bans, automatic expiry, review outcomes and technical errors.
- Expanded the Privacy Policy with browser storage, service providers, cross-border
  processing, retention, access/correction/deletion requests and younger-user guidance.
- Added legal and policy links across the public website and dashboard.

### Changed

- Public release, roadmap and interface wording now uses version numbers instead of
  development phase labels.
- Strengthened independent-project, third-party platform and virtual-economy notices.
- Preserved all version 1.14.1 current-ban-list functionality.

### Deployment

- Website-only update.
- No Railway variable, bot update or database migration is required.
- Replace the website files with the version 1.14.2 patch and hard refresh after
  GitHub Pages publishes.


## Version 1.14.1 — Current Ban Lists

### Added

- Added an Admin-only current Discord ban list and current Nitrado DayZ ban list.
- Shows linked PlayStation IDs, numbered cases, reasons, issuing Admins and scheduled expiries where available.
- Keeps external or legacy bans visible even when they do not have a dashboard case.
- Added safe Open player shortcuts that reuse the existing protected player administration view.
- Both lists refresh after ban or unban actions and can be refreshed manually.

### Safety

- Railway rechecks current Admin/Owner access before every ban-list request.
- Raw Discord IDs, moderator IDs, credentials and unfiltered Nitrado responses are never returned to GitHub Pages.
- A Discord or Nitrado outage affects only that source; the other current ban list can still be displayed.

## Version 1.14.0 — Moderation Cases and Temporary Bans

### Added

- Added an Admin-only active moderation-case queue with case numbers, player, action, reason, issuing Admin, creation time and expiry.
- Added summary counts for active cases, temporary bans and bans expiring within 24 hours.
- Added permanent, preset and custom expiry options to Discord and DayZ ban confirmations.
- Added case references, related-case information, automatic actions and expiry state to protected player history.
- Added clear permanent, scheduled, expired and unavailable states without exposing raw Discord or database IDs.

### Safety

- Railway remains the authorization and validation boundary for every case and ban request.
- Custom expiries must be at least five minutes in the future and no more than 365 days.
- The selected PlayStation ID is sent internally; Admins still enter a required reason and explicitly confirm the action.
- Failed automatic unbans remain active on Railway and are retried rather than being displayed as completed.

## Version 1.13.0 — Command Centre UI Overhaul

### Redesigned

- Rebuilt the dashboard visual system with a cinematic Chernarus-inspired background, layered control-centre panels and clearer status hierarchy.
- Replaced the temporary W/Z text mark with a dedicated locally hosted World War Z logo across the dashboard, public website and supporting pages.
- Redesigned the dashboard top bar, navigation, view headers, cards, Admin controls, dialogs, mobile layouts and public landing page.
- Added local favicon, application icon and responsive background assets.
- Preserved every existing version 1.12 data attribute, API workflow and protected action.

### Repository cleanup

- Removed the obsolete `DELETE_THESE_FILES.txt` instruction file from the complete backup. Patch deployments should delete the existing repository copy manually because ZIP uploads cannot remove files.
- The three retired raster map files remain excluded.
- No runtime database, credential or Railway volume file is included.

## Version 1.12.1 — Player Action Confirmation Hotfix

### Fixed

- Action-level `403` responses no longer remove verified Admin access, hide Admin Tools or redirect to Overview.
- Rejected actions now keep the confirmation dialog open and show the real Railway reason, such as self-target, Owner-only, role-hierarchy or bot-permission protection.
- Genuine expired sessions and confirmed loss of Admin access still sign out or downgrade the dashboard correctly.

### Improved

- Admins no longer need to type the selected PlayStation ID for every player action.
- The confirmation dialog now displays the selected PlayStation ID and requires only the reason plus the confirmation button.
- Railway continues to validate the selected target and permanently audit accepted and rejected actions.

## Version 1.12.0 — Controlled Player Administration

### Added

- Added private Admin note creation and audited updates.
- Added active warning creation, audited reason editing and removal.
- Added verified economy balance add, remove and set controls.
- Added Discord kick, permanent ban and unban controls.
- Added real Nitrado DayZ ban and unban controls for PlayStation IDs.
- Added Owner-only account unlinking after Railway creates a recovery snapshot.
- Added editable private notes, editable/removable active warnings, DayZ ban
  history and permanent dashboard action history to each protected player
  record.

### Confirmation and safety

- Every action requires a staff reason and the exact selected PlayStation ID.
- Railway repeats Discord Admin/Owner authorization and target protection after
  confirmation.
- Self, Owner and unauthorized staff targets are blocked.
- Discord role hierarchy and bot permissions are verified server-side.
- Simultaneous player write requests are rejected by a server-side lock.
- Accepted and rejected actions are permanently audited.

### Not included

- No fake DayZ kick control is shown because no supported console operation was
  available.
- Temporary-ban expiry, evidence uploads, appeals, bulk actions and account
  deletion remain future versions.

## Version 1.11.0 — Secure Read-Only Player Administration

### Added

- Added Admin-only player search by partial PlayStation ID or Discord display
  name.
- Requires at least three characters, caps results at 15 and never offers a
  database-wide player listing.
- Added protected player details for allowlisted identity, activity, playtime,
  sessions, PvP summary, warning count and the latest 10 sanitized moderation
  records.
- Added clear loading, no-results, unlinked, unavailable and expired-session
  states.

### Security

- Railway repeats current Discord membership and Admin/Owner authorization for
  every search and details request.
- Raw Discord IDs, database IDs, private notes, DayZ UIDs, positions, moderator
  identities, evidence metadata and credentials are excluded.
- Dynamic player and moderation values are rendered as text rather than
  injected HTML.
- version 1.11 is read-only. Warning, note, ban, kick, balance, unlink and delete
  controls remain unavailable.

## Version 1.10.0 — Live Server Operations

### Added

- Added a public operational-health panel with Railway bot uptime, Discord
  gateway health, sanitized Nitrado state and last successful update.
- Shows the next scheduled restart only when Railway can provide a reliable
  value; it is never guessed.
- Added protected recent Start, Stop and Restart history in Admin Tools.
- Added loading, empty, unavailable, expired-session and manual-refresh states.

### Security

- Members cannot see the Admin history panel or receive its API data.
- Railway performs a fresh Discord role check for every history request.
- Discord IDs, request IDs, raw Nitrado messages and credentials are excluded.
- History is rendered as text, not injected HTML.

## Version 1.9.0 — Complete Protected Server Controls

### Added

- Connected **Start server** and **Stop server** beside Restart for verified
  Admins and the Owner.
- Reused one clear Yes/Cancel confirmation window for all three actions.
- Added action-specific warnings, optional reasons and accepted audit messages.
- Added delayed live-status refreshes after every accepted action.

### State-aware controls

- Start is enabled only while the server is offline.
- Stop and Restart are enabled only while the server is online.
- Every control is locked while the server is changing state, the API is
  unavailable, a request is running or Railway's cooldown is active.

### Security

- Railway rechecks the current Discord member, Admin/Owner access and Nitrado
  server state after confirmation.
- The browser sends the matching internal confirmation only after **Yes** is
  selected.
- Nitrado, Discord bot and OAuth credentials remain only on Railway.
- Backend authorization and audit logging remain the real security boundary.

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
  server-changing controls remain locked for later versions.

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
- Discord authentication and all protected account, Admin and owner features remain locked for future versions.

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
