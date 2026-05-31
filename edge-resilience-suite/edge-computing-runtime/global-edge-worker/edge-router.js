/**
 * Global Edge Worker — Geographic Router & Request Rewrite Engine
 * ---------------------------------------------------------------
 * An ultra-lightweight worker blueprint designed to run inside V8 isolate
 * runtimes (Cloudflare Workers, Deno Deploy, Fastly Compute@Edge-style, etc.).
 *
 * HARD CONSTRAINT: this file uses ONLY web-standard globals available inside a
 * V8 isolate — `Request`, `Response`, `URL`, `Headers`, `fetch`, `caches`,
 * `crypto.subtle`, `addEventListener`. It imports NOTHING from Node.js
 * (no `http`, `crypto`, `buffer`, `process`, `fs`, ...), so it stays portable
 * and cold-start friendly.
 *
 * Capabilities:
 *   - Geographic routing: maps the visitor's region to the nearest origin
 *   - Path/host rewrite hooks: declarative, ordered rewrite rules
 *   - A/B + canary splitting via stable per-client hashing
 *   - Security response headers + request normalization
 *   - Origin failover with timeout + bounded retries (idempotent methods)
 *   - Edge KV-style config injection (overridable per deployment)
 *
 * Export styles supported:
 *   - Module Workers:   `export default { fetch }`
 *   - Service Workers:  `addEventListener('fetch', ...)` (auto-registered)
 */

// ---------------------------------------------------------------------------
// Default routing configuration. In production, hydrate this from an edge
// KV/secret binding and pass it into `createRouter(config)`.
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG = {
  // Map of region code -> ordered list of origins (closest first).
  regionOrigins: {
    NA: ['https://us-east.origin.example.com', 'https://us-west.origin.example.com'],
    SA: ['https://sa.origin.example.com', 'https://us-east.origin.example.com'],
    EU: ['https://eu-west.origin.example.com', 'https://eu-central.origin.example.com'],
    AF: ['https://eu-west.origin.example.com'],
    AS: ['https://ap-south.origin.example.com', 'https://ap-northeast.origin.example.com'],
    OC: ['https://ap-southeast.origin.example.com'],
    DEFAULT: ['https://us-east.origin.example.com'],
  },

  // Continent lookup for ISO 3166-1 alpha-2 country codes the platform exposes
  // (e.g. `request.cf.country` or the `cf-ipcountry` header). Only a pragmatic
  // subset is enumerated; everything else falls back to DEFAULT.
  countryToRegion: {
    US: 'NA', CA: 'NA', MX: 'NA',
    BR: 'SA', AR: 'SA', CL: 'SA', CO: 'SA',
    GB: 'EU', IE: 'EU', FR: 'EU', DE: 'EU', ES: 'EU', IT: 'EU', NL: 'EU', PL: 'EU', SE: 'EU',
    NG: 'AF', ZA: 'AF', EG: 'AF', KE: 'AF',
    IN: 'AS', CN: 'AS', JP: 'AS', SG: 'AS', KR: 'AS', AE: 'AS',
    AU: 'OC', NZ: 'OC',
  },

  // Ordered rewrite rules. Each rule may rewrite hostname and/or pathname.
  // `when` is matched against the incoming URL; `rewrite` mutates a copy.
  rewriteRules: [
    // Strip a legacy "/v1" prefix and forward to "/api".
    { when: { pathPrefix: '/v1/' }, rewrite: { stripPrefix: '/v1', addPrefix: '/api' } },
    // Force apex -> www canonicalization handled separately (redirect).
  ],

  // Canary release: route a deterministic % of traffic to a candidate origin.
  canary: {
    enabled: false,
    percentage: 5, // 0..100
    candidateOrigin: 'https://canary.origin.example.com',
    cookieName: 'edge-bucket',
  },

  // Per-request upstream behavior.
  upstream: {
    timeoutMs: 8000,
    maxRetries: 2,
  },

  // Security headers applied to every edge response.
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },
};

// ---------------------------------------------------------------------------
// Small, dependency-free helpers (web-standard only)
// ---------------------------------------------------------------------------

