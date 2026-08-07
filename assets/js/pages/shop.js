const API_BASE = 'https://world-war-z.up.railway.app';
const URLS = {
  authConfig: `${API_BASE}/api/auth/config`,
  authLogin: `${API_BASE}/api/auth/discord/login`,
  authComplete: `${API_BASE}/api/auth/discord/complete`,
  authMe: `${API_BASE}/api/auth/me`,
  authLogout: `${API_BASE}/api/auth/logout`,
  catalogue: `${API_BASE}/api/shop/catalogue`,
  account: `${API_BASE}/api/account/shop`,
  purchase: `${API_BASE}/api/account/shop/purchase`,
  locations: `${API_BASE}/api/account/delivery/locations`
};
const SESSION_KEY = 'wwz_dashboard_session';
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = {
  token: sessionStorage.getItem(SESSION_KEY) || '',
  authEnabled: false,
  user: null,
  settings: {},
  access: {},
  items: [],
  orders: [],
  locations: [],
  mode: 'manual',
  selectedItem: null,
  loading: false,
  purchasing: false
};

const elements = {
  apiState: $('[data-shop-api-state]'), apiLabel: $('[data-shop-api-label]'),
  authButton: $('[data-shop-auth-button]'), authLabel: $('[data-shop-auth-label]'),
  authAvatar: $('[data-shop-auth-avatar]'), signout: $('[data-shop-signout]'),
  loginDialog: $('[data-member-login-dialog]'), startLogin: $('[data-member-start-login]'),
  title: $('[data-member-shop-title]'), description: $('[data-member-shop-description]'),
  instructions: $('[data-member-shop-instructions]'), wallet: $('[data-member-shop-wallet]'),
  count: $('[data-member-shop-count]'), openOrders: $('[data-member-shop-open-orders]'),
  access: $('[data-member-shop-access]'), accessNote: $('[data-member-shop-access-note]'),
  notice: $('[data-member-shop-notice]'), noticeTitle: $('[data-member-shop-notice-title]'),
  noticeCopy: $('[data-member-shop-notice-copy]'), heroImage: $('[data-shop-hero-image]'),
  search: $('[data-member-shop-search]'), category: $('[data-member-shop-category]'),
  catalogue: $('[data-member-shop-catalogue]'), empty: $('[data-member-shop-empty]'),
  error: $('[data-member-shop-error]'), refresh: $('[data-member-shop-refresh]'),
  modeLabel: $('[data-member-shop-mode-label]'), manualCount: $('[data-member-manual-count]'),
  eventCount: $('[data-member-event-count]'), ordersRefresh: $('[data-member-orders-refresh]'),
  ordersGuest: $('[data-member-orders-guest]'), ordersUnlinked: $('[data-member-orders-unlinked]'),
  orderList: $('[data-member-order-list]'), ordersEmpty: $('[data-member-orders-empty]'),
  purchaseDialog: $('[data-member-purchase-dialog]'), purchaseForm: $('[data-member-purchase-form]'),
  purchaseTitle: $('[data-member-purchase-title]'), purchaseItem: $('[data-member-purchase-item]'),
  purchasePrice: $('[data-member-purchase-price]'), quantity: $('[data-member-purchase-quantity]'),
  quantityLabel: $('[data-member-quantity-label]'), quantityHelp: $('[data-member-quantity-help]'),
  eventFields: $('[data-member-event-fields]'), location: $('[data-member-delivery-location]'),
  coordinateInputs: $('[data-member-coordinate-inputs]'), x: $('[data-member-delivery-x]'),
  y: $('[data-member-delivery-y]'), z: $('[data-member-delivery-z]'), rotation: $('[data-member-delivery-rotation]'),
  coordinateMap: $('[data-member-coordinate-map]'), coordinateStage: $('[data-member-coordinate-stage]'), coordinateImage: $('[data-member-coordinate-image]'),
  mapZoomIn: $('[data-member-map-zoom-in]'), mapZoomOut: $('[data-member-map-zoom-out]'), mapReset: $('[data-member-map-reset]'), mapFullscreen: $('[data-member-map-fullscreen]'),
  marker: $('[data-member-map-marker]'), mapReadout: $('[data-member-map-readout]'),
  coordinateConfirm: $('[data-member-coordinate-confirm]'), note: $('[data-member-purchase-note]'),
  total: $('[data-member-purchase-total]'), purchaseMessage: $('[data-member-purchase-message]'),
  purchaseConfirm: $('[data-member-purchase-confirm]')
};
const checkoutMap = { x: 0, y: 0, zoom: 1, minZoom: 1, maxZoom: 5, dragging: false, moved: false, pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 };

