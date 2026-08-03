const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarScrim = document.querySelector('[data-sidebar-scrim]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const loginDialog = document.querySelector('[data-login-dialog]');
let dashboardAccessLevel = 'guest';

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

const canOpenView = (view) => {
  if (view === 'staff') return ['staff', 'owner'].includes(dashboardAccessLevel);
  if (view === 'configuration') return dashboardAccessLevel === 'owner';
  return true;
};

const showView = (view, updateHistory = true) => {
  const requestedView = availableViews.has(view) ? view : 'overview';
  const selectedView = canOpenView(requestedView) ? requestedView : 'overview';

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
  window.dispatchEvent(new CustomEvent('wwz:viewchange', { detail: { view: selectedView } }));
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
const ACCOUNT_SUMMARY_URL = `${DASHBOARD_API_BASE}/api/account/summary`;
const RESTART_SERVER_URL = `${DASHBOARD_API_BASE}/api/admin/server/restart`;
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
const restartDialog = document.querySelector('[data-restart-dialog]');
const restartForm = document.querySelector('[data-restart-form]');
const restartReasonInput = document.querySelector('[data-restart-reason]');
const confirmRestartButton = document.querySelector('[data-confirm-restart]');
const restartDialogMessage = document.querySelector('[data-restart-dialog-message]');
const restartButtons = [...document.querySelectorAll('[data-restart-server]')];
const restartCancelButtons = [...document.querySelectorAll('[data-restart-cancel]')];
let discordAuthEnabled = false;
let authenticatedUser = null;
let authRequestInProgress = false;
let restartRequestInProgress = false;

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
  if (level === 'staff') return 'Admin';
  return 'Member';
};

const hasRestartAccess = () => ['staff', 'owner'].includes(dashboardAccessLevel);

const syncRestartControls = () => {
  const enabled = hasRestartAccess() && !restartRequestInProgress;
  restartButtons.forEach((button) => {
    button.disabled = !enabled;
    button.classList.toggle('is-loading', restartRequestInProgress);
    button.setAttribute('aria-busy', String(restartRequestInProgress));
  });
  restartCancelButtons.forEach((button) => {
    button.disabled = restartRequestInProgress;
  });
  if (confirmRestartButton) {
    confirmRestartButton.disabled = !enabled;
    confirmRestartButton.textContent = restartRequestInProgress
      ? 'Submitting protected restart…'
      : 'Yes, restart server';
  }
};

const applyAccessVisibility = (level) => {
  dashboardAccessLevel = level;
  const hasAdminAccess = ['staff', 'owner'].includes(level);
  const hasOwnerAccess = level === 'owner';

  document.querySelectorAll('[data-staff-only]').forEach((element) => {
    element.hidden = !hasAdminAccess;
  });
  document.querySelectorAll('[data-owner-only]').forEach((element) => {
    element.hidden = !hasOwnerAccess;
  });

  syncRestartControls();

  const activeView = document.querySelector('[data-view-panel].active')?.dataset.viewPanel;
  if (activeView && !canOpenView(activeView)) showView('overview', false);
};

const resetMemberPanels = () => {
  document.querySelector('[data-profile-guest]')?.removeAttribute('hidden');
  document.querySelector('[data-profile-unlinked]')?.setAttribute('hidden', '');
  document.querySelector('[data-profile-content]')?.setAttribute('hidden', '');
  document.querySelector('[data-economy-guest]')?.removeAttribute('hidden');
  document.querySelector('[data-economy-unlinked]')?.setAttribute('hidden', '');
  document.querySelector('[data-economy-content]')?.setAttribute('hidden', '');
  document.querySelector('[data-profile-shortcut]')?.setAttribute('disabled', '');
  setText('[data-profile-shortcut-note]', 'Sign in required');
  setText('[data-account-balance]', '—');
  setText('[data-account-balance-note]', 'Discord connection required');
  setText('[data-profile-badge-label]', 'Sign in required');
  setText('[data-economy-badge-label]', 'Sign in required');
  setStatusClass(document.querySelector('[data-profile-badge]'), 'offline');
  setStatusClass(document.querySelector('[data-economy-badge]'), 'offline');
};

const setAuthBadgeState = (state, label) => {
  document.querySelectorAll('[data-auth-badge]').forEach((badge) => {
    setStatusClass(badge, state);
  });
  setText('[data-auth-badge-label]', label);
};

const applySignedOutState = ({ unavailable = false } = {}) => {
  authenticatedUser = null;
  applyAccessVisibility('guest');
  resetMemberPanels();
  setText('[data-auth-button-label]', 'Sign in with Discord');
  setText('[data-access-card-title]', 'Guest access');
  setText('[data-access-card-copy]', 'Sign in will securely verify your community access.');
  setText('[data-access-icon]', '⌁');
  setText('[data-auth-description]', unavailable
    ? 'Discord verification is temporarily unavailable. Your existing browser session has not been exposed.'
    : 'Discord sign-in securely verifies your World War Z membership and current access level.');
  setText('[data-auth-cta]', 'Connect Discord');
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
  const accessLevel = String(payload.membership.access_level || 'member');
  const displayName = String(payload.user.display_name || payload.user.username || 'Survivor');
  const username = String(payload.user.username || 'Discord account');
  const level = accessLabel(accessLevel);
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
  setText('[data-auth-description]', `Your Discord identity and ${level.toLowerCase()} access are verified. Your own profile and economy data are connected securely.`);
  setText('[data-auth-cta]', 'View account');
  setText('[data-welcome-copy]', `Signed in as ${displayName} with verified ${level.toLowerCase()} access.`);
  applyAccessVisibility(accessLevel);
  document.querySelector('[data-profile-guest]')?.setAttribute('hidden', '');
  document.querySelector('[data-economy-guest]')?.setAttribute('hidden', '');
  document.querySelector('[data-profile-shortcut]')?.removeAttribute('disabled');
  setText('[data-profile-shortcut-note]', 'View your survivor');
  setText('[data-profile-badge-label]', 'Loading your profile');
  setText('[data-economy-badge-label]', 'Loading your wallet');
  setStatusClass(document.querySelector('[data-profile-badge]'), 'loading');
  setStatusClass(document.querySelector('[data-economy-badge]'), 'loading');
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

const protectedActionFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 60_000);

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

const showRestartDialogMessage = (message, state = 'error') => {
  if (!restartDialogMessage) return;
  restartDialogMessage.textContent = message;
  restartDialogMessage.dataset.state = state;
  restartDialogMessage.hidden = false;
};

const resetRestartDialog = () => {
  restartForm?.reset();
  if (restartDialogMessage) {
    restartDialogMessage.hidden = true;
    restartDialogMessage.textContent = '';
    delete restartDialogMessage.dataset.state;
  }
  syncRestartControls();
};

const openRestartDialog = () => {
  if (!hasRestartAccess() || restartRequestInProgress) return;
  resetRestartDialog();
  if (typeof restartDialog?.showModal === 'function') restartDialog.showModal();
  else restartDialog?.setAttribute('open', '');
  window.setTimeout(() => restartReasonInput?.focus(), 0);
};

restartButtons.forEach((button) => {
  button.addEventListener('click', openRestartDialog);
});

restartCancelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!restartRequestInProgress) restartDialog?.close?.();
  });
});

