"use strict";
/**
 * Centralized structured logger with leveled output, contextual metadata,
 * JSON + human formats, and size-based file rotation. Zero dependencies.
 *
 *   const log = require("./system-logger")({ dir: "./logs", level: "debug" });
 *   log.info("server started", { port: 4000 });
 *   const reqLog = log.child({ requestId: "abc123" });
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const util = require("util");

const LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 };
const COLORS = { trace: "\x1b[90m", debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m", fatal: "\x1b[41m\x1b[37m" };
const RESET = "\x1b[0m";

function createLogger(options = {}) {
  const cfg = {
    dir: options.dir || path.join(process.cwd(), "logs"),
    file: options.file || "app.log",
    level: (options.level || process.env.LOG_LEVEL || "info").toLowerCase(),
    maxBytes: options.maxBytes || 5 * 1024 * 1024, // 5MB
    maxFiles: options.maxFiles || 5,
    json: options.json !== undefined ? options.json : process.env.NODE_ENV === "production",
    console: options.console !== false,
    baseContext: options.context || {},
  };

  const threshold = LEVELS[cfg.level] || LEVELS.info;
  fs.mkdirSync(cfg.dir, { recursive: true });
  const filePath = path.join(cfg.dir, cfg.file);

  // Append stream, recreated after rotation. Non-blocking writes.
  let stream = fs.createWriteStream(filePath, { flags: "a" });
  let writtenBytes = (() => { try { return fs.statSync(filePath).size; } catch { return 0; } })();
  let rotating = false;

  function rotate() {
    if (rotating) return;
    rotating = true;
    try {
      stream.end();
      // shift app.log.(n-1) -> app.log.n
      for (let i = cfg.maxFiles - 1; i >= 1; i--) {
        const src = `${filePath}.${i}`;
        const dst = `${filePath}.${i + 1}`;
        if (fs.existsSync(src)) {
          if (i + 1 > cfg.maxFiles) fs.unlinkSync(src);
          else fs.renameSync(src, dst);
        }
      }
      if (fs.existsSync(filePath)) fs.renameSync(filePath, `${filePath}.1`);
    } catch (err) {
      process.stderr.write(`[logger] rotation error: ${err.message}${os.EOL}`);
    } finally {
      stream = fs.createWriteStream(filePath, { flags: "a" });
      writtenBytes = 0;
      rotating = false;
    }
  }

  function format(level, msg, meta) {
    const record = {
      ts: new Date().toISOString(),
      level,
      msg,
      pid: process.pid,
      host: os.hostname(),
      ...cfg.baseContext,
      ...(meta && typeof meta === "object" ? meta : meta !== undefined ? { detail: meta } : {}),
    };
    if (cfg.json) return JSON.stringify(record);
    const ctx = { ...cfg.baseContext, ...(meta && typeof meta === "object" ? meta : {}) };
    const ctxStr = Object.keys(ctx).length ? " " + util.inspect(ctx, { depth: 4, breakLength: Infinity }) : "";
    return `${record.ts} [${level.toUpperCase().padEnd(5)}] ${msg}${ctxStr}`;
  }

  function write(level, msg, meta) {
    if (LEVELS[level] < threshold) return;
    const line = format(level, msg, meta);
    const buf = line + os.EOL;

    if (cfg.console) {
      const out = level === "error" || level === "fatal" ? process.stderr : process.stdout;
      out.write((COLORS[level] || "") + line + RESET + os.EOL);
    }
    stream.write(buf);
    writtenBytes += Buffer.byteLength(buf);
    if (writtenBytes >= cfg.maxBytes) rotate();
  }

  const api = {
    child(extra = {}) {
      return createLogger({ ...cfg, context: { ...cfg.baseContext, ...extra } });
    },
    close() {
      return new Promise((res) => stream.end(res));
    },
  };
  for (const lvl of Object.keys(LEVELS)) {
    api[lvl] = (msg, meta) => write(lvl, typeof msg === "string" ? msg : util.inspect(msg), meta);
  }

  // Strict resource cleanup on shutdown.
  const onExit = () => { try { stream.end(); } catch { /* noop */ } };
  process.once("exit", onExit);
  process.once("SIGINT", () => { onExit(); process.exit(130); });
  process.once("SIGTERM", () => { onExit(); process.exit(143); });

  return api;
}

module.exports = createLogger;
module.exports.LEVELS = LEVELS;