const money = (value) => `$${new Intl.NumberFormat('en-AU').format(Math.max(0, Number(value) || 0))}`;
const dateText = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently' : new Intl.DateTimeFormat('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(date);
};
const titleCase = (value) => String(value || 'unknown').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const fetchJson = (url, options = {}, timeoutMs = 15_000) =>
  window.WWZHttp.json(url, options, timeoutMs);
const authHeaders = (extra = {}) => ({ Accept: 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...extra });
const setConnection = (kind, label) => {
  if (elements.apiState) elements.apiState.dataset.state = kind;
  if (elements.apiLabel) elements.apiLabel.textContent = label;
};
const showMessage = (message = '', type = 'error') => {
  if (!elements.purchaseMessage) return;
  elements.purchaseMessage.textContent = message;
  elements.purchaseMessage.hidden = !message;
  elements.purchaseMessage.dataset.type = type;
};
const avatar = (url, fallback = 'WZ') => {
  if (!elements.authAvatar) return;
  elements.authAvatar.replaceChildren();
  if (!url) { elements.authAvatar.textContent = fallback; return; }
  const image = document.createElement('img');
  image.src = url; image.alt = 'Discord avatar'; image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => { elements.authAvatar.replaceChildren(); elements.authAvatar.textContent = fallback; }, { once: true });
  elements.authAvatar.append(image);
};
const openLogin = () => elements.loginDialog?.showModal?.();
const startLogin = () => {
  if (!state.authEnabled) return;
  const returnTo = `${location.origin}${location.pathname}`;
  location.assign(`${URLS.authLogin}?return_to=${encodeURIComponent(returnTo)}`);
};

const setSignedOut = () => {
  state.user = null;
  elements.authLabel.textContent = 'Sign in with Discord';
  avatar('', 'DISCORD');
  elements.signout.hidden = true;
  elements.wallet.textContent = 'Sign in required';
  elements.openOrders.textContent = '—';
  elements.access.textContent = 'Guest';
  elements.accessNote.textContent = 'Discord verification required';
  elements.ordersGuest.hidden = false;
  elements.ordersUnlinked.hidden = true;
  elements.orderList.hidden = true;
  elements.ordersEmpty.hidden = true;
};
const setSignedIn = (payload) => {
  state.user = payload;
  const displayName = payload?.user?.display_name || payload?.user?.username || 'Survivor';
  elements.authLabel.textContent = displayName;
  avatar(payload?.user?.avatar_url, displayName.slice(0, 2).toUpperCase());
  elements.signout.hidden = false;
  elements.ordersGuest.hidden = true;
  elements.access.textContent = titleCase(payload?.membership?.access_level || 'member');
  elements.accessNote.textContent = 'Discord access verified';
};

const callback = () => {
  const params = new URLSearchParams(location.hash.slice(1));
  return { ticket: params.get('login_ticket'), error: params.get('auth_error') };
};
const clearCallback = () => history.replaceState({}, '', `${location.pathname}${location.search}`);
const completeLogin = async (ticket) => {
  const { response, payload } = await fetchJson(URLS.authComplete, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket })
  });
  if (!response.ok || !payload.session_token) throw new Error(payload.message || 'Discord sign-in could not be completed.');
  state.token = payload.session_token;
  sessionStorage.setItem(SESSION_KEY, state.token);
  clearCallback();
  setSignedIn(payload);
};
const loadIdentity = async () => {
  if (!state.token) { setSignedOut(); return false; }
  const { response, payload } = await fetchJson(URLS.authMe, { headers: authHeaders() });
  if (response.status === 401 || response.status === 403) {
    state.token = ''; sessionStorage.removeItem(SESSION_KEY); setSignedOut(); return false;
  }
  if (!response.ok) throw new Error('Your Discord session could not be verified.');
  setSignedIn(payload);
  return true;
};

