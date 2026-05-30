---
title: Database Systems (DBMS) Masterclass
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [basic SQL, data-structure literacy]
reading_time: ~44 min
last_updated: 2026-05-29
---

# Database Systems (DBMS) Masterclass

A database is a **durability + concurrency + query engine** built around one hard problem:
serve many concurrent readers/writers correct answers, fast, without losing data when the
power fails. Mastery means understanding the **relational model and normalization**, the
**storage/index layer (B-trees, the buffer pool)**, **transactions/ACID and isolation**, the
**query planner**, and the **CAP/consistency tradeoffs** that drive SQL-vs-NoSQL decisions.

---

## 1. Technical Mechanisms

### 1.1 The relational model & normalization

A relation (table) is a set of tuples over typed attributes; integrity is enforced by keys and
constraints. **Normalization** removes redundancy-driven anomalies (update/insert/delete):

| Form | Rule (informal) | Removes |
|---|---|---|
| 1NF | atomic values, no repeating groups | multivalued cells |
| 2NF | 1NF + no partial dependency on part of a composite key | partial-key redundancy |
| 3NF | 2NF + no transitive dependency (non-key → non-key) | transitive redundancy |
| BCNF | every determinant is a candidate key | remaining key anomalies |

> **Practical rule:** normalize to **3NF/BCNF** for transactional (OLTP) integrity, then
> *selectively denormalize* for read performance where measured. Premature denormalization is a
> top source of data-integrity bugs.

### 1.2 Storage & indexing: the B+-tree and the buffer pool

- Data lives in fixed-size **pages** (e.g., 8KB/16KB) on disk; the **buffer pool** caches hot
  pages in RAM. Most DB performance is "did the page hit the buffer pool or hit the disk."
- The dominant index is the **B+-tree**: balanced, high fan-out, O(log n) lookups, leaves
  linked for range scans. A node fills a page, so the tree is *shallow* (few page reads to reach
  any key).
- **Clustered vs. secondary index:** a clustered index *is* the table sorted by key; a
  secondary index stores key→row-locator and may require a second fetch ("bookmark lookup")
  unless it is **covering** (contains all selected columns).
- **Hash indexes** (O(1) equality, no range), **inverted indexes** (full-text), **LSM-trees**
  (write-optimized: RocksDB, Cassandra — buffer writes in memory, flush sorted runs, compact
  later — high write throughput, read amplification).

### 1.3 Transactions & ACID

- **Atomicity:** all-or-nothing (via a log / undo).
- **Consistency:** transactions move the DB between valid states (constraints hold).
- **Isolation:** concurrent transactions don't corrupt each other's view.
- **Durability:** committed data survives crashes — via the **Write-Ahead Log (WAL)**: log the
  change *before* the data page is written. `fsync` of the log at commit is what makes
  "committed" mean committed.

### 1.4 Isolation levels & the anomalies they prevent

| Level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed | prevented | possible | possible |
| Repeatable Read | prevented | prevented | possible* |
| Serializable | prevented | prevented | prevented |

\*Many engines (e.g., InnoDB) prevent phantoms at RR via next-key locks; semantics vary —
*read your DB's docs*. **MVCC** (PostgreSQL/InnoDB) lets readers see a consistent snapshot
without blocking writers by keeping multiple row versions. **Serializable Snapshot Isolation**
(PostgreSQL) gives true serializability by detecting dangerous read/write dependency cycles.

### 1.5 The query planner/optimizer

```
SQL → parse → logical plan → cost-based optimization (using table statistics)
   → physical plan (join order, index vs scan, join algorithm) → execute
```
- **Join algorithms:** nested-loop (good with an index on the inner table), hash join (large
  unsorted equality joins), merge join (sorted inputs / range).
- **Statistics drive it:** stale stats → bad row estimates → bad plans. `ANALYZE`/auto-stats
  matter.
- **Read `EXPLAIN (ANALYZE)`** to compare estimated vs. actual rows; a big mismatch signals a
  stats or predicate problem.

### 1.6 CAP, PACELC, and replication

- **CAP:** under a network **P**artition you must choose **C**onsistency or **A**vailability.
  (CAP only bites *during* partitions.)
- **PACELC:** *else* (no partition) you trade **L**atency vs **C**onsistency.
- **Replication:** synchronous (strong consistency, higher latency) vs. asynchronous (low
  latency, possible stale reads / lost writes on failover). Read replicas scale reads but add
  replication lag.

---

## 2. Application Frameworks

### 2.1 Schema & index design workflow

```
1. MODEL          entities + relationships; choose keys; normalize to 3NF.
2. ACCESS PATTERNS list the actual queries (the schema serves queries, not theory).
3. INDEX          index columns in WHERE/JOIN/ORDER BY of hot queries; composite + covering
                  indexes (leftmost-prefix rule).
4. MEASURE        EXPLAIN ANALYZE real queries; watch for seq scans on big tables, sorts, and
                  row-estimate errors.
5. DENORMALIZE    only where measured read cost justifies it; keep the source of truth normalized.
```

