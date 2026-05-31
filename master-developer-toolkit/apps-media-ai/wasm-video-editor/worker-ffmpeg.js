/* eslint-env worker */
'use strict';

/**
 * worker-ffmpeg.js
 * ---------------------------------------------------------------------------
 * Web Worker that wraps FFmpeg.wasm (@ffmpeg/ffmpeg + @ffmpeg/util) to run
 * client-side video operations off the main thread: trimming, concatenation,
 * transcoding, thumbnail extraction, and audio extraction.
 *
 * Protocol (postMessage):
 *   IN : { id, type: 'load' | 'cut' | 'concat' | 'transcode' | 'thumbnail' |
 *          'extractAudio' | 'dispose', payload }
 *   OUT: { id, type: 'ready' | 'progress' | 'result' | 'error', ... }
 *
 * Transferables: all returned media buffers are posted with their underlying
 * ArrayBuffer in the transfer list to avoid copies. Inputs are unlinked from
 * the in-memory FS after every op to bound memory usage.
 * ---------------------------------------------------------------------------
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.10';
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

/** @type {FFmpeg | null} */
let ffmpeg = null;
let loading = null;
let activeJob = null;

function reply(id, type, extra = {}, transfer = []) {
  self.postMessage({ id, type, ...extra }, transfer);
}

/** Lazily load the wasm core exactly once; concurrent calls share the promise. */
async function ensureLoaded(id) {
  if (ffmpeg) return ffmpeg;
  if (loading) return loading;

  loading = (async () => {
    const instance = new FFmpeg();
    instance.on('log', ({ message }) => reply(id, 'progress', { stage: 'log', message }));
    instance.on('progress', ({ progress, time }) =>
      reply(id, 'progress', { stage: 'transcode', ratio: progress, time }),
    );
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loading;
}

/** Writes a source (Blob/ArrayBuffer/URL) into the wasm FS under `name`. */
async function mount(ff, name, source) {
  const data = await fetchFile(source);
  await ff.writeFile(name, data);
  return name;
}

/** Reads + unlinks an output file, returning a transferable buffer. */
async function harvest(ff, name) {
  const data = await ff.readFile(name); // Uint8Array
  await ff.deleteFile(name).catch(() => {});
  return data;
}

async function safeUnlink(ff, names) {
  await Promise.all(names.map((n) => ff.deleteFile(n).catch(() => {})));
}

/* ----------------------------- Operations ------------------------------- */

async function opCut(ff, { input, start, duration, outName = 'cut.mp4', copy = true }) {
  const inName = `in_${Date.now()}.${guessExt(input, 'mp4')}`;
  await mount(ff, inName, input);
  const args = ['-ss', String(start), '-i', inName];
  if (duration != null) args.push('-t', String(duration));
  // Stream copy is near-instant; re-encode only when frame-accurate cuts are needed.
  args.push(...(copy ? ['-c', 'copy'] : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20']));
  args.push('-movflags', '+faststart', outName);
  await ff.exec(args);
  const data = await harvest(ff, outName);
  await safeUnlink(ff, [inName]);
  return data;
}

async function opConcat(ff, { inputs, outName = 'joined.mp4', reencode = false }) {
  if (!Array.isArray(inputs) || inputs.length < 2) {
    throw new Error('concat requires at least two inputs');
  }
  const names = [];
  for (let i = 0; i < inputs.length; i++) {
    names.push(await mount(ff, `seg_${i}.mp4`, inputs[i]));
  }
  let args;
  if (reencode) {
    // Filter-based concat handles heterogeneous codecs/resolutions.
    const inArgs = names.flatMap((n) => ['-i', n]);
    const filter =
      names.map((_, i) => `[${i}:v:0][${i}:a:0]`).join('') +
      `concat=n=${names.length}:v=1:a=1[v][a]`;
    args = [...inArgs, '-filter_complex', filter, '-map', '[v]', '-map', '[a]',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', outName];
  } else {
    // Demuxer concat is lossless but requires identical codecs/params.
    const list = names.map((n) => `file '${n}'`).join('\n');
    await ff.writeFile('concat_list.txt', new TextEncoder().encode(list));
    args = ['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', outName];
    names.push('concat_list.txt');
  }
  await ff.exec(args);
  const data = await harvest(ff, outName);
  await safeUnlink(ff, names);
  return data;
}

async function opTranscode(ff, { input, outName = 'out.mp4', vcodec = 'libx264', crf = 23, preset = 'medium', scale, fps }) {
  const inName = `in_${Date.now()}.${guessExt(input, 'mp4')}`;
  await mount(ff, inName, input);
  const vf = [];
  if (scale) vf.push(`scale=${scale}`);
  if (fps) vf.push(`fps=${fps}`);
  const args = ['-i', inName, '-c:v', vcodec, '-crf', String(crf), '-preset', preset];
  if (vf.length) args.push('-vf', vf.join(','));
  args.push('-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', outName);
  await ff.exec(args);
  const data = await harvest(ff, outName);
  await safeUnlink(ff, [inName]);
  return data;
}

async function opThumbnail(ff, { input, at = 1, width = 320, outName = 'thumb.jpg' }) {
  const inName = `in_${Date.now()}.${guessExt(input, 'mp4')}`;
  await mount(ff, inName, input);
  await ff.exec(['-ss', String(at), '-i', inName, '-frames:v', '1',
    '-vf', `scale=${width}:-1`, '-q:v', '3', outName]);
  const data = await harvest(ff, outName);
  await safeUnlink(ff, [inName]);
  return data;
}

async function opExtractAudio(ff, { input, outName = 'audio.mp3', bitrate = '192k' }) {
  const inName = `in_${Date.now()}.${guessExt(input, 'mp4')}`;
  await mount(ff, inName, input);
  await ff.exec(['-i', inName, '-vn', '-acodec', 'libmp3lame', '-b:a', bitrate, outName]);
  const data = await harvest(ff, outName);
  await safeUnlink(ff, [inName]);
  return data;
}

function guessExt(source, fallback) {
  if (typeof source === 'string') {
    const m = /\.([a-z0-9]{2,4})(?:\?|#|$)/i.exec(source);
    if (m) return m[1].toLowerCase();
  }
  if (source && typeof source.name === 'string') {
    const m = /\.([a-z0-9]{2,4})$/i.exec(source.name);
    if (m) return m[1].toLowerCase();
  }
  return fallback;
}

const OPS = {
  cut: opCut,
  concat: opConcat,
  transcode: opTranscode,
  thumbnail: opThumbnail,
  extractAudio: opExtractAudio,
};

/* ------------------------------- Router --------------------------------- */

self.onmessage = async (event) => {
  const { id, type, payload } = event.data || {};
  try {
    if (type === 'load') {
      await ensureLoaded(id);
      reply(id, 'ready', { coreVersion: CORE_VERSION });
      return;
    }

    if (type === 'dispose') {
      if (ffmpeg) {
        try { ffmpeg.terminate(); } catch { /* already gone */ }
      }
      ffmpeg = null;
      loading = null;
      reply(id, 'result', { disposed: true });
      return;
    }

    const op = OPS[type];
    if (!op) throw new Error(`unknown op "${type}"`);
    if (activeJob) throw new Error('worker is busy; one op at a time per worker');

    const ff = await ensureLoaded(id);
    activeJob = id;
    const data = await op(ff, payload || {});
    activeJob = null;

    // Transfer the ArrayBuffer to avoid a structured-clone copy.
    reply(id, 'result', { data, byteLength: data.byteLength }, [data.buffer]);
  } catch (err) {
    activeJob = null;
    reply(id, 'error', { message: err?.message || String(err) });
  }
};