restartDialog?.addEventListener('click', (event) => {
  if (event.target === restartDialog && !restartRequestInProgress) {
    restartDialog.close?.();
  }
});

restartDialog?.addEventListener('cancel', (event) => {
  if (restartRequestInProgress) event.preventDefault();
});

restartDialog?.addEventListener('close', () => {
  if (!restartRequestInProgress) resetRestartDialog();
});

restartForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (
    restartRequestInProgress
    || !hasRestartAccess()
  ) {
    return;
  }

  const sessionToken = storageGet(AUTH_SESSION_KEY);

  if (!sessionToken) {
    restartDialog?.close?.();
    applySignedOutState();
    showAuthMessage('Your dashboard session has expired. Sign in again before using Admin controls.', 'error');
    return;
  }

  restartRequestInProgress = true;
  syncRestartControls();
  showRestartDialogMessage('Railway is rechecking your Admin access and recording this request.', 'info');

  try {
    const response = await protectedActionFetch(RESTART_SERVER_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmation: 'RESTART',
        reason: restartReasonInput?.value.trim() || ''
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      restartDialog?.close?.();
      applySignedOutState();
      showAuthMessage(
        response.status === 403
          ? 'Your current Discord account does not have Admin access for this operation.'
          : 'Your dashboard session expired. Sign in again before using Admin controls.',
        'error'
      );
      return;
    }

    if (response.status === 429) {
      const retryAfter = Math.max(1, Number(payload.retry_after_seconds) || 1);
      showRestartDialogMessage(`The control centre is cooling down. Try again in about ${retryAfter} seconds.`);
      return;
    }

    if (response.status === 409) {
      showRestartDialogMessage(payload.message || 'Another protected server action is already in progress.');
      return;
    }

    if (!response.ok || payload.status !== 'accepted') {
      showRestartDialogMessage(payload.message || 'The restart request could not be completed safely.');
      return;
    }

    const auditNumber = Number(payload.audit_record_id);
    const successMessage = Number.isInteger(auditNumber)
      ? `Server restart accepted and recorded as audit #${auditNumber}.`
      : 'Server restart accepted and recorded by Railway.';

    restartDialog?.close?.();
    showAuthMessage(successMessage, 'success');
    setText('[data-restart-control-status]', 'Restart submitted · audit recorded');
    setText('[data-restart-status-note]', 'Restart request accepted');
    restartButtons.forEach((button) => button.classList.add('action-accepted'));
    window.setTimeout(refreshLiveStatus, 3_000);
    window.setTimeout(refreshLiveStatus, 15_000);
  } catch (error) {
    showRestartDialogMessage(
      error?.name === 'AbortError'
        ? 'Railway did not answer in time. Check server status before trying again.'
        : 'The protected Railway service could not be reached. No second request was sent.'
    );
  } finally {
    restartRequestInProgress = false;
    syncRestartControls();
  }
});

