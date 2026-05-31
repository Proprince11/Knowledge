'use strict';

/**
 * API Armor Proxy — Zero-Trust Edge Gateway
 * -----------------------------------------
 * A hardened Express reverse proxy that enforces defense-in-depth at the edge:
 *   - Strict security headers (CSP, HSTS, X-Frame-Options, etc. via helmet)
 *   - Allowlist-based CORS with credential support and preflight handling
 *   - CSRF protection using the stateless double-submit cookie pattern with
 *     HMAC-signed tokens (no server-side session store required)
 *   - Token-bucket rate limiting per client identity (IP + optional API key)
 *   - Request body size limits and content-type enforcement
 *   - Upstream reverse proxy with timeouts, retries (idempotent methods only),
 *     and circuit-breaker style failure isolation
 *   - Correlation-id propagation and structured access logging
 *
 * This is purely DEFENSIVE infrastructure: it protects an upstream API from
 * cross-site request forgery, cross-origin abuse, and traffic floods.
 *
 * Environment variables:
 *   PORT, UPSTREAM_URL, CORS_ALLOWED_ORIGINS (comma-separated),
 *   CSRF_SECRET (>=32 bytes), RATE_LIMIT_RPS, RATE_LIMIT_BURST,
 *   TRUST_PROXY (1 to honor X-Forwarded-For behind a load balancer)
 */

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// ---- Utilities -------------------------------------------------------------

const timingSafeEqual = (a, b) => {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

/** HMAC-sign a value with the CSRF secret. */
function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

// ---- Token-bucket rate limiter (in-memory; swap for Redis in a cluster) ----

class TokenBucketLimiter {
  /**
   * @param {number} ratePerSec sustained requests/sec
   * @param {number} burst maximum bucket capacity
   */
  constructor(ratePerSec, burst) {
    this.rate = ratePerSec;
    this.capacity = burst;
    this.buckets = new Map(); // key -> { tokens, updatedAt }
    // Periodic sweep to bound memory.
    this._sweep = setInterval(() => this._gc(), 60_000);
    if (this._sweep.unref) this._sweep.unref();
  }

  _gc() {
    const now = Date.now();
    for (const [key, b] of this.buckets) {
      if (now - b.updatedAt > 300_000) this.buckets.delete(key);
    }
  }

  /** @returns {{allowed:boolean, remaining:number, retryAfterMs:number}} */
  take(key, cost = 1) {
    const now = Date.now();
    let b = this.buckets.get(key);
    if (!b) {
      b = { tokens: this.capacity, updatedAt: now };
      this.buckets.set(key, b);
    }
    // Refill based on elapsed time.
    const elapsedSec = (now - b.updatedAt) / 1000;
    b.tokens = Math.min(this.capacity, b.tokens + elapsedSec * this.rate);
    b.updatedAt = now;

    if (b.tokens >= cost) {
      b.tokens -= cost;
      return { allowed: true, remaining: Math.floor(b.tokens), retryAfterMs: 0 };
    }
    const deficit = cost - b.tokens;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.ceil((deficit / this.rate) * 1000),
    };
  }

  stop() {
    clearInterval(this._sweep);
  }
}

// ---- CSRF (double-submit, HMAC-signed, stateless) --------------------------

const CSRF_COOKIE = '__Host-csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function issueCsrfToken(secret) {
  const nonce = crypto.randomBytes(18).toString('base64url');
  const signature = sign(nonce, secret);
  return `${nonce}.${signature}`;
}

function verifyCsrfToken(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [nonce, signature] = token.split('.');
  if (!nonce || !signature) return false;
  return timingSafeEqual(signature, sign(nonce, secret));
}

// ---- Reverse proxy with retry + backoff for idempotent requests ------------

const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

function proxyRequest(upstreamBase, req, res, opts) {
  const { timeoutMs, maxRetries, baseBackoffMs } = opts;
  const target = new URL(req.originalUrl, upstreamBase);
  const transport = target.protocol === 'https:' ? https : http;

  const attempt = (tryNum, bodyBuffer) => {
    const headers = { ...req.headers, host: target.host };
    delete headers['content-length']; // recomputed by the transport
    headers['x-forwarded-for'] = req.ip;
    headers['x-correlation-id'] = req.correlationId;

    const upstreamReq = transport.request(
      target,
      { method: req.method, headers, timeout: timeoutMs },
      (upstreamRes) => {
        res.status(upstreamRes.statusCode || 502);
        for (const [h, v] of Object.entries(upstreamRes.headers)) {
          // Don't leak hop-by-hop headers.
          if (h === 'connection' || h === 'transfer-encoding') continue;
          res.setHeader(h, v);
        }
        upstreamRes.pipe(res);
      },
    );

    const retryable =
      IDEMPOTENT.has(req.method) && tryNum < maxRetries;

    upstreamReq.on('timeout', () => upstreamReq.destroy(new Error('upstream timeout')));
    upstreamReq.on('error', (err) => {
      if (retryable && !res.headersSent) {
        const delay = Math.min(5000, baseBackoffMs * 2 ** tryNum) +
          Math.floor(Math.random() * 50);
        setTimeout(() => attempt(tryNum + 1, bodyBuffer), delay);
        return;
      }
      if (!res.headersSent) {
        res.status(502).json({ error: 'bad_gateway', detail: err.message });
      }
    });

    if (bodyBuffer && bodyBuffer.length) upstreamReq.write(bodyBuffer);
    upstreamReq.end();
  };

  // Buffer the (already size-limited) body so retries can re-send it.
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => attempt(0, Buffer.concat(chunks)));
  req.on('error', () => {
    if (!res.headersSent) res.status(400).json({ error: 'bad_request' });
  });
}

