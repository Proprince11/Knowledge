# Edge Resilience Suite

A cloud-native maturity layer covering **edge computing runtimes**,
**chaos engineering**, and **cryptographic decentralized auth + ledger**
mechanics. Edge modules are written against web-standard (V8 isolate) APIs
only; the rest run on Node 18+.

## Layout

```
edge-resilience-suite/
├── edge-computing-runtime/
│   ├── global-edge-worker/
│   │   └── edge-router.js        # V8-isolate worker: geo routing, rewrite hooks, canary, failover
│   └── edge-cache-steward/
│       └── edge-cache.ts          # In-flight dedup (single-flight) + static cache + SWR
├── chaos-engineering/
│   ├── failure-simulator/
│   │   └── chaos-injector.js      # Latency / dropout / memory-leak / CPU stall — fail-closed safety
│   └── circuit-breaker-test/
│       └── breaker-evaluator.ts   # Circuit breaker + resilience assertion framework
└── crypto-decentralized-auth/
    ├── signature-verifier/
    │   └── ecdsa-auth.js          # ECDSA sign/verify, key-set + M-of-N threshold verification
    └── ledger-block-hasher/
        └── block-hasher.ts        # Hash-chained ledger: Merkle roots, PoW, tamper-evident validation
```

## Edge runtime constraints

`edge-router.js` and `edge-cache.ts` import **zero Node.js built-ins**. They
rely solely on isolate-safe globals — `Request`, `Response`, `Headers`, `URL`,
`fetch`, `caches`, `crypto.subtle`, `Map`, and timers — so they deploy
unchanged to Cloudflare Workers, Deno Deploy, and similar V8 isolate platforms,
with an in-memory fallback when the Cache API is absent (e.g. local tests).

## Chaos safety model (fail-closed)

`chaos-injector.js` can **never arm by accident**. It requires ALL of:

1. A non-production `NODE_ENV`/`APP_ENV` (rejects `production|prod|live|canary`).
2. `CHAOS_ENABLED=true` (exact string).
3. `CHAOS_ACK=I_UNDERSTAND_THIS_IS_NOT_PRODUCTION`.
4. `new ChaosInjector({ armed: true })` in code.

If any gate fails, every method becomes an inert no-op and `isArmed()` returns
`false`, so the injector is safe to leave permanently wired into application
code.

## Getting started

```bash
cd edge-resilience-suite
npm install
npm run build          # type-check + compile the TypeScript modules

# Standalone demos (no external services required):
npm run demo:ecdsa     # ECDSA sign/verify, key-set, 2-of-3 multisig, secp256k1
npm run demo:ledger    # hash-chain + Merkle proof + tamper detection (needs ts-node)
npm run demo:breaker   # circuit-breaker scenarios (needs ts-node)

# Chaos demo (NON-PRODUCTION only — must pass all safety gates):
CHAOS_ENABLED=true CHAOS_ACK=I_UNDERSTAND_THIS_IS_NOT_PRODUCTION NODE_ENV=development \
  npm run demo:chaos
```

## Design highlights

| Concern | Approach |
| --- | --- |
| Edge portability | Web-standard globals only; no Node built-ins in the edge tier |
| Geo routing | Country → region → ordered nearest-origin lists with failover |
| Cache stampede | Single-flight in-flight dedup + stale-while-revalidate |
| Chaos safety | Four independent fail-closed gates; inert no-op when disarmed |
| Graceful degradation | 3-state circuit breaker (CLOSED/OPEN/HALF_OPEN) + fallbacks + timeouts |
| Auth | ECDSA over P-256/384/521 + secp256k1; key-set & M-of-N threshold verify |
| Tamper-evidence | Hash-chained blocks, Merkle roots, optional PoW, full audit validation |
