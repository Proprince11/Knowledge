'use strict';

/**
 * websocket-pipeline.js
 * ---------------------------------------------------------------------------
 * WebSocket control-plane for a frame-by-frame media rendering pipeline.
 *
 * IMPORTANT — RESPONSIBLE USE
 *   This module is the *orchestration layer only*: it tracks job state and
 *   streams progress between a UI and rendering workers. It contains no
 *   face-detection or face-synthesis logic. Synthetic-media (face-replacement)
 *   jobs are gated behind a mandatory, signed consent record naming every
 *   identity in the source footage, and every accepted job is written to an
 *   immutable audit log. Jobs without valid consent are rejected outright.
 *   This is intended for authorized VFX / research use with informed consent.
 *
 * Server: `ws` (Node). Handles auth handshake, heartbeat/liveness, per-client
 * job registration, progress fan-out, and backpressure-safe broadcast.
 * ---------------------------------------------------------------------------
 */

const { WebSocketServer } = require('ws');
const { EventEmitter } = require('node:events');
const crypto = require('node:crypto');

const HEARTBEAT_MS = 30_000;
const MAX_PAYLOAD = 256 * 1024; // control messages only; media goes over HTTP

/** Append-only audit trail. Replace the sink with a DB/WORM store in prod. */
class AuditLog {
  constructor(sink = null) {
    this._sink = sink; // async (entry) => void
    this._chain = crypto.createHash('sha256').update('genesis').digest('hex');
  }

  async record(event, detail) {
    const entry = {
      ts: new Date().toISOString(),
      event,
      detail,
      prev: this._chain,
    };
    // Hash-chain so tampering with earlier entries is detectable.
    this._chain = crypto
      .createHash('sha256')
      .update(this._chain + JSON.stringify(entry))
      .digest('hex');
    entry.hash = this._chain;
    if (this._sink) await this._sink(entry);
    return entry;
  }
}

/**
 * Verifies a consent envelope: an HMAC-signed document listing each subject
 * identity that appears in the media and who authorized the synthetic edit.
 */
class ConsentVerifier {
  constructor(secret) {
    if (!secret || secret.length < 16) throw new Error('consent secret too short');
    this._secret = secret;
  }

  sign(doc) {
    const body = Buffer.from(JSON.stringify(doc)).toString('base64url');
    const sig = crypto.createHmac('sha256', this._secret).update(body).digest('base64url');
    return `${body}.${sig}`;
  }

  verify(envelope) {
    if (typeof envelope !== 'string' || !envelope.includes('.')) {
      throw new Error('consent envelope malformed');
    }
    const [body, sig] = envelope.split('.');
    const expect = crypto.createHmac('sha256', this._secret).update(body).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expect);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error('consent signature invalid');
    }
    const doc = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!Array.isArray(doc.subjects) || doc.subjects.length === 0) {
      throw new Error('consent must enumerate at least one subject');
    }
    if (!doc.subjects.every((s) => s.identity && s.authorizedBy && s.authorizedAt)) {
      throw new Error('each subject requires identity + authorizedBy + authorizedAt');
    }
    if (typeof doc.expiresAt === 'number' && Date.now() > doc.expiresAt) {
      throw new Error('consent expired');
    }
    return doc;
  }
}

/** Tracks one render job and its subscribers. */
class Job {
  constructor(id, kind, consentDoc) {
    this.id = id;
    this.kind = kind;
    this.consent = consentDoc;
    this.state = 'queued';
    this.progress = 0;
    this.frames = { total: 0, done: 0 };
    this.subscribers = new Set();
    this.createdAt = Date.now();
    this.error = null;
  }

  toJSON() {
    return {
      id: this.id,
      kind: this.kind,
      state: this.state,
      progress: this.progress,
      frames: this.frames,
      createdAt: this.createdAt,
      error: this.error,
    };
  }
}

class RenderPipelineServer extends EventEmitter {
  /**
   * @param {object} opts
   * @param {number} opts.port
   * @param {(token:string)=>Promise<{userId:string}|null>} opts.authenticate
   * @param {string} opts.consentSecret
   * @param {Function} [opts.auditSink]
   */
  constructor({ port, authenticate, consentSecret, auditSink } = {}) {
    super();
    if (typeof authenticate !== 'function') throw new Error('authenticate fn required');
    this._authenticate = authenticate;
    this._consent = new ConsentVerifier(consentSecret);
    this._audit = new AuditLog(auditSink);
    this._jobs = new Map();
    this._clients = new Map(); // ws -> { userId, alive }
    this._wss = new WebSocketServer({ port, maxPayload: MAX_PAYLOAD });
    this._wss.on('connection', (ws, req) => this._onConnection(ws, req));
    this._heartbeat = setInterval(() => this._sweep(), HEARTBEAT_MS);
  }

  get port() {
    return this._wss.options.port;
  }

