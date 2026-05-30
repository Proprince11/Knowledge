---
title: Python Masterclass
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [basic programming]
reading_time: ~42 min
last_updated: 2026-05-29
---

# Python Masterclass

Python's design philosophy ("there should be one obvious way to do it") hides deep machinery:
**everything is an object**, names are *references* (not boxes), the **data model** (dunder
methods) is the real API of the language, and the **GIL** shapes every concurrency decision.
Mastery means understanding the object/reference model, the data model, iteration/generators,
and the genuine differences between threads, processes, and async — plus the modern tooling
that makes Python projects reproducible.

---

## 1. Technical Mechanisms

### 1.1 Objects, names, and references (the #1 source of confusion)

In Python, a variable is a **name bound to an object**, not a container. Assignment binds a
name; it never copies.

```python
a = [1, 2, 3]
b = a            # b and a name the SAME list object
b.append(4)
print(a)         # [1, 2, 3, 4]  -- not a copy!
```

- **Mutable** (`list`, `dict`, `set`, most objects) vs **immutable** (`int`, `float`, `str`,
  `tuple`, `frozenset`). Immutability is about the *object*, not the name.
- **Identity vs equality:** `is` compares identity (same object), `==` compares value. Use
  `is` only for `None`/sentinels.
- **The mutable default argument trap:** `def f(x, acc=[])` — the default list is created
  *once* at definition and shared across calls. Use `acc=None` then `acc = acc or []`.

### 1.2 The data model (dunder methods = the language's interface)

Python's syntax is sugar over special methods. To make a class behave like a built-in, implement
the protocol:

| Protocol | Methods | Enables |
|---|---|---|
| Representation | `__repr__`, `__str__` | debugging, printing |
| Equality/hash | `__eq__`, `__hash__` | dict/set membership |
| Ordering | `__lt__`, … (or `@total_ordering`) | sorting, comparisons |
| Container | `__len__`, `__getitem__`, `__contains__`, `__iter__` | `len`, `[]`, `in`, iteration |
| Context mgr | `__enter__`, `__exit__` | `with` blocks (RAII-like) |
| Callable | `__call__` | instances usable as functions |
| Numeric | `__add__`, `__mul__`, … | operator overloading |

> **Pythonic mastery:** you don't call dunders directly — you implement them so the *built-in*
> functions and operators work on your objects. `len(x)` calls `x.__len__()`; `with x:` calls
> `__enter__`/`__exit__`.

### 1.3 Iteration: iterables, iterators, and generators

- An **iterable** has `__iter__` returning an **iterator** (has `__next__`, raises
  `StopIteration` when exhausted).
- **Generators** (functions with `yield`) produce values lazily, holding state between calls —
  O(1) memory for arbitrarily large/infinite sequences:

```python
def read_chunks(path, size=8192):
    with open(path, 'rb') as f:
        while chunk := f.read(size):   # walrus operator; lazy, constant memory
            yield chunk
```

- **Generator expressions** `(x*x for x in it)` are lazy; list comprehensions `[…]` are eager.
  Prefer generators for pipelines and large data.

### 1.4 The execution model: CPython, bytecode, the GIL

- CPython compiles source to **bytecode** (`.pyc`) executed by a stack-based VM. Inspect with
  `dis.dis(fn)`.
- The **Global Interpreter Lock (GIL)** allows only one thread to execute Python bytecode at a
  time. Consequences:
  - **CPU-bound** parallelism does *not* scale with threads → use **`multiprocessing`** (separate
    processes, separate GILs) or native extensions / `numpy` (which release the GIL).
  - **I/O-bound** concurrency *does* benefit from threads/async, because the GIL is released
    during blocking I/O.
  - Python 3.13+ ships an experimental **free-threaded (no-GIL) build**; the default still has a
    GIL.

### 1.5 Concurrency decision matrix

| Workload | Tool | Why |
|---|---|---|
| I/O-bound, many tasks | `asyncio` (async/await) | cooperative, single thread, no GIL contention |
| I/O-bound, blocking libs | `threading` / `ThreadPoolExecutor` | GIL released during I/O |
| CPU-bound | `multiprocessing` / `ProcessPoolExecutor` | bypass GIL with separate processes |
| Numeric CPU-bound | `numpy`/native libs | vectorized C that releases the GIL |

`asyncio` mirrors JS's event loop: a single thread, `await` yields control; never call a
blocking function inside a coroutine (it stalls the whole loop — offload with
`run_in_executor`).

### 1.6 Scope, closures, and the LEGB rule

Name resolution order: **Local → Enclosing → Global → Built-in**. `global` and `nonlocal`
rebind outer names. Closures capture *variables by reference* (late binding) — the loop-variable
closure trap mirrors JS's; bind via a default argument `lambda x=i: x`.

---

## 2. Application Frameworks

### 2.1 Pythonic idioms (the "one obvious way")

