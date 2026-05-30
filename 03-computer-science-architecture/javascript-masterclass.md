---
title: JavaScript Masterclass
domain: 03 — Computer Science & Architecture
status: done
depth: graduate
prerequisites: [basic programming, web fundamentals]
reading_time: ~40 min
last_updated: 2026-05-29
---

# JavaScript Masterclass

JavaScript is a **single-threaded, prototype-based, dynamically-typed** language whose
concurrency model (the event loop) and object model (prototypes + closures) are routinely
misunderstood even by working developers. Mastery is not knowing more syntax — it is having
correct mental models for **the event loop, closures/scope, the prototype chain, `this`
binding, and the type-coercion system**. Get those five right and the rest is library
knowledge.

---

## 1. Technical Mechanisms

### 1.1 The runtime: one stack, one heap, and the event loop

JS executes on a **single call stack**. Long-running synchronous work blocks everything
(including UI). Concurrency is achieved by *not blocking* — offloading to the host
(browser/Node) and resuming via callbacks. The model:

```
        ┌─────────────┐   call stack runs to completion, THEN:
LIFO →  │ Call Stack  │   1. drain ALL microtasks (Promises, queueMicrotask, MutationObserver)
        └─────────────┘   2. take ONE macrotask (setTimeout, I/O, event), repeat
   Microtask queue  (Promise callbacks)  ── higher priority
   Macrotask queue  (timers, I/O, events) ── one per loop tick
```

> **Critical ordering rule:** after each macrotask, the engine drains the **entire** microtask
> queue before the next macrotask or render. This is why `Promise.then` callbacks run *before*
> a `setTimeout(…, 0)` scheduled earlier:

```js
console.log('A');
setTimeout(() => console.log('D (macrotask)'), 0);
Promise.resolve().then(() => console.log('C (microtask)'));
console.log('B');
// Output: A, B, C, D
```

### 1.2 Scope, closures, and the TDZ

- **Lexical scoping:** a function's scope is determined by *where it is written*, not where it
  is called.
- **Closure:** a function plus the variable environment it closed over. Closures keep
  referenced variables alive — the basis of data privacy, currying, and (if misused) memory
  leaks.
- **`var` vs `let`/`const`:** `var` is function-scoped and hoisted (initialized `undefined`);
  `let`/`const` are block-scoped and live in the **Temporal Dead Zone** from block start until
  declaration (accessing them there throws). Prefer `const` by default, `let` when reassigning,
  never `var`.

```js
function counter() {
  let n = 0;                  // closed over
  return () => ++n;           // closure retains access to n
}
const next = counter();
next(); next();               // 1, 2 — state is private and persistent
```

### 1.3 Prototypes & the object model

JS objects delegate to a **prototype** via an internal `[[Prototype]]` link. Property lookup
walks the chain until found or `null`.

```js
const animal = { speak() { return `${this.name} makes a sound`; } };
const dog = Object.create(animal);   // dog.[[Prototype]] === animal
dog.name = 'Rex';
dog.speak();                          // delegates up the chain → "Rex makes a sound"
```

`class` is **syntactic sugar** over prototypes + constructor functions — not a separate object
system. `extends` sets up the prototype chain; `super` calls up it. Understanding this demystifies
inheritance, mixins, and why methods are shared (defined once on the prototype, not per instance).

### 1.4 `this`: the four binding rules

`this` is determined at **call time**, by *how* a function is called:

1. **Default:** standalone call → `undefined` (strict) or global object (sloppy).
2. **Implicit:** `obj.method()` → `this === obj`.
3. **Explicit:** `fn.call(o)`, `fn.apply(o)`, `fn.bind(o)` → `this === o`.
4. **`new`:** `new Fn()` → `this` is the freshly created object.

**Arrow functions have no own `this`** — they capture it lexically from the enclosing scope.
This is why arrows are correct for callbacks (preserve outer `this`) and *wrong* as object
methods that need dynamic `this`.

### 1.5 Type coercion & equality

- `==` performs coercion (the abstract equality algorithm); `===` does not. **Use `===`** to
  avoid surprises like `[] == ![]` being `true` or `'' == 0` being `true`.
- Falsy values (memorize): `false, 0, -0, 0n, "", null, undefined, NaN`. Everything else is
  truthy (including `[]` and `{}`).
- `NaN !== NaN`; test with `Number.isNaN`. `typeof null === 'object'` (a historic bug).
- Use `??` (nullish coalescing) when `0`/`''` are valid values and only `null`/`undefined`
  should trigger the default — unlike `||` which treats all falsy as default.

### 1.6 Asynchrony: callbacks → Promises → async/await

A **Promise** is a state machine: `pending → fulfilled | rejected` (settles once, immutable
after). `async/await` is sugar over Promises: `await` suspends the async function and schedules
the continuation as a microtask.

```js
// Parallel vs sequential — a common performance bug:
const [a, b] = await Promise.all([fetchA(), fetchB()]);  // concurrent (fast)
const a2 = await fetchA(); const b2 = await fetchB();    // sequential (slow!)
```

