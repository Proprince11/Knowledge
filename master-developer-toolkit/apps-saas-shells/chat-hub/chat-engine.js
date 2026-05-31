'use strict';

/**
 * chat-engine.js
 * ---------------------------------------------------------------------------
 * Persistent, channel-based real-time messaging engine.
 *
 * Features:
 *   - Channels with membership + role-based posting permissions.
 *   - Message history with monotonic per-channel sequence ids (cursorable).
 *   - Presence (online/away/offline) with last-seen tracking.
 *   - Typing indicators with auto-expiry.
 *   - Read receipts (per-member high-water mark).
 *   - At-least-once delivery with client ack + server replay on reconnect.
 *
 * Transport-agnostic core (`ChatEngine`) plus a `ws` binding (`attachWebSocket`).
 * Persistence injected via MessageStore port; defaults to in-memory.
 * ---------------------------------------------------------------------------
 */

const { EventEmitter } = require('node:events');
const crypto = require('node:crypto');

class MemoryMessageStore {
  constructor() {
    this.channels = new Map(); // channelId -> { seq, messages:[] }
  }
  _chan(id) {
    if (!this.channels.has(id)) this.channels.set(id, { seq: 0, messages: [] });
    return this.channels.get(id);
  }
  async append(channelId, message) {
    const c = this._chan(channelId);
    message.seq = ++c.seq;
    c.messages.push(message);
    // Bound memory: keep last 5k per channel in the hot store.
    if (c.messages.length > 5000) c.messages.splice(0, c.messages.length - 5000);
    return message;
  }
  async since(channelId, afterSeq, limit = 100) {
    const c = this._chan(channelId);
    const start = c.messages.findIndex((m) => m.seq > afterSeq);
    if (start < 0) return [];
    return c.messages.slice(start, start + limit);
  }
  async latestSeq(channelId) {
    return this._chan(channelId).seq;
  }
}

const PRESENCE = Object.freeze({ ONLINE: 'online', AWAY: 'away', OFFLINE: 'offline' });
const TYPING_TTL_MS = 6000;

class ChatEngine extends EventEmitter {
  constructor({ store = new MemoryMessageStore() } = {}) {
    super();
    this.store = store;
    this.channels = new Map(); // channelId -> { members:Map<userId,role>, name }
    this.presence = new Map(); // userId -> { status, lastSeen }
    this.typing = new Map(); // channelId -> Map<userId, timeout>
    this.reads = new Map(); // channelId -> Map<userId, seq>
  }

  /* ----------------------------- Channels ------------------------------ */

  createChannel({ channelId = crypto.randomUUID(), name, createdBy } = {}) {
    if (this.channels.has(channelId)) throw new Error('channel exists');
    this.channels.set(channelId, { name: name || channelId, members: new Map([[createdBy, 'owner']]) });
    this.reads.set(channelId, new Map());
    this.emit('channel:create', { channelId, name, createdBy });
    return channelId;
  }

  join(channelId, userId, role = 'member') {
    const chan = this._chanOrThrow(channelId);
    chan.members.set(userId, chan.members.get(userId) ?? role);
    this.emit('channel:join', { channelId, userId });
  }

  leave(channelId, userId) {
    const chan = this._chanOrThrow(channelId);
    chan.members.delete(userId);
    this.reads.get(channelId)?.delete(userId);
    this._clearTyping(channelId, userId);
    this.emit('channel:leave', { channelId, userId });
  }

  _chanOrThrow(channelId) {
    const c = this.channels.get(channelId);
    if (!c) throw new Error(`channel ${channelId} not found`);
    return c;
  }

  _assertCanPost(channelId, userId) {
    const chan = this._chanOrThrow(channelId);
    const role = chan.members.get(userId);
    if (!role) throw new Error('not a member of channel');
    if (role === 'readonly') throw new Error('insufficient permission to post');
  }

  /* ----------------------------- Messages ------------------------------ */

  /** Posts a message; returns the persisted, sequence-stamped record. */
  async postMessage({ channelId, userId, body, clientId, attachments = [] }) {
    this._assertCanPost(channelId, userId);
    if (typeof body !== 'string' || body.trim().length === 0) {
      throw new Error('message body required');
    }
    const message = {
      id: crypto.randomUUID(),
      clientId: clientId ?? null, // for client-side dedupe
      channelId,
      userId,
      body: body.slice(0, 8000),
      attachments: attachments.slice(0, 10),
      ts: Date.now(),
      seq: 0,
    };
    const saved = await this.store.append(channelId, message);
    this._clearTyping(channelId, userId);
    this.emit('message', saved);
    return saved;
  }

  /** Returns messages after a cursor (sequence id) for replay on reconnect. */
  async history(channelId, afterSeq = 0, limit = 100) {
    this._chanOrThrow(channelId);
    return this.store.since(channelId, afterSeq, limit);
  }

