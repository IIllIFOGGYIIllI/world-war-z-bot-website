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
const SERVER_ACTION_HISTORY_URL = `${DASHBOARD_API_BASE}/api/admin/server/actions`;
const ADMIN_PLAYER_SEARCH_URL = `${DASHBOARD_API_BASE}/api/admin/players/search`;
const ADMIN_PLAYER_DETAILS_URL = `${DASHBOARD_API_BASE}/api/admin/players/details`;
const ADMIN_PLAYER_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/players/action`;
const ADMIN_MODERATION_CASES_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/cases`;
const ADMIN_MODERATION_CASE_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/cases/action`;
const ADMIN_BANLISTS_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/banlists`;
const PLAYER_ACTIONS = {
  add_note: { mark: '≡', title: 'Add private staff note?', description: 'The note will be visible only inside protected Admin player administration.', warning: 'Private notes remain in the Railway database and are included in the player audit view.', reasonLabel: 'Private staff note', reasonHelp: '1–1,500 characters', submitLabel: 'Add private note' },
  update_note: { mark: '✎', title: 'Update this private staff note?', description: 'The selected note will be replaced with the revised staff-only text.', warning: 'The previous note text is retained inside the private Railway audit record.', reasonLabel: 'Updated private note', reasonHelp: '1–1,500 characters', submitLabel: 'Update private note' },
  add_warning: { mark: '!', title: 'Add an active warning?', description: 'This creates a Discord moderation case and updates the player warning count.', warning: 'The warning remains active until an Admin explicitly removes it.', reasonLabel: 'Warning reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Add warning' },
  edit_warning: { mark: '✎', title: 'Edit this active warning?', description: 'The selected active warning reason will be replaced with the revised reason.', warning: 'A related warning-edit case preserves who changed it and the previous reason remains in private audit metadata.', reasonLabel: 'Updated warning reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Update warning' },
  remove_warning: { mark: '−', title: 'Remove this warning?', description: 'The original warning will be marked removed and a linked removal case will be recorded.', warning: 'The warning history is preserved; this does not delete the original case.', reasonLabel: 'Removal reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Remove warning' },
  economy_adjust: { mark: '$', title: 'Adjust this player’s balance?', description: 'Choose whether to add, remove or set the verified economy balance.', warning: 'Every adjustment creates an economy transaction and permanent dashboard audit record.', reasonLabel: 'Adjustment reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Apply balance adjustment', economy: true },
  discord_kick: { mark: '↥', title: 'Kick this member from Discord?', description: 'The linked Discord member will be removed from the World War Z Discord server.', warning: 'They can rejoin later unless they are also banned.', reasonLabel: 'Kick reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Kick from Discord' },
  discord_ban: { mark: '⊘', title: 'Ban this member from Discord?', description: 'Choose a permanent ban or schedule an automatic unban through Railway.', warning: 'A numbered active case will remain open until it is manually reversed or automatically expires.', reasonLabel: 'Ban reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Ban from Discord', banSchedule: true },
  discord_unban: { mark: '♻', title: 'Unban this account from Discord?', description: 'The linked Discord account will be removed from the Discord server ban list.', warning: 'This allows the account to rejoin the Discord server.', reasonLabel: 'Unban reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Unban from Discord' },
  dayz_ban: { mark: '⊘', title: 'Ban this PlayStation ID from DayZ?', description: 'Choose a permanent Nitrado ban or schedule an automatic removal through Railway.', warning: 'This is a real Nitrado ban-list change linked to a numbered moderation case.', reasonLabel: 'DayZ ban reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Ban from DayZ', banSchedule: true },
  dayz_unban: { mark: '♻', title: 'Unban this PlayStation ID from DayZ?', description: 'Railway will remove the selected PlayStation ID from the Nitrado game ban list.', warning: 'The removal is permanent unless the player is banned again.', reasonLabel: 'DayZ unban reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Unban from DayZ' },
  unlink: { mark: '⌁', title: 'Unlink this Discord and PlayStation account?', description: 'The verified identity link will be removed after Railway stores a recovery snapshot.', warning: 'Economy and linked profile rows are removed from active use. Only the Owner can submit this action.', reasonLabel: 'Unlink reason', reasonHelp: 'Required · 3–1,000 characters', submitLabel: 'Create recovery snapshot and unlink' }
};
const SERVER_ACTIONS = {
  restart: {
    url: `${DASHBOARD_API_BASE}/api/admin/server/restart`,
    confirmation: 'RESTART',
    allowedStatuses: ['online'],
    mark: '↻',
    title: 'Restart the DayZ server?',
    description: 'This disconnects current players while Nitrado restarts the server. Confirm only when the server is safe to restart.',
    warning: 'Selecting Yes will immediately submit the protected restart request.',
    impact: 'Current players may be disconnected',
    confirmLabel: 'Yes, restart server'
  },
  stop: {
    url: `${DASHBOARD_API_BASE}/api/admin/server/stop`,
    confirmation: 'STOP',
    allowedStatuses: ['online'],
    mark: '■',
    title: 'Stop the DayZ server?',
    description: 'This takes the DayZ server offline and disconnects every current player. It will remain offline until an Admin starts it again.',
    warning: 'Selecting Yes will immediately submit the protected stop request.',
    impact: 'All current players will be disconnected',
    confirmLabel: 'Yes, stop server'
  },
  start: {
    url: `${DASHBOARD_API_BASE}/api/admin/server/start`,
    confirmation: 'START',
    allowedStatuses: ['offline'],
    mark: '▶',
    title: 'Start the DayZ server?',
    description: 'This asks Nitrado to bring the offline DayZ server back online. Startup can take several minutes.',
    warning: 'Selecting Yes will immediately submit the protected start request.',
    impact: 'Players must wait until Nitrado finishes starting',
    confirmLabel: 'Yes, start server'
  }
};
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
const serverActionDialog = document.querySelector('[data-server-action-dialog]');
const serverActionForm = document.querySelector('[data-server-action-form]');
const serverActionReasonInput = document.querySelector('[data-server-action-reason]');
const confirmServerActionButton = document.querySelector('[data-confirm-server-action]');
const serverActionDialogMessage = document.querySelector('[data-server-action-dialog-message]');
const serverActionTitle = document.querySelector('[data-server-action-title]');
const serverActionDescription = document.querySelector('[data-server-action-description]');
const serverActionWarning = document.querySelector('[data-server-action-warning]');
const serverActionImpact = document.querySelector('[data-server-action-impact]');
const serverActionMark = document.querySelector('[data-server-action-mark]');
const serverActionButtons = [...document.querySelectorAll('[data-server-action]')];
const serverActionCancelButtons = [...document.querySelectorAll('[data-server-action-cancel]')];
const serverActionHistory = document.querySelector('[data-server-action-history]');
const serverActionHistoryEmpty = document.querySelector('[data-server-action-history-empty]');
const serverActionHistoryError = document.querySelector('[data-server-action-history-error]');
const refreshServerActionsButton = document.querySelector('[data-refresh-server-actions]');
const moderationCaseList = document.querySelector('[data-moderation-case-list]');
const moderationCaseEmpty = document.querySelector('[data-moderation-case-empty]');
const moderationCaseError = document.querySelector('[data-moderation-case-error]');
const refreshModerationCasesButton = document.querySelector('[data-refresh-moderation-cases]');
const moderationCaseScope = document.querySelector('[data-moderation-case-scope]');
const moderationCaseDialog = document.querySelector('[data-moderation-case-dialog]');
const moderationCaseCloseButtons = [...document.querySelectorAll('[data-moderation-case-close]')];
const caseDialogMessage = document.querySelector('[data-case-dialog-message]');
const caseEvidenceList = document.querySelector('[data-case-evidence-list]');
const caseEvidenceEmpty = document.querySelector('[data-case-evidence-empty]');
const caseEvidenceType = document.querySelector('[data-case-evidence-type]');
const caseEvidenceReference = document.querySelector('[data-case-evidence-reference]');
const caseEvidenceSummary = document.querySelector('[data-case-evidence-summary]');
const caseEvidenceFields = document.querySelector('[data-case-evidence-fields]');
const caseEvidenceRemoveField = document.querySelector('[data-case-evidence-remove-field]');
const caseEvidenceRemoveReason = document.querySelector('[data-case-evidence-remove-reason]');
const caseEvidenceSubmit = document.querySelector('[data-case-evidence-submit]');
const caseEvidenceCancel = document.querySelector('[data-case-evidence-cancel]');
const caseEvidenceEditorTitle = document.querySelector('[data-case-evidence-editor-title]');
const caseReviewList = document.querySelector('[data-case-review-list]');
const caseReviewEmpty = document.querySelector('[data-case-review-empty]');
const caseReviewStart = document.querySelector('[data-case-review-start]');
const caseReviewDecision = document.querySelector('[data-case-review-decision]');
const caseReviewType = document.querySelector('[data-case-review-type]');
const caseReviewSourceField = document.querySelector('[data-case-review-source-field]');
const caseReviewSource = document.querySelector('[data-case-review-source]');
const caseReviewReason = document.querySelector('[data-case-review-reason]');
const caseReviewStartButton = document.querySelector('[data-case-review-start-button]');
const caseReviewOutcome = document.querySelector('[data-case-review-outcome]');
const caseReviewReductionField = document.querySelector('[data-case-review-reduction-field]');
const caseReviewExpiry = document.querySelector('[data-case-review-expiry]');
const caseReviewDecisionReason = document.querySelector('[data-case-review-decision-reason]');
const caseReviewDecide = document.querySelector('[data-case-review-decide]');
const discordBanlist = document.querySelector('[data-discord-banlist-list]');
const discordBanlistEmpty = document.querySelector('[data-discord-banlist-empty]');
const discordBanlistError = document.querySelector('[data-discord-banlist-error]');
const dayzBanlist = document.querySelector('[data-dayz-banlist-list]');
const dayzBanlistEmpty = document.querySelector('[data-dayz-banlist-empty]');
const dayzBanlistError = document.querySelector('[data-dayz-banlist-error]');
const refreshBanlistsButton = document.querySelector('[data-refresh-banlists]');
const banlistChecked = document.querySelector('[data-banlist-checked]');
const adminPlayerSearchForm = document.querySelector('[data-admin-player-search-form]');
const adminPlayerSearchInput = document.querySelector('[data-admin-player-search-input]');
const adminPlayerSearchButton = document.querySelector('[data-admin-player-search-button]');
const adminPlayerSearchState = document.querySelector('[data-admin-player-search-state]');
const adminPlayerResults = document.querySelector('[data-admin-player-results]');
const adminPlayerEmpty = document.querySelector('[data-admin-player-empty]');
const adminPlayerError = document.querySelector('[data-admin-player-error]');
const adminPlayerDetail = document.querySelector('[data-admin-player-detail]');
const adminPlayerModerationHistory = document.querySelector('[data-admin-player-moderation-history]');
const adminPlayerModerationEmpty = document.querySelector('[data-admin-player-moderation-empty]');
const adminPlayerNotes = document.querySelector('[data-admin-player-notes]');
const adminPlayerNotesEmpty = document.querySelector('[data-admin-player-notes-empty]');
const adminPlayerActiveWarnings = document.querySelector('[data-admin-player-active-warnings]');
const adminPlayerWarningsEmpty = document.querySelector('[data-admin-player-warnings-empty]');
const adminPlayerDayzBans = document.querySelector('[data-admin-player-dayz-bans]');
const adminPlayerDayzBansEmpty = document.querySelector('[data-admin-player-dayz-bans-empty]');
const adminPlayerActionHistory = document.querySelector('[data-admin-player-action-history]');
const adminPlayerActionHistoryEmpty = document.querySelector('[data-admin-player-action-history-empty]');
const playerActionButtons = [...document.querySelectorAll('[data-player-action]')];
const playerActionDialog = document.querySelector('[data-player-action-dialog]');
const playerActionForm = document.querySelector('[data-player-action-form]');
const playerActionTitle = document.querySelector('[data-player-action-title]');
const playerActionDescription = document.querySelector('[data-player-action-description]');
const playerActionWarning = document.querySelector('[data-player-action-warning]');
const playerActionMark = document.querySelector('[data-player-action-mark]');
const playerActionReason = document.querySelector('[data-player-action-reason]');
const playerActionReasonLabel = document.querySelector('[data-player-action-reason-label]');
const playerActionReasonHelp = document.querySelector('[data-player-action-reason-help]');
const playerActionTarget = document.querySelector('[data-player-action-target]');
const playerActionEconomyFields = document.querySelector('[data-player-action-economy-fields]');
const playerActionEconomyOperation = document.querySelector('[data-player-action-economy-operation]');
const playerActionAmount = document.querySelector('[data-player-action-amount]');
const playerActionBanFields = document.querySelector('[data-player-action-ban-fields]');
const playerActionBanDuration = document.querySelector('[data-player-action-ban-duration]');
const playerActionCustomExpiry = document.querySelector('[data-player-action-custom-expiry]');
const playerActionExpiry = document.querySelector('[data-player-action-expiry]');
const playerActionDialogMessage = document.querySelector('[data-player-action-dialog-message]');
const confirmPlayerActionButton = document.querySelector('[data-confirm-player-action]');
const playerActionCancelButtons = [...document.querySelectorAll('[data-player-action-cancel]')];
let discordAuthEnabled = false;
let authenticatedUser = null;
let authRequestInProgress = false;
let currentServerStatus = 'unavailable';
let selectedServerAction = null;
let serverActionRequestInProgress = false;
let serverActionLockedUntil = 0;
let serverActionLockTimer = null;
let serverActionHistoryRequestInProgress = false;
let moderationCaseRequestInProgress = false;
let moderationCaseDetailRequestInProgress = false;
let moderationCaseActionRequestInProgress = false;
let selectedModerationCase = null;
let selectedCaseEvidenceId = null;
let caseEvidenceMode = 'add';
let banlistRequestInProgress = false;
let adminPlayerSearchRequestInProgress = false;
let adminPlayerDetailRequestInProgress = false;
let selectedAdminPlayer = null;
let selectedPlayerAction = null;
let selectedWarningCaseId = null;
let selectedNoteId = null;
let playerActionRequestInProgress = false;

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

