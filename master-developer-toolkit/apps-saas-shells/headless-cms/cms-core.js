'use strict';

/**
 * cms-core.js
 * ---------------------------------------------------------------------------
 * Headless CMS core: schema registry, content validation, versioned content
 * store, query engine, and scoped API-key authentication.
 *
 * Highlights:
 *   - Declarative content types with typed fields, validation, and references.
 *   - Draft → published lifecycle with immutable version history.
 *   - Query engine supporting filter / sort / pagination / field projection.
 *   - API keys scoped to (contentType, action) with constant-time comparison.
 *
 * Pure Node.js. Persistence injected via a ContentStore port.
 * ---------------------------------------------------------------------------
 */

const crypto = require('node:crypto');

/* ----------------------------- Field types ----------------------------- */

const FIELD_VALIDATORS = {
  string: (v, f) => {
    if (typeof v !== 'string') return 'must be a string';
    if (f.minLength != null && v.length < f.minLength) return `min length ${f.minLength}`;
    if (f.maxLength != null && v.length > f.maxLength) return `max length ${f.maxLength}`;
    if (f.pattern && !new RegExp(f.pattern).test(v)) return `does not match ${f.pattern}`;
    return null;
  },
  number: (v, f) => {
    if (typeof v !== 'number' || Number.isNaN(v)) return 'must be a number';
    if (f.min != null && v < f.min) return `min ${f.min}`;
    if (f.max != null && v > f.max) return `max ${f.max}`;
    return null;
  },
  boolean: (v) => (typeof v !== 'boolean' ? 'must be a boolean' : null),
  datetime: (v) => (Number.isNaN(Date.parse(v)) ? 'must be an ISO datetime' : null),
  enum: (v, f) => (f.values?.includes(v) ? null : `must be one of ${JSON.stringify(f.values)}`),
  richtext: (v) => (typeof v !== 'string' ? 'must be a string' : null),
  json: (v) => (typeof v === 'object' && v !== null ? null : 'must be an object'),
  reference: (v) => (typeof v === 'string' && v.length > 0 ? null : 'must be a content id'),
  array: (v, f, ctx) => {
    if (!Array.isArray(v)) return 'must be an array';
    if (f.of) {
      for (let i = 0; i < v.length; i++) {
        const err = validateField(f.of, v[i], ctx);
        if (err) return `[${i}] ${err}`;
      }
    }
    return null;
  },
};

function validateField(fieldDef, value, ctx) {
  if (value == null) {
    return fieldDef.required ? 'is required' : null;
  }
  const validator = FIELD_VALIDATORS[fieldDef.type];
  if (!validator) return `unknown field type "${fieldDef.type}"`;
  return validator(value, fieldDef, ctx);
}

/* ---------------------------- Content store ----------------------------- */

class MemoryContentStore {
  constructor() {
    this.docs = new Map(); // id -> doc
    this.versions = new Map(); // id -> [versions]
  }
  async get(id) { return this.docs.get(id) ?? null; }
  async put(doc) {
    this.docs.set(doc.id, doc);
    const history = this.versions.get(doc.id) ?? [];
    history.push(structuredClone(doc));
    this.versions.set(doc.id, history);
  }
  async delete(id) { return this.docs.delete(id); }
  async list(type) {
    const out = [];
    for (const d of this.docs.values()) if (!type || d.type === type) out.push(d);
    return out;
  }
  async history(id) { return this.versions.get(id) ?? []; }
}

/* ------------------------------ API keys -------------------------------- */

class ApiKeyRegistry {
  constructor() { this.keys = new Map(); } // hash -> { id, scopes:Set, label }

  /** Issues a key; returns the plaintext ONCE (store only the hash). */
  issue({ label, scopes }) {
    const plaintext = 'cms_' + crypto.randomBytes(24).toString('base64url');
    const hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    this.keys.set(hash, { id: crypto.randomUUID(), label, scopes: new Set(scopes) });
    return plaintext;
  }

  /** Returns the key record if valid, else null. Constant-time match. */
  resolve(plaintext) {
    if (typeof plaintext !== 'string') return null;
    const hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    // Iterate with timing-safe compare to avoid leaking which key matched.
    const target = Buffer.from(hash);
    for (const [h, rec] of this.keys) {
      const candidate = Buffer.from(h);
      if (candidate.length === target.length && crypto.timingSafeEqual(candidate, target)) return rec;
    }
    return null;
  }

  authorize(plaintext, action, type) {
    const rec = this.resolve(plaintext);
    if (!rec) return false;
    return rec.scopes.has('*') || rec.scopes.has(`${action}:*`) || rec.scopes.has(`${action}:${type}`);
  }
}

/* ------------------------------ CMS core -------------------------------- */

class CMSError extends Error {
  constructor(message, code) { super(message); this.name = 'CMSError'; this.code = code; }
}

class CMSCore {
  constructor({ store = new MemoryContentStore(), keys = new ApiKeyRegistry() } = {}) {
    this.store = store;
    this.keys = keys;
    this.types = new Map(); // typeName -> { fields }
  }

  /** Registers a content type schema. */
  defineType(name, schema) {
    if (this.types.has(name)) throw new CMSError(`type "${name}" already defined`, 'DUP_TYPE');
    if (!schema?.fields || typeof schema.fields !== 'object') {
      throw new CMSError('schema.fields is required', 'BAD_SCHEMA');
    }
    this.types.set(name, { fields: schema.fields });
    return this;
  }

