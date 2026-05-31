'use strict';

/**
 * gateway.js
 * ---------------------------------------------------------------------------
 * High-throughput Express API gateway fronting upstream services with:
 *   - Redis-backed response caching (GET) with stale-while-revalidate.
 *   - Atomic sliding-window rate limiting via a Redis Lua script.
 *   - Circuit breaker per upstream to shed load on failing dependencies.
 *   - Request coalescing (single-flight) so a cache miss stampede hits the
 *     upstream once, not N times.
 *   - Structured access logging + graceful shutdown.
 *
 * Requires: express, ioredis, undici (global fetch on Node >=18 also works).
 * Configuration via environment variables; sane defaults for local dev.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const Redis = require('ioredis');
const crypto = require('node:crypto');
const http = require('node:http');

/* ------------------------------- Config --------------------------------- */

const CONFIG = {
  port: Number(process.env.GATEWAY_PORT || 8080),
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  cacheTtlSec: Number(process.env.CACHE_TTL_SEC || 30),
  staleTtlSec: Number(process.env.STALE_TTL_SEC || 120),
  rateLimit: {
    windowMs: Number(process.env.RL_WINDOW_MS || 60_000),
    max: Number(process.env.RL_MAX || 120),
  },
  breaker: {
    failureThreshold: Number(process.env.CB_FAILS || 5),
    cooldownMs: Number(process.env.CB_COOLDOWN_MS || 10_000),
  },
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 8000),
};

/* ----------------------- Sliding-window limiter ------------------------- */

// Atomic: trims the window, counts, and conditionally adds the request in a
// single round-trip so concurrent requests cannot race past the limit.
const RATE_LIMIT_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max = tonumber(ARGV[3])
local member = ARGV[4]
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count < max then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)
  return {1, max - count - 1}
else
  return {0, 0}
