'use strict';

/**
 * Enterprise AMQP (RabbitMQ) Producer
 * ------------------------------------
 * High-throughput publisher built on top of `amqplib` with:
 *   - Lazy, self-healing connection management (auto-reconnect)
 *   - Exponential backoff with full jitter on connection failures
 *   - Publisher confirms (guaranteed broker acknowledgement)
 *   - Topic-exchange routing with persistent (durable) messages
 *   - Backpressure handling via the channel `drain` event
 *   - Graceful shutdown on SIGINT / SIGTERM
 *
 * Environment variables:
 *   AMQP_URL                e.g. amqp://user:pass@host:5672/vhost
 *   AMQP_EXCHANGE           default: "events.topic"
 *   AMQP_RECONNECT_MAX      default: 12  (max reconnect attempts before giving up)
 *   AMQP_RECONNECT_BASE_MS  default: 250 (base backoff delay)
 *   AMQP_RECONNECT_CAP_MS   default: 30000 (max backoff delay)
 *
 * Usage:
 *   const { Producer } = require('./producer');
 *   const producer = new Producer();
 *   await producer.connect();
 *   await producer.publish('order.created', { id: 42 });
 */

const amqp = require('amqplib');
const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Compute an exponential backoff delay with "full jitter".
 * @param {number} attempt zero-based attempt index
 * @param {number} baseMs base delay in milliseconds
 * @param {number} capMs maximum delay in milliseconds
 * @returns {number} delay in milliseconds
 */
