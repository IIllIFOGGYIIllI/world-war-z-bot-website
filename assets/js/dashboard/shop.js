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
const shopEventDeliveryFields = document.querySelector('[data-shop-event-delivery]');
const shopDeliveryLocation = document.querySelector('[data-shop-delivery-location]');
const shopCoordinateInputs = document.querySelector('[data-shop-coordinate-inputs]');
const shopDeliveryX = document.querySelector('[data-shop-delivery-x]');
const shopDeliveryY = document.querySelector('[data-shop-delivery-y]');
const shopDeliveryZ = document.querySelector('[data-shop-delivery-z]');
const shopDeliveryRotation = document.querySelector('[data-shop-delivery-rotation]');
const shopSaveLocation = document.querySelector('[data-shop-save-location]');
const shopSaveLocationName = document.querySelector('[data-shop-save-location-name]');
const shopSaveNameField = document.querySelector('[data-shop-save-name-field]');
const shopCoordinateConfirm = document.querySelector('[data-shop-coordinate-confirm]');
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
const shopOrderActionNoteLabel = document.querySelector('[data-shop-order-action-note-label]');
const shopOrderActionNoteHelp = document.querySelector('[data-shop-order-action-note-help]');
const shopOrderActionMessage = document.querySelector('[data-shop-order-action-message]');
const shopOrderActionCancelButtons = [...document.querySelectorAll('[data-shop-order-action-cancel]')];
const confirmShopOrderActionButton = document.querySelector('[data-confirm-shop-order-action]');
const ownerShopEnabled = document.querySelector('[data-owner-shop-enabled]');
const ownerShopWebsiteEnabled = document.querySelector('[data-owner-shop-website-enabled]');
const ownerShopRequiredRole = document.querySelector('[data-owner-shop-required-role]');
const ownerShopImageUrl = document.querySelector('[data-owner-shop-image-url]');
const ownerShopRestartMin = document.querySelector('[data-owner-shop-restart-min]');
const ownerShopRestartMax = document.querySelector('[data-owner-shop-restart-max]');
const ownerShopDiscountList = document.querySelector('[data-shop-discount-list]');
const ownerShopDiscountEmpty = document.querySelector('[data-shop-discount-empty]');
const addShopDiscountButton = document.querySelector('[data-add-shop-discount]');
const ownerShopTitle = document.querySelector('[data-owner-shop-title]');
const ownerShopDescription = document.querySelector('[data-owner-shop-description]');
const ownerShopInstructions = document.querySelector('[data-owner-shop-instructions]');
const ownerShopMessage = document.querySelector('[data-owner-shop-message]');
const ownerShopItemList = document.querySelector('[data-owner-shop-item-list]');
const ownerShopEmpty = document.querySelector('[data-owner-shop-empty]');
const ownerShopError = document.querySelector('[data-owner-shop-error]');
const refreshShopConfigButton = document.querySelector('[data-refresh-shop-config]');
const refreshShopSettingsButton = document.querySelector('[data-refresh-shop-settings]');
const saveShopSettingsButton = document.querySelector('[data-save-shop-settings]');
const newShopItemButton = document.querySelector('[data-new-shop-item]');
const shopItemDialog = document.querySelector('[data-shop-item-dialog]');
const shopItemForm = document.querySelector('[data-shop-item-form]');
const shopItemCancelButtons = [...document.querySelectorAll('[data-shop-item-cancel]')];
const shopItemMessage = document.querySelector('[data-shop-item-message]');
const shopItemDeliveryType = document.querySelector('[data-shop-item-delivery-type]');
const shopItemTypes = document.querySelector('[data-shop-item-types]');
const shopItemRequiredRoles = document.querySelector('[data-shop-item-required-roles]');
const shopItemRequireAllRoles = document.querySelector('[data-shop-item-require-all-roles]');
const shopItemCooldownEnabled = document.querySelector('[data-shop-item-cooldown-enabled]');
const shopItemLimitGlobal = document.querySelector('[data-shop-item-limit-global]');
const shopItemLimitCount = document.querySelector('[data-shop-item-limit-count]');
const shopItemLimitSeconds = document.querySelector('[data-shop-item-limit-seconds]');
const shopPurchaseWindow = document.querySelector('[data-shop-purchase-window]');
const shopItemHidden = document.querySelector('[data-shop-item-hidden]');
const shopItemScopeInputs = [...document.querySelectorAll('[data-shop-item-scope]')];
const shopItemDiscountList = document.querySelector('[data-shop-item-discount-list]');
const shopItemDiscountEmpty = document.querySelector('[data-shop-item-discount-empty]');
const shopItemDiscountCount = document.querySelector('[data-shop-item-discount-count]');
const addShopItemDiscountButton = document.querySelector('[data-add-shop-item-discount]');
const shopManualOnlyFields = [...document.querySelectorAll('[data-shop-manual-only]')];
const shopEventProfileEditors = [...document.querySelectorAll('[data-shop-event-profile]')];
const shopEventXml = document.querySelector('[data-shop-event-xml]');
const shopEventZone = document.querySelector('[data-shop-event-zone]');
const shopEventXmlStatus = document.querySelector('[data-event-xml-status]');
const shopEventZoneStatus = document.querySelector('[data-event-zone-status]');
const shopEventXmlCount = document.querySelector('[data-event-xml-count]');
const shopEventZoneCount = document.querySelector('[data-event-zone-count]');
const shopEventChildReadout = document.querySelector('[data-shop-event-child-readout]');
const shopEventXmlTools = [...document.querySelectorAll('[data-event-xml-action]')];
const shopEventZoneTools = [...document.querySelectorAll('[data-event-zone-action]')];
const shopPriceQuickButtons = [...document.querySelectorAll('[data-shop-price-value]')];
const shopCategoryQuickButtons = [...document.querySelectorAll('[data-shop-category-value]')];
const ownerEventItemList = document.querySelector('[data-owner-event-item-list]');
const ownerEventItemEmpty = document.querySelector('[data-owner-event-item-empty]');
const newEventItemButton = document.querySelector('[data-new-event-item]');
const shopModeButtons = [...document.querySelectorAll('[data-shop-mode]')];
const shopManualCount = document.querySelector('[data-shop-manual-count]');
const shopEventCount = document.querySelector('[data-shop-event-count]');
const shopQuantityLabel = document.querySelector('[data-shop-quantity-label]');
const shopQuantityHelp = document.querySelector('[data-shop-quantity-help]');
const shopCoordinateMap = document.querySelector('[data-shop-coordinate-map]');
const shopCoordinateStage = document.querySelector('[data-shop-coordinate-stage]');
const shopCoordinateImage = document.querySelector('[data-shop-coordinate-image]');
const shopCoordinateMarker = document.querySelector('[data-shop-coordinate-marker]');
const shopMapSelected = document.querySelector('[data-shop-map-selected]');
const ownerShopSearch = document.querySelector('[data-owner-shop-search]');
const ownerShopCategory = document.querySelector('[data-owner-shop-category]');
const ownerEventSearch = document.querySelector('[data-owner-event-search]');
const ownerEventCategory = document.querySelector('[data-owner-event-category]');

let shopItems = [];
let memberShopOrders = [];
let selectedShopItem = null;
let selectedShopOrder = null;
let selectedShopOrderAction = '';
let ownerShopItems = [];
let ownerShopRoles = [];
let ownerShopDiscounts = [];
let editingShopItemDiscounts = [];
let editingShopItemId = null;
let shopPurchasesEnabled = false;
let shopRequestInProgress = false;
let shopPurchaseInProgress = false;
let adminShopRequestInProgress = false;
let shopOrderActionInProgress = false;
let ownerShopRequestInProgress = false;
let savedDeliveryLocations = [];
let shopCatalogueMode = 'manual';
let coordinatePickerZoom = 1;
let coordinatePickerX = 0;
let coordinatePickerY = 0;
let coordinatePickerDrag = null;

const DEFAULT_EVENT_XML = `<event name="Vehicle">
    <nominal>1</nominal>
    <min>1</min>
    <max>1</max>
    <lifetime>3888000</lifetime>
    <restock>0</restock>
    <saferadius>1</saferadius>
    <distanceradius>1</distanceradius>
    <cleanupradius>100</cleanupradius>
    <flags deletable="0" init_random="0" remove_damaged="1" />
    <position>fixed</position>
    <limit>child</limit>
    <active>1</active>
    <children>
        <child lootmax="0" lootmin="0" max="1" min="1" type="VehiclePLACEHOLDER" />
    </children>
</event>`;

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
  [...new Set(shopItems.filter((item) => (item.delivery_type === 'event' ? 'event' : 'manual') === shopCatalogueMode).map((item) => String(item.category)))].sort((a, b) => a.localeCompare(b)).forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    shopCategory.append(option);
  });
  shopCategory.value = [...shopCategory.options].some((option) => option.value === selected) ? selected : 'all';
};

