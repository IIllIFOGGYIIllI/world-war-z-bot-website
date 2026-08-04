const sidebar = document.querySelector('[data-sidebar]');
const sidebarToggle = document.querySelector('[data-sidebar-toggle]');
const sidebarScrim = document.querySelector('[data-sidebar-scrim]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
const loginDialog = document.querySelector('[data-login-dialog]');
const workspaceLabel = document.querySelector('[data-workspace-label]');
const commandPalette = document.querySelector('[data-command-palette]');
const commandPaletteInput = document.querySelector('[data-dashboard-search]');
const commandPaletteResults = document.querySelector('[data-dashboard-search-results]');
const commandPaletteOpeners = [...document.querySelectorAll('[data-open-command-search]')];
const commandPaletteClosers = [...document.querySelectorAll('[data-close-command-search]')];
let dashboardAccessLevel = 'guest';
let activeDashboardSection = '';

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

const parseNavigationKey = (value, explicitSection = '') => {
  const raw = String(value || '').replace(/^#/, '').trim();
  const [rawView = '', rawSection = ''] = raw.split('/', 2);
  return {
    view: rawView || 'overview',
    section: String(explicitSection || rawSection || '').trim()
  };
};

const defaultSectionForView = (view) =>
  viewButtons.find((button) => button.dataset.view === view && button.dataset.section)?.dataset.section || '';

const sectionTargetFor = (view, section) => {
  const panel = viewPanels.find((item) => item.dataset.viewPanel === view);
  if (!panel || !section) return null;
  return [...panel.querySelectorAll('[data-dashboard-section]')]
    .find((item) => item.dataset.dashboardSection === section) || null;
};

const navigationKey = (view, section = '') => section ? `${view}/${section}` : view;

const showView = (viewOrKey, updateHistory = true, explicitSection = '') => {
  const requested = parseNavigationKey(viewOrKey, explicitSection);
  const requestedView = availableViews.has(requested.view) ? requested.view : 'overview';
  const selectedView = canOpenView(requestedView) ? requestedView : 'overview';
  const requestedTarget = sectionTargetFor(selectedView, requested.section);
  const selectedSection = requestedTarget ? requested.section : defaultSectionForView(selectedView);
  const selectedTarget = sectionTargetFor(selectedView, selectedSection);

  viewPanels.forEach((panel) => {
    const active = panel.dataset.viewPanel === selectedView;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });

  let activeButton = null;
  viewButtons.forEach((button) => {
    const active = button.dataset.view === selectedView && button.dataset.section === selectedSection;
    button.classList.toggle('active', active);
    if (active) {
      button.setAttribute('aria-current', 'page');
      activeButton = button;
    } else {
      button.removeAttribute('aria-current');
    }
  });

  activeDashboardSection = selectedSection;
  const activePanel = viewPanels.find((panel) => panel.dataset.viewPanel === selectedView);
  const breadcrumb = activePanel?.querySelector('.breadcrumb');
  const navLabel = activeButton?.dataset.navLabel || selectedView.replace(/[-_]/g, ' ');
  if (breadcrumb && navLabel) breadcrumb.textContent = `Dashboard / ${navLabel}`;
  if (workspaceLabel) workspaceLabel.textContent = navLabel;
  const activeGroup = activeButton?.closest('[data-nav-group]');
  if (activeGroup && 'open' in activeGroup) activeGroup.open = true;

  const key = navigationKey(selectedView, selectedSection);
  if (updateHistory) history.pushState({ view: selectedView, section: selectedSection }, '', `#${key}`);

  window.requestAnimationFrame(() => {
    const targetVisible = selectedTarget && selectedTarget.getClientRects().length > 0;
    const scrollTarget = targetVisible ? selectedTarget : activePanel?.querySelector('.view-heading') || activePanel;
    scrollTarget?.scrollIntoView({ block: 'start', behavior: updateHistory ? 'smooth' : 'auto' });
  });

  closeSidebar();
  window.dispatchEvent(new CustomEvent('wwz:viewchange', { detail: { view: selectedView, section: selectedSection } }));
};

viewButtons.forEach((button) => button.addEventListener('click', () => showView(button.dataset.view, true, button.dataset.section)));
document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.jump, true, button.dataset.jumpSection || '')));

let commandPaletteIndex = 0;
let commandPaletteMatches = [];

const isDashboardDestinationVisible = (button) => {
  if (!button || button.hidden || button.closest('[hidden]')) return false;
  if (button.dataset.staffOnly !== undefined && !['staff', 'owner'].includes(dashboardAccessLevel)) return false;
  if (button.dataset.ownerOnly !== undefined && dashboardAccessLevel !== 'owner') return false;
  return true;
};

const dashboardDestinationText = (button) => [
  button.dataset.navLabel,
  button.querySelector('strong')?.textContent,
  button.querySelector('small')?.textContent,
  button.closest('[data-nav-group]')?.querySelector('summary strong')?.textContent,
  button.dataset.view,
  button.dataset.section
].filter(Boolean).join(' ').toLowerCase();

const renderCommandPalette = (query = '') => {
  if (!commandPaletteResults) return;
  const needle = String(query || '').trim().toLowerCase();
  commandPaletteMatches = viewButtons
    .filter(isDashboardDestinationVisible)
    .filter((button) => !needle || dashboardDestinationText(button).includes(needle))
    .slice(0, 24);
  commandPaletteIndex = Math.min(commandPaletteIndex, Math.max(0, commandPaletteMatches.length - 1));
  commandPaletteResults.replaceChildren();
  if (!commandPaletteMatches.length) {
    const empty = document.createElement('p');
    empty.className = 'command-search-empty';
    empty.textContent = 'No matching dashboard tools were found.';
    commandPaletteResults.append(empty);
    return;
  }
  commandPaletteMatches.forEach((button, index) => {
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'command-search-result';
    result.classList.toggle('selected', index === commandPaletteIndex);
    const group = button.closest('[data-nav-group]')?.querySelector('summary strong')?.textContent || 'Dashboard';
    const label = button.dataset.navLabel || button.querySelector('strong')?.textContent || 'Dashboard tool';
    const description = button.querySelector('small')?.textContent || `${button.dataset.view || 'dashboard'} workspace`;
    const groupLabel = document.createElement('span');
    groupLabel.textContent = group;
    const copy = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const small = document.createElement('small');
    small.textContent = description;
    copy.append(strong, small);
    const key = document.createElement('kbd');
    key.textContent = index === commandPaletteIndex ? 'Enter' : '↵';
    result.append(groupLabel, copy, key);
    result.addEventListener('mouseenter', () => {
      commandPaletteIndex = index;
      renderCommandPalette(commandPaletteInput?.value || '');
    });
    result.addEventListener('click', () => {
      commandPalette?.close?.();
      showView(button.dataset.view, true, button.dataset.section || '');
    });
    commandPaletteResults.append(result);
  });
};

const openCommandPalette = () => {
  if (!commandPalette) return;
  commandPaletteIndex = 0;
  if (commandPaletteInput) commandPaletteInput.value = '';
  renderCommandPalette('');
  commandPalette.showModal?.();
  window.requestAnimationFrame(() => commandPaletteInput?.focus());
};

commandPaletteOpeners.forEach((button) => button.addEventListener('click', openCommandPalette));
commandPaletteClosers.forEach((button) => button.addEventListener('click', () => commandPalette?.close?.()));
commandPalette?.addEventListener('click', (event) => {
  if (event.target === commandPalette) commandPalette.close?.();
});
commandPaletteInput?.addEventListener('input', () => {
  commandPaletteIndex = 0;
  renderCommandPalette(commandPaletteInput.value);
});
commandPaletteInput?.addEventListener('keydown', (event) => {
  if (!commandPaletteMatches.length) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    commandPaletteIndex = (commandPaletteIndex + direction + commandPaletteMatches.length) % commandPaletteMatches.length;
    renderCommandPalette(commandPaletteInput.value);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const button = commandPaletteMatches[commandPaletteIndex];
    commandPalette.close?.();
    showView(button.dataset.view, true, button.dataset.section || '');
  }
});

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
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }
  if (event.key === 'Escape') closeSidebar();
  if (!isTyping && event.key === '/' && !commandPalette?.open) {
    event.preventDefault();
    openCommandPalette();
  }
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
const SHOP_CATALOGUE_URL = `${DASHBOARD_API_BASE}/api/shop/catalogue`;
const ACCOUNT_SHOP_URL = `${DASHBOARD_API_BASE}/api/account/shop`;
const ACCOUNT_SHOP_PURCHASE_URL = `${DASHBOARD_API_BASE}/api/account/shop/purchase`;
const ADMIN_SHOP_ORDERS_URL = `${DASHBOARD_API_BASE}/api/admin/shop/orders`;
const ADMIN_SHOP_ORDER_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/shop/orders/action`;
const OWNER_SHOP_CONFIG_URL = `${DASHBOARD_API_BASE}/api/owner/shop/config`;
const OWNER_SHOP_ITEM_URL = `${DASHBOARD_API_BASE}/api/owner/shop/item`;
const OWNER_SHOP_SETTINGS_URL = `${DASHBOARD_API_BASE}/api/owner/shop/settings`;
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
let moderationQueueRequestInProgress = false;
let moderationQueueStaff = [];
let operationFailureRequestInProgress = false;
let webhookRequestInProgress = false;
let webhookConfiguration = { channels: [], webhooks: [], routes: [], audit: [] };
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
  resetAppealPanels();
  resetShopPanels();
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
  const storedKey = storageGet(AUTH_RETURN_VIEW_KEY) || 'overview/summary';
  storageRemove(AUTH_RETURN_VIEW_KEY);
  const requested = parseNavigationKey(storedKey);
  const view = availableViews.has(requested.view) ? requested.view : 'overview';
  const section = sectionTargetFor(view, requested.section) ? requested.section : defaultSectionForView(view);
  const key = navigationKey(view, section);
  history.replaceState({ view, section }, '', `#${key}`);
  return key;
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

