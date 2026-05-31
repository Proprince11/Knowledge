'use strict';

/**
 * sync-server.js
 * ---------------------------------------------------------------------------
 * Real-time collaborative document server backed by WebSockets.
 *
 * Implements a compact Operational Transformation (OT) engine for plain-text
 * documents so concurrent edits converge deterministically. Tracks per-doc
 * revision history, transforms incoming ops against the server log, rebroadcasts
 * the canonical op, and maintains live presence + cursor positions.
 *
 * OT model: operations are arrays of components — retain(n) | insert(str) |
 * delete(n) — applied left-to-right over the document string. This is the same
 * primitive used by shareDB/ot.js, implemented from scratch here.
 *
 * Server: `ws` (Node). Persistence is injected via a DocStore port.
 * ---------------------------------------------------------------------------
 */

const { WebSocketServer } = require('ws');
const { EventEmitter } = require('node:events');
const crypto = require('node:crypto');

/* --------------------------- OT primitives ------------------------------ */

/** A component is: {r:n} retain | {i:str} insert | {d:n} delete. */
const Op = {
  apply(doc, op) {
    let out = '';
    let cursor = 0;
    for (const c of op) {
      if (c.r != null) {
        if (cursor + c.r > doc.length) throw new Error('retain past end of doc');
        out += doc.slice(cursor, cursor + c.r);
        cursor += c.r;
      } else if (c.i != null) {
        out += c.i;
      } else if (c.d != null) {
        cursor += c.d; // skip deleted region
      }
    }
    out += doc.slice(cursor);
    return out;
  },

  /**
   * Transforms op `a` against concurrent op `b`, returning a' such that
   * applying b then a' equals applying a then b'. `priority` ('left'/'right')
   * breaks insert ties deterministically.
   */
  transform(a, b, priority) {
    const out = [];
    let ia = 0;
    let ib = 0;
    let ca = a[ia];
    let cb = b[ib];
    const next = (arr, i) => [arr[i + 1], i + 1];

    while (ca || cb) {
      // Insert in `a` is kept; if both insert at same spot, priority decides.
      if (ca && ca.i != null) {
        if (cb && cb.i != null && priority === 'right') {
          out.push({ r: cb.i.length });
          [cb, ib] = next(b, ib);
          continue;
        }
        out.push({ i: ca.i });
        [ca, ia] = next(a, ia);
        continue;
      }
      if (cb && cb.i != null) {
        out.push({ r: cb.i.length });
        [cb, ib] = next(b, ib);
        continue;
      }
      if (!ca) break;
      if (!cb) { out.push(ca); [ca, ia] = next(a, ia); continue; }

      const la = ca.r != null ? ca.r : ca.d;
      const lb = cb.r != null ? cb.r : cb.d;
      const min = Math.min(la, lb);

      if (ca.r != null && cb.r != null) {
        out.push({ r: min });
      } else if (ca.d != null && cb.d != null) {
        // Both delete the same region → already gone; emit nothing.
      } else if (ca.d != null && cb.r != null) {
        out.push({ d: min });
      } else if (ca.r != null && cb.d != null) {
        // b deleted what a wanted to retain → drop it.
      }

      // Advance whichever component is exhausted.
      if (la === lb) { [ca, ia] = next(a, ia); [cb, ib] = next(b, ib); }
      else if (la < lb) {
        [ca, ia] = next(a, ia);
        cb = cb.r != null ? { r: lb - min } : { d: lb - min };
      } else {
        [cb, ib] = next(b, ib);
        ca = ca.r != null ? { r: la - min } : ca.d != null ? { d: la - min } : { i: ca.i };
      }
    }
    return out.filter((c) => !(c.r === 0 || c.d === 0 || c.i === ''));
  },

  /** Validates that an op's spans are consistent with a doc length. */
  baseLength(op) {
    let n = 0;
    for (const c of op) { if (c.r != null) n += c.r; else if (c.d != null) n += c.d; }
    return n;
  },
};

/* ----------------------------- Doc store -------------------------------- */

class MemoryDocStore {
  constructor() { this.docs = new Map(); }
  async load(docId) {
    return this.docs.get(docId) ?? { content: '', revision: 0, history: [] };
  }
  async save(docId, state) { this.docs.set(docId, state); }
}

/* ---------------------------- Sync server ------------------------------- */

