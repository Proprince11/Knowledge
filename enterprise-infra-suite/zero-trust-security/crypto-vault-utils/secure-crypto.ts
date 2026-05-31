/**
 * Crypto Vault Utils — Authenticated Encryption Library
 * -----------------------------------------------------
 * A small, audited-pattern wrapper around Node's native `crypto` module that
 * provides authenticated encryption for sensitive data using AES-256-GCM.
 *
 * Node's crypto is backed by OpenSSL, which transparently uses CPU AES-NI
 * instructions when available — so this path is hardware-accelerated on modern
 * x86_64 / ARMv8 hardware with no extra configuration.
 *
 * Security properties:
 *   - AES-256-GCM: confidentiality + integrity (AEAD) in one primitive
 *   - 96-bit random IV per message (NIST SP 800-38D recommended GCM nonce size)
 *   - 128-bit authentication tag, verified on every decrypt
 *   - Additional Authenticated Data (AAD) binding (e.g. tenant id, record id)
 *   - Self-describing, versioned envelope so the format can evolve safely
 *   - Key derivation from passphrases via scrypt (memory-hard) and from
 *     high-entropy master keys via HKDF (per-context subkeys)
 *   - Key-ring with key ids for zero-downtime key rotation
 *   - Constant-time tag handling; secrets zeroized after use where feasible
 *
 * Envelope layout (binary, base64-encoded for transport):
 *   magic(4) | version(1) | keyIdLen(1) | keyId(n) | ivLen(1) | iv |
 *   tagLen(1) | tag | ciphertext
 *
 * NOTE: This library never logs plaintext or key material.
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32; // 256-bit key
const IV_BYTES = 12; // 96-bit nonce for GCM
const TAG_BYTES = 16; // 128-bit auth tag
const MAGIC = Buffer.from('CVX1', 'ascii'); // Crypto Vault eXchange, format family
const VERSION = 1;

export interface KeyEntry {
  /** Stable key identifier embedded in the envelope. */
  id: string;
  /** 32-byte raw key material. */
  key: Buffer;
}

export interface EncryptOptions {
  /** Additional Authenticated Data — authenticated but not encrypted. */
  aad?: Buffer | string;
  /** Override which key id to encrypt with (defaults to the active key). */
  keyId?: string;
}

export interface DecryptOptions {
  aad?: Buffer | string;
}

function toBuffer(input: Buffer | string, encoding: BufferEncoding = 'utf8'): Buffer {
  return Buffer.isBuffer(input) ? input : Buffer.from(input, encoding);
}

/** Best-effort zeroization of sensitive buffers. */
function wipe(buf?: Buffer): void {
  if (buf && buf.length) buf.fill(0);
}

// ---- Key derivation --------------------------------------------------------

export interface ScryptParams {
  N?: number; // CPU/memory cost (must be power of 2). Default 2^15.
  r?: number; // block size. Default 8.
  p?: number; // parallelization. Default 1.
}

/**
 * Derive a 256-bit key from a passphrase using scrypt (memory-hard KDF).
 * Returns the key plus the salt/params needed to re-derive it later.
 */
export function deriveKeyFromPassphrase(
  passphrase: string,
  salt?: Buffer,
  params: ScryptParams = {},
): { key: Buffer; salt: Buffer; params: Required<ScryptParams> } {
  const resolved: Required<ScryptParams> = {
    N: params.N ?? 2 ** 15,
    r: params.r ?? 8,
    p: params.p ?? 1,
  };
  const usedSalt = salt ?? crypto.randomBytes(16);
  const key = crypto.scryptSync(passphrase, usedSalt, KEY_BYTES, {
    N: resolved.N,
    r: resolved.r,
    p: resolved.p,
    // scrypt needs enough maxmem for the chosen cost parameters.
    maxmem: 256 * resolved.N * resolved.r,
  });
  return { key, salt: usedSalt, params: resolved };
}

/**
 * Derive a context-specific subkey from a high-entropy master key using HKDF.
 * Ideal for per-tenant / per-purpose key separation without storing many keys.
 */
export function deriveSubKey(masterKey: Buffer, context: string, salt?: Buffer): Buffer {
  if (masterKey.length < KEY_BYTES) {
    throw new Error('master key must be at least 32 bytes for HKDF-SHA256');
  }
  const usedSalt = salt ?? Buffer.alloc(0);
  const derived = crypto.hkdfSync('sha256', masterKey, usedSalt, Buffer.from(context), KEY_BYTES);
  return Buffer.from(derived);
}

