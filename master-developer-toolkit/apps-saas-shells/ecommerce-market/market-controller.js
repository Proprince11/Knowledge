'use strict';

/**
 * market-controller.js
 * ---------------------------------------------------------------------------
 * Storefront controller for an Express app with:
 *   - Server-side product caching (stale-while-revalidate LRU).
 *   - Session-backed cart storage with optimistic stock reservation.
 *   - Idempotent checkout with a pluggable payment + inventory port.
 *
 * Storage and payment are injected as ports so the same controller runs over
 * memory in dev and Redis/SQL/Stripe in prod. Pure Node.js + Express; no other
 * hard dependencies.
 * ---------------------------------------------------------------------------
 */

const crypto = require('node:crypto');

/** Small LRU with TTL + stale-while-revalidate semantics. */
class SWRCache {
  constructor({ max = 500, ttlMs = 30_000, staleMs = 120_000 } = {}) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.staleMs = staleMs;
    this.map = new Map(); // key -> { value, ts }
    this.inflight = new Map(); // key -> Promise
  }

  _evictIfNeeded() {
    while (this.map.size > this.max) {
      // Map preserves insertion order → first key is the oldest.
      const oldest = this.map.keys().next().value;
      this.map.delete(oldest);
    }
  }

  /** Returns cached value, revalidating in the background when stale. */
  async wrap(key, loader) {
    const now = Date.now();
    const hit = this.map.get(key);
    if (hit) {
      const age = now - hit.ts;
      if (age < this.ttlMs) return hit.value; // fresh
      if (age < this.staleMs) {
        // Serve stale, refresh in background (single-flight).
        if (!this.inflight.has(key)) {
          const p = Promise.resolve()
            .then(loader)
            .then((value) => { this.map.set(key, { value, ts: Date.now() }); this._evictIfNeeded(); return value; })
            .catch(() => {})
            .finally(() => this.inflight.delete(key));
          this.inflight.set(key, p);
        }
        return hit.value;
      }
    }
    // Cold or fully expired: single-flight load.
    if (this.inflight.has(key)) return this.inflight.get(key);
    const p = Promise.resolve()
      .then(loader)
      .then((value) => { this.map.set(key, { value, ts: Date.now() }); this._evictIfNeeded(); return value; })
      .finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }

  invalidate(key) {
    this.map.delete(key);
  }
}

/**
 * @typedef {Object} CatalogPort
 * @property {(id:string)=>Promise<object|null>} getProduct
 * @property {(q:object)=>Promise<{items:object[], total:number}>} listProducts
 * @property {(id:string, qty:number)=>Promise<boolean>} reserveStock
 * @property {(id:string, qty:number)=>Promise<void>} releaseStock
 */

/**
 * @typedef {Object} PaymentPort
 * @property {(args:{amount:number, currency:string, idempotencyKey:string, metadata:object})=>Promise<{id:string, status:string}>} charge
 */

class MarketController {
  /**
   * @param {object} deps
   * @param {CatalogPort} deps.catalog
   * @param {PaymentPort} deps.payment
   * @param {object} [deps.cacheOptions]
   */
  constructor({ catalog, payment, cacheOptions } = {}) {
    if (!catalog || !payment) throw new Error('catalog and payment ports are required');
    this.catalog = catalog;
    this.payment = payment;
    this.cache = new SWRCache(cacheOptions);
    // Idempotency ledger for checkout (key -> result).
    this.orders = new Map();
  }

  /** Express middleware: ensure a cart exists on the session. */
  ensureCart() {
    return (req, _res, next) => {
      req.session = req.session || {};
      if (!req.session.cart) req.session.cart = { items: {}, updatedAt: Date.now() };
      next();
    };
  }

