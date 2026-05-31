'use strict';

/**
 * ECDSA Auth — Elliptic Curve Signature Verification Library
 * ----------------------------------------------------------
 * Validates message authenticity using ECDSA over standard NIST/SEC curves.
 * Built on Node's native `crypto` (OpenSSL) — no third-party crypto deps.
 *
 * Features:
 *   - Key generation, PEM import/export, and raw key handling
 *   - Sign / verify with SHA-256/384/512 digests
 *   - Signature format conversion (DER <-> IEEE-P1363 "raw r||s") so the
 *     library interoperates with WebCrypto, JOSE/JWT, and blockchain tooling
 *   - Public-key ARRAY verification: verify a signature against a SET of
 *     authorized keys (key rotation / multi-signer trust anchors)
 *   - M-of-N threshold (multi-sig) verification across distinct signers
 *   - Constant-time-ish comparisons and strict input validation
 *
 * Supported curves: 'P-256' (prime256v1/secp256r1), 'P-384' (secp384r1),
 * 'P-521' (secp521r1), and 'secp256k1' (Bitcoin/Ethereum-style).
 */

const crypto = require('crypto');

const CURVE_TO_OPENSSL = {
  'P-256': 'prime256v1',
  'P-384': 'secp384r1',
  'P-521': 'secp521r1',
  secp256k1: 'secp256k1',
};

// Field size (bytes) per curve — needed for raw (P1363) signature encoding.
const CURVE_FIELD_BYTES = {
  'P-256': 32,
  'P-384': 48,
  'P-521': 66,
  secp256k1: 32,
};

const DEFAULT_HASH = 'sha256';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function toBuffer(input, encoding = 'utf8') {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  return Buffer.from(String(input), encoding);
}

// ---- Key management --------------------------------------------------------

/**
 * Generate an ECDSA key pair.
 * @param {string} [curve] one of P-256|P-384|P-521|secp256k1
 * @returns {{ publicKeyPem: string, privateKeyPem: string, curve: string }}
 */
function generateKeyPair(curve = 'P-256') {
  const namedCurve = CURVE_TO_OPENSSL[curve];
  assert(namedCurve, `unsupported curve: ${curve}`);
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKeyPem: publicKey, privateKeyPem: privateKey, curve };
}

/** Import a public key from PEM/DER/JWK into a KeyObject. */
function importPublicKey(key) {
  if (key && typeof key === 'object' && key.type === 'public') return key; // already a KeyObject
  if (key && typeof key === 'object' && key.kty) {
    return crypto.createPublicKey({ key, format: 'jwk' });
  }
  return crypto.createPublicKey(key);
}

/** Import a private key from PEM/DER/JWK into a KeyObject. */
function importPrivateKey(key) {
  if (key && typeof key === 'object' && key.type === 'private') return key;
  if (key && typeof key === 'object' && key.kty) {
    return crypto.createPrivateKey({ key, format: 'jwk' });
  }
  return crypto.createPrivateKey(key);
}

/** Stable fingerprint (SHA-256 of DER SPKI) used to identify a public key. */
function publicKeyFingerprint(publicKey) {
  const keyObj = importPublicKey(publicKey);
  const der = keyObj.export({ type: 'spki', format: 'der' });
  return crypto.createHash('sha256').update(der).digest('hex');
}

// ---- DER <-> raw (IEEE P1363) signature conversion -------------------------

/**
 * Convert a DER-encoded ECDSA signature to raw r||s (fixed-width per curve).
 * @param {Buffer} der
 * @param {number} fieldBytes
 * @returns {Buffer}
 */
function derToRaw(der, fieldBytes) {
  let offset = 0;
  assert(der[offset++] === 0x30, 'invalid DER: expected SEQUENCE');
  // Skip (possibly long-form) sequence length.
  if (der[offset] & 0x80) offset += der[offset] - 0x80 + 1;
  else offset += 1;

  const readInt = () => {
    assert(der[offset++] === 0x02, 'invalid DER: expected INTEGER');
    let len = der[offset++];
    let bytes = der.subarray(offset, offset + len);
    offset += len;
    // Strip leading zero padding, then left-pad to fieldBytes.
    while (bytes.length > 1 && bytes[0] === 0x00) bytes = bytes.subarray(1);
    assert(bytes.length <= fieldBytes, 'invalid DER: integer longer than field size');
    const out = Buffer.alloc(fieldBytes);
    bytes.copy(out, fieldBytes - bytes.length);
    return out;
  };

  const r = readInt();
  const s = readInt();
  return Buffer.concat([r, s]);
}