const stockText = (item) => item.stock_quantity == null ? 'Unlimited stock' : `${Number(item.stock_quantity).toLocaleString()} in stock`;
const limitText = (item) => item.max_per_player == null
  ? 'No lifetime limit'
  : item.remaining_member_limit == null ? `${item.max_per_player} per player` : `${Math.max(0, item.remaining_member_limit)} remaining for you`;
const canPurchase = (item) => Boolean(
  state.user && state.settings.enabled && state.settings.website_enabled !== false && state.access.can_purchase && item.available
);
const populateCategories = () => {
  const selected = elements.category.value || 'all';
  elements.category.replaceChildren(new Option('All categories', 'all'));
  [...new Set(state.items.filter((item) => (item.delivery_type === 'event' ? 'event' : 'manual') === state.mode).map((item) => item.category))]
    .sort((a, b) => String(a).localeCompare(String(b)))
    .forEach((category) => elements.category.append(new Option(category, category)));
  elements.category.value = [...elements.category.options].some((option) => option.value === selected) ? selected : 'all';
};
const renderCatalogue = () => {
  const query = elements.search.value.trim().toLowerCase();
  const category = elements.category.value || 'all';
  const visible = state.items.filter((item) => {
    const mode = item.delivery_type === 'event' ? 'event' : 'manual';
    const haystack = `${item.name} ${item.category} ${item.sku} ${item.description} ${(item.types || []).join(' ')} ${(item.required_roles || []).map((role) => role.name).join(' ')}`.toLowerCase();
    return mode === state.mode && (category === 'all' || item.category === category) && (!query || haystack.includes(query));
  });
  elements.catalogue.replaceChildren();
  visible.forEach((item) => {
    const card = document.createElement('article'); card.className = `member-shop-card${item.available ? '' : ' unavailable'}`;
    const head = document.createElement('div'); head.className = 'member-shop-card-head';
    const copy = document.createElement('div');
    const kicker = document.createElement('p'); kicker.className = 'panel-kicker'; kicker.textContent = `${item.category} · ${item.sku}`;
    const title = document.createElement('h3'); title.textContent = item.name; copy.append(kicker, title);
    const price = document.createElement('strong'); price.className = 'member-shop-price';
    if (item.discount && Number(item.base_price) > Number(item.price)) {
      const old = document.createElement('del'); old.textContent = item.delivery_type === 'event' ? `${money(item.base_price)}/restart` : money(item.base_price);
      price.append(old, document.createTextNode(item.delivery_type === 'event' ? `${money(item.price)}/restart` : money(item.price)));
    } else price.textContent = item.delivery_type === 'event' ? `${money(item.price)}/restart` : money(item.price);
    head.append(copy, price);
    const description = document.createElement('p'); description.textContent = item.description;
    card.append(head);
    if (item.discount) {
      const discount = document.createElement('span'); discount.className = 'member-discount-badge';
      discount.textContent = `${item.discount.role_name} · ${item.discount.is_percentage ? `${item.discount.amount}% off` : `${money(item.discount.amount)} off`}`;
      card.append(discount);
    }
    card.append(description);
    const meta = document.createElement('div'); meta.className = 'member-shop-meta';
    const values = [
      item.delivery_type === 'event'
        ? `${Number(item.delivery?.minimum_restarts || 1).toLocaleString()}–${Number(item.delivery?.maximum_restarts || 30000).toLocaleString()} restarts`
        : `${Array.isArray(item.types) && item.types.length ? item.types.length : 0} DayZ type${Array.isArray(item.types) && item.types.length === 1 ? '' : 's'}`,
      stockText(item), `Max ${item.max_per_order}/order`, limitText(item)
    ];
    if (Array.isArray(item.required_roles) && item.required_roles.length) {
      values.push(`${item.require_all_roles ? 'All' : 'Any'} roles: ${item.required_roles.map((role) => role.name).join(', ')}`);
    }
    if (item.purchase_limit) values.push(`${item.purchase_limit.max_purchases} per ${item.purchase_limit.per_seconds}s${item.purchase_limit.shared_across_players ? ' shared' : ''}`);
    values.forEach((value) => { const chip = document.createElement('span'); chip.textContent = value; meta.append(chip); });
    const button = document.createElement('button'); button.type = 'button'; button.className = 'primary-action';
    if (!state.user) button.textContent = 'Sign in to buy';
    else if (!state.access.website_enabled) button.textContent = 'Member shop disabled';
    else if (!state.access.has_required_role) button.textContent = 'Required role missing';
    else if (!state.access.can_purchase && !state.access.linked) button.textContent = 'Link PSN to buy';
    else if (!state.settings.enabled) button.textContent = 'Purchases paused';
    else if (item.has_required_roles === false) button.textContent = 'Required item role missing';
    else button.textContent = item.available ? (item.delivery_type === 'event' ? 'Order event delivery' : 'Buy item') : 'Unavailable';
    button.disabled = Boolean(state.user && !canPurchase(item));
    button.addEventListener('click', () => state.user ? openPurchase(item) : openLogin());
    card.append(meta, button); elements.catalogue.append(card);
  });
  elements.empty.hidden = visible.length > 0;
};

