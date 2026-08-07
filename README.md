# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-website/`

## Uploading and deploying the website

Because the corrected Chernarus pyramid contains 4,810 JPG tiles, deploy this patch from a local clone rather than trying to upload the complete map through GitHub's browser uploader.

1. Pull or clone the existing `world-war-z-website` repository.
2. Apply the files from this v1.22.27 patch over the repository.
3. From the repository root, run `powershell -ExecutionPolicy Bypass -File .\scripts\install_chernarus_map_assets.ps1`.
4. Confirm `py .\scripts\validate_site.py --require-map-assets` passes.
5. Commit with: `Replace Chernarus map renderer`
6. Push the commit, including the corrected JPG tiles. The final road GeoJSON is already bundled in this patch.
7. Keep **Settings → Pages → Source** set to **GitHub Actions**.
8. The included Pages workflow validates the map assets and JavaScript before publishing.

Do not select **Deploy from a branch** while the included Pages workflow is being used. The workflow intentionally fails before deployment if the production map assets are missing or retired map files remain.

## Files

- `index.html` — website content and structure
- `assets/css/pages/home.css` — public homepage design and mobile layout
- `assets/js/pages/home.js` — homepage navigation, header and scroll effects
- `dashboard.html` — live status, personal profile and economy dashboard
- `assets/css/dashboard/` — ordered core, moderation, workspace and catalogue dashboard style bundles
- `assets/js/dashboard/` — ordered shell, shared control, administration, account, shop and delivery dashboard runtimes
- `legal.html` — legal and policy document hub
- `terms.html` — community Terms of Service
- `privacy.html` — privacy, storage, service-provider and data-request information
- `community-guidelines.html` — acceptable conduct and safety rules
- `moderation-policy.html` — cases, evidence, bans, expiry and appeal practices
- `changelog.html` — browser-readable website release history
- `assets/css/pages/policies.css` — shared legal, privacy and changelog page design
- `404.html` — custom missing-page screen
- `site.webmanifest` — website metadata
- `.nojekyll` — forces GitHub Pages to publish the static site without Jekyll processing
- `assets/world-war-z-banner.webp` — social sharing banner
- `assets/world-war-z-logo.webp` — refined local header and interface logo
- `assets/world-war-z-icon.png` and `assets/favicon.png` — local application icons
- `assets/world-war-z-dashboard-bg.webp` — desktop command-centre atmosphere
- `assets/world-war-z-dashboard-bg-mobile.webp` — mobile command-centre atmosphere
- `assets/chernarus-map/satellite-corrected/` — corrected local JPG Chernarus satellite pyramid, native zooms 0–6
- `assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson` — final grouped WRP-derived production road geometry
- `assets/data/chernarus/pois.json` — public read-only map locations and tile configuration
- `assets/js/map/chernarus-map.js` — shared Leaflet satellite/road renderer and native DayZ coordinate tools
- `assets/css/components/chernarus-map.css` — shared full-map and compact-picker presentation
- `assets/js/pages/dashboard-map-loader.js` — lazy map workspace loader
- `assets/js/core/http.js` — shared timeout-aware browser request helper
- `scripts/validate_site.py` — static/reference/map-data validation used by GitHub Actions
- `scripts/install_chernarus_map_assets.ps1` — copies the approved local corrected satellite pyramid into the repository, preserves the bundled production road GeoJSON and removes retired map files
- `PATCH_NOTES.md` — version history and update notes
- `WEBHOOK_SETUP.md` — optional GitHub push notifications, separate from the dashboard-managed moderation webhooks
- `CHERNARUS_MAP_PLAN.md` — implemented satellite map architecture and operating notes
- `CHERNARUS_MAP_VALIDATION.md` — tile completeness, orientation and output validation
- `MAP_ATTRIBUTION.md` — ChernarusPlus source, licence and modification notice





## Version 1.22.27 Unified Production Chernarus Map

The website now uses one shared Leaflet-based Chernarus renderer for the main interactive map, dashboard shop checkout, standalone Survivor Shop checkout and Saved Delivery Locations. It uses the corrected local JPG satellite pyramid, the final grouped WRP-derived production road overlay, the proven 15,360 m → 240 Leaflet coordinate conversion, one-decimal DayZ X/Z selection and the approved 180% road-width profile.

