const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarScrim = document.querySelector('[data-sidebar-scrim]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const loginDialog = document.querySelector('[data-login-dialog]');

const closeSidebar = () => {
  sidebar?.classList.remove('open');
  sidebarScrim?.classList.remove('open');
  sidebarToggle?.setAttribute('aria-expanded', 'false');
};

sidebarToggle?.addEventListener('click', () => {
  const willOpen = !sidebar?.classList.contains('open');
  sidebar?.classList.toggle('open', willOpen);
  sidebarScrim?.classList.toggle('open', willOpen);
  sidebarToggle.setAttribute('aria-expanded', String(willOpen));
});

sidebarScrim?.addEventListener('click', closeSidebar);

const availableViews = new Set(viewPanels.map((panel) => panel.dataset.viewPanel));

const showView = (view, updateHistory = true) => {
  const selectedView = availableViews.has(view) ? view : 'overview';

  viewPanels.forEach((panel) => {
    const active = panel.dataset.viewPanel === selectedView;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });

  viewButtons.forEach((button) => {
    const active = button.dataset.view === selectedView;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  if (updateHistory) history.pushState({ view: selectedView }, '', `#${selectedView}`);
  document.querySelector('#dashboard-content')?.scrollIntoView({ block: 'start' });
  closeSidebar();
};

viewButtons.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.jump)));

window.addEventListener('popstate', () => showView(location.hash.slice(1), false));

document.querySelectorAll('[data-open-login]').forEach((button) => {
  button.addEventListener('click', () => {
    handleAuthAction();
  });
});

loginDialog?.addEventListener('click', (event) => {
  if (event.target === loginDialog) loginDialog.close?.();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSidebar();
});

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const DASHBOARD_API_BASE = 'https://world-war-z-discord-bot-production.up.railway.app';
const SERVER_STATUS_URL = `${DASHBOARD_API_BASE}/api/server/status`;
const AUTH_CONFIG_URL = `${DASHBOARD_API_BASE}/api/auth/config`;
const AUTH_LOGIN_URL = `${DASHBOARD_API_BASE}/api/auth/discord/login`;
const AUTH_COMPLETE_URL = `${DASHBOARD_API_BASE}/api/auth/discord/complete`;
const AUTH_ME_URL = `${DASHBOARD_API_BASE}/api/auth/me`;
const AUTH_LOGOUT_URL = `${DASHBOARD_API_BASE}/api/auth/logout`;
const AUTH_SESSION_KEY = 'wwz_dashboard_session';
const AUTH_RETURN_VIEW_KEY = 'wwz_dashboard_return_view';
const LIVE_STATUS_REFRESH_MS = 30_000;
const STATUS_CLASSES = ['online', 'restarting', 'offline', 'unavailable', 'loading'];
const STATUS_LABELS = {
  online: 'Online',
  restarting: 'Restarting',
  offline: 'Offline'
};

const authMessage = document.querySelector('[data-auth-message]');
const startDiscordLoginButton = document.querySelector('[data-start-discord-login]');
const signOutButton = document.querySelector('[data-sign-out]');
const authDialogNotice = document.querySelector('[data-auth-dialog-notice]');
let discordAuthEnabled = false;
let authenticatedUser = null;
let authRequestInProgress = false;

const storageGet = (key) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const storageSet = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
};

const storageRemove = (key) => {
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    // A blocked browser storage setting is treated like a signed-out tab.
  }
};

const showAuthMessage = (message, state = 'info') => {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.dataset.state = state;
  authMessage.hidden = false;
};

const hideAuthMessage = () => {
  if (authMessage) authMessage.hidden = true;
};

const accessLabel = (level) => {
  if (level === 'owner') return 'Owner';
  if (level === 'staff') return 'Staff';
  return 'Member';
};

const setAuthBadgeState = (state, label) => {
  document.querySelectorAll('[data-auth-badge]').forEach((badge) => {
    setStatusClass(badge, state);
  });
  setText('[data-auth-badge-label]', label);
};

