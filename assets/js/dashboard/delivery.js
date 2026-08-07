// Saved coordinates, event-delivery operations and Owner mission-file workspace.
const deliveryLocationForm = document.querySelector('[data-location-form]');
const deliveryLocationId = document.querySelector('[data-location-id]');
const deliveryLocationName = document.querySelector('[data-location-name]');
const deliveryLocationX = document.querySelector('[data-location-x]');
const deliveryLocationY = document.querySelector('[data-location-y]');
const deliveryLocationZ = document.querySelector('[data-location-z]');
const deliveryLocationRotation = document.querySelector('[data-location-rotation]');
const deliveryLocationDefault = document.querySelector('[data-location-default]');
const deliveryLocationMessage = document.querySelector('[data-location-message]');
const savedDeliveryLocationList = document.querySelector('[data-saved-location-list]');
const savedDeliveryLocationEmpty = document.querySelector('[data-saved-location-empty]');
const savedDeliveryLocationError = document.querySelector('[data-saved-location-error]');
const refreshDeliveryLocationsButton = document.querySelector('[data-refresh-delivery-locations]');
const cancelDeliveryLocationEditButton = document.querySelector('[data-cancel-location-edit]');
const saveDeliveryLocationButton = document.querySelector('[data-save-location]');
const deliveryLocationMap = document.querySelector('[data-location-map]');
const deliveryLocationMapReadout = document.querySelector('[data-location-map-readout]');
let deliveryLocationRequestInProgress = false;
let deliveryLocationMapInstance = null;

const deliveryLocationCoordinates = () => {
  const rawX = String(deliveryLocationX?.value ?? '').trim();
  const rawZ = String(deliveryLocationZ?.value ?? '').trim();
  const x = Number(rawX);
  const z = Number(rawZ);
  const valid = rawX !== '' && rawZ !== '' && Number.isFinite(x) && Number.isFinite(z) && x >= 0 && x <= 15360 && z >= 0 && z <= 15360;
  return { valid, x, z };
};

const syncDeliveryLocationMap = ({ center = false } = {}) => {
  const { valid, x, z } = deliveryLocationCoordinates();
  if (deliveryLocationMapReadout && !deliveryLocationMapInstance) {
    deliveryLocationMapReadout.textContent = valid ? `X ${x.toFixed(1)} · Z ${z.toFixed(1)}` : 'No coordinates selected';
  }
  if (!deliveryLocationMapInstance) return;
  if (valid) deliveryLocationMapInstance.setSelection(x, z, { notify: false, center, zoom: 6 });
  else deliveryLocationMapInstance.clearSelection({ notify: false });
};

const ensureDeliveryLocationMap = () => {
  if (deliveryLocationMapInstance || !deliveryLocationMap || !window.WWZChernarusMap) return deliveryLocationMapInstance;
  deliveryLocationMapInstance = window.WWZChernarusMap.create(deliveryLocationMap, {
    mode: 'saved-location',
    selectable: true,
    copyOnSelect: false,
    roadsVisible: true,
    trailsVisible: false,
    selectedElement: deliveryLocationMapReadout,
    zoomInButton: document.querySelector('[data-location-map-zoom-in]'),
    zoomOutButton: document.querySelector('[data-location-map-zoom-out]'),
    resetButton: document.querySelector('[data-location-map-reset]'),
    fullscreenButton: document.querySelector('[data-location-map-fullscreen]'),
    fullscreenTarget: deliveryLocationMap,
    emptySelectionText: 'No coordinates selected',
    onSelect: ({ x, z }) => {
      if (deliveryLocationX) deliveryLocationX.value = x.toFixed(1);
      if (deliveryLocationZ) deliveryLocationZ.value = z.toFixed(1);
      if (deliveryLocationY && deliveryLocationY.value === '') deliveryLocationY.value = '0';
      syncDeliveryLocationMap();
    }
  });
  syncDeliveryLocationMap();
  return deliveryLocationMapInstance;
};

const resetDeliveryLocationForm = () => {
  deliveryLocationForm?.reset();
  if (deliveryLocationId) deliveryLocationId.value = '';
  if (deliveryLocationRotation) deliveryLocationRotation.value = '0';
  setText('[data-location-form-title]', 'Save a location');
  cancelDeliveryLocationEditButton?.setAttribute('hidden', '');
  showInlineMessage(deliveryLocationMessage, '');
  deliveryLocationMapInstance?.clearSelection({ notify: false });
  deliveryLocationMapInstance?.reset();
  if (deliveryLocationMapReadout) deliveryLocationMapReadout.textContent = 'No coordinates selected';
};

