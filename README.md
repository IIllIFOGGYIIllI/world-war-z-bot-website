# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-bot-website/`

## Uploading the website

1. Open the `world-war-z-bot-website` repository on GitHub.
2. Select **Add file** and then **Upload files**.
3. Upload everything in this package, including the `assets` folder.
4. Enter the commit message: `Add trader delivery and server control`
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
- `dashboard.js` — Railway health, Discord session, role visibility, member data, survivor-shop purchases, fulfilment controls, secure player lookup, moderation actions and protected audit history
- `chernarus-map.js` — public POI search, filters, markers, pan and vector zoom
- `legal.html` — legal and policy document hub
- `terms.html` — community Terms of Service
- `privacy.html` — privacy, storage, service-provider and data-request information
- `community-guidelines.html` — acceptable conduct and safety rules
- `moderation-policy.html` — cases, evidence, bans, expiry and appeal practices
- `changelog.html` — browser-readable website release history
- `pages.css` — shared privacy and changelog page design
- `404.html` — custom missing-page screen
- `site.webmanifest` — website metadata
- `assets/world-war-z-banner.png` — social sharing banner
- `assets/world-war-z-logo.webp` — refined local header and interface logo
- `assets/world-war-z-icon.png` and `assets/favicon.png` — local application icons
- `assets/world-war-z-dashboard-bg.webp` — desktop command-centre atmosphere
- `assets/world-war-z-dashboard-bg-mobile.webp` — mobile command-centre atmosphere
- `assets/chernarus-vector.svg` — custom vector Chernarus road overview
- `assets/chernarus-pois.json` — validated public map locations
- `PATCH_NOTES.md` — version history and update notes
- `WEBHOOK_SETUP.md` — optional GitHub push notifications, separate from the dashboard-managed moderation webhooks
- `CHERNARUS_MAP_PLAN.md` — implemented map design and future protected versions
- `MAP_ATTRIBUTION.md` — ChernarusPlus source, licence and modification notice


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

The public map intentionally excludes live players, private bases, Admin positions and unpublished event coordinates. Only entries marked `public` in `assets/chernarus-pois.json` are displayed.

## Disclaimer

This independent community website is not affiliated with or endorsed by Bohemia Interactive, Discord, Sony Interactive Entertainment, Nitrado, GitHub or Railway. Relevant names, games, services and trademarks belong to their respective owners.