const applySignedOutState = ({ unavailable = false } = {}) => {
  authenticatedUser = null;
  setText('[data-auth-button-label]', 'Sign in with Discord');
  setText('[data-access-card-title]', 'Guest access');
  setText('[data-access-card-copy]', 'Sign in will securely verify your community access.');
  setText('[data-access-icon]', '⌁');
  setText('[data-auth-description]', unavailable
    ? 'Discord verification is temporarily unavailable. Your existing browser session has not been exposed.'
    : 'Discord sign-in securely verifies your World War Z membership and current access level.');
  setText('[data-auth-cta]', 'Connect Discord');
  setText('[data-staff-access-label]', 'Locked');
  setText('[data-owner-access-label]', 'Locked');
  setText('[data-welcome-copy]', 'Live server information and a secure path into your World War Z community account.');
  document.querySelector('[data-account-summary]')?.setAttribute('hidden', '');
  document.querySelector('[data-auth-guest-action]')?.removeAttribute('hidden');
  signOutButton?.setAttribute('hidden', '');
  setAuthBadgeState(unavailable ? 'unavailable' : 'offline', unavailable ? 'Verification unavailable' : 'Not connected');
};

const applyAuthenticatedState = (payload) => {
  if (!payload?.user || !payload?.membership) {
    throw new Error('Unexpected account response');
  }

  authenticatedUser = payload;
  const displayName = String(payload.user.display_name || payload.user.username || 'Survivor');
  const username = String(payload.user.username || 'Discord account');
  const level = accessLabel(payload.membership.access_level);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'WZ';

  setText('[data-auth-button-label]', displayName);
  setText('[data-access-card-title]', displayName);
  setText('[data-access-card-copy]', `${level} access verified`);
  setText('[data-access-icon]', initials);
  setText('[data-account-avatar]', initials);
  setText('[data-account-display-name]', displayName);
  setText('[data-account-username]', `@${username}`);
  setText('[data-account-level]', level);
  setText('[data-auth-description]', `Your Discord identity and ${level.toLowerCase()} access are verified. Private profile and economy data will connect in the next stage.`);
  setText('[data-auth-cta]', 'View account');
  setText('[data-welcome-copy]', `Signed in as ${displayName} with verified ${level.toLowerCase()} access.`);
  setText('[data-staff-access-label]', ['staff', 'owner'].includes(payload.membership.access_level) ? 'Verified' : 'Locked');
  setText('[data-owner-access-label]', payload.membership.access_level === 'owner' ? 'Verified' : 'Locked');
  document.querySelector('[data-account-summary]')?.removeAttribute('hidden');
  document.querySelector('[data-auth-guest-action]')?.setAttribute('hidden', '');
  signOutButton?.removeAttribute('hidden');
  setAuthBadgeState('online', `Connected · ${level}`);
};

const openLoginDialog = () => {
  if (typeof loginDialog?.showModal === 'function') loginDialog.showModal();
  else loginDialog?.setAttribute('open', '');
};

const handleAuthAction = () => {
  if (authenticatedUser) {
    showView('settings');
    return;
  }

  openLoginDialog();
};

const authErrorMessages = {
  cancelled: 'Discord sign-in was cancelled.',
  not_member: 'You must be a member of the World War Z Discord server to use account features.',
  discord_unavailable: 'Discord verification is temporarily unavailable. Please try again shortly.',
  invalid_response: 'Discord returned an invalid sign-in response. Please try again.'
};

const callbackFragment = () => {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    loginTicket: params.get('login_ticket'),
    authError: params.get('auth_error')
  };
};

const clearCallbackFragment = () => {
  const returnView = storageGet(AUTH_RETURN_VIEW_KEY) || 'overview';
  storageRemove(AUTH_RETURN_VIEW_KEY);
  history.replaceState({ view: returnView }, '', `#${availableViews.has(returnView) ? returnView : 'overview'}`);
  return returnView;
};

const authFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, {
      cache: 'no-store',
      credentials: 'omit',
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

const loadCurrentAccount = async (sessionToken) => {
  try {
    const response = await authFetch(AUTH_ME_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return;
    }

    if (!response.ok) {
      applySignedOutState({ unavailable: true });
      return;
    }

    applyAuthenticatedState(await response.json());
  } catch (error) {
    applySignedOutState({ unavailable: true });
  }
};

const completeDiscordLogin = async (loginTicket) => {
  if (authRequestInProgress) return;
  authRequestInProgress = true;
  showAuthMessage('Finishing your secure Discord sign-in…', 'info');

  try {
    const response = await authFetch(AUTH_COMPLETE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticket: loginTicket })
    });
    const payload = await response.json();

    if (!response.ok || !payload.session_token) {
      throw new Error(payload.message || 'Unable to complete Discord sign-in');
    }

    if (!storageSet(AUTH_SESSION_KEY, payload.session_token)) {
      throw new Error('Browser session storage is unavailable');
    }

    applyAuthenticatedState(payload);
    const returnView = clearCallbackFragment();
    showView(returnView, false);
    showAuthMessage(`Signed in as ${payload.user.display_name || payload.user.username}.`, 'success');
  } catch (error) {
    storageRemove(AUTH_SESSION_KEY);
    const returnView = clearCallbackFragment();
    showView(returnView, false);
    applySignedOutState();
    showAuthMessage(error.message || 'Discord sign-in could not be completed.', 'error');
  } finally {
    authRequestInProgress = false;
  }
};