  /* ----------------------------- Presence ------------------------------ */

  setPresence(userId, status) {
    if (!Object.values(PRESENCE).includes(status)) throw new Error('invalid presence');
    this.presence.set(userId, { status, lastSeen: Date.now() });
    this.emit('presence', { userId, status });
  }

  getPresence(userId) {
    return this.presence.get(userId) ?? { status: PRESENCE.OFFLINE, lastSeen: 0 };
  }

  /* ------------------------------ Typing ------------------------------- */

  startTyping(channelId, userId) {
    this._assertCanPost(channelId, userId);
    let map = this.typing.get(channelId);
    if (!map) { map = new Map(); this.typing.set(channelId, map); }
    clearTimeout(map.get(userId));
    map.set(userId, setTimeout(() => this._clearTyping(channelId, userId), TYPING_TTL_MS));
    this.emit('typing', { channelId, userId, typing: true });
  }

  _clearTyping(channelId, userId) {
    const map = this.typing.get(channelId);
    if (map?.has(userId)) {
      clearTimeout(map.get(userId));
      map.delete(userId);
      this.emit('typing', { channelId, userId, typing: false });
    }
  }

  /* --------------------------- Read receipts --------------------------- */

  markRead(channelId, userId, seq) {
    const map = this.reads.get(channelId) ?? new Map();
    const current = map.get(userId) ?? 0;
    if (seq > current) {
      map.set(userId, seq);
      this.reads.set(channelId, map);
      this.emit('read', { channelId, userId, seq });
    }
  }

  unreadCount(channelId, userId) {
    const map = this.reads.get(channelId);
    const read = map?.get(userId) ?? 0;
    const chanSeq = this.store.channels?.get?.(channelId)?.seq ?? 0;
    return Math.max(0, chanSeq - read);
  }
}

/**
 * Binds a ChatEngine to a `ws` WebSocketServer. Each socket carries one user.
 * On reconnect a client sends { type:'resume', cursors:{channelId:seq} } and
 * receives a replay of everything it missed (at-least-once delivery).
 */
function attachWebSocket(engine, wss, { authenticate } = {}) {
  const sockets = new Map(); // userId -> Set<ws>

  const sendTo = (userId, payload) => {
    const set = sockets.get(userId);
    if (!set) return;
    const data = JSON.stringify(payload);
    for (const ws of set) if (ws.readyState === ws.OPEN) ws.send(data);
  };

  // Fan engine events out to interested members.
  engine.on('message', (m) => {
    const chan = engine.channels.get(m.channelId);
    if (chan) for (const uid of chan.members.keys()) sendTo(uid, { type: 'message', message: m });
  });
  engine.on('typing', (e) => {
    const chan = engine.channels.get(e.channelId);
    if (chan) for (const uid of chan.members.keys()) if (uid !== e.userId) sendTo(uid, { type: 'typing', ...e });
  });
  engine.on('presence', (e) => { for (const uid of sockets.keys()) sendTo(uid, { type: 'presence', ...e }); });
  engine.on('read', (e) => sendTo(e.userId, { type: 'read', ...e }));

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const principal = await (authenticate ?? (async (t) => (t ? { userId: t } : null)))(url.searchParams.get('token'));
    if (!principal) return ws.close(4401, 'unauthorized');
    const userId = principal.userId;

    if (!sockets.has(userId)) sockets.set(userId, new Set());
    sockets.get(userId).add(ws);
    engine.setPresence(userId, PRESENCE.ONLINE);

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      try {
        switch (msg.type) {
          case 'post':
            await engine.postMessage({ ...msg, userId });
            break;
          case 'typing':
            engine.startTyping(msg.channelId, userId);
            break;
          case 'read':
            engine.markRead(msg.channelId, userId, msg.seq);
            break;
          case 'resume': {
            const cursors = msg.cursors || {};
            for (const [channelId, seq] of Object.entries(cursors)) {
              const missed = await engine.history(channelId, Number(seq) || 0, 500);
              for (const m of missed) ws.send(JSON.stringify({ type: 'message', message: m, replay: true }));
            }
            ws.send(JSON.stringify({ type: 'resume-complete' }));
            break;
          }
          default:
            ws.send(JSON.stringify({ type: 'error', message: `unknown type "${msg.type}"` }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    });

    const cleanup = () => {
      const set = sockets.get(userId);
      if (set) { set.delete(ws); if (set.size === 0) { sockets.delete(userId); engine.setPresence(userId, PRESENCE.OFFLINE); } }
    };
    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });

  return { sendTo };
}

module.exports = { ChatEngine, MemoryMessageStore, attachWebSocket, PRESENCE };
