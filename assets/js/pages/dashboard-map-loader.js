(() => {
  'use strict';

  const frame = document.querySelector('[data-map-frame]');
  if (!frame) return;

  const DATA_URL = 'assets/data/chernarus/pois.json?v=1.22.27';
  let mapInstance = null;
  let loadPromise = null;
  let publicPois = [];
  let selectedCategory = 'All';
  let selectedPoiId = null;
  let poiLayer = null;
  const poiMarkers = new Map();

  const search = document.querySelector('[data-map-search]');
  const filters = document.querySelector('[data-map-filters]');
  const locationList = document.querySelector('[data-map-location-list]');
  const emptyState = document.querySelector('[data-map-empty]');
  const resultCount = document.querySelector('[data-map-result-count]');

  const formatCoordinate = (value) => window.WWZChernarusMap?.formatCoordinate(value, 1) ?? Number(value).toFixed(1);

  const validText = (value, maximumLength) => {
    const text = String(value || '').trim();
    return text && text.length <= maximumLength ? text : null;
  };

  const validatePoi = (rawPoi) => {
    const id = validText(rawPoi?.id, 80);
    const name = validText(rawPoi?.name, 100);
    const category = validText(rawPoi?.category, 40);
    const description = validText(rawPoi?.description, 320);
    const x = Number(rawPoi?.x);
    const z = Number(rawPoi?.z);
    if (!id || !name || !category || !description) return null;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
    if (x < 0 || x > 15360 || z < 0 || z > 15360) return null;
    if (rawPoi?.visibility !== 'public') return null;
    return { id, name, category, description, x, z, visibility: 'public' };
  };

  const currentQuery = () => String(search?.value || '').trim().toLowerCase();

  const filteredPois = () => {
    const query = currentQuery();
    return publicPois.filter((poi) => {
      const categoryMatches = selectedCategory === 'All' || poi.category === selectedCategory;
      const haystack = `${poi.name} ${poi.category} ${poi.description} ${poi.x} ${poi.z}`.toLowerCase();
      return categoryMatches && (!query || haystack.includes(query));
    });
  };

  const updateDetails = (poi) => {
    const empty = document.querySelector('[data-map-details-empty]');
    const content = document.querySelector('[data-map-details-content]');
    if (!poi) {
      empty?.removeAttribute('hidden');
      content?.setAttribute('hidden', '');
      return;
    }
    empty?.setAttribute('hidden', '');
    content?.removeAttribute('hidden');
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
  };

  const selectPoi = (poi, { focus = true } = {}) => {
    selectedPoiId = poi?.id || null;
    updateDetails(poi || null);
    poiMarkers.forEach((marker, id) => {
      if (marker?.setStyle) {
        marker.setStyle(id === selectedPoiId
          ? { radius: 8, weight: 3, fillColor: '#ff4d3d' }
          : { radius: 6, weight: 2, fillColor: '#d52b1e' });
      }
    });
    if (poi && focus) mapInstance?.focus(poi.x, poi.z, Math.max(6, mapInstance.map.getZoom()));
  };

  const renderFilters = () => {
    if (!filters) return;
    const categories = ['All', ...new Set(publicPois.map((poi) => poi.category).sort((a, b) => a.localeCompare(b)))];
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

  const renderResults = () => {
    const visible = filteredPois();
    if (resultCount) resultCount.textContent = String(visible.length);
    if (emptyState) emptyState.hidden = visible.length !== 0;

    if (locationList) {
      locationList.replaceChildren();
      visible.forEach((poi) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `map-location-item${poi.id === selectedPoiId ? ' active' : ''}`;
        const copy = document.createElement('span');
        const name = document.createElement('strong');
        name.textContent = poi.name;
        const meta = document.createElement('small');
        meta.textContent = `${poi.category} · X ${formatCoordinate(poi.x)} · Z ${formatCoordinate(poi.z)}`;
        copy.append(name, meta);
        const arrow = document.createElement('span');
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';
        button.append(copy, arrow);
        button.addEventListener('click', () => {
          selectPoi(poi);
          renderResults();
        });
        locationList.append(button);
      });
    }

    if (poiLayer && mapInstance) {
      poiLayer.clearLayers();
      poiMarkers.clear();
      visible.forEach((poi) => {
        const marker = mapInstance.addPoi(poi, {
          layer: poiLayer,
          onClick: () => {
            selectPoi(poi, { focus: false });
            renderResults();
          }
        });
        if (marker) poiMarkers.set(poi.id, marker);
      });
      if (selectedPoiId) {
        const selected = publicPois.find((poi) => poi.id === selectedPoiId);
        if (selected && !visible.some((poi) => poi.id === selectedPoiId)) selectPoi(null, { focus: false });
      }
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

      const response = await fetch(DATA_URL, { headers: { Accept: 'application/json' }, cache: 'force-cache' });
      if (!response.ok) throw new Error('Public map locations could not be loaded.');
      const payload = await response.json();
      publicPois = (Array.isArray(payload?.pois) ? payload.pois : []).map(validatePoi).filter(Boolean);

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
        onSelect: () => {
          selectedPoiId = null;
          updateDetails(null);
          renderResults();
        }
      });

      poiLayer = window.L.layerGroup().addTo(mapInstance.map);
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
  document.querySelector('[data-map-focus-selected]')?.addEventListener('click', () => {
    const poi = publicPois.find((entry) => entry.id === selectedPoiId);
    if (poi) mapInstance?.focus(poi.x, poi.z, Math.max(6, mapInstance.map.getZoom()));
  });

  const requestedView = () => String(location.hash || '').replace(/^#/, '').split('/', 1)[0];

  window.addEventListener('wwz:viewchange', (event) => {
    if (event.detail?.view !== 'map') return;
    initialise().then((instance) => window.setTimeout(() => instance.invalidateSize(), 50)).catch(() => {});
  });

  if (requestedView() === 'map') initialise().catch(() => {});

  window.WWZDashboardMap = Object.freeze({ initialise });
})();