function backoffWithJitter(attempt, baseMs, capMs) {
  const exponential = Math.min(capMs, baseMs * 2 ** attempt);
  // Full jitter: random in [0, exponential]
  return Math.floor(Math.random() * exponential);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Producer extends EventEmitter {
  /**
   * @param {object} [options]
   * @param {string} [options.url]
   * @param {string} [options.exchange]
   * @param {string} [options.exchangeType]
   * @param {number} [options.maxReconnectAttempts]
   * @param {number} [options.baseBackoffMs]
   * @param {number} [options.capBackoffMs]
   */
  constructor(options = {}) {
    super();
    this.url = options.url || process.env.AMQP_URL || 'amqp://localhost:5672';
    this.exchange = options.exchange || process.env.AMQP_EXCHANGE || 'events.topic';
    this.exchangeType = options.exchangeType || 'topic';
    this.maxReconnectAttempts =
      options.maxReconnectAttempts || Number(process.env.AMQP_RECONNECT_MAX || 12);
    this.baseBackoffMs =
      options.baseBackoffMs || Number(process.env.AMQP_RECONNECT_BASE_MS || 250);
    this.capBackoffMs =
      options.capBackoffMs || Number(process.env.AMQP_RECONNECT_CAP_MS || 30000);

    /** @type {import('amqplib').Connection | null} */
    this.connection = null;
    /** @type {import('amqplib').ConfirmChannel | null} */
    this.channel = null;

    this._connecting = null; // de-dupes concurrent connect() calls
    this._closing = false; // set during graceful shutdown
    this._reconnectAttempt = 0;

    this._registerProcessHandlers();
  }

  /**
   * Establish (or reuse) a confirm channel. Safe to call concurrently;
   * concurrent callers share a single in-flight connection promise.
   * @returns {Promise<import('amqplib').ConfirmChannel>}
   */
  async connect() {
    if (this.channel) return this.channel;
    if (this._connecting) return this._connecting;

    this._connecting = this._establish();
    try {
      return await this._connecting;
    } finally {
      this._connecting = null;
    }
  }

  async _establish() {
    let attempt = 0;
    // Retry the initial handshake with exponential backoff.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        this.connection = await amqp.connect(this.url, {
          clientProperties: { connection_name: 'enterprise-producer' },
        });

        this.connection.on('error', (err) => this.emit('connection:error', err));
        this.connection.on('close', () => this._handleConnectionClose());

        this.channel = await this.connection.createConfirmChannel();
        this.channel.on('error', (err) => this.emit('channel:error', err));

        await this.channel.assertExchange(this.exchange, this.exchangeType, {
          durable: true,
        });

        this._reconnectAttempt = 0;
        this.emit('connected', { exchange: this.exchange });
        return this.channel;
      } catch (err) {
        attempt += 1;
        this.emit('connect:retry', { attempt, error: err });
        if (attempt >= this.maxReconnectAttempts) {
          throw new Error(
            `AMQP producer failed to connect after ${attempt} attempts: ${err.message}`,
          );
        }
        await sleep(backoffWithJitter(attempt, this.baseBackoffMs, this.capBackoffMs));
      }
    }
  }

  _handleConnectionClose() {
    this.channel = null;
    this.connection = null;
    if (this._closing) return; // intentional shutdown, do not reconnect
    this.emit('disconnected');
    this._scheduleReconnect();
  }

  async _scheduleReconnect() {
    if (this._reconnectAttempt >= this.maxReconnectAttempts) {
      this.emit('reconnect:exhausted', { attempts: this._reconnectAttempt });
      return;
    }
    const delay = backoffWithJitter(
      this._reconnectAttempt,
      this.baseBackoffMs,
      this.capBackoffMs,
    );
    this._reconnectAttempt += 1;
    this.emit('reconnect:scheduled', { attempt: this._reconnectAttempt, delay });
    await sleep(delay);
    try {
      await this.connect();
    } catch (err) {
      this.emit('reconnect:failed', { error: err });
      this._scheduleReconnect();
    }
  }

  /**
   * Publish a message to the exchange with a routing key.
   * Resolves only after the broker confirms receipt (publisher confirms).
   * Handles channel backpressure by awaiting `drain`.
   *
   * @param {string} routingKey topic routing key, e.g. "order.created"
   * @param {object|Buffer|string} payload message body (objects are JSON-encoded)
   * @param {object} [options]
   * @param {object} [options.headers] AMQP headers
   * @param {string} [options.correlationId]
   * @param {number} [options.priority] 0-255
   * @returns {Promise<{messageId: string}>}
   */
  async publish(routingKey, payload, options = {}) {
    if (!routingKey || typeof routingKey !== 'string') {
      throw new TypeError('routingKey must be a non-empty string');
    }
    const channel = await this.connect();

    const body =
      Buffer.isBuffer(payload)
        ? payload
        : Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload));

    const messageId = options.messageId || crypto.randomUUID();
    const publishOptions = {
      persistent: true, // survive broker restart (paired with durable queues)
      mandatory: true,
      contentType: Buffer.isBuffer(payload) ? 'application/octet-stream' : 'application/json',
      messageId,
      correlationId: options.correlationId,
      timestamp: Date.now(),
      headers: options.headers || {},
      priority: options.priority,
    };

    // Returns false when the internal buffer is full -> wait for 'drain'.
    const accepted = await new Promise((resolve, reject) => {
      const ok = channel.publish(this.exchange, routingKey, body, publishOptions, (err) => {
        // This callback fires when the broker confirms (or rejects) the message.
        if (err) reject(err);
        else resolve(true);
      });
      if (!ok) {
        // Backpressure: the socket buffer is full. Wait until it drains.
        channel.once('drain', () => {
          /* confirm callback above still settles the promise */
        });
      }
    });

    this.emit('published', { routingKey, messageId });
    return { messageId, accepted };
  }

  /**
   * Publish many messages and wait for all broker confirms in a batch.
   * @param {Array<{routingKey: string, payload: any, options?: object}>} messages
   */
  async publishBatch(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new TypeError('messages must be a non-empty array');
    }
    const results = await Promise.allSettled(
      messages.map((m) => this.publish(m.routingKey, m.payload, m.options)),
    );
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.emit('batch:partial-failure', { failed: failed.length, total: messages.length });
    }
    return results;
  }

  /**
   * Gracefully close the channel and connection.
   */
  async close() {
    this._closing = true;
    try {
      if (this.channel) await this.channel.close();
    } catch (_) {
      /* ignore close races */
    }
    try {
      if (this.connection) await this.connection.close();
    } catch (_) {
      /* ignore close races */
    }
    this.channel = null;
    this.connection = null;
    this.emit('closed');
  }

  _registerProcessHandlers() {
    const shutdown = async (signal) => {
      this.emit('shutdown', { signal });
      await this.close();
    };
    // Only register once even if multiple producers are created.
    if (!Producer._signalsBound) {
      Producer._signalsBound = true;
      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    }
  }
}

Producer._signalsBound = false;

module.exports = { Producer, backoffWithJitter };

// Allow running directly as a smoke test:  node producer.js order.created '{"id":1}'
if (require.main === module) {
  (async () => {
    const producer = new Producer();
    producer.on('connected', (i) => console.log('[producer] connected', i));
    producer.on('connect:retry', (i) => console.warn('[producer] retry', i.attempt));
    producer.on('reconnect:scheduled', (i) => console.warn('[producer] reconnect in', i.delay, 'ms'));

    const routingKey = process.argv[2] || 'demo.event';
    const payloadArg = process.argv[3] || JSON.stringify({ hello: 'world', ts: Date.now() });
    let payload;
    try {
      payload = JSON.parse(payloadArg);
    } catch {
      payload = payloadArg;
    }

    try {
      const res = await producer.publish(routingKey, payload);
      console.log('[producer] published', res);
    } catch (err) {
      console.error('[producer] publish failed:', err.message);
      process.exitCode = 1;
    } finally {
      await producer.close();
    }
  })();
}
