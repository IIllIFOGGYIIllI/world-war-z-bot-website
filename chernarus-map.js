(() => {
  'use strict';

  const frame = document.querySelector('[data-map-frame]');
  const stage = document.querySelector('[data-map-stage]');
  const tileLayer = document.querySelector('[data-map-tiles]');
  const markersLayer = document.querySelector('[data-map-markers]');
  const selectionMarker = document.querySelector('[data-map-selection-marker]');
  const loading = document.querySelector('[data-map-loading]');
  const search = document.querySelector('[data-map-search]');
  const filters = document.querySelector('[data-map-filters]');
  const locationList = document.querySelector('[data-map-location-list]');
  const emptyState = document.querySelector('[data-map-empty]');
  const resultCount = document.querySelector('[data-map-result-count]');
  const pointerReadout = document.querySelector('[data-map-coordinates]');
  const selectedReadout = document.querySelector('[data-map-selected-coordinates]');
  const copyCoordinatesButton = document.querySelector('[data-map-copy-coordinates]');
  const fullscreenButton = document.querySelector('[data-map-fullscreen]');
  const fullscreenTarget = document.querySelector('[data-map-fullscreen-target]') || frame;

  if (!frame || !stage || !tileLayer || !markersLayer) return;

  const DATA_URL = 'assets/chernarus-pois.json';
  const markerElements = new Map();
  const locationElements = new Map();
  const renderedTiles = new Map();
  const activePointers = new Map();
  const view = { x: 0, y: 0, zoom: 1, minZoom: 0.02, maxZoom: 1.35 };

  let mapSize = 15360;
  let worldPixels = 16384;
  let tileSize = 512;
  let minTileZoom = 0;
  let maxTileZoom = 5;
  let tileBasePath = 'assets/chernarus-map/tiles';
  let tileFormat = 'webp';
  let publicPois = [];
  let selectedCategory = 'All';
  let selectedPoiId = null;
  let selectedCoordinates = null;
  let dataReady = false;
  let hasFitted = false;
  let firstTileLoaded = false;
  let gesture = null;
  let suppressCoordinateClick = false;
  let tileRenderFrame = 0;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const categorySlug = (category) => String(category || 'landmark')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'landmark';

  const formatCoordinate = (value, decimals = 0) => new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(value) || 0);

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
    if (x < 0 || x > mapSize || z < 0 || z > mapSize) return null;
    if (rawPoi?.visibility !== 'public') return null;

    return { id, name, category, description, x, z, visibility: 'public' };
  };

  const setLoadingError = (message) => {
    if (!loading) return;
    loading.hidden = false;
    loading.classList.add('error');
    const label = loading.querySelector('strong');
    if (label) label.textContent = message;
  };

  const finishInitialLoading = () => {
    if (!dataReady || !firstTileLoaded || !loading) return;
    loading.hidden = true;
  };

  const mapPointFromClient = (clientX, clientY) => {
    const rect = frame.getBoundingClientRect();
    const pixelX = (clientX - rect.left - view.x) / view.zoom;
    const pixelY = (clientY - rect.top - view.y) / view.zoom;
    if (pixelX < 0 || pixelX > worldPixels || pixelY < 0 || pixelY > worldPixels) return null;
    return { pixelX, pixelY };
  };

  const coordinatesFromMapPoint = (point) => {
    if (!point) return null;
    return {
      x: clamp((point.pixelX / worldPixels) * mapSize, 0, mapSize),
      z: clamp((1 - point.pixelY / worldPixels) * mapSize, 0, mapSize)
    };
  };

  const updatePointerCoordinates = (clientX, clientY) => {
    if (!pointerReadout) return;
    const coordinates = coordinatesFromMapPoint(mapPointFromClient(clientX, clientY));
    pointerReadout.textContent = coordinates
      ? `X ${formatCoordinate(coordinates.x)} · Z ${formatCoordinate(coordinates.z)}`
      : 'X — · Z —';
  };

  const updateSelectedCoordinateDisplay = () => {
    if (selectedReadout) {
      selectedReadout.textContent = selectedCoordinates
        ? `X ${formatCoordinate(selectedCoordinates.x, 3)} · Z ${formatCoordinate(selectedCoordinates.z, 3)}`
        : 'Click or tap the map';
    }
    if (copyCoordinatesButton) copyCoordinatesButton.disabled = !selectedCoordinates;
    if (!selectionMarker) return;
    if (!selectedCoordinates) {
      selectionMarker.hidden = true;
      return;
    }
    selectionMarker.hidden = false;
    selectionMarker.style.left = `${(selectedCoordinates.x / mapSize) * 100}%`;
    selectionMarker.style.top = `${(1 - selectedCoordinates.z / mapSize) * 100}%`;
  };

  const selectCoordinatesAt = (clientX, clientY) => {
    const coordinates = coordinatesFromMapPoint(mapPointFromClient(clientX, clientY));
    if (!coordinates) return;
    selectedCoordinates = coordinates;
    updateSelectedCoordinateDisplay();
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
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    field.remove();
    return copied;
  };

  const copySelectedCoordinates = async () => {
    if (!selectedCoordinates || !copyCoordinatesButton) return;
    const text = `X ${selectedCoordinates.x.toFixed(3)}, Z ${selectedCoordinates.z.toFixed(3)}`;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (error) {
      copied = false;
    }
    if (!copied) copied = fallbackCopy(text);
    const original = copyCoordinatesButton.textContent;
    copyCoordinatesButton.textContent = copied ? 'Copied' : 'Copy failed';
    window.setTimeout(() => { copyCoordinatesButton.textContent = original; }, 1400);
  };

  const currentTileZoom = () => {
    if (!Number.isFinite(view.zoom) || view.zoom <= 0) return minTileZoom;
    const ideal = maxTileZoom + Math.log2(view.zoom);
    return clamp(Math.ceil(ideal), minTileZoom, maxTileZoom);
  };

  const tilePath = (zoom, x, y) => `${tileBasePath}/${zoom}/${x}/${y}.${tileFormat}`;

  const renderVisibleTiles = () => {
    tileRenderFrame = 0;
    if (!dataReady || !frame.clientWidth || !frame.clientHeight) return;

    const zoom = currentTileZoom();
    const dimension = 2 ** zoom;
    const span = worldPixels / dimension;
    const left = clamp(-view.x / view.zoom, 0, worldPixels);
    const top = clamp(-view.y / view.zoom, 0, worldPixels);
    const right = clamp((frame.clientWidth - view.x) / view.zoom, 0, worldPixels);
    const bottom = clamp((frame.clientHeight - view.y) / view.zoom, 0, worldPixels);
    const buffer = 1;
    const minX = clamp(Math.floor(left / span) - buffer, 0, dimension - 1);
    const maxX = clamp(Math.floor(Math.max(0, right - 0.001) / span) + buffer, 0, dimension - 1);
    const minY = clamp(Math.floor(top / span) - buffer, 0, dimension - 1);
    const maxY = clamp(Math.floor(Math.max(0, bottom - 0.001) / span) + buffer, 0, dimension - 1);
    const required = new Set();

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const key = `${zoom}/${x}/${y}`;
        required.add(key);
        if (renderedTiles.has(key)) continue;

        const tile = document.createElement('img');
        tile.className = 'map-tile';
        tile.alt = '';
        tile.draggable = false;
        tile.decoding = 'async';
        tile.loading = 'eager';
        tile.style.left = `${x * span}px`;
        tile.style.top = `${y * span}px`;
        tile.style.width = `${span + 1}px`;
        tile.style.height = `${span + 1}px`;
        tile.src = tilePath(zoom, x, y);
        tile.addEventListener('load', () => {
          tile.classList.add('loaded');
          if (!firstTileLoaded) {
            firstTileLoaded = true;
            finishInitialLoading();
          }
        }, { once: true });
        tile.addEventListener('error', () => {
          tile.classList.add('failed');
          setLoadingError('A Chernarus map tile could not be loaded.');
        }, { once: true });
        tileLayer.append(tile);
        renderedTiles.set(key, tile);
      }
    }

    renderedTiles.forEach((tile, key) => {
      if (required.has(key)) return;
      tile.remove();
      renderedTiles.delete(key);
    });
  };

  const scheduleTileRender = () => {
    if (tileRenderFrame) return;
    tileRenderFrame = window.requestAnimationFrame(renderVisibleTiles);
  };

  const updateTransform = () => {
    stage.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.zoom})`;
    const inverseScale = String(1 / view.zoom);
    markerElements.forEach((marker) => marker.style.setProperty('--marker-inverse-scale', inverseScale));
    selectionMarker?.style.setProperty('--marker-inverse-scale', inverseScale);
    scheduleTileRender();
  };

  const clampPosition = () => {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (!width || !height) return;

    const scaledSize = worldPixels * view.zoom;
    view.x = scaledSize <= width
      ? (width - scaledSize) / 2
      : clamp(view.x, width - scaledSize, 0);
    view.y = scaledSize <= height
      ? (height - scaledSize) / 2
      : clamp(view.y, height - scaledSize, 0);
  };

  const fitMap = () => {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (!width || !height) return;

    view.minZoom = Math.min(width / worldPixels, height / worldPixels);
    view.zoom = view.minZoom;
    view.x = (width - worldPixels * view.zoom) / 2;
    view.y = (height - worldPixels * view.zoom) / 2;
    hasFitted = true;
    updateTransform();
  };

  const zoomAt = (nextZoom, clientX, clientY) => {
    const rect = frame.getBoundingClientRect();
    const pointX = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const pointY = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    const mapX = (pointX - view.x) / view.zoom;
    const mapY = (pointY - view.y) / view.zoom;
    const zoom = clamp(nextZoom, view.minZoom, Math.max(view.minZoom, view.maxZoom));

    view.x = pointX - mapX * zoom;
    view.y = pointY - mapY * zoom;
    view.zoom = zoom;
    clampPosition();
    updateTransform();
  };

  const centreOnMapCoordinates = (x, z, preferredZoom = 0.32) => {
    if (!frame.clientWidth || !frame.clientHeight) return;
    const targetZoom = clamp(Math.max(view.zoom, preferredZoom), view.minZoom, view.maxZoom);
    const pixelX = (x / mapSize) * worldPixels;
    const pixelY = (1 - z / mapSize) * worldPixels;
    view.zoom = targetZoom;
    view.x = frame.clientWidth / 2 - pixelX * targetZoom;
    view.y = frame.clientHeight / 2 - pixelY * targetZoom;
    clampPosition();
    updateTransform();
  };

  const findPoi = (poiId) => publicPois.find((poi) => poi.id === poiId) || null;

  const selectPoi = (poiId, { centre = false } = {}) => {
    const poi = findPoi(poiId);
    if (!poi) return;
    selectedPoiId = poi.id;

    markerElements.forEach((element, id) => {
      const selected = id === poi.id;
      element.classList.toggle('selected', selected);
      element.setAttribute('aria-pressed', String(selected));
    });
    locationElements.forEach((element, id) => element.classList.toggle('selected', id === poi.id));

    document.querySelector('[data-map-details-empty]')?.setAttribute('hidden', '');
    document.querySelector('[data-map-details-content]')?.removeAttribute('hidden');
    const category = document.querySelector('[data-map-detail-category]');
    const name = document.querySelector('[data-map-detail-name]');
    const description = document.querySelector('[data-map-detail-description]');
    const x = document.querySelector('[data-map-detail-x]');
    const z = document.querySelector('[data-map-detail-z]');
    if (category) category.textContent = poi.category;
    if (name) name.textContent = poi.name;
    if (description) description.textContent = poi.description;
    if (x) x.textContent = formatCoordinate(poi.x);
    if (z) z.textContent = formatCoordinate(poi.z);

    if (centre) centreOnMapCoordinates(poi.x, poi.z);
  };

  const renderLocationList = (visiblePois) => {
    if (!locationList) return;
    locationList.replaceChildren();
    locationElements.clear();

    visiblePois.forEach((poi) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-location-button';
      button.classList.toggle('selected', poi.id === selectedPoiId);

      const symbol = document.createElement('span');
      symbol.className = 'map-location-symbol';
      symbol.setAttribute('aria-hidden', 'true');
      symbol.textContent = '⌖';

      const copy = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = poi.name;
      const metadata = document.createElement('small');
      metadata.textContent = `${poi.category} · X ${formatCoordinate(poi.x)} · Z ${formatCoordinate(poi.z)}`;
      copy.append(name, metadata);

      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      button.append(symbol, copy, arrow);
      button.addEventListener('click', () => selectPoi(poi.id, { centre: true }));
      locationList.append(button);
      locationElements.set(poi.id, button);
    });
  };

  const applyFilters = () => {
    const searchValue = search?.value.trim().toLowerCase() || '';
    const visiblePois = publicPois.filter((poi) => {
      const matchesCategory = selectedCategory === 'All' || poi.category === selectedCategory;
      const haystack = `${poi.name} ${poi.category} ${poi.description} ${poi.x} ${poi.z}`.toLowerCase();
      return matchesCategory && haystack.includes(searchValue);
    });
    const visibleIds = new Set(visiblePois.map((poi) => poi.id));

    markerElements.forEach((element, poiId) => { element.hidden = !visibleIds.has(poiId); });
    if (resultCount) resultCount.textContent = String(visiblePois.length);
    if (emptyState) emptyState.hidden = visiblePois.length !== 0;
    renderLocationList(visiblePois);
  };

  const renderFilters = () => {
    if (!filters) return;
    const categories = ['All', ...new Set(publicPois.map((poi) => poi.category))];
    filters.replaceChildren();

    categories.forEach((category) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = category;
      button.classList.toggle('active', category === selectedCategory);
      button.setAttribute('aria-pressed', String(category === selectedCategory));
      button.addEventListener('click', () => {
        selectedCategory = category;
        renderFilters();
        applyFilters();
      });
      filters.append(button);
    });
  };

  const renderMarkers = () => {
    markersLayer.replaceChildren();
    markerElements.clear();

    publicPois.forEach((poi) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'map-marker';
      marker.dataset.category = categorySlug(poi.category);
      marker.style.left = `${(poi.x / mapSize) * 100}%`;
      marker.style.top = `${(1 - poi.z / mapSize) * 100}%`;
      marker.setAttribute('aria-label', `${poi.name}, ${poi.category}, X ${formatCoordinate(poi.x)}, Z ${formatCoordinate(poi.z)}`);
      marker.setAttribute('aria-pressed', 'false');

      const label = document.createElement('span');
      label.textContent = poi.name;
      marker.append(label);
      marker.addEventListener('pointerdown', (event) => event.stopPropagation());
      marker.addEventListener('click', () => selectPoi(poi.id));
      marker.addEventListener('dblclick', () => selectPoi(poi.id, { centre: true }));
      markersLayer.append(marker);
      markerElements.set(poi.id, marker);
    });
  };

  const validateTilePyramid = (raw) => {
    const basePath = validText(raw?.base_path, 180);
    const format = validText(raw?.format, 12);
    const configuredTileSize = Number(raw?.tile_size);
    const configuredWorldPixels = Number(raw?.native_pixels);
    const configuredMinZoom = Number(raw?.min_zoom);
    const configuredMaxZoom = Number(raw?.max_zoom);
    if (!basePath?.startsWith('assets/') || !/^[a-z0-9-]+$/i.test(format || '')) return null;
    if (!Number.isInteger(configuredTileSize) || configuredTileSize < 128 || configuredTileSize > 1024) return null;
    if (!Number.isInteger(configuredWorldPixels) || configuredWorldPixels < configuredTileSize) return null;
    if (!Number.isInteger(configuredMinZoom) || !Number.isInteger(configuredMaxZoom)) return null;
    if (configuredMinZoom < 0 || configuredMaxZoom < configuredMinZoom || configuredMaxZoom > 8) return null;
    if (configuredTileSize * (2 ** configuredMaxZoom) !== configuredWorldPixels) return null;
    return {
      basePath,
      format,
      tileSize: configuredTileSize,
      worldPixels: configuredWorldPixels,
      minZoom: configuredMinZoom,
      maxZoom: configuredMaxZoom
    };
  };

  const loadMapData = async () => {
    try {
      const response = await fetch(DATA_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error(`Map data request failed: ${response.status}`);
      const payload = await response.json();
      const configuredSize = Number(payload?.map?.size_meters);
      const pyramid = validateTilePyramid(payload?.map?.tile_pyramid);
      if (!Number.isFinite(configuredSize) || configuredSize <= 0 || !pyramid) throw new Error('Invalid map configuration');

      mapSize = configuredSize;
      tileBasePath = pyramid.basePath;
      tileFormat = pyramid.format;
      tileSize = pyramid.tileSize;
      worldPixels = pyramid.worldPixels;
      minTileZoom = pyramid.minZoom;
      maxTileZoom = pyramid.maxZoom;
      stage.style.width = `${worldPixels}px`;
      stage.style.height = `${worldPixels}px`;

      const seenIds = new Set();
      publicPois = (Array.isArray(payload?.pois) ? payload.pois : [])
        .map(validatePoi)
        .filter((poi) => {
          if (!poi || seenIds.has(poi.id)) return false;
          seenIds.add(poi.id);
          return true;
        });

      renderMarkers();
      renderFilters();
      applyFilters();
      dataReady = true;
      window.requestAnimationFrame(() => {
        fitMap();
        renderVisibleTiles();
      });
    } catch (error) {
      setLoadingError('Chernarus map data is temporarily unavailable.');
    }
  };

  search?.addEventListener('input', applyFilters);
  copyCoordinatesButton?.addEventListener('click', copySelectedCoordinates);
  document.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => zoomAt(view.zoom * 1.45));
  document.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => zoomAt(view.zoom / 1.45));
  document.querySelector('[data-map-reset]')?.addEventListener('click', fitMap);
  document.querySelector('[data-map-focus-selected]')?.addEventListener('click', () => {
    const poi = findPoi(selectedPoiId);
    if (poi) centreOnMapCoordinates(poi.x, poi.z);
  });

  if (!document.fullscreenEnabled || !fullscreenTarget.requestFullscreen) {
    fullscreenButton?.setAttribute('hidden', '');
  } else {
    fullscreenButton?.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === fullscreenTarget) await document.exitFullscreen();
        else await fullscreenTarget.requestFullscreen();
      } catch (error) {
        /* Fullscreen can be denied by browser policy; the map remains usable. */
      }
    });
    document.addEventListener('fullscreenchange', () => {
      if (fullscreenButton) {
        const active = document.fullscreenElement === fullscreenTarget;
        fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen map' : 'Open fullscreen map');
        fullscreenButton.textContent = active ? '×' : '⛶';
      }
      window.requestAnimationFrame(() => {
        clampPosition();
        updateTransform();
      });
    });
  }

  frame.addEventListener('wheel', (event) => {
    event.preventDefault();
    const multiplier = Math.exp(-event.deltaY * 0.00145);
    zoomAt(view.zoom * multiplier, event.clientX, event.clientY);
  }, { passive: false });

  frame.addEventListener('dblclick', (event) => {
    if (event.target.closest('button, a, input')) return;
    event.preventDefault();
    zoomAt(view.zoom * 1.8, event.clientX, event.clientY);
  });

  const beginGesture = () => {
    const pointers = [...activePointers.values()];
    if (pointers.length === 1) {
      const pointer = pointers[0];
      gesture = {
        type: 'pan',
        pointerId: pointer.id,
        startX: pointer.x,
        startY: pointer.y,
        viewX: view.x,
        viewY: view.y,
        moved: false
      };
      return;
    }
    if (pointers.length >= 2) {
      const [a, b] = pointers;
      const rect = frame.getBoundingClientRect();
      const midpointX = (a.x + b.x) / 2 - rect.left;
      const midpointY = (a.y + b.y) / 2 - rect.top;
      suppressCoordinateClick = true;
      gesture = {
        type: 'pinch',
        startDistance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        startZoom: view.zoom,
        mapX: (midpointX - view.x) / view.zoom,
        mapY: (midpointY - view.y) / view.zoom,
        moved: true
      };
    }
  };

  frame.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, a, input')) return;
    activePointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
    frame.setPointerCapture?.(event.pointerId);
    beginGesture();
  });

  frame.addEventListener('pointermove', (event) => {
    updatePointerCoordinates(event.clientX, event.clientY);
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });

    if (activePointers.size >= 2) {
      if (gesture?.type !== 'pinch') beginGesture();
      const [a, b] = [...activePointers.values()];
      const rect = frame.getBoundingClientRect();
      const midpointX = (a.x + b.x) / 2 - rect.left;
      const midpointY = (a.y + b.y) / 2 - rect.top;
      const distance = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const zoom = clamp(gesture.startZoom * (distance / gesture.startDistance), view.minZoom, view.maxZoom);
      view.zoom = zoom;
      view.x = midpointX - gesture.mapX * zoom;
      view.y = midpointY - gesture.mapY * zoom;
      clampPosition();
      updateTransform();
      return;
    }

    if (gesture?.type === 'pan' && gesture.pointerId === event.pointerId) {
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      if (Math.hypot(dx, dy) > 6) gesture.moved = true;
      view.x = gesture.viewX + dx;
      view.y = gesture.viewY + dy;
      clampPosition();
      updateTransform();
    }
  });

  const endPointer = (event) => {
    if (!activePointers.has(event.pointerId)) return;
    const wasClick = activePointers.size === 1 && gesture?.type === 'pan' && !gesture.moved && !suppressCoordinateClick;
    activePointers.delete(event.pointerId);
    frame.releasePointerCapture?.(event.pointerId);
    if (wasClick) selectCoordinatesAt(event.clientX, event.clientY);
    if (activePointers.size) beginGesture();
    else {
      gesture = null;
      suppressCoordinateClick = false;
    }
  };

  frame.addEventListener('pointerup', endPointer);
  frame.addEventListener('pointercancel', endPointer);
  frame.addEventListener('pointerleave', () => {
    if (!activePointers.size && pointerReadout) pointerReadout.textContent = 'X — · Z —';
  });

  frame.addEventListener('keydown', (event) => {
    const panDistance = Math.max(52, Math.min(frame.clientWidth, frame.clientHeight) * 0.12);
    if (event.key === 'ArrowLeft') view.x += panDistance;
    else if (event.key === 'ArrowRight') view.x -= panDistance;
    else if (event.key === 'ArrowUp') view.y += panDistance;
    else if (event.key === 'ArrowDown') view.y -= panDistance;
    else if (event.key === '+' || event.key === '=') zoomAt(view.zoom * 1.45);
    else if (event.key === '-' || event.key === '_') zoomAt(view.zoom / 1.45);
    else if (event.key === '0') fitMap();
    else if (event.key.toLowerCase() === 'c' && selectedCoordinates) copySelectedCoordinates();
    else return;

    event.preventDefault();
    if (event.key.startsWith('Arrow')) {
      clampPosition();
      updateTransform();
    }
  });

  window.addEventListener('wwz:viewchange', (event) => {
    if (event.detail?.view !== 'map') return;
    window.requestAnimationFrame(() => {
      if (!hasFitted) fitMap();
      else {
        clampPosition();
        updateTransform();
      }
    });
  });

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => {
      if (!frame.clientWidth || !frame.clientHeight || !dataReady) return;
      if (!hasFitted) fitMap();
      else {
        clampPosition();
        updateTransform();
      }
    }).observe(frame);
  } else {
    window.addEventListener('resize', () => {
      clampPosition();
      updateTransform();
    });
  }

  updateSelectedCoordinateDisplay();
  loadMapData();
})();
