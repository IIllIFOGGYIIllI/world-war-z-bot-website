const DASHBOARD_API_BASE = 'https://world-war-z.up.railway.app';
const SERVER_STATUS_URL = `${DASHBOARD_API_BASE}/api/server/status`;
const AUTH_CONFIG_URL = `${DASHBOARD_API_BASE}/api/auth/config`;
const AUTH_LOGIN_URL = `${DASHBOARD_API_BASE}/api/auth/discord/login`;
const AUTH_COMPLETE_URL = `${DASHBOARD_API_BASE}/api/auth/discord/complete`;
const AUTH_ME_URL = `${DASHBOARD_API_BASE}/api/auth/me`;
const AUTH_LOGOUT_URL = `${DASHBOARD_API_BASE}/api/auth/logout`;
const ACCOUNT_SUMMARY_URL = `${DASHBOARD_API_BASE}/api/account/summary`;
const SHOP_CATALOGUE_URL = `${DASHBOARD_API_BASE}/api/shop/catalogue`;
const ACCOUNT_SHOP_URL = `${DASHBOARD_API_BASE}/api/account/shop`;
const ACCOUNT_SHOP_PURCHASE_URL = `${DASHBOARD_API_BASE}/api/account/shop/purchase`;
const ADMIN_SHOP_ORDERS_URL = `${DASHBOARD_API_BASE}/api/admin/shop/orders`;
const ADMIN_SHOP_ORDER_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/shop/orders/action`;
const OWNER_SHOP_CONFIG_URL = `${DASHBOARD_API_BASE}/api/owner/shop/config`;
const OWNER_SHOP_ITEM_URL = `${DASHBOARD_API_BASE}/api/owner/shop/item`;
const OWNER_SHOP_SETTINGS_URL = `${DASHBOARD_API_BASE}/api/owner/shop/settings`;
const ACCOUNT_DELIVERY_LOCATIONS_URL = `${DASHBOARD_API_BASE}/api/account/delivery/locations`;
const ACCOUNT_DELIVERY_LOCATION_ACTION_URL = `${DASHBOARD_API_BASE}/api/account/delivery/locations/action`;
const ADMIN_SHOP_DELIVERY_URL = `${DASHBOARD_API_BASE}/api/admin/shop/delivery`;
const ADMIN_SHOP_DELIVERY_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/shop/delivery/action`;
const OWNER_SERVER_CONFIG_OVERVIEW_URL = `${DASHBOARD_API_BASE}/api/owner/server/config/overview`;
const OWNER_SERVER_CONFIG_FILE_URL = `${DASHBOARD_API_BASE}/api/owner/server/config/file`;
const OWNER_SERVER_CONFIG_FILE_ACTION_URL = `${DASHBOARD_API_BASE}/api/owner/server/config/file/action`;
const OWNER_SERVER_EVENTS_URL = `${DASHBOARD_API_BASE}/api/owner/server/events`;
const SERVER_ACTION_HISTORY_URL = `${DASHBOARD_API_BASE}/api/admin/server/actions`;
const ADMIN_PLAYER_SEARCH_URL = `${DASHBOARD_API_BASE}/api/admin/players/search`;
const ADMIN_PLAYER_DETAILS_URL = `${DASHBOARD_API_BASE}/api/admin/players/details`;
const ADMIN_PLAYER_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/players/action`;
const ADMIN_MODERATION_CASES_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/cases`;
const ADMIN_MODERATION_CASE_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/cases/action`;
const ADMIN_BANLISTS_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/banlists`;
const ADMIN_MODERATION_QUEUE_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/queue`;
const ADMIN_MODERATION_STAFF_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/staff`;
const ADMIN_MODERATION_ASSIGNMENT_URL = `${DASHBOARD_API_BASE}/api/admin/moderation/assignment`;
const ADMIN_OPERATION_FAILURES_URL = `${DASHBOARD_API_BASE}/api/admin/operations/failures`;
const ADMIN_OPERATION_RETRY_URL = `${DASHBOARD_API_BASE}/api/admin/operations/retry`;
const OWNER_NOTIFICATION_CONFIG_URL = `${DASHBOARD_API_BASE}/api/owner/notifications/config`;
const OWNER_NOTIFICATION_ACTION_URL = `${DASHBOARD_API_BASE}/api/owner/notifications/action`;
const OWNER_DISCORD_LOG_CONFIG_URL = `${DASHBOARD_API_BASE}/api/owner/discord-logs/config`;
const OWNER_DISCORD_LOG_ACTION_URL = `${DASHBOARD_API_BASE}/api/owner/discord-logs/action`;
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
const moderationQueueList = document.querySelector('[data-moderation-queue-list]');
const moderationQueueEmpty = document.querySelector('[data-moderation-queue-empty]');
const moderationQueueError = document.querySelector('[data-moderation-queue-error]');
const refreshModerationQueueButton = document.querySelector('[data-refresh-moderation-queue]');
const queueNavBadge = document.querySelector('[data-queue-nav-badge]');
const operationFailureList = document.querySelector('[data-operation-failure-list]');
const operationFailureEmpty = document.querySelector('[data-operation-failure-empty]');
const operationFailureError = document.querySelector('[data-operation-failure-error]');
const operationFailureCount = document.querySelector('[data-operation-failure-count]');
const refreshOperationFailuresButton = document.querySelector('[data-refresh-operation-failures]');
const failureNavBadge = document.querySelector('[data-failure-nav-badge]');
const refreshWebhooksButton = document.querySelector('[data-refresh-webhooks]');
const webhookLabelInput = document.querySelector('[data-webhook-label]');
const webhookChannelSelect = document.querySelector('[data-webhook-channel]');
const webhookNameInput = document.querySelector('[data-webhook-name]');
const createWebhookButton = document.querySelector('[data-create-webhook]');
const webhookDestinationList = document.querySelector('[data-webhook-list]');
const webhookEmpty = document.querySelector('[data-webhook-empty]');
const webhookRouteList = document.querySelector('[data-webhook-route-list]');
const webhookAuditList = document.querySelector('[data-webhook-audit-list]');
const webhookAuditEmpty = document.querySelector('[data-webhook-audit-empty]');
const webhookMessage = document.querySelector('[data-webhook-message]');
const webhookError = document.querySelector('[data-webhook-error]');