const hasServerActionAccess = () => ['staff', 'owner'].includes(dashboardAccessLevel);

const serverActionIsAllowed = (action) => {
  const specification = SERVER_ACTIONS[action];
  return Boolean(
    specification
    && hasServerActionAccess()
    && !serverActionRequestInProgress
    && Date.now() >= serverActionLockedUntil
    && specification.allowedStatuses.includes(currentServerStatus)
  );
};

const serverActionNote = (action) => {
  if (serverActionRequestInProgress) return 'Protected request in progress';
  if (Date.now() < serverActionLockedUntil) return 'Control centre cooldown active';
  if (currentServerStatus === 'unavailable') return 'Live server state unavailable';
  if (currentServerStatus === 'restarting') return 'Server state is currently changing';
  if (action === 'start') {
    return currentServerStatus === 'offline'
      ? 'Confirmation and audit logging active'
      : 'Server is already online';
  }
  return currentServerStatus === 'online'
    ? 'Confirmation and audit logging active'
    : 'Server must be online';
};

const syncServerActionControls = () => {
  serverActionButtons.forEach((button) => {
    const action = button.dataset.serverAction;
    const enabled = serverActionIsAllowed(action);
    button.disabled = !enabled;
    button.classList.toggle('is-loading', serverActionRequestInProgress);
    button.setAttribute('aria-busy', String(serverActionRequestInProgress));
    const note = button.querySelector('[data-server-action-note]');
    if (note) note.textContent = serverActionNote(action);
  });

  serverActionCancelButtons.forEach((button) => {
    button.disabled = serverActionRequestInProgress;
  });

  const selected = SERVER_ACTIONS[selectedServerAction];
  if (confirmServerActionButton) {
    confirmServerActionButton.disabled = !selected || !serverActionIsAllowed(selectedServerAction);
    confirmServerActionButton.textContent = serverActionRequestInProgress
      ? `Submitting protected ${selectedServerAction || 'server'} request…`
      : selected?.confirmLabel || 'Yes, continue';
  }

  const controlStatus = document.querySelector('[data-server-control-status]');
  if (controlStatus) {
    controlStatus.textContent = serverActionRequestInProgress
      ? 'Protected request in progress'
      : currentServerStatus === 'unavailable'
        ? 'Admin verified · live state unavailable'
        : currentServerStatus === 'restarting'
          ? 'Admin verified · server state changing'
          : 'Admin verified · controls connected';
  }
};

const lockServerActions = (seconds) => {
  const duration = Math.max(1, Number(seconds) || 1) * 1000;
  serverActionLockedUntil = Math.max(serverActionLockedUntil, Date.now() + duration);
  if (serverActionLockTimer) window.clearTimeout(serverActionLockTimer);
  serverActionLockTimer = window.setTimeout(() => {
    serverActionLockTimer = null;
    syncServerActionControls();
  }, Math.max(0, serverActionLockedUntil - Date.now()) + 50);
  syncServerActionControls();
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

  syncServerActionControls();
  if (!hasAdminAccess) resetAdminPlayerAdministration();

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

const showServerActionDialogMessage = (message, state = 'error') => {
  if (!serverActionDialogMessage) return;
  serverActionDialogMessage.textContent = message;
  serverActionDialogMessage.dataset.state = state;
  serverActionDialogMessage.hidden = false;
};

const resetServerActionDialog = ({ clearSelection = false } = {}) => {
  serverActionForm?.reset();
  if (serverActionDialogMessage) {
    serverActionDialogMessage.hidden = true;
    serverActionDialogMessage.textContent = '';
    delete serverActionDialogMessage.dataset.state;
  }
  if (clearSelection) selectedServerAction = null;
  syncServerActionControls();
};

const openServerActionDialog = (action) => {
  const specification = SERVER_ACTIONS[action];
  if (!specification || !serverActionIsAllowed(action)) return;

  selectedServerAction = action;
  resetServerActionDialog();
  if (serverActionTitle) serverActionTitle.textContent = specification.title;
  if (serverActionDescription) serverActionDescription.textContent = specification.description;
  if (serverActionWarning) serverActionWarning.textContent = specification.warning;
  if (serverActionImpact) serverActionImpact.textContent = specification.impact;
  if (serverActionMark) serverActionMark.textContent = specification.mark;
  syncServerActionControls();

  if (typeof serverActionDialog?.showModal === 'function') serverActionDialog.showModal();
  else serverActionDialog?.setAttribute('open', '');
  window.setTimeout(() => serverActionReasonInput?.focus(), 0);
};

serverActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openServerActionDialog(button.dataset.serverAction);
  });
});

serverActionCancelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!serverActionRequestInProgress) serverActionDialog?.close?.();
  });
});

serverActionDialog?.addEventListener('click', (event) => {
  if (event.target === serverActionDialog && !serverActionRequestInProgress) {
    serverActionDialog.close?.();
  }
});

serverActionDialog?.addEventListener('cancel', (event) => {
  if (serverActionRequestInProgress) event.preventDefault();
});

serverActionDialog?.addEventListener('close', () => {
  if (!serverActionRequestInProgress) resetServerActionDialog({ clearSelection: true });
});

serverActionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const action = selectedServerAction;
  const specification = SERVER_ACTIONS[action];
  if (!specification || !serverActionIsAllowed(action)) return;

  const sessionToken = storageGet(AUTH_SESSION_KEY);

  if (!sessionToken) {
    serverActionDialog?.close?.();
    applySignedOutState();
    showAuthMessage('Your dashboard session has expired. Sign in again before using Admin controls.', 'error');
    return;
  }

  serverActionRequestInProgress = true;
  syncServerActionControls();
  showServerActionDialogMessage('Railway is rechecking your Admin access, live server state and audit record.', 'info');

  try {
    const response = await protectedActionFetch(specification.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmation: specification.confirmation,
        reason: serverActionReasonInput?.value.trim() || ''
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      serverActionDialog?.close?.();
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
      lockServerActions(retryAfter);
      showServerActionDialogMessage(`The control centre is cooling down. Try again in about ${retryAfter} seconds.`);
      return;
    }

    if (response.status === 409) {
      showServerActionDialogMessage(payload.message || 'Another protected server action is already in progress.');
      window.setTimeout(refreshLiveStatus, 1_000);
      return;
    }

    if (!response.ok || payload.status !== 'accepted' || payload.action !== action) {
      showServerActionDialogMessage(payload.message || `The ${action} request could not be completed safely.`);
      return;
    }

    const auditNumber = Number(payload.audit_record_id);
    const successMessage = Number.isInteger(auditNumber)
      ? `Server ${action} accepted and recorded as audit #${auditNumber}.`
      : `Server ${action} accepted and recorded by Railway.`;

    lockServerActions(30);
    serverActionDialog?.close?.();
    showAuthMessage(successMessage, 'success');
    const submittedButton = serverActionButtons.find((button) => button.dataset.serverAction === action);
    submittedButton?.classList.add('action-accepted');
    window.setTimeout(() => submittedButton?.classList.remove('action-accepted'), 30_000);
    window.setTimeout(() => loadServerActionHistory(sessionToken), 1_000);
    window.setTimeout(refreshLiveStatus, 3_000);
    window.setTimeout(refreshLiveStatus, 15_000);
    window.setTimeout(refreshLiveStatus, 32_000);
  } catch (error) {
    showServerActionDialogMessage(
      error?.name === 'AbortError'
        ? 'Railway did not answer in time. Check server status before trying again.'
        : 'The protected Railway service could not be reached. No second request was sent.'
    );
  } finally {
    serverActionRequestInProgress = false;
    syncServerActionControls();
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

const titleCaseState = (value) => String(value || 'unknown')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const renderServerActionHistory = (actions) => {
  if (!serverActionHistory) return;
  serverActionHistory.replaceChildren();
  const safeActions = Array.isArray(actions) ? actions : [];

  safeActions.forEach((record) => {
    const item = document.createElement('li');
    const symbol = document.createElement('span');
    const details = document.createElement('div');
    const title = document.createElement('strong');
    const meta = document.createElement('small');
    const outcome = document.createElement('span');
    const action = ['start', 'stop', 'restart'].includes(record?.action)
      ? record.action
      : 'server action';
    const result = ['accepted', 'rejected', 'pending'].includes(record?.outcome)
      ? record.outcome
      : 'rejected';
    const reason = record?.reason ? ` · ${String(record.reason)}` : '';

    symbol.className = `activity-symbol ${result === 'accepted' ? 'green' : result === 'rejected' ? 'red' : ''}`;
    symbol.textContent = action === 'start' ? '▶' : action === 'stop' ? '■' : '↻';
    title.textContent = `${titleCaseState(action)} requested by ${String(record?.requested_by || 'Administrator')}`;
    meta.textContent = `${formatUpdatedAt(record?.requested_at)} · ${titleCaseState(record?.state_before)} → ${titleCaseState(record?.state_after)}${reason}`;
    outcome.className = `audit-outcome ${result}`;
    outcome.textContent = result;
    details.append(title, meta);
    item.append(symbol, details, outcome);
    serverActionHistory.append(item);
  });

  serverActionHistory.hidden = safeActions.length === 0;
  if (serverActionHistoryEmpty) serverActionHistoryEmpty.hidden = safeActions.length !== 0;
  if (serverActionHistoryError) serverActionHistoryError.hidden = true;
};

const loadServerActionHistory = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!hasServerActionAccess() || !sessionToken || serverActionHistoryRequestInProgress) return;
  serverActionHistoryRequestInProgress = true;
  refreshServerActionsButton?.setAttribute('disabled', '');
  refreshServerActionsButton?.setAttribute('aria-busy', 'true');

  try {
    const response = await authFetch(SERVER_ACTION_HISTORY_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error('History unavailable');
    renderServerActionHistory(payload.actions);
  } catch (error) {
    if (serverActionHistory) serverActionHistory.hidden = true;
    if (serverActionHistoryEmpty) serverActionHistoryEmpty.hidden = true;
    if (serverActionHistoryError) serverActionHistoryError.hidden = false;
  } finally {
    serverActionHistoryRequestInProgress = false;
    refreshServerActionsButton?.removeAttribute('disabled');
    refreshServerActionsButton?.removeAttribute('aria-busy');
  }
};

refreshServerActionsButton?.addEventListener('click', () => loadServerActionHistory());

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

const setAdminPlayerSearchState = (message, state = 'idle') => {
  if (!adminPlayerSearchState) return;
  adminPlayerSearchState.textContent = message;
  adminPlayerSearchState.dataset.state = state;
};

const showPlayerActionDialogMessage = (message, state = 'error') => {
  if (!playerActionDialogMessage) return;
  playerActionDialogMessage.textContent = message;
  playerActionDialogMessage.dataset.state = state;
  playerActionDialogMessage.hidden = false;
};

const resetPlayerActionDialog = ({ clearSelection = false } = {}) => {
  playerActionForm?.reset();
  if (playerActionEconomyFields) playerActionEconomyFields.hidden = true;
  if (playerActionBanFields) playerActionBanFields.hidden = true;
  if (playerActionCustomExpiry) playerActionCustomExpiry.hidden = true;
  if (playerActionBanDuration) playerActionBanDuration.value = 'permanent';
  if (playerActionExpiry) playerActionExpiry.value = '';
  if (playerActionDialogMessage) {
    playerActionDialogMessage.hidden = true;
    playerActionDialogMessage.textContent = '';
    delete playerActionDialogMessage.dataset.state;
  }
  if (clearSelection) {
    selectedPlayerAction = null;
    selectedWarningCaseId = null;
    selectedNoteId = null;
  }
};

const playerActionIsAllowed = (action) => {
  const specification = PLAYER_ACTIONS[action];
  if (!specification || !selectedAdminPlayer || !hasServerActionAccess() || playerActionRequestInProgress) return false;
  if (action === 'unlink' && dashboardAccessLevel !== 'owner') return false;
  if (['add_warning', 'discord_kick', 'discord_ban', 'discord_unban', 'unlink'].includes(action) && !selectedAdminPlayer.linked) return false;
  if (action === 'economy_adjust' && !selectedAdminPlayer.economyAvailable) return false;
  if (action === 'discord_ban' && selectedAdminPlayer.discordBanned) return false;
  if (action === 'dayz_ban' && selectedAdminPlayer.dayzBanned) return false;
  if (action === 'dayz_unban' && !selectedAdminPlayer.dayzBanned) return false;
  if (['edit_warning', 'remove_warning'].includes(action) && !Number.isInteger(Number(selectedWarningCaseId))) return false;
  if (action === 'update_note' && !Number.isInteger(Number(selectedNoteId))) return false;
  return true;
};

const syncPlayerActionControls = () => {
  playerActionButtons.forEach((button) => {
    const action = button.dataset.playerAction;
    button.disabled = !playerActionIsAllowed(action);
    button.classList.toggle('is-loading', playerActionRequestInProgress);
    button.setAttribute('aria-busy', String(playerActionRequestInProgress));
  });
  playerActionCancelButtons.forEach((button) => {
    button.disabled = playerActionRequestInProgress;
  });
  const specification = PLAYER_ACTIONS[selectedPlayerAction];
  if (confirmPlayerActionButton) {
    confirmPlayerActionButton.disabled = !playerActionIsAllowed(selectedPlayerAction);
    confirmPlayerActionButton.textContent = playerActionRequestInProgress
      ? 'Submitting protected player action…'
      : specification?.submitLabel || 'Confirm protected action';
  }
};

const closePlayerActionDialog = () => {
  if (typeof playerActionDialog?.close === 'function') playerActionDialog.close();
  else playerActionDialog?.removeAttribute('open');
};

const resetAdminPlayerAdministration = () => {
  adminPlayerSearchRequestInProgress = false;
  adminPlayerDetailRequestInProgress = false;
  selectedAdminPlayer = null;
  selectedPlayerAction = null;
  selectedWarningCaseId = null;
  selectedNoteId = null;
  playerActionRequestInProgress = false;
  if (adminPlayerSearchInput) adminPlayerSearchInput.value = '';
  adminPlayerSearchButton?.removeAttribute('disabled');
  adminPlayerSearchButton?.removeAttribute('aria-busy');
  adminPlayerResults?.replaceChildren();
  adminPlayerNotes?.replaceChildren();
  adminPlayerActiveWarnings?.replaceChildren();
  adminPlayerModerationHistory?.replaceChildren();
  adminPlayerDayzBans?.replaceChildren();
  adminPlayerActionHistory?.replaceChildren();
  discordBanlist?.replaceChildren();
  dayzBanlist?.replaceChildren();
  if (discordBanlistEmpty) discordBanlistEmpty.hidden = true;
  if (discordBanlistError) discordBanlistError.hidden = true;
  if (dayzBanlistEmpty) dayzBanlistEmpty.hidden = true;
  if (dayzBanlistError) dayzBanlistError.hidden = true;
  setText('[data-discord-banlist-count]', '—');
  setText('[data-dayz-banlist-count]', '—');
  if (banlistChecked) banlistChecked.textContent = 'Ban lists have not been refreshed during this session.';
  adminPlayerDetail?.setAttribute('hidden', '');
  if (adminPlayerEmpty) adminPlayerEmpty.hidden = true;
  if (adminPlayerError) adminPlayerError.hidden = true;
  if (adminPlayerNotesEmpty) adminPlayerNotesEmpty.hidden = true;
  if (adminPlayerWarningsEmpty) adminPlayerWarningsEmpty.hidden = true;
  if (adminPlayerModerationEmpty) adminPlayerModerationEmpty.hidden = true;
  if (adminPlayerDayzBansEmpty) adminPlayerDayzBansEmpty.hidden = true;
  if (adminPlayerActionHistoryEmpty) adminPlayerActionHistoryEmpty.hidden = true;
  resetPlayerActionDialog({ clearSelection: true });
  closePlayerActionDialog();
  syncPlayerActionControls();
  setAdminPlayerSearchState('Enter at least three characters to search.');
};

const handleAdminPlayerAuthorizationResponse = (
  response,
  payload = {},
  { actionRequest = false } = {}
) => {
  if (response.status === 401) {
    storageRemove(AUTH_SESSION_KEY);
    applySignedOutState();
    showView('overview', false);
    showAuthMessage('Your dashboard session expired. Sign in again to continue.', 'error');
    return true;
  }

  const explicitAdminAccessFailure =
    response.status === 403 && payload?.error_code === 'admin_access_required';
  const readEndpointAdminFailure = response.status === 403 && !actionRequest;

  if (explicitAdminAccessFailure || readEndpointAdminFailure) {
    if (authenticatedUser?.membership) authenticatedUser.membership.access_level = 'member';
    applyAccessVisibility('member');
    showView('overview', false);
    showAuthMessage('Your current Discord account no longer has Admin access.', 'error');
    return true;
  }

  return false;
};

