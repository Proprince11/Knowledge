---
title: C Masterclass
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [basic programming, comfort with binary/hex, command line]
reading_time: ~40 min
last_updated: 2026-05-29
---

# C Masterclass

C is a **portable assembler**: a thin, predictable abstraction over the machine where almost
every construct maps to a handful of instructions and you, not a runtime, manage memory and
lifetime. Mastery of C is mastery of the **memory model, undefined behavior, and the
translation pipeline** — because C's power and its danger both come from the absence of guard
rails. This file targets the mental models that separate people who *write* C from people who
*reason about* C.

---

## 1. Technical Mechanisms

### 1.1 The translation pipeline

```
.c  → [preprocessor]  → translation unit → [compiler] → .s (asm) → [assembler] → .o
.o + libs → [linker] → executable
```

- **Preprocessor (`cpp`):** textual substitution — `#include` (paste file), `#define`
  (macros, *no type safety, beware multiple evaluation*), conditional compilation. Inspect with
  `gcc -E`.
- **Compiler:** parses one *translation unit*, applies optimizations, emits assembly
  (`gcc -S`). The **as-if rule** lets it reorder/eliminate anything as long as observable
  behavior is preserved (this is why UB is so dangerous — the compiler assumes it never
  happens).
- **Linker:** resolves symbols across `.o` files and libraries; static (`.a`, copied in) vs.
  dynamic (`.so`/`.dll`, resolved at load). Understand `extern`, internal vs. external linkage,
  and the One Definition Rule.

### 1.2 The memory model: storage durations

| Storage | Lifetime | Where | Created by |
|---|---|---|---|
| **Automatic** | enclosing block | stack | local non-`static` vars |
| **Static** | whole program | data/BSS | `static` / globals |
| **Allocated** | until `free` | heap | `malloc`/`calloc`/`realloc` |
| **Thread** (C11) | thread | TLS | `_Thread_local` |

The **stack** grows/shrinks with call frames (LIFO, fast, bounded — stack overflow is real).
The **heap** is managed explicitly; every `malloc` needs exactly one `free`. `.data` holds
initialized globals; `.bss` holds zero-initialized ones (costs no file space).

### 1.3 Pointers, arrays, and decay

- A pointer is an address + a *type* (which governs arithmetic: `p + 1` advances by
  `sizeof(*p)`).
- **Array-to-pointer decay:** in most expressions an array name becomes a pointer to its first
  element — which is why `sizeof(arr)` inside a function that received `arr` gives pointer size,
  not array size. Pass length explicitly.
- `a[i] == *(a + i) == *(i + a) == i[a]` — array subscript is commutative pointer arithmetic.
- **`const` placement:** `const int *p` (pointer to const int) vs. `int *const p` (const
  pointer to int) — read right-to-left.

### 1.4 Undefined / unspecified / implementation-defined behavior

This is the crux of C. The standard defines three buckets:
- **Undefined (UB):** anything may happen (no diagnostic required) — dereferencing freed/NULL
  pointers, signed integer overflow, out-of-bounds access, data races, using uninitialized
  values, violating strict aliasing. *The optimizer assumes UB never occurs and deletes code
  accordingly.*
- **Unspecified:** a choice from a set, no documentation required (e.g., order of evaluation
  of function arguments).
- **Implementation-defined:** a documented choice (e.g., `sizeof(int)`, right-shift of
  negative ints, char signedness).

> **Master rule:** *You cannot reason about a C program that contains UB.* The classic
> `if (ptr + offset < ptr)` overflow check is deleted by the compiler because signed/pointer
> overflow is UB — so the check "can't" be true. Write standard-conforming code; use
> sanitizers to find UB.

### 1.5 Strict aliasing & `restrict`

The compiler assumes pointers of *different* types don't alias (except `char*`), enabling
optimization. Violating it (type-punning via incompatible pointer casts) is UB — use `memcpy`
or a `union` to type-pun legally. `restrict` (C99) is a *promise* that a pointer is the only
access path to its object, unlocking optimizations; breaking the promise is UB.

### 1.6 The integer model

- **Integer promotions** and the **usual arithmetic conversions** silently convert operands —
  source of countless bugs (`unsigned`/`signed` comparison, narrowing).
- **Signed overflow is UB; unsigned wraps** (modulo 2ⁿ) — a defined, deliberate behavior.
- Use `<stdint.h>` fixed-width types (`int32_t`, `uint64_t`) and `size_t` for sizes/indices.

---

## 2. Application Frameworks

### 2.1 Disciplined memory management

```c
// Ownership convention: the function that mallocs documents who frees.
char *dup_str(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (!p) return NULL;          // ALWAYS check malloc
    memcpy(p, s, n);
    return p;                      // caller owns; caller frees
}
```

