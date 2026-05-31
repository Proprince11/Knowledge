'use strict';

/**
 * stream-handler.js
 * ---------------------------------------------------------------------------
 * Multi-engine voice-cloning audio stream handler.
 *
 * Responsibilities:
 *   - Accept raw PCM / encoded audio chunks from an upstream source.
 *   - Apply backpressure-aware ring buffering so a slow synthesis engine
 *     never causes unbounded memory growth.
 *   - Route synthesis requests to one of several pluggable TTS/voice engines.
 *   - Enforce an explicit, auditable consent gate before any cloned voice
 *     can be synthesized (responsible-use requirement, not a placeholder).
 *   - Stream synthesized audio back out as a Node Readable with proper
 *     resource cleanup on abort / error / completion.
 *
 * Pure Node.js (>=18). No external runtime dependencies.
 * ---------------------------------------------------------------------------
 */

const { Readable, Transform, pipeline } = require('node:stream');
const { EventEmitter, once } = require('node:events');
const crypto = require('node:crypto');

/**
 * Fixed-capacity ring buffer for Float32/Int16 PCM frames. Avoids the
 * GC churn of repeatedly slicing/concatenating Buffers in a hot audio loop.
 */
class RingBuffer {
  constructor(capacityBytes) {
    if (!Number.isInteger(capacityBytes) || capacityBytes <= 0) {
      throw new RangeError('capacityBytes must be a positive integer');
    }
    this._buf = Buffer.allocUnsafe(capacityBytes);
    this._cap = capacityBytes;
    this._read = 0;
    this._write = 0;
    this._size = 0;
  }

  get free() {
    return this._cap - this._size;
  }

  get size() {
    return this._size;
  }

  /** Writes as many bytes as fit; returns the number of bytes actually written. */
  write(chunk) {
    const toWrite = Math.min(chunk.length, this.free);
    for (let i = 0; i < toWrite; i++) {
      this._buf[this._write] = chunk[i];
      this._write = (this._write + 1) % this._cap;
    }
    this._size += toWrite;
    return toWrite;
  }

  /** Reads up to `n` bytes into a fresh Buffer; returns null when empty. */
  read(n) {
    if (this._size === 0) return null;
    const toRead = Math.min(n, this._size);
    const out = Buffer.allocUnsafe(toRead);
    for (let i = 0; i < toRead; i++) {
      out[i] = this._buf[this._read];
      this._read = (this._read + 1) % this._cap;
    }
    this._size -= toRead;
    return out;
  }

  clear() {
    this._read = this._write = this._size = 0;
  }
}

/**
 * Abstract engine contract. Concrete engines implement `synthesize`, which
 * returns an async iterable of audio chunks (Buffer) for a given text + voice
 * embedding. Engines are intentionally pluggable so the studio can A/B between
 * local and hosted models without touching the stream plumbing.
 */
class VoiceEngine {
  constructor(name, { sampleRate = 24000, channels = 1 } = {}) {
    this.name = name;
    this.sampleRate = sampleRate;
    this.channels = channels;
  }

  // eslint-disable-next-line require-yield, no-unused-vars
  async *synthesize(_text, _embedding, _signal) {
    throw new Error(`Engine "${this.name}" must implement synthesize()`);
  }
}

/**
 * Reference engine that turns text into deterministic PCM tone-bursts whose
 * pitch is seeded by the voice embedding. It is fully functional (produces
 * valid 16-bit PCM you can pipe to a WAV muxer) and serves as a drop-in until
 * a real neural backend is registered.
 */
class FormantPreviewEngine extends VoiceEngine {
  constructor(opts) {
    super('formant-preview', opts);
  }

  async *synthesize(text, embedding, signal) {
    const baseHz = 110 + (embedding?.[0] ?? 0.5) * 160; // 110–270 Hz fundamental
    const samplesPerChar = Math.floor(this.sampleRate * 0.075);
    const amp = 0.28 * 0x7fff;

    for (let c = 0; c < text.length; c++) {
      if (signal?.aborted) return;
      const code = text.charCodeAt(c);
      const hz = baseHz + (code % 24) * 6;
      const frame = Buffer.allocUnsafe(samplesPerChar * 2);
      for (let i = 0; i < samplesPerChar; i++) {
        const t = i / this.sampleRate;
        // Two-formant additive synthesis with a short attack/decay envelope.
        const env = Math.sin((Math.PI * i) / samplesPerChar);
        const s =
          Math.sin(2 * Math.PI * hz * t) * 0.7 +
          Math.sin(2 * Math.PI * hz * 2.4 * t) * 0.3;
        frame.writeInt16LE((s * env * amp) | 0, i * 2);
      }
      yield frame;
      // Yield to the event loop so we never block the synthesis pipeline.
      await new Promise((r) => setImmediate(r));
    }
  }
}

/**
 * Consent ledger. Every clone operation must be backed by a signed consent
 * token referencing the speaker who authorized use of their voice. Tokens are
 * HMAC-verified and time-boxed. This is enforced, not advisory.
 */
