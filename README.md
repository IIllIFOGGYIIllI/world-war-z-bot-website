# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-bot-website/`

## Uploading the website

1. Open the `world-war-z-bot-website` repository on GitHub.
2. Select **Add file** and then **Upload files**.
3. Upload everything in this package, including the `assets` folder.
4. If `DELETE_THESE_FILES.txt` still exists in the repository, delete it; it is an obsolete instruction file and is intentionally absent from this release.
5. Enter the commit message: `Overhaul command centre interface`
6. Select **Commit changes**.

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
- `dashboard.js` — Railway health, Discord session, role visibility, member data, secure player lookup, controlled moderation actions and protected audit history
- `chernarus-map.js` — public POI search, filters, markers, pan and vector zoom
- `privacy.html` — current dashboard authentication and privacy information
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
- `WEBHOOK_SETUP.md` — Discord notifications for GitHub website updates
- `CHERNARUS_MAP_PLAN.md` — implemented map design and future protected stages
- `MAP_ATTRIBUTION.md` — ChernarusPlus source, licence and modification notice

## Version 1.13.0 visual system

The website now uses one consistent command-centre design across the public landing page, dashboard, privacy information, changelog and 404 page. The background and logo assets are hosted locally, so the visual overhaul adds no third-party image or font requests. Existing dashboard selectors and API behaviour are preserved.

## Security

Never add Discord bot tokens, Discord client secrets, Nitrado API tokens, `.env` files or other secrets to this repository. GitHub Pages is public and all uploaded website files can be viewed by visitors. Discord OAuth, member-data queries, protected player administration, Start, Stop and Restart requests, and protected audit-history queries are handled by Railway. The website keeps only an opaque dashboard session in the current tab. Every protected player request requires fresh Admin/Owner authorization and returns only allowlisted fields. Player write actions require a reason, a clear confirmation dialog for the selected PlayStation ID, target protection and permanent audit logging. Railway still validates the selected PSN internally; Admins no longer need to retype it for every action. Every server action requires an explicit confirmation prompt, fresh Admin/Owner authorization, a safe live state, duplicate protection and backend audit logging.

The public map intentionally excludes live players, private bases, Admin positions and unpublished event coordinates. Only entries marked `public` in `assets/chernarus-pois.json` are displayed.

## Disclaimer

This website is not affiliated or authorized by Bohemia Interactive a.s. Bohemia Interactive, ARMA, DAYZ and all associated logos and designs are trademarks or registered trademarks of Bohemia Interactive a.s.