const setSidebarBadge = (element, value) => {
  if (!element) return;
  const count = Math.max(0, Number(value) || 0);
  element.textContent = count > 99 ? '99+' : String(count);
  element.hidden = count === 0;
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const createSelectOption = (value, label, { disabled = false } = {}) => {
  const option = document.createElement('option');
  option.value = String(value);
  option.textContent = String(label);
  option.disabled = disabled;
  return option;
};

const queueFlag = (label, tone = '') => {
  const flag = document.createElement('span');
  flag.className = `queue-flag ${tone}`.trim();
  flag.textContent = label;
  return flag;
};

const saveModerationAssignment = async ({ caseId, assignee, priority, dueAt, button }) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || !hasServerActionAccess()) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'Saving…';
  try {
    const dueDate = dueAt ? new Date(dueAt) : null;
    const response = await authFetch(ADMIN_MODERATION_ASSIGNMENT_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        case_id: caseId,
        assignee_key: assignee,
        priority,
        due_at: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString() : null
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Case assignment could not be saved.');
    button.textContent = 'Saved';
    await Promise.all([loadModerationQueue(), loadModerationCases()]);
  } catch (error) {
    button.textContent = error instanceof Error ? error.message : 'Save failed';
    window.setTimeout(() => { button.textContent = originalLabel; }, 2500);
  } finally {
    button.disabled = false;
    if (button.textContent === 'Saving…') button.textContent = originalLabel;
  }
};

const renderModerationQueue = (payload) => {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const summary = payload?.summary || {};
  setText('[data-queue-awaiting]', String(summary.awaiting_review ?? 0));
  setText('[data-queue-appeals]', String(summary.active_appeals ?? 0));
  setText('[data-queue-expiring]', String(summary.expiring_within_24_hours ?? 0));
  setText('[data-queue-failures]', String(summary.failed_operations ?? 0));
  setText('[data-queue-overdue]', String(summary.overdue ?? 0));
  setText('[data-queue-mine]', String(summary.assigned_to_me ?? 0));
  setSidebarBadge(queueNavBadge, Number(summary.awaiting_review || 0) + Number(summary.overdue || 0));

  moderationQueueList?.replaceChildren();
  if (moderationQueueEmpty) moderationQueueEmpty.hidden = items.length !== 0;
  if (moderationQueueError) moderationQueueError.hidden = true;

  items.forEach((item) => {
    const caseId = Number(item?.case_id);
    const card = document.createElement('article');
    card.className = `operations-queue-card priority-${String(item?.priority || 'normal')}`;

    const heading = document.createElement('div');
    heading.className = 'operations-queue-heading';
    const copy = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.className = 'panel-kicker';
    kicker.textContent = `Case #${Number.isInteger(caseId) ? caseId : '—'} · ${titleCaseState(item?.action || 'record')}`;
    const title = document.createElement('h3');
    title.textContent = String(item?.target_name || 'Player');
    const reason = document.createElement('p');
    reason.className = 'operations-queue-reason';
    reason.textContent = String(item?.reason || 'No reason recorded');
    copy.append(kicker, title, reason);

    const flags = document.createElement('div');
    flags.className = 'queue-flags';
    flags.append(queueFlag(titleCaseState(item?.priority || 'normal'), `priority-${String(item?.priority || 'normal')}`));
    if (item?.review_type) flags.append(queueFlag(titleCaseState(item.review_type), 'review'));
    if (item?.overdue) flags.append(queueFlag('Overdue', 'danger'));
    if (item?.expiring_soon) flags.append(queueFlag('Expires soon', 'warning'));
    if (item?.operation_failed) flags.append(queueFlag('Operation failed', 'danger'));
    if (!item?.evidence_count) flags.append(queueFlag('No evidence', 'muted'));
    heading.append(copy, flags);

    const metadata = document.createElement('p');
    metadata.className = 'operations-queue-meta';
    const assignmentText = item?.assignee_name ? `Assigned to ${item.assignee_name}` : 'Unassigned';
    const dueText = item?.due_at ? ` · Due ${formatAccountDate(item.due_at)}` : '';
    metadata.textContent = `${assignmentText}${dueText} · ${Number(item?.evidence_count || 0)} active evidence · Opened ${formatAccountDate(item?.created_at)}`;

    const controls = document.createElement('div');
    controls.className = 'queue-assignment-controls';
    const assignee = document.createElement('select');
    assignee.setAttribute('aria-label', `Assignee for case ${caseId}`);
    assignee.append(createSelectOption('unassigned', 'Unassigned'), createSelectOption('self', 'Assign to me'));
    moderationQueueStaff.forEach((staff) => {
      assignee.append(createSelectOption(staff.staff_key, `${staff.name} · ${accessLabel(staff.access_level)}`));
    });
    const matchingStaff = moderationQueueStaff.find((staff) => staff.name === item?.assignee_name);
    assignee.value = matchingStaff?.staff_key || (item?.assigned_to_me ? 'self' : 'unassigned');

    const priority = document.createElement('select');
    priority.setAttribute('aria-label', `Priority for case ${caseId}`);
    ['low', 'normal', 'high', 'urgent'].forEach((value) => priority.append(createSelectOption(value, titleCaseState(value))));
    priority.value = String(item?.priority || 'normal');

    const due = document.createElement('input');
    due.type = 'datetime-local';
    due.step = '60';
    due.value = toLocalDateTimeInput(item?.due_at);
    due.setAttribute('aria-label', `Review deadline for case ${caseId}`);

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'secondary-action compact-action';
    save.textContent = 'Save assignment';
    save.addEventListener('click', () => saveModerationAssignment({
      caseId,
      assignee: assignee.value,
      priority: priority.value,
      dueAt: due.value,
      button: save
    }));

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'activity-row-action';
    open.textContent = 'Open case';
    open.addEventListener('click', () => openModerationCase(caseId));
    controls.append(assignee, priority, due, save, open);
    card.append(heading, metadata, controls);
    moderationQueueList?.append(card);
  });
};

const loadModerationQueue = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!hasServerActionAccess() || !sessionToken || moderationQueueRequestInProgress) return;
  moderationQueueRequestInProgress = true;
  refreshModerationQueueButton?.setAttribute('disabled', '');
  refreshModerationQueueButton?.setAttribute('aria-busy', 'true');
  try {
    const [queueResponse, staffResponse] = await Promise.all([
      authFetch(ADMIN_MODERATION_QUEUE_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } }),
      authFetch(ADMIN_MODERATION_STAFF_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } })
    ]);
    const [queuePayload, staffPayload] = await Promise.all([
      queueResponse.json().catch(() => ({})),
      staffResponse.json().catch(() => ({}))
    ]);
    if (handleAdminPlayerAuthorizationResponse(queueResponse, queuePayload, { actionRequest: false })) return;
    if (handleAdminPlayerAuthorizationResponse(staffResponse, staffPayload, { actionRequest: false })) return;
    if (!queueResponse.ok || queuePayload.status !== 'ok' || !staffResponse.ok || staffPayload.status !== 'ok') {
      throw new Error('Moderation queue unavailable');
    }
    moderationQueueStaff = Array.isArray(staffPayload.staff) ? staffPayload.staff : [];
    renderModerationQueue(queuePayload);
  } catch (error) {
    moderationQueueList?.replaceChildren();
    if (moderationQueueEmpty) moderationQueueEmpty.hidden = true;
    if (moderationQueueError) moderationQueueError.hidden = false;
    ['awaiting', 'appeals', 'expiring', 'failures', 'overdue', 'mine'].forEach((key) => setText(`[data-queue-${key}]`, '—'));
  } finally {
    moderationQueueRequestInProgress = false;
    refreshModerationQueueButton?.removeAttribute('disabled');
    refreshModerationQueueButton?.removeAttribute('aria-busy');
  }
};

refreshModerationQueueButton?.addEventListener('click', () => loadModerationQueue());

const renderOperationFailures = (payload) => {
  const failures = Array.isArray(payload?.failures) ? payload.failures : [];
  operationFailureList?.replaceChildren();
  if (operationFailureEmpty) operationFailureEmpty.hidden = failures.length !== 0;
  if (operationFailureError) operationFailureError.hidden = true;
  if (operationFailureCount) operationFailureCount.textContent = `${failures.length} unresolved`;
  setSidebarBadge(failureNavBadge, failures.length);

  failures.forEach((failure) => {
    const card = document.createElement('article');
    card.className = 'operation-failure-card';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = String(failure?.title || 'Moderation operation failed');
    const message = document.createElement('p');
    message.textContent = String(failure?.message || 'No failure detail was recorded.');
    const detail = document.createElement('small');
    detail.textContent = `${String(failure?.subject || 'Operation')} · ${Number(failure?.attempts || 1)} attempt(s)${failure?.retry_at ? ` · Next retry ${formatAccountDate(failure.retry_at)}` : ''}`;
    copy.append(title, message, detail);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'secondary-action compact-action';
    retry.textContent = 'Retry now';
    retry.disabled = !failure?.can_retry;
    retry.addEventListener('click', async () => {
      const sessionToken = storageGet(AUTH_SESSION_KEY);
      if (!sessionToken) return;
      retry.disabled = true;
      retry.textContent = 'Retrying…';
      try {
        const response = await authFetch(ADMIN_OPERATION_RETRY_URL, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
          body: JSON.stringify({ failure_id: failure.failure_id })
        });
        const result = await response.json().catch(() => ({}));
        if (handleAdminPlayerAuthorizationResponse(response, result, { actionRequest: true })) return;
        if (!response.ok || result.status !== 'ok') throw new Error(result.message || 'Retry failed');
        await Promise.all([loadOperationFailures(), loadModerationQueue()]);
      } catch (error) {
        retry.textContent = error instanceof Error ? error.message : 'Retry failed';
        window.setTimeout(() => { retry.textContent = 'Retry now'; retry.disabled = false; }, 2500);
      }
    });
    card.append(copy, retry);
    operationFailureList?.append(card);
  });
};

