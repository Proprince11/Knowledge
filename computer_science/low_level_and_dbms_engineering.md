---
title: Low-Level & DBMS Engineering — A Masterclass
domain: Computer Science
status: done
depth: graduate
effort: xhigh
modules: [Advanced C/C++, Advanced JavaScript & Python, DBMS & SQL Optimization]
last_updated: 2026-05-30
---

# Low-Level & DBMS Engineering — A Masterclass

A principal-engineer's reference spanning manual memory at the metal (C/C++), concurrency in
managed runtimes (JS/Python), and the storage/query engine beneath every app (DBMS/SQL).
Production-ready code throughout. Zero fluff.

---

## Module 1 — Advanced C/C++

### 1.1 Pointers & pointers-to-pointers
A pointer is an address + a static type governing arithmetic (`p+1` advances `sizeof(*p)`).
`T**` is for: mutating a caller's pointer, dynamic 2-D structures, and arrays of strings (`argv`).

```c
#include <stdlib.h>
#include <string.h>

/* Out-parameter: function allocates, hands ownership back via T**. 0=ok, -1=fail. */
int make_buffer(size_t n, unsigned char **out) {
    if (!out) return -1;
    unsigned char *p = malloc(n);
    if (!p) return -1;                 /* ALWAYS check malloc */
    memset(p, 0, n);
    *out = p;                          /* write through the double pointer */
    return 0;
}

void take_ownership(unsigned char **slot) {
    free(*slot);
    *slot = NULL;                      /* neutralize dangling / double-free */
}
```

Array-to-pointer **decay**: `sizeof(arr)` inside a function that received it = pointer size; pass
length explicitly. `const int *p` (ptr to const int) vs `int *const p` (const ptr) — read R→L.

### 1.2 Dynamic memory allocation mechanics

```c
/* realloc safely: never assign back to the original, or a failure leaks it. */
int grow(int **arr, size_t *cap, size_t want) {
    if (want <= *cap) return 0;
    size_t newcap = *cap ? *cap : 1;
    while (newcap < want) newcap *= 2;             /* amortized O(1) growth */
    int *tmp = realloc(*arr, newcap * sizeof *tmp);
    if (!tmp) return -1;                           /* original still valid */
    *arr = tmp; *cap = newcap; return 0;
}
```

`malloc` (uninit), `calloc` (zeroed, overflow-checked product), `realloc` (may move—use a temp),
`free` once. Heap = allocator (ptmalloc/jemalloc) over `brk`/`mmap`; small allocs via size-class
free lists, large via `mmap`. Batch small objects to cut header overhead + fragmentation.

### 1.3 Preventing buffer overflows

```c
/* Bounded + always NUL-terminated. */
char dst[32];
int n = snprintf(dst, sizeof dst, "%s", src);
if (n < 0 || (size_t)n >= sizeof dst) { /* handle truncation */ }

/* Overflow-safe bound check: `size <= len - off`, NOT `off + size > len` (the add can wrap). */
int read_u32(const uint8_t *buf, size_t len, size_t off, uint32_t *out) {
    if (!buf || !out) return -1;
    if (off > len || sizeof(uint32_t) > len - off) return -1;
    memcpy(out, buf + off, sizeof *out);           /* alignment- & aliasing-safe */
    return 0;
}
```

Never `gets`; avoid unbounded `strcpy`/`sprintf`/`strcat`. Build with
`-Wall -Wextra -Wconversion -D_FORTIFY_SOURCE=2 -fstack-protector-strong`; ASLR/NX/canaries are
defense-in-depth. Find bugs with `-fsanitize=address,undefined`, Valgrind, clang-tidy. Warnings = errors in CI.

### 1.4 Custom memory management — arena/bump allocator

```c
typedef struct { unsigned char *base; size_t cap, off; } Arena;
static size_t align_up(size_t n, size_t a){ return (n + (a-1)) & ~(a-1); }

void *arena_alloc(Arena *a, size_t size, size_t align) {
    size_t cur = align_up(a->off, align);
    if (cur + size > a->cap) return NULL;          /* out of arena */
    void *p = a->base + cur; a->off = cur + size; return p;   /* O(1) */
}
void arena_reset(Arena *a){ a->off = 0; }          /* free everything at once */
```

**C++ RAII** expresses the same discipline — lifetime-bound resources, deterministic destruction:

```cpp
#include <memory>
std::unique_ptr<Widget> w = std::make_unique<Widget>();  // sole owner, no manual delete
std::shared_ptr<Widget> s = std::make_shared<Widget>();  // shared, atomic refcount
// weak_ptr breaks cycles; raw T*/T& are NON-owning views. Never raw new/delete in app code.
```