const editDeliveryLocation = (location) => {
  if (!location) return;
  if (deliveryLocationId) deliveryLocationId.value = String(location.location_id);
  if (deliveryLocationName) deliveryLocationName.value = String(location.name || '');
  if (deliveryLocationX) deliveryLocationX.value = Number(location.x).toFixed(1);
  if (deliveryLocationY) deliveryLocationY.value = String(location.y);
  if (deliveryLocationZ) deliveryLocationZ.value = Number(location.z).toFixed(1);
  if (deliveryLocationRotation) deliveryLocationRotation.value = String(location.rotation);
  if (deliveryLocationDefault) deliveryLocationDefault.checked = Boolean(location.is_default);
  setText('[data-location-form-title]', `Edit ${location.name}`);
  cancelDeliveryLocationEditButton?.removeAttribute('hidden');
  ensureDeliveryLocationMap();
  syncDeliveryLocationMap({ center: true });
  deliveryLocationName?.focus();
};

const deliveryLocationButton = (label, className, handler) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', handler);
  return button;
};

const renderDeliveryLocations = () => {
  if (!savedDeliveryLocationList) return;
  savedDeliveryLocationList.replaceChildren();
  setText('[data-location-count]', `${savedDeliveryLocations.length} / 50`);
  savedDeliveryLocations.forEach((location) => {
    const card = document.createElement('article');
    card.className = 'saved-location-card';
    const heading = document.createElement('div');
    heading.className = 'saved-location-heading';
    const copy = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = location.name;
    const detail = document.createElement('small');
    detail.textContent = `X ${location.x} · Y ${location.y} · Z ${location.z} · A ${location.rotation}°`;
    copy.append(name, detail);
    const badge = document.createElement('span');
    badge.className = `table-status ${location.is_default ? 'online' : 'neutral'}`;
    badge.textContent = location.is_default ? 'Default' : 'Saved';
    heading.append(copy, badge);
    const meta = document.createElement('p');
    meta.textContent = location.last_used_at
      ? `Last used ${formatAccountDate(location.last_used_at)} · Updated ${formatAccountDate(location.updated_at)}`
      : `Updated ${formatAccountDate(location.updated_at)}`;
    const actions = document.createElement('div');
    actions.className = 'heading-actions';
    actions.append(deliveryLocationButton('Edit', 'secondary-action compact-action', () => editDeliveryLocation(location)));
    actions.append(deliveryLocationButton('Delete', 'secondary-action compact-action danger-outline', async () => {
      if (!window.confirm(`Delete the saved location “${location.name}”? Existing orders keep their recorded coordinates.`)) return;
      await saveDeliveryLocationAction({ action: 'delete', location_id: location.location_id });
    }));
    card.append(heading, meta, actions);
    savedDeliveryLocationList.append(card);
  });
  if (savedDeliveryLocationEmpty) savedDeliveryLocationEmpty.hidden = savedDeliveryLocations.length !== 0;
  populatePurchaseLocationSelect();
};

const loadDeliveryLocations = async (sessionToken = storageGet(AUTH_SESSION_KEY), { quiet = false } = {}) => {
  if (!sessionToken || deliveryLocationRequestInProgress) return false;
  deliveryLocationRequestInProgress = true;
  refreshDeliveryLocationsButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(ACCOUNT_DELIVERY_LOCATIONS_URL, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return false;
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Saved locations are unavailable.');
    savedDeliveryLocations = Array.isArray(payload.locations) ? payload.locations : [];
    renderDeliveryLocations();
    if (savedDeliveryLocationError) savedDeliveryLocationError.hidden = true;
    return true;
  } catch (error) {
    if (savedDeliveryLocationError && !quiet) savedDeliveryLocationError.hidden = false;
    return false;
  } finally {
    deliveryLocationRequestInProgress = false;
    refreshDeliveryLocationsButton?.removeAttribute('disabled');
  }
};