const loadOperationFailures = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!hasServerActionAccess() || !sessionToken || operationFailureRequestInProgress) return;
  operationFailureRequestInProgress = true;
  refreshOperationFailuresButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(ADMIN_OPERATION_FAILURES_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return;
    if (!response.ok || payload.status !== 'ok') throw new Error('Operational failures unavailable');
    renderOperationFailures(payload);
  } catch (error) {
    operationFailureList?.replaceChildren();
    if (operationFailureEmpty) operationFailureEmpty.hidden = true;
    if (operationFailureError) operationFailureError.hidden = false;
    if (operationFailureCount) operationFailureCount.textContent = 'Unavailable';
  } finally {
    operationFailureRequestInProgress = false;
    refreshOperationFailuresButton?.removeAttribute('disabled');
  }
};

refreshOperationFailuresButton?.addEventListener('click', () => loadOperationFailures());

const showWebhookMessage = (message = '', tone = 'error') => {
  if (!webhookMessage) return;
  webhookMessage.hidden = !message;
  webhookMessage.textContent = message;
  webhookMessage.dataset.tone = tone;
};

const ownerNotificationAction = async (action, values = {}, button = null) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || dashboardAccessLevel !== 'owner' || webhookRequestInProgress) return false;
  webhookRequestInProgress = true;
  const originalLabel = button?.textContent || '';
  if (button) { button.disabled = true; button.textContent = 'Working…'; }
  showWebhookMessage('');
  try {
    const response = await authFetch(OWNER_NOTIFICATION_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ action, ...values })
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true });
      return false;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Webhook operation failed.');
    showWebhookMessage(payload.message || 'Webhook configuration updated.', 'success');
    webhookRequestInProgress = false;
    await loadWebhookConfiguration();
    return true;
  } catch (error) {
    showWebhookMessage(error instanceof Error ? error.message : 'Webhook operation failed.', 'error');
    return false;
  } finally {
    webhookRequestInProgress = false;
    if (button) { button.disabled = false; button.textContent = originalLabel; }
  }
};

const renderWebhookConfiguration = (payload) => {
  webhookConfiguration = {
    channels: Array.isArray(payload?.channels) ? payload.channels : [],
    webhooks: Array.isArray(payload?.webhooks) ? payload.webhooks : [],
    routes: Array.isArray(payload?.routes) ? payload.routes : [],
    audit: Array.isArray(payload?.audit) ? payload.audit : []
  };
  if (webhookError) webhookError.hidden = true;
  if (webhookChannelSelect) {
    webhookChannelSelect.replaceChildren(createSelectOption('', 'Select a Discord text channel'));
    webhookConfiguration.channels.forEach((channel) => {
      const prefix = channel.category ? `${channel.category} / ` : '';
      webhookChannelSelect.append(createSelectOption(
        channel.channel_key,
        `${prefix}#${channel.name}${channel.can_manage_webhooks ? '' : ' · missing permissions'}`,
        { disabled: !channel.can_manage_webhooks }
      ));
    });
  }

  webhookDestinationList?.replaceChildren();
  if (webhookEmpty) webhookEmpty.hidden = webhookConfiguration.webhooks.length !== 0;
  setText('[data-webhook-count]', `${webhookConfiguration.webhooks.length} configured`);
  webhookConfiguration.webhooks.forEach((destination) => {
    const card = document.createElement('article');
    card.className = 'webhook-destination-card';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = String(destination.label || 'Webhook destination');
    const detail = document.createElement('p');
    detail.textContent = `#${String(destination.channel_name || 'channel')} · ${String(destination.webhook_name || 'World War Z Operations')}`;
    const status = document.createElement('small');
    status.textContent = destination.last_test_at
      ? `Last test ${titleCaseState(destination.last_test_status || 'unknown')} · ${formatAccountDate(destination.last_test_at)}`
      : 'Not tested yet';
    copy.append(title, detail, status);
    const actions = document.createElement('div');
    actions.className = 'webhook-card-actions';
    const test = document.createElement('button');
    test.type = 'button';
    test.className = 'secondary-action compact-action';
    test.textContent = 'Send test';
    test.addEventListener('click', () => ownerNotificationAction('test_webhook', { config_id: destination.config_id }, test));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'activity-row-action danger';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const label = String(destination.label || 'this webhook destination');
      if (!window.confirm(`Remove ${label}? Notification routes using it will be disabled.`)) return;
      ownerNotificationAction('remove_webhook', { config_id: destination.config_id }, remove);
    });
    actions.append(test, remove);
    card.append(copy, actions);
    webhookDestinationList?.append(card);
  });

  webhookRouteList?.replaceChildren();
  webhookConfiguration.routes.forEach((route) => {
    const row = document.createElement('article');
    row.className = 'webhook-route-row';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = String(route.label || titleCaseState(route.event_key));
    const description = document.createElement('small');
    description.textContent = String(route.description || 'Discord moderation notification');
    copy.append(title, description);

    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'route-toggle';
    const enabled = document.createElement('input');
    enabled.type = 'checkbox';
    enabled.checked = Boolean(route.enabled);
    const enabledText = document.createElement('span');
    enabledText.textContent = 'Enabled';
    enabledLabel.append(enabled, enabledText);

    const destination = document.createElement('select');
    destination.setAttribute('aria-label', `${route.label} destination`);
    destination.append(createSelectOption('', 'No destination'));
    webhookConfiguration.webhooks.forEach((webhook) => destination.append(createSelectOption(webhook.config_id, webhook.label)));
    destination.value = route.webhook_config_id == null ? '' : String(route.webhook_config_id);

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'secondary-action compact-action';
    save.textContent = 'Save route';
    save.addEventListener('click', () => {
      if (enabled.checked && !destination.value) {
        showWebhookMessage('Select a destination before enabling that notification route.', 'error');
        return;
      }
      ownerNotificationAction('set_route', {
        event_key: route.event_key,
        config_id: destination.value ? Number(destination.value) : null,
        enabled: enabled.checked
      }, save);
    });
    row.append(copy, enabledLabel, destination, save);
    webhookRouteList?.append(row);
  });

  webhookAuditList?.replaceChildren();
  if (webhookAuditEmpty) webhookAuditEmpty.hidden = webhookConfiguration.audit.length !== 0;
  webhookConfiguration.audit.forEach((entry) => {
    const item = document.createElement('li');
    const symbol = document.createElement('span');
    symbol.className = `activity-symbol ${entry.success ? '' : 'red'}`.trim();
    symbol.textContent = entry.success ? '✓' : '!';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${titleCaseState(entry.action || 'webhook change')} · ${entry.success ? 'Accepted' : 'Rejected'}`;
    const detail = document.createElement('small');
    const destinationText = entry.destination_label ? ` · ${entry.destination_label}` : '';
    const routeText = entry.event_key ? ` · ${titleCaseState(entry.event_key)}` : '';
    detail.textContent = `${String(entry.outcome || 'Configuration updated')}${destinationText}${routeText} · ${String(entry.actor_name || 'Owner')} · ${formatAccountDate(entry.created_at)}`;
    copy.append(title, detail);
    item.append(symbol, copy);
    webhookAuditList?.append(item);
  });
};

const loadWebhookConfiguration = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (dashboardAccessLevel !== 'owner' || !sessionToken || webhookRequestInProgress) return;
  webhookRequestInProgress = true;
  refreshWebhooksButton?.setAttribute('disabled', '');
  if (webhookError) webhookError.hidden = true;
  try {
    const response = await authFetch(OWNER_NOTIFICATION_CONFIG_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true });
      return;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Webhook configuration unavailable.');
    renderWebhookConfiguration(payload);
  } catch (error) {
    if (webhookError) {
      webhookError.hidden = false;
      webhookError.textContent = error instanceof Error ? error.message : 'Webhook configuration is temporarily unavailable.';
    }
  } finally {
    webhookRequestInProgress = false;
    refreshWebhooksButton?.removeAttribute('disabled');
  }
};

refreshWebhooksButton?.addEventListener('click', () => loadWebhookConfiguration());
createWebhookButton?.addEventListener('click', async () => {
  const created = await ownerNotificationAction('create_webhook', {
    label: webhookLabelInput?.value || '',
    channel_key: webhookChannelSelect?.value || '',
    webhook_name: webhookNameInput?.value || 'World War Z Operations'
  }, createWebhookButton);
  if (created && webhookLabelInput) webhookLabelInput.value = '';
});

window.addEventListener('wwz:viewchange', (event) => {
  const view = event.detail?.view;
  const section = event.detail?.section;
  if (view === 'staff' && section === 'queue') loadModerationQueue();
  if (view === 'staff' && section === 'cases') loadModerationCases();
  if (view === 'staff' && section === 'banlists') loadCurrentBanlists();
  if (view === 'staff' && section === 'failures') loadOperationFailures();
  if (view === 'configuration' && section === 'notifications') loadWebhookConfiguration();
});

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
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) {
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
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return null;
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


// Version 1.18.0 — member appeals, ticket integration and owner settings.
const ACCOUNT_APPEALS_URL = `${DASHBOARD_API_BASE}/api/account/appeals`;
const ACCOUNT_APPEAL_ACTION_URL = `${DASHBOARD_API_BASE}/api/account/appeals/action`;
const OWNER_APPEAL_CONFIG_URL = `${DASHBOARD_API_BASE}/api/owner/appeals/config`;

const appealGuest = document.querySelector('[data-appeal-guest]');
const appealUnlinked = document.querySelector('[data-appeal-unlinked]');
const appealContent = document.querySelector('[data-appeal-content]');
const appealEligibleList = document.querySelector('[data-appeal-eligible-list]');
const appealEligibleEmpty = document.querySelector('[data-appeal-eligible-empty]');
const memberAppealList = document.querySelector('[data-member-appeal-list]');
const memberAppealEmpty = document.querySelector('[data-member-appeal-empty]');
const memberAppealError = document.querySelector('[data-member-appeal-error]');
const refreshMemberAppealsButton = document.querySelector('[data-refresh-member-appeals]');
const memberAppealDialog = document.querySelector('[data-member-appeal-dialog]');
const memberAppealForm = document.querySelector('[data-member-appeal-form]');
const memberAppealTitle = document.querySelector('[data-member-appeal-title]');
const memberAppealCopy = document.querySelector('[data-member-appeal-copy]');
const memberAppealCase = document.querySelector('[data-member-appeal-case]');
const memberAppealCaseDetail = document.querySelector('[data-member-appeal-case-detail]');
const memberAppealStatement = document.querySelector('[data-member-appeal-statement]');
const memberAppealEvidenceReferences = [...document.querySelectorAll('[data-member-appeal-evidence-reference]')];
const memberAppealEvidenceSummaries = [...document.querySelectorAll('[data-member-appeal-evidence-summary]')];
const memberAppealMessage = document.querySelector('[data-member-appeal-message]');
const submitMemberAppealButton = document.querySelector('[data-submit-member-appeal]');
const memberAppealCancelButtons = [...document.querySelectorAll('[data-member-appeal-cancel]')];
const withdrawAppealDialog = document.querySelector('[data-withdraw-appeal-dialog]');
const withdrawAppealForm = document.querySelector('[data-withdraw-appeal-form]');
const withdrawAppealReason = document.querySelector('[data-withdraw-appeal-reason]');
const withdrawAppealMessage = document.querySelector('[data-withdraw-appeal-message]');
const withdrawAppealCancelButtons = [...document.querySelectorAll('[data-withdraw-appeal-cancel]')];
const ownerAppealEnabled = document.querySelector('[data-owner-appeal-enabled]');
const ownerAppealCreateTicket = document.querySelector('[data-owner-appeal-create-ticket]');
const ownerAppealEdit = document.querySelector('[data-owner-appeal-edit]');
const ownerAppealContinues = document.querySelector('[data-owner-appeal-continues]');
const ownerAppealDeadline = document.querySelector('[data-owner-appeal-deadline]');
const ownerAppealCategory = document.querySelector('[data-owner-appeal-category]');
const ownerAppealRole = document.querySelector('[data-owner-appeal-role]');
const ownerAppealInstructions = document.querySelector('[data-owner-appeal-instructions]');
const ownerAppealMessage = document.querySelector('[data-owner-appeal-message]');
const saveAppealSettingsButton = document.querySelector('[data-save-appeal-settings]');
const refreshAppealSettingsButton = document.querySelector('[data-refresh-appeal-settings]');
let memberAppealPayload = null;
let memberAppealRequestInProgress = false;
let memberAppealActionInProgress = false;
let selectedMemberAppealMode = 'submit';
let selectedMemberAppealId = null;
let selectedMemberAppealCaseId = null;
let ownerAppealRequestInProgress = false;
let selectedWithdrawAppealId = null;

const showInlineMessage = (element, message, state = 'error') => {
  if (!element) return;
  element.textContent = String(message || '');
  element.dataset.state = state;
  element.hidden = !message;
};

const openDashboardDialog = (dialog) => {
  if (typeof dialog?.showModal === 'function') dialog.showModal();
  else dialog?.setAttribute('open', '');
};

const closeDashboardDialog = (dialog) => {
  if (typeof dialog?.close === 'function') dialog.close();
  else dialog?.removeAttribute('open');
};

const resetAppealPanels = () => {
  memberAppealPayload = null;
  appealGuest?.removeAttribute('hidden');
  appealUnlinked?.setAttribute('hidden', '');
  appealContent?.setAttribute('hidden', '');
  appealEligibleList?.replaceChildren();
  memberAppealList?.replaceChildren();
  if (appealEligibleEmpty) appealEligibleEmpty.hidden = true;
  if (memberAppealEmpty) memberAppealEmpty.hidden = true;
  if (memberAppealError) memberAppealError.hidden = true;
  setText('[data-appeal-eligible-count]', '—');
  setText('[data-member-appeal-count]', '—');
};

const appealActionLabel = (action) => ({
  warn: 'Warning', kick: 'Discord kick', ban: 'Discord ban', dayz_ban: 'DayZ ban'
}[String(action || '')] || titleCaseState(action || 'Moderation action'));

const appealEvidenceFromForm = () => memberAppealEvidenceReferences.map((input, index) => ({
  reference: input.value.trim(),
  summary: memberAppealEvidenceSummaries[index]?.value.trim() || ''
})).filter((item) => item.reference || item.summary);

const clearMemberAppealForm = () => {
  memberAppealForm?.reset();
  memberAppealEvidenceReferences.forEach((input) => { input.value = ''; });
  memberAppealEvidenceSummaries.forEach((input) => { input.value = ''; });
  showInlineMessage(memberAppealMessage, '');
};

const fillAppealEvidence = (evidence = []) => {
  memberAppealEvidenceReferences.forEach((input, index) => {
    input.value = String(evidence[index]?.reference || '');
  });
  memberAppealEvidenceSummaries.forEach((input, index) => {
    input.value = String(evidence[index]?.summary || '');
  });
};

const openMemberAppealEditor = ({ mode, caseRecord = null, appeal = null }) => {
  selectedMemberAppealMode = mode;
  selectedMemberAppealId = appeal?.appeal_id == null ? null : Number(appeal.appeal_id);
  selectedMemberAppealCaseId = Number(caseRecord?.case_id ?? appeal?.case_id);
  clearMemberAppealForm();
  if (mode === 'update') {
    memberAppealTitle.textContent = `Update appeal #${selectedMemberAppealId}`;
    memberAppealCopy.textContent = 'You may revise this submission until a reviewer is assigned.';
    memberAppealStatement.value = String(appeal?.statement || '');
    fillAppealEvidence(appeal?.evidence || []);
    submitMemberAppealButton.textContent = 'Save appeal update';
  } else {
    memberAppealTitle.textContent = 'Submit moderation appeal';
    memberAppealCopy.textContent = 'Your statement and evidence are visible only to authorised reviewers.';
    submitMemberAppealButton.textContent = 'Submit appeal';
  }
  const record = caseRecord || appeal?.case || {};
  memberAppealCase.textContent = `Case #${selectedMemberAppealCaseId || '—'} · ${appealActionLabel(record.action)}`;
  memberAppealCaseDetail.textContent = `${String(record.reason || 'No reason recorded.')} · Opened ${formatAccountDate(record.created_at)}`;
  openDashboardDialog(memberAppealDialog);
  memberAppealStatement?.focus();
};