class ConsentLedger {
  constructor(secret) {
    if (!secret || secret.length < 16) {
      throw new Error('ConsentLedger requires a secret of >= 16 chars');
    }
    this._secret = secret;
    this._revoked = new Set();
  }

  /** Issues a signed consent token for a speaker. */
  issue({ speakerId, grantedBy, ttlMs = 86_400_000 }) {
    const payload = {
      speakerId,
      grantedBy,
      iat: Date.now(),
      exp: Date.now() + ttlMs,
      jti: crypto.randomUUID(),
    };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto
      .createHmac('sha256', this._secret)
      .update(body)
      .digest('base64url');
    return `${body}.${sig}`;
  }

  revoke(jti) {
    this._revoked.add(jti);
  }

  /** Verifies a token; throws on any failure. Returns the decoded payload. */
  verify(token) {
    if (typeof token !== 'string' || !token.includes('.')) {
      throw new Error('consent token malformed');
    }
    const [body, sig] = token.split('.');
    const expected = crypto
      .createHmac('sha256', this._secret)
      .update(body)
      .digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error('consent token signature invalid');
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) throw new Error('consent token expired');
    if (this._revoked.has(payload.jti)) throw new Error('consent revoked');
    return payload;
  }
}

/**
 * The orchestrator. Wires consent → engine selection → ring-buffered output.
 * Emits: 'engine', 'chunk', 'flush', 'error', 'done'.
 */
class StreamHandler extends EventEmitter {
  constructor({ consent, bufferBytes = 1 << 20, drainHighWaterMark = 1 << 16 } = {}) {
    super();
    if (!(consent instanceof ConsentLedger)) {
      throw new TypeError('StreamHandler requires a ConsentLedger instance');
    }
    this._consent = consent;
    this._engines = new Map();
    this._ring = new RingBuffer(bufferBytes);
    this._hwm = drainHighWaterMark;
  }

  registerEngine(engine) {
    if (!(engine instanceof VoiceEngine)) {
      throw new TypeError('registerEngine expects a VoiceEngine');
    }
    this._engines.set(engine.name, engine);
    return this;
  }

  /**
   * Synthesizes `text` with the selected engine and returns a Readable PCM
   * stream. Honors AbortSignal for cooperative cancellation, and frees the
   * ring buffer on every terminal path.
   */
  synthesizeStream({ engineName, text, embedding, consentToken, signal } = {}) {
    // 1. Hard consent gate — throws synchronously if not authorized.
    const grant = this._consent.verify(consentToken);

    const engine = this._engines.get(engineName);
    if (!engine) throw new Error(`unknown engine "${engineName}"`);
    if (typeof text !== 'string' || text.length === 0) {
      throw new Error('text must be a non-empty string');
    }

    this.emit('engine', { engine: engine.name, speakerId: grant.speakerId });

    const ring = this._ring;
    ring.clear();
    const hwm = this._hwm;
    const emitter = this;

    const out = new Readable({
      highWaterMark: hwm,
      read() {
        const chunk = ring.read(hwm);
        if (chunk) this.push(chunk);
      },
    });

    (async () => {
      try {
        for await (const frame of engine.synthesize(text, embedding, signal)) {
          if (signal?.aborted) break;
          let offset = 0;
          // Drain into the ring buffer, respecting backpressure.
          while (offset < frame.length) {
            const written = ring.write(frame.subarray(offset));
            offset += written;
            const piece = ring.read(hwm);
            if (piece) {
              emitter.emit('chunk', piece.length);
              if (!out.push(piece)) {
                // Consumer is slow — wait for it to drain before continuing.
                await once(out, 'data').catch(() => {});
              }
            }
            if (written === 0) {
              await new Promise((r) => setImmediate(r));
            }
          }
        }
        // Flush any residual bytes.
        let tail;
        while ((tail = ring.read(hwm))) {
          emitter.emit('flush', tail.length);
          out.push(tail);
        }
        out.push(null);
        emitter.emit('done', { speakerId: grant.speakerId });
      } catch (err) {
        emitter.emit('error', err);
        out.destroy(err);
      } finally {
        ring.clear();
      }
    })();

    return out;
  }

  /**
   * Convenience helper that pipes the synthesized stream through a caller
   * supplied Transform (e.g., a WAV muxer or Opus encoder) and resolves when
   * the full pipeline completes.
   */
  async render(opts, sink) {
    const src = this.synthesizeStream(opts);
    const stages = [src];
    if (opts.encoder instanceof Transform) stages.push(opts.encoder);
    stages.push(sink);
    await new Promise((resolve, reject) => {
      pipeline(...stages, (err) => (err ? reject(err) : resolve()));
    });
  }
}

module.exports = {
  RingBuffer,
  VoiceEngine,
  FormantPreviewEngine,
  ConsentLedger,
  StreamHandler,
};
