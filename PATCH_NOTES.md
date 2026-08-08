# Version 1.22.34

## XP & Prestige Dashboard Configuration

- Adds a dedicated **XP & Prestige** dashboard workspace for signed-in members.
- Shows current prestige icon/title, current level milestone, an XP progress bar, server rank, next milestone, lifetime XP and XP source totals.
- Adds a live top-10 overall progression leaderboard.
- Adds Admin/Owner progression configuration backed by Bot v1.18.33.
- Website controls cover every current progression toggle and XP rate, the level-up announcement channel, level role bindings, Prestige I–X role bindings, custom level milestones, and excluded text/voice channels.
- Role and channel choices are resolved through opaque dashboard resource keys; Railway rechecks live Discord Admin/Owner access before every write.
- Existing member XP and `/app/data/players.db` are preserved. No progression data is reset.
- Adds authentication-change refresh handling so the progression page updates after Discord sign-in/sign-out.
- Refreshes website CSS/JS cache-busters to `v1.22.34`.
- Pairs with Bot v1.18.33. Deploy the bot first so the new progression API is available before publishing the website.

## Deployment

```powershell
py .\scripts\validate_site.py --require-map-assets
git add .
git commit -m "Add XP dashboard settings"
git push
```