Before deployment, run `scripts/install_chernarus_map_assets.ps1` from a local clone. The final `chernarus-roads-overlay-final.geojson` is bundled in this patch; the installer copies only the completed `satellite-corrected` pyramid from the approved local map project, removes the retired WebP/vector map assets and runs strict validation. GitHub Pages also enforces those production assets before publishing.

Pairs with Bot v1.18.26. No Railway API, database, Normal Item delivery, Event Item rental, moderation, authentication or permission behaviour changed.

## Version 1.22.26 Road Overlay Foundation

The Chernarus map engine now supports an optional independent road overlay without altering the existing satellite tiles. The dashboard interactive map can render a second transparent tile pyramid, while the member and dashboard shop coordinate pickers can render a matching transparent overview image. Road-layer controls stay hidden while the overlay is disabled, so the production map remains visually unchanged until a clean high-resolution road source is generated and validated.

The future overlay assets belong under `assets/chernarus-map/overlays/roads/`. Enabling the source is configuration-only through `assets/data/chernarus/pois.json`.

Pairs with Bot v1.18.26. No Railway API, database, Normal Item delivery, Event Item rental, moderation or authentication behaviour changed.

## Version 1.22.25 Preserve Restart-Bound Rentals

Normal Items keep the new temporary Central Economy delivery path introduced in v1.22.24 / Bot v1.18.25, but Event Item rentals are restored to the established restart-bound model. Buyers again select the number of restarts, pricing is per restart, Owner global/profile restart limits are available, and remaining restarts are shown throughout member and Admin views. Bot v1.18.26 preserves existing rental data and only removes the legacy `dpp_shop.json` path from Normal Item delivery.

## Version 1.22.24 unified next-restart shop delivery

Historical v1.22.24 temporarily simplified Event Item rentals to one next-restart delivery. Version 1.22.25 restores the original restart-duration rental workflow while retaining the new Central Economy path for Normal Items.

## Version 1.22.23 Live Nitrado Ban Synchronisation

- Recognises Bot v1.18.24's `nitrado_settings` source as the normal live Nitrado state.
- Keeps the Current Ban Lists page marked **Nitrado Live** when the bot is reading Nitrado's web-interface `general.bans` setting.
- Displays live-setting entries as **Nitrado Live Ban List** instead of incorrectly falling through to an offline/unknown source state.
- Preserves the existing 75-second manual refresh window and exact Nitrado ban order.
- No public URL, OAuth, permission or database schema change is required.


## Version 1.22.22 Reliable Live Ban-List Refresh

- Allows the Current Ban Lists workspace enough time to complete Nitrado console file fallback instead of discarding the combined response at the generic 10-second HTTP timeout.
- Shows a clear live-refresh state while Discord and Nitrado are being checked.
- Pairs with World War Z Discord Bot v1.18.23.

## Version 1.22.21 Live Ban-List Synchronisation And Discord Sign-In Polish

- Requests a fresh Nitrado DayZ ban list on every Admin refresh and displays it in the exact order stored by Nitrado.
- Removes the redundant Authoritative Nitrado Source card from the DayZ ban-list panel.
- Removes the duplicate Discord icon from the top-right sign-in control.
- Uses a single Discord mark in the OAuth dialog and Continue button.
- Pairs with World War Z Discord Bot v1.18.22.

## Version 1.22.20 Professional Navigation And Ban-List Polish

- Replaces sidebar abbreviations with semantic SVG icons and Discord service branding.
- Standardises title casing across dashboard navigation, headings, actions and the member shop.
- Adds Discord-logo fallbacks anywhere a Discord avatar is not yet available.
- Improves the visual hierarchy of Current Ban Lists and pairs with Bot v1.18.20 for stronger Nitrado fallback discovery.

## Version 1.22.19 professional ban-list controls and headings

- The Admin DayZ ban-list panel now identifies whether the authoritative list came from Nitrado Player Management, Nitrado `ban.txt`, the last confirmed Nitrado snapshot or an unavailable source.
- Removed the old behaviour that could visually imply local bot-managed cases were the current live Nitrado list.
- Added the new `/banlist` and `/purge banlist last-login` paths to the searchable Command Library.
- Updated the command library for the 93-command bot tree and the direct `/purge messages` path.
- Standardised public and dashboard H1–H6 headings to capitalise the beginning of every word and removed unnecessary trailing full stops.
- Added a stronger Nitrado status presentation while retaining the existing dark red World War Z visual system.
- Refreshed browser cache markers to v1.22.20.
- Pairs with World War Z Discord Bot v1.18.19.