const createAppealCard = ({ title, reason, status, meta, actions = [] }) => {
  const card = document.createElement('article');
  card.className = 'appeal-card';
  const copy = document.createElement('div');
  copy.className = 'appeal-card-copy';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const statusPill = document.createElement('span');
  statusPill.className = `appeal-status ${String(status || '').toLowerCase()}`.trim();
  statusPill.textContent = titleCaseState(status || 'available');
  const reasonText = document.createElement('p');
  reasonText.textContent = reason;
  const metadata = document.createElement('div');
  metadata.className = 'appeal-card-meta';
  for (const item of meta.filter(Boolean)) {
    const span = document.createElement('span');
    span.textContent = item;
    metadata.append(span);
  }
  copy.append(statusPill, heading, reasonText, metadata);
  const actionWrap = document.createElement('div');
  actionWrap.className = 'appeal-card-actions';
  actionWrap.append(...actions);
  card.append(copy, actionWrap);
  return card;
};

const actionButton = (label, callback, className = 'secondary-action compact-action') => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', callback);
  return button;
};

const renderMemberAppeals = (payload) => {
  memberAppealPayload = payload;
  appealGuest?.setAttribute('hidden', '');
  if (!payload?.linked) {
    appealUnlinked?.removeAttribute('hidden');
    appealContent?.setAttribute('hidden', '');
    return;
  }
  appealUnlinked?.setAttribute('hidden', '');
  appealContent?.removeAttribute('hidden');
  const settings = payload.settings || {};
  setText('[data-appeal-instructions]', String(settings.instructions || 'Explain why this action should be reviewed.'));
  setText('[data-appeal-deadline]', settings.enabled ? `${Number(settings.deadline_days) || 14} days after the case` : 'Appeals disabled');
  setText('[data-appeal-ticket-policy]', settings.create_ticket ? 'Private ticket created' : 'Dashboard only');
  setText('[data-appeal-punishment-policy]', settings.punishment_continues_during_review ? 'Remains active' : 'See case instructions');
  setText('[data-appeal-edit-policy]', settings.allow_edit_before_assignment ? 'Allowed before assignment' : 'Locked after submission');

  const eligible = Array.isArray(payload.eligible_cases) ? payload.eligible_cases : [];
  appealEligibleList?.replaceChildren();
  eligible.forEach((record) => {
    const submit = actionButton('Submit appeal', () => openMemberAppealEditor({ mode: 'submit', caseRecord: record }), 'primary-action compact-action');
    appealEligibleList?.append(createAppealCard({
      title: `Case #${record.case_id} · ${appealActionLabel(record.action)}`,
      reason: String(record.reason || 'No reason recorded.'),
      status: 'available',
      meta: [
        `Action date: ${formatAccountDate(record.created_at)}`,
        record.expires_at ? `Expires: ${formatAccountDate(record.expires_at)}` : '',
        `Appeal by: ${formatAccountDate(record.appeal_deadline_at)}`
      ],
      actions: [submit]
    }));
  });
  setText('[data-appeal-eligible-count]', String(eligible.length));
  if (appealEligibleEmpty) appealEligibleEmpty.hidden = eligible.length !== 0;

  const appeals = Array.isArray(payload.appeals) ? payload.appeals : [];
  memberAppealList?.replaceChildren();
  appeals.forEach((appeal) => {
    const actions = [];
    if (appeal.status === 'submitted' && settings.allow_edit_before_assignment) {
      actions.push(actionButton('Edit', () => openMemberAppealEditor({ mode: 'update', appeal })));
    }
    if (appeal.status === 'submitted') {
      actions.push(actionButton('Withdraw', () => {
        selectedWithdrawAppealId = Number(appeal.appeal_id);
        withdrawAppealForm?.reset();
        showInlineMessage(withdrawAppealMessage, '');
        openDashboardDialog(withdrawAppealDialog);
      }, 'secondary-action compact-action danger-outline'));
    }
    const ticket = appeal.ticket?.created
      ? `Ticket #${appeal.ticket.ticket_number} · ${titleCaseState(appeal.ticket.status)}`
      : `Ticket: ${titleCaseState(appeal.ticket?.status || 'not created')}`;
    const outcome = appeal.outcome ? `Outcome: ${titleCaseState(appeal.outcome)}` : '';
    memberAppealList?.append(createAppealCard({
      title: `Appeal #${appeal.appeal_id} · Case #${appeal.case_id}`,
      reason: String(appeal.statement || 'No statement available.'),
      status: appeal.status,
      meta: [
        appealActionLabel(appeal.case?.action),
        `Submitted: ${formatAccountDate(appeal.created_at)}`,
        ticket,
        outcome,
        appeal.decision_reason ? `Decision: ${appeal.decision_reason}` : ''
      ],
      actions
    }));
  });
  setText('[data-member-appeal-count]', String(appeals.length));
  if (memberAppealEmpty) memberAppealEmpty.hidden = appeals.length !== 0;
  if (memberAppealError) memberAppealError.hidden = true;
};

