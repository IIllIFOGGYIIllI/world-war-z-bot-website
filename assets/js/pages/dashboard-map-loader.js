(() => {
  'use strict';

  let mapLoadPromise = null;

  const loadMapWorkspace = () => {
    if (mapLoadPromise) return mapLoadPromise;
    mapLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/js/map/chernarus-map.js?v=1.22.18';
      script.defer = true;
      script.dataset.wwzMapModule = 'loaded';
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('The Chernarus map module could not be loaded.')), { once: true });
      document.head.append(script);
    });
    return mapLoadPromise;
  };

  const requestedView = () => String(location.hash || '').replace(/^#/, '').split('/', 1)[0];

  window.addEventListener('wwz:viewchange', (event) => {
    if (event.detail?.view === 'map') loadMapWorkspace().catch(() => {});
  });

  if (requestedView() === 'map') loadMapWorkspace().catch(() => {});
})();