/**
 * Convert a raw r||s signature into DER encoding.
 * @param {Buffer} raw
 * @param {number} fieldBytes
 * @returns {Buffer}
 */
function rawToDer(raw, fieldBytes) {
  assert(raw.length === fieldBytes * 2, `raw signature must be ${fieldBytes * 2} bytes`);
  const encodeInt = (buf) => {
    let b = buf;
    while (b.length > 1 && b[0] === 0x00) b = b.subarray(1); // strip leading zeros
    // If high bit set, prepend 0x00 so the integer stays positive.
    if (b[0] & 0x80) b = Buffer.concat([Buffer.from([0x00]), b]);
    return Buffer.concat([Buffer.from([0x02, b.length]), b]);
  };
  const r = encodeInt(raw.subarray(0, fieldBytes));
  const s = encodeInt(raw.subarray(fieldBytes));
  const body = Buffer.concat([r, s]);
  return Buffer.concat([Buffer.from([0x30, body.length]), body]);
}

// ---- Sign / verify ---------------------------------------------------------

/**
 * Sign a message with an EC private key.
 * @param {Buffer|string} message
 * @param {string|object} privateKey PEM/DER/JWK or KeyObject
 * @param {object} [opts]
 * @param {string} [opts.hash] digest algorithm (default sha256)
 * @param {'der'|'raw'} [opts.format] output signature format (default 'der')
 * @param {string} [opts.curve] required when format='raw' to size r/s
 * @returns {Buffer} signature
 */
function sign(message, privateKey, opts = {}) {
  const hash = opts.hash || DEFAULT_HASH;
  const keyObj = importPrivateKey(privateKey);
  const der = crypto.sign(hash, toBuffer(message), keyObj);
  if ((opts.format || 'der') === 'raw') {
    const fieldBytes = CURVE_FIELD_BYTES[opts.curve || 'P-256'];
    assert(fieldBytes, `curve required for raw format: ${opts.curve}`);
    return derToRaw(der, fieldBytes);
  }
  return der;
}

/**
 * Verify a signature against a SINGLE public key.
 * Accepts DER or raw (P1363) signatures transparently.
 * @param {Buffer|string} message
 * @param {Buffer|string} signature
 * @param {string|object} publicKey
 * @param {object} [opts]
 * @param {string} [opts.hash]
 * @param {string} [opts.curve] needed if signature is raw P1363
 * @returns {boolean}
 */
function verify(message, signature, publicKey, opts = {}) {
  const hash = opts.hash || DEFAULT_HASH;
  const keyObj = importPublicKey(publicKey);
  let sig = toBuffer(signature, 'base64');

  // Heuristic: a DER sig starts with 0x30 (SEQUENCE). Otherwise treat as raw.
  const looksDer = sig[0] === 0x30 && sig.length >= 8;
  if (!looksDer) {
    const fieldBytes = CURVE_FIELD_BYTES[opts.curve || 'P-256'];
    assert(fieldBytes, 'curve required to decode raw signature');
    if (sig.length === fieldBytes * 2) sig = rawToDer(sig, fieldBytes);
  }

  try {
    return crypto.verify(hash, toBuffer(message), keyObj, sig);
  } catch {
    return false; // malformed signature/key -> not authentic
  }
}

/**
 * Verify a signature against an ARRAY of authorized public keys.
 * Returns the FIRST key (and its fingerprint) that validates, or null.
 * Useful for trust anchors / key rotation where any of several keys is valid.
 *
 * @param {Buffer|string} message
 * @param {Buffer|string} signature
 * @param {Array<string|object>} publicKeys
 * @param {object} [opts]
 * @returns {{ valid: boolean, keyIndex: number, fingerprint: string|null }}
 */