const saveDeliveryLocationAction = async (body) => {
  const sessionToken = storageGet(AUTH_SESSION_KEY);
  if (!sessionToken || deliveryLocationRequestInProgress) return false;
  deliveryLocationRequestInProgress = true;
  saveDeliveryLocationButton?.setAttribute('disabled', '');
  showInlineMessage(deliveryLocationMessage, body.action === 'delete' ? 'Deleting saved location…' : 'Saving coordinates…', 'info');
  try {
    const response = await protectedActionFetch(ACCOUNT_DELIVERY_LOCATION_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      storageRemove(AUTH_SESSION_KEY);
      applySignedOutState();
      return false;
    }
    if (!response.ok) throw new Error(payload.message || 'The saved location could not be updated.');
    showInlineMessage(deliveryLocationMessage, payload.message || 'Saved location updated.', 'success');
    deliveryLocationRequestInProgress = false;
    resetDeliveryLocationForm();
    await loadDeliveryLocations(sessionToken);
    return true;
  } catch (error) {
    showInlineMessage(deliveryLocationMessage, error.message || 'The saved location could not be updated.');
    return false;
  } finally {
    deliveryLocationRequestInProgress = false;
    saveDeliveryLocationButton?.removeAttribute('disabled');
  }
};

deliveryLocationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await saveDeliveryLocationAction({
    action: 'save',
    location_id: deliveryLocationId?.value || null,
    name: deliveryLocationName?.value.trim() || '',
    x: deliveryLocationX?.value,
    y: deliveryLocationY?.value,
    z: deliveryLocationZ?.value,
    rotation: deliveryLocationRotation?.value || 0,
    is_default: Boolean(deliveryLocationDefault?.checked)
  });
});
refreshDeliveryLocationsButton?.addEventListener('click', () => loadDeliveryLocations());
cancelDeliveryLocationEditButton?.addEventListener('click', resetDeliveryLocationForm);
[deliveryLocationX, deliveryLocationZ].forEach((input) => input?.addEventListener('input', () => syncDeliveryLocationMap()));

const deliveryScope = document.querySelector('[data-delivery-scope]');
const deliveryOrderList = document.querySelector('[data-delivery-order-list]');
const deliveryEmpty = document.querySelector('[data-delivery-empty]');
const deliveryError = document.querySelector('[data-delivery-error]');
const refreshDeliveryQueueButton = document.querySelector('[data-refresh-delivery-queue]');
const deliveryNavBadge = document.querySelector('[data-delivery-nav-badge]');
let deliveryQueueRequestInProgress = false;
let deliveryActionInProgress = false;

const deliveryStatusHelp = {
  awaiting_approval: 'Railway is releasing this legacy approval state automatically.',
  ready: 'Queued for automatic validation, backup and upload.',
  previewed: 'Prepared and waiting for automatic deployment.',
  restart_pending: 'Mission files are verified and this order will spawn at the next restart.',
  verification: 'The order has spawned and Railway is reconciling its restart state.',
  active: 'The rental is active and its remaining restarts are tracked automatically.',
  cleanup_due: 'The purchased restart count is complete; file cleanup is queued automatically.',
  failed: 'The last deployment failed. Railway retries this order automatically every 30 seconds.',
  fulfilled: 'The automatic delivery and cleanup workflow is complete.',
  cancelled: 'The order was cancelled and its temporary file definitions are being removed.',
  cancelled_cleaned: 'The cancelled order has been refunded and its temporary file definitions were removed.'
};

const previewText = (preview) => {
  if (!preview || typeof preview !== 'object') return '';
  return Object.entries(preview).map(([key, value]) => {
    const section = value || {};
    return `### ${section.label || key}\n${section.diff || 'No change.'}`;
  }).join('\n\n');
};

