(() => {
  'use strict';

  const MAP_METRES = 15360;
  const MAP_UNITS = 240;
  const SCALE = MAP_UNITS / MAP_METRES;
  const MIN_ZOOM = 0;
  const MAX_NATIVE_ZOOM = 6;
  const MAX_ZOOM = 14;
  const PRODUCTION_WIDTH_MULTIPLIER = 1.80;
  const SATELLITE_URL = 'assets/chernarus-map/satellite-corrected/{z}/{x}/{y}.jpg?v=1.22.27';
  const ROAD_URL = 'assets/chernarus-map/overlays/roads/chernarus-roads-overlay-final.geojson?v=1.22.27';

  const ROAD_ORDER = [
    'paved_primary',
    'paved_secondary',
    'bridge',
    'paved_local',
    'city',
    'gravel',
    'paved_other',
    'mud',
    'trail'
  ];

  const ROAD_STYLES = {
    paved_primary:   { label: 'Primary paved',      minZoom: 0, width: 3.35, colour: '#f4df9a', casing: '#393224', opacity: 0.98 },
    paved_secondary: { label: 'Secondary paved',    minZoom: 2, width: 2.85, colour: '#ead38b', casing: '#393224', opacity: 0.96 },
    paved_local:     { label: 'Local paved',        minZoom: 3, width: 2.35, colour: '#d8cfad', casing: '#34312a', opacity: 0.94 },
    city:            { label: 'Town / city',        minZoom: 3, width: 2.20, colour: '#d2c9aa', casing: '#34312a', opacity: 0.92 },
    bridge:          { label: 'Bridge',             minZoom: 2, width: 3.10, colour: '#f4e4aa', casing: '#2d2921', opacity: 1.00 },
    paved_other:     { label: 'Other paved',        minZoom: 4, width: 2.00, colour: '#c6bea3', casing: '#33312b', opacity: 0.90 },
    gravel:          { label: 'Gravel',             minZoom: 3, width: 1.85, colour: '#b6a477', casing: '#40392c', opacity: 0.88 },
    mud:             { label: 'Dirt / mud',         minZoom: 4, width: 1.60, colour: '#927653', casing: '#3b3024', opacity: 0.84 },
    trail:           { label: 'Trails / paths',     minZoom: 5, width: 1.20, colour: '#9b9278', casing: '#353128', opacity: 0.72 }
  };

  let roadGeometryPromise = null;
  const instances = new Set();

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatCoordinate = (value, decimals = 1) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return number.toFixed(decimals);
  };

  const worldToLeaflet = (coordinate) => {
    const x = Number(coordinate?.[0]);
    const z = Number(coordinate?.[1]);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
    return [(z - MAP_METRES) * SCALE, x * SCALE];
  };

  const leafletToWorld = (latlng) => {
    const lat = Number(latlng?.lat);
    const lng = Number(latlng?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      x: clamp(lng / SCALE, 0, MAP_METRES),
      z: clamp((lat / SCALE) + MAP_METRES, 0, MAP_METRES)
    };
  };

  const normaliseRoadGroup = (rawValue) => {
    const value = String(rawValue || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (ROAD_STYLES[value]) return value;
    if (value.includes('primary')) return 'paved_primary';
    if (value.includes('secondary')) return 'paved_secondary';
    if (value.includes('local')) return 'paved_local';
    if (value.includes('city') || value.includes('town')) return 'city';
    if (value.includes('bridge')) return 'bridge';
    if (value.includes('gravel') || value.includes('grav')) return 'gravel';
    if (value.includes('mud') || value.includes('dirt')) return 'mud';
    if (value.includes('trail') || value.includes('path')) return 'trail';
    if (value.includes('paved') || value.includes('asphalt') || value.includes('taxiway')) return 'paved_other';
    return null;
  };

  const featureGroup = (feature) => {
    const properties = feature?.properties || {};
    const candidates = [
      properties.group,
      properties.road_group,
      properties.production_group,
      properties.category,
      properties.class,
      properties.style,
      properties.surface,
      properties.type,
      feature?.id
    ];
    for (const candidate of candidates) {
      const group = normaliseRoadGroup(candidate);
      if (group) return group;
    }
    return null;
  };

  const appendGeometry = (geometry, target) => {
    if (!geometry) return;
    if (Array.isArray(geometry)) {
      if (!geometry.length) return;
      const first = geometry[0];
      if (Array.isArray(first) && typeof first[0] === 'number') {
        appendGeometry({ type: 'LineString', coordinates: geometry }, target);
      } else {
        geometry.forEach((item) => appendGeometry(item, target));
      }
      return;
    }
    if (geometry.type === 'LineString') {
      const line = geometry.coordinates
        .map(worldToLeaflet)
        .filter(Boolean);
      if (line.length >= 2) target.push(line);
      return;
    }
    if (geometry.type === 'MultiLineString') {
      geometry.coordinates.forEach((coordinates) => appendGeometry({ type: 'LineString', coordinates }, target));
      return;
    }
    if (geometry.type === 'GeometryCollection') {
      (geometry.geometries || []).forEach((item) => appendGeometry(item, target));
    }
  };

  const normaliseRoadDataset = (data) => {
    const groups = Object.fromEntries(ROAD_ORDER.map((name) => [name, []]));

    if (data?.groups && typeof data.groups === 'object' && !Array.isArray(data.groups)) {
      Object.entries(data.groups).forEach(([rawGroup, geometry]) => {
        const group = normaliseRoadGroup(rawGroup);
        if (!group) return;
        if (geometry?.type === 'Feature') appendGeometry(geometry.geometry, groups[group]);
        else appendGeometry(geometry?.geometry || geometry, groups[group]);
      });
      return groups;
    }

    const features = data?.type === 'FeatureCollection'
      ? data.features || []
      : (data?.type === 'Feature' ? [data] : []);

    features.forEach((feature) => {
      const group = featureGroup(feature);
      if (!group) return;
      appendGeometry(feature.geometry, groups[group]);
    });

    return groups;
  };

  const loadRoadGeometry = () => {
    if (roadGeometryPromise) return roadGeometryPromise;
    roadGeometryPromise = fetch(ROAD_URL, {
      method: 'GET',
      headers: { Accept: 'application/geo+json, application/json' },
      cache: 'force-cache'
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Road data returned HTTP ${response.status}.`);
        return response.json();
      })
      .then(normaliseRoadDataset)
      .catch((error) => {
        roadGeometryPromise = null;
        throw error;
      });
    return roadGeometryPromise;
  };

  const zoomWidthProfile = (zoom) => {
    const z = Number(zoom);
    if (!Number.isFinite(z) || z <= 0) return 0.38;
    if (z <= 1) return 0.45;
    if (z <= 2) return 0.55;
    if (z <= 3) return 0.68;
    if (z <= 4) return 0.82;
    if (z <= 5) return 0.96;
    if (z <= 6) return 1.10;
    return Math.min(2.45, 1.10 + ((z - 6) * 0.18));
  };

  const fallbackCopy = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    return copied;
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    return fallbackCopy(text);
  };

  const create = (container, options = {}) => {
    if (!container) throw new Error('A Chernarus map container is required.');
    if (!window.L?.map) throw new Error('Leaflet is not available.');
    if (container._wwzChernarusMapInstance) return container._wwzChernarusMapInstance;

    const L = window.L;
    const bounds = L.latLngBounds([-MAP_UNITS, 0], [0, MAP_UNITS]);
    const map = L.map(container, {
      crs: L.CRS.Simple,
      minZoom: options.minZoom ?? MIN_ZOOM,
      maxZoom: options.maxZoom ?? MAX_ZOOM,
      zoomSnap: options.zoomSnap ?? 0.25,
      zoomDelta: options.zoomDelta ?? 0.5,
      attributionControl: false,
      zoomControl: false,
      preferCanvas: true,
      maxBounds: options.maxBounds === false ? null : bounds.pad(0.04),
      maxBoundsViscosity: 0.85,
      boxZoom: true,
      keyboard: true,
      tap: true
    });

    container.classList.add('wwz-chernarus-map', `wwz-chernarus-map--${options.mode || 'picker'}`);

    const casingPane = map.createPane('wwzRoadCasingPane');
    const surfacePane = map.createPane('wwzRoadSurfacePane');
    casingPane.style.zIndex = '350';
    surfacePane.style.zIndex = '360';
    casingPane.style.pointerEvents = 'none';
    surfacePane.style.pointerEvents = 'none';
    const roadCasingRenderer = L.canvas({ padding: 0.55, pane: 'wwzRoadCasingPane' });
    const roadSurfaceRenderer = L.canvas({ padding: 0.55, pane: 'wwzRoadSurfacePane' });

    container.querySelectorAll('.map-controls, .coordinate-picker-controls, .member-map-controls, .saved-location-map-controls, .map-coordinate-readout, .coordinate-picker-hint, .member-map-readout, .saved-location-map-readout').forEach((element) => {
      L.DomEvent.disableClickPropagation(element);
      L.DomEvent.disableScrollPropagation(element);
    });

    const satellite = L.tileLayer(SATELLITE_URL, {
      tileSize: 256,
      minZoom: MIN_ZOOM,
      maxNativeZoom: MAX_NATIVE_ZOOM,
      maxZoom: MAX_ZOOM,
      noWrap: true,
      bounds,
      keepBuffer: options.keepBuffer ?? 3,
      updateWhenIdle: true,
      className: 'wwz-chernarus-satellite'
    }).addTo(map);

    const roadLayers = new Map();
    const state = {
      selection: null,
      selectionEnabled: options.selectable !== false,
      selectionMarkerVisible: true,
      roadsVisible: options.roadsVisible !== false,
      trailsVisible: options.trailsVisible !== false,
      destroyed: false
    };

    let selectionMarker = null;
    let roadsReady = false;
    let roadError = null;

    const loadingElement = options.loadingElement || null;
    const pointerElement = options.pointerElement || null;
    const selectedElement = options.selectedElement || null;
    const copyButton = options.copyButton || null;
    const roadToggle = options.roadToggle || null;
    const trailToggle = options.trailToggle || null;
    const fullscreenTarget = options.fullscreenTarget || container;

    const makeLocationIcon = ({ name = '', colour = '#d52b1e', selected = false, custom = false, showLabel = true, selection = false } = {}) => {
      const safeColour = /^#[0-9a-f]{6}$/i.test(String(colour)) ? String(colour) : '#d52b1e';
      const classes = [
        'wwz-map-location-pin-wrap',
        custom ? 'is-custom' : 'is-public',
        selected ? 'is-selected' : '',
        selection ? 'is-selection' : ''
      ].filter(Boolean).join(' ');
      const label = showLabel && name
        ? `<span class=\"wwz-map-location-pin-label\">${escapeHtml(name)}</span>`
        : '';
      return L.divIcon({
        className: 'wwz-map-location-div-icon',
        html: `<span class=\"${classes}\" style=\"--wwz-pin-colour:${safeColour}\"><span class=\"wwz-map-location-pin\"><span class=\"wwz-map-location-pin-core\"></span></span>${label}</span>`,
        iconSize: [24, 32],
        iconAnchor: [12, 30]
      });
    };

    const setLoading = (message, status = 'loading') => {
      if (!loadingElement) return;
      if (!message) {
        loadingElement.hidden = true;
        loadingElement.classList.remove('error', 'ready');
        return;
      }
      loadingElement.hidden = false;
      loadingElement.classList.toggle('error', status === 'error');
      loadingElement.classList.toggle('ready', status === 'ready');
      const label = loadingElement.querySelector('strong') || loadingElement;
      label.textContent = message;
    };

    const updateToggleButton = (button, active, label) => {
      if (!button) return;
      button.hidden = false;
      button.disabled = false;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.title = `${active ? 'Hide' : 'Show'} ${label}`;
    };

    const updateToggleState = () => {
      updateToggleButton(roadToggle, state.roadsVisible, 'roads');
      updateToggleButton(trailToggle, state.trailsVisible, 'trails and paths');
    };

    const roadEnabledForGroup = (group) => group === 'trail' ? state.trailsVisible : state.roadsVisible;

    const updateRoadLayers = () => {
      if (!roadsReady || state.destroyed) return;
      const zoom = map.getZoom();
      const globalWidth = zoomWidthProfile(zoom) * PRODUCTION_WIDTH_MULTIPLIER;

      ROAD_ORDER.forEach((group) => {
        const bundle = roadLayers.get(group);
        if (!bundle) return;
        const style = ROAD_STYLES[group];
        const shouldShow = roadEnabledForGroup(group) && zoom >= style.minZoom;

        if (shouldShow) {
          if (!map.hasLayer(bundle.casing)) bundle.casing.addTo(map);
          if (!map.hasLayer(bundle.surface)) bundle.surface.addTo(map);
          const surfaceWidth = Math.max(0.8, style.width * globalWidth);
          const casingWidth = surfaceWidth + Math.max(1.1, 1.55 * globalWidth);
          bundle.casing.setStyle({ weight: casingWidth, opacity: Math.min(0.92, style.opacity) });
          bundle.surface.setStyle({ weight: surfaceWidth, opacity: style.opacity });
        } else {
          if (map.hasLayer(bundle.surface)) map.removeLayer(bundle.surface);
          if (map.hasLayer(bundle.casing)) map.removeLayer(bundle.casing);
        }
      });
      updateToggleState();
    };

    const buildRoadLayers = (groups) => {
      ROAD_ORDER.forEach((group) => {
        const latlngs = groups[group];
        if (!latlngs?.length) return;
        const style = ROAD_STYLES[group];
        const base = {
          interactive: false,
          lineCap: 'butt',
          lineJoin: 'round',
          smoothFactor: 0,
          noClip: false
        };
        const casing = L.polyline(latlngs, {
          ...base,
          renderer: roadCasingRenderer,
          color: style.casing,
          weight: style.width + 2,
          opacity: Math.min(0.92, style.opacity)
        });
        const surface = L.polyline(latlngs, {
          ...base,
          renderer: roadSurfaceRenderer,
          color: style.colour,
          weight: style.width,
          opacity: style.opacity,
          dashArray: style.dashArray || null
        });
        roadLayers.set(group, { casing, surface });
      });
      roadsReady = true;
      roadError = null;
      updateRoadLayers();
      if (loadingElement) setLoading('', 'ready');
      options.onRoadReady?.({ groups: roadLayers.size });
    };

    const loadRoads = () => {
      if (options.loadRoads === false || roadsReady) return Promise.resolve();
      setLoading('Loading production road network…');
      return loadRoadGeometry()
        .then(buildRoadLayers)
        .catch((error) => {
          roadError = error;
          setLoading('Road overlay unavailable — check production map assets.', 'error');
          options.onRoadError?.(error);
        });
    };

    const updateSelectedDisplay = () => {
      if (selectedElement) {
        selectedElement.textContent = state.selection
          ? `X ${formatCoordinate(state.selection.x)} · Z ${formatCoordinate(state.selection.z)}`
          : (options.emptySelectionText || 'Click or tap the map');
      }
      if (copyButton) copyButton.disabled = !state.selection;
    };

    const renderSelectionMarker = () => {
      if (!state.selection || !state.selectionMarkerVisible) {
        if (selectionMarker) {
          map.removeLayer(selectionMarker);
          selectionMarker = null;
        }
        return;
      }
      const latlng = worldToLeaflet([state.selection.x, state.selection.z]);
      if (!latlng) return;
      if (!selectionMarker) {
        selectionMarker = L.marker(latlng, {
          icon: makeLocationIcon({ colour: '#d52b1e', selected: true, showLabel: false, selection: true }),
          interactive: false,
          keyboard: false,
          zIndexOffset: 800
        }).addTo(map);
      } else {
        selectionMarker.setLatLng(latlng);
      }
    };

    const setSelection = (x, z, settings = {}) => {
      const nextX = Number(x);
      const nextZ = Number(z);
      if (!Number.isFinite(nextX) || !Number.isFinite(nextZ)) return false;
      if (nextX < 0 || nextX > MAP_METRES || nextZ < 0 || nextZ > MAP_METRES) return false;
      state.selection = { x: nextX, z: nextZ };
      state.selectionMarkerVisible = settings.marker !== false;
      renderSelectionMarker();
      updateSelectedDisplay();
      if (settings.center) {
        const latlng = worldToLeaflet([nextX, nextZ]);
        map.setView(latlng, settings.zoom ?? Math.max(5, map.getZoom()), { animate: settings.animate !== false });
      }
      if (settings.notify !== false) options.onSelect?.({ ...state.selection }, { source: settings.source || 'api' });
      return true;
    };

    const clearSelection = (settings = {}) => {
      state.selection = null;
      state.selectionMarkerVisible = true;
      renderSelectionMarker();
      updateSelectedDisplay();
      if (settings.notify !== false) options.onClearSelection?.();
    };

    const setSelectionEnabled = (enabled) => {
      state.selectionEnabled = Boolean(enabled);
      container.classList.toggle('wwz-map-selection-disabled', !state.selectionEnabled);
    };

    const copySelection = async () => {
      if (!state.selection) return false;
      const text = `${state.selection.x.toFixed(1)}, ${state.selection.z.toFixed(1)}`;
      const copied = await copyText(text);
      if (copyButton) {
        const original = copyButton.dataset.originalLabel || copyButton.textContent || 'Copy';
        copyButton.dataset.originalLabel = original;
        copyButton.textContent = copied ? 'Copied' : 'Copy failed';
        window.setTimeout(() => { copyButton.textContent = original; }, 1400);
      }
      options.onCopy?.({ ...state.selection, text, copied });
      return copied;
    };

    const reset = () => {
      map.fitBounds(bounds, { padding: options.fitPadding || [8, 8], animate: false });
    };

    const toggleFullscreen = async () => {
      try {
        if (document.fullscreenElement === fullscreenTarget) {
          await document.exitFullscreen?.();
        } else if (fullscreenTarget?.requestFullscreen) {
          await fullscreenTarget.requestFullscreen();
        }
      } catch {}
    };

    const focus = (x, z, zoom = Math.max(6, map.getZoom())) => {
      const latlng = worldToLeaflet([x, z]);
      if (!latlng) return;
      map.setView(latlng, clamp(zoom, MIN_ZOOM, MAX_ZOOM), { animate: true });
    };

    const addPoi = (poi, handlers = {}) => {
      const latlng = worldToLeaflet([poi?.x, poi?.z]);
      if (!latlng) return null;
      const isCustom = handlers.custom === true || poi?.scope === 'custom';
      const colour = handlers.colour || (isCustom ? '#ffbd36' : '#d52b1e');
      const makeIcon = (selected = false) => makeLocationIcon({
        name: poi?.name || 'Location',
        colour,
        selected,
        custom: isCustom,
        showLabel: handlers.showLabel !== false
      });
      const marker = L.marker(latlng, {
        icon: makeIcon(Boolean(handlers.selected)),
        interactive: true,
        keyboard: true,
        title: String(poi?.name || 'Map location'),
        riseOnHover: true,
        zIndexOffset: isCustom ? 500 : 350
      });
      marker._wwzSetSelected = (selected) => marker.setIcon(makeIcon(Boolean(selected)));
      marker.on('click', (event) => {
        L.DomEvent.stopPropagation(event);
        handlers.onClick?.(poi, marker);
      });
      handlers.layer?.addLayer(marker);
      if (!handlers.layer) marker.addTo(map);
      return marker;
    };

    map.on('mousemove', (event) => {
      if (!pointerElement) return;
      const world = leafletToWorld(event.latlng);
      pointerElement.textContent = world
        ? `X ${formatCoordinate(world.x)} · Z ${formatCoordinate(world.z)}`
        : 'X — · Z —';
    });

    map.on('mouseout', () => {
      if (pointerElement) pointerElement.textContent = 'X — · Z —';
    });

    map.on('click', async (event) => {
      if (!state.selectionEnabled) return;
      const world = leafletToWorld(event.latlng);
      if (!world) return;
      setSelection(world.x, world.z, { notify: true, source: 'map' });
      if (options.copyOnSelect) await copySelection();
    });

    map.on('zoomend', updateRoadLayers);
    map.on('resize', updateRoadLayers);

    options.zoomInButton?.addEventListener('click', () => map.zoomIn());
    options.zoomOutButton?.addEventListener('click', () => map.zoomOut());
    options.resetButton?.addEventListener('click', reset);
    options.fullscreenButton?.addEventListener('click', toggleFullscreen);
    roadToggle?.addEventListener('click', () => {
      state.roadsVisible = !state.roadsVisible;
      updateRoadLayers();
    });
    trailToggle?.addEventListener('click', () => {
      state.trailsVisible = !state.trailsVisible;
      updateRoadLayers();
    });
    copyButton?.addEventListener('click', copySelection);

    const fullscreenChange = () => {
      window.setTimeout(() => map.invalidateSize({ pan: false }), 60);
    };
    document.addEventListener('fullscreenchange', fullscreenChange);

    satellite.on('loading', () => {
      if (!roadsReady && !roadError) setLoading('Loading corrected Chernarus satellite…');
    });
    satellite.on('load', () => {
      if (!roadsReady && options.loadRoads === false) setLoading('');
    });
    satellite.on('tileerror', () => {
      options.onTileError?.();
    });

    const api = {
      map,
      bounds,
      satellite,
      loadRoads,
      reset,
      focus,
      setSelection,
      clearSelection,
      setSelectionEnabled,
      copySelection,
      addPoi,
      invalidateSize: () => map.invalidateSize({ pan: false }),
      getSelection: () => state.selection ? { ...state.selection } : null,
      setRoadsVisible: (visible) => { state.roadsVisible = Boolean(visible); updateRoadLayers(); },
      setTrailsVisible: (visible) => { state.trailsVisible = Boolean(visible); updateRoadLayers(); },
      destroy: () => {
        state.destroyed = true;
        document.removeEventListener('fullscreenchange', fullscreenChange);
        instances.delete(api);
        map.remove();
        delete container._wwzChernarusMapInstance;
      }
    };

    container._wwzChernarusMapInstance = api;
    instances.add(api);
    updateSelectedDisplay();
    updateToggleState();
    reset();
    window.setTimeout(() => api.invalidateSize(), 0);
    loadRoads();
    return api;
  };

  window.WWZChernarusMap = Object.freeze({
    MAP_METRES,
    MAP_UNITS,
    SCALE,
    MIN_ZOOM,
    MAX_NATIVE_ZOOM,
    MAX_ZOOM,
    PRODUCTION_WIDTH_MULTIPLIER,
    SATELLITE_URL,
    ROAD_URL,
    ROAD_STYLES,
    worldToLeaflet,
    leafletToWorld,
    formatCoordinate,
    create
  });
})();