  /** GET /products?cursor=&limit=&category=&q= */
  listProducts() {
    return async (req, res) => {
      const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 24));
      const query = {
        cursor: req.query.cursor || null,
        limit,
        category: req.query.category || null,
        q: (req.query.q || '').trim() || null,
        sort: req.query.sort || 'relevance',
      };
      const key = `list:${JSON.stringify(query)}`;
      try {
        const result = await this.cache.wrap(key, () => this.catalog.listProducts(query));
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
        res.json(result);
      } catch (err) {
        res.status(502).json({ error: 'catalog_unavailable', message: err.message });
      }
    };
  }

  /** GET /products/:id */
  getProduct() {
    return async (req, res) => {
      const id = req.params.id;
      try {
        const product = await this.cache.wrap(`product:${id}`, () => this.catalog.getProduct(id));
        if (!product) return res.status(404).json({ error: 'not_found' });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(product);
      } catch (err) {
        res.status(502).json({ error: 'catalog_unavailable', message: err.message });
      }
    };
  }

  /** POST /cart/items { productId, qty } */
  addToCart() {
    return async (req, res) => {
      const { productId, qty = 1 } = req.body || {};
      const quantity = Math.max(1, Math.min(99, Number(qty) || 1));
      if (!productId) return res.status(400).json({ error: 'productId_required' });

      const product = await this.catalog.getProduct(productId);
      if (!product) return res.status(404).json({ error: 'product_not_found' });

      const reserved = await this.catalog.reserveStock(productId, quantity);
      if (!reserved) return res.status(409).json({ error: 'out_of_stock' });

      const cart = req.session.cart;
      const existing = cart.items[productId];
      cart.items[productId] = {
        productId,
        qty: (existing?.qty || 0) + quantity,
        unitPrice: product.price,
        currency: product.currency || 'USD',
        title: product.title,
      };
      cart.updatedAt = Date.now();
      res.status(201).json(this._summarizeCart(cart));
    };
  }

  /** DELETE /cart/items/:productId */
  removeFromCart() {
    return async (req, res) => {
      const { productId } = req.params;
      const cart = req.session.cart;
      const line = cart.items[productId];
      if (!line) return res.status(404).json({ error: 'not_in_cart' });
      await this.catalog.releaseStock(productId, line.qty).catch(() => {});
      delete cart.items[productId];
      cart.updatedAt = Date.now();
      res.json(this._summarizeCart(cart));
    };
  }

  /** GET /cart */
  viewCart() {
    return (req, res) => res.json(this._summarizeCart(req.session.cart));
  }

  /**
   * POST /checkout
   * Header: Idempotency-Key (required). Re-sending the same key returns the
   * original result instead of double-charging.
   */
  checkout() {
    return async (req, res) => {
      const idemKey = req.get('Idempotency-Key');
      if (!idemKey) return res.status(400).json({ error: 'idempotency_key_required' });
      if (this.orders.has(idemKey)) return res.json(this.orders.get(idemKey));

      const cart = req.session.cart;
      const summary = this._summarizeCart(cart);
      if (summary.itemCount === 0) return res.status(400).json({ error: 'cart_empty' });

      try {
        const charge = await this.payment.charge({
          amount: summary.totalCents,
          currency: summary.currency,
          idempotencyKey: idemKey,
          metadata: { lineItems: summary.lines.length },
        });
        if (charge.status !== 'succeeded') {
          // Payment failed → release every reservation so stock is freed.
          await this._releaseAll(cart);
          return res.status(402).json({ error: 'payment_failed', status: charge.status });
        }

        const order = {
          orderId: crypto.randomUUID(),
          chargeId: charge.id,
          ...summary,
          placedAt: new Date().toISOString(),
        };
        this.orders.set(idemKey, order);
        // Clear cart + invalidate affected product caches.
        for (const pid of Object.keys(cart.items)) this.cache.invalidate(`product:${pid}`);
        req.session.cart = { items: {}, updatedAt: Date.now() };
        res.status(201).json(order);
      } catch (err) {
        await this._releaseAll(cart);
        res.status(500).json({ error: 'checkout_failed', message: err.message });
      }
    };
  }

  async _releaseAll(cart) {
    await Promise.all(
      Object.values(cart.items).map((l) => this.catalog.releaseStock(l.productId, l.qty).catch(() => {})),
    );
  }

  _summarizeCart(cart) {
    const lines = Object.values(cart.items);
    const currency = lines[0]?.currency || 'USD';
    const totalCents = lines.reduce((sum, l) => sum + Math.round(l.unitPrice * 100) * l.qty, 0);
    const itemCount = lines.reduce((n, l) => n + l.qty, 0);
    return {
      lines,
      itemCount,
      currency,
      totalCents,
      total: totalCents / 100,
      updatedAt: cart.updatedAt,
    };
  }

  /** Mounts every route on a provided Express router. */
  mount(router) {
    router.use(this.ensureCart());
    router.get('/products', this.listProducts());
    router.get('/products/:id', this.getProduct());
    router.get('/cart', this.viewCart());
    router.post('/cart/items', this.addToCart());
    router.delete('/cart/items/:productId', this.removeFromCart());
    router.post('/checkout', this.checkout());
    return router;
  }
}

module.exports = { MarketController, SWRCache };