const renderAdminPlayerResults = (players) => {
  if (!adminPlayerResults) return;
  const safePlayers = Array.isArray(players) ? players : [];
  adminPlayerResults.replaceChildren();
  if (adminPlayerEmpty) adminPlayerEmpty.hidden = safePlayers.length !== 0;
  if (adminPlayerError) adminPlayerError.hidden = true;

  safePlayers.forEach((player) => {
    const psnId = String(player?.psn_id || '').trim();
    if (!psnId) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-player-result';

    const copy = document.createElement('span');
    const title = document.createElement('strong');
    const detail = document.createElement('small');
    title.textContent = psnId;
    detail.textContent = player.linked
      ? `${String(player.discord_name || 'Discord name unavailable')} · ${player.online ? 'Online now' : `Last seen ${formatAccountDate(player.last_seen)}`}`
      : `Unlinked DayZ player · Last seen ${formatAccountDate(player.last_seen)}`;
    copy.append(title, detail);

    const state = document.createElement('span');
    state.className = `result-state ${player.online ? 'online' : player.linked ? '' : 'unlinked'}`;
    state.textContent = player.online ? 'Online' : player.linked ? 'Linked' : 'Unlinked';

    button.append(copy, state);
    button.addEventListener('click', () => loadAdminPlayerDetails(psnId));
    adminPlayerResults.append(button);
  });
};

const appendAdminActivity = (list, { symbolText, symbolClass = '', titleText, detailText, actionButton = null, actionButtons = [] }) => {
  if (!list) return;
  const item = document.createElement('li');
  const symbol = document.createElement('span');
  const content = document.createElement('div');
  const title = document.createElement('strong');
  const details = document.createElement('small');

  symbol.className = `activity-symbol ${symbolClass}`.trim();
  symbol.textContent = symbolText;
  title.textContent = titleText;
  details.textContent = detailText;
  content.append(title, details);
  item.append(symbol, content);
  const safeButtons = [...(Array.isArray(actionButtons) ? actionButtons : []), ...(actionButton ? [actionButton] : [])];
  if (safeButtons.length) {
    item.classList.add('has-row-actions');
    const actions = document.createElement('div');
    actions.className = 'activity-row-actions';
    actions.append(...safeButtons);
    item.append(actions);
  }
  list.append(item);
};

const renderModerationCases = (payload) => {
  const scope = String(payload?.scope || moderationCaseScope?.value || 'active');
  const cases = Array.isArray(payload?.cases) ? payload.cases : [];
  const summary = payload?.summary || {};
  setText('[data-moderation-case-active]', String(Number(summary.active_cases) || 0));
  setText('[data-moderation-case-temporary]', String(Number(summary.temporary_bans) || 0));
  setText('[data-moderation-case-expiring]', String(Number(summary.expiring_within_24_hours) || 0));
  setText('[data-moderation-case-reviewing]', String(Number(summary.under_review) || 0));
  setText('[data-moderation-case-appealed]', String(Number(summary.appealed) || 0));
  if (!moderationCaseList) return;

  moderationCaseList.replaceChildren();
  cases.forEach((record) => {
    const caseId = Number(record?.case_id);
    const action = String(record?.action || 'record');
    const status = String(record?.status || 'completed');
    const psn = String(record?.psn_id || record?.target_name || 'Player');
    const permanent = ['ban', 'dayz_ban'].includes(action) && !record?.expires_at;
    const schedule = record?.expires_at
      ? `Expires ${formatAccountDate(record.expires_at)}`
      : permanent
        ? 'Permanent until manually reversed'
        : record?.duration_seconds != null
          ? `Duration ${formatDuration(record.duration_seconds)}`
          : 'No scheduled expiry';
    const openButton = document.createElement('button');
    openButton.type = 'button';
    openButton.className = 'activity-row-action';
    openButton.textContent = 'Open case';
    openButton.disabled = !Number.isInteger(caseId);
    openButton.addEventListener('click', () => openModerationCase(caseId));
    const evidenceCount = Math.max(0, Number(record?.evidence_count) || 0);
    const reviewState = record?.review_status
      ? ` · ${titleCaseState(record.review_type || 'review')} ${titleCaseState(record.review_status)}`
      : '';
    appendAdminActivity(moderationCaseList, {
      symbolText: action.includes('ban') ? '⊘' : action === 'warn' ? '!' : '≡',
      symbolClass: action.includes('ban') ? 'red' : action === 'warn' ? 'warning' : '',
      titleText: `Case #${Number.isInteger(caseId) ? caseId : '—'} · ${titleCaseState(action)} · ${titleCaseState(status)}`,
      detailText: `${psn} · ${String(record?.reason || 'No reason recorded')} · ${schedule} · ${evidenceCount} active evidence${reviewState} · Opened by ${String(record?.moderator_name || 'Administrator')} on ${formatAccountDate(record?.created_at)}`,
      actionButton: openButton
    });
  });

  moderationCaseList.hidden = cases.length === 0;
  setText('[data-moderation-case-heading]', scope === 'recent' ? 'Recent moderation cases' : 'Active moderation cases');
  if (moderationCaseEmpty) {
    moderationCaseEmpty.hidden = cases.length !== 0;
    moderationCaseEmpty.textContent = scope === 'recent'
      ? 'No moderation cases have been recorded.'
      : 'No active moderation cases are recorded.';
  }
  if (moderationCaseError) moderationCaseError.hidden = true;
};

const loadModerationCases = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!hasServerActionAccess() || !sessionToken || moderationCaseRequestInProgress) return;
  moderationCaseRequestInProgress = true;
  refreshModerationCasesButton?.setAttribute('disabled', '');
  refreshModerationCasesButton?.setAttribute('aria-busy', 'true');

  try {
    const scope = moderationCaseScope?.value === 'recent' ? 'recent' : 'active';
    const response = await authFetch(`${ADMIN_MODERATION_CASES_URL}?scope=${scope}&limit=25`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error('Moderation cases unavailable');
    renderModerationCases(payload);
  } catch (error) {
    if (moderationCaseList) moderationCaseList.hidden = true;
    if (moderationCaseEmpty) moderationCaseEmpty.hidden = true;
    if (moderationCaseError) moderationCaseError.hidden = false;
    setText('[data-moderation-case-active]', '—');
    setText('[data-moderation-case-temporary]', '—');
    setText('[data-moderation-case-expiring]', '—');
    setText('[data-moderation-case-reviewing]', '—');
    setText('[data-moderation-case-appealed]', '—');
  } finally {
    moderationCaseRequestInProgress = false;
    refreshModerationCasesButton?.removeAttribute('disabled');
    refreshModerationCasesButton?.removeAttribute('aria-busy');
  }
};

refreshModerationCasesButton?.addEventListener('click', () => loadModerationCases());
moderationCaseScope?.addEventListener('change', () => loadModerationCases());

const showCaseDialogMessage = (message = '', tone = 'error') => {
  if (!caseDialogMessage) return;
  caseDialogMessage.hidden = !message;
  caseDialogMessage.textContent = message;
  caseDialogMessage.dataset.tone = tone;
};

const closeModerationCaseDialog = () => {
  if (moderationCaseActionRequestInProgress || moderationCaseDetailRequestInProgress) return;
  if (typeof moderationCaseDialog?.close === 'function') moderationCaseDialog.close();
  else moderationCaseDialog?.removeAttribute('open');
};

const setCaseEvidenceMode = (mode = 'add', evidence = null) => {
  caseEvidenceMode = mode;
  selectedCaseEvidenceId = Number.isInteger(Number(evidence?.evidence_id)) ? Number(evidence.evidence_id) : null;
  const removing = mode === 'remove';
  const editing = mode === 'edit';
  if (caseEvidenceFields) caseEvidenceFields.hidden = removing;
  if (caseEvidenceRemoveField) caseEvidenceRemoveField.hidden = !removing;
  if (caseEvidenceCancel) caseEvidenceCancel.hidden = mode === 'add';
  if (caseEvidenceEditorTitle) caseEvidenceEditorTitle.textContent = removing
    ? `Remove evidence #${selectedCaseEvidenceId || '—'}`
    : editing
      ? `Edit evidence #${selectedCaseEvidenceId || '—'}`
      : 'Add evidence';
  if (caseEvidenceSubmit) {
    caseEvidenceSubmit.textContent = removing ? 'Remove evidence' : editing ? 'Update evidence' : 'Attach evidence';
    caseEvidenceSubmit.classList.toggle('danger-outline', removing);
  }
  if (caseEvidenceType) caseEvidenceType.value = String(evidence?.evidence_type || 'discord_message');
  if (caseEvidenceReference) caseEvidenceReference.value = String(evidence?.reference || '');
  if (caseEvidenceSummary) caseEvidenceSummary.value = String(evidence?.summary || '');
  if (caseEvidenceRemoveReason) caseEvidenceRemoveReason.value = '';
};

const evidenceReferenceElement = (reference) => {
  const value = String(reference || '').trim();
  try {
    const parsed = new URL(value);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      const link = document.createElement('a');
      link.href = parsed.href;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.className = 'case-evidence-link';
      link.textContent = 'Open evidence';
      return link;
    }
  } catch (error) {
    // Non-URL references are intentionally rendered as plain text.
  }
  const text = document.createElement('span');
  text.className = 'case-evidence-reference';
  text.textContent = value || 'Reference unavailable';
  return text;
};