const renderOrders = () => {
  elements.orderList.replaceChildren();
  if (!state.user) return;
  if (!state.access.linked) {
    elements.ordersUnlinked.hidden = false; elements.orderList.hidden = true; elements.ordersEmpty.hidden = true; return;
  }
  elements.ordersUnlinked.hidden = true; elements.orderList.hidden = false;
  state.orders.forEach((order) => {
    const card = document.createElement('article'); card.className = 'member-order-card';
    const head = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = order.delivery_type === 'event'
      ? `Order #${order.order_id} · ${Number(order.event_restarts || 1).toLocaleString()} restart(s) · ${order.item.name}`
      : `Order #${order.order_id} · ${order.quantity} × ${order.item.name}`;
    const status = document.createElement('span'); status.className = `shop-order-status ${order.status}`; status.textContent = titleCase(order.status);
    head.append(title, status);
    const meta = document.createElement('p'); meta.textContent = `${money(order.total_price)} · ${dateText(order.created_at)}`;
    card.append(head, meta);
    if (order.discount) { const line = document.createElement('small'); line.textContent = `Discount applied: ${order.discount.label}`; card.append(line); }
    if (order.delivery) { const line = document.createElement('small'); const point = order.delivery.location || {}; line.textContent = `Delivery: ${titleCase(order.delivery.status)} · X ${point.x}, Y ${point.y}, Z ${point.z}, A ${point.rotation}°`; card.append(line); }
    if (order.fulfilment_note) { const line = document.createElement('small'); line.textContent = `Order update: ${order.fulfilment_note}`; card.append(line); }
    elements.orderList.append(card);
  });
  elements.ordersEmpty.hidden = state.orders.length > 0;
};

