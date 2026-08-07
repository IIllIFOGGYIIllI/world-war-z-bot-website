# Version 1.22.28

## Map Locations & Custom Pins

- Rebuilt the dashboard Map Locations list so public landmarks render as proper themed location cards instead of browser-default buttons.
- Added All / Public / My Pins location scopes and kept category/search filtering across the active scope.
- Added personal custom Chernarus pins with name, category, notes, colour and exact DayZ X/Z coordinates.
- A clicked map point can now be saved directly as a custom pin; existing custom pins can be centred, copied, edited or deleted.
- Custom pins are rendered as distinct coloured markers without changing the production road or satellite geometry.
- Added browser-local persistence for up to 250 personal pins using `localStorage`.
- Added JSON export/import so a player can back up or move their personal pins between browsers/devices manually.
- Added a richer details panel with Public / My Pin / Unsaved scope labels and Centre / Copy X/Z / Save / Edit / Delete actions.
- Search now covers names, categories, notes and X/Z coordinates.
- No custom pin is published, sent to Railway or shared with other players.
- No Railway API, authentication, database, shop, rental, moderation or bot change is required.
- Preserves the v1.22.27 corrected satellite pyramid and the final 52,006-part WRP road overlay unchanged.
- Pairs with Bot v1.18.26.
- `/app/data/players.db` is not included, replaced, reset or modified.