Commit message:

```text
Polish ban list and headings
```


## Version 1.22.18 dashboard split and transfer reduction

- Splits the large dashboard JavaScript runtime into six ordered feature files.
- Splits the large dashboard stylesheet into four ordered responsibility bundles.
- Preserves the original script execution order and CSS cascade.
- Replaces the 3.0 MB homepage banner PNG with a roughly 206 KB WebP asset.
- Updates static validation for the new module paths and refreshes cache markers.
- Keeps all public URLs, Railway API routes, Discord permissions and database behaviour unchanged.
- Pairs with World War Z Discord Bot v1.18.16.

Commit message:

```text
Split dashboard modules
```

## Version 1.22.16 roadmap and deployment maintenance

This version publishes the complete current roadmap, separates completed features
from the paired maintenance release, live verification, multi-server work and later
possibilities, and keeps the homepage, dashboard, member shop, privacy copy and
release history synchronized. It also updates the Pages workflow to current action
releases and returns the deploy timeout to GitHub Pages' supported 10-minute limit.

Commit message:

```text
Publish roadmap and maintenance
```

## Version 1.22.15 reliable Pages deployment

This version adds `.github/workflows/pages.yml`, which deploys the static site
through the official GitHub Pages actions with a 30-minute deployment timeout
and a single Pages concurrency group.

After committing this patch, set **Settings → Pages → Source** to
**GitHub Actions**, then run **Deploy World War Z Website** from the Actions tab.

Commit message:

```text
Add reliable Pages deployment
```

## Version 1.22.14 vehicle attachment guidance

The Event Item editor now explains that blank Attachments/Cargo fields preserve
the live `cfgspawnabletypes.xml` profile. Every supplied line becomes an
independent slot, and duplicate classnames are supported for vehicles that need
multiple identical parts. Bot v1.18.13 provides the matching Railway behaviour.

## Version 1.22.13 command library recovery

The dashboard Command Library is now loaded by an isolated script, so its
command count, category filters and search results remain available even if an
unrelated protected dashboard module fails. Rental and Admin rental command
paths remain included.

Commit message:

```text
Fix dashboard command library
```

## Version 1.22.12 Railway and repository migration

The website now connects to `https://world-war-z.up.railway.app` and uses the renamed GitHub Pages path at `world-war-z-website`.

## Version 1.22.11 rental commands and status recovery

The searchable dashboard library now includes the `/rental` and `/adminrental`
command groups together with their list, buy, purchased and cancel paths. The
Admin ban-list view also identifies when Railway is showing only active
bot-managed DayZ bans because Nitrado's live list endpoint is unavailable. This
website patch pairs with bot version 1.18.10 and does not alter the member shop,
Chernarus map or existing order data.

## Version 1.22.10 automatic shop delivery

The dedicated member shop now treats both normal Items and Event Items as
automatic coordinate deliveries. Checkout uses an interactive Chernarus map with
pan, zoom, reset, fullscreen, marker and accurate X/Z selection. The Admin
dashboard now monitors Railway automation instead of offering approval, staging
or verification buttons. Manual fulfilment is reserved for ticket-created
in-game trader orders, with optional processing notes and required cancellation
or refund reasons. Bot version 1.18.7 prepares and verifies the mission files
immediately after purchase so the next scheduled restart loads the order.

## Version 1.22.9 optional event zones and item scope

Event XML remains required for restart-bound rentals, but Event Zone is now optional.
Leaving the zone blank still creates the unique `events.xml` rental and the buyer's
`cfgeventspawns.xml` position; only the optional `<zone>` element is omitted. Normal
Item creation now includes familiar Local and Global scope controls and up to 15
item-specific Discord role discounts, while all event-only XML controls stay out
of the normal item form. Global and item-specific discounts never stack; Railway
selects the greatest eligible saving. Bot version 1.18.6 is required.

## Version 1.22.8 catalogue editor layout correction

The Owner Item and Event Item windows now use the available screen height more
efficiently. Item details and purchase rules scroll independently on wide screens,
so long role and rule lists no longer force a large empty section beneath Event XML.
The XML and zone editors remain fully accessible, the action bar stays visible, and
the modal switches back to one natural scrolling column on tablets and mobile. No
bot update or Railway database change is required.