/**
 * Stable 32-bit FNV-1a hash of a string. Used for sticky canary/AB bucketing
 * so a given client consistently lands in the same bucket without state.
 * @param {string} str
 * @returns {number} unsigned 32-bit integer
 */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    // 32-bit FNV prime multiply via shifts to avoid float precision loss.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}

/** Promise-based timeout using only setTimeout (available in isolates). */
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`edge upstream timeout after ${ms}ms`)), ms);
  });
}

/** Read a cookie value from a Headers object without any Node deps. */
function readCookie(headers, name) {
  const raw = headers.get('Cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

/**
 * Resolve the visitor's region from platform-provided geo signals.
 * @param {Request} request
 * @param {object} config
 * @returns {{ region: string, country: string }}
 */
function resolveRegion(request, config) {
  // Different platforms expose geo differently; check the common surfaces.
  const cf = /** @type {any} */ (request).cf || {};
  const country =
    (cf && cf.country) ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-geo-country') ||
    'XX';
  const region = config.countryToRegion[country] || 'DEFAULT';
  return { region, country };
}

/**
 * Apply the ordered rewrite rules to a URL, returning a new URL instance.
 * @param {URL} url
 * @param {object} config
 * @returns {URL}
 */
function applyRewrites(url, config) {
  const next = new URL(url.toString());
  for (const rule of config.rewriteRules) {
    const cond = rule.when || {};
    if (cond.pathPrefix && !next.pathname.startsWith(cond.pathPrefix)) continue;
    if (cond.hostEquals && next.hostname !== cond.hostEquals) continue;

    const rw = rule.rewrite || {};
    if (rw.stripPrefix && next.pathname.startsWith(rw.stripPrefix)) {
      next.pathname = next.pathname.slice(rw.stripPrefix.length) || '/';
    }
    if (rw.addPrefix) {
      next.pathname = `${rw.addPrefix}${next.pathname === '/' ? '' : next.pathname}`;
    }
    if (rw.setHost) next.hostname = rw.setHost;
  }
  return next;
}

/**
 * Decide the ordered list of candidate origins for this request, honoring
 * canary bucketing when enabled.
 * @returns {{ origins: string[], bucket: string }}
 */
function selectOrigins(request, config) {
  const { region } = resolveRegion(request, config);
  const base = config.regionOrigins[region] || config.regionOrigins.DEFAULT;

  if (!config.canary.enabled) return { origins: base, bucket: 'stable' };

  // Sticky bucketing: prefer an existing cookie, else hash a stable client key.
  const existing = readCookie(request.headers, config.canary.cookieName);
  let bucket = existing;
  if (bucket !== 'canary' && bucket !== 'stable') {
    const clientKey =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      request.headers.get('user-agent') ||
      'anonymous';
    const pct = fnv1a(clientKey) % 100;
    bucket = pct < config.canary.percentage ? 'canary' : 'stable';
  }
  const origins =
    bucket === 'canary' ? [config.canary.candidateOrigin, ...base] : base;
  return { origins, bucket };
}

/**
 * Fetch from a list of origins with timeout + failover. Tries each origin in
 * order; for idempotent methods it also retries transient failures per origin.
 * @param {string[]} origins
 * @param {Request} originRequest already-rewritten request
 * @param {object} config
 * @returns {Promise<Response>}
 */
async function fetchWithFailover(origins, originRequest, config) {
  const method = originRequest.method.toUpperCase();
  const idempotent = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
  const maxRetries = idempotent ? config.upstream.maxRetries : 0;

  let lastError = null;
  for (const origin of origins) {
    const target = new URL(originRequest.url);
    const originUrl = new URL(origin);
    target.protocol = originUrl.protocol;
    target.hostname = originUrl.hostname;
    target.port = originUrl.port;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const proxied = new Request(target.toString(), originRequest);
        proxied.headers.set('X-Forwarded-Host', new URL(originRequest.url).hostname);
        proxied.headers.set('X-Edge-Origin', originUrl.hostname);

        const res = await Promise.race([
          fetch(proxied),
          timeout(config.upstream.timeoutMs),
        ]);

        // Treat 502/503/504 as failover-eligible; everything else is returned.
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          lastError = new Error(`origin ${originUrl.hostname} returned ${res.status}`);
          break; // try the next origin
        }
        return res;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          // Exponential backoff with jitter, capped — using setTimeout only.
          const delay = Math.min(1000, 100 * 2 ** attempt) + Math.floor(Math.random() * 50);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }
  return new Response(
    JSON.stringify({ error: 'edge_all_origins_failed', detail: lastError ? lastError.message : 'unknown' }),
    { status: 502, headers: { 'Content-Type': 'application/json' } },
  );
}

/** Clone a response and merge in the edge security headers + diagnostics. */
function decorateResponse(response, meta, config) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(config.securityHeaders)) headers.set(k, v);
  headers.set('X-Edge-Region', meta.region);
  headers.set('X-Edge-Country', meta.country);
  headers.set('X-Edge-Bucket', meta.bucket);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ---------------------------------------------------------------------------
