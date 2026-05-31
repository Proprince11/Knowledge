"use strict";
// Zero-config mock REST API. Run: node mock-server.js  (no npm install needed - pure Node).
// Endpoints are auto-generated from every top-level key in mock-data.json:
//   GET    /api/<key>            list (arrays) or object
//   GET    /api/<key>/:id        single item (arrays only)
//   POST   /api/<key>            create (arrays only)
//   PUT    /api/<key>/:id        replace
//   PATCH  /api/<key>/:id        merge
//   DELETE /api/<key>/:id        remove
// Hot-swappable: edit mock-data.json and it reloads on the next request.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, "mock-data.json");

const readDB = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const writeDB = (db) => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

const send = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
};

const body = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); } });
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);
  const [key, idRaw] = parts;
  const id = idRaw !== undefined ? Number(idRaw) : undefined;

  if (!key) return send(res, 200, { ok: true, msg: "Mock API up", endpoints: Object.keys(readDB()).map((k) => `/api/${k}`) });

  const db = readDB();
  if (!(key in db)) return send(res, 404, { error: `No collection '${key}'` });
  const coll = db[key];
  const isArray = Array.isArray(coll);

  try {
    if (req.method === "GET") {
      if (id === undefined) return send(res, 200, coll);
      const item = coll.find((x) => x.id === id);
      return item ? send(res, 200, item) : send(res, 404, { error: "Not found" });
    }
    if (!isArray) return send(res, 405, { error: "Mutations only on array collections" });

    if (req.method === "POST") {
      const payload = await body(req);
      const nextId = coll.length ? Math.max(...coll.map((x) => x.id || 0)) + 1 : 1;
      const item = { id: nextId, ...payload };
      coll.push(item); writeDB(db);
      return send(res, 201, item);
    }
    const idx = coll.findIndex((x) => x.id === id);
    if (idx === -1) return send(res, 404, { error: "Not found" });

    if (req.method === "PUT")   { coll[idx] = { id, ...(await body(req)) }; writeDB(db); return send(res, 200, coll[idx]); }
    if (req.method === "PATCH") { coll[idx] = { ...coll[idx], ...(await body(req)) }; writeDB(db); return send(res, 200, coll[idx]); }
    if (req.method === "DELETE"){ const [gone] = coll.splice(idx, 1); writeDB(db); return send(res, 200, gone); }

    return send(res, 405, { error: "Method not allowed" });
  } catch (err) {
    return send(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`Mock API -> http://localhost:${PORT}/api`);
  console.log(`   Collections: ${Object.keys(readDB()).map((k) => "/api/" + k).join(", ")}`);
});