const performDeliveryAction = async (order, action) => {
  const token = storageGet(AUTH_SESSION_KEY);
  if (!token || deliveryActionInProgress) return;
  let note = '';
  if (['verify', 'record_restart', 'cleanup', 'rollback', 'cancel'].includes(action)) {
    note = window.prompt(action === 'verify'
      ? 'Enter the in-game verification note:'
      : action === 'record_restart'
        ? 'Enter why this restart is being counted manually:'
        : action === 'cleanup'
          ? 'Enter the final cleanup and fulfilment note:'
      : action === 'rollback'
        ? 'Enter the rollback reason:'
        : 'Enter the cancellation note:', '') || '';
    if (!note.trim()) return;
  }
  const warnings = {
    stage: 'The DayZ server must already be stopped. This will back up and upload events.xml, cfgeventspawns.xml and cfgspawnabletypes.xml.',
    restart: 'This will start the stopped Nitrado server so the staged delivery can spawn. Continue?',
    verify: 'This verifies the initial spawn. Multi-restart rentals remain active until their restart count reaches zero.',
    cleanup: 'The DayZ server must be fully stopped. This will retire the temporary event entries and mark the completed rental fulfilled.',
    rollback: 'This will restore the recorded pre-deployment backups.'
  };
  if (warnings[action] && !window.confirm(warnings[action])) return;
  deliveryActionInProgress = true;
  try {
    const response = await protectedActionFetch(ADMIN_SHOP_DELIVERY_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ delivery_id: order.delivery_id, action, note })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: true })) return;
    if (!response.ok) throw new Error(payload.message || 'The delivery operation failed.');
    if (action === 'preview' && payload.preview) {
      const text = previewText(payload.preview);
      if (text) window.alert(text.slice(0, 12000));
    } else {
      window.alert(payload.message || 'Delivery operation completed.');
    }
    await Promise.all([loadDeliveryQueue(token), loadAdminShopOrders(token), loadMemberShop(token)]);
  } catch (error) {
    window.alert(error.message || 'The delivery operation failed.');
  } finally {
    deliveryActionInProgress = false;
  }
};

const deliveryActionButton = (order, label, action) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${['stage', 'restart', 'verify', 'cleanup'].includes(action) ? 'primary-action' : 'secondary-action'} compact-action`;
  button.textContent = label;
  button.addEventListener('click', () => performDeliveryAction(order, action));
  return button;
};

const renderDeliveryQueue = (payload) => {
  if (!deliveryOrderList) return;
  deliveryOrderList.replaceChildren();
  const summary = payload?.summary || {};
  setText('[data-delivery-open]', String(Number(summary.open || 0)));
  setText('[data-delivery-awaiting]', String(Number(summary.pending || 0)));
  setText('[data-delivery-restart]', String(Number(summary.processing || 0)));
  setText('[data-delivery-verification]', String(Number(summary.fulfilled || 0)));
  setText('[data-delivery-failed]', String(Number(summary.refunded || 0) + Number(summary.cancelled || 0)));
  const openCount = Number(summary.open || 0);
  if (deliveryNavBadge) {
    deliveryNavBadge.textContent = String(openCount);
    deliveryNavBadge.hidden = openCount === 0;
  }
  const orders = Array.isArray(payload?.orders) ? payload.orders : [];
  orders.forEach((order) => {
    const delivery = order.delivery || {};
    const location = delivery.location || {};
    const deliveryKind = delivery.delivery_kind === 'event' ? 'Event Item' : 'Item';
    const card = document.createElement('article');
    card.className = `delivery-order-card delivery-${delivery.status || order.status}`;

    const heading = document.createElement('div');
    heading.className = 'delivery-order-heading';
    const copy = document.createElement('div');
    const kicker = document.createElement('p');
    kicker.className = 'panel-kicker';
    kicker.textContent = `Order #${order.order_id} · ${deliveryKind}`;
    const title = document.createElement('h2');
    title.textContent = `${order.item.name} → ${order.buyer.psn_id}`;
    copy.append(kicker, title);
    const status = document.createElement('span');
    status.className = `shop-order-status ${order.status}`;
    status.textContent = shopStatusLabel(order.status);
    heading.append(copy, status);

    const details = document.createElement('div');
    details.className = 'delivery-detail-grid';
    const deliveryState = delivery.status || 'queued';
    const itemDetail = delivery.delivery_kind === 'event'
      ? `${Number(order.event_restarts || 1).toLocaleString()} purchased restart(s)`
      : `${Number(order.quantity || 1).toLocaleString()} × ${(order.item.types || []).join(', ') || order.item.sku}`;
    [
      ['Automation', shopStatusLabel(deliveryState)],
      ['Delivery', itemDetail],
      ['Location', location.x == null ? 'Coordinates unavailable' : `${location.name || 'Selected point'} · X ${location.x}, Y ${location.y}, Z ${location.z}`],
      ['Rotation', `${Number(location.rotation || 0).toLocaleString()}°`],
      ['Value', formatMoney(order.total_price)],
      ['Created', formatAccountDate(order.created_at)],
    ].forEach(([label, value]) => {
      const block = document.createElement('div');
      const small = document.createElement('span'); small.textContent = label;
      const strong = document.createElement('strong'); strong.textContent = value;
      block.append(small, strong); details.append(block);
    });
    card.append(heading, details);

    if (delivery.last_error) {
      const error = document.createElement('p');
      error.className = 'delivery-error-copy';
      error.textContent = `Last deployment error: ${delivery.last_error}`;
      card.append(error);
    }
    const automationNote = document.createElement('p');
    automationNote.className = 'delivery-automation-note';
    automationNote.textContent = deliveryStatusHelp[deliveryState]
      || 'Railway is managing this delivery automatically.';
    card.append(automationNote);

    const actions = document.createElement('div');
    actions.className = 'heading-actions delivery-actions';
    if (['pending', 'processing'].includes(order.status)) {
      actions.append(adminShopActionButton('Cancel & refund', 'cancel', order, true));
    } else if (order.status === 'fulfilled') {
      actions.append(adminShopActionButton('Refund order', 'refund', order, true));
    }
    if (actions.childElementCount) card.append(actions);
    deliveryOrderList.append(card);
  });
  if (deliveryEmpty) deliveryEmpty.hidden = orders.length !== 0;
  if (deliveryError) deliveryError.hidden = true;
};