/** Generate a fresh random 256-bit key. */
export function generateKey(): Buffer {
  return crypto.randomBytes(KEY_BYTES);
}

// ---- Envelope (de)serialization --------------------------------------------

interface ParsedEnvelope {
  version: number;
  keyId: string;
  iv: Buffer;
  tag: Buffer;
  ciphertext: Buffer;
}

function packEnvelope(keyId: string, iv: Buffer, tag: Buffer, ciphertext: Buffer): Buffer {
  const keyIdBuf = Buffer.from(keyId, 'utf8');
  if (keyIdBuf.length > 255) throw new Error('keyId too long (max 255 bytes)');
  return Buffer.concat([
    MAGIC,
    Buffer.from([VERSION]),
    Buffer.from([keyIdBuf.length]),
    keyIdBuf,
    Buffer.from([iv.length]),
    iv,
    Buffer.from([tag.length]),
    tag,
    ciphertext,
  ]);
}

function parseEnvelope(buf: Buffer): ParsedEnvelope {
  let offset = 0;
  const magic = buf.subarray(offset, offset + MAGIC.length);
  offset += MAGIC.length;
  if (!magic.equals(MAGIC)) throw new Error('invalid ciphertext: bad magic header');

  const version = buf.readUInt8(offset);
  offset += 1;
  if (version !== VERSION) throw new Error(`unsupported envelope version: ${version}`);

  const keyIdLen = buf.readUInt8(offset);
  offset += 1;
  const keyId = buf.subarray(offset, offset + keyIdLen).toString('utf8');
  offset += keyIdLen;

  const ivLen = buf.readUInt8(offset);
  offset += 1;
  const iv = buf.subarray(offset, offset + ivLen);
  offset += ivLen;

  const tagLen = buf.readUInt8(offset);
  offset += 1;
  const tag = buf.subarray(offset, offset + tagLen);
  offset += tagLen;

  const ciphertext = buf.subarray(offset);
  return { version, keyId, iv, tag, ciphertext };
}

// ---- The vault -------------------------------------------------------------

export class CryptoVault {
  private readonly keyring = new Map<string, Buffer>();
  private activeKeyId: string;

  /**
   * @param keys one or more keys; the first is the default "active" key used
   *             for new encryptions. All keys remain usable for decryption,
   *             enabling seamless key rotation.
   */
  constructor(keys: KeyEntry[]) {
    if (!keys || keys.length === 0) {
      throw new Error('CryptoVault requires at least one key');
    }
    for (const entry of keys) {
      this.assertKey(entry.key);
      this.keyring.set(entry.id, entry.key);
    }
    this.activeKeyId = keys[0].id;
  }

  private assertKey(key: Buffer): void {
    if (!Buffer.isBuffer(key) || key.length !== KEY_BYTES) {
      throw new Error(`key must be a ${KEY_BYTES}-byte Buffer (AES-256)`);
    }
  }

  /** Add a new key and (optionally) promote it to active for new writes. */
  addKey(entry: KeyEntry, makeActive = true): void {
    this.assertKey(entry.key);
    this.keyring.set(entry.id, entry.key);
    if (makeActive) this.activeKeyId = entry.id;
  }

  /** Remove a retired key once no ciphertext references it anymore. */
  removeKey(keyId: string): boolean {
    if (keyId === this.activeKeyId) {
      throw new Error('cannot remove the active key; rotate to a new key first');
    }
    return this.keyring.delete(keyId);
  }

  getActiveKeyId(): string {
    return this.activeKeyId;
  }

