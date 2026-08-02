# World War Z Bot Website

The official website of the World War Z community's unofficial DayZ Discord bot.

## Live website

After GitHub Pages is enabled, the site will be available at:

`https://iillifoggyiilli.github.io/world-war-z-bot-website/`

## Uploading the website

1. Open the `world-war-z-bot-website` repository on GitHub.
2. Select **Add file** and then **Upload files**.
3. Upload everything in this package, including the `assets` folder.
4. Enter the commit message: `Connect member dashboard data`
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
- `dashboard.js` — Railway status, Discord session, role visibility and member data
- `privacy.html` — current dashboard authentication and privacy information
- `changelog.html` — browser-readable website release history
- `pages.css` — shared privacy and changelog page design
- `404.html` — custom missing-page screen
- `site.webmanifest` — website metadata
- `assets/world-war-z-banner.png` — supplied World War Z banner
- `PATCH_NOTES.md` — version history and update notes
- `WEBHOOK_SETUP.md` — Discord notifications for GitHub website updates
- `CHERNARUS_MAP_PLAN.md` — secure interactive POI-map roadmap

## Security

Never add Discord bot tokens, Discord client secrets, Nitrado API tokens, `.env` files or other secrets to this repository. GitHub Pages is public and all uploaded website files can be viewed by visitors. Discord OAuth and member-data queries are handled by Railway. The website keeps only an opaque dashboard session in the current tab and can request only the signed-in member's allowlisted profile and economy summary. Protected actions remain unavailable.

## Disclaimer

World War Z Bot is an independent community project and is not affiliated with or endorsed by Bohemia Interactive, Discord, Nitrado, Saber Interactive or Paramount Pictures. All trademarks belong to their respective owners.