  async _onConnection(ws, req) {
    // Expect token via Sec-WebSocket-Protocol or ?token= query.
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token') || req.headers['sec-websocket-protocol'];
    const principal = token ? await this._authenticate(token).catch(() => null) : null;
    if (!principal) {
      ws.close(4401, 'unauthorized');
      return;
    }

    this._clients.set(ws, { userId: principal.userId, alive: true });
    ws.on('pong', () => {
      const meta = this._clients.get(ws);
      if (meta) meta.alive = true;
    });
    ws.on('message', (raw) => this._onMessage(ws, raw));
    ws.on('close', () => this._onClose(ws));
    ws.on('error', () => this._onClose(ws));

    this._send(ws, { type: 'hello', userId: principal.userId, jobs: [...this._jobs.values()].map((j) => j.toJSON()) });
  }

  async _onMessage(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return this._send(ws, { type: 'error', message: 'invalid json' });
    }
    const meta = this._clients.get(ws);
    if (!meta) return;

    try {
      switch (msg.type) {
        case 'submit':
          return await this._handleSubmit(ws, meta, msg);
        case 'subscribe':
          return this._handleSubscribe(ws, msg.jobId);
        case 'unsubscribe':
          return this._handleUnsubscribe(ws, msg.jobId);
        case 'cancel':
          return this._handleCancel(ws, meta, msg.jobId);
        case 'progress': // emitted by trusted render workers
          return this._handleWorkerProgress(meta, msg);
        default:
          return this._send(ws, { type: 'error', message: `unknown type "${msg.type}"` });
      }
    } catch (err) {
      this._send(ws, { type: 'error', message: err.message, ref: msg.jobId });
    }
  }

  async _handleSubmit(ws, meta, msg) {
    // Hard consent gate for synthetic-media jobs.
    let consentDoc = null;
    if (msg.kind === 'face-replacement' || msg.requiresConsent) {
      consentDoc = this._consent.verify(msg.consent);
    }
    const id = crypto.randomUUID();
    const job = new Job(id, msg.kind, consentDoc);
    job.frames.total = Number.isInteger(msg.frameCount) ? msg.frameCount : 0;
    this._jobs.set(id, job);
    job.subscribers.add(ws);

    await this._audit.record('job.submit', {
      jobId: id,
      kind: msg.kind,
      userId: meta.userId,
      subjects: consentDoc?.subjects?.map((s) => s.identity) ?? [],
    });

    this._send(ws, { type: 'accepted', job: job.toJSON() });
    this.emit('job:submit', job, meta.userId);
  }

  _handleSubscribe(ws, jobId) {
    const job = this._jobs.get(jobId);
    if (!job) return this._send(ws, { type: 'error', message: 'no such job', ref: jobId });
    job.subscribers.add(ws);
    this._send(ws, { type: 'state', job: job.toJSON() });
  }

  _handleUnsubscribe(ws, jobId) {
    this._jobs.get(jobId)?.subscribers.delete(ws);
  }

  async _handleCancel(ws, meta, jobId) {
    const job = this._jobs.get(jobId);
    if (!job) return;
    job.state = 'cancelled';
    await this._audit.record('job.cancel', { jobId, userId: meta.userId });
    this._broadcastJob(job, { type: 'state', job: job.toJSON() });
    this.emit('job:cancel', job, meta.userId);
  }

  /** Trusted worker updates job progress; fanned out to all subscribers. */
  _handleWorkerProgress(meta, msg) {
    const job = this._jobs.get(msg.jobId);
    if (!job || job.state === 'cancelled') return;
    job.state = msg.state ?? 'processing';
    if (Number.isInteger(msg.framesDone)) job.frames.done = msg.framesDone;
    job.progress =
      job.frames.total > 0
        ? Math.min(1, job.frames.done / job.frames.total)
        : typeof msg.progress === 'number'
          ? msg.progress
          : job.progress;
    if (msg.error) { job.state = 'failed'; job.error = msg.error; }
    if (job.state === 'completed') job.progress = 1;
    this._broadcastJob(job, { type: 'progress', job: job.toJSON() });
  }

  _broadcastJob(job, payload) {
    for (const ws of job.subscribers) {
      if (ws.readyState === ws.OPEN) this._send(ws, payload);
    }
  }

  _send(ws, obj) {
    // Drop messages on a saturated socket rather than buffering unbounded.
    if (ws.readyState !== ws.OPEN) return;
    if (ws.bufferedAmount > MAX_PAYLOAD * 8) return;
    ws.send(JSON.stringify(obj));
  }

  _onClose(ws) {
    this._clients.delete(ws);
    for (const job of this._jobs.values()) job.subscribers.delete(ws);
  }

  /** Terminates dead sockets (no pong within one interval). */
  _sweep() {
    for (const [ws, meta] of this._clients) {
      if (!meta.alive) { ws.terminate(); this._onClose(ws); continue; }
      meta.alive = false;
      try { ws.ping(); } catch { this._onClose(ws); }
    }
  }

  async close() {
    clearInterval(this._heartbeat);
    await new Promise((resolve) => this._wss.close(resolve));
  }
}

module.exports = { RenderPipelineServer, ConsentVerifier, AuditLog, Job };
