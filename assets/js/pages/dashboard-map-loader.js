(() => {
  'use strict';

  const frame = document.querySelector('[data-map-frame]');
  if (!frame) return;

  const DATA_URL = 'assets/data/chernarus/pois.json?v=1.22.29';
  const PLACE_NAMES_URL = 'assets/data/chernarus/place-names.json?v=1.22.29';
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

  const validatePoi = (rawPoi) => {
    const id = validText(rawPoi?.id, 80);
    const name = validText(rawPoi?.name, 100);
    const category = validText(rawPoi?.category, 40);
    const description = validText(rawPoi?.description, 320);
    const x = clampCoordinate(rawPoi?.x);
    const z = clampCoordinate(rawPoi?.z);
    if (!id || !name || !category || !description || x === null || z === null) return null;
    if (rawPoi?.visibility !== 'public') return null;
    return { id, name, category, description, x, z, visibility: 'public', scope: 'public' };
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
    const type = validText(rawPlace?.type, 30, 'village');
    const x = clampCoordinate(rawPlace?.x);
    const z = clampCoordinate(rawPlace?.z);
    const minZoom = Math.max(0, Math.min(14, Number(rawPlace?.minZoom) || 4));
    if (!id || !name || x === null || z === null) return null;
    return { id, name, type, x, z, minZoom };
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
    const isSelection = poi.scope === 'selection';
    const scope = document.querySelector('[data-map-detail-scope]');
    if (scope) {
      scope.textContent = isCustom ? 'My Pin' : isSelection ? 'Unsaved' : 'Public';
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
    if (editButton) editButton.hidden = !isCustom;
    if (deleteButton) deleteButton.hidden = !isCustom;
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

  const openCustomEditor = (poi = null) => {
    if (!customPanel) return;
    const selection = selectedMapPoint();
    const base = poi || (selectedLocation?.scope === 'selection' ? selectedLocation : null);
    customId.value = poi?.id || '';
    customName.value = poi?.name || '';
    customCategory.value = poi?.category === 'Custom' ? '' : (poi?.category || '');
    customColour.value = poi?.colour || 'amber';
    customNotes.value = poi?.description === 'Personal custom map location.' ? '' : (poi?.description || '');
    const initialX = base?.x ?? selection?.x;
    const initialZ = base?.z ?? selection?.z;
    customX.value = Number.isFinite(Number(initialX)) ? formatCoordinate(initialX) : '';
    customZ.value = Number.isFinite(Number(initialZ)) ? formatCoordinate(initialZ) : '';
    if (customTitle) customTitle.textContent = poi ? 'Edit Custom Location' : 'Save Custom Location';
    customPanel.hidden = false;
    customName.focus();
  };

  const closeCustomEditor = () => {
    if (customPanel) customPanel.hidden = true;
    customForm?.reset();
    if (customId) customId.value = '';
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
    if (poi.scope === 'custom') symbol.style.setProperty('--pin-colour', COLOURS[poi.colour] || COLOURS.amber);

    const copy = document.createElement('span');
    const heading = document.createElement('span');
    heading.className = 'map-location-heading';
    const name = document.createElement('strong');
    name.textContent = poi.name;
    const badge = document.createElement('em');
    badge.textContent = poi.scope === 'custom' ? 'MY PIN' : poi.category;
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
        colour: custom ? (COLOURS[poi.colour] || COLOURS.amber) : '#d52b1e',
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

    const zoom = mapInstance.map.getZoom();
    const visibleMarkerNames = new Set(filteredLocations().map((poi) => poi.name.toLowerCase()));
    placeNames.forEach((place) => {
      if (zoom < place.minZoom || visibleMarkerNames.has(place.name.toLowerCase())) return;
      const latlng = window.WWZChernarusMap.worldToLeaflet([place.x, place.z]);
      if (!latlng) return;
      const safeName = String(place.name).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[character]));
      const icon = window.L.divIcon({
        className: 'wwz-map-place-name-div-icon',
        html: `<span class=\"wwz-map-place-name wwz-map-place-name--${String(place.type).replace(/[^a-z0-9_-]/gi, '').toLowerCase()}\">${safeName}</span>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      window.L.marker(latlng, {
        icon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 100
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

  const initialise = async () => {
    if (mapInstance) {
      mapInstance.invalidateSize();
      return mapInstance;
    }
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      if (!window.WWZChernarusMap || !window.L) throw new Error('The production Chernarus map runtime is unavailable.');

      const [response, placeResponse] = await Promise.all([
        fetch(DATA_URL, { headers: { Accept: 'application/json' }, cache: 'force-cache' }),
        fetch(PLACE_NAMES_URL, { headers: { Accept: 'application/json' }, cache: 'force-cache' }).catch(() => null)
      ]);
      if (!response.ok) throw new Error('Public map locations could not be loaded.');
      const payload = await response.json();
      publicPois = (Array.isArray(payload?.pois) ? payload.pois : []).map(validatePoi).filter(Boolean);
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

  document.querySelector('[data-map-open-custom]')?.addEventListener('click', () => openCustomEditor());
  document.querySelector('[data-map-add-custom]')?.addEventListener('click', () => openCustomEditor());
  document.querySelector('[data-map-save-selected]')?.addEventListener('click', () => openCustomEditor());
  document.querySelector('[data-map-edit-custom]')?.addEventListener('click', () => {
    if (selectedLocation?.scope === 'custom') openCustomEditor(selectedLocation);
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

  customForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = validText(customId?.value, 100) || makeId();
    const poi = validateCustom({
      id,
      name: customName?.value,
      category: customCategory?.value || 'Custom',
      description: customNotes?.value || 'Personal custom map location.',
      colour: customColour?.value,
      x: customX?.value,
      z: customZ?.value
    });
    if (!poi) {
      window.alert('Enter a name and valid Chernarus X/Z coordinates between 0 and 15360.');
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

  document.querySelector('[data-map-delete-custom]')?.addEventListener('click', () => {
    if (selectedLocation?.scope !== 'custom') return;
    if (!window.confirm(`Delete “${selectedLocation.name}” from this browser?`)) return;
    customPois = customPois.filter((poi) => poi.id !== selectedLocation.id);
    persistCustomPois();
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

  const requestedView = () => String(location.hash || '').replace(/^#/, '').split('/', 1)[0];

  window.addEventListener('wwz:viewchange', (event) => {
    if (event.detail?.view !== 'map') return;
    initialise().then((instance) => window.setTimeout(() => instance.invalidateSize(), 50)).catch(() => {});
  });

  if (requestedView() === 'map') initialise().catch(() => {});

  window.WWZDashboardMap = Object.freeze({ initialise });
})();