const configureDiscordAuth = async () => {
  try {
    const response = await authFetch(AUTH_CONFIG_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    const payload = await response.json();
    discordAuthEnabled = Boolean(response.ok && payload?.discord_auth?.enabled);
  } catch (error) {
    discordAuthEnabled = false;
  }

  if (discordAuthEnabled) {
    startDiscordLoginButton?.removeAttribute('disabled');
    if (startDiscordLoginButton) startDiscordLoginButton.textContent = 'Continue securely with Discord';
    if (authDialogNotice) authDialogNotice.querySelector('span').textContent = 'Your dashboard session lasts for this browser tab and expires automatically.';
  } else {
    startDiscordLoginButton?.setAttribute('disabled', '');
    if (startDiscordLoginButton) startDiscordLoginButton.textContent = 'Discord sign-in is being configured';
    if (authDialogNotice) authDialogNotice.querySelector('span').textContent = 'The live server status remains available while Discord sign-in is being configured.';
  }

  const fragment = callbackFragment();

  if (fragment.authError) {
    const returnView = clearCallbackFragment();
    showView(returnView, false);
    applySignedOutState();
    showAuthMessage(authErrorMessages[fragment.authError] || 'Discord sign-in could not be completed.', 'error');
    return;
  }

  if (fragment.loginTicket) {
    await completeDiscordLogin(fragment.loginTicket);
    return;
  }

  const sessionToken = storageGet(AUTH_SESSION_KEY);

  if (sessionToken && discordAuthEnabled) {
    await loadCurrentAccount(sessionToken);
  } else {
    applySignedOutState();
  }
};

startDiscordLoginButton?.addEventListener('click', () => {
  if (!discordAuthEnabled || authRequestInProgress) return;
  const activeView = document.querySelector('[data-view-panel].active')?.dataset.viewPanel || 'overview';
  storageSet(AUTH_RETURN_VIEW_KEY, activeView);
  window.location.assign(AUTH_LOGIN_URL);
});

signOutButton?.addEventListener('click', async () => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  storageRemove(AUTH_SESSION_KEY);
  applySignedOutState();
  showAuthMessage('You have been signed out of this dashboard tab.', 'success');

  if (!sessionToken) return;

  try {
    await authFetch(AUTH_LOGOUT_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });
  } catch (error) {
    // Local sign-out is complete even when Railway cannot be reached.
  }
});

const apiConnection = document.querySelector('[data-api-connection]');
const apiConnectionLabel = document.querySelector('[data-api-connection-label]');
const dashboardMode = document.querySelector('[data-dashboard-mode]');
const liveBanner = document.querySelector('[data-live-banner]');
const liveBannerTitle = document.querySelector('[data-live-banner-title]');
const liveBannerMessage = document.querySelector('[data-live-banner-message]');
const refreshStatusButton = document.querySelector('[data-refresh-status]');
let statusRequestInProgress = false;

const setText = (selector, value) => {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
};

const setStatusClass = (element, status) => {
  if (!element) return;
  element.classList.remove(...STATUS_CLASSES);
  element.classList.add(status);
};

const setConnectionState = (state, label) => {
  if (apiConnection) apiConnection.dataset.state = state;
  if (apiConnectionLabel) apiConnectionLabel.textContent = label;
};

const formatUpdatedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