**Rule of Zero/Five.** Prefer classes needing no user-declared dtor/copy/move; if you declare one
of the five, reason about all five.

---

## Module 2 — Advanced JavaScript & Python

### 2.1 Concurrency vs parallelism

- **Concurrency** = interleaving progress on tasks (great for **I/O-bound**).
- **Parallelism** = literally simultaneous execution on multiple cores (needed for **CPU-bound**).

Both JS and CPython execute *their own* code single-threaded → concurrency via event loops; true
CPU parallelism needs separate workers/processes.

### 2.2 JavaScript event loop & async

After the call stack empties, the loop **drains ALL microtasks** (Promises), then takes **one
macrotask** (timer/I/O), then drains microtasks again.

```js
console.log('A');
setTimeout(() => console.log('D (macro)'), 0);
Promise.resolve().then(() => console.log('C (micro)'));
console.log('B');
// A, B, C, D  — microtasks flush before the next macrotask.
```

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]); // concurrent (fast)
// sequential awaits would be slow. fetch rejects only on network error — check res.ok.
const worker = new Worker('./hash.js', { type: 'module' }); // real parallelism for CPU work
```

### 2.3 Python: GIL, asyncio, threads, processes

| Workload | Tool | Why |
|---|---|---|
| I/O-bound, many | `asyncio` | cooperative loop, no GIL contention |
| I/O-bound, blocking libs | `ThreadPoolExecutor` | GIL released during I/O |
| CPU-bound | `ProcessPoolExecutor` | separate interpreters bypass GIL |
| Numeric | NumPy/native | C releases the GIL |

```python
import asyncio, aiohttp
async def fetch(s, u):
    async with s.get(u) as r: return await r.text()
async def main(urls):
    async with aiohttp.ClientSession() as s:
        return await asyncio.gather(*(fetch(s, u) for u in urls))  # concurrent on 1 thread
```

```python
from concurrent.futures import ProcessPoolExecutor
def cpu_heavy(n): return sum(i*i for i in range(n))
if __name__ == "__main__":
    with ProcessPoolExecutor() as ex:               # real parallelism, bypasses GIL
        results = list(ex.map(cpu_heavy, [10**7]*8))
```

**Never block inside a coroutine** — offload with `loop.run_in_executor`. Py3.13+ has an
experimental no-GIL build; default still has a GIL.

---

## Module 3 — DBMS & SQL Optimization

### 3.1 Production schema (3NF, typed, constrained) — PostgreSQL

```sql
CREATE TABLE users (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      CITEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE orders (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT   NOT NULL CHECK (status IN ('pending','paid','shipped','cancelled')),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),   -- money as integer cents, never float
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    qty        INT    NOT NULL CHECK (qty > 0),
    unit_cents BIGINT NOT NULL CHECK (unit_cents >= 0),
    PRIMARY KEY (order_id, product_id)
);
```

### 3.2 Indexing — B-Tree vs Hash

```sql
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC); -- range + sort
CREATE INDEX idx_orders_user_incl ON orders (user_id) INCLUDE (status, total_cents); -- covering
CREATE INDEX idx_orders_open ON orders (user_id) WHERE status = 'pending';  -- partial
CREATE INDEX idx_users_email_hash ON users USING hash (email);              -- equality-only
```

| Property | B-Tree | Hash |
|---|---|---|
| Equality | yes O(log n) | yes O(1) avg |
| Range / `BETWEEN` | **yes** | no |
| `ORDER BY` / prefix `LIKE 'a%'` | **yes** | no |
| Default | **almost always** | niche equality hot paths |

Composite indexes obey the **leftmost-prefix** rule. Keep predicates **sargable**
(`WHERE col=$1`, not `WHERE func(col)=$1`). Every index slows writes — index hot
`WHERE`/`JOIN`/`ORDER BY` columns, then stop.

### 3.3 Execution plans

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, total_cents FROM orders
WHERE user_id = 42 AND created_at >= now() - interval '30 days'
ORDER BY created_at DESC LIMIT 20;
```

Read the tree leaves-first. Red flags: **Seq Scan** on a big table (missing/unused index), large
**estimated vs actual** row gap (stale stats → `ANALYZE`), expensive **Sort** (an ordered index
removes it), **Nested Loop** over many rows (prefer hash/merge join). The planner is cost-based +
statistics-driven.

### 3.4 Normalization vs denormalization

- **Normalize (3NF/BCNF) for OLTP:** kills update/insert/delete anomalies, single source of truth.
- **Denormalize for proven read-heavy paths:** precomputed aggregates / materialized views trade
  write complexity + storage + staleness for fewer joins.