Rules that prevent most heap bugs:
1. **Every allocation has a single documented owner** responsible for freeing.
2. **Set freed pointers to NULL** (`free(p); p = NULL;`) to neutralize double-free/use-after-free.
3. **Check every `malloc`/`realloc`** (and remember `realloc` may move; assign to a temp so a
   failure doesn't leak the original).
4. **Match allocator/deallocator** (`malloc`↔`free`, not mixing with platform allocators).
5. **Initialize on declaration** to avoid indeterminate values.

### 2.2 The defensive function contract

```c
// Return-code error handling (the C idiom); document ownership + preconditions.
// Returns 0 on success, -1 on error (errno set). 'out' must be non-NULL.
int read_u32(const uint8_t *buf, size_t len, size_t off, uint32_t *out) {
    if (!buf || !out) return -1;
    if (off > len || sizeof(uint32_t) > len - off) return -1;  // overflow-safe bound check
    memcpy(out, buf + off, sizeof(uint32_t));                   // alignment-safe, aliasing-safe
    return 0;
}
```

Note: `memcpy` is the portable, alignment-safe, strict-aliasing-safe way to read typed data
from a byte buffer — prefer it over pointer casts. Also note the bound check is written as
`sizeof < len - off` (not `off + sizeof > len`) to avoid integer overflow in the addition.

### 2.3 The build & verification toolchain (non-negotiable for C)

```
# Compile with maximum diagnostics:
gcc -std=c11 -Wall -Wextra -Wpedantic -Wshadow -Wconversion -O2 file.c

# Runtime UB / memory error detection (catches what -W cannot):
gcc -fsanitize=address,undefined -g file.c   # ASan + UBSan
valgrind ./a.out                              # memcheck: leaks, invalid reads/writes

# Static analysis:
clang --analyze file.c ; cppcheck ; clang-tidy
```

> **Treat warnings as errors** (`-Werror`) in CI. C's compiler is your first defense; ASan/
> UBSan/Valgrind are your second. Most "mysterious" C bugs are diagnosable UB.

### 2.4 Common data-structure idioms

- **Flexible array member** (C99) for variable-length structs:
  `struct buf { size_t len; char data[]; };` allocated as `malloc(sizeof(struct buf) + n)`.
- **Intrusive linked lists** (next-pointer inside the node) avoid extra allocation.
- **Opaque pointers** (`typedef struct Foo Foo;` in header, definition in `.c`) for
  encapsulation/ABI stability.
- **X-macros** for generating parallel tables from one source list.

### 2.5 Concurrency (C11 threads & atomics)

- `<threads.h>` (threads, mutexes, condition vars) and `<stdatomic.h>` (atomics, memory
  orders). A **data race** (two unsynchronized accesses, ≥1 a write) is UB.
- Prefer `atomic_*` with explicit `memory_order` only when you understand the model; otherwise
  use mutexes. The acquire/release model is the practical core (see `cpp-masterclass.md`,
  which shares the C11/C++11 memory model).

---

## 3. Common Pitfalls

1. **Ignoring UB.** Signed overflow, OOB access, use-after-free, strict-aliasing violations —
   the optimizer will betray "working" code. Run UBSan/ASan.
2. **Unchecked `malloc`/`realloc`.** NULL deref on allocation failure; `realloc` losing the
   original pointer on failure.
3. **Off-by-one / buffer overflows.** `strcpy`/`sprintf`/`gets` (never use `gets`). Prefer
   bounded `snprintf`, and size-checked copies.
4. **`sizeof` on decayed arrays.** Gives pointer size in functions; pass lengths.
5. **Signed/unsigned comparison & narrowing.** `-Wconversion`/`-Wsign-compare`.
6. **Returning pointers to locals.** Automatic storage dies at block end → dangling pointer.
7. **Double free / use-after-free.** Null-out after free; clear ownership.
8. **Macro pitfalls.** `#define SQ(x) x*x` → `SQ(a+b)` is `a+b*a+b`; multiple-evaluation of
   side effects. Parenthesize and prefer `static inline` functions.
9. **Forgetting NUL terminator** in C strings; `strncpy` does *not* guarantee termination.
10. **Mixing integer types in pointer arithmetic / format specifiers** (`%d` for `size_t` is
    UB — use `%zu`).

---

## 4. Advanced Resources

**Standards & references**
- ISO/IEC 9899 (C11/C17/C23) — the standard; drafts (e.g., N1570 for C11) are freely available:
  <https://port70.net/~nsz/c/c11/n1570.html>
- cppreference C library & language: <https://en.cppreference.com/w/c>

**Books**
- Kernighan & Ritchie. *The C Programming Language*, 2nd ed. (K&R) — the canon.
- Gustedt, J. *Modern C* (free PDF) — excellent C11+ treatment:
  <https://gustedt.gitlabpages.inria.fr/modern-c/>
- Seacord, R. *Effective C* and *Secure Coding in C and C++* — UB and security.

**Tools**
- AddressSanitizer / UndefinedBehaviorSanitizer docs (Clang/GCC).
- Valgrind: <https://valgrind.org/>
- CERT C Coding Standard: <https://wiki.sei.cmu.edu/confluence/display/c>

---

### Cross-references
- `cpp-masterclass.md` — shares the memory model; RAII solves C's manual-cleanup problem.
- `system-design.md` — C powers the systems whose architecture is discussed there.
- `../04-security/network-defense.md` & `../04-security/owasp-frameworks.md` — memory-safety
  bugs are the root of many vulnerability classes.
