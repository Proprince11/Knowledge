'use strict';

/**
 * webgpu-detector.js
 * ---------------------------------------------------------------------------
 * Feature-detection and capability negotiation for on-device inference.
 *
 * Determines the best available compute backend in the current browser:
 *   1. 'webgpu'  - preferred; checks adapter + required limits + fp16.
 *   2. 'wasm'    - SIMD + threads (cross-origin-isolated) fallback.
 *   3. 'cpu'     - last-resort scalar wasm.
 *
 * Returns a normalized descriptor that `speech-transcriber.ts` consumes to
 * pick the transformers.js `device` and `dtype`.
 *
 * ESM module; safe to import in a Worker or the main thread.
 * ---------------------------------------------------------------------------
 */

/**
 * @typedef {Object} BackendReport
 * @property {'webgpu'|'wasm'|'cpu'} backend
 * @property {'fp16'|'fp32'|'q8'|'q4'} dtype
 * @property {boolean} crossOriginIsolated
 * @property {boolean} simd
 * @property {boolean} threads
 * @property {number} hardwareConcurrency
 * @property {Object|null} adapterInfo
 * @property {Record<string, number>} limits
 * @property {string[]} notes
 */

/** Probes WebAssembly SIMD support by validating a tiny SIMD module. */
function detectWasmSIMD() {
  // Minimal module containing a v128.const instruction. If validation passes,
  // the engine supports the SIMD proposal.
  const bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b,
    0x03, 0x02, 0x01, 0x00,
    0x0a, 0x0a, 0x01, 0x08, 0x00, 0xfd, 0x0c,
    0x00, 0x00, 0x00, 0x00, 0x0b,
  ]);
  try {
    return typeof WebAssembly === 'object' && WebAssembly.validate(bytes);
  } catch {
    return false;
  }
}

/** Threads require SharedArrayBuffer + cross-origin isolation. */
function detectWasmThreads() {
  try {
    return (
      typeof SharedArrayBuffer === 'function' &&
      typeof globalThis.crossOriginIsolated === 'boolean' &&
      globalThis.crossOriginIsolated === true
    );
  } catch {
    return false;
  }
}

/**
 * Negotiates a WebGPU adapter/device and reports whether fp16 shaders are
 * available (critical for fast, low-memory Whisper inference).
 * @returns {Promise<{ok: boolean, dtype: 'fp16'|'fp32', adapterInfo: any, limits: Record<string,number>, reason?: string}>}
 */
async function detectWebGPU() {
  if (!('gpu' in navigator) || !navigator.gpu) {
    return { ok: false, dtype: 'fp32', adapterInfo: null, limits: {}, reason: 'navigator.gpu missing' };
  }
  let adapter;
  try {
    adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  } catch (e) {
    return { ok: false, dtype: 'fp32', adapterInfo: null, limits: {}, reason: `requestAdapter threw: ${e?.message}` };
  }
  if (!adapter) {
    return { ok: false, dtype: 'fp32', adapterInfo: null, limits: {}, reason: 'no adapter' };
  }

  const hasFp16 = adapter.features?.has?.('shader-f16') ?? false;
  const requiredFeatures = hasFp16 ? ['shader-f16'] : [];

  // Request a device to confirm we can actually allocate one.
  let device = null;
  try {
    device = await adapter.requestDevice({ requiredFeatures });
  } catch (e) {
    return { ok: false, dtype: 'fp32', adapterInfo: null, limits: {}, reason: `requestDevice failed: ${e?.message}` };
  }

  const limits = {};
  if (adapter.limits) {
    for (const key of [
      'maxBufferSize',
      'maxStorageBufferBindingSize',
      'maxComputeWorkgroupStorageSize',
      'maxComputeInvocationsPerWorkgroup',
    ]) {
      if (typeof adapter.limits[key] === 'number') limits[key] = adapter.limits[key];
    }
  }

  let adapterInfo = null;
  try {
    adapterInfo = adapter.info ?? (adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : null);
  } catch {
    adapterInfo = null;
  }

  // Release the probe device; the real pipeline will request its own.
  try { device.destroy?.(); } catch { /* noop */ }

  return { ok: true, dtype: hasFp16 ? 'fp16' : 'fp32', adapterInfo, limits };
}

/**
 * Runs all probes and returns a single normalized report.
 * @param {{ preferWebGPU?: boolean }} [opts]
 * @returns {Promise<BackendReport>}
 */
export async function detectBackend(opts = {}) {
  const preferWebGPU = opts.preferWebGPU ?? true;
  const simd = detectWasmSIMD();
  const threads = detectWasmThreads();
  const hardwareConcurrency =
    (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
  const notes = [];

  let backend = 'cpu';
  let dtype = simd ? 'q8' : 'q4';

  if (preferWebGPU) {
    const gpu = await detectWebGPU();
    if (gpu.ok) {
      return {
        backend: 'webgpu',
        dtype: gpu.dtype,
        crossOriginIsolated: !!globalThis.crossOriginIsolated,
        simd,
        threads,
        hardwareConcurrency,
        adapterInfo: gpu.adapterInfo,
        limits: gpu.limits,
        notes,
      };
    }
    notes.push(`webgpu unavailable: ${gpu.reason}`);
  }

  if (simd) {
    backend = 'wasm';
    dtype = threads ? 'q8' : 'q8';
    if (!threads) {
      notes.push('wasm threads disabled (page is not cross-origin isolated); running single-threaded');
    }
  } else {
    notes.push('wasm SIMD unsupported; falling back to scalar cpu path (slow)');
  }

  return {
    backend,
    dtype,
    crossOriginIsolated: !!globalThis.crossOriginIsolated,
    simd,
    threads,
    hardwareConcurrency,
    adapterInfo: null,
    limits: {},
    notes,
  };
}

/** Maps a BackendReport to transformers.js pipeline options. */
export function toPipelineOptions(report) {
  if (report.backend === 'webgpu') {
    return { device: 'webgpu', dtype: report.dtype === 'fp16' ? 'fp16' : 'fp32' };
  }
  return { device: 'wasm', dtype: report.dtype };
}
