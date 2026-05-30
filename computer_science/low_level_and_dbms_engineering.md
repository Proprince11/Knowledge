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

## Cross-references

`../03-computer-science-architecture/c-masterclass.md` ·
`../03-computer-science-architecture/cpp-masterclass.md` ·
`../03-computer-science-architecture/javascript-masterclass.md` ·
`../03-computer-science-architecture/python-masterclass.md` ·
`../03-computer-science-architecture/dbms.md` ·
`../03-computer-science-architecture/system-design.md` ·
`../04-security/owasp-frameworks.md`