const loadMemberAppeals = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!sessionToken || memberAppealRequestInProgress) return false;
  memberAppealRequestInProgress = true;
  refreshMemberAppealsButton?.setAttribute('aria-busy', 'true');
  refreshMemberAppealsButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(ACCOUNT_APPEALS_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      showAuthMessage(payload.message || 'Sign in again to view appeals.', 'error');
      return false;
    }
    if (!response.ok) throw new Error(payload.message || 'Appeals are temporarily unavailable.');
    renderMemberAppeals(payload);
    return true;
  } catch (error) {
    if (memberAppealError) memberAppealError.hidden = false;
    showAuthMessage(error.message || 'Appeals are temporarily unavailable.', 'error');
    return false;
  } finally {
    memberAppealRequestInProgress = false;
    refreshMemberAppealsButton?.removeAttribute('aria-busy');
    refreshMemberAppealsButton?.removeAttribute('disabled');
  }
};

const submitMemberAppealAction = async (payload, messageElement, button) => {
  if (memberAppealActionInProgress) return null;
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken) {
    showInlineMessage(messageElement, 'Sign in with Discord to continue.');
    return null;
  }
  memberAppealActionInProgress = true;
  button?.setAttribute('disabled', '');
  button?.setAttribute('aria-busy', 'true');
  try {
    const response = await protectedActionFetch(ACCOUNT_APPEAL_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      closeDashboardDialog(memberAppealDialog);
      closeDashboardDialog(withdrawAppealDialog);
      showAuthMessage(result.message || 'Your session expired. Sign in again.', 'error');
      return null;
    }
    if (!response.ok) throw new Error(result.message || 'The appeal action could not be completed.');
    await loadMemberAppeals(sessionToken);
    await loadModerationQueue(sessionToken);
    showAuthMessage(result.message || 'Appeal updated.', 'success');
    return result;
  } catch (error) {
    showInlineMessage(messageElement, error.message || 'The appeal action could not be completed.');
    return null;
  } finally {
    memberAppealActionInProgress = false;
    button?.removeAttribute('disabled');
    button?.removeAttribute('aria-busy');
  }
};

memberAppealForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const statement = memberAppealStatement?.value.trim() || '';
  const payload = {
    action: selectedMemberAppealMode,
    statement,
    evidence: appealEvidenceFromForm()
  };
  if (selectedMemberAppealMode === 'update') payload.appeal_id = selectedMemberAppealId;
  else payload.case_id = selectedMemberAppealCaseId;
  const result = await submitMemberAppealAction(payload, memberAppealMessage, submitMemberAppealButton);
  if (result) closeDashboardDialog(memberAppealDialog);
});

withdrawAppealForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('[data-confirm-withdraw-appeal]');
  const result = await submitMemberAppealAction({
    action: 'withdraw',
    appeal_id: selectedWithdrawAppealId,
    reason: withdrawAppealReason?.value.trim() || ''
  }, withdrawAppealMessage, button);
  if (result) closeDashboardDialog(withdrawAppealDialog);
});

memberAppealCancelButtons.forEach((button) => button.addEventListener('click', () => closeDashboardDialog(memberAppealDialog)));
withdrawAppealCancelButtons.forEach((button) => button.addEventListener('click', () => closeDashboardDialog(withdrawAppealDialog)));
refreshMemberAppealsButton?.addEventListener('click', () => loadMemberAppeals());

const populateOwnerSelect = (element, options, selectedKey) => {
  if (!element) return;
  element.replaceChildren();
  (Array.isArray(options) ? options : []).forEach((option) => {
    const item = document.createElement('option');
    item.value = String(option.key || '');
    item.textContent = String(option.name || 'Unknown');
    item.selected = item.value === String(selectedKey || '');
    element.append(item);
  });
};

const applyOwnerAppealSettings = (payload) => {
  const settings = payload?.settings || {};
  if (ownerAppealEnabled) ownerAppealEnabled.checked = Boolean(settings.enabled);
  if (ownerAppealCreateTicket) ownerAppealCreateTicket.checked = Boolean(settings.create_ticket);
  if (ownerAppealEdit) ownerAppealEdit.checked = Boolean(settings.allow_edit_before_assignment);
  if (ownerAppealContinues) ownerAppealContinues.checked = Boolean(settings.punishment_continues_during_review);
  if (ownerAppealDeadline) ownerAppealDeadline.value = String(Number(settings.deadline_days) || 14);
  if (ownerAppealInstructions) ownerAppealInstructions.value = String(settings.instructions || '');
  populateOwnerSelect(ownerAppealCategory, payload?.categories, settings.ticket_category_key);
  populateOwnerSelect(ownerAppealRole, payload?.roles, settings.staff_role_key);
};

const handleOwnerAppealAuthFailure = (response, payload = {}) => {
  if (response.status === 401) {
    storageRemove(AUTH_SESSION_KEY);
    applySignedOutState();
    showAuthMessage(payload.message || 'Your session expired. Sign in again.', 'error');
    return true;
  }
  if (response.status === 403) {
    if (authenticatedUser?.membership) authenticatedUser.membership.access_level = 'member';
    applyAccessVisibility('member');
    showView('overview', false);
    showAuthMessage(payload.message || 'Owner access is required.', 'error');
    return true;
  }
  return false;
};

const loadOwnerAppealSettings = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (dashboardAccessLevel !== 'owner' || !sessionToken || ownerAppealRequestInProgress) return false;
  ownerAppealRequestInProgress = true;
  refreshAppealSettingsButton?.setAttribute('disabled', '');
  refreshAppealSettingsButton?.setAttribute('aria-busy', 'true');
  try {
    const response = await authFetch(OWNER_APPEAL_CONFIG_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleOwnerAppealAuthFailure(response, payload)) return false;
    if (!response.ok) throw new Error(payload.message || 'Appeal settings are temporarily unavailable.');
    applyOwnerAppealSettings(payload);
    showInlineMessage(ownerAppealMessage, '');
    return true;
  } catch (error) {
    showInlineMessage(ownerAppealMessage, error.message || 'Appeal settings are temporarily unavailable.');
    return false;
  } finally {
    ownerAppealRequestInProgress = false;
    refreshAppealSettingsButton?.removeAttribute('disabled');
    refreshAppealSettingsButton?.removeAttribute('aria-busy');
  }
};

saveAppealSettingsButton?.addEventListener('click', async () => {
  if (ownerAppealRequestInProgress) return;
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken) return;
  ownerAppealRequestInProgress = true;
  saveAppealSettingsButton.setAttribute('disabled', '');
  saveAppealSettingsButton.setAttribute('aria-busy', 'true');
  try {
    const response = await protectedActionFetch(OWNER_APPEAL_CONFIG_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        enabled: Boolean(ownerAppealEnabled?.checked),
        deadline_days: Number(ownerAppealDeadline?.value || 14),
        create_ticket: Boolean(ownerAppealCreateTicket?.checked),
        allow_edit_before_assignment: Boolean(ownerAppealEdit?.checked),
        punishment_continues_during_review: Boolean(ownerAppealContinues?.checked),
        ticket_category_key: ownerAppealCategory?.value || 'ticket_default',
        staff_role_key: ownerAppealRole?.value || 'ticket_default',
        instructions: ownerAppealInstructions?.value.trim() || ''
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleOwnerAppealAuthFailure(response, payload)) return;
    if (!response.ok) throw new Error(payload.message || 'Appeal settings could not be saved.');
    applyOwnerAppealSettings(payload);
    showInlineMessage(ownerAppealMessage, payload.message || 'Appeal settings saved.', 'success');
    await loadMemberAppeals(sessionToken);
  } catch (error) {
    showInlineMessage(ownerAppealMessage, error.message || 'Appeal settings could not be saved.');
  } finally {
    ownerAppealRequestInProgress = false;
    saveAppealSettingsButton.removeAttribute('disabled');
    saveAppealSettingsButton.removeAttribute('aria-busy');
  }
});
refreshAppealSettingsButton?.addEventListener('click', () => loadOwnerAppealSettings());

document.querySelectorAll('[data-copy-command]').forEach((button) => {
  const originalLabel = button.textContent;
  button.addEventListener('click', async () => {
    const command = String(button.dataset.copyCommand || '').trim();
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = `Copied ${command}`;
    } catch (error) {
      button.textContent = command;
    }
    window.setTimeout(() => { button.textContent = originalLabel; }, 1800);
  });
});