**Leftmost-prefix rule:** an index on `(a, b, c)` serves `WHERE a`, `WHERE a,b`, `WHERE a,b,c` —
but *not* `WHERE b` alone. Order columns by selectivity and query shape.

### 2.2 Writing planner-friendly SQL

- **`SELECT` only needed columns** (enables covering indexes; less I/O).
- **Sargable predicates:** `WHERE col = ?` uses the index; `WHERE func(col) = ?` usually can't —
  move the transform to the parameter side.
- **Pagination:** keyset/seek (`WHERE id > :last ORDER BY id LIMIT n`) scales; `OFFSET n`
  degrades linearly.
- **Beware implicit type casts** in joins/filters (kills index use).

### 2.3 The N+1 query problem (the most common ORM disaster)

```
# Anti-pattern (1 query for the list + N per child):
for user in session.query(User).all():      # 1 query
    print(user.orders)                       # N queries (lazy load per user)

# Fix: eager-load with a join / batch (1–2 queries total):
session.query(User).options(joinedload(User.orders)).all()
```

ORMs hide SQL; mastery means *logging the generated SQL* and knowing when to drop to raw SQL.

### 2.4 Transaction discipline

- Keep transactions **short**; long ones hold locks/old MVCC versions → bloat and contention.
- Acquire locks in a **consistent order** to prevent deadlocks; expect and retry deadlock
  errors (the engine aborts a victim).
- Use the **lowest isolation level that is still correct**; escalate to Serializable only where
  anomalies would corrupt invariants (e.g., balances).
- Make writes **idempotent** where retries are possible (unique keys, upserts).

### 2.5 SQL vs NoSQL decision framework

| Need | Lean SQL (Postgres/MySQL) | Lean NoSQL |
|---|---|---|
| Strong consistency, complex joins, transactions | ✅ | ✗ |
| Flexible/evolving document shape | acceptable (JSONB) | document (Mongo) |
| Massive write throughput, horizontal scale | (sharding effort) | wide-column (Cassandra) |
| Key-value cache / sessions | — | Redis (in-memory) |
| Full-text / vector search | extensions (pgvector, FTS) | Elasticsearch / vector DB |

> **Default to a relational database** (PostgreSQL is the strong general default) until a
> *measured* requirement justifies a specialized store.

### 2.6 Security & operations

- **Always parameterize queries** (prevents SQL injection — see
  `../04-security/owasp-frameworks.md`). Never string-concatenate user input into SQL.
- **Least-privilege DB accounts**; separate read-only roles.
- **Backups + tested restores** (an untested backup is not a backup); PITR via WAL archiving.
- **Connection pooling** (PgBouncer / app pool); unbounded pools exhaust the server.

---

## 3. Common Pitfalls

1. **N+1 queries** from ORM lazy loading — log SQL; eager-load/batch.
2. **Missing / non-sargable indexes** → sequential scans; function-wrapped columns.
3. **Over-indexing.** Every index slows writes and costs storage.
4. **Long-running transactions** → lock contention, MVCC bloat, replication lag.
5. **Wrong isolation level.** Too low corrupts invariants; too high needlessly serializes.
6. **`OFFSET` pagination** on deep pages — use keyset pagination.
7. **String-concatenated SQL** → injection. Parameterize, always.
8. **Premature denormalization / wrong store choice** → integrity bugs and painful migrations.
9. **Stale statistics** → bad plans; run ANALYZE / enable auto-stats.
10. **Ignoring buffer-pool/memory sizing** — a DB starved of RAM hits disk constantly.
11. **No tested backups / no migration strategy.**

---

## 4. Advanced Resources

**Foundational**
- Codd, E.F. *A Relational Model of Data for Large Shared Data Banks.* CACM, 1970.
- Hellerstein, Stonebraker, Hamilton. *Architecture of a Database System* (free monograph):
  <https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf>
- Bayer & McCreight (B-trees, 1972); O'Neil et al. (LSM-tree, 1996).

**Books**
- Kleppmann, M. *Designing Data-Intensive Applications* — the modern canon (storage,
  replication, consistency, CAP/PACELC).
- Garcia-Molina, Ullman, Widom. *Database Systems: The Complete Book.*

**Docs / practical**
- PostgreSQL documentation (MVCC, EXPLAIN, indexing): <https://www.postgresql.org/docs/>
- Use The Index, Luke! (SQL indexing): <https://use-the-index-luke.com/>
- Jepsen analyses (real-world consistency testing): <https://jepsen.io/analyses>

---

### Cross-references
- `system-design.md` — replication, sharding, caching, and CAP in distributed architecture.
- `python-masterclass.md` / `javascript-masterclass.md` — ORM/driver usage & N+1.
- `../04-security/owasp-frameworks.md` — SQL injection prevention (parameterized queries).