  _typeOrThrow(name) {
    const t = this.types.get(name);
    if (!t) throw new CMSError(`unknown content type "${name}"`, 'NO_TYPE');
    return t;
  }

  /** Validates a payload against a type, returning field errors (or null). */
  validate(typeName, data) {
    const type = this._typeOrThrow(typeName);
    const errors = {};
    for (const [field, def] of Object.entries(type.fields)) {
      const err = validateField(def, data[field], { cms: this });
      if (err) errors[field] = err;
    }
    // Reject unknown fields to keep content clean.
    for (const key of Object.keys(data)) {
      if (!(key in type.fields)) errors[key] = 'unknown field';
    }
    return Object.keys(errors).length ? errors : null;
  }

  /** Creates a draft content document. */
  async create(typeName, data, { apiKey } = {}) {
    this._authorize(apiKey, 'write', typeName);
    const errors = this.validate(typeName, data);
    if (errors) throw new CMSError('validation failed', 'VALIDATION', errors);
    const now = new Date().toISOString();
    const doc = {
      id: crypto.randomUUID(),
      type: typeName,
      status: 'draft',
      version: 1,
      data,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };
    await this.store.put(doc);
    return doc;
  }

  /** Updates content, bumping version and preserving history. */
  async update(id, patch, { apiKey } = {}) {
    const existing = await this.store.get(id);
    if (!existing) throw new CMSError(`content ${id} not found`, 'NOT_FOUND');
    this._authorize(apiKey, 'write', existing.type);
    const data = { ...existing.data, ...patch };
    const errors = this.validate(existing.type, data);
    if (errors) throw new CMSError('validation failed', 'VALIDATION', errors);
    const doc = { ...existing, data, version: existing.version + 1, updatedAt: new Date().toISOString() };
    await this.store.put(doc);
    return doc;
  }

  /** Publishes a draft, making it queryable by read keys. */
  async publish(id, { apiKey } = {}) {
    const existing = await this.store.get(id);
    if (!existing) throw new CMSError(`content ${id} not found`, 'NOT_FOUND');
    this._authorize(apiKey, 'publish', existing.type);
    const doc = { ...existing, status: 'published', publishedAt: new Date().toISOString(), version: existing.version + 1 };
    await this.store.put(doc);
    return doc;
  }

  async getById(id, { apiKey, includeDrafts = false } = {}) {
    const doc = await this.store.get(id);
    if (!doc) return null;
    this._authorize(apiKey, 'read', doc.type);
    if (doc.status !== 'published' && !includeDrafts) return null;
    return doc;
  }

  /**
   * Query engine. Example:
   *   query('article', { filter:{ 'data.featured': true }, sort:'-publishedAt',
   *                       limit:10, fields:['data.title'] })
   */
  async query(typeName, { filter = {}, sort, limit = 20, offset = 0, fields, apiKey, includeDrafts = false } = {}) {
    this._authorize(apiKey, 'read', typeName);
    this._typeOrThrow(typeName);
    let docs = await this.store.list(typeName);
    if (!includeDrafts) docs = docs.filter((d) => d.status === 'published');

    // Filtering: supports dotted paths + simple operators ($gt,$lt,$in,$ne).
    docs = docs.filter((d) => Object.entries(filter).every(([path, cond]) => matchCond(getPath(d, path), cond)));

    // Sorting: '-field' descending, 'field' ascending.
    if (sort) {
      const desc = sort.startsWith('-');
      const key = desc ? sort.slice(1) : sort;
      docs.sort((a, b) => {
        const av = getPath(a, key);
        const bv = getPath(b, key);
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return desc ? -cmp : cmp;
      });
    }

    const total = docs.length;
    let page = docs.slice(offset, offset + limit);
    if (Array.isArray(fields) && fields.length) page = page.map((d) => project(d, fields));

    return { items: page, total, limit, offset };
  }

  async delete(id, { apiKey } = {}) {
    const existing = await this.store.get(id);
    if (!existing) return false;
    this._authorize(apiKey, 'write', existing.type);
    return this.store.delete(id);
  }

  _authorize(apiKey, action, type) {
    if (!this.keys.authorize(apiKey, action, type)) {
      throw new CMSError(`api key not authorized for ${action}:${type}`, 'FORBIDDEN');
    }
  }
}

/* ---------------------------- query helpers ----------------------------- */

function getPath(obj, path) {
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function matchCond(value, cond) {
  if (cond !== null && typeof cond === 'object' && !Array.isArray(cond)) {
    return Object.entries(cond).every(([op, operand]) => {
      switch (op) {
        case '$gt': return value > operand;
        case '$gte': return value >= operand;
        case '$lt': return value < operand;
        case '$lte': return value <= operand;
        case '$ne': return value !== operand;
        case '$in': return Array.isArray(operand) && operand.includes(value);
        case '$contains': return typeof value === 'string' && value.includes(operand);
        default: return false;
      }
    });
  }
  return value === cond;
}

function project(doc, fields) {
  const out = { id: doc.id, type: doc.type, status: doc.status };
  for (const f of fields) {
    const v = getPath(doc, f);
    if (v !== undefined) setPath(out, f, v);
  }
  return out;
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

module.exports = { CMSCore, MemoryContentStore, ApiKeyRegistry, CMSError, validateField };