const loadDeliveryQueue = async (token = storageGet(AUTH_SESSION_KEY)) => {
  if (!token || !hasServerActionAccess() || deliveryQueueRequestInProgress) return false;
  deliveryQueueRequestInProgress = true;
  refreshDeliveryQueueButton?.setAttribute('disabled', '');
  try {
    const scope = encodeURIComponent(deliveryScope?.value || 'open');
    const response = await authFetch(`${ADMIN_SHOP_ORDERS_URL}?mode=automatic&status=${scope}&limit=100`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok) throw new Error(payload.message || 'The automatic order monitor is unavailable.');
    renderDeliveryQueue(payload);
    return true;
  } catch (error) {
    if (deliveryError) deliveryError.hidden = false;
    return false;
  } finally {
    deliveryQueueRequestInProgress = false;
    refreshDeliveryQueueButton?.removeAttribute('disabled');
  }
};
deliveryScope?.addEventListener('change', () => loadDeliveryQueue());
refreshDeliveryQueueButton?.addEventListener('click', () => loadDeliveryQueue());

const refreshServerConfigButton = document.querySelector('[data-refresh-server-config]');
const configFileSelect = document.querySelector('[data-config-file-select]');
const loadConfigFileButton = document.querySelector('[data-load-config-file]');
const validateConfigFileButton = document.querySelector('[data-validate-config-file]');
const applyConfigFileButton = document.querySelector('[data-apply-config-file]');
const configFileContent = document.querySelector('[data-config-file-content]');
const configFileReason = document.querySelector('[data-config-file-reason]');
const configFileMessage = document.querySelector('[data-config-file-message]');
const configFileDiff = document.querySelector('[data-config-file-diff]');
const refreshServerEventsButton = document.querySelector('[data-refresh-server-events]');
const serverEventSearch = document.querySelector('[data-server-event-search]');
const serverEventList = document.querySelector('[data-server-event-list]');
const serverEventEmpty = document.querySelector('[data-server-event-empty]');
const serverEventError = document.querySelector('[data-server-event-error]');
let ownerServerConfigRequestInProgress = false;
let ownerServerEvents = [];

const readableBytes = (bytes) => {
  const amount = Number(bytes || 0);
  if (amount < 1024) return `${amount} B`;
  if (amount < 1024 * 1024) return `${(amount / 1024).toFixed(1)} KB`;
  return `${(amount / (1024 * 1024)).toFixed(2)} MB`;
};