const applyPayload = (payload, member = false) => {
  state.settings = payload.settings || {};
  state.access = member ? { ...(payload.access || {}), linked: Boolean(payload.linked) } : {
    website_enabled: state.settings.website_enabled !== false, has_required_role: true, can_purchase: false, linked: false
  };
  state.items = Array.isArray(payload.items) ? payload.items : [];
  state.orders = member && Array.isArray(payload.orders) ? payload.orders : [];
  elements.title.textContent = state.settings.title || 'Survivor Shop';
  elements.description.textContent = state.settings.description || 'Spend your verified community balance on approved DayZ goods and services.';
  elements.instructions.textContent = state.settings.purchase_instructions || 'Railway prepares paid orders automatically for the next server restart.';
  elements.count.textContent = String(state.items.length);
  elements.manualCount.textContent = String(state.items.filter((item) => item.delivery_type !== 'event').length);
  elements.eventCount.textContent = String(state.items.filter((item) => item.delivery_type === 'event').length);
  if (state.settings.dashboard_image_url) elements.heroImage.src = state.settings.dashboard_image_url;
  if (member) {
    elements.wallet.textContent = payload.linked ? money(payload.balance) : 'PSN link required';
    elements.openOrders.textContent = payload.linked ? String(state.orders.filter((order) => ['pending','processing'].includes(order.status)).length) : '—';
    if (!state.access.website_enabled) {
      elements.access.textContent = 'Unavailable'; elements.accessNote.textContent = 'Member shop disabled by Owner';
      elements.noticeTitle.textContent = 'Member shop is currently disabled'; elements.noticeCopy.textContent = 'The catalogue will return when an Owner enables the dedicated member shop.';
    } else if (!state.access.has_required_role) {
      const roleName = state.settings.required_role?.name || 'required role';
      elements.access.textContent = 'Role required'; elements.accessNote.textContent = roleName;
      elements.noticeTitle.textContent = `The ${roleName} role is required`;
      elements.noticeCopy.textContent = 'Your Discord roles are checked by Railway. Contact staff if you believe your access is incorrect.';
    } else if (!payload.linked) {
      elements.access.textContent = 'PSN link required'; elements.accessNote.textContent = 'Use /link in Discord';
    } else {
      elements.access.textContent = state.settings.enabled ? 'Ready to purchase' : 'Browse only';
      elements.accessNote.textContent = state.settings.enabled ? 'Identity and wallet verified' : 'Purchases are paused';
    }
  }
  populateCategories(); renderCatalogue(); renderOrders();
};

const loadLocations = async () => {
  if (!state.token) return;
  const { response, payload } = await fetchJson(URLS.locations, { headers: authHeaders() });
  if (response.ok) state.locations = Array.isArray(payload.locations) ? payload.locations : [];
};
const loadShop = async () => {
  if (state.loading) return;
  state.loading = true; elements.refresh.disabled = true; elements.ordersRefresh.disabled = true; elements.error.hidden = true;
  try {
    const member = Boolean(state.token && state.user);
    const { response, payload } = await fetchJson(member ? URLS.account : URLS.catalogue, { headers: authHeaders() });
    if (response.status === 401 || response.status === 403) {
      state.token = ''; sessionStorage.removeItem(SESSION_KEY); setSignedOut(); return loadShop();
    }
    if (!response.ok || payload.status !== 'ok') throw new Error(payload.message || 'The shop is unavailable.');
    applyPayload(payload, member);
    if (member) await loadLocations();
    setConnection('online', 'Railway connected');
  } catch (error) {
    setConnection('unavailable', 'Shop unavailable'); elements.error.hidden = false;
  } finally {
    state.loading = false; elements.refresh.disabled = false; elements.ordersRefresh.disabled = false;
  }
};