function verifyAgainstKeySet(message, signature, publicKeys, opts = {}) {
  assert(Array.isArray(publicKeys) && publicKeys.length > 0, 'publicKeys must be a non-empty array');
  for (let i = 0; i < publicKeys.length; i += 1) {
    if (verify(message, signature, publicKeys[i], opts)) {
      return { valid: true, keyIndex: i, fingerprint: publicKeyFingerprint(publicKeys[i]) };
    }
  }
  return { valid: false, keyIndex: -1, fingerprint: null };
}

/**
 * M-of-N threshold (multi-signature) verification.
 * Given a message, a list of {signature, ...} and a set of authorized public
 * keys, returns true only when at least `threshold` DISTINCT authorized keys
 * have each produced a valid signature.
 *
 * @param {Buffer|string} message
 * @param {Array<Buffer|string>} signatures
 * @param {Array<string|object>} publicKeys authorized signer set
 * @param {number} threshold minimum distinct valid signers (M)
 * @param {object} [opts]
 * @returns {{ valid: boolean, validSigners: string[], count: number }}
 */
function verifyThreshold(message, signatures, publicKeys, threshold, opts = {}) {
  assert(Array.isArray(signatures) && signatures.length > 0, 'signatures must be a non-empty array');
  assert(Number.isInteger(threshold) && threshold > 0, 'threshold must be a positive integer');

  const validSigners = new Set();
  for (const sig of signatures) {
    const match = verifyAgainstKeySet(message, sig, publicKeys, opts);
    if (match.valid) validSigners.add(match.fingerprint);
  }
  return {
    valid: validSigners.size >= threshold,
    validSigners: [...validSigners],
    count: validSigners.size,
  };
}

/** Constant-time buffer equality (defensive comparison for MACs/tokens). */
function timingSafeEqual(a, b) {
  const ab = toBuffer(a);
  const bb = toBuffer(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

module.exports = {
  generateKeyPair,
  importPublicKey,
  importPrivateKey,
  publicKeyFingerprint,
  sign,
  verify,
  verifyAgainstKeySet,
  verifyThreshold,
  derToRaw,
  rawToDer,
  timingSafeEqual,
  CURVE_TO_OPENSSL,
  CURVE_FIELD_BYTES,
};

// Demo:  node ecdsa-auth.js
if (require.main === module) {
  const message = 'transfer:alice->bob:100:nonce=42';

  // Single-key sign/verify round trip (P-256, DER).
  const a = generateKeyPair('P-256');
  const sigDer = sign(message, a.privateKeyPem);
  console.log('[ecdsa] single-key verify (DER):', verify(message, sigDer, a.publicKeyPem));

  // Raw (P1363) interop round trip.
  const sigRaw = sign(message, a.privateKeyPem, { format: 'raw', curve: 'P-256' });
  console.log('[ecdsa] single-key verify (raw):', verify(message, sigRaw, a.publicKeyPem, { curve: 'P-256' }));
  console.log('[ecdsa] tampered message rejected:', verify('transfer:alice->bob:9999', sigDer, a.publicKeyPem) === false);

  // Key-set (rotation) verification.
  const b = generateKeyPair('P-256');
  const c = generateKeyPair('P-256');
  const set = [b.publicKeyPem, a.publicKeyPem, c.publicKeyPem];
  const match = verifyAgainstKeySet(message, sigDer, set);
  console.log('[ecdsa] key-set match:', match.valid, 'at index', match.keyIndex);

  // 2-of-3 threshold multisig.
  const sigB = sign(message, b.privateKeyPem);
  const threshold = verifyThreshold(message, [sigDer, sigB], [a.publicKeyPem, b.publicKeyPem, c.publicKeyPem], 2);
  console.log('[ecdsa] 2-of-3 multisig valid:', threshold.valid, '(', threshold.count, 'distinct signers )');

  // secp256k1 (blockchain-style) round trip.
  const k = generateKeyPair('secp256k1');
  const sigK = sign(message, k.privateKeyPem);
  console.log('[ecdsa] secp256k1 verify:', verify(message, sigK, k.publicKeyPem));
}