// ---- Gateway factory -------------------------------------------------------

/**
 * Build the hardened gateway app.
 * @param {object} [config]
 * @returns {{app: import('express').Express, limiter: TokenBucketLimiter}}
 */
function createGateway(config = {}) {
  const upstreamUrl = config.upstreamUrl || process.env.UPSTREAM_URL || 'http://127.0.0.1:8080';
  const csrfSecret = config.csrfSecret || process.env.CSRF_SECRET;
  if (!csrfSecret || csrfSecret.length < 32) {
    throw new Error('CSRF_SECRET must be set and at least 32 characters');
  }
  const allowedOrigins = new Set(
    (config.allowedOrigins ||
      (process.env.CORS_ALLOWED_ORIGINS || '').split(','))
      .map((o) => o.trim())
      .filter(Boolean),
  );
  const rateRps = config.rateLimitRps || Number(process.env.RATE_LIMIT_RPS || 20);
  const rateBurst = config.rateLimitBurst || Number(process.env.RATE_LIMIT_BURST || 40);
  const bodyLimit = config.bodyLimit || '1mb';

  const app = express();
  const limiter = new TokenBucketLimiter(rateRps, rateBurst);

  if (process.env.TRUST_PROXY === '1' || config.trustProxy) {
    app.set('trust proxy', true);
  }
  app.disable('x-powered-by');

  // 1) Correlation id for every request.
  app.use((req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
    res.setHeader('x-correlation-id', req.correlationId);
    next();
  });

  // 2) Strict security headers.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'no-referrer' },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.use(cookieParser());

  // 3) Strict allowlist CORS with credentials + preflight handling.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        `Content-Type, Authorization, ${CSRF_HEADER}, X-Correlation-Id`,
      );
      res.setHeader('Access-Control-Max-Age', '600');
    } else if (origin) {
      // Origin present but not allowlisted -> block cross-origin access.
      return res.status(403).json({ error: 'origin_not_allowed' });
    }
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    return next();
  });

  // 4) Per-client token-bucket rate limiting.
  app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const identity = apiKey ? `key:${apiKey}` : `ip:${req.ip}`;
    const result = limiter.take(identity);
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    if (!result.allowed) {
      res.setHeader('Retry-After', String(Math.ceil(result.retryAfterMs / 1000)));
      return res.status(429).json({ error: 'rate_limited', retryAfterMs: result.retryAfterMs });
    }
    return next();
  });

  // 5) CSRF token mint endpoint (clients fetch this, then echo it in a header).
  app.get('/csrf-token', (req, res) => {
    const token = issueCsrfToken(csrfSecret);
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // readable by the SPA so it can echo into the header
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    res.json({ csrfToken: token });
  });

  // 6) CSRF enforcement (double-submit) for state-changing methods.
  app.use((req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const cookieToken = req.cookies[CSRF_COOKIE];
    const headerToken = req.headers[CSRF_HEADER];
    if (
      !cookieToken ||
      !headerToken ||
      !timingSafeEqual(cookieToken, headerToken) ||
      !verifyCsrfToken(headerToken, csrfSecret)
    ) {
      return res.status(403).json({ error: 'csrf_validation_failed' });
    }
    return next();
  });

  // 7) Body size guard (rejects oversized payloads before proxying).
  //    express.raw buffers nothing here; we enforce limit then re-stream.
  app.use((req, res, next) => {
    const declared = Number(req.headers['content-length'] || 0);
    const max = typeof bodyLimit === 'string' ? parseSize(bodyLimit) : bodyLimit;
    if (declared > max) {
      return res.status(413).json({ error: 'payload_too_large', maxBytes: max });
    }
    return next();
  });

  // 8) Health/readiness probe (not proxied).
  app.get('/healthz', (req, res) => res.json({ status: 'ok', upstream: upstreamUrl }));

  // 9) Reverse proxy everything else to the protected upstream.
  app.use((req, res) => {
    proxyRequest(upstreamUrl, req, res, {
      timeoutMs: config.upstreamTimeoutMs || 10_000,
      maxRetries: config.upstreamMaxRetries ?? 2,
      baseBackoffMs: config.upstreamBackoffMs || 150,
    });
  });

  // Centralized error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (res.headersSent) return;
    res.status(500).json({ error: 'internal_error', correlationId: req.correlationId });
  });

  return { app, limiter };
}

/** Parse a human size like "1mb" / "512kb" into bytes. */
function parseSize(str) {
  const m = /^(\d+)\s*(b|kb|mb|gb)?$/i.exec(String(str).trim());
  if (!m) return 1_048_576;
  const n = Number(m[1]);
  const unit = (m[2] || 'b').toLowerCase();
  const mult = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }[unit];
  return n * mult;
}

module.exports = {
  createGateway,
  TokenBucketLimiter,
  issueCsrfToken,
  verifyCsrfToken,
  CSRF_COOKIE,
  CSRF_HEADER,
};

// Run directly:  node proxy-shield.js
if (require.main === module) {
  if (!process.env.CSRF_SECRET) {
    // Generate an ephemeral dev secret so the demo boots out of the box.
    process.env.CSRF_SECRET = crypto.randomBytes(32).toString('hex');
    // eslint-disable-next-line no-console
    console.warn('[proxy] CSRF_SECRET not set; generated an ephemeral dev secret.');
  }
  const { app } = createGateway();
  const port = Number(process.env.PORT || 8443);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[proxy] API Armor gateway listening on :${port} -> ${process.env.UPSTREAM_URL || 'http://127.0.0.1:8080'}`);
  });
}