window.addEventListener('wwz:viewchange', (event) => {
  const { view, section } = event.detail || {};
  if (view === 'appeals') loadMemberAppeals();
  if (view === 'configuration' && section === 'appeals') loadOwnerAppealSettings();
});


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
    await loadMemberAppeals(sessionToken);
    await loadMemberShop(sessionToken);
    if (hasServerActionAccess()) await loadAdminShopOrders(sessionToken);
    if (dashboardAccessLevel === 'owner') {
      await loadOwnerAppealSettings(sessionToken);
      await loadOwnerShopConfig(sessionToken);
    }
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
    await loadMemberAppeals(payload.session_token);
    if (dashboardAccessLevel === 'owner') await loadOwnerAppealSettings(payload.session_token);
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
  storageSet(AUTH_RETURN_VIEW_KEY, navigationKey(activeView, activeDashboardSection || defaultSectionForView(activeView)));
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

const shopCatalogue = document.querySelector('[data-shop-catalogue]');
const shopSearch = document.querySelector('[data-shop-search]');
const shopCategory = document.querySelector('[data-shop-category]');
const shopEmpty = document.querySelector('[data-shop-empty]');
const shopError = document.querySelector('[data-shop-error]');
const refreshShopButton = document.querySelector('[data-refresh-shop]');
const refreshShopOrdersButton = document.querySelector('[data-refresh-shop-orders]');
const shopOrderGuest = document.querySelector('[data-shop-order-guest]');
const shopOrderUnlinked = document.querySelector('[data-shop-order-unlinked]');
const shopOrderContent = document.querySelector('[data-shop-order-content]');
const shopOrderList = document.querySelector('[data-shop-order-list]');
const shopOrderEmpty = document.querySelector('[data-shop-order-empty]');
const shopPurchaseDialog = document.querySelector('[data-shop-purchase-dialog]');
const shopPurchaseForm = document.querySelector('[data-shop-purchase-form]');
const shopPurchaseQuantity = document.querySelector('[data-shop-purchase-quantity]');
const shopPurchaseNote = document.querySelector('[data-shop-purchase-note]');
const shopPurchaseMessage = document.querySelector('[data-shop-purchase-message]');
const shopPurchaseCancelButtons = [...document.querySelectorAll('[data-shop-purchase-cancel]')];
const confirmShopPurchaseButton = document.querySelector('[data-confirm-shop-purchase]');
const adminShopOrderScope = document.querySelector('[data-admin-shop-order-scope]');
const adminShopOrderList = document.querySelector('[data-admin-shop-order-list]');
const adminShopOrderEmpty = document.querySelector('[data-admin-shop-order-empty]');
const adminShopOrderError = document.querySelector('[data-admin-shop-order-error]');
const refreshAdminShopOrdersButton = document.querySelector('[data-refresh-admin-shop-orders]');
const shopOrderNavBadge = document.querySelector('[data-shop-order-nav-badge]');
const shopOrderActionDialog = document.querySelector('[data-shop-order-action-dialog]');
const shopOrderActionForm = document.querySelector('[data-shop-order-action-form]');
const shopOrderActionNote = document.querySelector('[data-shop-order-action-note]');
const shopOrderActionMessage = document.querySelector('[data-shop-order-action-message]');
const shopOrderActionCancelButtons = [...document.querySelectorAll('[data-shop-order-action-cancel]')];
const confirmShopOrderActionButton = document.querySelector('[data-confirm-shop-order-action]');
const ownerShopEnabled = document.querySelector('[data-owner-shop-enabled]');
const ownerShopTitle = document.querySelector('[data-owner-shop-title]');
const ownerShopDescription = document.querySelector('[data-owner-shop-description]');
const ownerShopInstructions = document.querySelector('[data-owner-shop-instructions]');
const ownerShopMessage = document.querySelector('[data-owner-shop-message]');
const ownerShopItemList = document.querySelector('[data-owner-shop-item-list]');
const ownerShopEmpty = document.querySelector('[data-owner-shop-empty]');
const ownerShopError = document.querySelector('[data-owner-shop-error]');
const refreshShopConfigButton = document.querySelector('[data-refresh-shop-config]');
const saveShopSettingsButton = document.querySelector('[data-save-shop-settings]');
const newShopItemButton = document.querySelector('[data-new-shop-item]');
const shopItemDialog = document.querySelector('[data-shop-item-dialog]');
const shopItemForm = document.querySelector('[data-shop-item-form]');
const shopItemCancelButtons = [...document.querySelectorAll('[data-shop-item-cancel]')];
const shopItemMessage = document.querySelector('[data-shop-item-message]');

let shopItems = [];
let memberShopOrders = [];
let selectedShopItem = null;
let selectedShopOrder = null;
let selectedShopOrderAction = '';
let ownerShopItems = [];
let editingShopItemId = null;
let shopPurchasesEnabled = false;
let shopRequestInProgress = false;
let shopPurchaseInProgress = false;
let adminShopRequestInProgress = false;
let shopOrderActionInProgress = false;
let ownerShopRequestInProgress = false;

const shopStatusLabel = (status) => titleCaseState(status || 'unknown');
const shopStockText = (item) => item.stock_quantity == null ? 'Unlimited stock' : `${Number(item.stock_quantity)} in stock`;
const shopMemberLimitText = (item) => {
  if (item.max_per_player == null) return 'No lifetime limit';
  if (item.remaining_member_limit == null) return `Limit ${Number(item.max_per_player)} per player`;
  return `${Math.max(0, Number(item.remaining_member_limit))} remaining for you`;
};

const resetShopPanels = () => {
  shopOrderGuest?.removeAttribute('hidden');
  shopOrderUnlinked?.setAttribute('hidden', '');
  shopOrderContent?.setAttribute('hidden', '');
  memberShopOrders = [];
  if (shopOrderList) shopOrderList.replaceChildren();
  setText('[data-shop-wallet]', 'Sign in required');
  setText('[data-shop-open-orders]', '—');
};

const populateShopCategories = () => {
  if (!shopCategory) return;
  const selected = shopCategory.value || 'all';
  shopCategory.replaceChildren();
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'All categories';
  shopCategory.append(all);
  [...new Set(shopItems.map((item) => String(item.category)))].sort((a, b) => a.localeCompare(b)).forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    shopCategory.append(option);
  });
  shopCategory.value = [...shopCategory.options].some((option) => option.value === selected) ? selected : 'all';
};

const openShopPurchase = (item) => {
  if (!authenticatedUser) {
    handleAuthAction();
    return;
  }
  if (!shopPurchasesEnabled || !item?.available || shopPurchaseInProgress) return;
  selectedShopItem = item;
  shopPurchaseForm?.reset();
  if (shopPurchaseQuantity) {
    shopPurchaseQuantity.value = '1';
    shopPurchaseQuantity.max = String(Math.max(1, Math.min(
      Number(item.max_per_order || 1),
      item.stock_quantity == null ? 100 : Number(item.stock_quantity),
      item.remaining_member_limit == null ? 100 : Number(item.remaining_member_limit)
    )));
  }
  setText('[data-shop-purchase-title]', `Buy ${item.name}?`);
  setText('[data-shop-purchase-item]', `${item.name} · ${item.sku}`);
  setText('[data-shop-purchase-price]', `${formatMoney(item.price)} each · ${shopStockText(item)}`);
  showInlineMessage(shopPurchaseMessage, '');
  updateShopPurchaseTotal();
  if (typeof shopPurchaseDialog?.showModal === 'function') shopPurchaseDialog.showModal();
  else shopPurchaseDialog?.setAttribute('open', '');
};

const updateShopPurchaseTotal = () => {
  const quantity = Math.max(1, Number(shopPurchaseQuantity?.value || 1));
  const total = quantity * Number(selectedShopItem?.price || 0);
  setText('[data-shop-purchase-total]', `Your wallet will be debited ${formatMoney(total)} immediately.`);
};
shopPurchaseQuantity?.addEventListener('input', updateShopPurchaseTotal);

const renderShopCatalogue = () => {
  if (!shopCatalogue) return;
  const query = String(shopSearch?.value || '').trim().toLowerCase();
  const category = shopCategory?.value || 'all';
  const visible = shopItems.filter((item) => {
    const matchesCategory = category === 'all' || String(item.category) === category;
    const haystack = `${item.name} ${item.sku} ${item.category} ${item.description}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
  shopCatalogue.replaceChildren();
  visible.forEach((item) => {
    const card = document.createElement('article');
    card.className = `shop-item-card${item.available ? '' : ' unavailable'}`;
    const heading = document.createElement('div');
    heading.className = 'shop-item-heading';
    const copy = document.createElement('div');
    const categoryText = document.createElement('p');
    categoryText.className = 'panel-kicker';
    categoryText.textContent = `${item.category} · ${item.sku}`;
    const title = document.createElement('h2');
    title.textContent = item.name;
    copy.append(categoryText, title);
    const price = document.createElement('strong');
    price.className = 'shop-item-price';
    price.textContent = formatMoney(item.price);
    heading.append(copy, price);
    const description = document.createElement('p');
    description.textContent = item.description;
    const meta = document.createElement('div');
    meta.className = 'shop-item-meta';
    [shopStockText(item), `Max ${item.max_per_order}/order`, shopMemberLimitText(item)].forEach((value) => {
      const span = document.createElement('span');
      span.textContent = value;
      meta.append(span);
    });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary-action wide';
    const linked = !document.querySelector('[data-shop-order-content]')?.hidden;
    const canBuy = shopPurchasesEnabled && linked && item.available;
    button.textContent = !shopPurchasesEnabled ? 'Purchases paused' : !authenticatedUser ? 'Sign in to buy' : !linked ? 'Link PSN to buy' : item.available ? 'Buy item' : 'Unavailable';
    button.disabled = !shopPurchasesEnabled || Boolean(authenticatedUser && !canBuy);
    button.addEventListener('click', () => openShopPurchase(item));
    card.append(heading, description, meta, button);
    shopCatalogue.append(card);
  });
  if (shopEmpty) shopEmpty.hidden = visible.length !== 0;
};

const renderMemberShopOrders = (orders) => {
  if (!shopOrderList) return;
  shopOrderList.replaceChildren();
  const safeOrders = Array.isArray(orders) ? orders : [];
  safeOrders.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'shop-order-card';
    const heading = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `Order #${order.order_id} · ${order.quantity} × ${order.item.name}`;
    const status = document.createElement('span');
    status.className = `shop-order-status ${String(order.status)}`;
    status.textContent = shopStatusLabel(order.status);
    heading.append(title, status);
    const meta = document.createElement('p');
    meta.textContent = `${formatMoney(order.total_price)} · Ordered ${formatAccountDate(order.created_at)}${order.handled_by_name ? ` · ${order.handled_by_name}` : ''}`;
    card.append(heading, meta);
    if (order.buyer_note) {
      const note = document.createElement('small');
      note.textContent = `Your note: ${order.buyer_note}`;
      card.append(note);
    }
    if (order.fulfilment_note) {
      const note = document.createElement('small');
      note.textContent = `Staff update: ${order.fulfilment_note}`;
      card.append(note);
    }
    shopOrderList.append(card);
  });
  if (shopOrderEmpty) shopOrderEmpty.hidden = safeOrders.length !== 0;
};