const populatePurchaseLocationSelect = () => {
  if (!shopDeliveryLocation) return;
  const selected = shopDeliveryLocation.value || '';
  shopDeliveryLocation.replaceChildren();
  const manual = document.createElement('option');
  manual.value = '';
  manual.textContent = 'Enter new coordinates';
  shopDeliveryLocation.append(manual);
  savedDeliveryLocations.forEach((location) => {
    const option = document.createElement('option');
    option.value = String(location.location_id);
    option.textContent = `${location.name}${location.is_default ? ' · Default' : ''} — X ${location.x}, Y ${location.y}, Z ${location.z}, A ${location.rotation}°`;
    shopDeliveryLocation.append(option);
  });
  if ([...shopDeliveryLocation.options].some((option) => option.value === selected)) {
    shopDeliveryLocation.value = selected;
  } else {
    const defaultLocation = savedDeliveryLocations.find((location) => location.is_default);
    shopDeliveryLocation.value = defaultLocation ? String(defaultLocation.location_id) : '';
  }
};

const clampCoordinatePicker = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const updateCoordinatePickerTransform = () => {
  if (!shopCoordinateStage) return;
  shopCoordinateStage.style.transform = `translate(${coordinatePickerX}px, ${coordinatePickerY}px) scale(${coordinatePickerZoom})`;
};
const resetCoordinatePicker = () => {
  coordinatePickerZoom = 1;
  coordinatePickerX = 0;
  coordinatePickerY = 0;
  updateCoordinatePickerTransform();
};
const updateCoordinateMarker = () => {
  if (!shopCoordinateMarker || !shopDeliveryX || !shopDeliveryZ) return;
  const x = Number(shopDeliveryX.value);
  const z = Number(shopDeliveryZ.value);
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < 0 || x > 15360 || z < 0 || z > 15360) {
    shopCoordinateMarker.hidden = true;
    if (shopMapSelected) shopMapSelected.textContent = 'No coordinates selected';
    return;
  }
  shopCoordinateMarker.hidden = false;
  shopCoordinateMarker.style.left = `${(x / 15360) * 100}%`;
  shopCoordinateMarker.style.top = `${(1 - z / 15360) * 100}%`;
  if (shopMapSelected) shopMapSelected.textContent = `X ${x.toFixed(3)} · Z ${z.toFixed(3)}`;
};
const setCoordinatesFromMap = (clientX, clientY) => {
  if (!shopCoordinateImage || shopDeliveryLocation?.value) return;
  const rect = shopCoordinateImage.getBoundingClientRect();
  if (!rect.width || !rect.height || clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;
  const x = clampCoordinatePicker(((clientX - rect.left) / rect.width) * 15360, 0, 15360);
  const z = clampCoordinatePicker((1 - ((clientY - rect.top) / rect.height)) * 15360, 0, 15360);
  if (shopDeliveryX) shopDeliveryX.value = x.toFixed(3);
  if (shopDeliveryZ) shopDeliveryZ.value = z.toFixed(3);
  if (shopDeliveryY && shopDeliveryY.value === '') shopDeliveryY.value = '0';
  updateCoordinateMarker();
};

const syncShopDeliveryForm = () => {
  const isEvent = selectedShopItem?.delivery_type === 'event' || selectedShopItem?.requires_coordinates;
  if (shopEventDeliveryFields) shopEventDeliveryFields.hidden = !isEvent;
  if (!isEvent) return;
  const usesSavedLocation = Boolean(shopDeliveryLocation?.value);
  if (shopCoordinateInputs) shopCoordinateInputs.hidden = usesSavedLocation;
  [shopDeliveryX, shopDeliveryY, shopDeliveryZ, shopDeliveryRotation].forEach((input) => {
    if (input) input.required = !usesSavedLocation;
  });
  if (shopSaveLocation) {
    shopSaveLocation.disabled = usesSavedLocation;
    if (usesSavedLocation) shopSaveLocation.checked = false;
  }
  if (shopSaveNameField) shopSaveNameField.hidden = usesSavedLocation || !shopSaveLocation?.checked;
  if (shopSaveLocationName) shopSaveLocationName.required = !usesSavedLocation && Boolean(shopSaveLocation?.checked);
  if (shopCoordinateConfirm) shopCoordinateConfirm.required = true;
  shopCoordinateMap?.classList.toggle('saved-location-active', usesSavedLocation);
  if (usesSavedLocation) {
    const location = savedDeliveryLocations.find((entry) => String(entry.location_id) === String(shopDeliveryLocation?.value));
    if (location) {
      if (shopDeliveryX) shopDeliveryX.value = String(location.x);
      if (shopDeliveryY) shopDeliveryY.value = String(location.y);
      if (shopDeliveryZ) shopDeliveryZ.value = String(location.z);
      if (shopDeliveryRotation) shopDeliveryRotation.value = String(location.rotation);
    }
  }
  updateCoordinateMarker();
};

const openShopPurchase = (item) => {
  if (!authenticatedUser) {
    handleAuthAction();
    return;
  }
  if (!shopPurchasesEnabled || !item?.available || shopPurchaseInProgress) return;
  selectedShopItem = item;
  shopPurchaseForm?.reset();
  const isEvent = item.delivery_type === 'event';
  if (shopPurchaseQuantity) {
    const minimumRestarts = Math.max(1, Number(item.delivery?.minimum_restarts || 1));
    const maximumRestarts = Math.min(30000, Math.max(minimumRestarts, Number(item.delivery?.maximum_restarts || 30000)));
    shopPurchaseQuantity.value = String(isEvent ? minimumRestarts : 1);
    shopPurchaseQuantity.min = String(isEvent ? minimumRestarts : 1);
    shopPurchaseQuantity.max = String(isEvent ? maximumRestarts : Math.max(1, Math.min(
      Number(item.max_per_order || 1),
      item.stock_quantity == null ? 100 : Number(item.stock_quantity),
      item.remaining_member_limit == null ? 100 : Number(item.remaining_member_limit)
    )));
    shopPurchaseQuantity.disabled = false;
    if (shopQuantityLabel) shopQuantityLabel.textContent = isEvent ? 'Number Of Restarts' : 'Quantity';
    if (shopQuantityHelp) shopQuantityHelp.textContent = isEvent ? `Price is per restart · allowed ${minimumRestarts.toLocaleString()}–${maximumRestarts.toLocaleString()}.` : 'Number of items to purchase.';
  }
  if (shopDeliveryY) shopDeliveryY.value = '0';
  if (shopDeliveryRotation) shopDeliveryRotation.value = '0';
  resetCoordinatePicker();
  updateCoordinateMarker();
  populatePurchaseLocationSelect();
  if (isEvent && !savedDeliveryLocations.length) loadDeliveryLocations(undefined, { quiet: true }).then(() => { populatePurchaseLocationSelect(); syncShopDeliveryForm(); });
  syncShopDeliveryForm();
  setText('[data-shop-purchase-title]', `Buy ${item.name}?`);
  setText('[data-shop-purchase-item]', `${item.name} · ${item.sku}`);
  const deliveryText = isEvent ? 'Restart-Bound Event Spawn' : 'Automatic coordinate delivery';
  setText('[data-shop-purchase-price]', `${formatMoney(item.price)} ${isEvent ? 'per restart' : 'each'} · ${shopStockText(item)} · ${deliveryText}`);
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
shopDeliveryLocation?.addEventListener('change', syncShopDeliveryForm);
shopSaveLocation?.addEventListener('change', syncShopDeliveryForm);
[shopDeliveryX, shopDeliveryZ].forEach((input) => input?.addEventListener('input', updateCoordinateMarker));
shopCoordinateMap?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) return;
  coordinatePickerDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
  shopCoordinateMap.setPointerCapture?.(event.pointerId);
});
shopCoordinateMap?.addEventListener('pointermove', (event) => {
  if (!coordinatePickerDrag || coordinatePickerDrag.id !== event.pointerId) return;
  coordinatePickerX += event.clientX - coordinatePickerDrag.x; coordinatePickerY += event.clientY - coordinatePickerDrag.y;
  coordinatePickerDrag.x = event.clientX; coordinatePickerDrag.y = event.clientY; updateCoordinatePickerTransform();
});
shopCoordinateMap?.addEventListener('pointerup', (event) => {
  if (!coordinatePickerDrag || coordinatePickerDrag.id !== event.pointerId) return;
  const moved = Math.hypot(event.clientX - coordinatePickerDrag.startX, event.clientY - coordinatePickerDrag.startY);
  shopCoordinateMap.releasePointerCapture?.(event.pointerId); coordinatePickerDrag = null;
  if (moved < 7) setCoordinatesFromMap(event.clientX, event.clientY);
});
shopCoordinateMap?.addEventListener('pointercancel', () => { coordinatePickerDrag = null; });
document.querySelector('[data-shop-map-zoom-in]')?.addEventListener('click', () => { coordinatePickerZoom = clampCoordinatePicker(coordinatePickerZoom * 1.35, 1, 5); updateCoordinatePickerTransform(); });
document.querySelector('[data-shop-map-zoom-out]')?.addEventListener('click', () => { coordinatePickerZoom = clampCoordinatePicker(coordinatePickerZoom / 1.35, 1, 5); if (coordinatePickerZoom === 1) { coordinatePickerX = 0; coordinatePickerY = 0; } updateCoordinatePickerTransform(); });
document.querySelector('[data-shop-map-reset]')?.addEventListener('click', resetCoordinatePicker);