const refreshDiscordLogsButton = document.querySelector('[data-refresh-discord-logs]');
const discordLogSearch = document.querySelector('[data-discord-log-search]');
const discordLogList = document.querySelector('[data-discord-log-list]');
const discordLogEmpty = document.querySelector('[data-discord-log-empty]');
const discordLogMessage = document.querySelector('[data-discord-log-message]');
const discordLogError = document.querySelector('[data-discord-log-error]');
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
const dayzBanlistSource = document.querySelector('[data-dayz-banlist-source]');
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
let moderationQueueRequestInProgress = false;
let moderationQueueStaff = [];
let operationFailureRequestInProgress = false;
let webhookRequestInProgress = false;
let webhookConfiguration = { channels: [], webhooks: [], routes: [], audit: [] };
let discordLogRequestInProgress = false;
let discordLogConfiguration = { channels: [], log_types: [] };
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

const renderDiscordAvatar = (selector, avatarUrl, fallback = 'WZ', alt = 'Discord avatar') => {
  document.querySelectorAll(selector).forEach((container) => {
    container.replaceChildren();
    if (avatarUrl) {
      const image = document.createElement('img');
      image.src = String(avatarUrl);
      image.alt = alt;
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => {
        container.replaceChildren();
        container.textContent = fallback;
      }, { once: true });
      container.append(image);
    } else {
      container.textContent = fallback;
    }
  });
};

const applySignedOutState = ({ unavailable = false } = {}) => {
  authenticatedUser = null;
  applyAccessVisibility('guest');
  resetMemberPanels();
  resetAppealPanels();
  resetShopPanels();
  setText('[data-auth-button-label]', 'Sign in with Discord');
  setText('[data-access-card-title]', 'Guest access');
  setText('[data-access-card-copy]', 'Sign in will securely verify your community access.');
  setText('[data-access-icon]', '⌁');
  renderDiscordAvatar('[data-account-avatar]', null, 'WZ');
  renderDiscordAvatar('[data-topbar-avatar]', null, 'WZ');
  renderDiscordAvatar('[data-profile-discord-avatar]', null, 'WZ');
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
  renderDiscordAvatar('[data-account-avatar]', payload.user.avatar_url, initials, `${displayName} Discord avatar`);
  renderDiscordAvatar('[data-topbar-avatar]', payload.user.avatar_url, initials, `${displayName} Discord avatar`);
  renderDiscordAvatar('[data-profile-discord-avatar]', payload.user.avatar_url, initials, `${displayName} Discord avatar`);
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
  const storedKey = storageGet(AUTH_RETURN_VIEW_KEY) || 'overview/summary';
  storageRemove(AUTH_RETURN_VIEW_KEY);
  const requested = parseNavigationKey(storedKey);
  const view = availableViews.has(requested.view) ? requested.view : 'overview';
  const section = sectionTargetFor(view, requested.section) ? requested.section : defaultSectionForView(view);
  const key = navigationKey(view, section);
  history.replaceState({ view, section }, '', `#${key}`);
  return key;
};

const authFetch = (url, options = {}) => window.WWZHttp.request(url, options, 10_000);

const protectedActionFetch = (url, options = {}) => window.WWZHttp.request(url, options, 60_000);

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