class SyncServer extends EventEmitter {
  constructor({ port, store = new MemoryDocStore(), authenticate } = {}) {
    super();
    this.store = store;
    this.authenticate = authenticate ?? (async (t) => (t ? { userId: t } : null));
    this.rooms = new Map(); // docId -> { state, clients:Map<ws,member> }
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', (ws, req) => this._onConnection(ws, req));
  }

  async _onConnection(ws, req) {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    const docId = url.searchParams.get('doc');
    const principal = await this.authenticate(token).catch(() => null);
    if (!principal || !docId) return ws.close(4401, 'unauthorized or missing doc');

    const room = await this._getRoom(docId);
    const member = {
      userId: principal.userId,
      color: this._colorFor(principal.userId),
      cursor: 0,
      ws,
    };
    room.clients.set(ws, member);

    // Send initial snapshot.
    this._send(ws, {
      type: 'init',
      docId,
      content: room.state.content,
      revision: room.state.revision,
      members: [...room.clients.values()].map((m) => ({ userId: m.userId, color: m.color, cursor: m.cursor })),
    });
    this._broadcast(room, { type: 'presence-join', userId: member.userId, color: member.color }, ws);

    ws.on('message', (raw) => this._onMessage(room, ws, raw));
    ws.on('close', () => this._onClose(room, ws));
    ws.on('error', () => this._onClose(room, ws));
  }

  async _getRoom(docId) {
    let room = this.rooms.get(docId);
    if (!room) {
      const state = await this.store.load(docId);
      room = { docId, state, clients: new Map() };
      this.rooms.set(docId, room);
    }
    return room;
  }

  async _onMessage(room, ws, raw) {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    const member = room.clients.get(ws);
    if (!member) return;

    if (msg.type === 'op') return this._handleOp(room, ws, member, msg);
    if (msg.type === 'cursor') {
      member.cursor = Number(msg.position) || 0;
      return this._broadcast(room, { type: 'cursor', userId: member.userId, position: member.cursor }, ws);
    }
  }

  /**
   * Receives a client op stamped with the revision it was authored against,
   * transforms it forward over every op committed since, applies + persists,
   * then broadcasts the canonical transformed op.
   */
  async _handleOp(room, ws, member, msg) {
    const { revision, op } = msg;
    if (!Array.isArray(op)) return this._send(ws, { type: 'error', message: 'op must be an array' });
    if (revision > room.state.revision || revision < 0) {
      return this._send(ws, { type: 'error', message: 'revision out of range; resync required' });
    }

    let transformed = op;
    try {
      // Transform against all concurrent ops the client hadn't seen.
      for (let r = revision; r < room.state.revision; r++) {
        const concurrent = room.state.history[r];
        transformed = Op.transform(transformed, concurrent, 'left');
      }
      if (Op.baseLength(transformed) !== room.state.content.length) {
        return this._send(ws, { type: 'error', message: 'op base length mismatch; resync required' });
      }
      room.state.content = Op.apply(room.state.content, transformed);
    } catch (err) {
      return this._send(ws, { type: 'error', message: `apply failed: ${err.message}` });
    }

    room.state.history.push(transformed);
    room.state.revision += 1;
    await this.store.save(room.docId, room.state);

    // Ack author, broadcast to everyone else.
    this._send(ws, { type: 'ack', revision: room.state.revision });
    this._broadcast(room, {
      type: 'op',
      userId: member.userId,
      revision: room.state.revision,
      op: transformed,
    }, ws);
    this.emit('commit', room.docId, room.state.revision, member.userId);
  }

  _onClose(room, ws) {
    const member = room.clients.get(ws);
    room.clients.delete(ws);
    if (member) this._broadcast(room, { type: 'presence-leave', userId: member.userId });
    if (room.clients.size === 0) {
      // Keep state persisted; drop the in-memory room to free heap.
      this.store.save(room.docId, room.state).catch(() => {});
      this.rooms.delete(room.docId);
    }
  }

  _broadcast(room, payload, exceptWs) {
    const data = JSON.stringify(payload);
    for (const ws of room.clients.keys()) {
      if (ws !== exceptWs && ws.readyState === ws.OPEN) ws.send(data);
    }
  }

  _send(ws, obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  }

  _colorFor(userId) {
    const h = crypto.createHash('md5').update(userId).digest();
    const hue = h[0] * (360 / 255);
    return `hsl(${hue.toFixed(0)}, 70%, 55%)`;
  }

  async close() {
    await new Promise((r) => this.wss.close(r));
  }
}

module.exports = { SyncServer, Op, MemoryDocStore };
