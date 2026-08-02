(() => {
  'use strict';

  const frame = document.querySelector('[data-map-frame]');
  const stage = document.querySelector('[data-map-stage]');
  const image = document.querySelector('[data-map-image]');
  const layerImages = Array.from(document.querySelectorAll('[data-map-layer-image]'));
  const layerButtons = Array.from(document.querySelectorAll('[data-map-layer-button]'));
  const layerNote = document.querySelector('[data-map-layer-note]');
  const markersLayer = document.querySelector('[data-map-markers]');
  const loading = document.querySelector('[data-map-loading]');
  const search = document.querySelector('[data-map-search]');
  const filters = document.querySelector('[data-map-filters]');
  const locationList = document.querySelector('[data-map-location-list]');
  const emptyState = document.querySelector('[data-map-empty]');
  const resultCount = document.querySelector('[data-map-result-count]');
  const coordinateReadout = document.querySelector('[data-map-coordinates]');

  if (!frame || !stage || !image || !markersLayer) return;

  const RENDER_SIZE = 2048;
  const DATA_URL = 'assets/chernarus-pois.json';
  const markerElements = new Map();
  const locationElements = new Map();
  const view = { x: 0, y: 0, zoom: 1, minZoom: 0.2, maxZoom: 2.6 };

  let mapSize = 15360;
  let publicPois = [];
  let selectedCategory = 'All';
  let selectedPoiId = null;
  let dataReady = false;
  let imageReady = false;
  let hasFitted = false;
  let dragState = null;
  let activeLayerId = 'roads';
  let mapLayers = new Map();

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  const categorySlug = (category) => String(category || 'landmark')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'landmark';

  const formatCoordinate = (value) => new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 0
  }).format(Math.round(Number(value) || 0));

  const validText = (value, maximumLength) => {
    const text = String(value || '').trim();
    return text && text.length <= maximumLength ? text : null;
  };

  const validateLayer = (rawLayer) => {
    const id = validText(rawLayer?.id, 40);
    const name = validText(rawLayer?.name, 60);
    const imagePath = validText(rawLayer?.image, 160);
    const note = validText(rawLayer?.note, 240);
    const maxZoom = Number(rawLayer?.max_zoom);
    if (!id || !name || !imagePath?.startsWith('assets/') || !note) return null;
    if (!Number.isFinite(maxZoom) || maxZoom < 1 || maxZoom > 4) return null;
    return { id, name, image: imagePath, note, maxZoom };
  };

  const setMapLayer = (layerId, { remember = true } = {}) => {
    const layer = mapLayers.get(layerId);
    const nextImage = layerImages.find((element) => element.dataset.mapLayerImage === layerId);
    if (!layer || !nextImage) return;

    activeLayerId = layerId;
    view.maxZoom = layer.maxZoom;
    layerImages.forEach((element) => {
      const active = element === nextImage;
      element.classList.toggle('active', active);
      element.setAttribute('aria-hidden', String(!active));
    });
    layerButtons.forEach((button) => {
      const active = button.dataset.mapLayerButton === layerId;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (layerNote) layerNote.textContent = layer.note;

    if (view.zoom > view.maxZoom) zoomAt(view.maxZoom);
    if (remember) {
      try { window.sessionStorage.setItem('wwz-map-layer', layerId); } catch (error) { /* Storage is optional. */ }
    }
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

  const updateTransform = () => {
    stage.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.zoom})`;
    const inverseScale = String(1 / view.zoom);
    markerElements.forEach((marker) => {
      marker.style.setProperty('--marker-inverse-scale', inverseScale);
    });
  };

  const clampPosition = () => {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (!width || !height) return;

    const scaledSize = RENDER_SIZE * view.zoom;
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

    view.minZoom = Math.min(width / RENDER_SIZE, height / RENDER_SIZE);
    view.zoom = view.minZoom;
    view.x = (width - RENDER_SIZE * view.zoom) / 2;
    view.y = (height - RENDER_SIZE * view.zoom) / 2;
    hasFitted = true;
    updateTransform();
  };

  const zoomAt = (nextZoom, clientX, clientY) => {
    const rect = frame.getBoundingClientRect();
    const pointX = Number.isFinite(clientX) ? clientX - rect.left : rect.width / 2;
    const pointY = Number.isFinite(clientY) ? clientY - rect.top : rect.height / 2;
    const mapX = (pointX - view.x) / view.zoom;
    const mapY = (pointY - view.y) / view.zoom;
    const maximumZoom = Math.max(view.minZoom, view.maxZoom);
    const zoom = clamp(nextZoom, view.minZoom, maximumZoom);

    view.x = pointX - mapX * zoom;
    view.y = pointY - mapY * zoom;
    view.zoom = zoom;
    clampPosition();
    updateTransform();
  };

  const centreOnPoi = (poi) => {
    if (!poi || !frame.clientWidth || !frame.clientHeight) return;
    const targetZoom = clamp(Math.max(view.zoom, view.minZoom * 2.35), view.minZoom, view.maxZoom);
    const pixelX = (poi.x / mapSize) * RENDER_SIZE;
    const pixelY = (1 - poi.z / mapSize) * RENDER_SIZE;
    view.zoom = targetZoom;
    view.x = frame.clientWidth / 2 - pixelX * targetZoom;
    view.y = frame.clientHeight / 2 - pixelY * targetZoom;
    clampPosition();
    updateTransform();
  };

  const updateCoordinates = (clientX, clientY) => {
    if (!coordinateReadout) return;
    const rect = frame.getBoundingClientRect();
    const mapPixelX = (clientX - rect.left - view.x) / view.zoom;
    const mapPixelY = (clientY - rect.top - view.y) / view.zoom;

    if (mapPixelX < 0 || mapPixelX > RENDER_SIZE || mapPixelY < 0 || mapPixelY > RENDER_SIZE) {
      coordinateReadout.textContent = 'X — · Z —';
      return;
    }

    const x = (mapPixelX / RENDER_SIZE) * mapSize;
    const z = (1 - mapPixelY / RENDER_SIZE) * mapSize;
    coordinateReadout.textContent = `X ${formatCoordinate(x)} · Z ${formatCoordinate(z)}`;
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
    locationElements.forEach((element, id) => {
      element.classList.toggle('selected', id === poi.id);
    });

    document.querySelector('[data-map-details-empty]')?.setAttribute('hidden', '');
    document.querySelector('[data-map-details-content]')?.removeAttribute('hidden');
    document.querySelector('[data-map-detail-category]').textContent = poi.category;
    document.querySelector('[data-map-detail-name]').textContent = poi.name;
    document.querySelector('[data-map-detail-description]').textContent = poi.description;
    document.querySelector('[data-map-detail-x]').textContent = formatCoordinate(poi.x);
    document.querySelector('[data-map-detail-z]').textContent = formatCoordinate(poi.z);

    if (centre) centreOnPoi(poi);
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

    markerElements.forEach((element, poiId) => {
      element.hidden = !visibleIds.has(poiId);
    });
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

    updateTransform();
  };

  const showLoadError = (message) => {
    if (!loading) return;
    loading.hidden = false;
    loading.classList.add('error');
    const label = loading.querySelector('strong');
    if (label) label.textContent = message;
  };

  const finishLoadingIfReady = () => {
    if (!dataReady || !imageReady) return;
    if (loading) loading.hidden = true;
    window.requestAnimationFrame(() => {
      if (!hasFitted) fitMap();
    });
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
      if (!Number.isFinite(configuredSize) || configuredSize <= 0) throw new Error('Invalid map size');
      mapSize = configuredSize;

      const validLayers = (Array.isArray(payload?.map?.layers) ? payload.map.layers : [])
        .map(validateLayer)
        .filter(Boolean);
      if (!validLayers.length) throw new Error('No valid map layers');
      mapLayers = new Map(validLayers.map((layer) => [layer.id, layer]));
      validLayers.forEach((layer) => {
        const layerImage = layerImages.find((element) => element.dataset.mapLayerImage === layer.id);
        if (layerImage && layerImage.getAttribute('src') !== layer.image) layerImage.src = layer.image;
      });

      let preferredLayer = String(payload?.map?.default_layer || 'roads');
      try { preferredLayer = window.sessionStorage.getItem('wwz-map-layer') || preferredLayer; } catch (error) { /* Storage is optional. */ }
      if (!mapLayers.has(preferredLayer)) preferredLayer = validLayers[0].id;
      setMapLayer(preferredLayer, { remember: false });

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
      finishLoadingIfReady();
    } catch (error) {
      showLoadError('Public map data is temporarily unavailable.');
    }
  };

  image.addEventListener('load', () => {
    imageReady = true;
    finishLoadingIfReady();
  });
  image.addEventListener('error', () => showLoadError('Chernarus map image could not be loaded.'));
  if (image.complete && image.naturalWidth > 0) imageReady = true;

  search?.addEventListener('input', applyFilters);
  layerButtons.forEach((button) => {
    button.addEventListener('click', () => setMapLayer(button.dataset.mapLayerButton));
  });
  document.querySelector('[data-map-zoom-in]')?.addEventListener('click', () => zoomAt(view.zoom * 1.35));
  document.querySelector('[data-map-zoom-out]')?.addEventListener('click', () => zoomAt(view.zoom / 1.35));
  document.querySelector('[data-map-reset]')?.addEventListener('click', fitMap);
  document.querySelector('[data-map-focus-selected]')?.addEventListener('click', () => centreOnPoi(findPoi(selectedPoiId)));

  frame.addEventListener('wheel', (event) => {
    event.preventDefault();
    const multiplier = Math.exp(-event.deltaY * 0.0015);
    zoomAt(view.zoom * multiplier, event.clientX, event.clientY);
  }, { passive: false });

  frame.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, a, input')) return;
    dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    frame.setPointerCapture?.(event.pointerId);
  });

  frame.addEventListener('pointermove', (event) => {
    updateCoordinates(event.clientX, event.clientY);
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    view.x += event.clientX - dragState.x;
    view.y += event.clientY - dragState.y;
    dragState.x = event.clientX;
    dragState.y = event.clientY;
    clampPosition();
    updateTransform();
  });

  const endDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    frame.releasePointerCapture?.(event.pointerId);
    dragState = null;
  };

  frame.addEventListener('pointerup', endDrag);
  frame.addEventListener('pointercancel', endDrag);
  frame.addEventListener('pointerleave', () => {
    if (!dragState && coordinateReadout) coordinateReadout.textContent = 'X — · Z —';
  });

  frame.addEventListener('keydown', (event) => {
    const panDistance = 72;
    if (event.key === 'ArrowLeft') view.x += panDistance;
    else if (event.key === 'ArrowRight') view.x -= panDistance;
    else if (event.key === 'ArrowUp') view.y += panDistance;
    else if (event.key === 'ArrowDown') view.y -= panDistance;
    else if (event.key === '+' || event.key === '=') zoomAt(view.zoom * 1.35);
    else if (event.key === '-' || event.key === '_') zoomAt(view.zoom / 1.35);
    else if (event.key === '0') fitMap();
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
      if (!frame.clientWidth || !frame.clientHeight) return;
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

  loadMapData();
  finishLoadingIfReady();
})();