const applyLiveStatus = (payload) => {
  if (!STATUS_LABELS[payload?.status] || !payload.server || !payload.players) {
    throw new Error('Unexpected server-status response');
  }

  const status = payload.status;
  const statusLabel = STATUS_LABELS[status];
  const currentPlayers = Math.max(0, Math.trunc(Number(payload.players.current) || 0));
  const maximumPlayers = Math.max(0, Math.trunc(Number(payload.players.maximum) || 0));
  const serverName = String(payload.server.name || 'World War Z');
  const serverMap = String(payload.server.map || 'Chernarus');
  const platform = String(payload.server.platform || 'PlayStation 4 & 5');
  const updatedAt = formatUpdatedAt(payload.updated_at);

  setConnectionState('online', 'Bot API connected');
  if (dashboardMode) dashboardMode.textContent = 'Live status';
  liveBanner?.classList.remove('degraded');
  liveBanner?.classList.add('live');
  if (liveBannerTitle) liveBannerTitle.textContent = 'Live public server status connected.';
  if (liveBannerMessage) {
    liveBannerMessage.textContent = 'Status, population, capacity, map and platform are supplied by the bot. Account, economy, player, staff and configuration areas remain preview-only.';
  }

  setText('[data-server-status]', statusLabel);
  setText('[data-server-status-note]', `Live status · updated ${updatedAt}`);
  setText('[data-status-label]', `${statusLabel} · Live`);
  setText('[data-server-name]', serverName);
  setText('[data-server-platform]', platform);
  setText('[data-server-map]', serverMap);
  setText('[data-server-capacity]', `${maximumPlayers} survivors`);
  setText('[data-live-updated-short]', updatedAt);
  setText('[data-live-updated]', updatedAt);
  setText('[data-detail-status]', statusLabel);
  setText('[data-detail-players]', `${currentPlayers} / ${maximumPlayers}`);
  setText('[data-detail-platform]', platform);
  setText('[data-detail-map]', serverMap);
  setText('[data-information-source]', 'Railway dashboard API · live');
  setText('[data-map-name]', serverMap.toUpperCase());
  setText('[data-map-server-name]', serverName);
  setText('[data-map-platform]', platform);

  document.querySelectorAll('[data-player-count]').forEach((element) => {
    element.replaceChildren(document.createTextNode(`${currentPlayers} `));
    const maximum = document.createElement('em');
    maximum.textContent = `/ ${maximumPlayers}`;
    element.append(maximum);
  });

  document.querySelectorAll('[data-server-status-badge], [data-live-status-class]').forEach((element) => {
    setStatusClass(element, status);
  });
  document.querySelectorAll('[data-detail-status]').forEach((element) => {
    element.classList.remove('online-text', 'restarting-text', 'offline-text', 'unavailable-text');
    element.classList.add(`${status}-text`);
  });
};

const showStatusUnavailable = () => {
  setConnectionState('unavailable', 'Bot API unavailable');
  if (dashboardMode) dashboardMode.textContent = 'Status unavailable';
  liveBanner?.classList.remove('live');
  liveBanner?.classList.add('degraded');
  if (liveBannerTitle) liveBannerTitle.textContent = 'Live status is temporarily unavailable.';
  if (liveBannerMessage) {
    liveBannerMessage.textContent = 'The website could not reach the public bot API. Try the refresh button shortly; no protected account or server controls are affected.';
  }

  setText('[data-server-status]', 'Unavailable');
  setText('[data-server-status-note]', 'Unable to reach the Railway API');
  setText('[data-status-label]', 'Status unavailable');
  setText('[data-live-updated-short]', 'Unavailable');
  setText('[data-live-updated]', 'Unable to refresh');
  setText('[data-detail-status]', 'Unavailable');
  setText('[data-information-source]', 'Railway API · connection unavailable');
  document.querySelectorAll('[data-server-status-badge], [data-live-status-class]').forEach((element) => {
    setStatusClass(element, 'unavailable');
  });
  document.querySelectorAll('[data-detail-status]').forEach((element) => {
    element.classList.remove('online-text', 'restarting-text', 'offline-text', 'unavailable-text');
    element.classList.add('unavailable-text');
  });
};

const refreshLiveStatus = async () => {
  if (statusRequestInProgress) return;
  statusRequestInProgress = true;
  refreshStatusButton?.classList.add('is-loading');
  refreshStatusButton?.setAttribute('aria-busy', 'true');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(SERVER_STATUS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    applyLiveStatus(await response.json());
  } catch (error) {
    showStatusUnavailable();
  } finally {
    window.clearTimeout(timeout);
    statusRequestInProgress = false;
    refreshStatusButton?.classList.remove('is-loading');
    refreshStatusButton?.removeAttribute('aria-busy');
  }
};

refreshStatusButton?.addEventListener('click', refreshLiveStatus);
refreshLiveStatus();
window.setInterval(refreshLiveStatus, LIVE_STATUS_REFRESH_MS);