const formatMoney = (value) => {
  const amount = Math.max(0, Math.trunc(Number(value) || 0));
  return `$${new Intl.NumberFormat('en-AU').format(amount)}`;
};

const formatDuration = (value) => {
  const totalMinutes = Math.max(0, Math.trunc((Number(value) || 0) / 60));
  const days = Math.trunc(totalMinutes / 1440);
  const hours = Math.trunc((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const formatAccountDate = (value, fallback = 'Not recorded') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
};

const renderTransactions = (transactions) => {
  const list = document.querySelector('[data-economy-transactions]');
  const empty = document.querySelector('[data-economy-empty]');
  if (!list) return;

  list.replaceChildren();
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  empty?.toggleAttribute('hidden', safeTransactions.length !== 0);

  safeTransactions.forEach((transaction) => {
    const change = Math.trunc(Number(transaction.change) || 0);
    const item = document.createElement('li');
    const symbol = document.createElement('span');
    symbol.className = `activity-symbol ${change >= 0 ? 'green' : 'red'}`;
    symbol.textContent = change >= 0 ? '+' : '−';

    const content = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = String(transaction.details || transaction.command || 'Economy activity');
    const details = document.createElement('small');
    const signedChange = `${change >= 0 ? '+' : '−'}${formatMoney(Math.abs(change))}`;
    details.textContent = `${signedChange} · Balance ${formatMoney(transaction.balance_after)} · ${formatAccountDate(transaction.created_at)}`;
    content.append(title, details);
    item.append(symbol, content);
    list.append(item);
  });
};

const applyAccountSummary = (payload) => {
  const profile = payload?.profile;
  const economy = payload?.economy;
  if (!profile || !economy) throw new Error('Unexpected account-summary response');

  document.querySelector('[data-profile-guest]')?.setAttribute('hidden', '');
  document.querySelector('[data-economy-guest]')?.setAttribute('hidden', '');

  if (!profile.linked) {
    document.querySelector('[data-profile-unlinked]')?.removeAttribute('hidden');
    document.querySelector('[data-economy-unlinked]')?.removeAttribute('hidden');
    document.querySelector('[data-profile-content]')?.setAttribute('hidden', '');
    document.querySelector('[data-economy-content]')?.setAttribute('hidden', '');
    setText('[data-profile-badge-label]', 'Not linked');
    setText('[data-economy-badge-label]', 'Not linked');
    setText('[data-account-balance]', 'Not linked');
    setText('[data-account-balance-note]', 'Use /account link in Discord');
    setStatusClass(document.querySelector('[data-profile-badge]'), 'offline');
    setStatusClass(document.querySelector('[data-economy-badge]'), 'offline');
    return;
  }

  document.querySelector('[data-profile-unlinked]')?.setAttribute('hidden', '');
  document.querySelector('[data-economy-unlinked]')?.setAttribute('hidden', '');
  document.querySelector('[data-profile-content]')?.removeAttribute('hidden');
  document.querySelector('[data-economy-content]')?.removeAttribute('hidden');

  const pvp = profile.pvp || {};
  setText('[data-profile-psn]', String(profile.psn_id || 'Unknown survivor'));
  setText('[data-profile-status]', profile.online ? 'Online now' : 'Offline');
  setText('[data-profile-linked]', formatAccountDate(profile.linked_at));
  setText('[data-profile-playtime]', formatDuration(profile.playtime_seconds));
  setText('[data-profile-sessions]', new Intl.NumberFormat('en-AU').format(Number(profile.total_sessions) || 0));
  setText('[data-profile-kd]', Number(pvp.kd_ratio || 0).toFixed(2));
  setText('[data-profile-kills]', new Intl.NumberFormat('en-AU').format(Number(pvp.kills) || 0));
  setText('[data-profile-deaths]', new Intl.NumberFormat('en-AU').format(Number(pvp.deaths) || 0));
  setText('[data-profile-event-wins]', new Intl.NumberFormat('en-AU').format(Number(profile.event_wins) || 0));
  setText('[data-profile-flags]', new Intl.NumberFormat('en-AU').format(Number(profile.flags_captured) || 0));
  setText('[data-profile-first-joined]', formatAccountDate(profile.first_join));
  setText('[data-profile-last-seen]', profile.online ? 'Currently online' : formatAccountDate(profile.last_seen));
  setText('[data-profile-faction]', String(profile.faction || 'None'));
  setText('[data-profile-reputation]', new Intl.NumberFormat('en-AU').format(Number(profile.reputation) || 0));
  setText('[data-profile-streak]', new Intl.NumberFormat('en-AU').format(Number(pvp.current_streak) || 0));
  setText('[data-profile-longest]', pvp.longest_kill_metres == null ? 'Not recorded' : `${Number(pvp.longest_kill_metres).toFixed(1)} m`);
  setText('[data-profile-weapon]', String(pvp.favourite_weapon || 'Not recorded'));

  const onlineState = document.querySelector('[data-profile-online-state]');
  onlineState?.classList.toggle('online', Boolean(profile.online));
  setText('[data-profile-badge-label]', profile.online ? 'Verified · Online' : 'Verified survivor');
  setStatusClass(document.querySelector('[data-profile-badge]'), 'online');

  const heat = Math.max(0, Math.min(5, Math.trunc(Number(economy.heat) || 0)));
  const balance = formatMoney(economy.balance);
  setText('[data-economy-balance]', balance);
  setText('[data-economy-jackpot]', formatMoney(economy.community_jackpot));
  setText('[data-economy-heat]', `${'🔥'.repeat(heat)}${'○'.repeat(5 - heat)}`);
  setText('[data-economy-daily]', new Intl.NumberFormat('en-AU').format(Number(economy.daily_streak) || 0));
  setText('[data-economy-earned]', formatMoney(economy.total_earned));
  setText('[data-economy-spent]', formatMoney(economy.total_spent));
  setText('[data-economy-work]', new Intl.NumberFormat('en-AU').format(Number(economy.work_completed) || 0));
  setText('[data-economy-gambling]', `${Number(economy.gambling_wins) || 0} wins · ${Number(economy.gambling_losses) || 0} losses`);
  setText('[data-economy-crime]', `${Number(economy.crime_successes) || 0} successes · ${Number(economy.crime_failures) || 0} failures`);
  setText('[data-economy-protection]', economy.protection_until ? `Until ${formatAccountDate(economy.protection_until)}` : 'Inactive');
  setText('[data-economy-badge-label]', 'Live account');
  setStatusClass(document.querySelector('[data-economy-badge]'), 'online');
  setText('[data-account-balance]', balance);
  setText('[data-account-balance-note]', 'Your verified survivor wallet');
  renderTransactions(payload.recent_transactions);
};

const loadAccountSummary = async (sessionToken) => {
  try {
    const response = await authFetch(ACCOUNT_SUMMARY_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });

    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return false;
    }

    if (!response.ok) throw new Error('Account information is temporarily unavailable');
    applyAccountSummary(await response.json());
    return true;
  } catch (error) {
    setText('[data-profile-badge-label]', 'Data unavailable');
    setText('[data-economy-badge-label]', 'Data unavailable');
    setStatusClass(document.querySelector('[data-profile-badge]'), 'unavailable');
    setStatusClass(document.querySelector('[data-economy-badge]'), 'unavailable');
    showAuthMessage('You are signed in, but your profile and economy data could not be loaded. Please refresh shortly.', 'error');
    return false;
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
    await loadAccountSummary(sessionToken);
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
    await loadAccountSummary(payload.session_token);
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
    liveBannerMessage.textContent = 'Status, population, capacity, map and platform are supplied by the bot. Signed-in members can also load their own profile and economy data.';
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
  { name: 'event', category: 'Events', description: 'Access community event tools and information.', access: 'Admin' },
  { name: 'economy', category: 'Economy', description: 'Access balances, rewards and economy features.', access: 'Member' },
  { name: 'coinflip', category: 'Games', description: 'Make a simple heads-or-tails economy wager.', access: 'Member' },
  { name: 'dice', category: 'Games', description: 'Place an economy wager on a dice roll.', access: 'Member' },
  { name: 'slots', category: 'Games', description: 'Play the World War Z community slot machine.', access: 'Member' },
  { name: 'roulette', category: 'Games', description: 'Play the community roulette game.', access: 'Member' },
  { name: 'jackpot', category: 'Games', description: 'Enter and view the community jackpot.', access: 'Member' },
  { name: 'blackjack', category: 'Games', description: 'Play a community economy blackjack game.', access: 'Member' },
  { name: 'mod', category: 'Admin', description: 'Access moderation cases, warnings and controls.', access: 'Admin' },
  { name: 'logs', category: 'Admin', description: 'Configure and inspect authorised bot logging.', access: 'Admin' },
  { name: 'ticket', category: 'Support', description: 'Open and manage structured support requests.', access: 'Member' },
  { name: 'nitrado', category: 'Server', description: 'Access approved Nitrado server information.', access: 'Owner' },
  { name: 'damagesettings', category: 'Server', description: 'View or manage DayZ damage settings.', access: 'Owner' },
  { name: 'restart', category: 'Server', description: 'Restart the DayZ server with owner controls.', access: 'Owner' },
  { name: 'start', category: 'Server', description: 'Start the DayZ server with owner controls.', access: 'Owner' },
  { name: 'stop', category: 'Server', description: 'Stop the DayZ server with owner controls.', access: 'Owner' },
  { name: 'player', category: 'Admin', description: 'Look up and administer a community player.', access: 'Admin' },
  { name: 'adm', category: 'Admin', description: 'Access ADM activity and intelligence tools.', access: 'Admin' },
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
