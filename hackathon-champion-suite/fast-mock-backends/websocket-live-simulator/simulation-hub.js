"use strict";
// Live data simulator. Run: npm i ws && node simulation-hub.js
// Broadcasts fake real-time metrics + "AI events" to every connected client every second.
// Frontend: new WebSocket("ws://localhost:8080")

const { WebSocketServer } = require("ws");

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const state = { revenue: 48230, users: 1284, conversion: 3.7, latency: 42 };
const AI_EVENTS = [
  "Model retrained - accuracy up 2.1%",
  "New user cluster detected in EU-West",
  "Anomaly auto-resolved in payments pipeline",
  "Recommendation CTR improved to 6.4%",
  "Live inference latency optimized to 38ms",
];

const jitter = (n, pct) => Math.round(n * (1 + (Math.random() - 0.5) * pct));

function tick() {
  state.revenue += Math.round(Math.random() * 500);
  state.users += Math.round(Math.random() * 15);
  state.conversion = +(3 + Math.random() * 2).toFixed(2);
  state.latency = jitter(40, 0.6);

  const payload = JSON.stringify({
    type: "tick",
    ts: Date.now(),
    metrics: { ...state },
    event: Math.random() > 0.6 ? AI_EVENTS[Math.floor(Math.random() * AI_EVENTS.length)] : null,
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(payload);
  }
}

wss.on("connection", (ws) => {
  console.log(`client connected (${wss.clients.size} total)`);
  ws.send(JSON.stringify({ type: "welcome", metrics: state, msg: "Live simulation hub connected" }));
  ws.on("close", () => console.log(`client left (${wss.clients.size} total)`));
});

setInterval(tick, 1000);
console.log(`WebSocket simulation hub -> ws://localhost:${PORT}`);
