'use strict';

/**
 * stream-analyzer.js
 * ---------------------------------------------------------------------------
 * Streaming reader + chunking analyzer for very large documents that should
 * never be fully loaded into memory.
 *
 * Pipeline:
 *   Readable (file/network) → line/sentence framing → token-aware chunker with
 *   configurable overlap → pluggable async `analyze` callback (summarizer,
 *   embedder, classifier) → map-reduce style rolling reduction.
 *
 * Uses async generators so the whole document flows with constant memory.
 * Pure Node.js (>=18); the summarizer/embedder is injected so this file has
 * zero AI-vendor lock-in.
 * ---------------------------------------------------------------------------
 */

const { createReadStream } = require('node:fs');
const { Readable } = require('node:stream');

/**
 * Approximate token counter (~4 chars/token heuristic for English). Replace
 * `tokenCounter` in options with a real BPE counter when exact budgets matter.
 */
function approxTokens(text) {
  // Word + punctuation aware: better than raw chars/4 for mixed content.
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(words, Math.ceil(text.length / 4));
}

/**
 * Frames a byte/string stream into sentences without materializing the whole
 * input. Splits on sentence terminators while preserving them.
 * @param {AsyncIterable<Buffer|string>} source
 * @returns {AsyncGenerator<string>}
 */
