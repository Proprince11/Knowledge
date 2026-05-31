/**
 * Edge Cache Steward — In-Flight Dedup + Static Response Caching
 * --------------------------------------------------------------
 * Runs inside V8 isolate runtimes. Uses ONLY web-standard primitives:
 * `Request`, `Response`, `Headers`, `URL`, `caches` (Cache API), `crypto.subtle`,
 * and `Map`/`Promise`. No Node.js built-ins are imported.
 *
 * Two cooperating layers:
 *
 *  1. Request coalescing (single-flight): when many concurrent requests miss
 *     the cache for the same key, only ONE origin fetch is performed; the
 *     others await the in-flight promise. This collapses thundering herds at
 *     the edge during cache stampedes.
 *
 *  2. Static response caching: cacheable responses are stored using the
 *     platform Cache API when available, with an in-memory LRU fallback for
 *     runtimes/tests without `caches`. Freshness honors `Cache-Control`
 *     (`max-age`, `s-maxage`, `no-store`, `private`) and supports
 *     stale-while-revalidate semantics.
 *
 * The steward is transport-agnostic: give it a `fetcher` (defaults to global
 * `fetch`) and wrap any handler with `stewardize(handler)` or call
 * `cache.handle(request, fetcher)` directly.
 */

// ---- Ambient web-platform types (kept minimal; no DOM lib dependency) ------

declare const caches: {
  open(name: string): Promise<EdgeCacheStorage>;
} | undefined;

interface EdgeCacheStorage {
  match(request: Request | string): Promise<Response | undefined>;
  put(request: Request | string, response: Response): Promise<void>;
  delete(request: Request | string): Promise<boolean>;
}

export interface CacheControl {
  noStore: boolean;
  noCache: boolean;
  isPrivate: boolean;
  maxAge: number | null;
  sMaxAge: number | null;
  staleWhileRevalidate: number | null;
}

export interface StewardOptions {
  /** Cache namespace (Cache API bucket name). */
  cacheName?: string;
  /** Fallback default TTL (seconds) when origin omits Cache-Control. */
  defaultTtlSeconds?: number;
  /** Methods eligible for caching. Default: GET, HEAD. */
  cacheableMethods?: string[];
  /** Status codes eligible for caching. Default: 200, 203, 301, 404, 410. */
  cacheableStatuses?: number[];
  /** Max entries for the in-memory fallback LRU. */
  memoryMaxEntries?: number;
  /** Custom fetcher; defaults to global `fetch`. */
  fetcher?: (request: Request) => Promise<Response>;
  /** Build a cache key from a request (default: method + url). */
  keyBuilder?: (request: Request) => string;
}

interface StoredEntry {
  body: ArrayBuffer;
  status: number;
  statusText: string;
  headers: [string, string][];
  storedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  staleUntil: number; // epoch ms (stale-while-revalidate window end)
}

// ---- Cache-Control parsing -------------------------------------------------

export function parseCacheControl(value: string | null): CacheControl {
  const cc: CacheControl = {
    noStore: false,
    noCache: false,
    isPrivate: false,
    maxAge: null,
    sMaxAge: null,
    staleWhileRevalidate: null,
  };
  if (!value) return cc;
  for (const token of value.split(',')) {
    const [rawKey, rawVal] = token.split('=');
    const key = rawKey.trim().toLowerCase();
    const num = rawVal !== undefined ? parseInt(rawVal.trim(), 10) : NaN;
    switch (key) {
      case 'no-store':
        cc.noStore = true;
        break;
      case 'no-cache':
        cc.noCache = true;
        break;
      case 'private':
        cc.isPrivate = true;
        break;
      case 'max-age':
        if (!Number.isNaN(num)) cc.maxAge = num;
        break;
      case 's-maxage':
        if (!Number.isNaN(num)) cc.sMaxAge = num;
        break;
      case 'stale-while-revalidate':
        if (!Number.isNaN(num)) cc.staleWhileRevalidate = num;
        break;
      default:
        break;
    }
  }
  return cc;
}

// ---- In-memory LRU fallback (used when the Cache API is unavailable) -------

class MemoryLRU {
  private readonly max: number;
  private readonly map = new Map<string, StoredEntry>();

  constructor(max: number) {
    this.max = max;
  }

