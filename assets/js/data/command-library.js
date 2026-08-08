(() => {
  'use strict';

  const commandCatalogue = [
  {"name": "account", "category": "Accounts", "description": "Advanced account linking and administration group.", "access": "Member"},
  {"name": "adm", "category": "ADM intelligence", "description": "Advanced ADM intelligence group.", "access": "Admin"},
  {"name": "adminlink", "category": "Accounts", "description": "Link a Discord member to a PlayStation identity.", "access": "Admin"},
  {"name": "admstats", "category": "ADM intelligence", "description": "View ADM intelligence statistics.", "access": "Admin"},
  {"name": "appeal", "category": "Support & appeals", "description": "Appeal one of your own eligible moderation cases.", "access": "Member"},
  {"name": "balance", "category": "Economy", "description": "View a survivor wallet.", "access": "Member"},
  {"name": "ban", "category": "Moderation", "description": "Ban a Discord member.", "access": "Admin"},
  {"name": "banlist", "category": "DayZ moderation", "description": "Manage the authoritative Nitrado DayZ ban list.", "access": "Admin"},
  {"name": "banlist show", "category": "DayZ moderation", "description": "Display the current DayZ ban list directly from Nitrado.", "access": "Admin"},
  {"name": "banlist add", "category": "DayZ moderation", "description": "Add one or more PlayStation IDs to the Nitrado DayZ ban list.", "access": "Admin"},
  {"name": "banlist remove", "category": "DayZ moderation", "description": "Remove one or more PlayStation IDs from the Nitrado DayZ ban list.", "access": "Admin"},
  {"name": "banlist wipe", "category": "DayZ moderation", "description": "Remove every current PlayStation ID from the Nitrado DayZ ban list after confirmation.", "access": "Admin"},
  {"name": "blackjack", "category": "Games", "description": "Play community blackjack.", "access": "Member"},
  {"name": "bot", "category": "General", "description": "Advanced bot information and messaging group.", "access": "Everyone"},
  {"name": "botinfo", "category": "General", "description": "View bot version and service information.", "access": "Everyone"},
  {"name": "bounties", "category": "Bounties & contracts", "description": "View active bounties.", "access": "Member"},
  {"name": "bounty", "category": "Bounties & contracts", "description": "Advanced bounty group.", "access": "Member"},
  {"name": "bountycreate", "category": "Bounties & contracts", "description": "Create a new player bounty.", "access": "Member"},
  {"name": "case", "category": "Moderation", "description": "Open one numbered moderation case.", "access": "Admin"},
  {"name": "cases", "category": "Moderation", "description": "List recent moderation cases.", "access": "Admin"},
  {"name": "coinflip", "category": "Games", "description": "Place a heads-or-tails economy wager.", "access": "Member"},
  {"name": "config", "category": "Configuration", "description": "Manage general DayZ configuration workflow.", "access": "Owner"},
  {"name": "contract", "category": "Bounties & contracts", "description": "Advanced contract group.", "access": "Member"},
  {"name": "contractaccept", "category": "Bounties & contracts", "description": "Accept a contract.", "access": "Member"},
  {"name": "contractclaim", "category": "Bounties & contracts", "description": "Claim a completed contract reward.", "access": "Member"},
  {"name": "contractprogress", "category": "Bounties & contracts", "description": "View contract progress.", "access": "Member"},
  {"name": "contracts", "category": "Bounties & contracts", "description": "View available survivor contracts.", "access": "Member"},
  {"name": "daily", "category": "Economy", "description": "Claim the daily survivor stipend.", "access": "Member"},
  {"name": "damagefeed", "category": "ADM intelligence", "description": "View recent damage activity.", "access": "Admin"},
  {"name": "damagesettings", "category": "Server", "description": "View or manage DayZ damage settings.", "access": "Owner"},
  {"name": "dice", "category": "Games", "description": "Place an economy wager on a dice roll.", "access": "Member"},
  {"name": "economy", "category": "Economy", "description": "Advanced economy administration group.", "access": "Member"},
  {"name": "economyhistory", "category": "Economy", "description": "View recent economy transactions.", "access": "Member"},
  {"name": "economystats", "category": "Economy", "description": "View detailed economy statistics.", "access": "Member"},
  {"name": "event", "category": "Events", "description": "Manage community event records and rewards.", "access": "Admin"},
  {"name": "eventconfig", "category": "Configuration", "description": "Manage event configuration.", "access": "Owner"},
  {"name": "eventpositions", "category": "Configuration", "description": "Manage event position configuration.", "access": "Owner"},
  {"name": "help", "category": "General", "description": "Search the direct command guide by command name or topic.", "access": "Everyone"},
  {"name": "jackpot", "category": "Games", "description": "View or enter the community jackpot.", "access": "Member"},
  {"name": "kick", "category": "Moderation", "description": "Kick a member from Discord.", "access": "Admin"},
  {"name": "link", "category": "Accounts", "description": "Link and verify your PlayStation identity.", "access": "Member"},
  {"name": "linkpanel", "category": "Accounts", "description": "Publish the persistent account-linking panel.", "access": "Admin"},
  {"name": "locationadd", "category": "Shop & delivery", "description": "Save an exact named Chernarus delivery location.", "access": "Member"},
  {"name": "locationdelete", "category": "Shop & delivery", "description": "Delete one of your reusable delivery locations.", "access": "Member"},
  {"name": "locations", "category": "Shop & delivery", "description": "List your private saved in-game delivery coordinates.", "access": "Member"},
  {"name": "lock", "category": "Moderation", "description": "Lock the current Discord channel.", "access": "Admin"},
  {"name": "logs", "category": "Logging", "description": "Configure authorised Discord logging.", "access": "Admin"},
  {"name": "loot", "category": "Configuration", "description": "Manage loot configuration.", "access": "Owner"},
  {"name": "mod", "category": "Moderation", "description": "Advanced moderation and channel-control group.", "access": "Admin"},
  {"name": "mybounties", "category": "Bounties & contracts", "description": "View bounties involving your account.", "access": "Member"},
  {"name": "myprofile", "category": "Accounts", "description": "View your own or another survivor profile.", "access": "Member"},
  {"name": "nitrado", "category": "Server", "description": "Access advanced Nitrado server controls.", "access": "Owner"},
  {"name": "pay", "category": "Economy", "description": "Transfer money to another linked survivor.", "access": "Member"},
  {"name": "ping", "category": "General", "description": "Check bot response latency.", "access": "Everyone"},
  {"name": "player", "category": "Player admin", "description": "Advanced player administration group.", "access": "Admin"},
  {"name": "playerlookup", "category": "Player admin", "description": "Open a complete PSN administration record.", "access": "Admin"},
  {"name": "playernote", "category": "Player admin", "description": "Add a private note to a player record.", "access": "Admin"},
  {"name": "playernotes", "category": "Player admin", "description": "View private player notes.", "access": "Admin"},
  {"name": "presence", "category": "General", "description": "View the saved Discord presence.", "access": "Everyone"},
  {"name": "profile", "category": "Accounts", "description": "Advanced survivor profile group.", "access": "Member"},
  {"name": "purge", "category": "Moderation", "description": "Bulk cleanup command group for Discord messages and DayZ ban-list maintenance.", "access": "Admin"},
  {"name": "purge messages", "category": "Moderation", "description": "Delete recent non-pinned messages from a Discord text channel.", "access": "Admin"},
  {"name": "purge banlist last-login", "category": "DayZ moderation", "description": "Remove current Nitrado bans last seen before a selected DayZ activity threshold; unknown last-login records are left untouched.", "access": "Admin"},
  {"name": "pvp", "category": "PvP", "description": "Advanced PvP statistics and feed group.", "access": "Member"},
  {"name": "pvpleaderboard", "category": "PvP", "description": "View the PvP leaderboard.", "access": "Member"},
  {"name": "pvpstats", "category": "PvP", "description": "View detailed survivor PvP statistics.", "access": "Member"},
  {"name": "recentdeaths", "category": "ADM intelligence", "description": "View recent DayZ deaths.", "access": "Admin"},
  {"name": "recentkills", "category": "PvP", "description": "View recent confirmed PvP kills.", "access": "Member"},
  {"name": "restart", "category": "Server", "description": "Restart the DayZ server with protected confirmation.", "access": "Owner"},
  {"name": "richlist", "category": "Economy", "description": "View the wealthiest verified survivors.", "access": "Member"},
  {"name": "roulette", "category": "Games", "description": "Play community roulette.", "access": "Member"},
  {"name": "server", "category": "Server", "description": "Advanced live server and feed group.", "access": "Everyone"},
  {"name": "serverstatus", "category": "Server", "description": "View live DayZ server population and status.", "access": "Everyone"},
  {"name": "slots", "category": "Games", "description": "Play the community slot machine.", "access": "Member"},
  {"name": "start", "category": "Server", "description": "Start the DayZ server.", "access": "Owner"},
  {"name": "statuspanel", "category": "Server", "description": "Publish or update the persistent server-status panel.", "access": "Admin"},
  {"name": "stop", "category": "Server", "description": "Stop the DayZ server.", "access": "Owner"},
  {"name": "support", "category": "Support & appeals", "description": "Open the private support-ticket category menu.", "access": "Member"},
  {"name": "suspicious", "category": "ADM intelligence", "description": "View suspicious activity intelligence.", "access": "Admin"},
  {"name": "ticket", "category": "Support & appeals", "description": "Advanced ticket setup and management group.", "access": "Member"},
  {"name": "timeout", "category": "Moderation", "description": "Temporarily timeout a member.", "access": "Admin"},
  {"name": "unban", "category": "Moderation", "description": "Unban a Discord account.", "access": "Admin"},
  {"name": "unlink", "category": "Accounts", "description": "Unlink your verified PlayStation identity.", "access": "Member"},
  {"name": "unlock", "category": "Moderation", "description": "Unlock the current Discord channel.", "access": "Admin"},
  {"name": "untimeout", "category": "Moderation", "description": "Remove a member timeout.", "access": "Admin"},
  {"name": "unwarn", "category": "Moderation", "description": "Remove an active warning by case number.", "access": "Admin"},
  {"name": "unwatch", "category": "Player admin", "description": "Remove a PlayStation account from the watchlist.", "access": "Admin"},
  {"name": "validation", "category": "Configuration", "description": "Validate configuration files before deployment.", "access": "Owner"},
  {"name": "warn", "category": "Moderation", "description": "Warn a member and create a numbered case.", "access": "Admin"},
  {"name": "warnings", "category": "Moderation", "description": "View a member’s active warnings.", "access": "Admin"},
  {"name": "watch", "category": "Player admin", "description": "Add a PlayStation account to the watchlist.", "access": "Admin"},
  {"name": "watchlist", "category": "Player admin", "description": "View watched PlayStation accounts.", "access": "Admin"},
  {"name": "work", "category": "Economy", "description": "Complete a survivor job.", "access": "Member"},
  {"name": "shop", "category": "Shop", "description": "Browse the active survivor shop catalogue.", "access": "Member"},
  {"name": "buy", "category": "Shop", "description": "Purchase an active shop item with community currency.", "access": "Member"},
  {"name": "orders", "category": "Shop", "description": "View your recent shop orders and fulfilment status.", "access": "Member"},
  {"name": "order", "category": "Shop", "description": "View one shop order and its audit history.", "access": "Member"},
  {"name": "rental", "category": "Shop & delivery", "description": "Restart-bound Event Item rental command group.", "access": "Member"},
  {"name": "rental list", "category": "Shop & delivery", "description": "Browse restart-bound rentals available for purchase.", "access": "Member"},
  {"name": "rental buy", "category": "Shop & delivery", "description": "Purchase a rental at exact Chernarus coordinates for a selected number of restarts.", "access": "Member"},
  {"name": "rental purchased", "category": "Shop & delivery", "description": "View purchased rentals, delivery state and remaining restarts.", "access": "Member"},
  {"name": "rental cancel", "category": "Shop & delivery", "description": "Cancel one of your current rentals and receive an automatic refund when eligible.", "access": "Member"},
  {"name": "adminrental", "category": "Shop & delivery", "description": "Administrator rental-management command group.", "access": "Admin"},
  {"name": "adminrental list", "category": "Shop & delivery", "description": "View current and historical rentals across the server.", "access": "Admin"},
  {"name": "adminrental cancel", "category": "Shop & delivery", "description": "Cancel or refund a rental and queue automatic DayZ file cleanup.", "access": "Admin"},
  {"name": "rank", "category": "Progression", "description": "View your own or another member’s World War Z level, XP, prestige and milestone progress.", "access": "Member"},
  {"name": "leaderboard", "category": "Progression", "description": "View progression leaderboards by overall level, lifetime XP, text XP, voice XP, combat XP or prestige.", "access": "Member"},
  {"name": "prestige", "category": "Progression", "description": "Prestige after reaching Level 100 while preserving lifetime progression statistics.", "access": "Member"},
  {"name": "xp", "category": "Progression", "description": "World War Z XP, level-role, prestige and activity configuration command group.", "access": "Member"},
  {"name": "xp status", "category": "Progression", "description": "View XP-system status plus your current level, XP bar and next progression milestone.", "access": "Member"},
  {"name": "xp recommendations", "category": "Progression", "description": "View the recommended World War Z level and prestige role ladder.", "access": "Member"},
  {"name": "xp roles", "category": "Progression", "description": "View the Discord roles currently bound to level and prestige milestones.", "access": "Member"},
  {"name": "xp channel", "category": "Progression", "description": "Set the Discord channel used for level-up and prestige announcements.", "access": "Admin"},
  {"name": "xp toggle", "category": "Progression", "description": "Enable or disable text, voice, combat, event or announcement portions of progression.", "access": "Admin"},
  {"name": "xp rate", "category": "Progression", "description": "Change an XP rate, threshold or anti-farming cooldown.", "access": "Admin"},
  {"name": "xp levelrole", "category": "Progression", "description": "Bind a manageable Discord role to a level milestone.", "access": "Admin"},
  {"name": "xp prestigerole", "category": "Progression", "description": "Bind a manageable Discord role to a prestige milestone.", "access": "Admin"},
  {"name": "xp exclude_text", "category": "Progression", "description": "Exclude a text channel from earning message XP.", "access": "Admin"},
  {"name": "xp include_text", "category": "Progression", "description": "Re-enable message XP in a previously excluded text channel.", "access": "Admin"},
  {"name": "xp exclude_voice", "category": "Progression", "description": "Exclude a voice channel from earning voice XP.", "access": "Admin"},
  {"name": "xp include_voice", "category": "Progression", "description": "Re-enable voice XP in a previously excluded voice channel.", "access": "Admin"},
  {"name": "xp award", "category": "Progression", "description": "Award manual bonus XP to a member with an auditable reason.", "access": "Admin"},
  {"name": "xp remove", "category": "Progression", "description": "Remove current-prestige XP from a member without deleting lifetime history.", "access": "Admin"}
];

  const initialiseCommandLibrary = () => {
    const results = document.querySelector('[data-command-results]');
    const search = document.querySelector('[data-command-search]');
    const filters = document.querySelector('[data-command-filters]');
    const count = document.querySelector('[data-command-count]');
    const empty = document.querySelector('[data-command-empty]');

    if (!results || !filters) return;

    const categories = ['All', ...new Set(commandCatalogue.map((command) => command.category))];
    let selectedCategory = 'All';

    const renderCommands = () => {
      const query = String(search?.value || '').trim().toLowerCase();
      const visible = commandCatalogue.filter((command) => {
        const categoryMatches =
          selectedCategory === 'All' || command.category === selectedCategory;
        const searchable = [
          command.name,
          command.description,
          command.category,
          command.access
        ].join(' ').toLowerCase();
        return categoryMatches && searchable.includes(query);
      });

      results.replaceChildren();

      visible.forEach((command) => {
        const card = document.createElement('article');
        card.className = 'command-card';

        const heading = document.createElement('div');
        const code = document.createElement('code');
        const slash = document.createElement('span');
        slash.textContent = '/';
        code.append(slash, command.name);

        const category = document.createElement('small');
        category.textContent = command.category;
        heading.append(code, category);

        const description = document.createElement('p');
        description.textContent = command.description;

        const footer = document.createElement('footer');
        footer.textContent = `Access: ${command.access}`;

        card.append(heading, description, footer);
        results.append(card);
      });

      if (count) count.textContent = String(visible.length);
      if (empty) empty.hidden = visible.length !== 0;
    };

    const renderFilters = () => {
      filters.replaceChildren();

      categories.forEach((categoryName) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = categoryName;
        button.classList.toggle('active', categoryName === selectedCategory);
        button.setAttribute(
          'aria-pressed',
          String(categoryName === selectedCategory)
        );
        button.addEventListener('click', () => {
          selectedCategory = categoryName;
          renderFilters();
          renderCommands();
        });
        filters.append(button);
      });
    };

    search?.addEventListener('input', renderCommands);
    renderFilters();
    renderCommands();

    window.__wwzCommandLibraryReady = true;
    window.__wwzCommandPathCount = commandCatalogue.length;
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initialiseCommandLibrary,
      { once: true }
    );
  } else {
    initialiseCommandLibrary();
  }
})();