end
`;

/* ---------------------------- Circuit breaker --------------------------- */

class CircuitBreaker {
  constructor({ failureThreshold, cooldownMs }) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.state = 'closed'; // closed | open | half-open
    this.failures = 0;
    this.openedAt = 0;
  }

  canRequest() {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt >= this.cooldownMs) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    return true;
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  onFailure() {
    this.failures++;
    if (this.state === 'half-open' || this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }
}

/* ------------------------------- Gateway -------------------------------- */

class ApiGateway {
  /**
   * @param {object} opts
   * @param {Record<string,string>} opts.routes  prefix -> upstream base URL.
   * @param {Redis} [opts.redis]
   */
  constructor({ routes, redis } = {}) {
    if (!routes || Object.keys(routes).length === 0) throw new Error('routes map required');
    this.routes = routes;
    this.redis = redis || new Redis(CONFIG.redisUrl, { maxRetriesPerRequest: 2, enableAutoPipelining: true });
    this.breakers = new Map();
    this.inflight = new Map(); // cacheKey -> Promise (request coalescing)
    this.app = express();
    this._wire();
  }

  _breakerFor(prefix) {
    if (!this.breakers.has(prefix)) this.breakers.set(prefix, new CircuitBreaker(CONFIG.breaker));
    return this.breakers.get(prefix);
  }

  _wire() {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '1mb' }));

    // Access log + latency header.
    this.app.use((req, res, next) => {
      const start = process.hrtime.bigint();
      res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({
          ts: new Date().toISOString(), method: req.method, path: req.path,
          status: res.statusCode, ms: Number(ms.toFixed(1)), ip: req.ip,
        }));
      });
      next();
    });

    this.app.use(this._rateLimit());
    this.app.get('/healthz', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));
    this.app.use(this._proxy());
  }

  _clientKey(req) {
    // Prefer an authenticated principal; fall back to IP.
    return req.get('x-api-key') || req.ip || 'anonymous';
  }

  _rateLimit() {
    return async (req, res, next) => {
      const key = `rl:${this._clientKey(req)}`;
      try {
        const [allowed, remaining] = await this.redis.eval(
          RATE_LIMIT_LUA, 1, key,
          Date.now(), CONFIG.rateLimit.windowMs, CONFIG.rateLimit.max, crypto.randomUUID(),
        );
        res.set('X-RateLimit-Limit', String(CONFIG.rateLimit.max));
        res.set('X-RateLimit-Remaining', String(Math.max(0, remaining)));
        if (allowed === 0) {
          res.set('Retry-After', String(Math.ceil(CONFIG.rateLimit.windowMs / 1000)));
          return res.status(429).json({ error: 'rate_limited' });
        }
        next();
      } catch {
        // Fail-open on limiter errors so Redis hiccups don't take down the API.
        next();
      }
    };
  }

  _resolveUpstream(path) {
    for (const [prefix, base] of Object.entries(this.routes)) {
      if (path === prefix || path.startsWith(prefix + '/')) {
        return { prefix, base, rest: path.slice(prefix.length) || '/' };
      }
    }
    return null;
  }

  _proxy() {
    return async (req, res) => {
      const route = this._resolveUpstream(req.path);
      if (!route) return res.status(404).json({ error: 'no_route' });

      const breaker = this._breakerFor(route.prefix);
      if (!breaker.canRequest()) return res.status(503).json({ error: 'upstream_unavailable' });

      const cacheable = req.method === 'GET';
      const cacheKey = cacheable
        ? `cache:${crypto.createHash('sha1').update(req.method + req.originalUrl).digest('hex')}`
        : null;

      // Serve from cache with stale-while-revalidate.
      if (cacheKey) {
        const cached = await this.redis.get(cacheKey).catch(() => null);
        if (cached) {
          const env = JSON.parse(cached);
          const age = (Date.now() - env.storedAt) / 1000;
          res.set('X-Cache', age < CONFIG.cacheTtlSec ? 'HIT' : 'STALE');
          res.set('Content-Type', env.contentType || 'application/json');
          if (age >= CONFIG.cacheTtlSec) this._revalidate(cacheKey, route, req).catch(() => {});
          return res.status(env.status).send(Buffer.from(env.body, 'base64'));
        }
      }

      try {
        const env = await this._fetchUpstream(cacheKey, route, req);
        breaker.onSuccess();
        if (cacheKey && env.status < 500) {
          await this.redis.set(cacheKey, JSON.stringify(env), 'PX', CONFIG.staleTtlSec * 1000).catch(() => {});
        }
        res.set('X-Cache', 'MISS');
        res.set('Content-Type', env.contentType || 'application/json');
        res.status(env.status).send(Buffer.from(env.body, 'base64'));
      } catch (err) {
        breaker.onFailure();
        res.status(502).json({ error: 'bad_gateway', message: err.message });
      }
    };
  }

  /** Single-flight upstream fetch keyed by cacheKey to prevent stampedes. */
  _fetchUpstream(cacheKey, route, req) {
    const key = cacheKey || crypto.randomUUID();
    if (this.inflight.has(key)) return this.inflight.get(key);

    const promise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONFIG.upstreamTimeoutMs);
      try {
        const target = route.base.replace(/\/$/, '') + route.rest +
          (req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '');
        const headers = { ...req.headers };
        delete headers.host;
        delete headers['content-length'];
        const resp = await fetch(target, {
          method: req.method,
          headers,
          body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
          signal: controller.signal,
        });
        const buf = Buffer.from(await resp.arrayBuffer());
        return {
          status: resp.status,
          contentType: resp.headers.get('content-type') || 'application/json',
          body: buf.toString('base64'),
          storedAt: Date.now(),
        };
      } finally {
        clearTimeout(timer);
        this.inflight.delete(key);
      }
    })();

    this.inflight.set(key, promise);
    return promise;
  }

  async _revalidate(cacheKey, route, req) {
    const env = await this._fetchUpstream(cacheKey, route, req);
    if (env.status < 500) {
      await this.redis.set(cacheKey, JSON.stringify(env), 'PX', CONFIG.staleTtlSec * 1000).catch(() => {});
    }
  }

  listen(port = CONFIG.port) {
    this.server = http.createServer(this.app);
    this.server.listen(port, () => console.log(`[gateway] listening on :${port}`));
    this._installShutdown();
    return this.server;
  }

  _installShutdown() {
    const shutdown = async (sig) => {
      console.log(`[gateway] ${sig} received, draining...`);
      this.server?.close(async () => {
        await this.redis.quit().catch(() => {});
        process.exit(0);
      });
      // Force exit if connections don't drain in time.
      setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

/* ------------------------------ Bootstrap ------------------------------- */

if (require.main === module) {
  const routes = {
    '/api/market': process.env.UPSTREAM_MARKET || 'http://market:3001',
    '/api/chat': process.env.UPSTREAM_CHAT || 'http://chat:3002',
    '/api/cms': process.env.UPSTREAM_CMS || 'http://cms:3003',
    '/api/analytics': process.env.UPSTREAM_ANALYTICS || 'http://analytics:3004',
  };
  new ApiGateway({ routes }).listen();
}

module.exports = { ApiGateway, CircuitBreaker, CONFIG };