  get(key: string): StoredEntry | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    // Re-insert to mark as most-recently-used.
    this.map.delete(key);
    this.map.set(key, entry);
    return entry;
  }

  set(key: string, entry: StoredEntry): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, entry);
    while (this.map.size > this.max) {
      const oldest = this.map.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.map.delete(oldest);
    }
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  get size(): number {
    return this.map.size;
  }
}

// ---- The steward -----------------------------------------------------------

export class EdgeCacheSteward {
  private readonly cacheName: string;
  private readonly defaultTtl: number;
  private readonly cacheableMethods: Set<string>;
  private readonly cacheableStatuses: Set<number>;
  private readonly fetcher: (request: Request) => Promise<Response>;
  private readonly keyBuilder: (request: Request) => string;

  private readonly memory: MemoryLRU;
  /** In-flight de-duplication registry: key -> shared Response promise. */
  private readonly inflight = new Map<string, Promise<Response>>();

  readonly metrics = { hits: 0, misses: 0, stale: 0, coalesced: 0, bypass: 0 };

  constructor(options: StewardOptions = {}) {
    this.cacheName = options.cacheName ?? 'edge-static-v1';
    this.defaultTtl = options.defaultTtlSeconds ?? 60;
    this.cacheableMethods = new Set(
      (options.cacheableMethods ?? ['GET', 'HEAD']).map((m) => m.toUpperCase()),
    );
    this.cacheableStatuses = new Set(
      options.cacheableStatuses ?? [200, 203, 301, 404, 410],
    );
    this.memory = new MemoryLRU(options.memoryMaxEntries ?? 500);
    this.fetcher = options.fetcher ?? ((req) => fetch(req));
    this.keyBuilder =
      options.keyBuilder ?? ((req) => `${req.method.toUpperCase()} ${new URL(req.url).toString()}`);
  }

  private hasCacheApi(): boolean {
    return typeof caches !== 'undefined' && caches !== undefined;
  }

  /** Serialize a Response into a storable entry (consumes the body clone). */
  private async toEntry(response: Response, ttlSeconds: number, swr: number): Promise<StoredEntry> {
    const now = Date.now();
    const body = await response.clone().arrayBuffer();
    const headers: [string, string][] = [];
    response.headers.forEach((v, k) => headers.push([k, v]));
    return {
      body,
      status: response.status,
      statusText: response.statusText,
      headers,
      storedAt: now,
      expiresAt: now + ttlSeconds * 1000,
      staleUntil: now + (ttlSeconds + swr) * 1000,
    };
  }

  private fromEntry(entry: StoredEntry, state: 'HIT' | 'STALE'): Response {
    const headers = new Headers(entry.headers);
    const ageSec = Math.max(0, Math.floor((Date.now() - entry.storedAt) / 1000));
    headers.set('Age', String(ageSec));
    headers.set('X-Edge-Cache', state);
    return new Response(entry.body.slice(0), {
      status: entry.status,
      statusText: entry.statusText,
      headers,
    });
  }

  private async readStore(key: string): Promise<StoredEntry | undefined> {
    if (this.hasCacheApi()) {
      const store = await (caches as NonNullable<typeof caches>).open(this.cacheName);
      const cached = await store.match(key);
      if (!cached) return undefined;
      const meta = cached.headers.get('X-Edge-Meta');
      if (!meta) return undefined;
      try {
        const parsed = JSON.parse(meta) as Omit<StoredEntry, 'body'>;
        return { ...parsed, body: await cached.arrayBuffer() };
      } catch {
        return undefined;
      }
    }
    return this.memory.get(key);
  }

  private async writeStore(key: string, entry: StoredEntry): Promise<void> {
    if (this.hasCacheApi()) {
      const store = await (caches as NonNullable<typeof caches>).open(this.cacheName);
      const headers = new Headers(entry.headers);
      const { body, ...meta } = entry;
      void body;
      headers.set('X-Edge-Meta', JSON.stringify(meta));
      await store.put(key, new Response(entry.body.slice(0), {
        status: entry.status,
        statusText: entry.statusText,
        headers,
      }));
      return;
    }
    this.memory.set(key, entry);
  }