const commands = [
  { name: 'bot', category: 'General', description: 'View bot information, status and help.', access: 'Everyone' },
  { name: 'server', category: 'Server', description: 'View current DayZ server information.', access: 'Everyone' },
  { name: 'account', category: 'Profiles', description: 'Manage your connected community account.', access: 'Member' },
  { name: 'profile', category: 'Profiles', description: 'View your linked community profile.', access: 'Member' },
  { name: 'pvp', category: 'Community', description: 'View PvP statistics and activity features.', access: 'Member' },
  { name: 'event', category: 'Events', description: 'Access community event tools and information.', access: 'Staff' },
  { name: 'economy', category: 'Economy', description: 'Access balances, rewards and economy features.', access: 'Member' },
  { name: 'coinflip', category: 'Games', description: 'Make a simple heads-or-tails economy wager.', access: 'Member' },
  { name: 'dice', category: 'Games', description: 'Place an economy wager on a dice roll.', access: 'Member' },
  { name: 'slots', category: 'Games', description: 'Play the World War Z community slot machine.', access: 'Member' },
  { name: 'roulette', category: 'Games', description: 'Play the community roulette game.', access: 'Member' },
  { name: 'jackpot', category: 'Games', description: 'Enter and view the community jackpot.', access: 'Member' },
  { name: 'blackjack', category: 'Games', description: 'Play a community economy blackjack game.', access: 'Member' },
  { name: 'mod', category: 'Staff', description: 'Access moderation cases, warnings and controls.', access: 'Staff' },
  { name: 'logs', category: 'Staff', description: 'Configure and inspect authorised bot logging.', access: 'Staff' },
  { name: 'ticket', category: 'Support', description: 'Open and manage structured support requests.', access: 'Member' },
  { name: 'nitrado', category: 'Server', description: 'Access approved Nitrado server information.', access: 'Owner' },
  { name: 'damagesettings', category: 'Server', description: 'View or manage DayZ damage settings.', access: 'Owner' },
  { name: 'restart', category: 'Server', description: 'Restart the DayZ server with owner controls.', access: 'Owner' },
  { name: 'start', category: 'Server', description: 'Start the DayZ server with owner controls.', access: 'Owner' },
  { name: 'stop', category: 'Server', description: 'Stop the DayZ server with owner controls.', access: 'Owner' },
  { name: 'player', category: 'Staff', description: 'Look up and administer a community player.', access: 'Staff' },
  { name: 'adm', category: 'Staff', description: 'Access ADM activity and intelligence tools.', access: 'Staff' },
  { name: 'bounty', category: 'Economy', description: 'View and manage community bounties.', access: 'Member' },
  { name: 'contract', category: 'Economy', description: 'View and manage community contracts.', access: 'Member' },
  { name: 'config', category: 'Configuration', description: 'Manage DayZ configuration operations.', access: 'Owner' },
  { name: 'loot', category: 'Configuration', description: 'Work with the server loot configuration.', access: 'Owner' },
  { name: 'eventconfig', category: 'Configuration', description: 'Review and manage event configuration.', access: 'Owner' },
  { name: 'eventpositions', category: 'Configuration', description: 'Manage configured event positions.', access: 'Owner' },
  { name: 'validation', category: 'Configuration', description: 'Validate configuration files before use.', access: 'Owner' }
];

const commandResults = document.querySelector('[data-command-results]');
const commandSearch = document.querySelector('[data-command-search]');
const commandFilters = document.querySelector('[data-command-filters]');
const commandCount = document.querySelector('[data-command-count]');
const commandEmpty = document.querySelector('[data-command-empty]');
const categories = ['All', ...new Set(commands.map((command) => command.category))];
let selectedCategory = 'All';

const renderFilters = () => {
  if (!commandFilters) return;
  commandFilters.replaceChildren();

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category;
    button.classList.toggle('active', category === selectedCategory);
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    button.addEventListener('click', () => {
      selectedCategory = category;
      renderFilters();
      renderCommands();
    });
    commandFilters.append(button);
  });
};

const renderCommands = () => {
  if (!commandResults) return;
  const searchValue = commandSearch?.value.trim().toLowerCase() ?? '';
  const visibleCommands = commands.filter((command) => {
    const matchesCategory = selectedCategory === 'All' || command.category === selectedCategory;
    const haystack = `${command.name} ${command.description} ${command.category} ${command.access}`.toLowerCase();
    return matchesCategory && haystack.includes(searchValue);
  });

  commandResults.replaceChildren();
  visibleCommands.forEach((command) => {
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
    commandResults.append(card);
  });

  if (commandCount) commandCount.textContent = visibleCommands.length;
  if (commandEmpty) commandEmpty.hidden = visibleCommands.length !== 0;
};

commandSearch?.addEventListener('input', renderCommands);
renderFilters();
renderCommands();
configureDiscordAuth();
showView(location.hash.slice(1), false);
