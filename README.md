# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-bot-website/`

## Uploading the website

1. Open the `world-war-z-bot-website` repository on GitHub.
2. Select **Add file** and then **Upload files**.
3. Upload everything in this package, including the `assets` folder.
4. Enter the commit message: `Use restart confirmation button`
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
- `dashboard.js` — Railway status, Discord session, role visibility, member data and protected Admin restart flow
- `chernarus-map.js` — public POI search, filters, markers, pan and vector zoom
- `privacy.html` — current dashboard authentication and privacy information
- `changelog.html` — browser-readable website release history
- `pages.css` — shared privacy and changelog page design
- `404.html` — custom missing-page screen
- `site.webmanifest` — website metadata
- `assets/world-war-z-banner.png` — supplied World War Z banner
- `assets/chernarus-vector.svg` — custom vector Chernarus road overview
- `assets/chernarus-pois.json` — validated public map locations
- `PATCH_NOTES.md` — version history and update notes
- `WEBHOOK_SETUP.md` — Discord notifications for GitHub website updates
- `CHERNARUS_MAP_PLAN.md` — implemented map design and future protected stages
- `MAP_ATTRIBUTION.md` — ChernarusPlus source, licence and modification notice

## Security

Never add Discord bot tokens, Discord client secrets, Nitrado API tokens, `.env` files or other secrets to this repository. GitHub Pages is public and all uploaded website files can be viewed by visitors. Discord OAuth, member-data queries and the protected server restart are handled by Railway. The website keeps only an opaque dashboard session in the current tab. Restart requires an explicit confirmation prompt, fresh Admin/Owner authorization, duplicate protection and backend audit logging. Stop, Start and all other protected actions remain unavailable.

The public map intentionally excludes live players, private bases, Admin positions and unpublished event coordinates. Only entries marked `public` in `assets/chernarus-pois.json` are displayed.

## Disclaimer

This website is not affiliated or authorized by Bohemia Interactive a.s. Bohemia Interactive, ARMA, DAYZ and all associated logos and designs are trademarks or registered trademarks of Bohemia Interactive a.s.