## Version 1.22.7 familiar creation fields

The Owner Item and Event Item windows now use the field names and order familiar
from DayZ++ while retaining the World War Z dark-red interface. Normal items use
Name, Price, Types and Category, where Types contains the actual DayZ classnames.
Event items use Name, Price per restart, Event XML, Event Zone, Category and Event
group. Required roles and purchase-window controls are stored and enforced by
Railway through bot version 1.18.5. Internal SKU and fulfilment fields remain
available in a collapsed advanced section.

## Version 1.22.6 separated member and Owner shop

Members now use the dedicated `shop.html` Survivor Shop for catalogue browsing,
role-adjusted prices, protected purchases, saved delivery coordinates and private
order history. The dashboard Shop group is now an administration workspace: Owners
manage normal items, restart-bound event items, access requirements, global restart
limits and role discounts without mixing those controls into the member experience.
Railway remains authoritative for identity, roles, balances, stock, limits, discounts
and all writes. Bot version 1.18.4 is required for the new access and discount settings.

## Version 1.22.5 Event XML and zone editors

The compact Owner Event Item window now includes full code-style Event XML and
Event Zone editors. Both fields provide format, minify, copy and clear tools,
live validity feedback and responsive layouts. Railway remains authoritative:
it validates and stores the snippets, replaces the template event name with the
unique order identifier and injects the approved delivery coordinates during
staging. Existing event items remain compatible.

## Version 1.22.4 Chernarus alignment correction

The source PNGs contain 32 pixels of duplicated imagery between neighbouring files. Version 1.22.4 crops the 16-pixel perimeter gutter from every source tile before generating the browser pyramid. Roads, coastlines, field boundaries and terrain now continue correctly across tile joins, and the corrected 15,360-pixel map maps directly to Chernarus X/Z metres.


## Version 1.22.3 Chernarus satellite map

The public dashboard now uses the complete user-supplied 32 × 32 Chernarus satellite grid. A 1,365-file WebP tile pyramid supplies sharp local zoom levels without contacting DayZ++, iZurvive or another map service. The map supports mouse, touch, pinch, keyboard, fullscreen and accurate X/Z selection, while ordinary member and Admin visibility rules remain unchanged.


## Version 1.22.2 compact catalogue windows

The Owner Create Item and Create Event Item editors now use compact title-bar windows inspired by the supplied references while retaining the World War Z theme. The dialogs have internal scrolling, sticky actions and responsive sizing, with no API or database change.


## Version 1.22.1 shop workspace and Discord logs

The Owner catalogue editors now use the supplied split Create Item / Rules layout while retaining the World War Z visual theme. Saved coordinate fields no longer overlap, and the dashboard includes a protected Discord Logs page for routing the bot's eight existing audit categories.

## Version 1.22.0 trader workspace and coordinate checkout

- Separate regular Items and Event Items catalogue workspaces.
- Event-item prices are charged per purchased server restart, capped at 30,000.
- Click/tap Chernarus coordinate selection automatically fills X and Z.
- The original v1.22.0 public-map placeholder was later replaced by the complete high-detail local Chernarus satellite map.
- Rich Open Graph and Twitter metadata supplies a branded Discord link preview.
- `.nojekyll` explicitly publishes the project as a static GitHub Pages site.

## Version 1.21.0 trader delivery and DayZ control centre

The dashboard now supports real player-entered Chernarus coordinates, private
named saved delivery locations, restart-bound vehicle and container orders, an
Admin deployment queue and an Owner mission-file workspace. Event checkout can
select a saved location or enter X, Y, Z and rotation directly.

The Owner catalogue editor can mark an item as a manual trader order or an event
spawn and define its Central Economy profile. Staff can approve the paid order,
preview exact changes to `events.xml`, `cfgeventspawns.xml` and
`cfgspawnabletypes.xml`, stage backed-up files, start the stopped Nitrado server, verify
the result in game and retire the temporary event. The account centre now uses
the member's Discord avatar where available.

## Version 1.20.0 command centre layout overhaul

Version 1.20.0 reorganises the full dashboard around collapsible workspaces, direct navigation and global search while preserving the economy-linked shop and all protected tools.

## Version 1.19.0 economy-linked survivor shop

