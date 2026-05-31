# Enterprise Infra Suite

A production-grade master layer covering **event-driven architecture**,
**high-performance data**, and **zero-trust security**. Every module is
self-contained, dependency-light, and built around high-throughput,
low-latency execution with strong data isolation.

## Layout

```
enterprise-infra-suite/
├── event-driven-architecture/
│   ├── message-broker/
│   │   ├── producer.js          # AMQP (RabbitMQ) publisher: confirms, reconnection, backoff
│   │   └── consumer-worker.js   # Resilient worker: prefetch, DLQ, TTL-based retry, drain
│   └── async-service-mesh/
│       └── event-router.ts      # In-process routing engine: concurrency, retries, dead-letter
├── high-performance-data/
│   ├── redis-cache-layer/
│   │   └── cache-manager.js     # Cache-Aside + Write-Through + Write-Behind, stampede locks
│   └── optimized-search/
│       └── search-indexer.js    # Inverted index + BM25 + trigram/Levenshtein fuzzy search
└── zero-trust-security/
    ├── api-armor-proxy/
    │   └── proxy-shield.js       # Hardened reverse proxy: CSP/HSTS, CORS, CSRF, rate limiting
    └── crypto-vault-utils/
        └── secure-crypto.ts      # AES-256-GCM AEAD, scrypt/HKDF KDFs, key rotation
```

## Design highlights

| Concern | Approach |
| --- | --- |
| Connection resilience | Exponential backoff **with jitter**, auto-reconnect, self-healing channels |
| Delivery guarantees | Publisher confirms + explicit ack/nack + dead-letter routing |
| Retry semantics | Per-message TTL retry queue (broker) and in-process backoff (router) |
| Cache correctness | Single-flight + distributed lock to prevent stampede; TTL jitter vs. avalanche |
| Search relevance | BM25 with field boosts; typo tolerance via trigram candidates + bounded edit distance |
| Edge security | Allowlist CORS, stateless HMAC double-submit CSRF, token-bucket rate limiting |
| Data-at-rest crypto | AES-256-GCM (hardware-accelerated via OpenSSL AES-NI), AAD binding, key rotation |

## Getting started

```bash
cd enterprise-infra-suite
npm install
npm run build          # type-check + compile the TypeScript modules

# Run the standalone demos (each file has a CLI entrypoint):
npm run demo:search    # zero-dependency, runs immediately
npm run demo:cache     # requires a local Redis
npm run demo:proxy     # boots the gateway on :8443
npm run demo:crypto    # AES-256-GCM round-trip + key rotation
```

> The broker, cache, and proxy demos expect RabbitMQ / Redis / an upstream
> service respectively. Configure them via the environment variables documented
> at the top of each source file. The search and crypto demos run with no
> external services.

## Configuration

Each module reads configuration from environment variables (with sane
defaults) — see the JSDoc header block in every file for the full list, e.g.
`AMQP_URL`, `REDIS_URL`, `UPSTREAM_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_SECRET`.

## Security note

`crypto-vault-utils` and `api-armor-proxy` are **defensive** components:
authenticated encryption for sensitive data and edge hardening against CSRF,
cross-origin abuse, and traffic floods. Always supply secrets (`CSRF_SECRET`,
encryption keys) from a secrets manager — never hard-code them.
