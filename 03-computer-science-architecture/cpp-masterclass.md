---
title: C++ Masterclass
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [C fundamentals, basic OOP, templates exposure helpful]
reading_time: ~42 min
last_updated: 2026-05-29
---

# C++ Masterclass

C++ is a **multi-paradigm, zero-overhead-abstraction** language: its guiding principle (Stroustrup)
is *"you don't pay for what you don't use, and what you do use is as efficient as hand-written
code."* Mastery means internalizing three pillars — **RAII/ownership**, **value semantics &
move**, and **templates/generic programming** — plus the modern (C++11→C++23) features that
make C++ safer than C without sacrificing control. This file is organized around those pillars.

---

## 1. Technical Mechanisms

### 1.1 RAII: the central idea

**Resource Acquisition Is Initialization** ties a resource's lifetime to an object's lifetime.
Acquire in the constructor, release in the destructor; the destructor runs *deterministically*
at scope exit (including during exception unwinding). This eliminates the manual-cleanup class
of bugs that plague C.

```cpp
class File {
    std::FILE* f_;
public:
    explicit File(const char* path) : f_(std::fopen(path, "rb")) {
        if (!f_) throw std::runtime_error("open failed");
    }
    ~File() { if (f_) std::fclose(f_); }     // released automatically, always
    File(const File&) = delete;               // non-copyable (owns a unique resource)
    File& operator=(const File&) = delete;
    File(File&& o) noexcept : f_(o.f_) { o.f_ = nullptr; }   // movable
    std::FILE* get() const { return f_; }
};
```

Everything in modern C++ resource management is RAII: `std::unique_ptr`, `std::shared_ptr`,
`std::lock_guard`, `std::vector`, `std::string`, `std::fstream`.

### 1.2 The ownership model & smart pointers

| Tool | Semantics | Use when |
|---|---|---|
| value / stack object | sole owner, automatic | default — prefer values |
| `std::unique_ptr<T>` | exclusive ownership, movable not copyable | single owner of a heap object |
| `std::shared_ptr<T>` | shared ownership, refcounted (atomic) | genuine shared lifetime |
| `std::weak_ptr<T>` | non-owning observer of a shared_ptr | break reference cycles |
| raw `T*` / `T&` | **non-owning** observation | function params that don't take ownership |

> **Modern rule:** raw `new`/`delete` should virtually never appear in application code. Use
> `std::make_unique` / `std::make_shared`. Raw pointers are *non-owning* views. This is the
> single biggest leap from C-style C++ to modern C++.

### 1.3 Value semantics, copy/move, and the rules

- **The Rule of Zero:** design classes so they need no user-declared destructor/copy/move —
  let members (smart pointers, containers) handle it. Best default.
- **The Rule of Five:** if you declare *any* of {destructor, copy ctor, copy assign, move ctor,
  move assign}, you usually must reason about all five.
