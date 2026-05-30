---
title: System Design
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [dbms.md, networking basics, concurrency basics]
reading_time: ~48 min
last_updated: 2026-05-29
---

# System Design

System design is the art of making **tradeoffs under constraints** — latency vs. consistency,
cost vs. availability, simplicity vs. scale — to meet *specific* requirements. There is no
"correct" architecture, only one appropriate to the load, the SLAs, and the team. Mastery means
reasoning quantitatively (back-of-envelope estimation), knowing the canonical building blocks
and their failure modes, and resisting the urge to build for scale you don't have.

---

## 1. Technical Mechanisms

### 1.1 The scalability axes

- **Vertical scaling (scale up):** bigger machine. Simple, but a ceiling + single point of
  failure.
- **Horizontal scaling (scale out):** more machines behind a load balancer. Near-unbounded but
  forces you to handle *state* (the hard part) — sessions, data partitioning, coordination.
- **Stateless services scale trivially**; statefulness is what makes scaling hard. Push state
  to dedicated stores (DB, cache, object storage) and keep app servers stateless.

### 1.2 Latency numbers every engineer should internalize

Approximate orders of magnitude (Jeff Dean's "latency numbers"):
```
L1 cache reference            ~1 ns
Main memory reference         ~100 ns
SSD random read               ~16 µs
Round trip within datacenter  ~0.5 ms
Disk seek (HDD)               ~2–10 ms
Network round trip US↔Europe  ~80–150 ms
```
> **Implication:** a remote call is ~10,000× slower than memory; a cross-region call is ~100×
> a same-DC call. **Chattiness and geography dominate latency.** Batch, cache, and co-locate.

### 1.3 Back-of-the-envelope estimation

Always quantify before designing. Example skeleton:
```
Users 100M, 10% DAU = 10M; avg 20 requests/day → 200M req/day
≈ 200M / 86,400s ≈ 2,300 req/s average; peak ≈ 3–5× ≈ ~10k req/s
Storage: 200M writes/day × 1KB = 200 GB/day → ~73 TB/year (before replication)
```
This tells you whether you need one box or a fleet, SQL or sharded storage — *before* drawing
boxes.

### 1.4 Caching (the highest-leverage performance tool)

```
client → CDN (edge) → load balancer → app cache (in-proc) → distributed cache (Redis) → DB
```
- **Cache-aside (lazy):** app checks cache, on miss reads DB and populates. Most common.
- **Write-through / write-behind:** write to cache + DB together / async.
- **Eviction:** LRU/LFU/TTL. **Invalidation is the hard problem** ("there are only two hard
  things…"). Stale data vs. thundering-herd on expiry (mitigate with jitter, locks,
  request-coalescing).
- **CDN** caches static assets at the edge near users — the cheapest latency win for global
  audiences.

### 1.5 Databases at scale: replication, partitioning, sharding

- **Replication** (see `dbms.md`): read replicas scale reads; primary handles writes; async
  replication introduces lag (read-your-writes anomalies).
- **Partitioning/Sharding:** split data across nodes by a **shard key**.
  - **Hash sharding:** even distribution, but range queries scatter.
  - **Range sharding:** good range scans, risk of hotspots.
  - **Consistent hashing** minimizes resharding when nodes change.
- **Hotspots & the celebrity problem:** a bad shard key concentrates load on one node. Choose
  high-cardinality, evenly-accessed keys.

### 1.6 Asynchronous architecture: queues & event-driven

- **Message queues** (RabbitMQ, SQS) and **logs** (Kafka) decouple producers from consumers,
  absorb spikes (buffering), and enable retries/backpressure.
- **Delivery semantics:** at-most-once / at-least-once / exactly-once. Most systems give
  **at-least-once** → consumers must be **idempotent** (dedupe by key).
- **Patterns:** work queues, pub/sub, event sourcing, CQRS (separate read/write models),
  the **outbox pattern** for reliable DB↔queue consistency.

### 1.7 Consistency & coordination

- **CAP/PACELC** (see `dbms.md`): pick C-vs-A behavior under partition.
- **Strong** vs **eventual** consistency: eventual is cheaper/faster and fine for many features
  (feeds, counts); strong is required for money/inventory.
- **Distributed transactions:** two-phase commit is slow/fragile; prefer **sagas** (a sequence
  of local transactions with compensating actions) for cross-service workflows.
- **Idempotency keys** make retries safe — a cornerstone of reliable distributed systems.

---

## 2. Application Frameworks

### 2.1 The interview/real-world design process

```
1. REQUIREMENTS   functional (features) + non-functional (scale, latency, availability, SLA)
2. ESTIMATE       QPS, storage, bandwidth (back-of-envelope) → sizes the design
3. API            define the contract (endpoints/messages) — the system's seams
4. DATA MODEL     entities, access patterns → store choice (SQL/NoSQL), schema, shard key
5. HIGH-LEVEL     boxes: clients, LB, services, caches, DBs, queues, CDN
6. DEEP DIVE      the hard part: hot path, bottleneck, consistency, failure handling
7. BOTTLENECKS    identify single points of failure; scale/replicate/cache them
8. TRADEOFFS      state what you optimized for and what you gave up (there's always a cost)
```

### 2.2 Reliability engineering

- **Eliminate single points of failure:** redundancy (N+1), multi-AZ/region, failover.
- **Availability math:** 99.9% = ~8.7h downtime/yr; 99.99% = ~52 min/yr. Each nine costs
  exponentially more — match the target to the business need.
- **Graceful degradation:** shed load, serve stale cache, disable non-critical features under
  stress rather than failing wholesale.
- **Resilience patterns:** **timeouts** (never wait forever), **retries with exponential
  backoff + jitter** (avoid retry storms), **circuit breakers** (stop hammering a failing
  dependency), **bulkheads** (isolate failures), **rate limiting** (token/leaky bucket).

### 2.3 Monolith vs. microservices (decide deliberately)

| | Monolith | Microservices |
|---|---|---|
| Early-stage / small team | ✅ simpler, faster | ✗ premature complexity |
| Independent scaling/deploys | limited | ✅ |
| Operational overhead | low | high (network, observability, data consistency) |
| Failure modes | in-process | distributed (partial failure, latency, retries) |

> **Default to a (well-modularized) monolith** until organizational/scaling pressure justifies
> the *real* cost of distributed systems. "Microservices because Netflix does" is how small
> teams drown in YAML. Split along **bounded contexts** when you split at all.

### 2.4 Load balancing & traffic management

- **L4 (transport) vs L7 (application)** load balancing; L7 enables content/route-based routing.
- **Algorithms:** round-robin, least-connections, consistent-hash (sticky).
- **API gateway** centralizes auth, rate limiting, routing; **service mesh** (sidecars) handles
  service-to-service concerns at scale.

### 2.5 Observability (you can't operate what you can't see)

The three pillars + more:
- **Metrics** (rates, errors, durations — RED/USE methods), **logs** (structured, correlated),
  **traces** (distributed request flow across services).
- **SLI/SLO/SLA:** define Service Level *Indicators*, set *Objectives*, and an **error budget**
  that governs how aggressively you ship vs. stabilize.
- Alert on **symptoms** (user-facing SLO breaches), not every cause.

### 2.6 Worked archetypes (patterns to recognize)

- **URL shortener:** hash/counter key gen, read-heavy → cache + CDN, KV store.
- **News feed:** fan-out-on-write (push) vs. fan-out-on-read (pull) vs. hybrid for celebrities.
- **Rate limiter:** token/leaky bucket in Redis with atomic ops.
- **Chat/notifications:** websockets + pub/sub + presence + queue for delivery.
- **Search:** inverted index (Elasticsearch); separate from the source-of-truth DB.

---

## 3. Common Pitfalls

1. **Premature scaling / over-engineering.** Building for 1B users at 1k users; complexity with
   no payoff. Scale when metrics demand it.
2. **Premature microservices.** Distributed complexity before you have the scale or team to
   justify it.
3. **Ignoring back-of-envelope numbers.** Designing without sizing → wrong store, wrong topology.
4. **Stateful app servers.** Breaks horizontal scaling; externalize state.
5. **No caching strategy / bad invalidation.** Stale data or thundering herds.
6. **Bad shard key → hotspots.** Concentrated load defeats horizontal scaling.
7. **Synchronous everything.** No queues → spikes topple the system; no backpressure.
8. **Non-idempotent consumers** with at-least-once delivery → duplicate side effects.
9. **No timeouts / retries-without-backoff** → cascading failures and retry storms.
10. **Single points of failure** unaddressed; no failover plan.
11. **Strong consistency where eventual would do** (needless latency/cost) — or eventual where
    strong is mandatory (money/inventory corruption).
12. **No observability** → flying blind in production.

---

## 4. Advanced Resources

**Books**
- Kleppmann, M. *Designing Data-Intensive Applications* — the single best systems book
  (consistency, replication, partitioning, streaming).
- Newman, S. *Building Microservices* (2nd ed.) — when/how to split.
- *Site Reliability Engineering* (Google, free online): <https://sre.google/books/>
- Nygard, M. *Release It!* — resilience patterns (circuit breaker, bulkhead).

**Papers / references**
- Dean & Barroso. *The Tail at Scale.* CACM 2013 (tail latency).
- DeCandia et al. *Dynamo: Amazon's Highly Available Key-value Store.* SOSP 2007 (consistent
  hashing, eventual consistency).
- Lamport. *Time, Clocks, and the Ordering of Events in a Distributed System.* 1978.

**Practical**
- The System Design Primer (GitHub): <https://github.com/donnemartin/system-design-primer>
- AWS / Google Cloud Well-Architected Frameworks.

---

### Cross-references
- `dbms.md` — storage, replication, sharding, CAP/PACELC.
- `python-masterclass.md` / `javascript-masterclass.md` — concurrency models for services.
- `ai-ml-engineering.md` — serving/feature-pipeline infrastructure.
- `../04-security/network-defense.md` — securing distributed systems; rate limiting & DDoS.
