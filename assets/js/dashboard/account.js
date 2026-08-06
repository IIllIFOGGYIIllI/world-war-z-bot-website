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
  const discord = payload.discord || {};
  const discordName = String(discord.display_name || authenticatedUser?.user?.display_name || 'Discord survivor');
  const discordUsername = String(discord.username || authenticatedUser?.user?.username || 'account');
  const discordInitials = discordName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'WZ';
  renderDiscordAvatar('[data-profile-discord-avatar]', discord.avatar_url, discordInitials, `${discordName} Discord avatar`);
  setText('[data-profile-discord-name]', discordName);
  setText('[data-profile-discord-username]', `@${discordUsername}`);
  setText('[data-profile-access-level]', accessLabel(payload.access_level || authenticatedUser?.membership?.access_level || 'member'));
  setText('[data-profile-discord-joined]', formatAccountDate(discord.joined_at));
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

  try {
    const response = await window.WWZHttp.request(SERVER_STATUS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }, 8_000);
    if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
    applyLiveStatus(await response.json());
  } catch (error) {
    showStatusUnavailable();
  } finally {
    statusRequestInProgress = false;
    refreshStatusButton?.classList.remove('is-loading');
    refreshStatusButton?.removeAttribute('aria-busy');
  }
};

refreshStatusButton?.addEventListener('click', refreshLiveStatus);
refreshLiveStatus();
window.setInterval(refreshLiveStatus, LIVE_STATUS_REFRESH_MS);

