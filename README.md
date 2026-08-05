# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-bot-website/`

## Uploading the website

1. Open the `world-war-z-bot-website` repository on GitHub.
2. Select **Add file** and then **Upload files**.
3. Upload everything in this package, including the `assets` folder.
4. Enter the commit message: `Restore rental commands and status`
5. Select **Commit changes**.

## Enabling GitHub Pages

1. Open **Settings** in the repository.
2. Select **Pages** under **Code and automation**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Select the `main` branch and the `/ (root)` folder.
5. Select **Save**.

GitHub may take a few minutes to publish the first version.

## Files

- `index.html` — website content and structure
- `styles.css` — full visual design and mobile layout
- `script.js` — navigation, header and scroll effects
- `dashboard.html` — live status, personal profile and economy dashboard
- `dashboard.css` — dashboard layout and responsive design
- `dashboard.js` — Railway health, Discord session, role visibility, member data, survivor-shop purchases, automatic-delivery monitoring, trader-ticket fulfilment, secure player lookup, moderation actions and protected audit history
- `legal.html` — legal and policy document hub
- `terms.html` — community Terms of Service
- `privacy.html` — privacy, storage, service-provider and data-request information
- `community-guidelines.html` — acceptable conduct and safety rules
- `moderation-policy.html` — cases, evidence, bans, expiry and appeal practices
- `changelog.html` — browser-readable website release history
- `pages.css` — shared privacy and changelog page design
- `404.html` — custom missing-page screen
- `site.webmanifest` — website metadata
- `.nojekyll` — forces GitHub Pages to publish the static site without Jekyll processing
- `assets/world-war-z-banner.png` — social sharing banner
- `assets/world-war-z-logo.webp` — refined local header and interface logo
- `assets/world-war-z-icon.png` and `assets/favicon.png` — local application icons
- `assets/world-war-z-dashboard-bg.webp` — desktop command-centre atmosphere
- `assets/world-war-z-dashboard-bg-mobile.webp` — mobile command-centre atmosphere
- `assets/chernarus-map/tiles/` — locally generated multilevel WebP Chernarus satellite tiles
- `assets/chernarus-map/overview.webp` — 3,840 px seamless satellite overview used by compact coordinate selectors
- `assets/chernarus-map/tile-report.json` — source-tile validation and generated-pyramid report
- `assets/chernarus-vector.svg` — retained legacy vector fallback; no deletion is required
- `PATCH_NOTES.md` — version history and update notes
- `WEBHOOK_SETUP.md` — optional GitHub push notifications, separate from the dashboard-managed moderation webhooks
- `CHERNARUS_MAP_PLAN.md` — implemented satellite map architecture and operating notes
- `CHERNARUS_MAP_VALIDATION.md` — tile completeness, orientation and output validation
- `MAP_ATTRIBUTION.md` — ChernarusPlus source, licence and modification notice



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
- The main public map is a Coming Soon workspace pending its high-detail rebuild.
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