const renderCaseEvidence = (entries = []) => {
  if (!caseEvidenceList) return;
  const evidence = Array.isArray(entries) ? entries : [];
  caseEvidenceList.replaceChildren();
  evidence.forEach((entry) => {
    const active = String(entry?.status || '') === 'active';
    const buttons = [];
    if (active) {
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'activity-row-action';
      edit.textContent = 'Edit';
      edit.addEventListener('click', () => {
        setCaseEvidenceMode('edit', entry);
        caseEvidenceReference?.focus();
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'activity-row-action danger-outline';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        setCaseEvidenceMode('remove', entry);
        caseEvidenceRemoveReason?.focus();
      });
      buttons.push(edit, remove);
    }
    const item = document.createElement('li');
    item.className = active ? '' : 'case-evidence-removed';
    const symbol = document.createElement('span');
    symbol.className = `activity-symbol ${active ? '' : 'removed'}`.trim();
    symbol.textContent = active ? '◫' : '−';
    const content = document.createElement('div');
    const title = document.createElement('strong');
    const details = document.createElement('small');
    title.textContent = `Evidence #${Number(entry?.evidence_id) || '—'} · ${titleCaseState(entry?.evidence_type || 'other')} · ${titleCaseState(entry?.status || 'active')}`;
    details.textContent = `${String(entry?.summary || 'No summary')} · Added by ${String(entry?.added_by_name || 'Administrator')} on ${formatAccountDate(entry?.created_at)}`;
    const reference = evidenceReferenceElement(entry?.reference);
    content.append(title, details, reference);
    item.append(symbol, content);
    if (buttons.length) {
      item.classList.add('has-row-actions');
      const actions = document.createElement('div');
      actions.className = 'activity-row-actions';
      actions.append(...buttons);
      item.append(actions);
    }
    caseEvidenceList.append(item);
  });
  const activeCount = evidence.filter((entry) => String(entry?.status || '') === 'active').length;
  setText('[data-case-evidence-count]', `${activeCount} active`);
  if (caseEvidenceEmpty) caseEvidenceEmpty.hidden = evidence.length !== 0;
};

const renderCaseReviews = (entries = [], capabilities = {}) => {
  if (!caseReviewList) return;
  const reviews = Array.isArray(entries) ? entries : [];
  caseReviewList.replaceChildren();
  reviews.forEach((review) => {
    const status = String(review?.status || 'under_review');
    const decision = review?.decision_reason
      ? ` · Decision: ${String(review.decision_reason)}`
      : '';
    const expiry = review?.new_expires_at
      ? ` · New expiry ${formatAccountDate(review.new_expires_at)}`
      : '';
    appendAdminActivity(caseReviewList, {
      symbolText: status === 'under_review' ? '⌕' : status === 'overturned' ? '↶' : status === 'reduced' ? '↓' : '✓',
      symbolClass: status === 'overturned' ? 'red' : status === 'under_review' ? 'warning' : '',
      titleText: `Review #${Number(review?.review_id) || '—'} · ${titleCaseState(review?.review_type || 'review')} · ${titleCaseState(status)}`,
      detailText: `${String(review?.request_reason || 'No request reason')} · Opened by ${String(review?.requested_by_name || 'Administrator')} on ${formatAccountDate(review?.created_at)}${decision}${expiry}`
    });
  });
  const activeReview = reviews.find((review) => String(review?.status || '') === 'under_review') || null;
  if (caseReviewEmpty) caseReviewEmpty.hidden = reviews.length !== 0;
  if (caseReviewStart) caseReviewStart.hidden = !Boolean(capabilities?.can_start_review);
  if (caseReviewDecision) caseReviewDecision.hidden = !activeReview;
  if (caseReviewDecision) caseReviewDecision.dataset.reviewId = activeReview ? String(activeReview.review_id) : '';
  const reducedOption = caseReviewOutcome?.querySelector('option[value="reduced"]');
  const overturnedOption = caseReviewOutcome?.querySelector('option[value="overturned"]');
  if (reducedOption) reducedOption.disabled = !Boolean(capabilities?.can_reduce);
  if (overturnedOption) overturnedOption.disabled = !Boolean(capabilities?.can_overturn);
  if (caseReviewOutcome?.selectedOptions?.[0]?.disabled) caseReviewOutcome.value = 'upheld';
  if (caseReviewReductionField) caseReviewReductionField.hidden = caseReviewOutcome?.value !== 'reduced';
  setText('[data-case-review-state]', activeReview
    ? `${titleCaseState(activeReview.review_type)} active`
    : reviews[0]
      ? titleCaseState(reviews[0].status)
      : 'No review');
};

const renderModerationCaseDetail = (payload) => {
  const record = payload?.case;
  if (!record) return;
  selectedModerationCase = {
    caseId: Number(record.case_id),
    record,
    evidence: Array.isArray(payload?.evidence) ? payload.evidence : [],
    reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
    capabilities: payload?.capabilities || {}
  };
  setText('[data-case-dialog-title]', `Case #${selectedModerationCase.caseId} · ${titleCaseState(record.action)}`);
  setText('[data-case-dialog-subtitle]', `${titleCaseState(record.status)} · ${titleCaseState(record.review_state || 'open')}`);
  setText('[data-case-dialog-state]', titleCaseState(record.review_state || record.status));
  setText('[data-case-dialog-player]', String(record.psn_id || record.target_name || 'Player'));
  setText('[data-case-dialog-moderator]', String(record.moderator_name || 'Administrator'));
  setText('[data-case-dialog-created]', formatAccountDate(record.created_at));
  setText('[data-case-dialog-expiry]', record.expires_at ? formatAccountDate(record.expires_at) : ['ban', 'dayz_ban'].includes(String(record.action)) ? 'Permanent' : 'Not scheduled');
  setText('[data-case-dialog-reason]', String(record.reason || 'No reason recorded'));
  renderCaseEvidence(selectedModerationCase.evidence);
  renderCaseReviews(selectedModerationCase.reviews, selectedModerationCase.capabilities);
  setCaseEvidenceMode('add');
  if (caseReviewReason) caseReviewReason.value = '';
  if (caseReviewDecisionReason) caseReviewDecisionReason.value = '';
  if (caseReviewOutcome) caseReviewOutcome.value = 'upheld';
  if (caseReviewReductionField) caseReviewReductionField.hidden = true;
  if (caseReviewExpiry) caseReviewExpiry.value = '';
  showCaseDialogMessage('');
};

