(() => {
  'use strict';

  const DEFAULT_TIMEOUT_MS = 10_000;

  const request = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const controller = new AbortController();
    const upstreamSignal = options.signal;
    const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
    if (upstreamSignal) {
      if (upstreamSignal.aborted) abortFromUpstream();
      else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
    }

    const timeout = window.setTimeout(() => controller.abort(), Math.max(1, Number(timeoutMs) || DEFAULT_TIMEOUT_MS));
    try {
      return await fetch(url, {
        cache: 'no-store',
        credentials: 'omit',
        ...options,
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeout);
      upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
    }
  };

  const json = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
    const response = await request(url, options, timeoutMs);
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
  };

  window.WWZHttp = Object.freeze({ request, json });
})();
