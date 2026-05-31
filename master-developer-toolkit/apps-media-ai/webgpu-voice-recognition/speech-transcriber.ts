/**
 * speech-transcriber.ts
 * ---------------------------------------------------------------------------
 * On-device streaming speech-to-text using @huggingface/transformers with the
 * Whisper-tiny model, accelerated via WebGPU (falling back to wasm).
 *
 * Captures microphone audio, resamples to 16 kHz mono, applies a lightweight
 * energy-based voice-activity detector (VAD) to segment utterances, and feeds
 * each finalized segment to the model. Emits partial + final transcripts.
 *
 * Depends on:
 *   - @huggingface/transformers (pipeline, env)
 *   - ./webgpu-detector.js (detectBackend, toPipelineOptions)
 *
 * TypeScript 5.x, DOM + WebAudio + AudioWorklet lib.
 * ---------------------------------------------------------------------------
 */

import { pipeline, env, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';
import { detectBackend, toPipelineOptions } from './webgpu-detector.js';

export interface TranscriberOptions {
  model?: string;
  language?: string;
  /** Whisper inference target sample rate (always 16k for Whisper). */
  targetSampleRate?: 16000;
  /** RMS threshold above which a frame is "speech". */
  vadThreshold?: number;
  /** Silence duration (ms) that finalizes an utterance. */
  silenceHangoverMs?: number;
  /** Maximum utterance length before forced flush (ms). */
  maxUtteranceMs?: number;
}

export type TranscriberEvent =
  | { type: 'ready'; backend: string }
  | { type: 'speech-start' }
  | { type: 'partial'; text: string }
  | { type: 'final'; text: string; startMs: number; endMs: number }
  | { type: 'speech-end' }
  | { type: 'error'; error: Error };

type Listener = (e: TranscriberEvent) => void;

export class SpeechTranscriber {
  private readonly opts: Required<TranscriberOptions>;
  private asr: AutomaticSpeechRecognitionPipeline | null = null;
  private ctx: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private readonly listeners = new Set<Listener>();

  // Accumulates 16k mono samples for the active utterance.
  private buffer: Float32Array[] = [];
  private bufferedSamples = 0;
  private speaking = false;
  private lastVoiceTs = 0;
  private utteranceStartMs = 0;
  private decoding = false;

  constructor(options: TranscriberOptions = {}) {
    this.opts = {
      model: options.model ?? 'onnx-community/whisper-tiny',
      language: options.language ?? 'en',
      targetSampleRate: 16000,
      vadThreshold: options.vadThreshold ?? 0.015,
      silenceHangoverMs: options.silenceHangoverMs ?? 600,
      maxUtteranceMs: options.maxUtteranceMs ?? 15000,
    };
  }

  on(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: TranscriberEvent): void {
    for (const fn of this.listeners) {
      try { fn(e); } catch { /* listener errors must not break the pipeline */ }
    }
  }

  /** Loads the model with the best available backend. Idempotent. */
  async init(): Promise<void> {
    if (this.asr) return;
    const report = await detectBackend({ preferWebGPU: true });
    const pipeOpts = toPipelineOptions(report);

    // Allow remote model download + local cache.
    env.allowLocalModels = true;
    env.useBrowserCache = true;

    this.asr = (await pipeline('automatic-speech-recognition', this.opts.model, {
      ...pipeOpts,
    })) as AutomaticSpeechRecognitionPipeline;

    this.emit({ type: 'ready', backend: report.backend });
  }

  /**
   * Begins capturing from the microphone. Uses an inline AudioWorklet to pull
   * raw frames off the audio thread without main-thread jank.
   */
  async start(): Promise<void> {
    if (!this.asr) await this.init();
    if (this.ctx) return; // already running

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });

    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule(this.workletURL());
    const source = this.ctx.createMediaStreamSource(this.stream);
    this.node = new AudioWorkletNode(this.ctx, 'pcm-tap', { numberOfOutputs: 0 });

    const inputRate = this.ctx.sampleRate;
    this.node.port.onmessage = (ev: MessageEvent<Float32Array>) => {
      this.onFrame(ev.data, inputRate);
    };
    source.connect(this.node);
  }

  /** Stops capture, finalizes any pending utterance, releases hardware. */
  async stop(): Promise<void> {
    if (this.bufferedSamples > 0) await this.finalizeUtterance();
    this.node?.disconnect();
    this.node = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.ctx) { await this.ctx.close().catch(() => {}); this.ctx = null; }
    this.buffer = [];
    this.bufferedSamples = 0;
    this.speaking = false;
  }

  /** Handles one frame: resample → VAD → accumulate / finalize. */
  private onFrame(frame: Float32Array, inputRate: number): void {
    const samples =
      inputRate === this.opts.targetSampleRate ? frame : this.resample(frame, inputRate, this.opts.targetSampleRate);

    // Compute RMS energy for the VAD decision.
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / samples.length);
    const now = performance.now();

    if (rms >= this.opts.vadThreshold) {
      if (!this.speaking) {
        this.speaking = true;
        this.utteranceStartMs = now;
        this.emit({ type: 'speech-start' });
      }
      this.lastVoiceTs = now;
      this.buffer.push(samples);
      this.bufferedSamples += samples.length;
    } else if (this.speaking) {
      // Keep buffering during the hangover window so we don't clip word tails.
      this.buffer.push(samples);
      this.bufferedSamples += samples.length;
      if (now - this.lastVoiceTs >= this.opts.silenceHangoverMs) {
        void this.finalizeUtterance();
      }
    }

    // Hard cap to keep memory + latency bounded on long monologues.
    const elapsed = now - this.utteranceStartMs;
    if (this.speaking && elapsed >= this.opts.maxUtteranceMs) {
      void this.finalizeUtterance();
    }
  }

  /** Concatenates buffered samples, runs Whisper, emits final transcript. */
  private async finalizeUtterance(): Promise<void> {
    if (this.decoding || this.bufferedSamples === 0 || !this.asr) return;
    this.decoding = true;

    const merged = new Float32Array(this.bufferedSamples);
    let off = 0;
    for (const b of this.buffer) { merged.set(b, off); off += b.length; }
    const startMs = this.utteranceStartMs;
    const endMs = performance.now();

    this.buffer = [];
    this.bufferedSamples = 0;
    this.speaking = false;
    this.emit({ type: 'speech-end' });

    try {
      const result = await this.asr(merged, {
        language: this.opts.language,
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
      });
      const text = Array.isArray(result)
        ? result.map((r) => r.text).join(' ').trim()
        : (result?.text ?? '').trim();
      if (text) this.emit({ type: 'final', text, startMs, endMs });
    } catch (err) {
      this.emit({ type: 'error', error: err instanceof Error ? err : new Error(String(err)) });
    } finally {
      this.decoding = false;
    }
  }

  /** Linear-interpolation resampler (adequate for speech VAD + Whisper). */
  private resample(input: Float32Array, from: number, to: number): Float32Array {
    if (from === to) return input;
    const ratio = to / from;
    const outLen = Math.round(input.length * ratio);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const srcPos = i / ratio;
      const i0 = Math.floor(srcPos);
      const i1 = Math.min(i0 + 1, input.length - 1);
      const frac = srcPos - i0;
      out[i] = input[i0] * (1 - frac) + input[i1] * frac;
    }
    return out;
  }

  /** Builds an object-URL AudioWorklet that forwards mono PCM frames. */
  private workletURL(): string {
    const processor = `
      class PCMTap extends AudioWorkletProcessor {
        process(inputs) {
          const ch = inputs[0] && inputs[0][0];
          if (ch && ch.length) {
            // Copy out of the reused worklet buffer before transferring.
            this.port.postMessage(ch.slice(0));
          }
          return true;
        }
      }
      registerProcessor('pcm-tap', PCMTap);
    `;
    return URL.createObjectURL(new Blob([processor], { type: 'application/javascript' }));
  }
}