const openModerationCase = async (caseId) => {
  const cleanCaseId = Number(caseId);
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!Number.isInteger(cleanCaseId) || !sessionToken || moderationCaseDetailRequestInProgress) return;
  moderationCaseDetailRequestInProgress = true;
  selectedModerationCase = null;
  setText('[data-case-dialog-title]', `Case #${cleanCaseId}`);
  setText('[data-case-dialog-subtitle]', 'Railway is verifying current Admin access…');
  if (typeof moderationCaseDialog?.showModal === 'function') moderationCaseDialog.showModal();
  else moderationCaseDialog?.setAttribute('open', '');
  try {
    const response = await authFetch(`${ADMIN_MODERATION_CASES_URL}/${cleanCaseId}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleProtectedAuthFailure(response, payload, { actionRequest: false })) {
      closeModerationCaseDialog();
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload?.message || 'Moderation case unavailable');
    renderModerationCaseDetail(payload);
  } catch (error) {
    showCaseDialogMessage(error?.message || 'That moderation case is temporarily unavailable.');
  } finally {
    moderationCaseDetailRequestInProgress = false;
  }
};

const submitModerationCaseAction = async (requestPayload) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || !selectedModerationCase || moderationCaseActionRequestInProgress) return null;
  moderationCaseActionRequestInProgress = true;
  showCaseDialogMessage('Submitting protected case action…', 'pending');
  [caseEvidenceSubmit, caseReviewStartButton, caseReviewDecide].forEach((button) => button?.setAttribute('disabled', ''));
  try {
    const response = await protectedActionFetch(ADMIN_MODERATION_CASE_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ ...requestPayload, case_id: selectedModerationCase.caseId })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleProtectedAuthFailure(response, payload, { actionRequest: true })) return null;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload?.message || 'The protected case action was rejected.');
    renderModerationCaseDetail(payload);
    showCaseDialogMessage(payload.message || 'Moderation case updated.', 'success');
    await loadModerationCases();
    if (['decide_review'].includes(requestPayload.action)) await loadCurrentBanlists();
    return payload;
  } catch (error) {
    showCaseDialogMessage(error?.message || 'The protected case action could not be completed.');
    return null;
  } finally {
    moderationCaseActionRequestInProgress = false;
    [caseEvidenceSubmit, caseReviewStartButton, caseReviewDecide].forEach((button) => button?.removeAttribute('disabled'));
  }
};

caseEvidenceCancel?.addEventListener('click', () => setCaseEvidenceMode('add'));
caseEvidenceSubmit?.addEventListener('click', async () => {
  if (!selectedModerationCase) return;
  if (caseEvidenceMode === 'remove') {
    const reason = String(caseEvidenceRemoveReason?.value || '').trim().replace(/\s+/g, ' ');
    if (reason.length < 3 || reason.length > 1000) {
      showCaseDialogMessage('Enter a removal reason between 3 and 1,000 characters.');
      caseEvidenceRemoveReason?.focus();
      return;
    }
    await submitModerationCaseAction({ action: 'remove_evidence', evidence_id: selectedCaseEvidenceId, reason });
    return;
  }
  const reference = String(caseEvidenceReference?.value || '').trim();
  const summary = String(caseEvidenceSummary?.value || '').trim().replace(/\s+/g, ' ');
  if (reference.length < 3 || reference.length > 500) {
    showCaseDialogMessage('Enter an evidence link or reference between 3 and 500 characters.');
    caseEvidenceReference?.focus();
    return;
  }
  if (summary.length < 3 || summary.length > 1000) {
    showCaseDialogMessage('Enter an evidence summary between 3 and 1,000 characters.');
    caseEvidenceSummary?.focus();
    return;
  }
  await submitModerationCaseAction({
    action: caseEvidenceMode === 'edit' ? 'update_evidence' : 'add_evidence',
    evidence_id: selectedCaseEvidenceId,
    evidence_type: String(caseEvidenceType?.value || 'other'),
    reference,
    summary
  });
});

caseReviewType?.addEventListener('change', () => {
  if (caseReviewSourceField) caseReviewSourceField.hidden = caseReviewType.value !== 'appeal';
});
caseReviewStartButton?.addEventListener('click', async () => {
  const reason = String(caseReviewReason?.value || '').trim().replace(/\s+/g, ' ');
  if (reason.length < 3 || reason.length > 1000) {
    showCaseDialogMessage('Enter a review request between 3 and 1,000 characters.');
    caseReviewReason?.focus();
    return;
  }
  await submitModerationCaseAction({
    action: 'start_review',
    review_type: String(caseReviewType?.value || 'staff_review'),
    source: caseReviewType?.value === 'appeal' ? String(caseReviewSource?.value || 'other') : 'staff',
    reason
  });
});
caseReviewOutcome?.addEventListener('change', () => {
  const reduced = caseReviewOutcome.value === 'reduced';
  if (caseReviewReductionField) caseReviewReductionField.hidden = !reduced;
  if (caseReviewExpiry) {
    caseReviewExpiry.required = reduced;
    if (!reduced) caseReviewExpiry.value = '';
  }
});
caseReviewDecide?.addEventListener('click', async () => {
  const reviewId = Number(caseReviewDecision?.dataset.reviewId);
  const outcome = String(caseReviewOutcome?.value || 'upheld');
  const reason = String(caseReviewDecisionReason?.value || '').trim().replace(/\s+/g, ' ');
  if (!Number.isInteger(reviewId)) {
    showCaseDialogMessage('The active review could not be identified. Refresh the case.');
    return;
  }
  if (reason.length < 3 || reason.length > 1000) {
    showCaseDialogMessage('Enter a decision reason between 3 and 1,000 characters.');
    caseReviewDecisionReason?.focus();
    return;
  }
  const payload = { action: 'decide_review', review_id: reviewId, outcome, reason };
  if (outcome === 'reduced') {
    const expiryValue = String(caseReviewExpiry?.value || '');
    const expiry = new Date(expiryValue);
    const now = Date.now();
    if (!expiryValue || Number.isNaN(expiry.getTime()) || expiry.getTime() < now + (5 * 60 * 1000) || expiry.getTime() > now + (365 * 24 * 60 * 60 * 1000)) {
      showCaseDialogMessage('Choose a reduced expiry at least five minutes from now and no more than 365 days away.');
      caseReviewExpiry?.focus();
      return;
    }
    payload.expires_at = expiry.toISOString();
  }
  await submitModerationCaseAction(payload);
});

moderationCaseCloseButtons.forEach((button) => button.addEventListener('click', closeModerationCaseDialog));
moderationCaseDialog?.addEventListener('click', (event) => {
  if (event.target === moderationCaseDialog) closeModerationCaseDialog();
});
moderationCaseDialog?.addEventListener('cancel', (event) => {
  if (moderationCaseActionRequestInProgress || moderationCaseDetailRequestInProgress) event.preventDefault();
});
moderationCaseDialog?.addEventListener('close', () => {
  selectedModerationCase = null;
  setCaseEvidenceMode('add');
  showCaseDialogMessage('');
});


const banlistOpenPlayerButton = (psnId) => {
  const cleanPsn = String(psnId || '').trim();
  if (!cleanPsn) return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'activity-row-action';
  button.textContent = 'Open player';
  button.addEventListener('click', () => loadAdminPlayerDetails(cleanPsn));
  return button;
};

const banScheduleLabel = (entry) => {
  if (entry?.expires_at) return `Expires ${formatAccountDate(entry.expires_at)}`;
  if (entry?.case_id) return 'Permanent until manually reversed';
  return 'Current external or legacy ban';
};

const renderBanlistSource = (source, type) => {
  const isDiscord = type === 'discord';
  const list = isDiscord ? discordBanlist : dayzBanlist;
  const empty = isDiscord ? discordBanlistEmpty : dayzBanlistEmpty;
  const error = isDiscord ? discordBanlistError : dayzBanlistError;
  const countSelector = isDiscord ? '[data-discord-banlist-count]' : '[data-dayz-banlist-count]';
  if (!list) return;

  list.replaceChildren();
  const available = Boolean(source?.available);
  const entries = available && Array.isArray(source?.entries) ? source.entries : [];
  const reportedCount = Number(source?.count);
  const count = Number.isFinite(reportedCount) ? Math.max(0, Math.trunc(reportedCount)) : entries.length;
  setText(countSelector, source?.truncated ? `${entries.length}+ shown` : `${count} current`);
  if (empty) empty.hidden = !available || entries.length !== 0;
  if (error) {
    error.hidden = available;
    if (!available && source?.message) error.textContent = String(source.message);
  }
  list.hidden = !available || entries.length === 0;
  if (!available) return;

  entries.forEach((entry) => {
    const psnId = String(entry?.psn_id || '').trim();
    const caseId = Number(entry?.case_id);
    const caseLabel = Number.isInteger(caseId) ? `Case #${caseId}` : 'No dashboard case';
    const reason = String(entry?.reason || 'No reason supplied by the source');
    const moderator = entry?.moderator_name ? ` · Issued by ${String(entry.moderator_name)}` : '';
    const created = entry?.created_at ? ` · ${formatAccountDate(entry.created_at)}` : '';
    const title = isDiscord
      ? String(entry?.discord_name || 'Banned Discord account')
      : psnId || 'Banned PlayStation ID';
    const identity = isDiscord
      ? (psnId ? `PSN ${psnId}` : 'No linked PSN account')
      : 'Nitrado game ban list';
    appendAdminActivity(list, {
      symbolText: '⊘',
      symbolClass: 'red',
      titleText: title,
      detailText: `${identity} · ${caseLabel} · ${banScheduleLabel(entry)} · ${reason}${moderator}${created}`,
      actionButton: banlistOpenPlayerButton(psnId)
    });
  });
};

const renderCurrentBanlists = (payload) => {
  renderBanlistSource(payload?.discord, 'discord');
  renderBanlistSource(payload?.dayz, 'dayz');
  if (banlistChecked) {
    const partial = !payload?.discord?.available || !payload?.dayz?.available;
    banlistChecked.textContent = payload?.checked_at
      ? `${partial ? 'Partially refreshed' : 'Refreshed'} ${formatAccountDate(payload.checked_at)}. Live sources are not cached.`
      : 'The current ban lists could not be fully refreshed.';
  }
};

const loadCurrentBanlists = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!hasServerActionAccess() || !sessionToken || banlistRequestInProgress) return;
  banlistRequestInProgress = true;
  refreshBanlistsButton?.setAttribute('disabled', '');
  refreshBanlistsButton?.setAttribute('aria-busy', 'true');

  try {
    const response = await authFetch(ADMIN_BANLISTS_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload)) return;
    if (!payload?.discord || !payload?.dayz) throw new Error('Ban lists unavailable');
    renderCurrentBanlists(payload);
  } catch (error) {
    renderCurrentBanlists({
      discord: { available: false, message: 'The Discord ban list is temporarily unavailable.' },
      dayz: { available: false, message: 'The Nitrado DayZ ban list is temporarily unavailable.' }
    });
  } finally {
    banlistRequestInProgress = false;
    refreshBanlistsButton?.removeAttribute('disabled');
    refreshBanlistsButton?.removeAttribute('aria-busy');
  }
};

refreshBanlistsButton?.addEventListener('click', () => loadCurrentBanlists());
window.addEventListener('wwz:viewchange', (event) => {
  if (event.detail?.view === 'staff') {
    loadModerationCases();
    loadCurrentBanlists();
  }
});

const renderAdminNotes = (notes) => {
  if (!adminPlayerNotes) return;
  const safeNotes = Array.isArray(notes) ? notes : [];
  adminPlayerNotes.replaceChildren();
  if (adminPlayerNotesEmpty) adminPlayerNotesEmpty.hidden = safeNotes.length !== 0;

  safeNotes.forEach((note) => {
    const noteId = Number(note?.note_id);
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'activity-row-action';
    editButton.textContent = 'Edit';
    editButton.disabled = !Number.isInteger(noteId);
    editButton.addEventListener('click', () => openPlayerActionDialog('update_note', noteId, String(note?.note || '')));
    appendAdminActivity(adminPlayerNotes, {
      symbolText: '≡',
      titleText: `Private note · ${String(note?.author_name || 'Staff')}`,
      detailText: `${String(note?.note || 'No note text')} · ${formatAccountDate(note?.created_at)}`,
      actionButtons: [editButton]
    });
  });
};

const renderAdminActiveWarnings = (warnings) => {
  if (!adminPlayerActiveWarnings) return;
  const safeWarnings = Array.isArray(warnings) ? warnings : [];
  adminPlayerActiveWarnings.replaceChildren();
  if (adminPlayerWarningsEmpty) adminPlayerWarningsEmpty.hidden = safeWarnings.length !== 0;

  safeWarnings.forEach((warning) => {
    const caseId = Number(warning?.case_id);
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'activity-row-action';
    editButton.textContent = 'Edit';
    editButton.disabled = !Number.isInteger(caseId) || !selectedAdminPlayer?.linked;
    editButton.addEventListener('click', () => openPlayerActionDialog('edit_warning', caseId, String(warning?.reason || '')));
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'activity-row-action danger';
    removeButton.textContent = 'Remove';
    removeButton.disabled = !Number.isInteger(caseId) || !selectedAdminPlayer?.linked;
    removeButton.addEventListener('click', () => openPlayerActionDialog('remove_warning', caseId));
    appendAdminActivity(adminPlayerActiveWarnings, {
      symbolText: '!',
      symbolClass: 'warning',
      titleText: `Warning #${Number.isInteger(caseId) ? caseId : '—'} · ${String(warning?.moderator_name || 'Staff')}`,
      detailText: `${String(warning?.reason || 'No reason recorded')} · ${formatAccountDate(warning?.created_at)}`,
      actionButtons: [editButton, removeButton]
    });
  });
};

const renderAdminModerationHistory = (history) => {
  if (!adminPlayerModerationHistory) return;
  const safeHistory = Array.isArray(history) ? history : [];
  adminPlayerModerationHistory.replaceChildren();
  if (adminPlayerModerationEmpty) adminPlayerModerationEmpty.hidden = safeHistory.length !== 0;

  safeHistory.forEach((record) => {
    const action = String(record?.action || 'record');
    const status = String(record?.status || 'completed');
    const caseId = Number(record?.case_id);
    const duration = record?.duration_seconds == null ? '' : ` · Duration ${formatDuration(record.duration_seconds)}`;
    const expiry = record?.expires_at ? ` · Expires ${formatAccountDate(record.expires_at)}` : '';
    const related = Number.isInteger(Number(record?.related_case_id)) ? ` · Related to #${Number(record.related_case_id)}` : '';
    appendAdminActivity(adminPlayerModerationHistory, {
      symbolText: action === 'warn' ? '!' : action.includes('ban') ? '⊘' : '≡',
      symbolClass: action === 'warn' ? 'warning' : ['removed', 'reversed', 'expired'].includes(status) ? 'removed' : '',
      titleText: `Case #${Number.isInteger(caseId) ? caseId : '—'} · ${titleCaseState(action)} · ${titleCaseState(status)}`,
      detailText: `${String(record?.reason || 'No public reason recorded')} · ${String(record?.moderator_name || 'Administrator')} · ${formatAccountDate(record?.created_at)}${duration}${expiry}${related}`
    });
  });
};