`Promise.all` (fail-fast), `allSettled` (collect all results), `race`, `any` — pick by
semantics. Always handle rejections (unhandled rejections crash Node / warn in browsers).

---

## 2. Application Frameworks

### 2.1 Modern language defaults

```js
const { x, y = 0 } = point;            // destructuring + defaults
const merged = { ...base, ...overrides };  // spread (shallow copy/merge)
const total = items.reduce((s, i) => s + i.price, 0);   // functional array methods
const found = list.find(u => u.id === id) ?? fallback;  // nullish coalescing
arr?.map?.(fn);                        // optional chaining
```

- Prefer **immutability** for predictability: `map`/`filter`/`reduce` over mutation; spread to
  copy. (Note: spread is *shallow* — nested objects are shared.)
- Use **modules** (`import`/`export`, ESM) over globals; modules are strict-mode and have their
  own scope.

### 2.2 Error handling across async boundaries

```js
async function load(id) {
  try {
    const res = await fetch(`/api/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);  // fetch only rejects on network error!
    return await res.json();
  } catch (err) {
    // log + rethrow or return a typed error; never swallow silently
    throw new Error(`load(${id}) failed: ${err.message}`, { cause: err });
  }
}
```

Gotcha: `fetch` does **not** reject on HTTP 4xx/5xx — only on network failure. Check `res.ok`.

### 2.3 Closures for module patterns & memoization

```js
function memoize(fn) {
  const cache = new Map();              // private via closure
  return (arg) => cache.has(arg) ? cache.get(arg)
                                  : (cache.set(arg, fn(arg)), cache.get(arg));
}
```

### 2.4 Performance & memory model

- **Avoid blocking the main thread:** chunk heavy work, use Web Workers (browser) / worker
  threads (Node) for CPU-bound tasks — the event loop can't help with CPU-bound work.
- **GC is generational mark-and-sweep** (V8): you don't free memory, but you *can* leak it by
  retaining references — lingering closures, forgotten event listeners, growing caches/Maps,
  detached DOM nodes. Use `WeakMap`/`WeakRef` for cache-like retention that shouldn't prevent
  GC.
- **Debounce/throttle** high-frequency events (scroll, resize, input).
- Minimize layout thrashing in the DOM (batch reads then writes).

### 2.5 The JS/TS pipeline & tooling

- **TypeScript** adds a static type layer (erased at compile) — strongly recommended at scale;
  catches the dynamic-typing bug class before runtime.
- **Bundlers/transpilers:** Vite/esbuild/Rollup/webpack; Babel/SWC for transpilation.
- **Runtimes:** Node, Deno, Bun (sandbox has Node 18–24 + Bun). ESM vs CommonJS interop is a
  frequent friction point — know which your runtime/package uses.
- **Lint/format:** ESLint + Prettier; `"strict": true` in tsconfig.

---

## 3. Common Pitfalls

1. **Blocking the event loop** with synchronous CPU work → frozen UI / stalled server.
2. **`this` confusion.** Losing `this` when passing methods as callbacks; fix with arrow
   functions or `.bind`.
3. **`var` hoisting & loop-closure bug.** Classic `for (var i…) setTimeout(()=>log(i))` logs
   the final `i`; `let` per-iteration binding fixes it.
4. **`==` coercion surprises.** Use `===`/`!==` and `Number.isNaN`.
5. **Floating point:** `0.1 + 0.2 !== 0.3` (IEEE-754). Use integer cents or a decimal lib for
   money.
6. **Unhandled promise rejections / forgotten `await`.** A missing `await` returns a pending
   Promise, not the value; errors vanish.
7. **Sequential awaits** that should be `Promise.all` → needless latency.
8. **Mutating shared state / shallow-copy assumptions.** Spread copies one level deep.
9. **Memory leaks** from un-removed listeners, growing caches, and retained closures.
10. **`fetch` not rejecting on 4xx/5xx** — must check `res.ok`.
11. **Treating `class` as classical OOP** rather than prototype sugar — leads to wrong mental
    models of inheritance and `super`.

---

## 4. Advanced Resources

**Specification & references**
- ECMAScript Language Specification (ECMA-262): <https://tc39.es/ecma262/>
- MDN Web Docs (the practical canonical reference): <https://developer.mozilla.org/en-US/docs/Web/JavaScript>
- TC39 proposals (upcoming features): <https://github.com/tc39/proposals>

**Books / deep dives**
- Simpson, K. *You Don't Know JS Yet* (free online) — scope, closures, `this`, types.
- Crockford, D. *JavaScript: The Good Parts* (dated but clarifying on coercion/scope).
- Jake Archibald, *In The Loop* (talk) — definitive event-loop/microtask explainer.

**Runtime / engine**
- V8 blog (<https://v8.dev/blog>) for engine internals & GC.
- Node.js docs (event loop, worker threads): <https://nodejs.org/en/docs>

---

### Cross-references
- `html-css.md` — JS manipulates the DOM/CSSOM; rendering performance ties to layout/paint.
- `system-design.md` — Node.js event-loop concurrency model for I/O-bound servers.
- `python-masterclass.md` — contrast GIL/asyncio with JS's single-threaded event loop.
