/**
 * timeline-processor.ts
 * ---------------------------------------------------------------------------
 * Non-linear editing (NLE) timeline model and FFmpeg command compiler.
 *
 * Models tracks → clips with source in/out points and timeline placement,
 * supports ripple insert/delete, split, trim, and gap detection, then compiles
 * the arranged timeline into a deterministic `filter_complex` graph plus the
 * ordered input list that `worker-ffmpeg.js` can execute to render a flat file.
 *
 * Times are expressed in whole milliseconds to avoid float drift; conversion
 * to seconds happens only at command-compile time.
 * ---------------------------------------------------------------------------
 */

export type Millis = number;

export interface MediaSource {
  readonly id: string;
  readonly url: string;
  readonly durationMs: Millis;
  readonly hasAudio: boolean;
  readonly width: number;
  readonly height: number;
}

export interface Clip {
  readonly id: string;
  readonly sourceId: string;
  /** in/out within the *source* media. */
  inMs: Millis;
  outMs: Millis;
  /** start position on the *timeline*. */
  startMs: Millis;
  /** linear gain 0..1 applied to this clip's audio. */
  gain: number;
}

export interface Track {
  readonly id: string;
  readonly kind: 'video' | 'audio';
  clips: Clip[];
}

export interface CompiledRender {
  inputs: Array<{ sourceId: string; url: string }>;
  filterComplex: string;
  mapArgs: string[];
  totalMs: Millis;
}

let counter = 0;
const uid = (p: string): string => `${p}_${(counter++).toString(36)}_${Date.now().toString(36)}`;

export class TimelineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimelineError';
  }
}

export class Timeline {
  private readonly sources = new Map<string, MediaSource>();
  readonly tracks: Track[] = [];

  registerSource(src: MediaSource): void {
    this.sources.set(src.id, src);
  }

  addTrack(kind: Track['kind']): Track {
    const track: Track = { id: uid('trk'), kind, clips: [] };
    this.tracks.push(track);
    return track;
  }

  private trackOrThrow(trackId: string): Track {
    const t = this.tracks.find((x) => x.id === trackId);
    if (!t) throw new TimelineError(`track ${trackId} not found`);
    return t;
  }

  private clipDuration(c: Clip): Millis {
    return c.outMs - c.inMs;
  }

  /** Appends a clip to the end of a track (after the last clip). */
  append(trackId: string, sourceId: string, inMs = 0, outMs?: Millis, gain = 1): Clip {
    const src = this.sources.get(sourceId);
    if (!src) throw new TimelineError(`source ${sourceId} not registered`);
    const realOut = outMs ?? src.durationMs;
    if (inMs < 0 || realOut > src.durationMs || inMs >= realOut) {
      throw new TimelineError(`invalid in/out [${inMs}, ${realOut}] for source ${sourceId}`);
    }
    const track = this.trackOrThrow(trackId);
    const tail = track.clips.at(-1);
    const startMs = tail ? tail.startMs + this.clipDuration(tail) : 0;
    const clip: Clip = { id: uid('clp'), sourceId, inMs, outMs: realOut, startMs, gain };
    track.clips.push(clip);
    return clip;
  }

