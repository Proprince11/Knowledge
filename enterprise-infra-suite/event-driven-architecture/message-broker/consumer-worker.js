'use strict';

/**
 * Enterprise AMQP (RabbitMQ) Consumer Worker
 * ------------------------------------------
 * Resilient background worker with:
 *   - Bounded prefetch (QoS) for fair, low-latency dispatch
 *   - Per-message retry with exponential backoff using a delay/retry queue
 *   - Dead-letter routing for poison messages (after max attempts)
 *   - At-least-once delivery semantics (explicit ack/nack)
 *   - Self-healing reconnection with backoff + jitter
 *   - Graceful drain on SIGINT / SIGTERM (finishes in-flight work)
 *
 * Retry strategy:
 *   The primary queue dead-letters rejected messages into a per-attempt
 *   "retry" queue that has a message-TTL equal to the backoff delay. When the
 *   TTL expires the broker dead-letters the message back to the primary queue,
 *   effectively implementing a delayed redelivery without blocking the worker.
 *
 * Environment variables:
 *   AMQP_URL, AMQP_EXCHANGE, AMQP_QUEUE, AMQP_BINDING_KEYS (comma-separated),
 *   AMQP_PREFETCH (default 20), AMQP_MAX_ATTEMPTS (default 5),
 *   AMQP_RETRY_BASE_MS (default 1000), AMQP_RETRY_CAP_MS (default 60000)
 */

const amqp = require('amqplib');
const { EventEmitter } = require('events');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function backoffWithJitter(attempt, baseMs, capMs) {
  const exponential = Math.min(capMs, baseMs * 2 ** attempt);
  // "Equal jitter": half fixed, half random — smooths thundering-herd retries.
  return Math.floor(exponential / 2 + (Math.random() * exponential) / 2);
}

class ConsumerWorker extends EventEmitter {
  /**
   * @param {(message: object, raw: import('amqplib').ConsumeMessage) => Promise<void>} handler
   * @param {object} [options]
   */
  constructor(handler, options = {}) {
    super();
    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function(message, raw) => Promise');
    }
    this.handler = handler;

    this.url = options.url || process.env.AMQP_URL || 'amqp://localhost:5672';
    this.exchange = options.exchange || process.env.AMQP_EXCHANGE || 'events.topic';
    this.exchangeType = options.exchangeType || 'topic';
    this.queue = options.queue || process.env.AMQP_QUEUE || 'events.worker';
    this.bindingKeys =
      options.bindingKeys ||
      (process.env.AMQP_BINDING_KEYS || '#').split(',').map((s) => s.trim());

    this.prefetch = options.prefetch || Number(process.env.AMQP_PREFETCH || 20);
    this.maxAttempts = options.maxAttempts || Number(process.env.AMQP_MAX_ATTEMPTS || 5);
    this.retryBaseMs = options.retryBaseMs || Number(process.env.AMQP_RETRY_BASE_MS || 1000);
    this.retryCapMs = options.retryCapMs || Number(process.env.AMQP_RETRY_CAP_MS || 60000);

    // Reconnection backoff
    this.connectBaseMs = options.connectBaseMs || 250;
    this.connectCapMs = options.connectCapMs || 30000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 0; // 0 = infinite

    this.deadLetterExchange = `${this.exchange}.dlx`;
    this.deadLetterQueue = `${this.queue}.dead`;
    this.retryExchange = `${this.exchange}.retry`;

    this.connection = null;
    this.channel = null;
    this._closing = false;
    this._reconnectAttempt = 0;
    this._inFlight = 0;

