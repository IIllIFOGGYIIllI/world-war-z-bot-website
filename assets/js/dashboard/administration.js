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


const showDiscordLogMessage = (message = '', tone = 'error') => {
  if (!discordLogMessage) return;
  discordLogMessage.hidden = !message;
  discordLogMessage.textContent = message;
  discordLogMessage.dataset.tone = tone;
};

const discordLogAction = async (action, logType, channelKey = '', button = null) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || dashboardAccessLevel !== 'owner' || discordLogRequestInProgress) return false;
  discordLogRequestInProgress = true;
  const originalLabel = button?.textContent || '';
  if (button) { button.disabled = true; button.textContent = 'Working…'; }
  showDiscordLogMessage('');
  try {
    const response = await protectedActionFetch(OWNER_DISCORD_LOG_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({ action, log_type: logType, channel_key: channelKey || null })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Discord logging operation failed.');
    showDiscordLogMessage(payload.message || 'Discord logging configuration updated.', 'success');
    discordLogRequestInProgress = false;
    await loadDiscordLogConfiguration();
    return true;
  } catch (error) {
    showDiscordLogMessage(error instanceof Error ? error.message : 'Discord logging operation failed.');
    return false;
  } finally {
    discordLogRequestInProgress = false;
    if (button) { button.disabled = false; button.textContent = originalLabel; }
  }
};

const renderDiscordLogConfiguration = () => {
  if (!discordLogList) return;
  const query = String(discordLogSearch?.value || '').trim().toLowerCase();
  const rows = discordLogConfiguration.log_types.filter((entry) => {
    const haystack = `${entry.label || ''} ${entry.description || ''} ${entry.channel_name || ''}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  discordLogList.replaceChildren();
  const connectedCount = discordLogConfiguration.log_types.filter((entry) => entry.connected).length;
  setText('[data-discord-log-summary]', `${connectedCount} / ${discordLogConfiguration.log_types.length} connected`);
  if (discordLogEmpty) discordLogEmpty.hidden = rows.length !== 0;

  rows.forEach((entry) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const name = document.createElement('strong');
    name.textContent = String(entry.label || titleCaseState(entry.log_type));
    const description = document.createElement('small');
    description.textContent = String(entry.description || 'Discord audit activity');
    nameCell.append(name, document.createElement('br'), description);

    const channelCell = document.createElement('td');
    const select = document.createElement('select');
    select.className = 'discord-log-channel-select';
    select.setAttribute('aria-label', `${entry.label} channel`);
    select.append(createSelectOption('', 'Select or search channel'));
    discordLogConfiguration.channels.forEach((channel) => {
      const prefix = channel.category ? `${channel.category} / ` : '';
      select.append(createSelectOption(
        channel.channel_key,
        `${prefix}#${channel.name}${channel.can_log ? '' : ' · missing permissions'}`,
        { disabled: !channel.can_log }
      ));
    });
    select.value = entry.channel_key || '';
    channelCell.append(select);

    const statusCell = document.createElement('td');
    const status = document.createElement('span');
    status.className = `table-status ${entry.connected ? 'online' : entry.enabled_by_code ? 'neutral' : 'offline'}`;
    status.textContent = entry.connected ? 'Connected' : entry.enabled_by_code ? 'Not connected' : 'Disabled in bot';
    statusCell.append(status);
    if (entry.updated_at) {
      const updated = document.createElement('small');
      updated.className = 'discord-log-updated';
      updated.textContent = `Updated ${formatAccountDate(entry.updated_at)}${entry.updated_by_name ? ` by ${entry.updated_by_name}` : ''}`;
      statusCell.append(updated);
    }

    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'discord-log-actions';
    const save = document.createElement('button');
    save.type = 'button'; save.className = 'primary-action compact-action'; save.textContent = entry.connected ? 'Update' : 'Connect';
    save.disabled = !entry.enabled_by_code;
    save.addEventListener('click', () => {
      if (!select.value) { showDiscordLogMessage('Select a Discord text channel first.'); return; }
      discordLogAction('set_channel', entry.log_type, select.value, save);
    });
    const test = document.createElement('button');
    test.type = 'button'; test.className = 'secondary-action compact-action'; test.textContent = 'Test'; test.disabled = !entry.connected;
    test.addEventListener('click', () => discordLogAction('test_channel', entry.log_type, '', test));
    const disconnect = document.createElement('button');
    disconnect.type = 'button'; disconnect.className = 'activity-row-action danger'; disconnect.textContent = 'Disconnect'; disconnect.disabled = !entry.connected;
    disconnect.addEventListener('click', () => {
      if (!window.confirm(`Disconnect ${entry.label}? Discord events in this category will stop being delivered until it is reconnected.`)) return;
      discordLogAction('disable_channel', entry.log_type, '', disconnect);
    });
    actions.append(save, test, disconnect);
    actionCell.append(actions);
    row.append(nameCell, channelCell, statusCell, actionCell);
    discordLogList.append(row);
  });
};

const loadDiscordLogConfiguration = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (dashboardAccessLevel !== 'owner' || !sessionToken || discordLogRequestInProgress) return false;
  discordLogRequestInProgress = true;
  refreshDiscordLogsButton?.setAttribute('disabled', '');
  if (discordLogError) discordLogError.hidden = true;
  try {
    const response = await authFetch(OWNER_DISCORD_LOG_CONFIG_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Discord logging configuration unavailable.');
    discordLogConfiguration = {
      channels: Array.isArray(payload.channels) ? payload.channels : [],
      log_types: Array.isArray(payload.log_types) ? payload.log_types : []
    };
    renderDiscordLogConfiguration();
    return true;
  } catch (error) {
    discordLogList?.replaceChildren();
    if (discordLogError) {
      discordLogError.hidden = false;
      discordLogError.textContent = error instanceof Error ? error.message : 'Discord logging configuration is temporarily unavailable.';
    }
    setText('[data-discord-log-summary]', 'Unavailable');
    return false;
  } finally {
    discordLogRequestInProgress = false;
    refreshDiscordLogsButton?.removeAttribute('disabled');
  }
};

refreshDiscordLogsButton?.addEventListener('click', () => loadDiscordLogConfiguration());
discordLogSearch?.addEventListener('input', renderDiscordLogConfiguration);
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
  if (view === 'configuration' && section === 'discord-logs') loadDiscordLogConfiguration();
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
      : (source?.source === 'bot_cases' ? 'Bot-managed DayZ ban' : 'Nitrado game ban list');
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
    const partial = !payload?.discord?.available || !payload?.dayz?.available || Boolean(payload?.dayz?.partial);
    const sourceNote = payload?.dayz?.message ? ` ${String(payload.dayz.message)}` : '';
    banlistChecked.textContent = payload?.checked_at
      ? `${partial ? 'Partially refreshed' : 'Refreshed'} ${formatAccountDate(payload.checked_at)}.${sourceNote}`
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