```sql
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT u.id AS user_id, COUNT(o.id) AS order_count,
       COALESCE(SUM(o.total_cents),0) AS lifetime_cents
FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id;
CREATE UNIQUE INDEX ON user_order_summary (user_id);   -- enables REFRESH ... CONCURRENTLY
```

**Heuristic:** normalize until it hurts a measured hot path, then denormalize until it works —
and document the refresh/consistency contract.

### 3.5 Transactions & safe writes

ACID via WAL (`fsync` before commit). Isolation: Read Committed → Repeatable Read → Serializable
(each prevents more anomalies at higher cost); PostgreSQL MVCC = readers don't block writers. Keep
transactions short; lock in consistent order (avoid deadlocks); make retried writes **idempotent**
(upserts); **always parameterize** (no SQL injection).

---

## Module 4 — Advanced C/C++ Systems Programming

### 4.1 Intrusive data structures + `container_of`

Intrusive containers embed link nodes **inside** the payload struct → zero extra allocations, one
cache line, O(1) splice. The Linux kernel pattern recovers the owner from an embedded member:

```c
#include <stddef.h>
#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

typedef struct list_node { struct list_node *prev, *next; } list_node;

typedef struct { int id; list_node link; } Task;   /* link is EMBEDDED, not a pointer */

static inline void list_add(list_node *head, list_node *n) {
    n->prev = head; n->next = head->next;
    head->next->prev = n; head->next = n;           /* O(1), no malloc */
}
/* Recover the Task from its embedded node: */
Task *t = container_of(node, Task, link);
```

### 4.2 Slab / fixed-size pool allocator (free-list, O(1) alloc & free)

```c
typedef struct slab {
    void  *free_list;        /* singly-linked list of free cells (reuses cell memory) */
    unsigned char *arena;    /* backing block */
    size_t cell, cap, used;
} Slab;

int slab_init(Slab *s, void *mem, size_t bytes, size_t cell) {
    if (cell < sizeof(void *)) cell = sizeof(void *);   /* must hold a next-pointer */
    s->arena = mem; s->cell = cell; s->cap = bytes / cell; s->used = 0; s->free_list = NULL;
    for (size_t i = 0; i < s->cap; i++) {               /* thread every cell onto the free list */
        void **slot = (void **)(s->arena + i * cell);
        *slot = s->free_list; s->free_list = slot;
    }
    return 0;
}
void *slab_alloc(Slab *s) {
    if (!s->free_list) return NULL;
    void **slot = s->free_list; s->free_list = *slot;   /* pop head — O(1) */
    s->used++; return slot;
}
void slab_free(Slab *s, void *p) {
    void **slot = p; *slot = s->free_list; s->free_list = slot;  /* push head — O(1) */
    s->used--;
}
/* Pools eliminate fragmentation + per-alloc headers for hot, same-size objects (conns, events). */
```

### 4.3 Lock-free SPSC ring buffer (atomics + memory ordering)

Single-producer/single-consumer queue with **acquire/release** ordering — no mutex, no CAS loop:

```c
#include <stdatomic.h>
#include <stdint.h>
typedef struct {
    void   **buf;
    size_t   mask;                 /* capacity is a power of two; index & mask wraps */
    _Atomic size_t head, tail;     /* producer writes tail, consumer writes head */
} SpscRing;

int spsc_push(SpscRing *r, void *item) {
    size_t t = atomic_load_explicit(&r->tail, memory_order_relaxed);
    size_t h = atomic_load_explicit(&r->head, memory_order_acquire);  /* see consumer's progress */
    if (((t + 1) & r->mask) == (h & r->mask)) return -1;              /* full */
    r->buf[t & r->mask] = item;
    atomic_store_explicit(&r->tail, t + 1, memory_order_release);     /* publish item, then index */
    return 0;
}
int spsc_pop(SpscRing *r, void **out) {
    size_t h = atomic_load_explicit(&r->head, memory_order_relaxed);
    size_t t = atomic_load_explicit(&r->tail, memory_order_acquire);  /* see producer's publish */
    if (h == t) return -1;                                            /* empty */
    *out = r->buf[h & r->mask];
    atomic_store_explicit(&r->head, h + 1, memory_order_release);
    return 0;
}
/* release on the writer pairs with acquire on the reader => the item store is visible before the
   index update is observed. Relaxed is safe for a thread's own index. */
```

### 4.4 Strict aliasing, `restrict`, and alignment

- **Strict aliasing:** the compiler assumes pointers of *different* types don't alias; violating it
  is UB. Type-pun via `memcpy` (optimized to a load) or a `union`, never via incompatible-pointer
  casts.