const renderAdminDayzBans = (dayzBan) => {
  if (!adminPlayerDayzBans) return;
  const history = Array.isArray(dayzBan?.history) ? dayzBan.history : [];
  const active = Boolean(dayzBan?.active);
  adminPlayerDayzBans.replaceChildren();
  setText('[data-admin-player-dayz-ban-state]', active ? 'Currently banned' : 'Not banned');
  if (adminPlayerDayzBansEmpty) adminPlayerDayzBansEmpty.hidden = history.length !== 0;

  history.forEach((record) => {
    const action = String(record?.action || 'record');
    const caseId = Number(record?.case_id);
    const expiry = record?.expires_at ? ` · Expires ${formatAccountDate(record.expires_at)}` : '';
    const automatic = Boolean(record?.automatic) ? ' · Automatic expiry' : '';
    appendAdminActivity(adminPlayerDayzBans, {
      symbolText: action === 'ban' ? '⊘' : '♻',
      symbolClass: action === 'ban' ? 'red' : 'green',
      titleText: `DayZ ${titleCaseState(action)}${Number.isInteger(caseId) ? ` · Case #${caseId}` : ''} · ${String(record?.administrator_name || 'Staff')}`,
      detailText: `${String(record?.reason || 'No reason recorded')} · ${formatAccountDate(record?.created_at)}${expiry}${automatic}`
    });
  });
};

const renderAdminActionHistory = (history) => {
  if (!adminPlayerActionHistory) return;
  const safeHistory = Array.isArray(history) ? history : [];
  adminPlayerActionHistory.replaceChildren();
  if (adminPlayerActionHistoryEmpty) adminPlayerActionHistoryEmpty.hidden = safeHistory.length !== 0;

  safeHistory.forEach((record) => {
    const success = Boolean(record?.success);
    appendAdminActivity(adminPlayerActionHistory, {
      symbolText: success ? '✓' : '×',
      symbolClass: success ? 'green' : 'red',
      titleText: `${titleCaseState(record?.action)} · ${success ? 'Completed' : 'Rejected'} · ${String(record?.actor_name || 'Staff')}`,
      detailText: `${String(record?.reason || 'No reason recorded')} · ${String(record?.outcome || 'No outcome recorded')} · ${formatAccountDate(record?.created_at)}`
    });
  });
};