const applyServerConfigOverview = (payload) => {
  const service = payload?.service || {};
  const safety = payload?.safety || {};
  setText('[data-config-mission-root]', service.mission_root || 'Mission root unavailable');
  setText('[data-config-file-count]', String(Number(service.managed_file_count || 0)));
  setText('[data-config-backup-count]', String(Number(service.backup_count || 0)));
  setText('[data-config-editor-limit]', readableBytes(safety.max_editor_bytes));
  const latest = service.latest_action;
  setText('[data-config-latest-action]', latest
    ? `${latest.action || latest.operation || 'Configuration action'} · ${formatAccountDate(latest.created_at || latest.timestamp)}`
    : 'No recent configuration action.');
  if (configFileSelect) {
    const selected = configFileSelect.value;
    configFileSelect.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select managed file…';
    configFileSelect.append(placeholder);
    (Array.isArray(payload.files) ? payload.files : []).forEach((file) => {
      const option = document.createElement('option');
      option.value = file.key;
      option.textContent = `${file.label} · ${file.format.toUpperCase()}`;
      configFileSelect.append(option);
    });
    if ([...configFileSelect.options].some((option) => option.value === selected)) configFileSelect.value = selected;
  }
};

const loadServerConfigOverview = async (token = storageGet(AUTH_SESSION_KEY)) => {
  if (!token || dashboardAccessLevel !== 'owner' || ownerServerConfigRequestInProgress) return false;
  ownerServerConfigRequestInProgress = true;
  refreshServerConfigButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(OWNER_SERVER_CONFIG_OVERVIEW_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Configuration overview unavailable.');
    applyServerConfigOverview(payload);
    return true;
  } catch (error) {
    showInlineMessage(configFileMessage, error.message || 'Configuration overview unavailable.');
    return false;
  } finally {
    ownerServerConfigRequestInProgress = false;
    refreshServerConfigButton?.removeAttribute('disabled');
  }
};