const populateLocations = () => {
  elements.location.replaceChildren(new Option('Enter new coordinates', ''));
  state.locations.forEach((location) => elements.location.append(new Option(
    `${location.name}${location.is_default ? ' · Default' : ''} — X ${location.x}, Y ${location.y}, Z ${location.z}`,
    String(location.location_id)
  )));
  const defaultLocation = state.locations.find((location) => location.is_default);
  if (defaultLocation) elements.location.value = String(defaultLocation.location_id);
  syncLocationMode();
};
const syncLocationMode = () => {
  const saved = Boolean(elements.location.value);
  elements.coordinateInputs.hidden = saved;
  [elements.x,elements.y,elements.z,elements.rotation].forEach((input) => { input.required = !saved; });
  if (saved) {
    const location = state.locations.find((entry) => String(entry.location_id) === elements.location.value);
    if (location) { elements.x.value = location.x; elements.y.value = location.y; elements.z.value = location.z; elements.rotation.value = location.rotation; updateMarker(); }
  }
};
const clampMap = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const constrainCheckoutMap = () => {
  const frame = elements.coordinateMap.getBoundingClientRect();
  const size = frame.width * checkoutMap.zoom;
  checkoutMap.x = clampMap(checkoutMap.x, Math.min(0, frame.width - size), 0);
  checkoutMap.y = clampMap(checkoutMap.y, Math.min(0, frame.height - size), 0);
};
const renderCheckoutMap = () => {
  constrainCheckoutMap();
  elements.coordinateStage.style.transform = `translate3d(${checkoutMap.x}px,${checkoutMap.y}px,0) scale(${checkoutMap.zoom})`;
  elements.marker.style.setProperty('--checkout-marker-scale', String(1 / checkoutMap.zoom));
};
const resetCheckoutMap = () => {
  checkoutMap.x = 0; checkoutMap.y = 0; checkoutMap.zoom = 1;
  renderCheckoutMap();
};
const zoomCheckoutMap = (factor, clientX = null, clientY = null) => {
  const frame = elements.coordinateMap.getBoundingClientRect();
  const px = clientX == null ? frame.width / 2 : clientX - frame.left;
  const py = clientY == null ? frame.height / 2 : clientY - frame.top;
  const oldZoom = checkoutMap.zoom;
  const nextZoom = clampMap(oldZoom * factor, checkoutMap.minZoom, checkoutMap.maxZoom);
  const worldX = (px - checkoutMap.x) / oldZoom;
  const worldY = (py - checkoutMap.y) / oldZoom;
  checkoutMap.zoom = nextZoom;
  checkoutMap.x = px - worldX * nextZoom;
  checkoutMap.y = py - worldY * nextZoom;
  renderCheckoutMap();
};
const updateMarker = () => {
  const x = Number(elements.x.value), z = Number(elements.z.value);
  const valid = Number.isFinite(x) && Number.isFinite(z) && x >= 0 && x <= 15360 && z >= 0 && z <= 15360;
  elements.marker.hidden = !valid;
  elements.mapReadout.textContent = valid ? `X ${x.toFixed(3)} · Z ${z.toFixed(3)}` : 'No coordinates selected';
  if (valid) { elements.marker.style.left = `${x / 15360 * 100}%`; elements.marker.style.top = `${(1 - z / 15360) * 100}%`; }
};
const setMapCoordinates = (event) => {
  if (elements.location.value || checkoutMap.moved) return;
  const rect = elements.coordinateMap.getBoundingClientRect();
  const mapX = (event.clientX - rect.left - checkoutMap.x) / checkoutMap.zoom;
  const mapY = (event.clientY - rect.top - checkoutMap.y) / checkoutMap.zoom;
  if (mapX < 0 || mapY < 0 || mapX > rect.width || mapY > rect.height) return;
  const x = clampMap(mapX / rect.width * 15360, 0, 15360);
  const z = clampMap((1 - mapY / rect.height) * 15360, 0, 15360);
  elements.x.value = x.toFixed(3); elements.z.value = z.toFixed(3);
  if (elements.y.value === '') elements.y.value = '0';
  updateMarker();
};
const beginMapDrag = (event) => {
  if (elements.location.value || event.button > 0) return;
  checkoutMap.dragging = true; checkoutMap.moved = false; checkoutMap.pointerId = event.pointerId;
  checkoutMap.startX = event.clientX; checkoutMap.startY = event.clientY;
  checkoutMap.originX = checkoutMap.x; checkoutMap.originY = checkoutMap.y;
  elements.coordinateMap.setPointerCapture?.(event.pointerId);
};
const moveMapDrag = (event) => {
  if (!checkoutMap.dragging || event.pointerId !== checkoutMap.pointerId) return;
  const dx = event.clientX - checkoutMap.startX, dy = event.clientY - checkoutMap.startY;
  if (Math.abs(dx) + Math.abs(dy) > 5) checkoutMap.moved = true;
  checkoutMap.x = checkoutMap.originX + dx; checkoutMap.y = checkoutMap.originY + dy;
  renderCheckoutMap();
};
const endMapDrag = (event) => {
  if (!checkoutMap.dragging || event.pointerId !== checkoutMap.pointerId) return;
  checkoutMap.dragging = false;
  elements.coordinateMap.releasePointerCapture?.(event.pointerId);
  window.setTimeout(() => { checkoutMap.moved = false; }, 0);
};
const updateTotal = () => {
  const quantity = Math.max(1, Number(elements.quantity.value || 1));
  elements.total.textContent = money(quantity * Number(state.selectedItem?.price || 0));
};
const openPurchase = (item) => {
  if (!canPurchase(item)) return;
  state.selectedItem = item; elements.purchaseForm.reset(); elements.y.value = '0'; elements.rotation.value = '0';
  const eventItem = item.delivery_type === 'event';
  const minimum = eventItem ? Math.max(1, Number(item.delivery?.minimum_restarts || state.settings.event_restart_min || 1)) : 1;
  const maximum = eventItem
    ? Math.min(30000, Number(item.delivery?.maximum_restarts || state.settings.event_restart_max || 30000))
    : Math.max(1, Math.min(Number(item.max_per_order || 1), item.stock_quantity == null ? 100 : Number(item.stock_quantity), item.remaining_member_limit == null ? 100 : Number(item.remaining_member_limit)));
  elements.quantity.value = String(minimum); elements.quantity.min = String(minimum); elements.quantity.max = String(maximum);
  elements.quantityLabel.textContent = eventItem ? 'Number Of Restarts' : 'Quantity';
  elements.quantityHelp.textContent = eventItem ? `Allowed ${minimum.toLocaleString()}–${maximum.toLocaleString()} restarts.` : `Maximum ${maximum.toLocaleString()} per order.`;
  elements.eventFields.hidden = false;
  elements.purchaseTitle.textContent = `Buy ${item.name}?`; elements.purchaseItem.textContent = `${item.name} · ${item.sku}`;
  elements.purchasePrice.textContent = `${money(item.price)}${eventItem ? ' per restart' : ' each'} · ${stockText(item)}`;
  populateLocations(); resetCheckoutMap(); updateMarker(); updateTotal(); showMessage(''); elements.purchaseDialog.showModal();
};
const submitPurchase = async (event) => {
  event.preventDefault();
  if (!state.token || !state.selectedItem || state.purchasing) return;
  state.purchasing = true; elements.purchaseConfirm.disabled = true; showMessage('Railway is validating your wallet, stock and access.', 'info');
  try {
    const eventItem = state.selectedItem.delivery_type === 'event';
    let delivery = null;
    {
      if (!elements.coordinateConfirm.checked) throw new Error('Confirm that you checked the delivery coordinates.');
      delivery = elements.location.value ? { location_id: Number(elements.location.value) } : {
        x: elements.x.value, y: elements.y.value, z: elements.z.value, rotation: elements.rotation.value || 0
      };
      if (!elements.location.value && (!delivery.x || delivery.y === '' || !delivery.z)) throw new Error('Enter complete X, Y and Z coordinates.');
    }
    const quantity = Math.max(1, Number(elements.quantity.value || 1));
    const body = {
      item_id: Number(state.selectedItem.item_id), quantity: eventItem ? 1 : quantity,
      event_restarts: eventItem ? quantity : 1, buyer_note: elements.note.value.trim(),
      purchase_key: `${Date.now().toString(36)}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}-shop`, delivery
    };
    const { response, payload } = await fetchJson(URLS.purchase, {
      method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(body)
    }, 60000);
    if (!response.ok) throw new Error(payload.message || 'The purchase could not be completed.');
    showMessage(payload.message || 'Order placed successfully.', 'success');
    await loadShop(); window.setTimeout(() => elements.purchaseDialog.close(), 900);
  } catch (error) { showMessage(error.message || 'The purchase could not be completed.'); }
  finally { state.purchasing = false; elements.purchaseConfirm.disabled = false; }
};