async function* toSentences(source) {
  let carry = '';
  const boundary = /([.!?]+["')\]]?\s+|\n{2,})/;
  for await (const piece of source) {
    carry += piece.toString('utf8');
    let match;
    // Emit every complete sentence currently buffered.
    while ((match = boundary.exec(carry))) {
      const end = match.index + match[0].length;
      const sentence = carry.slice(0, end).trim();
      if (sentence) yield sentence;
      carry = carry.slice(end);
    }
  }
  if (carry.trim()) yield carry.trim();
}

/**
 * Groups sentences into token-bounded chunks with a sliding overlap so context
 * is preserved across chunk boundaries (important for summarization quality).
 * @param {AsyncIterable<string>} sentences
 * @param {{ maxTokens:number, overlapTokens:number, tokenCounter:Function }} cfg
 * @returns {AsyncGenerator<{ index:number, text:string, tokens:number }>}
 */
async function* toChunks(sentences, cfg) {
  const { maxTokens, overlapTokens, tokenCounter } = cfg;
  let window = []; // { text, tokens }
  let windowTokens = 0;
  let index = 0;

  const flush = function* () {
    if (window.length === 0) return;
    const text = window.map((s) => s.text).join(' ');
    yield { index: index++, text, tokens: windowTokens };
    // Build overlap tail for the next window.
    const tail = [];
    let tailTokens = 0;
    for (let i = window.length - 1; i >= 0 && tailTokens < overlapTokens; i--) {
      tail.unshift(window[i]);
      tailTokens += window[i].tokens;
    }
    window = tail;
    windowTokens = tailTokens;
  };

  for await (const sentence of sentences) {
    const t = tokenCounter(sentence);
    // A single oversized sentence is hard-split to respect the budget.
    if (t > maxTokens) {
      yield* flush();
      for (const piece of hardSplit(sentence, maxTokens, tokenCounter)) {
        yield { index: index++, text: piece, tokens: tokenCounter(piece) };
      }
      continue;
    }
    if (windowTokens + t > maxTokens) yield* flush();
    window.push({ text: sentence, tokens: t });
    windowTokens += t;
  }
  yield* flush();
}

/** Splits an oversized string into <=maxTokens pieces on word boundaries. */
function* hardSplit(text, maxTokens, tokenCounter) {
  const words = text.split(/\s+/);
  let buf = [];
  for (const w of words) {
    buf.push(w);
    if (tokenCounter(buf.join(' ')) >= maxTokens) {
      yield buf.join(' ');
      buf = [];
    }
  }
  if (buf.length) yield buf.join(' ');
}

class StreamAnalyzer {
  /**
   * @param {object} opts
   * @param {(chunk:{index:number,text:string,tokens:number}, signal:AbortSignal)=>Promise<any>} opts.analyze
   *        Per-chunk async worker (summarize/embed/classify).
   * @param {(acc:any, partial:any, chunk:object)=>any} [opts.reduce]
   *        Optional rolling reducer to combine partial results map-reduce style.
   * @param {any} [opts.initial] Initial accumulator for reduce.
   * @param {number} [opts.maxTokens=800]
   * @param {number} [opts.overlapTokens=120]
   * @param {number} [opts.concurrency=3] Parallel analyze() calls.
   * @param {Function} [opts.tokenCounter=approxTokens]
   */
  constructor(opts) {
    if (typeof opts?.analyze !== 'function') throw new Error('analyze() is required');
    this.analyze = opts.analyze;
    this.reduce = opts.reduce ?? null;
    this.initial = opts.initial ?? null;
    this.maxTokens = opts.maxTokens ?? 800;
    this.overlapTokens = opts.overlapTokens ?? 120;
    this.concurrency = Math.max(1, opts.concurrency ?? 3);
    this.tokenCounter = opts.tokenCounter ?? approxTokens;
  }

  /** Analyzes any async-iterable source of text/bytes. */
  async *fromSource(source, { signal } = {}) {
    const sentences = toSentences(source);
    const chunks = toChunks(sentences, {
      maxTokens: this.maxTokens,
      overlapTokens: this.overlapTokens,
      tokenCounter: this.tokenCounter,
    });

    // Bounded-concurrency pump: keep up to `concurrency` analyze() calls in
    // flight and yield each result as it completes, preserving constant memory.
    // Each in-flight entry is keyed by a monotonic id so the settled task can
    // be located and removed in O(1) without relying on promise identity.
    const pending = new Map(); // id -> Promise<{ id, chunk, value?, error? }>
    let nextId = 0;
    let chunkDone = false;
    const iterator = chunks[Symbol.asyncIterator]();

    const launch = (chunk) => {
      const id = nextId++;
      const p = Promise.resolve()
        .then(() => this.analyze(chunk, signal ?? neverAbort()))
        .then((value) => ({ id, chunk, value }))
        .catch((error) => ({ id, chunk, error }));
      pending.set(id, p);
    };

    const fill = async () => {
      while (pending.size < this.concurrency && !chunkDone) {
        const { value, done } = await iterator.next();
        if (done) { chunkDone = true; break; }
        launch(value);
      }
    };

    await fill();

    while (pending.size > 0) {
      if (signal?.aborted) throw new Error('analysis aborted');
      // Whichever in-flight task settles first wins the race.
      const settled = await Promise.race(pending.values());
      pending.delete(settled.id);

      if (settled.error) {
        yield { index: settled.chunk.index, error: settled.error.message, text: settled.chunk.text };
      } else {
        yield { index: settled.chunk.index, result: settled.value, tokens: settled.chunk.tokens };
      }
      await fill();
    }
  }

  /** Convenience: analyze a file path and (optionally) reduce to one result. */
  async analyzeFile(path, { signal } = {}) {
    return this._run(createReadStream(path, { highWaterMark: 64 * 1024 }), signal);
  }

  /** Convenience: analyze an in-memory string. */
  async analyzeText(text, { signal } = {}) {
    return this._run(Readable.from([text]), signal);
  }

  async _run(source, signal) {
    const partials = [];
    let acc = this.initial;
    for await (const item of this.fromSource(source, { signal })) {
      partials.push(item);
      if (this.reduce && !item.error) acc = this.reduce(acc, item.result, item);
    }
    // Restore document order (concurrency can reorder completions).
    partials.sort((a, b) => a.index - b.index);
    return { partials, reduced: this.reduce ? acc : null, chunks: partials.length };
  }
}

function neverAbort() {
  return new AbortController().signal;
}

module.exports = { StreamAnalyzer, toSentences, toChunks, approxTokens };