const loadSelectedConfigFile = async () => {
  const token = storageGet(AUTH_SESSION_KEY);
  const fileKey = configFileSelect?.value || '';
  if (!token || dashboardAccessLevel !== 'owner' || !fileKey || ownerServerConfigRequestInProgress) return;
  ownerServerConfigRequestInProgress = true;
  loadConfigFileButton?.setAttribute('disabled', '');
  showInlineMessage(configFileMessage, 'Loading the live Nitrado file…', 'info');
  try {
    const response = await authFetch(`${OWNER_SERVER_CONFIG_FILE_URL}?file=${encodeURIComponent(fileKey)}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'The file could not be loaded.');
    const file = payload.file || {};
    if (configFileContent) configFileContent.value = String(file.content || '');
    setText('[data-config-file-path]', file.remote_path || file.label || fileKey);
    setText('[data-config-file-sha]', String(file.sha256 || '').slice(0, 16) || '—');
    setText('[data-config-file-size]', readableBytes(file.size_bytes));
    if (configFileDiff) configFileDiff.textContent = 'No diff generated.';
    showInlineMessage(configFileMessage, `${file.label || fileKey} loaded from Nitrado.`, 'success');
  } catch (error) {
    showInlineMessage(configFileMessage, error.message || 'The file could not be loaded.');
  } finally {
    ownerServerConfigRequestInProgress = false;
    loadConfigFileButton?.removeAttribute('disabled');
  }
};

const submitConfigFileAction = async (action) => {
  const token = storageGet(AUTH_SESSION_KEY);
  const fileKey = configFileSelect?.value || '';
  if (!token || dashboardAccessLevel !== 'owner' || !fileKey || ownerServerConfigRequestInProgress) return;
  if (action === 'apply') {
    if ((configFileReason?.value.trim() || '').length < 5) {
      showInlineMessage(configFileMessage, 'Enter a deployment reason of at least five characters.');
      return;
    }
    if (!window.confirm('Create a live backup and upload this exact file to Nitrado?')) return;
  }
  ownerServerConfigRequestInProgress = true;
  validateConfigFileButton?.setAttribute('disabled', '');
  applyConfigFileButton?.setAttribute('disabled', '');
  showInlineMessage(configFileMessage, action === 'apply' ? 'Backing up and applying the file…' : 'Validating and comparing the file…', 'info');
  try {
    const response = await protectedActionFetch(OWNER_SERVER_CONFIG_FILE_ACTION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, file_key: fileKey, content: configFileContent?.value || '', reason: configFileReason?.value.trim() || '' })
    });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: action === 'apply' })) return;
    if (!response.ok) throw new Error(payload.message || 'The configuration operation failed.');
    if (configFileDiff && 'diff' in payload) configFileDiff.textContent = payload.diff || 'No changes detected.';
    showInlineMessage(configFileMessage, payload.message || 'Configuration operation completed.', 'success');
    if (action === 'apply') await Promise.all([loadServerConfigOverview(token), loadSelectedConfigFile(), loadServerEvents(token)]);
  } catch (error) {
    showInlineMessage(configFileMessage, error.message || 'The configuration operation failed.');
  } finally {
    ownerServerConfigRequestInProgress = false;
    validateConfigFileButton?.removeAttribute('disabled');
    applyConfigFileButton?.removeAttribute('disabled');
  }
};
refreshServerConfigButton?.addEventListener('click', () => Promise.all([loadServerConfigOverview(), loadServerEvents()]));
loadConfigFileButton?.addEventListener('click', loadSelectedConfigFile);
validateConfigFileButton?.addEventListener('click', () => submitConfigFileAction('validate'));
applyConfigFileButton?.addEventListener('click', () => submitConfigFileAction('apply'));

const renderServerEvents = () => {
  if (!serverEventList) return;
  const query = String(serverEventSearch?.value || '').trim().toLowerCase();
  const visible = ownerServerEvents.filter((event) => {
    const children = (event.children || []).map((child) => child.type).join(' ');
    return !query || `${event.name} ${children} ${event.position_type} ${event.limit}`.toLowerCase().includes(query);
  });
  serverEventList.replaceChildren();
  visible.forEach((event) => {
    const row = document.createElement('tr');
    const name = document.createElement('td'); const strong = document.createElement('strong'); strong.textContent = event.name; const small = document.createElement('small'); small.textContent = `${event.position_type} · ${event.limit}`; name.append(strong, document.createElement('br'), small);
    const children = document.createElement('td'); children.textContent = (event.children || []).map((child) => child.type).join(', ') || 'No child types';
    const population = document.createElement('td'); population.textContent = `${event.nominal} nominal · ${event.minimum}–${event.maximum}`;
    const positions = document.createElement('td'); positions.textContent = `${event.position_count} positions${event.has_zone ? ' · zone' : ''}`;
    const state = document.createElement('td'); const pill = document.createElement('span'); pill.className = `table-status ${event.active ? 'online' : 'offline'}`; pill.textContent = event.active ? 'Active' : 'Inactive'; state.append(pill);
    row.append(name, children, population, positions, state);
    serverEventList.append(row);
  });
  if (serverEventEmpty) serverEventEmpty.hidden = visible.length !== 0;
};

const loadServerEvents = async (token = storageGet(AUTH_SESSION_KEY)) => {
  if (!token || dashboardAccessLevel !== 'owner') return false;
  refreshServerEventsButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(OWNER_SERVER_EVENTS_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Events are unavailable.');
    ownerServerEvents = Array.isArray(payload.events) ? payload.events : [];
    const summary = payload.summary || {};
    setText('[data-server-event-count]', String(Number(summary.event_count || 0)));
    setText('[data-server-active-count]', String(Number(summary.active_count || 0)));
    setText('[data-server-position-count]', String(Number(summary.position_count || 0)));
    setText('[data-server-zone-count]', String(Number(summary.zone_count || 0)));
    renderServerEvents();
    if (serverEventError) serverEventError.hidden = true;
    return true;
  } catch (error) {
    if (serverEventError) serverEventError.hidden = false;
    return false;
  } finally {
    refreshServerEventsButton?.removeAttribute('disabled');
  }
};
refreshServerEventsButton?.addEventListener('click', () => loadServerEvents());
serverEventSearch?.addEventListener('input', renderServerEvents);

window.addEventListener('wwz:viewchange', (event) => {
  const { view, section } = event.detail || {};
  const token = storageGet(AUTH_SESSION_KEY);
  if (view === 'locations') {
    loadDeliveryLocations(token);
    window.setTimeout(() => {
      const instance = ensureDeliveryLocationMap();
      syncDeliveryLocationMap();
      instance?.invalidateSize();
    }, 0);
  }
  if (view === 'delivery') loadDeliveryQueue(token);
  if (view === 'serverconfig') {
    if (section === 'files') loadServerConfigOverview(token);
    else if (section === 'events') loadServerEvents(token);
    else Promise.all([loadServerConfigOverview(token), loadServerEvents(token)]);
  }
  if (view === 'configuration' && section === 'event-items') loadOwnerShopConfig(token);
});

configureDiscordAuth();
showView(location.hash.slice(1), false);