  /**
   * Splits a clip at an absolute timeline position, producing two adjacent
   * clips. Returns the newly created right-hand clip.
   */
  split(trackId: string, clipId: string, atTimelineMs: Millis): Clip {
    const track = this.trackOrThrow(trackId);
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx < 0) throw new TimelineError(`clip ${clipId} not found`);
    const c = track.clips[idx];
    const offset = atTimelineMs - c.startMs;
    if (offset <= 0 || offset >= this.clipDuration(c)) {
      throw new TimelineError('split point must lie strictly inside the clip');
    }
    const right: Clip = {
      id: uid('clp'),
      sourceId: c.sourceId,
      inMs: c.inMs + offset,
      outMs: c.outMs,
      startMs: c.startMs + offset,
      gain: c.gain,
    };
    c.outMs = c.inMs + offset;
    track.clips.splice(idx + 1, 0, right);
    return right;
  }

  /** Ripple-deletes a clip, pulling all later clips left to close the gap. */
  rippleDelete(trackId: string, clipId: string): void {
    const track = this.trackOrThrow(trackId);
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx < 0) throw new TimelineError(`clip ${clipId} not found`);
    const removed = track.clips.splice(idx, 1)[0];
    const shift = this.clipDuration(removed);
    for (let i = idx; i < track.clips.length; i++) track.clips[i].startMs -= shift;
  }

  /** Ripple-inserts a source clip at a position, pushing later clips right. */
  rippleInsert(trackId: string, sourceId: string, atMs: Millis, inMs = 0, outMs?: Millis): Clip {
    const src = this.sources.get(sourceId);
    if (!src) throw new TimelineError(`source ${sourceId} not registered`);
    const track = this.trackOrThrow(trackId);
    const realOut = outMs ?? src.durationMs;
    const dur = realOut - inMs;
    for (const c of track.clips) if (c.startMs >= atMs) c.startMs += dur;
    const clip: Clip = { id: uid('clp'), sourceId, inMs, outMs: realOut, startMs: atMs, gain: 1 };
    track.clips.push(clip);
    track.clips.sort((a, b) => a.startMs - b.startMs);
    return clip;
  }

  /** Returns [start,end) gaps on a track in timeline order. */
  gaps(trackId: string): Array<{ startMs: Millis; endMs: Millis }> {
    const track = this.trackOrThrow(trackId);
    const sorted = [...track.clips].sort((a, b) => a.startMs - b.startMs);
    const out: Array<{ startMs: Millis; endMs: Millis }> = [];
    let cursor = 0;
    for (const c of sorted) {
      if (c.startMs > cursor) out.push({ startMs: cursor, endMs: c.startMs });
      cursor = Math.max(cursor, c.startMs + this.clipDuration(c));
    }
    return out;
  }

  get totalMs(): Millis {
    let max = 0;
    for (const t of this.tracks)
      for (const c of t.clips) max = Math.max(max, c.startMs + this.clipDuration(c));
    return max;
  }

  /**
   * Compiles the timeline into an FFmpeg `filter_complex` render plan.
   * Each clip becomes a trimmed + delayed segment; segments are overlaid
   * (video) and mixed (audio) into the final [vout]/[aout] pads.
   */
  compile(canvas = { width: 1920, height: 1080, fps: 30 }): CompiledRender {
    const usedSources = new Map<string, number>(); // sourceId -> input index
    const inputs: CompiledRender['inputs'] = [];
    const segments: string[] = [];
    const videoLabels: string[] = [];
    const audioLabels: string[] = [];
    const ms = (x: number) => (x / 1000).toFixed(3);

    const inputIndexFor = (sourceId: string): number => {
      if (usedSources.has(sourceId)) return usedSources.get(sourceId)!;
      const src = this.sources.get(sourceId)!;
      const idx = inputs.length;
      inputs.push({ sourceId, url: src.url });
      usedSources.set(sourceId, idx);
      return idx;
    };

    let seg = 0;
    for (const track of this.tracks) {
      for (const clip of track.clips) {
        const ii = inputIndexFor(clip.sourceId);
        const dur = this.clipDuration(clip);
        if (track.kind === 'video') {
          const vlabel = `v${seg}`;
          segments.push(
            `[${ii}:v]trim=start=${ms(clip.inMs)}:end=${ms(clip.outMs)},` +
              `setpts=PTS-STARTPTS+${ms(clip.startMs)}/TB,` +
              `scale=${canvas.width}:${canvas.height}:force_original_aspect_ratio=decrease,` +
              `pad=${canvas.width}:${canvas.height}:(ow-iw)/2:(oh-ih)/2,` +
              `fps=${canvas.fps}[${vlabel}]`,
          );
          videoLabels.push(vlabel);
        } else {
          const alabel = `a${seg}`;
          segments.push(
            `[${ii}:a]atrim=start=${ms(clip.inMs)}:end=${ms(clip.outMs)},` +
              `asetpts=PTS-STARTPTS,` +
              `adelay=${clip.startMs}|${clip.startMs},` +
              `volume=${clip.gain.toFixed(3)}[${alabel}]`,
          );
          audioLabels.push(alabel);
          void dur;
        }
        seg++;
      }
    }

    // Compose video: start from a black canvas, overlay each segment in order.
    const filterParts = [...segments];
    const mapArgs: string[] = [];

    if (videoLabels.length > 0) {
      filterParts.push(
        `color=c=black:s=${canvas.width}x${canvas.height}:r=${canvas.fps}:` +
          `d=${ms(this.totalMs)}[bg]`,
      );
      let prev = 'bg';
      videoLabels.forEach((label, i) => {
        const out = i === videoLabels.length - 1 ? 'vout' : `ov${i}`;
        filterParts.push(`[${prev}][${label}]overlay=eof_action=pass[${out}]`);
        prev = out;
      });
      mapArgs.push('-map', '[vout]');
    }

    if (audioLabels.length > 0) {
      filterParts.push(
        `${audioLabels.map((l) => `[${l}]`).join('')}amix=inputs=${audioLabels.length}:` +
          `normalize=0[aout]`,
      );
      mapArgs.push('-map', '[aout]');
    }

    return {
      inputs,
      filterComplex: filterParts.join(';'),
      mapArgs,
      totalMs: this.totalMs,
    };
  }
}
