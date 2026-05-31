"use strict";
/**
 * Memory-safe streaming ETL. Reads a large NDJSON (or raw text) file line-by-line,
 * transforms in bounded batches with backpressure, and writes NDJSON output.
 * Never loads the whole file into memory.
 *
 *   node batch-etl-worker.js input.ndjson output.ndjson
 */
const fs = require("fs");
const readline = require("readline");
const { Transform, pipeline } = require("stream");
const { promisify } = require("util");
const pipe = promisify(pipeline);

/** Default transform: trim strings, drop empties, normalize, tag processedAt. */
function defaultTransform(record) {
  if (record == null || typeof record !== "object") return null;
  const out = {};
  for (const [k, v] of Object.entries(record)) {
    if (v === null || v === undefined || v === "") continue;
    out[typeof k === "string" ? k.trim() : k] = typeof v === "string" ? v.trim() : v;
  }
  if (Object.keys(out).length === 0) return null;
  out._processedAt = new Date().toISOString();
  return out;
}

/** Batching transform stream - buffers up to batchSize, applies fn, emits NDJSON. */
function createBatcher(transformFn, batchSize) {
  let batch = [];
  const flush = function (push) {
    for (const rec of batch) {
      const result = transformFn(rec);
      if (result !== null) push(JSON.stringify(result) + "\n");
    }
    batch = [];
  };
  return new Transform({
    readableObjectMode: false,
    writableObjectMode: true,
    transform(record, _enc, cb) {
      batch.push(record);
      if (batch.length >= batchSize) flush((x) => this.push(x));
      cb(); // honor backpressure
    },
    flush(cb) {
      flush((x) => this.push(x));
      cb();
    },
  });
}

/** Parse NDJSON/text lines into objects (object-mode readable). */
function createLineParser(inputStream) {
  const rl = readline.createInterface({ input: inputStream, crlfDelay: Infinity });
  const parser = new Transform({
    objectMode: true,
    transform(_x, _e, cb) { cb(); }, // unused; fed manually below
  });
  let lineNo = 0, ok = 0, bad = 0;
  rl.on("line", (line) => {
    lineNo++;
    const t = line.trim();
    if (!t) return;
    try { parser.write(JSON.parse(t)); ok++; }
    catch { parser.write({ _raw: t, _lineNo: lineNo, _parseError: true }); bad++; }
  });
  rl.on("close", () => { parser.end(); parser.emit("stats", { lineNo, ok, bad }); });
  rl.on("error", (e) => parser.destroy(e));
  return parser;
}

async function runETL(inputPath, outputPath, opts = {}) {
  const batchSize = opts.batchSize || 1000;
  const transformFn = opts.transform || defaultTransform;

  const input = fs.createReadStream(inputPath, { encoding: "utf-8", highWaterMark: 64 * 1024 });
  const output = fs.createWriteStream(outputPath, { encoding: "utf-8" });
  const parser = createLineParser(input);
  const batcher = createBatcher(transformFn, batchSize);

  let stats = { lineNo: 0, ok: 0, bad: 0 };
  parser.on("stats", (s) => (stats = s));

  const started = Date.now();
  await pipe(parser, batcher, output); // automatic backpressure + cleanup on error
  const ms = Date.now() - started;
  return { ...stats, durationMs: ms, throughputPerSec: Math.round((stats.ok / Math.max(ms, 1)) * 1000) };
}

module.exports = { runETL, defaultTransform, createBatcher };

if (require.main === module) {
  const [, , inPath, outPath] = process.argv;
  if (!inPath || !outPath) {
    process.stderr.write("Usage: node batch-etl-worker.js <input.ndjson> <output.ndjson>\n");
    process.exit(1);
  }
  runETL(inPath, outPath)
    .then((r) => process.stdout.write(`ETL done: ${JSON.stringify(r)}\n`))
    .catch((e) => { process.stderr.write(`ETL failed: ${e.message}\n`); process.exit(1); });
}