  private isCacheableResponse(response: Response, cc: CacheControl): boolean {
    if (cc.noStore || cc.isPrivate) return false;
    if (!this.cacheableStatuses.has(response.status)) return false;
    return true;
  }

  private ttlFor(cc: CacheControl): { ttl: number; swr: number } {
    const ttl = cc.sMaxAge ?? cc.maxAge ?? this.defaultTtl;
    const swr = cc.staleWhileRevalidate ?? 0;
    return { ttl: Math.max(0, ttl), swr: Math.max(0, swr) };
  }

  /**
   * Core entry point. Returns a cached response when fresh, coalesces
   * concurrent misses into a single origin fetch, and supports
   * stale-while-revalidate background refresh.
   */
  async handle(request: Request, fetcher?: (request: Request) => Promise<Response>): Promise<Response> {
    const doFetch = fetcher ?? this.fetcher;
    const method = request.method.toUpperCase();

    // Non-cacheable methods bypass the cache entirely.
    if (!this.cacheableMethods.has(method)) {
      this.metrics.bypass += 1;
      return doFetch(request);
    }

    const key = this.keyBuilder(request);
    const now = Date.now();
    const entry = await this.readStore(key);

    if (entry && now < entry.expiresAt) {
      this.metrics.hits += 1;
      return this.fromEntry(entry, 'HIT');
    }

    if (entry && now < entry.staleUntil) {
      // Serve stale immediately, refresh in the background (best-effort).
      this.metrics.stale += 1;
      this.revalidate(key, request, doFetch).catch(() => undefined);
      return this.fromEntry(entry, 'STALE');
    }

    // True miss — coalesce concurrent origin fetches into one.
    if (this.inflight.has(key)) {
      this.metrics.coalesced += 1;
      const shared = await this.inflight.get(key)!;
      return shared.clone();
    }

    this.metrics.misses += 1;
    const fetchPromise = this.fetchAndStore(key, request, doFetch);
    this.inflight.set(key, fetchPromise);
    try {
      const response = await fetchPromise;
      return response.clone();
    } finally {
      this.inflight.delete(key);
    }
  }

  private async fetchAndStore(
    key: string,
    request: Request,
    doFetch: (request: Request) => Promise<Response>,
  ): Promise<Response> {
    const response = await doFetch(request);
    const cc = parseCacheControl(response.headers.get('Cache-Control'));
    if (this.isCacheableResponse(response, cc)) {
      const { ttl, swr } = this.ttlFor(cc);
      if (ttl > 0 || swr > 0) {
        const entry = await this.toEntry(response, ttl, swr);
        await this.writeStore(key, entry);
        return this.fromEntry(entry, 'HIT');
      }
    }
    // Not cacheable — annotate and pass through.
    const headers = new Headers(response.headers);
    headers.set('X-Edge-Cache', 'BYPASS');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  private async revalidate(
    key: string,
    request: Request,
    doFetch: (request: Request) => Promise<Response>,
  ): Promise<void> {
    if (this.inflight.has(key)) return; // a refresh is already running
    const p = this.fetchAndStore(key, request, doFetch);
    this.inflight.set(key, p);
    try {
      await p;
    } finally {
      this.inflight.delete(key);
    }
  }

  /** Explicitly purge a cached entry (e.g. on content publish). */
  async purge(request: Request | string): Promise<void> {
    const key =
      typeof request === 'string' ? request : this.keyBuilder(request);
    if (this.hasCacheApi()) {
      const store = await (caches as NonNullable<typeof caches>).open(this.cacheName);
      await store.delete(key);
    }
    this.memory.delete(key);
  }

  getMetrics(): Readonly<typeof this.metrics> & { hitRate: number } {
    const total = this.metrics.hits + this.metrics.stale + this.metrics.misses + this.metrics.coalesced;
    return {
      ...this.metrics,
      hitRate: total === 0 ? 0 : (this.metrics.hits + this.metrics.stale) / total,
    };
  }
}

/**
 * Wrap an edge handler so all responses flow through the steward.
 * @example
 *   const steward = new EdgeCacheSteward();
 *   export default { fetch: stewardize(steward, originHandler) };
 */
export function stewardize(
  steward: EdgeCacheSteward,
  originHandler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return (request: Request) => steward.handle(request, originHandler);
}

export default EdgeCacheSteward;
