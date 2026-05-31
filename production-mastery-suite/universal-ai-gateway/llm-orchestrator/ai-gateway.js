"use strict";
/**
 * Universal AI Gateway with multi-provider fallback (OpenAI -> Anthropic -> Ollama).
 * Automatically fails over on timeout or 5xx, with per-provider retry + backoff
 * and a circuit breaker that temporarily skips an unhealthy provider.
 * Uses global fetch (Node 18+). No external dependencies.
 *
 *   const gw = new AIGateway({
 *     providers: [
 *       { name: "openai",    apiKey: process.env.OPENAI_API_KEY,    model: "gpt-4o-mini" },
 *       { name: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-20241022" },
 *       { name: "ollama",    baseUrl: "http://localhost:11434",     model: "llama3" },
 *     ],
 *   });
 *   const out = await gw.complete("Explain RAG in one sentence.");
 */
class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 30000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.failures = 0;
    this.openedAt = 0;
  }
  get isOpen() {
    if (this.openedAt === 0) return false;
    if (Date.now() - this.openedAt >= this.cooldownMs) { this.reset(); return false; }
    return true;
  }
  recordSuccess() { this.failures = 0; this.openedAt = 0; }
  recordFailure() { if (++this.failures >= this.failureThreshold) this.openedAt = Date.now(); }
  reset() { this.failures = 0; this.openedAt = 0; }
}

class AIGateway {
  constructor(opts = {}) {
    if (!opts.providers || !opts.providers.length) throw new Error("AIGateway: at least one provider required");
    this.providers = opts.providers;
    this.timeoutMs = opts.timeoutMs || 20000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.breakers = new Map(this.providers.map((p) => [p.name, new CircuitBreaker(opts.breaker)]));
    this.logger = opts.logger || { info() {}, warn() {}, error() {} };
  }

  async _fetchWithTimeout(url, init) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer); // strict cleanup
    }
  }

  _buildRequest(provider, prompt, options) {
    const sys = options.system || "You are a helpful, concise assistant.";
    const maxTokens = options.maxTokens || 512;
    const temperature = options.temperature ?? 0.7;

    switch (provider.name) {
      case "openai":
        return {
          url: `${provider.baseUrl || "https://api.openai.com"}/v1/chat/completions`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${provider.apiKey}` },
            body: JSON.stringify({
              model: provider.model,
              messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
              max_tokens: maxTokens, temperature,
            }),
          },
          parse: (j) => j.choices?.[0]?.message?.content ?? "",
        };
      case "anthropic":
        return {
          url: `${provider.baseUrl || "https://api.anthropic.com"}/v1/messages`,
          init: {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": provider.apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: provider.model, system: sys, max_tokens: maxTokens, temperature,
              messages: [{ role: "user", content: prompt }],
            }),
          },
          parse: (j) => (Array.isArray(j.content) ? j.content.map((c) => c.text || "").join("") : ""),
        };
      case "ollama":
        return {
          url: `${provider.baseUrl || "http://localhost:11434"}/api/chat`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: provider.model, stream: false,
              messages: [{ role: "system", content: sys }, { role: "user", content: prompt }],
              options: { temperature, num_predict: maxTokens },
            }),
          },
          parse: (j) => j.message?.content ?? "",
        };
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }

  async _callProvider(provider, prompt, options) {
    const { url, init, parse } = this._buildRequest(provider, prompt, options);
    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await this._fetchWithTimeout(url, init);
        if (res.status >= 500) throw new Error(`5xx from ${provider.name}: ${res.status}`); // triggers failover
        if (res.status === 429) { // rate limited: backoff then retry same provider
          await this._sleep(2 ** attempt * 500);
          lastErr = new Error(`429 from ${provider.name}`);
          continue;
        }
        if (!res.ok) throw new Error(`${provider.name} HTTP ${res.status}: ${await res.text()}`);
        const json = await res.json();
        const text = parse(json);
        if (!text) throw new Error(`${provider.name} returned empty content`);
        return { text, provider: provider.name, model: provider.model };
      } catch (err) {
        lastErr = err;
        const retriable = err.name === "AbortError" || /5\d\d|429/.test(err.message);
        if (retriable && attempt < this.maxRetries) {
          await this._sleep(2 ** attempt * 500); // exponential backoff
          continue;
        }
        throw lastErr;
      }
    }
    throw lastErr;
  }

  _sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  /** Try providers in order; fail over on timeout/5xx/error; skip open circuits. */
  async complete(prompt, options = {}) {
    const errors = [];
    for (const provider of this.providers) {
      const breaker = this.breakers.get(provider.name);
      if (breaker.isOpen) { this.logger.warn(`skip ${provider.name} (circuit open)`); errors.push(`${provider.name}: circuit open`); continue; }
      try {
        const result = await this._callProvider(provider, prompt, options);
        breaker.recordSuccess();
        this.logger.info(`served by ${provider.name}`);
        return result;
      } catch (err) {
        breaker.recordFailure();
        this.logger.warn(`provider ${provider.name} failed: ${err.message} -> failing over`);
        errors.push(`${provider.name}: ${err.message}`);
      }
    }
    throw new Error(`All providers failed:\n${errors.join("\n")}`);
  }
}

module.exports = { AIGateway, CircuitBreaker };

if (require.main === module) {
  (async () => {
    const gw = new AIGateway({
      providers: [
        { name: "openai", apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" },
        { name: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY, model: "claude-3-5-sonnet-20241022" },
        { name: "ollama", baseUrl: "http://localhost:11434", model: "llama3" },
      ],
      logger: console,
    });
    try {
      const out = await gw.complete(process.argv[2] || "Say hello in one short sentence.");
      console.log(`\n[${out.provider}/${out.model}] ${out.text}`);
    } catch (e) { console.error(e.message); process.exit(1); }
  })();
}