const renderShopCatalogue = () => {
  if (!shopCatalogue) return;
  const query = String(shopSearch?.value || '').trim().toLowerCase();
  const category = shopCategory?.value || 'all';
  const visible = shopItems.filter((item) => {
    const type = item.delivery_type === 'event' ? 'event' : 'manual';
    const matchesMode = type === shopCatalogueMode;
    const matchesCategory = category === 'all' || String(item.category) === category;
    const haystack = `${item.item_id} ${item.name} ${item.sku} ${item.category} ${item.description}`.toLowerCase();
    return matchesMode && matchesCategory && (!query || haystack.includes(query));
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
    price.textContent = item.delivery_type === 'event' ? `${formatMoney(item.price)}/restart` : formatMoney(item.price);
    heading.append(copy, price);
    const description = document.createElement('p');
    description.textContent = item.description;
    const meta = document.createElement('div');
    meta.className = 'shop-item-meta';
    [
      item.delivery_type === 'event' ? `Event Item · ${Number(item.delivery?.minimum_restarts || 1).toLocaleString()}–${Number(item.delivery?.maximum_restarts || 30000).toLocaleString()} restarts` : 'Automatic item delivery',
      shopStockText(item),
      `Max ${item.max_per_order}/order`,
      shopMemberLimitText(item)
    ].forEach((value) => {
      const span = document.createElement('span');
      span.textContent = value;
      meta.append(span);
    });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary-action wide';
    const linked = !document.querySelector('[data-shop-order-content]')?.hidden;
    const canBuy = shopPurchasesEnabled && linked && item.available;
    button.textContent = !shopPurchasesEnabled ? 'Purchases paused' : !authenticatedUser ? 'Sign in to buy' : !linked ? 'Link PSN to buy' : item.available ? (item.delivery_type === 'event' ? 'Order event delivery' : 'Buy item') : 'Unavailable';
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
    title.textContent = order.delivery_type === 'event' ? `Order #${order.order_id} · ${Number(order.event_restarts || 1).toLocaleString()} restart(s) · ${order.item.name}` : `Order #${order.order_id} · ${order.quantity} × ${order.item.name}`;
    const status = document.createElement('span');
    status.className = `shop-order-status ${String(order.status)}`;
    status.textContent = shopStatusLabel(order.status);
    heading.append(title, status);
    const meta = document.createElement('p');
    meta.textContent = `${formatMoney(order.total_price)} · Ordered ${formatAccountDate(order.created_at)}${order.handled_by_name ? ` · ${order.handled_by_name}` : ''}`;
    card.append(heading, meta);
    if (order.delivery) {
      const delivery = document.createElement('small');
      const point = order.delivery.location || {};
      delivery.textContent = order.delivery_type === 'event'
        ? `Automatic Event Delivery: ${shopStatusLabel(order.delivery.status)} · ${Number(order.delivery.remaining_restarts ?? order.event_restarts ?? 1).toLocaleString()} restart(s) remaining · ${point.name || 'Coordinates'} · X ${point.x}, Y ${point.y}, Z ${point.z}, A ${point.rotation}°`
        : `Automatic item delivery: ${shopStatusLabel(order.delivery.status)} · ${point.name || 'Coordinates'} · X ${point.x}, Y ${point.y}, Z ${point.z}, A ${point.rotation}°`;
      card.append(delivery);
    }
    if (order.buyer_note) {
      const note = document.createElement('small');
      note.textContent = `Your note: ${order.buyer_note}`;
      card.append(note);
    }
    if (order.fulfilment_note) {
      const note = document.createElement('small');
      note.textContent = `Order update: ${order.fulfilment_note}`;
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
  setText('[data-shop-instructions]', settings.purchase_instructions || 'Railway prepares paid orders automatically for the next server restart.');
  setText('[data-shop-item-count]', String(shopItems.length));
  if (shopManualCount) shopManualCount.textContent = String(shopItems.filter((item) => item.delivery_type !== 'event').length);
  if (shopEventCount) shopEventCount.textContent = String(shopItems.filter((item) => item.delivery_type === 'event').length);
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
    loadDeliveryLocations(sessionToken, { quiet: true });
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

shopModeButtons.forEach((button) => button.addEventListener('click', () => {
  shopCatalogueMode = button.dataset.shopMode === 'event' ? 'event' : 'manual';
  shopModeButtons.forEach((entry) => { const active = entry === button; entry.classList.toggle('active', active); entry.setAttribute('aria-selected', String(active)); });
  if (shopSearch) shopSearch.value = '';
  if (shopCategory) shopCategory.value = 'all';
  populateShopCategories();
  setText('[data-shop-mode-label]', shopCatalogueMode === 'event' ? 'Event items' : 'Items');
  setText('[data-shop-mode-help]', shopCatalogueMode === 'event' ? 'Price per restart · exact coordinates' : 'Automatic item catalogue');
  renderShopCatalogue();
}));
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
        quantity: (selectedShopItem.delivery_type === 'event' ? 1 : Number(shopPurchaseQuantity?.value || 1)),
        event_restarts: (selectedShopItem.delivery_type === 'event' ? Number(shopPurchaseQuantity?.value || 1) : 1),
        buyer_note: shopPurchaseNote?.value.trim() || '',
        purchase_key: `${Date.now().toString(36)}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-shop`,
        delivery: (selectedShopItem.delivery_type === 'event' || selectedShopItem.requires_coordinates) ? (() => {
          if (!shopCoordinateConfirm?.checked) throw new Error('Confirm that you checked the in-game coordinates.');
          if (shopDeliveryLocation?.value) return { location_id: Number(shopDeliveryLocation.value) };
          const payload = {
            x: shopDeliveryX?.value,
            y: shopDeliveryY?.value,
            z: shopDeliveryZ?.value,
            rotation: shopDeliveryRotation?.value || 0,
            save_location: Boolean(shopSaveLocation?.checked),
            location_name: shopSaveLocationName?.value.trim() || ''
          };
          if (!payload.x || payload.y === '' || !payload.z) throw new Error('Enter complete X, Y and Z coordinates.');
          if (payload.save_location && !payload.location_name) throw new Error('Name the saved location before continuing.');
          return payload;
        })() : null
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
    const reasonRequired = ['cancel', 'refund'].includes(action);
    if (shopOrderActionNote) {
      shopOrderActionNote.required = reasonRequired;
      shopOrderActionNote.minLength = reasonRequired ? 3 : 0;
      shopOrderActionNote.placeholder = reasonRequired
        ? 'Explain why this order is being cancelled or refunded.'
        : 'Optional processing or fulfilment note.';
    }
    if (shopOrderActionNoteLabel) shopOrderActionNoteLabel.textContent = reasonRequired ? 'Reason' : 'Action note';
    if (shopOrderActionNoteHelp) shopOrderActionNoteHelp.textContent = reasonRequired
      ? 'Required · 3–1,000 characters'
      : 'Optional for processing and fulfilment';
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
    title.textContent = order.delivery_type === 'event' ? `#${order.order_id} · ${order.buyer.psn_id} · ${Number(order.event_restarts || 1).toLocaleString()} restart(s) · ${order.item.name}` : `#${order.order_id} · ${order.buyer.psn_id} · ${order.quantity} × ${order.item.name}`;
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
    await Promise.all([loadAdminShopOrders(sessionToken), loadDeliveryQueue(sessionToken), loadMemberShop(sessionToken)]);
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

const populateOwnerShopCategories = () => {
  [[ownerShopCategory, 'manual'], [ownerEventCategory, 'event']].forEach(([select, type]) => {
    if (!select) return;
    const selected = select.value || 'all';
    select.replaceChildren();
    const all = document.createElement('option'); all.value = 'all'; all.textContent = 'All categories'; select.append(all);
    [...new Set(ownerShopItems.filter((item) => (item.fulfilment_type === 'event' ? 'event' : 'manual') === type).map((item) => String(item.category)))].sort().forEach((category) => { const option = document.createElement('option'); option.value = category; option.textContent = category; select.append(option); });
    select.value = [...select.options].some((option) => option.value === selected) ? selected : 'all';
  });
};

const renderOwnerShopItems = () => {
  if (!ownerShopItemList) return;
  ownerShopItemList.replaceChildren(); if (ownerEventItemList) ownerEventItemList.replaceChildren();
  const manualQuery = String(ownerShopSearch?.value || '').trim().toLowerCase();
  const eventQuery = String(ownerEventSearch?.value || '').trim().toLowerCase();
  const manualCategory = ownerShopCategory?.value || 'all'; const eventCategory = ownerEventCategory?.value || 'all';
  const manualItems = ownerShopItems.filter((item) => item.fulfilment_type !== 'event' && (manualCategory === 'all' || item.category === manualCategory) && (!manualQuery || `${item.item_id} ${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(manualQuery)));
  const eventItems = ownerShopItems.filter((item) => item.fulfilment_type === 'event' && (eventCategory === 'all' || item.category === eventCategory) && (!eventQuery || `${item.item_id} ${item.name} ${item.sku} ${item.category} ${item.delivery_profile?.child_type || ''}`.toLowerCase().includes(eventQuery)));
  manualItems.forEach((item) => { const row=document.createElement('tr'); const itemCell=document.createElement('td'); const strong=document.createElement('strong'); strong.textContent=`#${item.item_id} · ${item.name}`; const small=document.createElement('small'); small.textContent=item.sku; itemCell.append(strong,document.createElement('br'),small); const category=document.createElement('td'); category.textContent=item.category; const scope=document.createElement('td'); scope.textContent=String(item.catalogue_scope||'local').toLowerCase()==='global'?'Global':'Local'; const price=document.createElement('td'); price.textContent=formatMoney(item.price); const stock=document.createElement('td'); stock.textContent=item.stock_quantity==null?'Unlimited':String(item.stock_quantity); const limits=document.createElement('td'); limits.textContent=`${item.max_per_order}/order · ${item.max_per_player==null?'No player limit':`${item.max_per_player}/player`}`; const state=document.createElement('td'); const pill=document.createElement('span'); pill.className=`table-status ${item.active?'online':'offline'}`; pill.textContent=item.active?'Active':'Inactive'; state.append(pill); const action=document.createElement('td'); action.append(ownerShopEditButton(item)); row.append(itemCell,category,scope,price,stock,limits,state,action); ownerShopItemList.append(row); });
  eventItems.forEach((item) => { const profile=item.delivery_profile||{}; const row=document.createElement('tr'); const name=document.createElement('td'); const strong=document.createElement('strong'); strong.textContent=`#${item.item_id} · ${item.name}`; const small=document.createElement('small'); small.textContent=item.sku; name.append(strong,document.createElement('br'),small); const category=document.createElement('td'); category.textContent=item.category; const child=document.createElement('td'); child.textContent=profile.child_type||'Missing profile'; const price=document.createElement('td'); price.textContent=`${formatMoney(item.price)} / restart`; const restarts=document.createElement('td'); restarts.textContent=`${Number(profile.minimum_restarts||1).toLocaleString()}–${Number(profile.maximum_restarts||30000).toLocaleString()}`; const approval=document.createElement('td'); approval.textContent='Automatic queue'; const state=document.createElement('td'); const pill=document.createElement('span'); pill.className=`table-status ${item.active?'online':'offline'}`; pill.textContent=item.active?'Active':'Inactive'; state.append(pill); const action=document.createElement('td'); action.append(ownerShopEditButton(item)); row.append(name,category,child,price,restarts,approval,state,action); ownerEventItemList.append(row); });
  if (ownerShopEmpty) ownerShopEmpty.hidden = manualItems.length !== 0;
  if (ownerEventItemEmpty) ownerEventItemEmpty.hidden = eventItems.length !== 0;
};

const profileListText = (items) => (Array.isArray(items) ? items : []).map((entry) => {
  if (typeof entry === 'string') return entry;
  const chance = entry?.chance == null ? 1 : Number(entry.chance);
  return chance === 1 ? String(entry.name || entry.type || '') : `${entry.name || entry.type || ''},${chance}`;
}).filter(Boolean).join('\n');

const parseProfileList = (value) => String(value || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
  const [type, rawChance] = line.split(',', 2).map((part) => part.trim());
  return { name: type, chance: rawChance === undefined || rawChance === '' ? 1 : Number(rawChance) };
});

const xmlDirectChild = (root, tag) => [...root.children].filter((child) => child.tagName.toLowerCase() === tag.toLowerCase());

const parseXmlEditorSnippet = (value, label, rootTag) => {
  const text = String(value || '').trim();
  if (!text) throw new Error(`${label} is required.`);
  if (/<\?xml|<!doctype|<!entity/i.test(text)) throw new Error(`${label} cannot contain an XML declaration, DTD or entity.`);
  const documentValue = new DOMParser().parseFromString(text, 'application/xml');
  if (documentValue.querySelector('parsererror')) throw new Error(`${label} is not valid XML.`);
  const root = documentValue.documentElement;
  if (!root || root.tagName.toLowerCase() !== rootTag) throw new Error(`${label} must contain one <${rootTag}> element.`);
  return root;
};

const requiredXmlChild = (root, tag) => {
  const matches = xmlDirectChild(root, tag);
  if (matches.length !== 1) throw new Error(`Event XML must contain exactly one <${tag}> element.`);
  return matches[0];
};

const eventXmlInteger = (root, tag, { minimum = 0 } = {}) => {
  const raw = String(requiredXmlChild(root, tag).textContent || '').trim();
  if (!/^\d+$/.test(raw) || Number(raw) < minimum || Number(raw) > 2147483647) {
    throw new Error(`Event XML <${tag}> must be a whole number${minimum ? ` of at least ${minimum}` : ''}.`);
  }
  return Number(raw);
};

const parseEventXmlEditor = (value) => {
  const root = parseXmlEditorSnippet(value, 'Event XML', 'event');
  if (!/^[A-Za-z0-9_.-]+$/.test(String(root.getAttribute('name') || ''))) throw new Error('Event XML requires a valid name attribute.');
  const minimum = eventXmlInteger(root, 'min');
  const maximum = eventXmlInteger(root, 'max');
  if (minimum > maximum) throw new Error('Event XML <min> cannot exceed <max>.');
  eventXmlInteger(root, 'nominal');
  const lifetime = eventXmlInteger(root, 'lifetime', { minimum: 1 });
  const restock = eventXmlInteger(root, 'restock');
  const saferadius = eventXmlInteger(root, 'saferadius');
  const distanceradius = eventXmlInteger(root, 'distanceradius');
  const cleanupradius = eventXmlInteger(root, 'cleanupradius');
  const position = String(requiredXmlChild(root, 'position').textContent || '').trim().toLowerCase();
  if (position !== 'fixed') throw new Error('Restart-bound Event XML must use <position>fixed</position>.');
  const limit = String(requiredXmlChild(root, 'limit').textContent || '').trim().toLowerCase();
  if (!['custom', 'child', 'parent', 'mixed'].includes(limit)) throw new Error('Event XML <limit> must be custom, child, parent or mixed.');
  const active = String(requiredXmlChild(root, 'active').textContent || '').trim();
  if (!['0', '1'].includes(active)) throw new Error('Event XML <active> must be 0 or 1.');
  const flags = requiredXmlChild(root, 'flags');
  const flag = (name) => {
    const raw = String(flags.getAttribute(name) || '');
    if (!['0', '1'].includes(raw)) throw new Error(`Event XML ${name} flag must be 0 or 1.`);
    return raw === '1';
  };
  const children = requiredXmlChild(root, 'children');
  const childNodes = [...children.children].filter((child) => child.tagName.toLowerCase() === 'child');
  if (childNodes.length !== 1) throw new Error('Event XML must contain exactly one <child> element.');
  const child = childNodes[0];
  const childType = String(child.getAttribute('type') || '').trim();
  if (!/^[A-Za-z0-9_.-]+$/.test(childType)) throw new Error('Event XML child requires a valid DayZ classname.');
  ['min', 'max', 'lootmin', 'lootmax'].forEach((attribute) => {
    if (!/^\d+$/.test(String(child.getAttribute(attribute) || ''))) throw new Error(`Event XML child ${attribute} must be a whole number.`);
  });
  if (Number(child.getAttribute('min')) > Number(child.getAttribute('max'))) throw new Error('Event XML child min cannot exceed child max.');
  const secondaryNodes = xmlDirectChild(root, 'secondary');
  if (secondaryNodes.length > 1) throw new Error('Event XML may contain only one <secondary> element.');
  const secondary = secondaryNodes.length ? String(secondaryNodes[0].textContent || '').trim() : '';
  if (secondary && !/^[A-Za-z0-9_.-]+$/.test(secondary)) throw new Error('Event XML secondary event is not a valid classname.');
  return {
    root, childType, secondary, lifetime, restock, saferadius, distanceradius, cleanupradius, limit,
    deletable: flag('deletable'), initRandom: flag('init_random'), removeDamaged: flag('remove_damaged')
  };
};

const parseEventZoneEditor = (value) => {
  const text = String(value || '').trim();
  if (!text) return null;
  const root = parseXmlEditorSnippet(text, 'Event Zone', 'zone');
  if (root.children.length || String(root.textContent || '').trim()) throw new Error('Event Zone cannot contain text or child elements.');
  const required = ['smin', 'smax', 'dmin', 'dmax', 'r'];
  const unknown = [...root.attributes].map((attribute) => attribute.name).filter((name) => !required.includes(name));
  if (unknown.length) throw new Error(`Event Zone has unsupported attributes: ${unknown.join(', ')}.`);
  const values = {};
  required.forEach((name) => {
    const raw = String(root.getAttribute(name) || '').trim();
    if (!/^\d+$/.test(raw) || Number(raw) > 2147483647) throw new Error(`Event Zone ${name} must be a non-negative whole number.`);
    values[name] = Number(raw);
  });
  if (values.smin > values.smax) throw new Error('Event Zone smin cannot exceed smax.');
  if (values.dmin > values.dmax) throw new Error('Event Zone dmin cannot exceed dmax.');
  return { root, values };
};

const minifyXmlEditor = (value, label, rootTag) => new XMLSerializer().serializeToString(parseXmlEditorSnippet(value, label, rootTag));

const formatXmlEditor = (value, label, rootTag) => {
  const compact = minifyXmlEditor(value, label, rootTag).replace(/>\s+</g, '><').replace(/></g, '>\n<');
  let depth = 0;
  return compact.split('\n').map((line) => {
    const trimmed = line.trim();
    if (/^<\//.test(trimmed)) depth = Math.max(0, depth - 1);
    const result = `${'    '.repeat(depth)}${trimmed}`;
    if (/^<[^!?/][^>]*>$/.test(trimmed) && !/\/>$/.test(trimmed) && !/<\/[^>]+>$/.test(trimmed)) depth += 1;
    return result;
  }).join('\n');
};

const setEventEditorStatus = (field, status, message, valid) => {
  if (field) field.setCustomValidity(valid ? '' : message);
  if (status) {
    status.textContent = message;
    status.classList.toggle('valid', valid);
    status.classList.toggle('invalid', !valid);
  }
};

const syncParsedEventFields = (parsed) => {
  const setValue = (selector, value) => { const field = document.querySelector(selector); if (field) field.value = String(value); };
  const setChecked = (selector, value) => { const field = document.querySelector(selector); if (field) field.checked = Boolean(value); };
  setValue('[data-shop-profile-child]', parsed.childType);
  setValue('[data-shop-profile-secondary]', parsed.secondary);
  setValue('[data-shop-profile-lifetime]', parsed.lifetime);
  setValue('[data-shop-profile-restock]', parsed.restock);
  setValue('[data-shop-profile-saferadius]', parsed.saferadius);
  setValue('[data-shop-profile-distanceradius]', parsed.distanceradius);
  setValue('[data-shop-profile-cleanupradius]', parsed.cleanupradius);
  setValue('[data-shop-profile-limit]', parsed.limit);
  setChecked('[data-shop-profile-deletable]', parsed.deletable);
  setChecked('[data-shop-profile-random]', parsed.initRandom);
  setChecked('[data-shop-profile-remove-damaged]', parsed.removeDamaged);
  if (shopEventChildReadout) shopEventChildReadout.value = parsed.childType;
};

const validateEventTemplateEditors = ({ throwOnError = false } = {}) => {
  let parsedEvent = null;
  let parsedZone = null;
  try {
    parsedEvent = parseEventXmlEditor(shopEventXml?.value || '');
    syncParsedEventFields(parsedEvent);
    setEventEditorStatus(shopEventXml, shopEventXmlStatus, `Valid event · child ${parsedEvent.childType}`, true);
  } catch (error) {
    if (shopEventChildReadout) shopEventChildReadout.value = 'Not detected';
    setEventEditorStatus(shopEventXml, shopEventXmlStatus, error.message || 'Event XML is invalid.', false);
    if (throwOnError) { shopEventXml?.focus(); throw error; }
  }
  try {
    parsedZone = parseEventZoneEditor(shopEventZone?.value || '');
    setEventEditorStatus(
      shopEventZone,
      shopEventZoneStatus,
      parsedZone ? 'Valid optional event zone.' : 'Optional zone omitted; the position entry will be created without a <zone>.',
      true
    );
  } catch (error) {
    setEventEditorStatus(shopEventZone, shopEventZoneStatus, error.message || 'Event Zone is invalid.', false);
    if (throwOnError) { shopEventZone?.focus(); throw error; }
  }
  if (throwOnError && !parsedEvent) throw new Error('Complete the Event XML field.');
  return { parsedEvent, parsedZone };
};

const updateEventEditorCounts = () => {
  if (shopEventXmlCount) shopEventXmlCount.textContent = `${String(shopEventXml?.value || '').length.toLocaleString()} / 20,000`;
  if (shopEventZoneCount) shopEventZoneCount.textContent = `${String(shopEventZone?.value || '').length.toLocaleString()} / 1,000`;
};

const copyEventEditor = async (field, status) => {
  const text = String(field?.value || '');
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    if (status) status.textContent = 'Copied to clipboard.';
  } catch (_error) {
    field?.select();
    document.execCommand?.('copy');
    if (status) status.textContent = 'Copied to clipboard.';
  }
};

const handleEventEditorTool = async (field, status, rootTag, action) => {
  try {
    if (action === 'copy') return copyEventEditor(field, status);
    if (action === 'clear') field.value = '';
    const emptyOptionalZone = rootTag === 'zone' && !String(field?.value || '').trim();
    if (action === 'format' && !emptyOptionalZone) field.value = formatXmlEditor(field.value, rootTag === 'event' ? 'Event XML' : 'Event Zone', rootTag);
    if (action === 'minify' && !emptyOptionalZone) field.value = minifyXmlEditor(field.value, rootTag === 'event' ? 'Event XML' : 'Event Zone', rootTag);
    updateEventEditorCounts();
    validateEventTemplateEditors();
    field.focus();
  } catch (error) {
    setEventEditorStatus(field, status, error.message || 'The XML could not be processed.', false);
    field?.focus();
  }
};

const legacyEventXmlFromProfile = (profile = {}) => {
  const flags = profile.flags || {};
  const child = String(profile.child_type || 'VehiclePLACEHOLDER');
  const secondary = String(profile.secondary_event || '').trim();
  return `<event name="Vehicle">
    <nominal>1</nominal>
    <min>1</min>
    <max>1</max>
    <lifetime>${Number(profile.lifetime ?? 3888000)}</lifetime>
    <restock>${Number(profile.restock ?? 0)}</restock>
    <saferadius>${Number(profile.saferadius ?? 0)}</saferadius>
    <distanceradius>${Number(profile.distanceradius ?? 0)}</distanceradius>
    <cleanupradius>${Number(profile.cleanupradius ?? 0)}</cleanupradius>${secondary ? `
    <secondary>${secondary}</secondary>` : ''}
    <flags deletable="${flags.deletable ? 1 : 0}" init_random="${flags.init_random ? 1 : 0}" remove_damaged="${flags.remove_damaged ? 1 : 0}" />
    <position>fixed</position>
    <limit>${String(profile.event_limit || 'custom')}</limit>
    <active>1</active>
    <children>
        <child lootmax="0" lootmin="0" max="1" min="1" type="${child}" />
    </children>
</event>`;
};

const parseShopItemTypes = (text) => String(text || '').split(/\r?\n/).map((value) => value.trim()).filter(Boolean);

const generatedShopSku = (name, isEvent) => {
  const base = String(name || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'ITEM';
  return `${isEvent ? 'EVENT' : 'ITEM'}-${base}`.slice(0, 40);
};

const populateShopItemRoleSelect = (selectedRoles = []) => {
  if (!shopItemRequiredRoles) return;
  const selected = new Set((Array.isArray(selectedRoles) ? selectedRoles : []).map((role) => String(role?.id || role?.role_id || role || '')));
  shopItemRequiredRoles.replaceChildren();
  ownerShopRoles.slice(0, 250).forEach((role) => {
    const option = document.createElement('option');
    option.value = String(role.id);
    option.textContent = String(role.name);
    option.selected = selected.has(String(role.id));
    shopItemRequiredRoles.append(option);
  });
  const help = shopItemRequiredRoles.closest('label')?.querySelector('small');
  if (help) help.textContent = `${shopItemRequiredRoles.selectedOptions.length} / 5 selected`;
};

const selectedShopItemRoles = () => [...(shopItemRequiredRoles?.selectedOptions || [])].slice(0, 5).map((option) => ({
  role_id: String(option.value), role_name: String(option.textContent || 'Discord role')
}));

const syncShopPurchaseWindow = () => {
  const enabled = Boolean(shopItemCooldownEnabled?.checked);
  if (shopPurchaseWindow) shopPurchaseWindow.hidden = !enabled;
  if (shopItemLimitGlobal) shopItemLimitGlobal.disabled = !enabled;
  [shopItemLimitCount, shopItemLimitSeconds].forEach((input) => {
    if (!input) return;
    input.disabled = !enabled;
    input.required = enabled;
  });
};

const syncShopItemDeliveryEditor = () => {
  const isEvent = shopItemDeliveryType?.value === 'event';
  shopEventProfileEditors.forEach((editor) => { editor.hidden = !isEvent; });
  document.querySelectorAll('[data-shop-event-profile] input, [data-shop-event-profile] select, [data-shop-event-profile] textarea').forEach((field) => {
    field.disabled = !isEvent;
  });
  shopManualOnlyFields.forEach((field) => { field.hidden = isEvent; });
  if (shopItemTypes) {
    shopItemTypes.disabled = isEvent;
    shopItemTypes.required = !isEvent;
  }
  const maxOrder = document.querySelector('[data-shop-item-max-order]');
  if (maxOrder) { maxOrder.disabled = isEvent; if (isEvent) maxOrder.value = '1'; }
  const isEditing = editingShopItemId != null;
  const editorName = String(document.querySelector('[data-shop-item-name]')?.value || '').trim();
  setText('[data-shop-item-dialog-title]', isEditing ? (isEvent ? 'Edit Event Item' : 'Edit Item') : (isEvent ? 'Create Event Item' : 'Create Item'));
  setText('[data-shop-builder-subtitle]', isEditing
    ? `Editing ${editorName || (isEvent ? 'event item' : 'shop item')}`
    : isEvent ? 'Create a restart-bound event item.' : 'Create a purchasable shop item.');
  setText('[data-shop-builder-kicker]', isEvent ? 'Event item' : 'Catalogue item');
  setText('[data-shop-builder-main-title]', isEvent ? 'Create Event Item' : 'Create Item');
  setText('[data-shop-price-label]', isEvent ? 'Price Per Restart' : 'Price');
  setText('[data-shop-builder-notice-title]', isEvent ? 'Configure an event the player can restart from the shop.' : 'Start with the fields players see first.');
  setText('[data-shop-builder-notice-copy]', isEvent ? 'Event XML, zone, category and restart bounds use the familiar DayZ event workflow.' : 'Name, price, types and category define what the player purchases.');
  setText('[data-save-shop-item]', isEditing ? 'Save changes' : 'Create');
  shopItemDialog?.classList.toggle('event-builder-mode', isEvent);
  if (isEvent) {
    if (shopEventXml && !shopEventXml.value.trim()) shopEventXml.value = DEFAULT_EVENT_XML;
    updateEventEditorCounts();
    validateEventTemplateEditors();
  }
  syncShopPurchaseWindow();
};

const openShopItemEditor = (item = null, { forceEvent = false } = {}) => {
  editingShopItemId = item?.item_id == null ? null : Number(item.item_id);
  shopItemForm?.reset();
  const profile = item?.delivery_profile || {};
  const isEventEditor = forceEvent || item?.fulfilment_type === 'event';
  if (shopItemDeliveryType) shopItemDeliveryType.value = isEventEditor ? 'event' : 'manual';
  const purchaseLimit = item?.purchase_limit || {};
  const values = {
    '[data-shop-item-sku]': item?.sku || '', '[data-shop-item-name]': item?.name || '',
    '[data-shop-item-category]': item?.category || (forceEvent ? 'Vehicles' : ''), '[data-shop-item-price]': item?.base_price || item?.price || '',
    '[data-shop-item-types]': Array.isArray(item?.types) ? item.types.join('\n') : '',
    '[data-shop-item-stock]': item?.stock_quantity ?? '', '[data-shop-item-max-order]': item?.max_per_order || 1,
    '[data-shop-item-max-player]': item?.max_per_player ?? '', '[data-shop-item-sort]': item?.sort_order || 0,
    '[data-shop-item-description]': item?.description || '', '[data-shop-item-fulfilment]': item?.fulfilment_instructions || '',
    '[data-shop-profile-name]': profile.profile_name || '', '[data-shop-profile-child]': profile.child_type || '',
    '[data-shop-profile-secondary]': profile.secondary_event || '', '[data-shop-profile-lifetime]': profile.lifetime ?? 3888000,
    '[data-shop-profile-restock]': profile.restock ?? 0, '[data-shop-profile-min-restarts]': profile.minimum_restarts ?? 1, '[data-shop-profile-max-restarts]': profile.maximum_restarts ?? 30000, '[data-shop-profile-limit]': profile.event_limit || 'custom',
    '[data-shop-profile-saferadius]': profile.saferadius ?? 0, '[data-shop-profile-distanceradius]': profile.distanceradius ?? 0,
    '[data-shop-profile-cleanupradius]': profile.cleanupradius ?? 0, '[data-shop-profile-attachments]': profileListText(profile.attachments),
    '[data-shop-profile-cargo]': profileListText(profile.cargo),
    '[data-shop-item-limit-count]': purchaseLimit.max_purchases || 1,
    '[data-shop-item-limit-seconds]': purchaseLimit.per_seconds || 60,
    '[data-shop-event-xml]': isEventEditor ? (profile.event_xml || (item ? legacyEventXmlFromProfile(profile) : DEFAULT_EVENT_XML)) : '',
    '[data-shop-event-zone]': isEventEditor ? (profile.event_zone || '') : ''
  };
  Object.entries(values).forEach(([selector, value]) => { const element = document.querySelector(selector); if (element) element.value = String(value); });
  populateShopItemRoleSelect(item?.required_roles || []);
  if (shopItemRequireAllRoles) shopItemRequireAllRoles.checked = item?.require_all_roles !== false;
  if (shopItemCooldownEnabled) shopItemCooldownEnabled.checked = Boolean(item?.purchase_limit);
  if (shopItemLimitGlobal) shopItemLimitGlobal.checked = Boolean(purchaseLimit.shared_across_players);
  if (shopItemHidden) shopItemHidden.checked = item ? !Boolean(item.active) : false;
  const catalogueScope = String(item?.catalogue_scope || 'local').toLowerCase();
  shopItemScopeInputs.forEach((input) => { input.checked = input.value === catalogueScope; });
  editingShopItemDiscounts = isEventEditor
    ? []
    : (Array.isArray(item?.discounts) ? item.discounts : []).map((entry) => ({
        role_id: String(entry.role_id || ''),
        role_name: String(entry.role_name || ''),
        amount: Number(entry.amount || 1),
        is_percentage: entry.is_percentage !== false,
        active: entry.active !== false
      }));
  renderShopItemDiscounts();
  const flagValues = {
    '[data-shop-profile-deletable]': profile.flags?.deletable ?? false,
    '[data-shop-profile-random]': profile.flags?.init_random ?? false,
    '[data-shop-profile-remove-damaged]': profile.flags?.remove_damaged ?? false
  };
  Object.entries(flagValues).forEach(([selector, value]) => { const element = document.querySelector(selector); if (element) element.checked = Boolean(value); });
  syncShopItemDeliveryEditor();
  updateEventEditorCounts();
  if (isEventEditor) validateEventTemplateEditors();
  showInlineMessage(shopItemMessage, '');
  if (typeof shopItemDialog?.showModal === 'function') shopItemDialog.showModal();
  else shopItemDialog?.setAttribute('open', '');
};

newShopItemButton?.addEventListener('click', () => openShopItemEditor());
newEventItemButton?.addEventListener('click', () => openShopItemEditor(null, { forceEvent: true }));
shopItemDeliveryType?.addEventListener('change', syncShopItemDeliveryEditor);
shopItemCooldownEnabled?.addEventListener('change', syncShopPurchaseWindow);
shopItemRequiredRoles?.addEventListener('change', () => populateShopItemRoleSelect(selectedShopItemRoles()));
shopEventXml?.addEventListener('input', () => { updateEventEditorCounts(); validateEventTemplateEditors(); });
shopEventZone?.addEventListener('input', () => { updateEventEditorCounts(); validateEventTemplateEditors(); });
shopEventXmlTools.forEach((button) => button.addEventListener('click', () => handleEventEditorTool(shopEventXml, shopEventXmlStatus, 'event', button.dataset.eventXmlAction)));
shopEventZoneTools.forEach((button) => button.addEventListener('click', () => handleEventEditorTool(shopEventZone, shopEventZoneStatus, 'zone', button.dataset.eventZoneAction)));
shopPriceQuickButtons.forEach((button) => button.addEventListener('click', () => {
  const input = document.querySelector('[data-shop-item-price]');
  if (input) { input.value = String(button.dataset.shopPriceValue || ''); input.focus(); }
}));
shopCategoryQuickButtons.forEach((button) => button.addEventListener('click', () => {
  const input = document.querySelector('[data-shop-item-category]');
  if (input) { input.value = String(button.dataset.shopCategoryValue || ''); input.focus(); }
}));
shopItemCancelButtons.forEach((button) => button.addEventListener('click', () => { if (!ownerShopRequestInProgress) shopItemDialog?.close?.(); }));

const renderShopItemDiscounts = () => {
  if (!shopItemDiscountList) return;
  shopItemDiscountList.replaceChildren();
  editingShopItemDiscounts.forEach((discount, index) => {
    const row = document.createElement('article');
    row.className = 'item-discount-row';

    const roleField = document.createElement('label');
    roleField.className = 'dialog-field item-discount-role';
    const roleLabel = document.createElement('span');
    roleLabel.textContent = 'Target role';
    const roleSelect = document.createElement('select');
    roleSelect.append(new Option('Select Discord role', ''));
    ownerShopRoles.forEach((role) => roleSelect.append(new Option(role.name, role.id)));
    roleSelect.value = String(discount.role_id || '');
    roleSelect.addEventListener('change', () => {
      const role = ownerShopRoles.find((entry) => String(entry.id) === roleSelect.value);
      editingShopItemDiscounts[index].role_id = roleSelect.value;
      editingShopItemDiscounts[index].role_name = role?.name || '';
    });
    roleField.append(roleLabel, roleSelect);

    const amountField = document.createElement('label');
    amountField.className = 'dialog-field item-discount-amount';
    const amountLabel = document.createElement('span');
    amountLabel.textContent = 'Amount';
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.min = '1';
    amountInput.step = '1';
    amountInput.value = String(discount.amount || 1);
    amountInput.max = discount.is_percentage !== false ? '100' : '1000000000';
    amountInput.addEventListener('input', () => {
      editingShopItemDiscounts[index].amount = Number(amountInput.value || 0);
    });
    amountField.append(amountLabel, amountInput);

    const percentage = document.createElement('label');
    percentage.className = 'toggle-setting compact-toggle item-discount-toggle';
    const percentageInput = document.createElement('input');
    percentageInput.type = 'checkbox';
    percentageInput.checked = discount.is_percentage !== false;
    percentageInput.addEventListener('change', () => {
      editingShopItemDiscounts[index].is_percentage = percentageInput.checked;
      amountInput.max = percentageInput.checked ? '100' : '1000000000';
    });
    const percentageCopy = document.createElement('span');
    const percentageStrong = document.createElement('strong');
    percentageStrong.textContent = 'As percentage';
    const percentageSmall = document.createElement('small');
    percentageSmall.textContent = 'Turn off for a fixed-dollar reduction.';
    percentageCopy.append(percentageStrong, percentageSmall);
    percentage.append(percentageInput, percentageCopy);

    const active = document.createElement('label');
    active.className = 'toggle-setting compact-toggle item-discount-toggle';
    const activeInput = document.createElement('input');
    activeInput.type = 'checkbox';
    activeInput.checked = discount.active !== false;
    activeInput.addEventListener('change', () => {
      editingShopItemDiscounts[index].active = activeInput.checked;
    });
    const activeCopy = document.createElement('span');
    const activeStrong = document.createElement('strong');
    activeStrong.textContent = 'Active';
    const activeSmall = document.createElement('small');
    activeSmall.textContent = 'Available to matching members.';
    activeCopy.append(activeStrong, activeSmall);
    active.append(activeInput, activeCopy);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'primary-action danger-action compact-action item-discount-remove';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      editingShopItemDiscounts.splice(index, 1);
      renderShopItemDiscounts();
    });

    row.append(roleField, amountField, percentage, active, remove);
    shopItemDiscountList.append(row);
  });
  if (shopItemDiscountEmpty) shopItemDiscountEmpty.hidden = editingShopItemDiscounts.length !== 0;
  if (shopItemDiscountCount) shopItemDiscountCount.textContent = `${editingShopItemDiscounts.length} / 15`;
  if (addShopItemDiscountButton) addShopItemDiscountButton.disabled = editingShopItemDiscounts.length >= 15;
};

addShopItemDiscountButton?.addEventListener('click', () => {
  if (editingShopItemDiscounts.length >= 15) {
    showInlineMessage(shopItemMessage, 'A maximum of 15 role discounts is supported per item.');
    return;
  }
  editingShopItemDiscounts.push({
    role_id: '',
    role_name: '',
    amount: 10,
    is_percentage: true,
    active: true
  });
  renderShopItemDiscounts();
});

const populateOwnerShopRoleSelect = () => {
  if (!ownerShopRequiredRole) return;
  const selected = ownerShopRequiredRole.value || '';
  ownerShopRequiredRole.replaceChildren();
  const open = document.createElement('option'); open.value = ''; open.textContent = 'Anyone in the server'; ownerShopRequiredRole.append(open);
  ownerShopRoles.forEach((role) => {
    const option = document.createElement('option'); option.value = String(role.id); option.textContent = String(role.name); ownerShopRequiredRole.append(option);
  });
  ownerShopRequiredRole.value = [...ownerShopRequiredRole.options].some((option) => option.value === selected) ? selected : '';
};

const renderOwnerShopDiscounts = () => {
  if (!ownerShopDiscountList) return;
  ownerShopDiscountList.replaceChildren();
  ownerShopDiscounts.forEach((discount, index) => {
    const row = document.createElement('article'); row.className = 'shop-discount-row';
    const roleField = document.createElement('label'); roleField.className = 'dialog-field';
    const roleLabel = document.createElement('span'); roleLabel.textContent = 'Target role';
    const roleSelect = document.createElement('select');
    roleSelect.append(new Option('Select Discord role', ''));
    ownerShopRoles.forEach((role) => roleSelect.append(new Option(role.name, role.id)));
    roleSelect.value = String(discount.role_id || '');
    roleSelect.addEventListener('change', () => {
      const role = ownerShopRoles.find((entry) => String(entry.id) === roleSelect.value);
      ownerShopDiscounts[index].role_id = roleSelect.value;
      ownerShopDiscounts[index].role_name = role?.name || '';
    });
    roleField.append(roleLabel, roleSelect);
    const amountField = document.createElement('label'); amountField.className = 'dialog-field';
    const amountLabel = document.createElement('span'); amountLabel.textContent = 'Amount';
    const amountInput = document.createElement('input'); amountInput.type = 'number'; amountInput.min = '1'; amountInput.step = '1'; amountInput.value = String(discount.amount || 1);
    amountInput.addEventListener('input', () => { ownerShopDiscounts[index].amount = Number(amountInput.value || 0); });
    amountField.append(amountLabel, amountInput);
    const percentage = document.createElement('label'); percentage.className = 'toggle-setting compact-toggle';
    const percentageInput = document.createElement('input'); percentageInput.type = 'checkbox'; percentageInput.checked = discount.is_percentage !== false;
    percentageInput.addEventListener('change', () => {
      ownerShopDiscounts[index].is_percentage = percentageInput.checked;
      amountInput.max = percentageInput.checked ? '100' : '1000000000';
    });
    amountInput.max = percentageInput.checked ? '100' : '1000000000';
    const percentageCopy = document.createElement('span');
    const percentageStrong = document.createElement('strong'); percentageStrong.textContent = 'Percentage';
    const percentageSmall = document.createElement('small'); percentageSmall.textContent = 'Otherwise a fixed dollar reduction.';
    percentageCopy.append(percentageStrong, percentageSmall); percentage.append(percentageInput, percentageCopy);
    const active = document.createElement('label'); active.className = 'toggle-setting compact-toggle';
    const activeInput = document.createElement('input'); activeInput.type = 'checkbox'; activeInput.checked = discount.active !== false;
    activeInput.addEventListener('change', () => { ownerShopDiscounts[index].active = activeInput.checked; });
    const activeCopy = document.createElement('span');
    const activeStrong = document.createElement('strong'); activeStrong.textContent = 'Active';
    const activeSmall = document.createElement('small'); activeSmall.textContent = 'Applied automatically to matching members.';
    activeCopy.append(activeStrong, activeSmall); active.append(activeInput, activeCopy);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'primary-action danger-action compact-action'; remove.textContent = 'Remove';
    remove.addEventListener('click', () => { ownerShopDiscounts.splice(index, 1); renderOwnerShopDiscounts(); });
    row.append(roleField, amountField, percentage, active, remove);
    ownerShopDiscountList.append(row);
  });
  if (ownerShopDiscountEmpty) ownerShopDiscountEmpty.hidden = ownerShopDiscounts.length !== 0;
};

addShopDiscountButton?.addEventListener('click', () => {
  if (ownerShopDiscounts.length >= 25) {
    showInlineMessage(ownerShopMessage, 'A maximum of 25 role discounts is supported.');
    return;
  }
  ownerShopDiscounts.push({ role_id: '', role_name: '', amount: 10, is_percentage: true, active: true });
  renderOwnerShopDiscounts();
});

const loadOwnerShopConfig = async (sessionToken = storageGet(AUTH_SESSION_KEY)) => {
  if (!sessionToken || dashboardAccessLevel !== 'owner' || ownerShopRequestInProgress) return false;
  ownerShopRequestInProgress = true;
  refreshShopConfigButton?.setAttribute('disabled', '');
  refreshShopSettingsButton?.setAttribute('disabled', '');
  try {
    const response = await authFetch(OWNER_SHOP_CONFIG_URL, { headers: { Accept: 'application/json', Authorization: `Bearer ${sessionToken}` } });
    const payload = await response.json().catch(() => ({}));
    if (handleAdminPlayerAuthorizationResponse(response, payload, { actionRequest: false })) return false;
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'Configuration unavailable');
    const settings = payload.settings || {};
    ownerShopRoles = Array.isArray(payload.roles) ? payload.roles : [];
    populateShopItemRoleSelect(selectedShopItemRoles());
    renderShopItemDiscounts();
    if (ownerShopEnabled) ownerShopEnabled.checked = Boolean(settings.enabled);
    if (ownerShopWebsiteEnabled) ownerShopWebsiteEnabled.checked = settings.website_enabled !== false;
    if (ownerShopTitle) ownerShopTitle.value = String(settings.title || '');
    if (ownerShopDescription) ownerShopDescription.value = String(settings.description || '');
    if (ownerShopInstructions) ownerShopInstructions.value = String(settings.purchase_instructions || '');
    if (ownerShopImageUrl) ownerShopImageUrl.value = String(settings.dashboard_image_url || '');
    if (ownerShopRestartMin) ownerShopRestartMin.value = String(settings.event_restart_min || 1);
    if (ownerShopRestartMax) ownerShopRestartMax.value = String(settings.event_restart_max || 30000);
    populateOwnerShopRoleSelect();
    if (ownerShopRequiredRole) ownerShopRequiredRole.value = String(settings.required_role?.id || '');
    ownerShopDiscounts = (Array.isArray(settings.discounts) ? settings.discounts : []).map((entry) => ({ ...entry }));
    renderOwnerShopDiscounts();
    ownerShopItems = Array.isArray(payload.items) ? payload.items : [];
    populateOwnerShopCategories();
    renderOwnerShopItems();
    if (ownerShopError) ownerShopError.hidden = true;
    return true;
  } catch (error) {
    if (ownerShopError) ownerShopError.hidden = false;
    return false;
  } finally {
    ownerShopRequestInProgress = false;
    refreshShopConfigButton?.removeAttribute('disabled');
    refreshShopSettingsButton?.removeAttribute('disabled');
  }
};
[ownerShopSearch, ownerEventSearch].forEach((input) => input?.addEventListener('input', renderOwnerShopItems));
[ownerShopCategory, ownerEventCategory].forEach((select) => select?.addEventListener('change', renderOwnerShopItems));
refreshShopConfigButton?.addEventListener('click', () => loadOwnerShopConfig());
refreshShopSettingsButton?.addEventListener('click', () => loadOwnerShopConfig());
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
        enabled: Boolean(ownerShopEnabled?.checked),
        website_enabled: Boolean(ownerShopWebsiteEnabled?.checked),
        title: ownerShopTitle?.value.trim() || '',
        description: ownerShopDescription?.value.trim() || '',
        purchase_instructions: ownerShopInstructions?.value.trim() || '',
        dashboard_image_url: ownerShopImageUrl?.value.trim() || '',
        required_role_id: ownerShopRequiredRole?.value || null,
        required_role_name: ownerShopRequiredRole?.selectedOptions?.[0]?.textContent || '',
        event_restart_min: Number(ownerShopRestartMin?.value || 1),
        event_restart_max: Number(ownerShopRestartMax?.value || 30000),
        discounts: ownerShopDiscounts.map((entry) => ({
          role_id: entry.role_id,
          role_name: entry.role_name,
          amount: Number(entry.amount || 0),
          is_percentage: entry.is_percentage !== false,
          active: entry.active !== false
        }))
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
    const isEvent = shopItemDeliveryType?.value === 'event';
    if (isEvent) validateEventTemplateEditors({ throwOnError: true });
    const name = String(value('[data-shop-item-name]')).trim();
    const types = isEvent ? [] : parseShopItemTypes(value('[data-shop-item-types]'));
    if (!isEvent && !types.length) throw new Error('Add at least one DayZ classname to Types.');
    const sku = String(value('[data-shop-item-sku]')).trim() || generatedShopSku(name, isEvent);
    const description = String(value('[data-shop-item-description]')).trim() || `${name} catalogue item.`;
    const eventGroup = String(value('[data-shop-profile-name]')).trim() || name;
    const response = await protectedActionFetch(OWNER_SHOP_ITEM_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify({
        item_id: editingShopItemId, sku, name,
        category: value('[data-shop-item-category]') || (isEvent ? 'Events' : 'Other'), price: value('[data-shop-item-price]'),
        types,
        required_roles: selectedShopItemRoles(),
        require_all_roles: Boolean(shopItemRequireAllRoles?.checked),
        purchase_limit_count: shopItemCooldownEnabled?.checked ? value('[data-shop-item-limit-count]') : '',
        purchase_limit_seconds: shopItemCooldownEnabled?.checked ? value('[data-shop-item-limit-seconds]') : '',
        purchase_limit_global: Boolean(shopItemCooldownEnabled?.checked && shopItemLimitGlobal?.checked),
        catalogue_scope: isEvent ? 'local' : (shopItemScopeInputs.find((input) => input.checked)?.value || 'local'),
        discounts: isEvent ? [] : editingShopItemDiscounts.map((entry) => ({
          role_id: String(entry.role_id || ''),
          role_name: String(entry.role_name || ''),
          amount: Number(entry.amount || 0),
          is_percentage: entry.is_percentage !== false,
          active: entry.active !== false
        })),
        stock_quantity: value('[data-shop-item-stock]'), max_per_order: isEvent ? 1 : value('[data-shop-item-max-order]'),
        max_per_player: isEvent ? '' : value('[data-shop-item-max-player]'), sort_order: value('[data-shop-item-sort]'),
        description, fulfilment_instructions: value('[data-shop-item-fulfilment]'),
        fulfilment_type: isEvent ? 'event' : 'manual',
        delivery_profile: isEvent ? {
          profile_name: eventGroup, child_type: value('[data-shop-profile-child]'),
          secondary_event: value('[data-shop-profile-secondary]'), lifetime: value('[data-shop-profile-lifetime]'),
          restock: value('[data-shop-profile-restock]'), minimum_restarts: value('[data-shop-profile-min-restarts]'), maximum_restarts: value('[data-shop-profile-max-restarts]'), event_limit: value('[data-shop-profile-limit]'),
          saferadius: value('[data-shop-profile-saferadius]'), distanceradius: value('[data-shop-profile-distanceradius]'),
          cleanupradius: value('[data-shop-profile-cleanupradius]'), attachments: parseProfileList(value('[data-shop-profile-attachments]')),
          cargo: parseProfileList(value('[data-shop-profile-cargo]')),
          event_xml: value('[data-shop-event-xml]'), event_zone: value('[data-shop-event-zone]'),
          requires_approval: false,
          deletable: Boolean(document.querySelector('[data-shop-profile-deletable]')?.checked),
          init_random: Boolean(document.querySelector('[data-shop-profile-random]')?.checked),
          remove_damaged: Boolean(document.querySelector('[data-shop-profile-remove-damaged]')?.checked)
        } : null,
        active: !Boolean(shopItemHidden?.checked)
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
  if (view === 'shopadmin') loadOwnerShopConfig(token);
});
loadPublicShop();


