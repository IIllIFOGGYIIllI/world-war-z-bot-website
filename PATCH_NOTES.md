# Version 1.22.35

## Console Item Delivery UI + Public Marker Session Fix

- Updates the Automatic Delivery Monitor to describe the new Bot v1.18.34 Normal Item workflow using temporary `cfgEffectArea.json` entries rather than `events.xml` / `cfgeventspawns.xml`.
- Keeps Event Item rentals on the established restart-bound Central Economy workflow and updates the example naming to `VehicleWWZOrder000001`.
- Fixes Admin public-marker create/edit/delete actions using an undefined/stale `sessionToken`; the map now resolves the current `sessionStorage` dashboard token at action time.
- Adds explicit 401/403 handling for expired sessions and lost Admin permission during public-marker writes.
- Refreshes progression presentation to the Bot v1.18.34 recommendation set, where Level 100 is `Legendary Survivor` and Prestige X is `World War Z Immortal`.
- Advances all local CSS/JS cache-busters to `v1.22.35`.
- Extends static validation so the public-marker client must retain dynamic session-token resolution and authorization handling.
- Preserves the production 4,810-tile satellite pyramid, 52,006 road line parts, 77 settlement labels and all Railway data.
- Deploy Bot v1.18.34 before Website v1.22.35.

## Deployment

```powershell
py .\scripts\validate_site.py --require-map-assets
git add .
git commit -m "Fix item delivery and map auth"
git push
```

---

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