The dashboard now includes a public catalogue, protected linked-member wallet
and order tracking, an Admin fulfilment queue and an Owner catalogue editor.
Purchases debit the existing verified economy through Railway, require a final
confirmation and use idempotency protection against duplicate browser submits.
Finite stock, per-order and per-player limits are validated again by the API.

Admins can move orders into processing, record fulfilment, cancel or refund with
a required note. Refunds restore the full virtual balance and finite stock while
retaining the original ledger and order history. The searchable command library
now reflects the complete 90-command bot layout, including `/shop`, `/buy`,
`/orders` and `/order`.

## Version 1.18.0 member appeals and complete command access

Linked members can view only their own appealable cases, submit or withdraw an
appeal, add bounded evidence references and follow the protected decision.
Optional Discord tickets remain linked to the Railway case. Owners can configure
appeal deadlines, ticket routing, ticket support role and editing policy from the
dashboard. The command library now documents the complete 83-command bot layout,
including direct `/appeal`, `/support`, member and Admin shortcuts.

## Version 1.17.0 moderation operations and webhooks

The Admin dashboard now includes a moderation operations queue, assignments,
priorities, deadlines and an external-failure recovery panel. Owners can create
bot-managed Discord webhook destinations directly from the dashboard and route
each supported event category independently. Webhook URLs and tokens never
enter the GitHub Pages website.

## Version 1.16.0 direct-access dashboard navigation

The dashboard sidebar now exposes individual destinations for every major public, member,
Admin, Owner and help function. Section-aware links preserve browser history and allow
Admins to jump directly to moderation cases, ban lists, player administration, server
controls or protected audit history without scrolling through one large Admin page.

## Version 1.15.1 moderation case dialog hotfix

The protected moderation case dialog now uses the existing Admin authorization handler for
case-detail reads and case actions. This fixes the undefined-function error without changing
the Railway API, moderation permissions or database schema.

## Version 1.15.0 moderation evidence, reviews and appeals

Verified Admins can open any numbered moderation case, attach safe evidence references,
record a staff review or player appeal, and issue an upheld, reduced or overturned
decision. Supported overturned warnings and bans perform the real reversal while
retaining the original case and evidence history.

## Version 1.14.2 policy suite and release naming

The public website now includes a Legal & Policies hub, Terms of Service, expanded
Privacy Policy, Community Guidelines and Moderation & Appeals Policy. Public and
dashboard footers link to the policy suite. Visible release and roadmap language
uses version numbers instead of development phase labels.

## Version 1.14.1 current ban lists

Verified Admins can now view the live Discord and Nitrado DayZ ban lists from
Admin Tools. Dashboard-issued bans include their case number, reason and expiry;
external or legacy bans remain visible without fabricated metadata. Raw Discord
IDs and Nitrado response internals remain server-side on Railway.

## Version 1.14.0 moderation cases

The redesigned command centre now includes an Admin-only active moderation-case queue and permanent or temporary Discord/DayZ ban schedules. Preset and timezone-aware custom expiries are validated again by Railway. Automatic unbans are performed by the bot service, not by GitHub Pages, and the resulting action is linked to the original numbered case.

## Security

Never add Discord bot tokens, Discord client secrets, Nitrado API tokens, `.env` files or other secrets to this repository. GitHub Pages is public and all uploaded website files can be viewed by visitors. Discord OAuth, member-data queries, protected player administration, Start, Stop and Restart requests, and protected audit-history queries are handled by Railway. The website keeps only an opaque dashboard session in the current tab. Every protected player request requires fresh Admin/Owner authorization and returns only allowlisted fields. Player write actions require a reason, a clear confirmation dialog for the selected PlayStation ID, target protection and permanent audit logging. Railway still validates the selected PSN internally; Admins no longer need to retype it for every action. Ban actions may be permanent or scheduled; Railway validates the expiry and a persistent worker performs and audits automatic Discord or Nitrado unbans. Every server action requires an explicit confirmation prompt, fresh Admin/Owner authorization, a safe live state, duplicate protection and backend audit logging.

The public satellite map and trader coordinate selector are locally hosted and expose only approved public POIs. They do not publish private bases, live players, Admin positions or unpublished event coordinates.

## Disclaimer

This independent community website is not affiliated with or endorsed by Bohemia Interactive, Discord, Sony Interactive Entertainment, Nitrado, GitHub or Railway. Relevant names, games, services and trademarks belong to their respective owners.