```python
# Comprehensions over manual loops:
squares = [x*x for x in range(10) if x % 2 == 0]
index = {name: i for i, name in enumerate(names)}

# EAFP over LBYL (ask forgiveness, not permission):
try:
    value = config["key"]
except KeyError:
    value = default          # idiomatic; avoids race + double lookup

# Context managers for guaranteed cleanup:
with open(path) as f, lock:  # multiple managers
    process(f)               # file + lock released even on exception

# Unpacking:
first, *rest = sequence
a, b = b, a                  # swap
```

### 2.2 Modern type hints (gradual typing)

```python
from collections.abc import Iterable

def total(prices: Iterable[float]) -> float:
    return sum(prices)

# 3.10+ syntax:
def find(users: list[dict[str, int]], uid: int) -> dict[str, int] | None: ...
```

Hints are **not enforced at runtime** — they enable static checkers (`mypy`, `pyright`), better
IDEs, and self-documentation. Use them in any non-trivial codebase. `dataclasses` /
`pydantic` turn hints into real data structures with validation.

### 2.3 Data structures & their complexity

| Structure | Lookup | Insert | Notes |
|---|---|---|---|
| `list` | O(n) search, O(1) index | O(1) amortized append | ordered, dynamic array |
| `dict` | O(1) avg | O(1) avg | insertion-ordered (3.7+), hash table |
| `set` | O(1) avg membership | O(1) avg | dedup, set algebra |
| `collections.deque` | — | O(1) both ends | queue/stack |
| `heapq` | O(1) peek | O(log n) push/pop | priority queue (on a list) |
| `collections.Counter` / `defaultdict` | — | — | counting / auto-default patterns |

> Reach for `dict`/`set` for membership and dedup before writing nested loops — most "slow
> Python" is an O(n²) loop that should be an O(n) dict lookup.

### 2.4 Decorators & higher-order patterns

```python
import functools, time

def timed(fn):
    @functools.wraps(fn)                 # preserves name/docstring/metadata
    def wrapper(*args, **kwargs):
        t0 = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter()-t0:.4f}s")
    return wrapper
```

`functools` (`lru_cache`, `partial`, `reduce`, `wraps`), `contextlib` (`contextmanager`,
`suppress`), and `itertools` (lazy combinatorics) are the standard-library power tools.

### 2.5 Project & environment tooling (reproducibility)

- **Environments:** `venv` / `uv` / `conda`. Never install into the system Python; isolate per
  project. (Sandbox has `uv`, `pyenv`, Python 3.10–3.14.)
- **Dependency/locking:** `pyproject.toml` + `uv`/`pip-tools`/Poetry for pinned, reproducible
  installs.
- **Quality:** `ruff` (fast lint+format), `black` (format), `mypy`/`pyright` (types),
  `pytest` (testing). Wire into pre-commit + CI.

---

## 3. Common Pitfalls

1. **Mutable default arguments.** `def f(x=[])` shares one list across calls — use `None`
   sentinel.
2. **Reference vs copy confusion.** Assignment aliases; use `copy.copy`/`copy.deepcopy` or
   slicing for true copies; nested structures need deep copy.
3. **Expecting threads to speed up CPU work.** The GIL serializes bytecode — use
   `multiprocessing` or native libs.
4. **Blocking calls inside `asyncio`.** Stalls the whole event loop; offload to an executor.
5. **`is` vs `==`.** `is` only for `None`/singletons; `==` for value equality (`a is b` for
   small ints "works" by caching — don't rely on it).
6. **Late-binding closures in loops.** Capture by default arg.
7. **Catching bare `except:`** swallows `KeyboardInterrupt`/`SystemExit` and hides bugs; catch
   specific exceptions.
8. **Modifying a list/dict while iterating it** → `RuntimeError`/skipped items; iterate a copy
   or build a new collection.
9. **Floating point for money** (`0.1+0.2`); use `decimal.Decimal` or integer cents.
10. **Installing into system Python / no lockfile** → unreproducible "works on my machine."
11. **O(n²) membership loops** that should be `set`/`dict` lookups.

---

## 4. Advanced Resources

**Official**
- Python Language Reference & Data Model: <https://docs.python.org/3/reference/datamodel.html>
- The Python Tutorial & stdlib docs: <https://docs.python.org/3/>
- PEP index (esp. PEP 8 style, PEP 484 typing, PEP 20 Zen): <https://peps.python.org/>

**Books / talks**
- Ramalho, L. *Fluent Python* (2nd ed.) — the definitive data-model / idiom deep dive.
- Beazley, D. talks on generators, coroutines, and the GIL (PyCon).
- Slatkin, B. *Effective Python* — 90 actionable best practices.

**Tooling**
- `uv` (<https://docs.astral.sh/uv/>), `ruff` (<https://docs.astral.sh/ruff/>),
  `mypy` (<https://mypy.readthedocs.io/>), `pytest` (<https://docs.pytest.org/>).

---

### Cross-references
- `javascript-masterclass.md` — contrast `asyncio`'s event loop with JS's single-threaded loop.
- `ai-ml-engineering.md` & `llm-fine-tuning.md` — Python is the lingua franca of ML.
- `dbms.md` — Python ORMs/drivers and the N+1 query trap.
- `system-design.md` — process/thread/async tradeoffs in service architecture.