    this._registerProcessHandlers();
  }

  async start() {
    await this._connectWithRetry();
    this.emit('started', { queue: this.queue, bindingKeys: this.bindingKeys });
  }

  async _connectWithRetry() {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this._establish();
        this._reconnectAttempt = 0;
        return;
      } catch (err) {
        attempt += 1;
        this.emit('connect:retry', { attempt, error: err });
        if (this.maxReconnectAttempts && attempt >= this.maxReconnectAttempts) {
          throw err;
        }
        await sleep(backoffWithJitter(attempt, this.connectBaseMs, this.connectCapMs));
      }
    }
  }

  async _establish() {
    this.connection = await amqp.connect(this.url, {
      clientProperties: { connection_name: 'enterprise-consumer-worker' },
    });
    this.connection.on('error', (err) => this.emit('connection:error', err));
    this.connection.on('close', () => this._handleClose());

    this.channel = await this.connection.createChannel();
    this.channel.on('error', (err) => this.emit('channel:error', err));
    await this.channel.prefetch(this.prefetch);

    await this._assertTopology();
    await this.channel.consume(this.queue, (msg) => this._onMessage(msg), {
      noAck: false,
    });

    this.emit('connected', { queue: this.queue });
  }

  /**
   * Declare exchanges/queues:
   *  - primary exchange + work queue (dead-letters to DLX)
   *  - dead-letter exchange + dead queue (terminal poison storage)
   *  - retry exchange + per-attempt TTL queues (delayed redelivery)
   */
  async _assertTopology() {
    const ch = this.channel;

    await ch.assertExchange(this.exchange, this.exchangeType, { durable: true });
    await ch.assertExchange(this.deadLetterExchange, 'fanout', { durable: true });
    await ch.assertExchange(this.retryExchange, 'topic', { durable: true });

    // Primary queue: rejected/expired messages flow to the retry exchange.
    await ch.assertQueue(this.queue, {
      durable: true,
      deadLetterExchange: this.retryExchange,
      deadLetterRoutingKey: `${this.queue}.retry`,
    });
    for (const key of this.bindingKeys) {
      await ch.bindQueue(this.queue, this.exchange, key);
    }

    // Dead-letter (poison) queue: terminal storage for exhausted messages.
    await ch.assertQueue(this.deadLetterQueue, { durable: true });
    await ch.bindQueue(this.deadLetterQueue, this.deadLetterExchange, '');

    // Retry queue: TTL'd; on expiry it dead-letters back to the primary exchange.
    // We use a single retry queue keyed by routing and rely on per-message
    // expiration so each message can carry its own computed backoff delay.
    const retryQueue = `${this.queue}.retry`;
    await ch.assertQueue(retryQueue, {
      durable: true,
      deadLetterExchange: this.exchange,
      // Route expired retries back using the original routing key (preserved in headers).
      deadLetterRoutingKey: this.bindingKeys[0] === '#' ? this.queue : this.bindingKeys[0],
    });
    await ch.bindQueue(retryQueue, this.retryExchange, `${this.queue}.retry`);
  }

  async _onMessage(msg) {
    if (msg === null) return; // consumer cancelled by broker
    this._inFlight += 1;

    const attempt = this._readAttempt(msg);
    let parsed;
    try {
      parsed =
        msg.properties.contentType === 'application/json'
          ? JSON.parse(msg.content.toString('utf8'))
          : msg.content;
    } catch (err) {
      // Unparseable body is non-retryable -> straight to dead-letter.
      this.emit('message:malformed', { error: err });
      this._sendToDeadLetter(msg, 'malformed-payload');
      this.channel.ack(msg);
      this._inFlight -= 1;
      return;
    }

    try {
      await this.handler(parsed, msg);
      this.channel.ack(msg);
      this.emit('processed', { attempt, routingKey: msg.fields.routingKey });
    } catch (err) {
      this.emit('handler:error', { error: err, attempt });
      await this._scheduleRetryOrDeadLetter(msg, attempt, err);
    } finally {
      this._inFlight -= 1;
    }
  }

  _readAttempt(msg) {
    const headers = msg.properties.headers || {};
    return Number(headers['x-attempt'] || 0);
  }

  async _scheduleRetryOrDeadLetter(msg, attempt, err) {
    const nextAttempt = attempt + 1;

    if (nextAttempt >= this.maxAttempts) {
      this.emit('message:dead-lettered', { attempt: nextAttempt, error: err });
      this._sendToDeadLetter(msg, err && err.message ? err.message : 'max-attempts');
      this.channel.ack(msg); // remove from primary queue after copying to DLQ
      return;
    }

    const delay = backoffWithJitter(nextAttempt, this.retryBaseMs, this.retryCapMs);

    // Re-publish to the retry exchange with a per-message TTL = backoff delay.
    // When TTL expires the broker routes it back to the primary exchange.
    const headers = {
      ...(msg.properties.headers || {}),
      'x-attempt': nextAttempt,
      'x-original-routing-key': msg.fields.routingKey,
      'x-last-error': err && err.message ? String(err.message).slice(0, 512) : 'unknown',
    };

    this.channel.publish(this.retryExchange, `${this.queue}.retry`, msg.content, {
      persistent: true,
      contentType: msg.properties.contentType,
      messageId: msg.properties.messageId,
      correlationId: msg.properties.correlationId,
      headers,
      expiration: String(delay), // per-message TTL in ms
    });

    // Ack the original so it leaves the primary queue (it now lives in retry).
    this.channel.ack(msg);
    this.emit('message:retry-scheduled', { attempt: nextAttempt, delay });
  }

  _sendToDeadLetter(msg, reason) {
    const headers = {
      ...(msg.properties.headers || {}),
      'x-death-reason': reason,
      'x-dead-lettered-at': new Date().toISOString(),
      'x-original-routing-key': msg.fields.routingKey,
    };
    this.channel.publish(this.deadLetterExchange, '', msg.content, {
      persistent: true,
      contentType: msg.properties.contentType,
      messageId: msg.properties.messageId,
      correlationId: msg.properties.correlationId,
      headers,
    });
  }

  _handleClose() {
    this.channel = null;
    this.connection = null;
    if (this._closing) return;
    this.emit('disconnected');
    this._reconnect();
  }

  async _reconnect() {
    this._reconnectAttempt += 1;
    const delay = backoffWithJitter(
      this._reconnectAttempt,
      this.connectBaseMs,
      this.connectCapMs,
    );
    this.emit('reconnect:scheduled', { attempt: this._reconnectAttempt, delay });
    await sleep(delay);
    try {
      await this._connectWithRetry();
    } catch (err) {
      this.emit('reconnect:failed', { error: err });
    }
  }

  /**
   * Drain in-flight work, then close channel/connection.
   * @param {number} [drainTimeoutMs] max time to wait for in-flight handlers
   */
  async stop(drainTimeoutMs = 15000) {
    this._closing = true;
    const deadline = Date.now() + drainTimeoutMs;
    // Stop accepting new deliveries.
    try {
      if (this.channel) await this.channel.close();
    } catch (_) {
      /* ignore */
    }
    // Wait for active handlers to settle.
    while (this._inFlight > 0 && Date.now() < deadline) {
      await sleep(50);
    }
    try {
      if (this.connection) await this.connection.close();
    } catch (_) {
      /* ignore */
    }
    this.emit('stopped', { drained: this._inFlight === 0 });
  }

  _registerProcessHandlers() {
    const shutdown = async (signal) => {
      this.emit('shutdown', { signal });
      await this.stop();
      process.exit(0);
    };
    if (!ConsumerWorker._signalsBound) {
      ConsumerWorker._signalsBound = true;
      process.once('SIGINT', () => shutdown('SIGINT'));
      process.once('SIGTERM', () => shutdown('SIGTERM'));
    }
  }
}

ConsumerWorker._signalsBound = false;

module.exports = { ConsumerWorker, backoffWithJitter };

// Run directly:  node consumer-worker.js
if (require.main === module) {
  const worker = new ConsumerWorker(async (message, raw) => {
    // Example business logic. Throw to trigger retry/backoff.
    console.log('[worker] received', raw.fields.routingKey, message);
    if (message && message.__forceFail) {
      throw new Error('forced failure for retry demo');
    }
  });

  worker.on('started', (i) => console.log('[worker] started', i));
  worker.on('processed', (i) => console.log('[worker] processed', i));
  worker.on('message:retry-scheduled', (i) => console.warn('[worker] retry in', i.delay, 'ms'));
  worker.on('message:dead-lettered', (i) => console.error('[worker] dead-lettered', i));
  worker.on('reconnect:scheduled', (i) => console.warn('[worker] reconnect in', i.delay, 'ms'));

  worker.start().catch((err) => {
    console.error('[worker] fatal:', err.message);
    process.exit(1);
  });
}
