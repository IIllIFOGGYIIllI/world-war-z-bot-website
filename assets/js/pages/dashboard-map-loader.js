(() => {
  'use strict';

  const frame = document.querySelector('[data-map-frame]');
  if (!frame) return;

  const PUBLIC_MARKERS_URL = `${DASHBOARD_API_BASE}/api/map/markers`;
  const ADMIN_MARKER_ACTION_URL = `${DASHBOARD_API_BASE}/api/admin/map/markers/action`;
  const PLACE_NAMES_URL = 'assets/data/chernarus/place-names.json?v=1.22.31';
  const STORAGE_KEY = 'wwz.chernarus.customLocations.v1';
  const MAX_CUSTOM_LOCATIONS = 250;
  const COLOURS = Object.freeze({
    amber: '#ffbd36',
    red: '#ef4b3e',
    blue: '#4ca7ff',
    green: '#5ac77b',
    white: '#f3eee7'
  });

  let mapInstance = null;
  let loadPromise = null;
  let publicPois = [];
  let customPois = [];
  let selectedCategory = 'All';
  let selectedScope = 'all';
  let selectedLocation = null;
  let poiLayer = null;
  let customLayer = null;
  let placeNameLayer = null;
  let placeNames = [];
  let placeNamesVisible = true;
  let editorScope = 'custom';
  let editingLocation = null;
  const poiMarkers = new Map();
  const customMarkers = new Map();

  const search = document.querySelector('[data-map-search]');
  const filters = document.querySelector('[data-map-filters]');
  const locationList = document.querySelector('[data-map-location-list]');
  const emptyState = document.querySelector('[data-map-empty]');
  const resultCount = document.querySelector('[data-map-result-count]');
  const customPanel = document.querySelector('[data-map-custom-panel]');
  const customForm = document.querySelector('[data-map-custom-form]');
  const customId = document.querySelector('[data-map-custom-id]');
  const customName = document.querySelector('[data-map-custom-name]');
  const customCategory = document.querySelector('[data-map-custom-category]');
  const customColour = document.querySelector('[data-map-custom-colour]');
  const customNotes = document.querySelector('[data-map-custom-notes]');
  const customX = document.querySelector('[data-map-custom-x]');
  const customZ = document.querySelector('[data-map-custom-z]');
  const customTitle = document.querySelector('[data-map-custom-title]');
  const customCount = document.querySelector('[data-map-custom-count]');
  const scopeLabel = document.querySelector('[data-map-location-scope-label]');
  const editorKicker = document.querySelector('[data-map-editor-kicker]');
  const editorNote = document.querySelector('[data-map-editor-note]');
  const editorSubmit = document.querySelector('[data-map-save-custom]');

  const formatCoordinate = (value) => window.WWZChernarusMap?.formatCoordinate(value, 1) ?? Number(value).toFixed(1);

  const validText = (value, maximumLength, fallback = null) => {
    const text = String(value || '').trim();
    if (!text) return fallback;
    return text.slice(0, maximumLength);
  };

  const clampCoordinate = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 && number <= 15360 ? number : null;
  };

  const makeId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const hasAdminAccess = () => {
    try {
      return ['staff', 'owner'].includes(dashboardAccessLevel);
    } catch {
      return false;
    }
  };

  const currentSessionToken = () => {
    try {
      return storageGet(AUTH_SESSION_KEY) || '';
    } catch {
      return '';
    }
  };

  const handleMarkerAuthorizationFailure = (response, payload) => {
    if (response.status === 401) {
      try {
        storageRemove(AUTH_SESSION_KEY);
        applySignedOutState();
      } catch {
        // The core authentication module will reconcile state on the next check.
      }
      throw new Error('Your dashboard session expired. Sign in with Discord again, then retry the public marker action.');
    }
    if (response.status === 403) {
      throw new Error(payload?.message || 'Your current Discord account does not have Admin access to public markers.');
    }
  };

  const validatePoi = (rawPoi) => {
    const markerId = Number(rawPoi?.marker_id);
    const id = validText(rawPoi?.id, 100) || (Number.isInteger(markerId) && markerId > 0 ? `public-${markerId}` : null);
    const name = validText(rawPoi?.name, 80);
    const category = validText(rawPoi?.category, 40, 'Landmark');
    const description = validText(rawPoi?.description, 240, 'Public server map marker.');
    const colour = Object.hasOwn(COLOURS, rawPoi?.colour) ? rawPoi.colour : 'red';
    const x = clampCoordinate(rawPoi?.x);
    const z = clampCoordinate(rawPoi?.z);
    if (!id || !name || x === null || z === null) return null;
    return {
      id,
      markerId: Number.isInteger(markerId) && markerId > 0 ? markerId : null,
      name,
      category,
      description,
      colour,
      x,
      z,
      visibility: 'public',
      scope: 'public'
    };
  };

  const validateCustom = (rawPoi) => {
    const id = validText(rawPoi?.id, 100) || makeId();
    const name = validText(rawPoi?.name, 80);
    const category = validText(rawPoi?.category, 40, 'Custom');
    const description = validText(rawPoi?.description ?? rawPoi?.notes, 240, 'Personal custom map location.');
    const colour = Object.hasOwn(COLOURS, rawPoi?.colour) ? rawPoi.colour : 'amber';
    const x = clampCoordinate(rawPoi?.x);
    const z = clampCoordinate(rawPoi?.z);
    if (!name || x === null || z === null) return null;
    return { id, name, category, description, colour, x, z, visibility: 'private-browser', scope: 'custom' };
  };

  const validatePlaceName = (rawPlace) => {
    const id = validText(rawPlace?.id, 100);
    const name = validText(rawPlace?.name, 100);
    const nativeName = validText(rawPlace?.nativeName, 140, name);
    const type = validText(rawPlace?.type, 30, 'village')?.toLowerCase();
    const sourceClass = validText(rawPlace?.sourceClass, 120, '');
    const sourceType = validText(rawPlace?.sourceType, 30, type);
    const x = clampCoordinate(rawPlace?.x);
    const z = clampCoordinate(rawPlace?.z);
    const rawMinZoom = Number(rawPlace?.minZoom);
    const minZoom = Number.isFinite(rawMinZoom) ? Math.max(0, Math.min(14, rawMinZoom)) : 4;
    if (!id || !name || !nativeName || !['capital', 'city', 'village'].includes(type) || x === null || z === null) return null;
    return { id, name, nativeName, type, sourceClass, sourceType, x, z, minZoom };
  };

  const loadCustomPois = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      customPois = (Array.isArray(parsed) ? parsed : []).map(validateCustom).filter(Boolean).slice(0, MAX_CUSTOM_LOCATIONS);
    } catch {
      customPois = [];
    }
  };

  const persistCustomPois = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPois));
    } catch (error) {
      console.warn('Could not save custom map locations.', error);
    }
    updateCustomCount();
  };

  const currentQuery = () => String(search?.value || '').trim().toLowerCase();

  const availableLocations = () => {
    if (selectedScope === 'public') return publicPois;
    if (selectedScope === 'custom') return customPois;
    return [...publicPois, ...customPois];
  };

  const filteredLocations = () => {
    const query = currentQuery();
    return availableLocations().filter((poi) => {
      const categoryMatches = selectedCategory === 'All' || poi.category === selectedCategory;
      const haystack = `${poi.name} ${poi.category} ${poi.description} ${poi.x} ${poi.z} ${poi.scope}`.toLowerCase();
      return categoryMatches && (!query || haystack.includes(query));
    });
  };

  const updateCustomCount = () => {
    if (customCount) customCount.textContent = String(customPois.length);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const box = document.createElement('textarea');
        box.value = text;
        box.setAttribute('readonly', '');
        box.style.position = 'fixed';
        box.style.opacity = '0';
        document.body.append(box);
        box.select();
        const ok = document.execCommand('copy');
        box.remove();
        return ok;
      } catch {
        return false;
      }
    }
  };

  const setButtonFeedback = (button, successText = 'Copied') => {
    if (!button) return;
    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    button.textContent = successText;
    window.setTimeout(() => { button.textContent = original; }, 1200);
  };

  const updateDetails = (poi) => {
    const empty = document.querySelector('[data-map-details-empty]');
    const content = document.querySelector('[data-map-details-content]');
    const editButton = document.querySelector('[data-map-edit-custom]');
    const deleteButton = document.querySelector('[data-map-delete-custom]');
    const saveSelectedButton = document.querySelector('[data-map-save-selected]');
    if (!poi) {
      empty?.removeAttribute('hidden');
      content?.setAttribute('hidden', '');
      return;
    }

    empty?.setAttribute('hidden', '');
    content?.removeAttribute('hidden');
    const isCustom = poi.scope === 'custom';
    const isPublic = poi.scope === 'public';
    const isSelection = poi.scope === 'selection';
    const canManagePublic = isPublic && hasAdminAccess() && Number.isInteger(poi.markerId);
    const scope = document.querySelector('[data-map-detail-scope]');
    if (scope) {
      scope.textContent = isCustom ? 'Private' : isSelection ? 'Unsaved' : 'Public';
      scope.dataset.scope = poi.scope;
    }
    const bindings = [
      ['[data-map-detail-category]', poi.category],
      ['[data-map-detail-name]', poi.name],
      ['[data-map-detail-description]', poi.description],
      ['[data-map-detail-x]', formatCoordinate(poi.x)],
      ['[data-map-detail-z]', formatCoordinate(poi.z)]
    ];
    bindings.forEach(([selector, value]) => {
      const node = document.querySelector(selector);
      if (node) node.textContent = value;
    });
    if (editButton) editButton.hidden = !(isCustom || canManagePublic);
    if (deleteButton) deleteButton.hidden = !(isCustom || canManagePublic);
    if (saveSelectedButton) saveSelectedButton.hidden = !isSelection;
  };

  const applyMarkerSelection = () => {
    poiMarkers.forEach((marker, id) => marker?._wwzSetSelected?.(selectedLocation?.id === id));
    customMarkers.forEach((marker, id) => marker?._wwzSetSelected?.(selectedLocation?.id === id));
  };


  const selectLocation = (poi, { focus = true, selectOnMap = false } = {}) => {
    selectedLocation = poi || null;
    updateDetails(selectedLocation);
    applyMarkerSelection();
    if (poi && focus) mapInstance?.focus(poi.x, poi.z, Math.max(6, mapInstance.map.getZoom()));
    if (poi && selectOnMap) mapInstance?.setSelection(poi.x, poi.z, { notify: false, marker: false });
  };

  const selectedMapPoint = () => mapInstance?.getSelection?.() || null;

  const openCustomEditor = (poi = null, scope = 'custom') => {
    if (!customPanel) return;
    const requestedScope = scope === 'public' ? 'public' : 'custom';
    if (requestedScope === 'public' && !hasAdminAccess()) return;
    editorScope = requestedScope;
    editingLocation = poi;
    const selection = selectedMapPoint();
    const base = poi || (selectedLocation?.scope === 'selection' ? selectedLocation : null);
    customId.value = poi?.id || '';
    customName.value = poi?.name || '';
    customCategory.value = poi?.category === 'Custom' ? '' : (poi?.category || '');
    customColour.value = poi?.colour || (requestedScope === 'public' ? 'red' : 'amber');
    const defaultDescription = requestedScope === 'public' ? 'Public server map marker.' : 'Personal custom map location.';
    customNotes.value = poi?.description === defaultDescription ? '' : (poi?.description || '');
    const initialX = base?.x ?? selection?.x;
    const initialZ = base?.z ?? selection?.z;
    customX.value = Number.isFinite(Number(initialX)) ? formatCoordinate(initialX) : '';
    customZ.value = Number.isFinite(Number(initialZ)) ? formatCoordinate(initialZ) : '';
    if (customTitle) customTitle.textContent = poi
      ? (requestedScope === 'public' ? 'Edit Public Marker' : 'Edit Private Pin')
      : (requestedScope === 'public' ? 'Create Public Marker' : 'Save Private Pin');
    if (editorKicker) editorKicker.textContent = requestedScope === 'public' ? 'Admin public marker' : 'Personal map pin';
    if (editorNote) editorNote.textContent = requestedScope === 'public'
      ? 'Published to every map user and stored in the Railway database. Only verified Admins can create, edit or delete public markers.'
      : 'Saved only in this browser. Private pins are never published to other players or sent to Railway.';
    if (editorSubmit) editorSubmit.textContent = requestedScope === 'public' ? (poi ? 'Update Public Marker' : 'Publish Marker') : 'Save Private Pin';
    customPanel.dataset.editorScope = requestedScope;
    customPanel.hidden = false;
    customName.focus();
  };

  const closeCustomEditor = () => {
    if (customPanel) customPanel.hidden = true;
    customForm?.reset();
    if (customId) customId.value = '';
    editingLocation = null;
    editorScope = 'custom';
    delete customPanel?.dataset.editorScope;
  };

  const renderFilters = () => {
    if (!filters) return;
    const categories = ['All', ...new Set(availableLocations().map((poi) => poi.category).sort((a, b) => a.localeCompare(b)))];
    if (!categories.includes(selectedCategory)) selectedCategory = 'All';
    filters.replaceChildren();
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = selectedCategory === category ? 'active' : '';
      button.textContent = category;
      button.addEventListener('click', () => {
        selectedCategory = category;
        renderFilters();
        renderResults();
      });
      filters.append(button);
    });
  };

  const makeLocationButton = (poi) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `map-location-button${selectedLocation?.id === poi.id ? ' selected' : ''}`;
    button.dataset.scope = poi.scope;

    const symbol = document.createElement('span');
    symbol.className = 'map-location-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = poi.scope === 'custom' ? '◆' : '⌖';
    symbol.style.setProperty('--pin-colour', COLOURS[poi.colour] || (poi.scope === 'custom' ? COLOURS.amber : COLOURS.red));

    const copy = document.createElement('span');
    const heading = document.createElement('span');
    heading.className = 'map-location-heading';
    const name = document.createElement('strong');
    name.textContent = poi.name;
    const badge = document.createElement('em');
    badge.textContent = poi.scope === 'custom' ? 'PRIVATE' : poi.category;
    heading.append(name, badge);
    const meta = document.createElement('small');
    meta.textContent = `X ${formatCoordinate(poi.x)} · Z ${formatCoordinate(poi.z)}`;
    const note = document.createElement('small');
    note.className = 'map-location-note';
    note.textContent = poi.scope === 'custom' ? `${poi.category} · ${poi.description}` : poi.description;
    copy.append(heading, meta, note);

    const arrow = document.createElement('span');
    arrow.className = 'map-location-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    button.append(symbol, copy, arrow);
    button.addEventListener('click', () => {
      selectLocation(poi, { selectOnMap: true });
      renderResults();
    });
    return button;
  };

  const renderMarkers = (visible) => {
    if (!poiLayer || !customLayer || !mapInstance) return;
    poiLayer.clearLayers();
    customLayer.clearLayers();
    poiMarkers.clear();
    customMarkers.clear();
    visible.forEach((poi) => {
      const custom = poi.scope === 'custom';
      const marker = mapInstance.addPoi(poi, {
        layer: custom ? customLayer : poiLayer,
        custom,
        colour: COLOURS[poi.colour] || (custom ? COLOURS.amber : COLOURS.red),
        selected: selectedLocation?.id === poi.id,
        showLabel: true,
        onClick: () => {
          selectLocation(poi, { focus: false, selectOnMap: true });
          renderResults();
        }
      });
      if (!marker) return;
      (custom ? customMarkers : poiMarkers).set(poi.id, marker);
    });
  };

  const renderPlaceNames = () => {
    if (!placeNameLayer || !mapInstance) return;
    placeNameLayer.clearLayers();
    const toggle = document.querySelector('[data-map-name-toggle]');
    toggle?.classList.toggle('active', placeNamesVisible);
    toggle?.setAttribute('aria-pressed', String(placeNamesVisible));
    if (!placeNamesVisible) return;

    const map = mapInstance.map;
    const zoom = map.getZoom();
    const visibleMarkerNames = new Set();
    filteredLocations().forEach((poi) => visibleMarkerNames.add(poi.name.toLowerCase()));

    const priority = { capital: 0, city: 1, village: 2 };
    const sizeProfile = {
      capital: { native: 13, latin: 9.5, height: 28 },
      city: { native: 11, latin: 8.5, height: 25 },
      village: { native: 9, latin: 7.5, height: 22 }
    };
    const occupied = [];

    const overlaps = (box, existing, padding) => !(
      box.right + padding < existing.left ||
      box.left - padding > existing.right ||
      box.bottom + padding < existing.top ||
      box.top - padding > existing.bottom
    );

    placeNames
      .filter((place) => zoom >= place.minZoom)
      .sort((left, right) => (priority[left.type] ?? 9) - (priority[right.type] ?? 9) || left.name.localeCompare(right.name))
      .forEach((place) => {
        const latinKey = place.name.toLowerCase();
        const nativeKey = place.nativeName.toLowerCase();
        if (visibleMarkerNames.has(latinKey) || visibleMarkerNames.has(nativeKey)) return;

        const latlng = window.WWZChernarusMap.worldToLeaflet([place.x, place.z]);
        if (!latlng) return;

        const profile = sizeProfile[place.type] || sizeProfile.village;
        const point = map.latLngToContainerPoint(latlng);
        const width = Math.max(
          place.nativeName.length * profile.native * 0.62,
          place.name.length * profile.latin * 0.58
        ) + 14;
        const box = {
          left: point.x - (width / 2),
          right: point.x + (width / 2),
          top: point.y - (profile.height / 2),
          bottom: point.y + (profile.height / 2)
        };
        const collisionPadding = zoom <= 3 ? 10 : zoom <= 5 ? 6 : 2;
        if (occupied.some((existing) => overlaps(box, existing, collisionPadding))) return;
        occupied.push(box);

        const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[character]));
        const safeNative = escapeHtml(place.nativeName);
        const safeLatin = escapeHtml(place.name);
        const safeType = String(place.type).replace(/[^a-z0-9_-]/gi, '').toLowerCase();
        const icon = window.L.divIcon({
          className: 'wwz-map-place-name-div-icon',
          html: `<span class=\"wwz-map-place-name wwz-map-place-name--${safeType}\"><span class=\"wwz-map-place-name-native\">${safeNative}</span><span class=\"wwz-map-place-name-latin\">${safeLatin}</span></span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
        window.L.marker(latlng, {
          icon,
          pane: 'wwzPlaceNames',
          interactive: false,
          keyboard: false,
          zIndexOffset: 100 - ((priority[place.type] ?? 9) * 10)
        }).addTo(placeNameLayer);
      });
  };


  const renderResults = () => {
    const visible = filteredLocations();
    if (resultCount) resultCount.textContent = String(visible.length);
    if (emptyState) emptyState.hidden = visible.length !== 0;
    updateCustomCount();
    if (scopeLabel) scopeLabel.textContent = selectedScope === 'public' ? 'Public only' : selectedScope === 'custom' ? 'My pins' : 'Public + Mine';

    if (locationList) {
      locationList.replaceChildren();
      visible.forEach((poi) => locationList.append(makeLocationButton(poi)));
    }

    renderMarkers(visible);
    renderPlaceNames();
    if (selectedLocation?.id && !visible.some((poi) => poi.id === selectedLocation.id) && selectedLocation.scope !== 'selection') {
      selectLocation(null, { focus: false });
    }
  };

  const setScope = (scope) => {
    selectedScope = ['all', 'public', 'custom'].includes(scope) ? scope : 'all';
    document.querySelectorAll('[data-map-scope]').forEach((button) => {
      const active = button.dataset.mapScope === selectedScope;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderFilters();
    renderResults();
  };

  const exportCustomLocations = () => {
    const payload = {
      type: 'wwz-chernarus-custom-locations',
      version: 1,
      exportedAt: new Date().toISOString(),
      locations: customPois
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'wwz-chernarus-custom-locations.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const importCustomLocations = async (file) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const source = Array.isArray(parsed) ? parsed : parsed?.locations;
      if (!Array.isArray(source)) throw new Error('No locations array found.');
      const incoming = source.map(validateCustom).filter(Boolean);
      if (!incoming.length) throw new Error('No valid Chernarus locations found.');
      const merged = new Map(customPois.map((poi) => [poi.id, poi]));
      incoming.forEach((poi) => merged.set(poi.id, poi));
      customPois = [...merged.values()].slice(0, MAX_CUSTOM_LOCATIONS);
      persistCustomPois();
      setScope('custom');
    } catch (error) {
      window.alert(`Custom locations could not be imported: ${error.message || 'Invalid file.'}`);
    }
  };

  const loadPublicMarkers = async () => {
    try {
      const response = await authFetch(PUBLIC_MARKERS_URL, {
        headers: { Accept: 'application/json' }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || 'Public map markers could not be loaded.');
      publicPois = (Array.isArray(payload?.markers) ? payload.markers : []).map(validatePoi).filter(Boolean);
      return true;
    } catch (error) {
      console.warn('Public map markers unavailable.', error);
      publicPois = [];
      return false;
    }
  };

  const submitPublicMarker = async (poi) => {
    const sessionToken = currentSessionToken();
    if (!hasAdminAccess() || !sessionToken) throw new Error('Administrator sign-in is required.');
    const editingPublic = editingLocation?.scope === 'public' && Number.isInteger(editingLocation.markerId);
    const action = editingPublic ? 'update' : 'create';
    const response = await authFetch(ADMIN_MARKER_ACTION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        action,
        marker_id: editingPublic ? editingLocation.markerId : undefined,
        name: poi.name,
        category: poi.category,
        description: poi.description,
        colour: poi.colour,
        x: poi.x,
        z: poi.z
      })
    });
    const payload = await response.json().catch(() => ({}));
    handleMarkerAuthorizationFailure(response, payload);
    if (!response.ok) throw new Error(payload?.message || 'The public marker could not be saved.');
    await loadPublicMarkers();
    const saved = validatePoi(payload?.marker) || publicPois.find((entry) => entry.markerId === editingLocation?.markerId) || null;
    return saved;
  };

  const deletePublicMarker = async (poi) => {
    const sessionToken = currentSessionToken();
    if (!hasAdminAccess() || !sessionToken || !Number.isInteger(poi?.markerId)) throw new Error('Administrator sign-in is required.');
    const response = await authFetch(ADMIN_MARKER_ACTION_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ action: 'delete', marker_id: poi.markerId })
    });
    const payload = await response.json().catch(() => ({}));
    handleMarkerAuthorizationFailure(response, payload);
    if (!response.ok) throw new Error(payload?.message || 'The public marker could not be deleted.');
    await loadPublicMarkers();
  };

  const initialise = async () => {
    if (mapInstance) {
      mapInstance.invalidateSize();
      return mapInstance;
    }
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      if (!window.WWZChernarusMap || !window.L) throw new Error('The production Chernarus map runtime is unavailable.');

      const [, placeResponse] = await Promise.all([
        loadPublicMarkers(),
        fetch(PLACE_NAMES_URL, { headers: { Accept: 'application/json' }, cache: 'force-cache' }).catch(() => null)
      ]);
      if (placeResponse?.ok) {
        const placePayload = await placeResponse.json();
        placeNames = (Array.isArray(placePayload?.places) ? placePayload.places : []).map(validatePlaceName).filter(Boolean);
      } else {
        placeNames = [];
      }
      loadCustomPois();

      mapInstance = window.WWZChernarusMap.create(frame, {
        mode: 'full',
        selectable: true,
        copyOnSelect: true,
        roadsVisible: true,
        trailsVisible: true,
        pointerElement: document.querySelector('[data-map-coordinates]'),
        selectedElement: document.querySelector('[data-map-selected-coordinates]'),
        copyButton: document.querySelector('[data-map-copy-coordinates]'),
        loadingElement: document.querySelector('[data-map-loading]'),
        zoomInButton: document.querySelector('[data-map-zoom-in]'),
        zoomOutButton: document.querySelector('[data-map-zoom-out]'),
        resetButton: document.querySelector('[data-map-reset]'),
        fullscreenButton: document.querySelector('[data-map-fullscreen]'),
        fullscreenTarget: frame,
        roadToggle: document.querySelector('[data-map-road-toggle]'),
        trailToggle: document.querySelector('[data-map-trail-toggle]'),
        onSelect: (position) => {
          selectedLocation = {
            id: null,
            name: 'Selected Coordinates',
            category: 'Map selection',
            description: 'This point is not saved. Save it as a personal custom pin if you want to keep it.',
            x: position.x,
            z: position.z,
            scope: 'selection'
          };
          updateDetails(selectedLocation);
          applyMarkerSelection();
          renderResults();
        }
      });

      if (!mapInstance.map.getPane('wwzPlaceNames')) {
        const placeNamePane = mapInstance.map.createPane('wwzPlaceNames');
        placeNamePane.style.zIndex = '575';
        placeNamePane.style.pointerEvents = 'none';
      }
      placeNameLayer = window.L.layerGroup().addTo(mapInstance.map);
      poiLayer = window.L.layerGroup().addTo(mapInstance.map);
      customLayer = window.L.layerGroup().addTo(mapInstance.map);
      mapInstance.map.on('zoomend', renderPlaceNames);
      renderFilters();
      renderResults();
      window.setTimeout(() => mapInstance.invalidateSize(), 80);
      return mapInstance;
    })().catch((error) => {
      const loading = document.querySelector('[data-map-loading]');
      if (loading) {
        loading.hidden = false;
        loading.classList.add('error');
        const label = loading.querySelector('strong');
        if (label) label.textContent = error.message || 'The Chernarus map could not be loaded.';
      }
      loadPromise = null;
      throw error;
    });

    return loadPromise;
  };

  search?.addEventListener('input', renderResults);
  document.querySelectorAll('[data-map-scope]').forEach((button) => button.addEventListener('click', () => setScope(button.dataset.mapScope)));
  document.querySelector('[data-map-name-toggle]')?.addEventListener('click', () => {
    placeNamesVisible = !placeNamesVisible;
    renderPlaceNames();
  });

  document.querySelector('[data-map-focus-selected]')?.addEventListener('click', () => {
    if (selectedLocation) mapInstance?.focus(selectedLocation.x, selectedLocation.z, Math.max(6, mapInstance.map.getZoom()));
  });

  document.querySelector('[data-map-copy-detail]')?.addEventListener('click', async (event) => {
    if (!selectedLocation) return;
    const text = `${formatCoordinate(selectedLocation.x)}, ${formatCoordinate(selectedLocation.z)}`;
    if (await copyText(text)) setButtonFeedback(event.currentTarget);
  });

  document.querySelector('[data-map-open-custom]')?.addEventListener('click', () => openCustomEditor(null, 'custom'));
  document.querySelector('[data-map-add-custom]')?.addEventListener('click', () => openCustomEditor(null, 'custom'));
  document.querySelector('[data-map-open-public]')?.addEventListener('click', () => openCustomEditor(null, 'public'));
  document.querySelector('[data-map-add-public]')?.addEventListener('click', () => openCustomEditor(null, 'public'));
  document.querySelector('[data-map-save-selected]')?.addEventListener('click', () => openCustomEditor(null, 'custom'));
  document.querySelector('[data-map-edit-custom]')?.addEventListener('click', () => {
    if (selectedLocation?.scope === 'custom') openCustomEditor(selectedLocation, 'custom');
    else if (selectedLocation?.scope === 'public' && hasAdminAccess()) openCustomEditor(selectedLocation, 'public');
  });
  document.querySelector('[data-map-close-custom]')?.addEventListener('click', closeCustomEditor);
  document.querySelector('[data-map-cancel-custom]')?.addEventListener('click', closeCustomEditor);

  document.querySelector('[data-map-use-selection]')?.addEventListener('click', () => {
    const selection = selectedMapPoint();
    if (!selection) {
      window.alert('Click the map first to select coordinates.');
      return;
    }
    customX.value = formatCoordinate(selection.x);
    customZ.value = formatCoordinate(selection.z);
  });

  customForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const publicMode = editorScope === 'public';
    const id = publicMode ? (editingLocation?.id || 'public-pending') : (validText(customId?.value, 100) || makeId());
    const validator = publicMode ? validatePoi : validateCustom;
    const poi = validator({
      id,
      marker_id: publicMode ? editingLocation?.markerId : undefined,
      name: customName?.value,
      category: customCategory?.value || (publicMode ? 'Landmark' : 'Custom'),
      description: customNotes?.value || (publicMode ? 'Public server map marker.' : 'Personal custom map location.'),
      colour: customColour?.value,
      x: customX?.value,
      z: customZ?.value,
      visibility: publicMode ? 'public' : undefined
    });
    if (!poi) {
      window.alert('Enter a name and valid Chernarus X/Z coordinates between 0 and 15360.');
      return;
    }

    if (publicMode) {
      try {
        editorSubmit.disabled = true;
        const saved = await submitPublicMarker(poi);
        closeCustomEditor();
        setScope('all');
        if (saved) {
          mapInstance?.setSelection(saved.x, saved.z, { notify: false, marker: false });
          selectLocation(saved, { focus: true });
        }
        renderFilters();
        renderResults();
      } catch (error) {
        window.alert(error.message || 'The public marker could not be saved.');
      } finally {
        if (editorSubmit) editorSubmit.disabled = false;
      }
      return;
    }

    const index = customPois.findIndex((entry) => entry.id === id);
    if (index >= 0) customPois[index] = poi;
    else if (customPois.length < MAX_CUSTOM_LOCATIONS) customPois.unshift(poi);
    else {
      window.alert(`A maximum of ${MAX_CUSTOM_LOCATIONS} custom locations can be stored in this browser.`);
      return;
    }
    persistCustomPois();
    closeCustomEditor();
    setScope('all');
    mapInstance?.setSelection(poi.x, poi.z, { notify: false, marker: false });
    selectLocation(poi, { focus: true });
    renderFilters();
    renderResults();
  });

  document.querySelector('[data-map-delete-custom]')?.addEventListener('click', async () => {
    if (!selectedLocation) return;
    if (selectedLocation.scope === 'public') {
      if (!hasAdminAccess()) return;
      if (!window.confirm(`Delete public marker “${selectedLocation.name}” for every map user?`)) return;
      try {
        await deletePublicMarker(selectedLocation);
      } catch (error) {
        window.alert(error.message || 'The public marker could not be deleted.');
        return;
      }
    } else if (selectedLocation.scope === 'custom') {
      if (!window.confirm(`Delete private pin “${selectedLocation.name}” from this browser?`)) return;
      customPois = customPois.filter((poi) => poi.id !== selectedLocation.id);
      persistCustomPois();
    } else {
      return;
    }
    mapInstance?.clearSelection({ notify: false });
    selectLocation(null, { focus: false });
    renderFilters();
    renderResults();
  });

  document.querySelector('[data-map-export-custom]')?.addEventListener('click', exportCustomLocations);
  document.querySelector('[data-map-import-custom]')?.addEventListener('change', async (event) => {
    const input = event.currentTarget;
    await importCustomLocations(input.files?.[0]);
    input.value = '';
  });

  window.addEventListener('wwz:accesschange', () => {
    if (editorScope === 'public' && !hasAdminAccess()) closeCustomEditor();
    if (mapInstance) {
      updateDetails(selectedLocation);
      renderResults();
    }
  });

  const requestedView = () => String(location.hash || '').replace(/^#/, '').split('/', 1)[0];

  window.addEventListener('wwz:viewchange', (event) => {
    if (event.detail?.view !== 'map') return;
    initialise().then((instance) => window.setTimeout(() => instance.invalidateSize(), 50)).catch(() => {});
  });

  if (requestedView() === 'map') initialise().catch(() => {});

  window.WWZDashboardMap = Object.freeze({ initialise });
})();
