/**
 * voice-profile-manager.ts
 * ---------------------------------------------------------------------------
 * Typed manager for voice profiles used by the voice-cloning studio.
 *
 * Stores speaker metadata, the voice embedding vector, and an immutable
 * consent record per profile. Persistence is abstracted behind a small
 * `ProfileStore` interface so the same logic works against memory, file,
 * Redis, or a SQL adapter. Includes cosine-similarity matching to detect
 * duplicate / impersonating uploads.
 *
 * Target: TypeScript 5.x, ES2022, strict mode.
 * ---------------------------------------------------------------------------
 */

export type Embedding = Float32Array;

export interface ConsentRecord {
  readonly grantedBy: string;
  readonly grantedAt: number;
  readonly expiresAt: number;
  readonly scope: ReadonlyArray<'preview' | 'synthesis' | 'commercial'>;
  readonly signature: string;
}

export interface VoiceProfile {
  readonly id: string;
  displayName: string;
  readonly speakerId: string;
  readonly sampleRate: number;
  readonly embedding: Embedding;
  readonly consent: ConsentRecord;
  tags: string[];
  readonly createdAt: number;
  updatedAt: number;
  version: number;
}

export interface ProfileStore {
  get(id: string): Promise<VoiceProfile | null>;
  put(profile: VoiceProfile): Promise<void>;
  delete(id: string): Promise<boolean>;
  list(): Promise<VoiceProfile[]>;
}

/** Default in-process store. Swap for Redis/SQL in production via DI. */
export class MemoryProfileStore implements ProfileStore {
  private readonly map = new Map<string, VoiceProfile>();

  async get(id: string): Promise<VoiceProfile | null> {
    return this.map.get(id) ?? null;
  }

  async put(profile: VoiceProfile): Promise<void> {
    this.map.set(profile.id, profile);
  }

  async delete(id: string): Promise<boolean> {
    return this.map.delete(id);
  }

  async list(): Promise<VoiceProfile[]> {
    return [...this.map.values()];
  }
}

export interface CreateProfileInput {
  displayName: string;
  speakerId: string;
  sampleRate: number;
  embedding: ArrayLike<number>;
  consent: Omit<ConsentRecord, 'signature'>;
  tags?: string[];
}

export class ProfileError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'NOT_FOUND'
      | 'CONSENT_EXPIRED'
      | 'CONSENT_MISSING'
      | 'DUPLICATE'
      | 'VALIDATION',
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

/**
 * L2-normalizes a vector in place and returns it. Normalization makes cosine
 * similarity reduce to a dot product, which is cheap in the matching hot path.
 */
function l2normalize(v: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const inv = sum > 0 ? 1 / Math.sqrt(sum) : 0;
  for (let i = 0; i < v.length; i++) v[i] *= inv;
  return v;
}

/** Cosine similarity for already L2-normalized vectors == dot product. */
function dot(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new ProfileError('embedding dimensionality mismatch', 'VALIDATION');
  }
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export class VoiceProfileManager {
  private readonly store: ProfileStore;
  private readonly signer: (record: Omit<ConsentRecord, 'signature'>, id: string) => string;
  private readonly duplicateThreshold: number;

  constructor(opts: {
    store?: ProfileStore;
    signer: (record: Omit<ConsentRecord, 'signature'>, id: string) => string;
    duplicateThreshold?: number;
  }) {
    this.store = opts.store ?? new MemoryProfileStore();
    this.signer = opts.signer;
    this.duplicateThreshold = opts.duplicateThreshold ?? 0.92;
  }

  private static newId(): string {
    // RFC4122-ish id without pulling a dependency; crypto is available in
    // Node and modern browsers/workers.
    const g = globalThis.crypto;
    if (g?.randomUUID) return g.randomUUID();
    return 'vp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /** Validates and persists a new voice profile, refusing duplicates. */
  async create(input: CreateProfileInput): Promise<VoiceProfile> {
    if (!input.displayName?.trim()) {
      throw new ProfileError('displayName is required', 'VALIDATION');
    }
    if (!input.consent?.grantedBy) {
      throw new ProfileError('consent.grantedBy is required', 'CONSENT_MISSING');
    }
    if (input.consent.expiresAt <= Date.now()) {
      throw new ProfileError('consent already expired', 'CONSENT_EXPIRED');
    }

    const embedding = l2normalize(Float32Array.from(input.embedding));

    // Reject near-duplicate voiceprints (anti-impersonation safeguard).
    const existing = await this.store.list();
    for (const p of existing) {
      if (p.embedding.length === embedding.length) {
        const sim = dot(p.embedding, embedding);
        if (sim >= this.duplicateThreshold && p.speakerId !== input.speakerId) {
          throw new ProfileError(
            `voiceprint matches existing profile ${p.id} (sim=${sim.toFixed(3)}); ` +
              'refusing to register without explicit speaker reconciliation',
            'DUPLICATE',
          );
        }
      }
    }

    const id = VoiceProfileManager.newId();
    const now = Date.now();
    const consent: ConsentRecord = {
      ...input.consent,
      scope: [...input.consent.scope],
      signature: this.signer(input.consent, id),
    };

    const profile: VoiceProfile = {
      id,
      displayName: input.displayName.trim(),
      speakerId: input.speakerId,
      sampleRate: input.sampleRate,
      embedding,
      consent,
      tags: input.tags ? [...input.tags] : [],
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    await this.store.put(profile);
    return profile;
  }

  async get(id: string): Promise<VoiceProfile> {
    const p = await this.store.get(id);
    if (!p) throw new ProfileError(`profile ${id} not found`, 'NOT_FOUND');
    return p;
  }

  /** Confirms a profile may currently be used for the requested scope. */
  async assertUsable(id: string, scope: ConsentRecord['scope'][number]): Promise<VoiceProfile> {
    const p = await this.get(id);
    if (p.consent.expiresAt <= Date.now()) {
      throw new ProfileError(`consent for ${id} expired`, 'CONSENT_EXPIRED');
    }
    if (!p.consent.scope.includes(scope)) {
      throw new ProfileError(`scope "${scope}" not granted for ${id}`, 'CONSENT_MISSING');
    }
    return p;
  }

  async rename(id: string, displayName: string): Promise<VoiceProfile> {
    const p = await this.get(id);
    const updated: VoiceProfile = {
      ...p,
      displayName: displayName.trim(),
      updatedAt: Date.now(),
      version: p.version + 1,
    };
    await this.store.put(updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  /** Returns the best-matching profile for a query embedding, if above floor. */
  async match(query: ArrayLike<number>, floor = 0.8): Promise<{ profile: VoiceProfile; score: number } | null> {
    const q = l2normalize(Float32Array.from(query));
    let best: { profile: VoiceProfile; score: number } | null = null;
    for (const p of await this.store.list()) {
      if (p.embedding.length !== q.length) continue;
      const score = dot(p.embedding, q);
      if (score >= floor && (!best || score > best.score)) best = { profile: p, score };
    }
    return best;
  }
}