$$('[data-member-shop-mode]').forEach((button) => button.addEventListener('click', () => {
  state.mode = button.dataset.memberShopMode === 'event' ? 'event' : 'manual';
  $$('[data-member-shop-mode]').forEach((entry) => { const active = entry === button; entry.classList.toggle('active', active); entry.setAttribute('aria-selected', String(active)); });
  elements.modeLabel.textContent = state.mode === 'event' ? 'Event items' : 'Items'; elements.search.value = ''; populateCategories(); renderCatalogue();
}));
elements.search.addEventListener('input', renderCatalogue);
elements.category.addEventListener('change', renderCatalogue);
elements.refresh.addEventListener('click', loadShop);
elements.ordersRefresh.addEventListener('click', loadShop);
elements.authButton.addEventListener('click', () => state.user ? location.assign('dashboard.html#players/account') : openLogin());
$$('[data-shop-login]').forEach((button) => button.addEventListener('click', openLogin));
elements.startLogin.addEventListener('click', startLogin);
elements.signout.addEventListener('click', async () => {
  const token = state.token; state.token = ''; sessionStorage.removeItem(SESSION_KEY); setSignedOut(); await loadShop();
  if (token) fetchJson(URLS.authLogout, { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }).catch(() => {});
});
elements.quantity.addEventListener('input', updateTotal);
elements.location.addEventListener('change', syncLocationMode);
[elements.x,elements.z].forEach((input) => input.addEventListener('input', updateMarker));
elements.coordinateMap.addEventListener('click', setMapCoordinates);
elements.coordinateMap.addEventListener('wheel', (event) => { event.preventDefault(); zoomCheckoutMap(event.deltaY < 0 ? 1.25 : 0.8, event.clientX, event.clientY); }, { passive: false });
elements.coordinateMap.addEventListener('pointerdown', beginMapDrag);
elements.coordinateMap.addEventListener('pointermove', moveMapDrag);
elements.coordinateMap.addEventListener('pointerup', endMapDrag);
elements.coordinateMap.addEventListener('pointercancel', endMapDrag);
elements.mapZoomIn.addEventListener('click', () => zoomCheckoutMap(1.4));
elements.mapZoomOut.addEventListener('click', () => zoomCheckoutMap(1 / 1.4));
elements.mapReset.addEventListener('click', resetCheckoutMap);
elements.mapFullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement === elements.coordinateMap) await document.exitFullscreen();
    else await elements.coordinateMap.requestFullscreen();
    window.setTimeout(renderCheckoutMap, 80);
  } catch {}
});
window.addEventListener('resize', renderCheckoutMap);
$$('[data-member-purchase-cancel]').forEach((button) => button.addEventListener('click', () => { if (!state.purchasing) elements.purchaseDialog.close(); }));
elements.purchaseForm.addEventListener('submit', submitPurchase);

const initialise = async () => {
  try {
    const { response, payload } = await fetchJson(URLS.authConfig, { headers: { Accept: 'application/json' } });
    state.authEnabled = Boolean(response.ok && payload?.discord_auth?.enabled);
  } catch { state.authEnabled = false; }
  elements.startLogin.disabled = !state.authEnabled;
  elements.startLogin.textContent = state.authEnabled ? 'Continue securely with Discord' : 'Discord sign-in is unavailable';
  const fragment = callback();
  if (fragment.error) { clearCallback(); setSignedOut(); }
  else if (fragment.ticket) {
    try { await completeLogin(fragment.ticket); } catch { clearCallback(); state.token = ''; sessionStorage.removeItem(SESSION_KEY); setSignedOut(); }
  } else {
    try { await loadIdentity(); } catch { setSignedOut(); }
  }
  await loadShop();
};
initialise();