  /**
   * Encrypt plaintext with AES-256-GCM. Returns a self-describing envelope.
   * @returns base64url-encoded envelope string
   */
  encrypt(plaintext: Buffer | string, options: EncryptOptions = {}): string {
    const keyId = options.keyId ?? this.activeKeyId;
    const key = this.keyring.get(keyId);
    if (!key) throw new Error(`unknown keyId: ${keyId}`);

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
      authTagLength: TAG_BYTES,
    });

    if (options.aad !== undefined) {
      cipher.setAAD(toBuffer(options.aad));
    }

    const pt = toBuffer(plaintext);
    const ciphertext = Buffer.concat([cipher.update(pt), cipher.final()]);
    const tag = cipher.getAuthTag();

    const envelope = packEnvelope(keyId, iv, tag, ciphertext);
    // Wipe the transient plaintext copy if we created it from a string.
    if (!Buffer.isBuffer(plaintext)) wipe(pt);
    return envelope.toString('base64url');
  }

  /**
   * Decrypt a base64url envelope produced by {@link encrypt}.
   * Throws if the authentication tag fails (tampering/wrong key/AAD mismatch).
   * @returns plaintext Buffer
   */
  decrypt(envelopeB64: string, options: DecryptOptions = {}): Buffer {
    const buf = Buffer.from(envelopeB64, 'base64url');
    const { keyId, iv, tag, ciphertext } = parseEnvelope(buf);

    const key = this.keyring.get(keyId);
    if (!key) throw new Error(`cannot decrypt: key "${keyId}" not in keyring`);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: TAG_BYTES,
    });
    decipher.setAuthTag(tag);
    if (options.aad !== undefined) {
      decipher.setAAD(toBuffer(options.aad));
    }

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
      // Do not leak details about why authentication failed.
      throw new Error('decryption failed: authentication tag mismatch');
    }
  }

  /** Convenience: decrypt and decode as a UTF-8 string. */
  decryptToString(envelopeB64: string, options: DecryptOptions = {}): string {
    const pt = this.decrypt(envelopeB64, options);
    const str = pt.toString('utf8');
    wipe(pt);
    return str;
  }

  /**
   * Re-encrypt an existing envelope under the current active key (key rotation
   * for data at rest). Returns a new envelope; the AAD must match the original.
   */
  reEncrypt(envelopeB64: string, options: { aad?: Buffer | string } = {}): string {
    const plaintext = this.decrypt(envelopeB64, { aad: options.aad });
    try {
      return this.encrypt(plaintext, { aad: options.aad });
    } finally {
      wipe(plaintext);
    }
  }
}

// ---- Misc cryptographic helpers --------------------------------------------

/** Constant-time comparison of two secrets (e.g. tokens, MACs). */
export function constantTimeEqual(a: Buffer | string, b: Buffer | string): boolean {
  const ab = toBuffer(a);
  const bb = toBuffer(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Salted SHA-256 HMAC, useful for deterministic blind indexes of PII. */
export function hmacSha256(value: Buffer | string, key: Buffer | string): string {
  return crypto.createHmac('sha256', toBuffer(key)).update(toBuffer(value)).digest('base64url');
}

/** Generate a cryptographically strong random token. */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export const constants = {
  ALGORITHM,
  KEY_BYTES,
  IV_BYTES,
  TAG_BYTES,
  VERSION,
} as const;

export default CryptoVault;

// ---- Self-test (run with ts-node, or compile then `node secure-crypto.js`) -
// Guarded so importing the module never executes the demo.
declare const require: NodeJS.Require | undefined;
declare const module: NodeJS.Module | undefined;
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const masterKey = generateKey();
  const k1 = deriveSubKey(masterKey, 'tenant:acme:v1');
  const vault = new CryptoVault([{ id: 'tenant-acme-v1', key: k1 }]);

  const aad = 'record:42';
  const secret = 'patient SSN 000-00-0000 — highly sensitive';
  const envelope = vault.encrypt(secret, { aad });
  const recovered = vault.decryptToString(envelope, { aad });

  // eslint-disable-next-line no-console
  console.log('[crypto] envelope (base64url):', envelope.slice(0, 48) + '…');
  // eslint-disable-next-line no-console
  console.log('[crypto] round-trip ok:', recovered === secret);

  // Demonstrate tamper detection.
  let tamperDetected = false;
  try {
    vault.decryptToString(envelope, { aad: 'record:99' }); // wrong AAD
  } catch {
    tamperDetected = true;
  }
  // eslint-disable-next-line no-console
  console.log('[crypto] AAD tamper detected:', tamperDetected);

  // Demonstrate key rotation.
  const k2 = deriveSubKey(masterKey, 'tenant:acme:v2');
  vault.addKey({ id: 'tenant-acme-v2', key: k2 }, true);
  const rotated = vault.reEncrypt(envelope, { aad });
  // eslint-disable-next-line no-console
  console.log('[crypto] rotated to active key:', vault.getActiveKeyId());
  // eslint-disable-next-line no-console
  console.log('[crypto] rotated round-trip ok:', vault.decryptToString(rotated, { aad }) === secret);
}