- **Move semantics (C++11):** `std::move` casts to an rvalue reference, enabling resources to be
  *transferred* rather than copied (e.g., a `vector`'s heap buffer is stolen, not duplicated).
  This is how C++ gets value semantics *without* copy overhead.
- **Copy elision / RVO:** the compiler elides copies of returned temporaries (mandatory in
  C++17 for prvalues), so `return BigObject(...)` is free.

### 1.4 Templates & generic programming

Templates are **compile-time code generation** (monomorphization): one template instantiates
into concrete code per type, giving genericity with zero runtime cost.

```cpp
template <typename T>
constexpr T clamp(T v, T lo, T hi) { return v < lo ? lo : (hi < v ? hi : v); }
```

- **Concepts (C++20)** constrain template parameters with readable requirements and error
  messages: `template<std::integral T>` instead of SFINAE soup.
- **CRTP** (Curiously Recurring Template Pattern) achieves static polymorphism.
- **`if constexpr` (C++17)** does compile-time branch elimination inside templates.
- **Variadic templates** + perfect forwarding (`std::forward`) build generic wrappers
  (`make_unique`, `emplace_back`).

### 1.5 Polymorphism: static vs. dynamic

- **Dynamic:** `virtual` functions + a vtable; runtime dispatch via the object's vptr. Pay a
  pointer-indirection cost; needed for runtime-heterogeneous collections. Always give
  polymorphic base classes a `virtual` destructor.
- **Static:** templates/CRTP/concepts; dispatch resolved at compile time, inlinable, zero
  overhead. Prefer when the type set is known at compile time.

### 1.6 The memory model & concurrency (C++11)

C++11 defined a formal memory model. Key pieces:
- A **data race is UB.** Synchronize with mutexes (`std::mutex` + `std::lock_guard`/
  `std::scoped_lock`) or atomics.
- **`std::atomic<T>`** with memory orders: `seq_cst` (default, simplest), `acquire`/`release`
  (the workhorse for lock-free producer/consumer), `relaxed` (counters with no ordering needs).
- **`std::thread`/`std::jthread`** (C++20, auto-joining + stop tokens), `std::async`/`future`,
  and higher-level `std::atomic`, `std::condition_variable`.

### 1.7 Exceptions, errors, and `noexcept`

- Exceptions provide RAII-safe error propagation; combine with RAII so cleanup is automatic
  during unwinding (the **strong exception guarantee** via copy-and-swap).
- `noexcept` enables optimizations (e.g., `vector` uses move instead of copy on reallocation
  only if the move ctor is `noexcept`).
- Alternatives for expected-failure paths: `std::optional<T>` (C++17), `std::expected<T,E>`
  (C++23), error codes — exceptions for *exceptional*, not control flow.

---

## 2. Application Frameworks

### 2.1 Modern C++ defaults (a style contract)

```cpp
auto x = compute();                       // use auto for obvious/long types
const auto& ref = container.at(i);        // const-correct; avoid needless copies
for (const auto& item : container) {...}  // range-for, by const-ref
std::unique_ptr<Widget> w = std::make_unique<Widget>(args);   // never raw new
std::vector<int> v{1,2,3};                // RAII containers over raw arrays
if (auto it = m.find(k); it != m.end())   // init-statement in if (C++17)
```

- **Const-correctness everywhere**; `constexpr`/`consteval` to push work to compile time.
- **Prefer the STL/algorithms** (`<algorithm>`, ranges) over hand-rolled loops:
  `std::ranges::sort`, `std::accumulate`, `std::transform`.
- **`std::string_view`/`std::span`** for non-owning views of strings/contiguous data (avoid
  copies; mind lifetimes).

### 2.2 The copy-and-swap idiom (exception-safe assignment)

```cpp
class Buf {
    int* p_; size_t n_;
public:
    void swap(Buf& o) noexcept { std::swap(p_, o.p_); std::swap(n_, o.n_); }
    Buf& operator=(Buf other) {  // take by value (copy/move happens at call)
        swap(other);             // no-throw swap -> strong guarantee
        return *this;            // 'other' destructs old state
    }
};
```

### 2.3 Choosing the right container

| Need | Container | Complexity notes |
|---|---|---|
| dynamic array, cache-friendly | `std::vector` | O(1) amortized push_back; default choice |
| key->value, ordered | `std::map` | O(log n), node-based (pointer chasing) |
| key->value, fast | `std::unordered_map` | O(1) avg; hashing; watch load factor |
| fixed-size | `std::array` | stack, no heap |
| double-ended | `std::deque` | O(1) push front/back |

> **Performance maxim:** prefer **contiguous** (`vector`/`array`) for cache locality;
> node-based containers (`list`, `map`) chase pointers and thrash cache. Measure with a
> profiler, not intuition.

### 2.4 Compile-time computation

`constexpr` functions and variables execute at compile time when inputs are constant;
`consteval` (C++20) *forces* compile-time. Use for lookup tables, validated constants, and
moving runtime cost to build time.

### 2.5 Build, sanitize, and verify

```
g++ -std=c++23 -Wall -Wextra -Wpedantic -Wshadow -Wconversion -O2 main.cpp
g++ -fsanitize=address,undefined -g main.cpp     # ASan + UBSan
g++ -fsanitize=thread main.cpp                   # data-race detector
clang-tidy / cppcheck / include-what-you-use     # static analysis & hygiene
```

Use a package manager (vcpkg / Conan) and CMake for real projects; pin compiler warnings to
`-Werror` in CI.

---

## 3. Common Pitfalls

1. **Manual `new`/`delete`.** Use smart pointers + RAII; raw owning pointers leak on exception
   paths.
2. **Missing `virtual` destructor** on a polymorphic base → deleting via base pointer is UB.
3. **Dangling references/views.** `string_view`/`span`/iterators outliving their backing
   storage; returning references to locals.
4. **Iterator invalidation.** `vector` reallocation, `erase` in a loop — know each container's
   invalidation rules.
5. **Object slicing.** Copying a derived object into a base-class value drops the derived part.
6. **Rule-of-Five violations.** Declaring a destructor but not move ops → silent perf loss or
   bugs; aim for Rule of Zero.
7. **Data races.** Unsynchronized shared mutable state is UB; use mutexes/atomics, run TSan.
8. **`auto` deducing away `const`/references** unintentionally (`auto` drops top-level const &
   ref; use `auto&`/`const auto&`).
9. **Overusing `shared_ptr`.** Atomic refcount overhead + cycle leaks; prefer `unique_ptr`,
   break cycles with `weak_ptr`.
10. **Exception-unsafe code.** Operations that can throw between resource acquisition and
    transfer; use RAII + copy-and-swap.
11. **`std::endl` in loops** (forces a flush each time) — use `'\n'`.

---

## 4. Advanced Resources

**Standard / reference**
- cppreference (the de facto reference): <https://en.cppreference.com/>
- ISO C++ & the working drafts: <https://isocpp.org/>
- **C++ Core Guidelines** (Stroustrup & Sutter): <https://isocpp.github.io/CppCoreGuidelines/>

**Books**
- Stroustrup, B. *The C++ Programming Language* (4th ed.) and *A Tour of C++* (concise, modern).
- Meyers, S. *Effective Modern C++* (C++11/14 — still essential for move/auto/smart pointers).
- Josuttis, N. *The C++ Standard Library* and *C++ Move Semantics*.

**Talks / deep dives**
- CppCon talks (Sutter "Leak-Freedom", Parent "Better Code") on YouTube.
- Sanitizer docs (ASan/UBSan/TSan) — Clang/GCC.

---

### Cross-references
- `c-masterclass.md` — the memory model and UB carry over; RAII is the antidote to C's manual
  cleanup.
- `system-design.md` — C++ in high-performance backends, games, and trading systems.
- `ai-ml-engineering.md` — C++ underlies the kernels behind Python ML frameworks.