- **`restrict`** promises a pointer is the sole access path to its object → enables vectorization:

```c
void axpy(size_t n, float a, const float *restrict x, float *restrict y) {
    for (size_t i = 0; i < n; i++) y[i] += a * x[i];   /* no aliasing => auto-vectorizes */
}
```

- **Alignment:** `_Alignas`, `alignof`; misaligned access is slow or UB on some ISAs. Pad/align hot
  structs to **64-byte cache lines** to prevent false sharing between cores.

---

## Module 5 — Managed-Runtime Internals (V8 & CPython)

### 5.1 V8: hidden classes, inline caches, and deopt

- **Hidden classes (Maps/Shapes):** V8 assigns objects with the *same property layout, added in the
  same order* a shared hidden class → property access becomes a fixed offset load, not a hash lookup.
- **Inline caches (ICs):** a call/property site caches the hidden class it saw → **monomorphic**
  sites are fastest; **polymorphic** (2–4 shapes) slower; **megamorphic** falls back to the runtime.
- **Rules that keep code fast:** initialize all fields in the constructor in a stable order; don't
  add/delete properties later; keep arrays **packed** and **same-element-type** (avoid holes and
  mixing ints/doubles/objects). Violations trigger **deoptimization** back to bytecode.

```js
// FAST: every Point shares one hidden class; field access is an offset load.
class Point { constructor(x, y) { this.x = x; this.y = y; } }
// SLOW: shape mutates after construction -> new hidden class -> IC churn -> deopt.
const p = new Point(1, 2); p.z = 3; delete p.x;
```

- **GC:** generational. **Scavenger** (Cheney semi-space copy) collects the short-lived **young
  generation** cheaply; survivors promote to **old space**, collected by **mark–sweep–compact**
  (incremental + concurrent + parallel to bound pause time). Implication: short-lived allocations
  are nearly free; long-lived churn is what costs you.

### 5.2 CPython: object model, refcounting, cyclic GC, pymalloc

- Everything is a heap `PyObject*` with a header `{ Py_ssize_t ob_refcnt; PyTypeObject *ob_type; }`.
- **Reference counting** frees objects immediately at refcount 0 (deterministic), but **cannot
  reclaim cycles** → a separate **generational cyclic GC** (3 generations) detects unreachable
  cycles via reference traversal.
- **pymalloc:** a pool/arena allocator for small objects (≤512 B) over 256 KiB arenas, size-class
  pools — analogous to the slab allocator above. Large objects go straight to `malloc`.

```python
import sys, gc
a = []; a.append(a)              # self-referential cycle
print(sys.getrefcount(a))        # refcount (note: arg passing adds a temporary ref)
del a; gc.collect()              # only the cyclic collector can reclaim the cycle
```

### 5.3 The GIL and the no-GIL future (precise)

The CPython **GIL** serializes bytecode execution: one thread holds the interpreter lock at a time,
so pure-Python CPU work does **not** scale across threads. The GIL is **released** during blocking
I/O and inside many C extensions (NumPy, `hashlib`, compression) → threads *do* help those.
**PEP 703** adds an experimental **free-threaded** build (3.13+, `--disable-gil`) using biased
reference counting + per-object locks; default builds still ship the GIL.

| Symptom | Diagnosis | Fix |
|---|---|---|
| 8 threads, ~1 core of throughput, CPU-bound | GIL contention | `ProcessPoolExecutor` / native lib |
| Threads help, then plateau | I/O releases GIL but CPU section serializes | move CPU work to processes |
| `asyncio` app stalls on one request | a blocking call inside a coroutine | `loop.run_in_executor` |

---

## Module 6 — Storage Engine & Query Optimizer Internals

### 6.1 B+Tree geometry (why lookups are 3–4 I/Os on billions of rows)

For page size `P`, key+pointer size `k`, the **fanout** `f ≈ P / k`. A tree of `N` keys has height:

```
h = ⌈ log_f (N) ⌉           leaves hold data (B+Tree); internal nodes hold separators only
```

With `P = 8 KiB` and `k ≈ 16 B`, `f ≈ 512`, so `h = 3` indexes ~`512³ ≈ 1.34×10⁸` rows in **3 page
reads** (root + internal are usually cached → effectively 1 physical I/O). B+Tree (vs B-Tree) chains
leaves in a linked list → **range scans** and `ORDER BY` walk leaves sequentially.

### 6.2 LSM-trees & the amplification trade-offs (RocksDB/Cassandra)

Writes buffer in an in-memory **memtable** → flushed as immutable sorted **SSTables** → merged by
**compaction**. Three amplifications govern the design:

```
Write amplification  WA ≈ levels × fan-out           (each byte rewritten during compaction)
Read amplification   RA ≈ #SSTables checked          (mitigated by Bloom filters per SSTable)
Space amplification  SA ≈ extra copies before merge
Leveled compaction  -> low SA/RA, high WA   |   Tiered -> low WA, high SA/RA
```

B+Tree = read-optimized, in-place (update-heavy OLTP); LSM = write-optimized, append-only
(ingest-heavy, time-series). A **Bloom filter** ("probably present / definitely absent",
false-positive rate `≈ (1 − e^{−kn/m})^k`) lets an LSM skip SSTables that can't hold the key.

### 6.3 Cost-based optimizer — selectivity, cardinality, join ordering

The planner enumerates plans and scores each by an estimated **cost** = `cpu_cost + io_cost`,
driven by **cardinality estimates** from histograms (`ANALYZE`):

```
selectivity(col = c)        ≈ 1 / n_distinct(col)        (uniform assumption)
selectivity(col < c)        ≈ (c − min) / (max − min)    (refined by histogram buckets)
selectivity(P_a AND P_b)    ≈ s_a · s_b                  (independence assumption — often wrong!)
rows_out = rows_in · selectivity
```

Bad row estimates (correlated predicates, skew, stale stats) are the #1 cause of catastrophic plans
(a Nested Loop chosen because the inner side was estimated at 5 rows but returns 5 million). Fixes:
`ANALYZE`, extended statistics (`CREATE STATISTICS` for correlated columns), or query restructuring.

**Join ordering** is combinatorial; optimizers use **dynamic programming** (System-R style) over
subsets for small joins and **greedy/genetic** search beyond a threshold (e.g. Postgres
`geqo_threshold`):

```
bestPlan(S) = min over split (S = L ∪ R) of  cost(bestPlan(L) ⋈ bestPlan(R))
join algos: Nested Loop (good w/ index on inner, few outer rows) |
            Hash Join (large unsorted equi-joins) | Merge Join (pre-sorted / indexed inputs)
```

### 6.4 MVCC and isolation anomalies (what each level actually prevents)

PostgreSQL MVCC keeps **row versions** (`xmin`/`xmax`); a snapshot sees versions committed before it
→ **readers never block writers**. `VACUUM` reclaims dead tuples.

| Isolation | Dirty read | Non-repeatable read | Phantom | Write skew |
|---|---|---|---|---|
| Read Committed | ✗ prevented | possible | possible | possible |
| Repeatable Read (PG: snapshot) | ✗ | ✗ | ✗ (in PG) | possible |
| Serializable (PG: SSI) | ✗ | ✗ | ✗ | ✗ prevented |

Higher isolation = fewer anomalies, more aborts/retries → **make writes idempotent and retry on
`40001` serialization failures**.

### 6.5 Durability: WAL + checkpoints

Write-Ahead Logging: the log record is `fsync`-ed **before** the data page is written (the "D" in
ACID). Commit = log flushed. **Checkpoints** periodically flush dirty pages and advance the redo
point, bounding crash-recovery time. Group commit batches `fsync`s to amortize disk latency.

### 6.6 Scaling: partitioning, sharding, and pool sizing

- **Partitioning** (one DB): range/list/hash partitions enable **partition pruning** (planner skips
  irrelevant partitions) and cheap bulk drops of old data.
- **Sharding** (many DBs): horizontal split by a **shard key**; choose a key with even distribution
  and that co-locates joined data. Cross-shard joins/transactions are the cost.
- **Connection pool sizing** via **Little's Law** — `L = λ · W` (concurrency = arrival rate ×
  service time). A pool far larger than `cores × (1 + wait/compute)` just adds context-switching and
  lock contention; size it from measured `W`, then load-test.

```sql
-- Range partitioning with automatic pruning on the partition key.
CREATE TABLE events (id bigint, ts timestamptz NOT NULL, payload jsonb) PARTITION BY RANGE (ts);
CREATE TABLE events_2026_05 PARTITION OF events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
-- WHERE ts >= '2026-05-10' scans only events_2026_05 (the planner prunes the rest).
```

---

## Cross-references

`../03-computer-science-architecture/c-masterclass.md` ·
`../03-computer-science-architecture/cpp-masterclass.md` ·
`../03-computer-science-architecture/javascript-masterclass.md` ·
`../03-computer-science-architecture/python-masterclass.md` ·
`../03-computer-science-architecture/dbms.md` ·
`../03-computer-science-architecture/system-design.md` ·
`../04-security/owasp-frameworks.md`