// Router factory
// ---------------------------------------------------------------------------

/**
 * Build an edge request handler bound to a configuration.
 * @param {object} [userConfig] partial overrides merged over DEFAULT_CONFIG
 * @returns {(request: Request) => Promise<Response>}
 */
function createRouter(userConfig = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    regionOrigins: { ...DEFAULT_CONFIG.regionOrigins, ...(userConfig.regionOrigins || {}) },
    countryToRegion: { ...DEFAULT_CONFIG.countryToRegion, ...(userConfig.countryToRegion || {}) },
    canary: { ...DEFAULT_CONFIG.canary, ...(userConfig.canary || {}) },
    upstream: { ...DEFAULT_CONFIG.upstream, ...(userConfig.upstream || {}) },
    securityHeaders: { ...DEFAULT_CONFIG.securityHeaders, ...(userConfig.securityHeaders || {}) },
    rewriteRules: userConfig.rewriteRules || DEFAULT_CONFIG.rewriteRules,
  };

  return async function handle(request) {
    const { region, country } = resolveRegion(request, config);

    // Lightweight liveness probe handled entirely at the edge.
    const url = new URL(request.url);
    if (url.pathname === '/__edge/health') {
      return new Response(JSON.stringify({ status: 'ok', region, country }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Apex -> www canonical redirect (308 preserves method + body).
    if (url.hostname.startsWith('example.com')) {
      const redirect = new URL(url.toString());
      redirect.hostname = `www.${url.hostname}`;
      return Response.redirect(redirect.toString(), 308);
    }

    // Apply rewrite hooks, then choose origins (with canary bucketing).
    const rewritten = applyRewrites(url, config);
    const { origins, bucket } = selectOrigins(request, config);

    const rewrittenRequest = new Request(rewritten.toString(), request);
    const upstreamResponse = await fetchWithFailover(origins, rewrittenRequest, config);

    const decorated = decorateResponse(upstreamResponse, { region, country, bucket }, config);

    // Persist the canary bucket so the client sticks to it on later requests.
    if (config.canary.enabled) {
      decorated.headers.append(
        'Set-Cookie',
        `${config.canary.cookieName}=${bucket}; Path=/; Secure; SameSite=Lax; Max-Age=86400`,
      );
    }
    return decorated;
  };
}

// ---------------------------------------------------------------------------
// Runtime bindings — support both Module and Service Worker styles.
// ---------------------------------------------------------------------------

const router = createRouter();

// Module Workers (export default { fetch }). Guarded for runtimes w/o `export`.
const moduleWorker = {
  /** @param {Request} request */
  fetch(request) {
    return router(request);
  },
};

// Service Worker style: register a fetch listener if the global exists.
if (typeof addEventListener === 'function') {
  addEventListener('fetch', (event) => {
    // `event.respondWith` is the Service Worker contract.
    event.respondWith(router(event.request));
  });
}

// Expose factory + handler for testing and for Module Worker default export.
// Supports ESM (`export default`) and CommonJS-ish runtimes transparently.
export default moduleWorker;
export { createRouter, resolveRegion, applyRewrites, selectOrigins, fnv1a };