const applyShopPayload = (payload, { member = false } = {}) => {
  const settings = payload?.settings || {};
  shopPurchasesEnabled = Boolean(settings.enabled);
  shopItems = Array.isArray(payload?.items) ? payload.items : [];
  setText('[data-shop-title]', settings.title || 'Survivor shop.');
  setText('[data-shop-description]', settings.description || 'Spend your verified community balance on approved goods and services.');
  setText('[data-shop-instructions]', settings.purchase_instructions || 'Staff will arrange fulfilment after purchase.');
  setText('[data-shop-item-count]', String(shopItems.length));
  setText('[data-shop-status-label]', settings.enabled ? 'Shop open' : 'Purchases paused');
  setStatusClass(document.querySelector('[data-shop-status-badge]'), settings.enabled ? 'online' : 'unavailable');
  populateShopCategories();
  if (member) {
    shopOrderGuest?.setAttribute('hidden', '');
    if (!payload.linked) {
      shopOrderUnlinked?.removeAttribute('hidden');
      shopOrderContent?.setAttribute('hidden', '');
      setText('[data-shop-wallet]', 'PSN link required');
      setText('[data-shop-open-orders]', '—');
    } else {
      shopOrderUnlinked?.setAttribute('hidden', '');
      shopOrderContent?.removeAttribute('hidden');
      memberShopOrders = Array.isArray(payload.orders) ? payload.orders : [];
      setText('[data-shop-wallet]', formatMoney(payload.balance));
      setText('[data-shop-open-orders]', String(memberShopOrders.filter((order) => ['pending', 'processing'].includes(order.status)).length));
      renderMemberShopOrders(memberShopOrders);
    }
  }
  renderShopCatalogue();
};

const loadPublicShop = async () => {
  if (shopRequestInProgress) return;
  shopRequestInProgress = true;
  refreshShopButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(SHOP_CATALOGUE_URL, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Shop unavailable');
    applyShopPayload(payload);
    if (shopError) shopError.hidden = true;
  } catch (error) {
    if (shopError) shopError.hidden = false;
  } finally {
    shopRequestInProgress = false;
    refreshShopButton?.removeAttribute('disabled');
  }
};

const loadMemberShop = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!sessionToken) return false;
  if (shopRequestInProgress) {
    window.setTimeout(() => loadMemberShop(sessionToken), 250);
    return false;
  }
  shopRequestInProgress = true;
  refreshShopButton?.setAttribute('disabled', '');
  refreshShopOrdersButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(ACCOUNT_SHOP_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return false;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Shop unavailable');
    applyShopPayload(payload, { member: true });
    if (shopError) shopError.hidden = true;
    return true;
  } catch (error) {
    if (shopError) shopError.hidden = false;
    return false;
  } finally {
    shopRequestInProgress = false;
    refreshShopButton?.removeAttribute('disabled');
    refreshShopOrdersButton?.removeAttribute('disabled');
  }
};

shopSearch?.addEventListener('input', renderShopCatalogue);
shopCategory?.addEventListener('change', renderShopCatalogue);
refreshShopButton?.addEventListener('click', () => storageGet(AUTH_SESSION_KEY) ? loadMemberShop() : loadPublicShop());
refreshShopOrdersButton?.addEventListener('click', () => loadMemberShop());
shopPurchaseCancelButtons.forEach((button) => button.addEventListener('click', () => { if (!shopPurchaseInProgress) shopPurchaseDialog?.close?.(); }));
shopPurchaseForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || !selectedShopItem || shopPurchaseInProgress) return;
  shopPurchaseInProgress = true;
  confirmShopPurchaseButton?.setAttribute('disabled', '');
  showInlineMessage(shopPurchaseMessage, 'Railway is validating stock, purchase limits and your wallet.', 'info');
  try {
    const response = await protectedActionFetch(ACCOUNT_SHOP_PURCHASE_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        item_id: Number(selectedShopItem.item_id),
        quantity: Number(shopPurchaseQuantity?.value || 1),
        buyer_note: shopPurchaseNote?.value.trim() || '',
        purchase_key: `${Date.now().toString(36)}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-shop`
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      shopPurchaseDialog?.close?.();
      return;
    }
    if (!response.ok) throw new Error(payload.message || 'The purchase could not be completed.');
    showInlineMessage(shopPurchaseMessage, payload.message || 'Order placed.', 'success');
    await loadMemberShop(sessionToken);
    window.setTimeout(() => shopPurchaseDialog?.close?.(), 900);
  } catch (error) {
    showInlineMessage(shopPurchaseMessage, error.message || 'The purchase could not be completed.');
  } finally {
    shopPurchaseInProgress = false;
    confirmShopPurchaseButton?.removeAttribute('disabled');
  }
});

const adminShopActionButton = (label, action, order, danger = false) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${danger ? 'primary-action danger-action' : 'secondary-action'} compact-action`;
  button.textContent = label;
  button.addEventListener('click', () => {
    selectedShopOrder = order;
    selectedShopOrderAction = action;
    shopOrderActionForm?.reset();
    setText('[data-shop-order-action-title]', `${label} order #${order.order_id}?`);
    setText('[data-shop-order-action-target]', `${order.buyer.psn_id} · ${order.quantity} × ${order.item.name}`);
    setText('[data-shop-order-action-detail]', `${formatMoney(order.total_price)} · ${shopStatusLabel(order.status)}`);
    setText('[data-shop-order-action-warning]', ['cancel', 'refund'].includes(action) ? 'Full economy refund and stock restoration' : 'Permanent order audit entry');
    showInlineMessage(shopOrderActionMessage, '');
    if (typeof shopOrderActionDialog?.showModal === 'function') shopOrderActionDialog.showModal();
    else shopOrderActionDialog?.setAttribute('open', '');
  });
  return button;
};

const renderAdminShopOrders = (payload) => {
  if (!adminShopOrderList) return;
  adminShopOrderList.replaceChildren();
  const summary = payload?.summary || {};
  ['open', 'pending', 'processing', 'fulfilled', 'refunded', 'cancelled'].forEach((key) => setText(`[data-admin-shop-${key}]`, String(Number(summary[key] || 0))));
  const openCount = Number(summary.open || 0);
  if (shopOrderNavBadge) {
    shopOrderNavBadge.textContent = String(openCount);
    shopOrderNavBadge.hidden = openCount === 0;
  }
  const orders = Array.isArray(payload?.orders) ? payload.orders : [];
  orders.forEach((order) => {
    const card = document.createElement('article');
    card.className = 'shop-order-card admin-order';
    const heading = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `#${order.order_id} · ${order.buyer.psn_id} · ${order.quantity} × ${order.item.name}`;
    const status = document.createElement('span');
    status.className = `shop-order-status ${order.status}`;
    status.textContent = shopStatusLabel(order.status);
    heading.append(title, status);
    const detail = document.createElement('p');
    detail.textContent = `${formatMoney(order.total_price)} · ${order.buyer.discord_name} · ${formatAccountDate(order.created_at)}`;
    const actions = document.createElement('div');
    actions.className = 'heading-actions';
    if (order.status === 'pending') {
      actions.append(adminShopActionButton('Start processing', 'start_processing', order));
      actions.append(adminShopActionButton('Cancel & refund', 'cancel', order, true));
    } else if (order.status === 'processing') {
      actions.append(adminShopActionButton('Mark fulfilled', 'fulfill', order));
      actions.append(adminShopActionButton('Cancel & refund', 'cancel', order, true));
    } else if (order.status === 'fulfilled') {
      actions.append(adminShopActionButton('Refund order', 'refund', order, true));
    }
    card.append(heading, detail);
    if (order.item.fulfilment_instructions) {
      const instructions = document.createElement('small');
      instructions.textContent = `Fulfilment instructions: ${order.item.fulfilment_instructions}`;
      card.append(instructions);
    }
    if (order.buyer_note) {
      const note = document.createElement('small');
      note.textContent = `Buyer note: ${order.buyer_note}`;
      card.append(note);
    }
    if (actions.childElementCount) card.append(actions);
    adminShopOrderList.append(card);
  });
  if (adminShopOrderEmpty) adminShopOrderEmpty.hidden = orders.length !== 0;
  if (adminShopOrderError) adminShopOrderError.hidden = true;
};