const renderAdminPlayerDetails = (payload) => {
  const player = payload?.player;
  const identity = player?.identity;
  const activity = player?.activity;
  const pvp = player?.pvp;
  const moderation = player?.moderation;
  const administration = player?.administration;
  if (!identity || !activity || !pvp || !moderation || !administration) throw new Error('Unexpected player-details response');

  selectedAdminPlayer = {
    psnId: String(identity.psn_id || ''),
    linked: Boolean(identity.linked),
    verified: Boolean(identity.verified),
    economyAvailable: Boolean(administration?.economy?.available),
    discordBanned: Boolean(administration?.discord_ban?.active),
    dayzBanned: Boolean(administration?.dayz_ban?.active),
    capabilities: administration?.capabilities || {}
  };
  selectedPlayerAction = null;
  selectedWarningCaseId = null;
  selectedNoteId = null;

  adminPlayerDetail?.removeAttribute('hidden');
  document.querySelector('[data-admin-player-unlinked]')?.toggleAttribute('hidden', Boolean(identity.linked));
  setText('[data-admin-player-psn]', String(identity.psn_id || 'Unknown player'));
  setText('[data-admin-player-discord]', identity.discord_name ? String(identity.discord_name) : 'Discord profile unavailable');
  setText('[data-admin-player-status]', activity.online ? 'Online now' : 'Offline');
  setText('[data-admin-player-link-state]', identity.linked ? 'Linked Discord account' : 'Unlinked DayZ record');
  setText('[data-admin-player-verified]', identity.verified ? 'Verified' : 'Not verified');
  setText('[data-admin-player-badge-label]', activity.online ? 'Online' : identity.linked ? 'Linked player' : 'Unlinked player');
  setStatusClass(document.querySelector('[data-admin-player-badge]'), activity.online ? 'online' : 'offline');
  document.querySelector('[data-admin-player-online-state]')?.classList.toggle('online', Boolean(activity.online));

  setText('[data-admin-player-playtime]', activity.playtime_seconds == null ? 'Unavailable' : formatDuration(activity.playtime_seconds));
  setText('[data-admin-player-sessions]', new Intl.NumberFormat('en-AU').format(Number(activity.total_sessions) || 0));
  setText('[data-admin-player-kd]', pvp.available ? Number(pvp.kd_ratio || 0).toFixed(2) : 'Unavailable');
  setText('[data-admin-player-kills]', new Intl.NumberFormat('en-AU').format(Number(pvp.kills) || 0));
  setText('[data-admin-player-deaths]', new Intl.NumberFormat('en-AU').format(Number(pvp.deaths) || 0));
  setText('[data-admin-player-warnings]', new Intl.NumberFormat('en-AU').format(Number(moderation.warning_count) || 0));
  setText('[data-admin-player-balance]', administration?.economy?.available ? formatMoney(administration.economy.balance) : 'Unavailable');
  setText('[data-admin-player-first-seen]', formatAccountDate(activity.first_seen));
  setText('[data-admin-player-last-seen]', activity.online ? 'Currently online' : formatAccountDate(activity.last_seen));
  setText('[data-admin-player-linked-at]', identity.linked ? formatAccountDate(activity.linked_at) : 'Not linked');
  setText('[data-admin-player-session-start]', activity.online ? formatAccountDate(activity.session_started_at, 'Session time unavailable') : 'Offline');
  setText('[data-admin-player-streak]', pvp.available ? new Intl.NumberFormat('en-AU').format(Number(pvp.current_streak) || 0) : 'Unavailable');
  setText('[data-admin-player-longest]', pvp.longest_kill_metres == null ? 'Not recorded' : `${Number(pvp.longest_kill_metres).toFixed(1)} m`);
  setText('[data-admin-player-weapon]', String(pvp.favourite_weapon || 'Not recorded'));
  renderAdminNotes(administration.notes);
  renderAdminActiveWarnings(administration.active_warnings);
  renderAdminModerationHistory(moderation.history);
  renderAdminDayzBans(administration.dayz_ban);
  renderAdminActionHistory(administration.action_history);
  syncPlayerActionControls();
  adminPlayerDetail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const loadAdminPlayerDetails = async (psnId) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!hasServerActionAccess() || !sessionToken || adminPlayerDetailRequestInProgress) return;

  adminPlayerDetailRequestInProgress = true;
  selectedAdminPlayer = null;
  syncPlayerActionControls();
  setAdminPlayerSearchState(`Loading protected administration details for ${psnId}…`, 'loading');
  try {
    const response = await authFetch(`${ADMIN_PLAYER_DETAILS_URL}?psn=${encodeURIComponent(psnId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload)) return;
    if (response.status === 404) {
      setAdminPlayerSearchState('That player record is no longer available. Search again.', 'error');
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error('Player details unavailable');
    renderAdminPlayerDetails(payload);
    setAdminPlayerSearchState(`Showing protected administration controls for ${psnId}.`, 'success');
  } catch (error) {
    selectedAdminPlayer = null;
    adminPlayerDetail?.setAttribute('hidden', '');
    syncPlayerActionControls();
    setAdminPlayerSearchState('Player details are temporarily unavailable. No data was changed.', 'error');
  } finally {
    adminPlayerDetailRequestInProgress = false;
  }
};

const openPlayerActionDialog = (action, referenceId = null, initialText = '') => {
  const specification = PLAYER_ACTIONS[action];
  if (!specification || !selectedAdminPlayer) return;
  selectedPlayerAction = action;
  selectedWarningCaseId = ['edit_warning', 'remove_warning'].includes(action) && referenceId != null ? Number(referenceId) : null;
  selectedNoteId = action === 'update_note' && referenceId != null ? Number(referenceId) : null;
  resetPlayerActionDialog();
  if (!playerActionIsAllowed(action)) {
    selectedPlayerAction = null;
    selectedWarningCaseId = null;
    selectedNoteId = null;
    return;
  }

  if (playerActionTitle) playerActionTitle.textContent = specification.title;
  if (playerActionDescription) playerActionDescription.textContent = specification.description;
  if (playerActionWarning) playerActionWarning.textContent = specification.warning;
  if (playerActionMark) playerActionMark.textContent = specification.mark;
  if (playerActionReasonLabel) playerActionReasonLabel.firstChild.textContent = `${specification.reasonLabel} `;
  if (playerActionReasonHelp) playerActionReasonHelp.textContent = specification.reasonHelp;
  const isNoteAction = ['add_note', 'update_note'].includes(action);
  if (playerActionReason) {
    playerActionReason.maxLength = isNoteAction ? 1500 : 1000;
    playerActionReason.value = String(initialText || '');
  }
  if (playerActionEconomyFields) playerActionEconomyFields.hidden = !specification.economy;
  if (playerActionBanFields) playerActionBanFields.hidden = !specification.banSchedule;
  if (playerActionCustomExpiry) playerActionCustomExpiry.hidden = true;
  if (playerActionBanDuration) playerActionBanDuration.value = 'permanent';
  if (playerActionExpiry) playerActionExpiry.value = '';
  if (playerActionTarget) playerActionTarget.textContent = selectedAdminPlayer.psnId;
  syncPlayerActionControls();

  if (typeof playerActionDialog?.showModal === 'function') playerActionDialog.showModal();
  else playerActionDialog?.setAttribute('open', '');
  window.setTimeout(() => playerActionReason?.focus(), 0);
};

playerActionBanDuration?.addEventListener('change', () => {
  const custom = playerActionBanDuration.value === 'custom';
  if (playerActionCustomExpiry) playerActionCustomExpiry.hidden = !custom;
  if (playerActionExpiry) {
    playerActionExpiry.required = custom;
    if (!custom) playerActionExpiry.value = '';
  }
});

playerActionButtons.forEach((button) => {
  button.addEventListener('click', () => openPlayerActionDialog(button.dataset.playerAction));
});

playerActionCancelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!playerActionRequestInProgress) closePlayerActionDialog();
  });
});

playerActionDialog?.addEventListener('click', (event) => {
  if (event.target === playerActionDialog && !playerActionRequestInProgress) closePlayerActionDialog();
});

playerActionDialog?.addEventListener('cancel', (event) => {
  if (playerActionRequestInProgress) event.preventDefault();
});

playerActionDialog?.addEventListener('close', () => {
  if (!playerActionRequestInProgress) resetPlayerActionDialog({ clearSelection: true });
  syncPlayerActionControls();
});

playerActionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const action = selectedPlayerAction;
  const specification = PLAYER_ACTIONS[action];
  if (!specification || !playerActionIsAllowed(action) || !selectedAdminPlayer) return;

  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken) {
    closePlayerActionDialog();
    applySignedOutState();
    showAuthMessage('Your dashboard session expired. Sign in again before using Admin controls.', 'error');
    return;
  }

  const reason = String(playerActionReason?.value || '').trim().replace(/\s+/g, ' ');
  const isNoteAction = ['add_note', 'update_note'].includes(action);
  const minimumReason = isNoteAction ? 1 : 3;
  const maximumReason = isNoteAction ? 1500 : 1000;
  if (reason.length < minimumReason || reason.length > maximumReason) {
    showPlayerActionDialogMessage(`Enter between ${minimumReason} and ${maximumReason} characters.`);
    playerActionReason?.focus();
    return;
  }

  const requestPayload = {
    action,
    psn: selectedAdminPlayer.psnId,
    // Railway still validates the selected target against the protected record.
    // The Admin confirms through the action dialog instead of retyping the PSN.
    confirmation: selectedAdminPlayer.psnId,
    reason
  };
  if (['edit_warning', 'remove_warning'].includes(action)) requestPayload.warning_case_id = selectedWarningCaseId;
  if (action === 'update_note') requestPayload.note_id = selectedNoteId;
  if (specification.banSchedule) {
    const duration = String(playerActionBanDuration?.value || 'permanent');
    if (duration === 'custom') {
      const customValue = String(playerActionExpiry?.value || '');
      const expiry = new Date(customValue);
      const now = Date.now();
      const maximum = now + (365 * 24 * 60 * 60 * 1000);
      if (!customValue || Number.isNaN(expiry.getTime()) || expiry.getTime() < now + (5 * 60 * 1000) || expiry.getTime() > maximum) {
        showPlayerActionDialogMessage('Choose a custom expiry at least five minutes from now and no more than 365 days away.');
        playerActionExpiry?.focus();
        return;
      }
      requestPayload.expires_at = expiry.toISOString();
    } else if (duration === 'permanent') {
      requestPayload.duration_seconds = null;
    } else {
      const durationSeconds = Number(duration);
      if (!Number.isInteger(durationSeconds) || durationSeconds < 300 || durationSeconds > 31_536_000) {
        showPlayerActionDialogMessage('Choose a valid permanent or temporary ban duration.');
        playerActionBanDuration?.focus();
        return;
      }
      requestPayload.duration_seconds = durationSeconds;
    }
  }
  if (specification.economy) {
    const operation = String(playerActionEconomyOperation?.value || '');
    const amount = Number(playerActionAmount?.value);
    if (!['add', 'remove', 'set'].includes(operation) || !Number.isInteger(amount) || amount < 0 || amount > 2_000_000_000) {
      showPlayerActionDialogMessage('Choose a balance operation and enter a valid whole-dollar amount.');
      playerActionAmount?.focus();
      return;
    }
    if (operation !== 'set' && amount === 0) {
      showPlayerActionDialogMessage('Add and remove operations require an amount greater than zero.');
      playerActionAmount?.focus();
      return;
    }
    requestPayload.economy_action = operation;
    requestPayload.amount = amount;
  }

  playerActionRequestInProgress = true;
  syncPlayerActionControls();
  showPlayerActionDialogMessage('Railway is rechecking your Admin access, target protections and audit record.', 'info');

  try {
    const response = await protectedActionFetch(ADMIN_PLAYER_ACTION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) {
      closePlayerActionDialog();
      return;
    }
    if (!response.ok || payload.status !== 'ok' || payload.action !== action) {
      showPlayerActionDialogMessage(String(payload.message || 'The protected player action could not be completed safely.'));
      return;
    }

    const successMessage = String(payload.message || 'The protected player action was completed and audited.');
    closePlayerActionDialog();
    showAuthMessage(successMessage, 'success');
    setAdminPlayerSearchState(successMessage, 'success');
    window.setTimeout(() => {
      loadModerationCases(sessionToken);
      loadCurrentBanlists(sessionToken);
    }, 250);
    if (payload.player) {
      renderAdminPlayerDetails({ player: payload.player });
    } else {
      selectedAdminPlayer = null;
      adminPlayerDetail?.setAttribute('hidden', '');
      syncPlayerActionControls();
      setAdminPlayerSearchState(`${successMessage} Search again to view the remaining DayZ record.`, 'success');
    }
  } catch (error) {
    showPlayerActionDialogMessage(
      error?.name === 'AbortError'
        ? 'Railway did not answer in time. Refresh the selected player before trying again.'
        : 'The protected Railway service could not be reached. No second request was sent.'
    );
  } finally {
    playerActionRequestInProgress = false;
    syncPlayerActionControls();
  }
});

adminPlayerSearchForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (adminPlayerSearchRequestInProgress) return;

  const query = String(adminPlayerSearchInput?.value || '').trim().replace(/\s+/g, ' ');
  if (query.length < 3) {
    setAdminPlayerSearchState('Enter at least three characters of a PlayStation ID or Discord display name.', 'error');
    adminPlayerSearchInput?.focus();
    return;
  }

  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!hasServerActionAccess() || !sessionToken) {
    setAdminPlayerSearchState('A verified Admin session is required.', 'error');
    return;
  }

  adminPlayerSearchRequestInProgress = true;
  adminPlayerSearchButton?.setAttribute('disabled', '');
  adminPlayerSearchButton?.setAttribute('aria-busy', 'true');
  adminPlayerResults?.replaceChildren();
  adminPlayerDetail?.setAttribute('hidden', '');
  if (adminPlayerEmpty) adminPlayerEmpty.hidden = true;
  if (adminPlayerError) adminPlayerError.hidden = true;
  setAdminPlayerSearchState(`Searching securely for “${query}”…`, 'loading');

  try {
    const response = await authFetch(`${ADMIN_PLAYER_SEARCH_URL}?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload)) return;
    if (response.status === 400) {
      setAdminPlayerSearchState(String(payload.message || 'The player search is invalid.'), 'error');
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error('Player search unavailable');
    renderAdminPlayerResults(payload.players);
    setAdminPlayerSearchState(
      payload.result_count === 0
        ? `No player records matched “${query}”.`
        : `${payload.result_count} protected result${payload.result_count === 1 ? '' : 's'} found. Select a player to view details.`,
      payload.result_count === 0 ? 'idle' : 'success'
    );
  } catch (error) {
    if (adminPlayerError) adminPlayerError.hidden = false;
    setAdminPlayerSearchState('Player search is temporarily unavailable. No data was changed.', 'error');
  } finally {
    adminPlayerSearchRequestInProgress = false;
    adminPlayerSearchButton?.removeAttribute('disabled');
    adminPlayerSearchButton?.removeAttribute('aria-busy');
  }
});

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
    await loadServerActionHistory(sessionToken);
    await loadModerationCases(sessionToken);
    await loadCurrentBanlists(sessionToken);
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
    await loadServerActionHistory(payload.session_token);
    await loadModerationCases(payload.session_token);
    await loadCurrentBanlists(payload.session_token);
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
  currentServerStatus = status;
  const statusLabel = STATUS_LABELS[status];
  const currentPlayers = Math.max(0, Math.trunc(Number(payload.players.current) || 0));
  const maximumPlayers = Math.max(0, Math.trunc(Number(payload.players.maximum) || 0));
  const serverName = String(payload.server.name || 'World War Z');
  const serverMap = String(payload.server.map || 'Chernarus');
  const platform = String(payload.server.platform || 'PlayStation 4 & 5');
  const updatedAt = formatUpdatedAt(payload.updated_at);
  const operations = payload.operations || {};
  const operationUpdatedAt = formatUpdatedAt(operations.last_successful_update || payload.updated_at);
  const discordHealthy = Boolean(operations.discord_connected && operations.discord_ready);
  const nitradoState = titleCaseState(operations.nitrado_state || 'unknown');
  const nextRestart = operations.next_scheduled_restart
    ? formatUpdatedAt(operations.next_scheduled_restart)
    : 'Not provided by Nitrado';

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
  setText('[data-operations-uptime]', formatDuration(operations.api_uptime_seconds));
  setText('[data-operations-discord]', discordHealthy ? 'Connected and ready' : 'Connection degraded');
  setText('[data-operations-nitrado]', nitradoState);
  setText('[data-operations-updated]', operationUpdatedAt);
  setText('[data-operations-next-restart]', nextRestart);
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
  syncServerActionControls();
};

const showStatusUnavailable = () => {
  currentServerStatus = 'unavailable';
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
  setText('[data-operations-uptime]', 'Unavailable');
  setText('[data-operations-discord]', 'Unavailable');
  setText('[data-operations-nitrado]', 'Unavailable');
  setText('[data-operations-updated]', 'Unable to refresh');
  setText('[data-operations-next-restart]', 'Not provided by Nitrado');
  document.querySelectorAll('[data-server-status-badge], [data-live-status-class]').forEach((element) => {
    setStatusClass(element, 'unavailable');
  });
  document.querySelectorAll('[data-detail-status]').forEach((element) => {
    element.classList.remove('online-text', 'restarting-text', 'offline-text', 'unavailable-text');
    element.classList.add('unavailable-text');
  });
  syncServerActionControls();
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