const loadAdminShopOrders = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!sessionToken || !hasServerActionAccess() || adminShopRequestInProgress) return false;
  adminShopRequestInProgress = true;
  refreshAdminShopOrdersButton?.setAttribute('disabled', '');
  try {
    const scope = encodeURIComponent(adminShopOrderScope?.value || 'open');
    const response = await authFetch(`${ADMIN_SHOP_ORDERS_URL}?status=${scope}&limit=75`, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Orders unavailable');
    renderAdminShopOrders(payload);
    return true;
  } catch (error) {
    if (adminShopOrderError) adminShopOrderError.hidden = false;
    return false;
  } finally {
    adminShopRequestInProgress = false;
    refreshAdminShopOrdersButton?.removeAttribute('disabled');
  }
};
adminShopOrderScope?.addEventListener('change', () => loadAdminShopOrders());
refreshAdminShopOrdersButton?.addEventListener('click', () => loadAdminShopOrders());
shopOrderActionCancelButtons.forEach((button) => button.addEventListener('click', () => { if (!shopOrderActionInProgress) shopOrderActionDialog?.close?.(); }));
shopOrderActionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || !selectedShopOrder || !selectedShopOrderAction || shopOrderActionInProgress) return;
  shopOrderActionInProgress = true;
  confirmShopOrderActionButton?.setAttribute('disabled', '');
  showInlineMessage(shopOrderActionMessage, 'Railway is updating the order and economy audit.', 'info');
  try {
    const response = await protectedActionFetch(ADMIN_SHOP_ORDER_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ order_id: selectedShopOrder.order_id, action: selectedShopOrderAction, note: shopOrderActionNote?.value.trim() || '' })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return;
    if (!response.ok) throw new Error(payload.message || 'The order could not be updated.');
    showInlineMessage(shopOrderActionMessage, payload.message || 'Order updated.', 'success');
    await Promise.all([loadAdminShopOrders(sessionToken), loadMemberShop(sessionToken)]);
    window.setTimeout(() => shopOrderActionDialog?.close?.(), 800);
  } catch (error) {
    showInlineMessage(shopOrderActionMessage, error.message || 'The order could not be updated.');
  } finally {
    shopOrderActionInProgress = false;
    confirmShopOrderActionButton?.removeAttribute('disabled');
  }
});

const ownerShopEditButton = (item) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'table-button';
  button.textContent = 'Edit';
  button.addEventListener('click', () => openShopItemEditor(item));
  return button;
};

const renderOwnerShopItems = () => {
  if (!ownerShopItemList) return;
  ownerShopItemList.replaceChildren();
  ownerShopItems.forEach((item) => {
    const row = document.createElement('tr');
    const itemCell = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = item.name;
    const small = document.createElement('small');
    small.textContent = item.sku;
    itemCell.append(strong, document.createElement('br'), small);
    const category = document.createElement('td'); category.textContent = item.category;
    const price = document.createElement('td'); price.textContent = formatMoney(item.price);
    const stock = document.createElement('td'); stock.textContent = item.stock_quantity == null ? 'Unlimited' : String(item.stock_quantity);
    const limits = document.createElement('td'); limits.textContent = `${item.max_per_order}/order · ${item.max_per_player == null ? 'No player limit' : `${item.max_per_player}/player`}`;
    const state = document.createElement('td');
    const pill = document.createElement('span'); pill.className = `table-status ${item.active ? 'online' : 'offline'}`; pill.textContent = item.active ? 'Active' : 'Inactive'; state.append(pill);
    const action = document.createElement('td'); action.append(ownerShopEditButton(item));
    row.append(itemCell, category, price, stock, limits, state, action);
    ownerShopItemList.append(row);
  });
  if (ownerShopEmpty) ownerShopEmpty.hidden = ownerShopItems.length !== 0;
};

const openShopItemEditor = (item = null) => {
  editingShopItemId = item?.item_id == null ? null : Number(item.item_id);
  shopItemForm?.reset();
  setText('[data-shop-item-dialog-title]', item ? `Edit ${item.name}` : 'Create shop item');
  const values = {
    '[data-shop-item-sku]': item?.sku || '', '[data-shop-item-name]': item?.name || '',
    '[data-shop-item-category]': item?.category || '', '[data-shop-item-price]': item?.price || '',
    '[data-shop-item-stock]': item?.stock_quantity ?? '', '[data-shop-item-max-order]': item?.max_per_order || 1,
    '[data-shop-item-max-player]': item?.max_per_player ?? '', '[data-shop-item-sort]': item?.sort_order || 0,
    '[data-shop-item-description]': item?.description || '', '[data-shop-item-fulfilment]': item?.fulfilment_instructions || ''
  };
  Object.entries(values).forEach(([selector, value]) => { const element = document.querySelector(selector); if (element) element.value = String(value); });
  const active = document.querySelector('[data-shop-item-active]'); if (active) active.checked = item ? Boolean(item.active) : true;
  showInlineMessage(shopItemMessage, '');
  if (typeof shopItemDialog?.showModal === 'function') shopItemDialog.showModal();
  else shopItemDialog?.setAttribute('open', '');
};
newShopItemButton?.addEventListener('click', () => openShopItemEditor());
shopItemCancelButtons.forEach((button) => button.addEventListener('click', () => { if (!ownerShopRequestInProgress) shopItemDialog?.close?.(); }));

const loadOwnerShopConfig = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!sessionToken || dashboardAccessLevel !== 'owner' || ownerShopRequestInProgress) return false;
  ownerShopRequestInProgress = true;
  refreshShopConfigButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(OWNER_SHOP_CONFIG_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Configuration unavailable');
    const settings = payload.settings || {};
    if (ownerShopEnabled) ownerShopEnabled.checked = Boolean(settings.enabled);
    if (ownerShopTitle) ownerShopTitle.value = String(settings.title || '');
    if (ownerShopDescription) ownerShopDescription.value = String(settings.description || '');
    if (ownerShopInstructions) ownerShopInstructions.value = String(settings.purchase_instructions || '');
    ownerShopItems = Array.isArray(payload.items) ? payload.items : [];
    renderOwnerShopItems();
    if (ownerShopError) ownerShopError.hidden = true;
    return true;
  } catch (error) {
    if (ownerShopError) ownerShopError.hidden = false;
    return false;
  } finally {
    ownerShopRequestInProgress = false;
    refreshShopConfigButton?.removeAttribute('disabled');
  }
};
refreshShopConfigButton?.addEventListener('click', () => loadOwnerShopConfig());
saveShopSettingsButton?.addEventListener('click', async () => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || dashboardAccessLevel !== 'owner' || ownerShopRequestInProgress) return;
  ownerShopRequestInProgress = true;
  saveShopSettingsButton.setAttribute('disabled', '');
  showInlineMessage(ownerShopMessage, 'Saving shop settings…', 'info');
  try {
    const response = await protectedActionFetch(OWNER_SHOP_SETTINGS_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        enabled: Boolean(ownerShopEnabled?.checked), title: ownerShopTitle?.value.trim() || '',
        description: ownerShopDescription?.value.trim() || '', purchase_instructions: ownerShopInstructions?.value.trim() || ''
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return;
    if (!response.ok) throw new Error(payload.message || 'Settings could not be saved.');
    showInlineMessage(ownerShopMessage, payload.message || 'Shop settings saved.', 'success');
    ownerShopRequestInProgress = false;
    await Promise.all([loadOwnerShopConfig(sessionToken), loadMemberShop(sessionToken)]);
  } catch (error) {
    showInlineMessage(ownerShopMessage, error.message || 'Settings could not be saved.');
  } finally {
    ownerShopRequestInProgress = false;
    saveShopSettingsButton.removeAttribute('disabled');
  }
});
shopItemForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || dashboardAccessLevel !== 'owner' || ownerShopRequestInProgress) return;
  ownerShopRequestInProgress = true;
  document.querySelector('[data-save-shop-item]')?.setAttribute('disabled', '');
  showInlineMessage(shopItemMessage, 'Saving catalogue item…', 'info');
  const value = (selector) => document.querySelector(selector)?.value ?? '';
  try {
    const response = await protectedActionFetch(OWNER_SHOP_ITEM_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        item_id: editingShopItemId, sku: value('[data-shop-item-sku]'), name: value('[data-shop-item-name]'),
        category: value('[data-shop-item-category]'), price: value('[data-shop-item-price]'),
        stock_quantity: value('[data-shop-item-stock]'), max_per_order: value('[data-shop-item-max-order]'),
        max_per_player: value('[data-shop-item-max-player]'), sort_order: value('[data-shop-item-sort]'),
        description: value('[data-shop-item-description]'), fulfilment_instructions: value('[data-shop-item-fulfilment]'),
        active: Boolean(document.querySelector('[data-shop-item-active]')?.checked)
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return;
    if (!response.ok) throw new Error(payload.message || 'The item could not be saved.');
    showInlineMessage(shopItemMessage, payload.message || 'Item saved.', 'success');
    ownerShopRequestInProgress = false;
    await Promise.all([loadOwnerShopConfig(sessionToken), loadMemberShop(sessionToken)]);
    window.setTimeout(() => shopItemDialog?.close?.(), 800);
  } catch (error) {
    showInlineMessage(shopItemMessage, error.message || 'The item could not be saved.');
  } finally {
    ownerShopRequestInProgress = false;
    document.querySelector('[data-save-shop-item]')?.removeAttribute('disabled');
  }
});

window.addEventListener('wwz:viewchange', (event) => {
  const { view, section } = event.detail || {};
  const token = storageGet(AUTH_SESSION_KEY);
  if (view === 'shop') token ? loadMemberShop(token) : loadPublicShop();
  if (view === 'staff' && section === 'shop-orders') loadAdminShopOrders(token);
  if (view === 'configuration' && section === 'shop-config') loadOwnerShopConfig(token);
});
loadPublicShop();

const commands = [
  {"name": "account", "category": "Accounts", "description": "Advanced account linking and administration group.", "access": "Member"},
  {"name": "adm", "category": "ADM intelligence", "description": "Advanced ADM intelligence group.", "access": "Admin"},
  {"name": "adminlink", "category": "Accounts", "description": "Link a Discord member to a PlayStation identity.", "access": "Admin"},
  {"name": "admstats", "category": "ADM intelligence", "description": "View ADM intelligence statistics.", "access": "Admin"},
  {"name": "appeal", "category": "Support & appeals", "description": "Appeal one of your own eligible moderation cases.", "access": "Member"},
  {"name": "balance", "category": "Economy", "description": "View a survivor wallet.", "access": "Member"},
  {"name": "ban", "category": "Moderation", "description": "Ban a Discord member.", "access": "Admin"},
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
  {"name": "purge", "category": "Moderation", "description": "Bulk-delete recent messages from a channel.", "access": "Admin"},
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
  {"name": "order", "category": "Shop", "description": "View one shop order and its audit history.", "access": "Member"}
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
