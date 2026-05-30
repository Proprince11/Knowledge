---
title: Applied Cryptography
domain: 04 — Offensive/Defensive Security
status: done
depth: graduate
prerequisites: [modular arithmetic basics, security fundamentals]
reading_time: ~44 min
last_updated: 2026-05-29
scope_note: >
  Defensive/engineering reference for using cryptography correctly. The overriding rule:
  use vetted, high-level libraries — never implement primitives yourself in production.
---

# Applied Cryptography

Cryptography provides the mathematical guarantees behind **confidentiality, integrity,
authentication, and non-repudiation**. The single most important practical lesson is
**"don't roll your own crypto"**: the primitives are easy to misuse and subtle bugs are
catastrophic and invisible. Mastery for an engineer means understanding *what each tool
guarantees, what it does not, and how to compose them correctly* using vetted libraries.

---

## 1. Technical Mechanisms

### 1.1 The goals and the tool map

| Goal | Primitive | Examples |
|---|---|---|
| Confidentiality | symmetric / asymmetric encryption | AES-GCM, ChaCha20-Poly1305, RSA-OAEP |
| Integrity | hash / MAC | SHA-256, HMAC |
| Authenticity (data) | MAC / signature | HMAC, Ed25519, ECDSA |
| Authenticity (identity) | certificates / PKI | X.509, TLS |
| Key agreement | key exchange | (EC)DHE |
| Password storage | slow KDF | Argon2, scrypt, bcrypt |
| Non-repudiation | digital signature | RSA, ECDSA, Ed25519 |

### 1.2 Symmetric encryption & AEAD

- **Symmetric:** one shared key encrypts and decrypts. Fast; the problem is *key distribution*.
- **AES** (block cipher) needs a **mode of operation**. Never use ECB (leaks patterns). Prefer
  **AEAD** modes — **AES-GCM** or **ChaCha20-Poly1305** — which provide *both* confidentiality
  **and** integrity/authenticity in one primitive.
- **Nonce/IV discipline:** AEAD security collapses if a nonce is reused with the same key
  (GCM nonce reuse is catastrophic — leaks the auth key). Use unique nonces (random 96-bit or a
  counter).
- **Encrypt-then-MAC / AEAD:** integrity must be verified *before* decrypting attacker-controlled
  data; AEAD handles this for you, which is why it's the default recommendation.

### 1.3 Asymmetric (public-key) cryptography

- **Key pair:** public key (shareable) + private key (secret). Encrypt to a public key →
  only the private key decrypts; sign with private → anyone verifies with public.
- **RSA:** based on integer factorization hardness; needs large keys (≥2048-bit, 3072+
  preferred) and safe padding (OAEP for encryption, PSS for signatures — never textbook RSA).
- **Elliptic Curve (ECC):** equivalent security at much smaller keys (256-bit ECC ≈ 3072-bit
  RSA) → faster, smaller. **Ed25519** (signatures) and **X25519** (key exchange) are modern,
  misuse-resistant defaults.
- **Hybrid encryption:** asymmetric is slow, so in practice you use it to exchange/encapsulate a
  *symmetric* key, then bulk-encrypt with AES/ChaCha (this is what TLS does).

### 1.4 Hashing, MACs, and what each guarantees

- **Cryptographic hash** (SHA-256, SHA-3, BLAKE2/3): one-way, collision-resistant. Provides
  *integrity* but **not authenticity** (anyone can recompute a hash) and **not secrecy**.
- **MAC (HMAC):** hash + secret key → integrity *and* authenticity (only key-holders can produce/
  verify). Use HMAC, not naive hash-of-(key‖message).
- **MD5 and SHA-1 are broken** for collision resistance — never use for signatures/certs.
- **Constant-time comparison** for MACs/secrets to avoid timing side channels.

### 1.5 Password storage (a class of its own)

Passwords must be stored with a **slow, salted KDF designed for the purpose** — *not* a fast
hash like SHA-256:
- **Argon2id** (modern winner, memory-hard), **scrypt**, or **bcrypt**. Memory-hardness resists
  GPU/ASIC cracking.
- **Per-password random salt** (defeats rainbow tables); optionally a server-side **pepper**.
- Tune the cost/work factor to your hardware (slow enough to deter cracking, fast enough for UX).

> **Never** store passwords reversibly or with plain SHA/MD5. This is OWASP A02 territory.

### 1.6 Key management & exchange

- **(EC)DHE** lets two parties derive a shared secret over an insecure channel; ephemeral keys
  give **forward secrecy** (past traffic stays safe if a long-term key later leaks).
- **Key lifecycle:** generation (CSPRNG only), secure storage (HSM/KMS/secrets manager),
  rotation, and destruction. *Most real-world crypto failures are key-management failures*, not
  algorithm breaks.
- **Randomness:** use a **cryptographically secure RNG** (`/dev/urandom`, `secrets` in Python,
  `crypto.randomBytes` in Node) — never `rand()`/`Math.random()` for keys/nonces/tokens.

### 1.7 TLS & PKI (the composition that secures the web)

TLS combines all of the above: certificate-based **authentication** (X.509 + a CA chain of
trust), **(EC)DHE key exchange** with forward secrecy, and **AEAD** symmetric encryption for the
session. **TLS 1.3** removed legacy/insecure options and is the baseline. Validate certificates
(chain, hostname, expiry, revocation) — disabling validation is a common, fatal bug.

### 1.8 The quantum horizon (post-quantum cryptography)

A large quantum computer would break RSA/ECC (Shor's algorithm) but only weaken symmetric/hash
(Grover's → double key sizes). **NIST has standardized PQC** algorithms (2024): **ML-KEM**
(Kyber, key encapsulation), **ML-DSA** (Dilithium) and **SLH-DSA** (SPHINCS+) for signatures.
Plan for **crypto-agility** and **hybrid** (classical + PQC) deployments; "harvest now, decrypt
later" makes long-lived secrets a present concern.

---

## 2. Application Frameworks

### 2.1 The cardinal rules

```
1. DON'T ROLL YOUR OWN. Use vetted high-level libraries (libsodium/NaCl, Tink, the language's
   audited crypto lib). Prefer "misuse-resistant" APIs that pick safe defaults.
2. USE AEAD for encryption (AES-GCM / ChaCha20-Poly1305) — confidentiality + integrity together.
3. NEVER reuse a nonce/IV with the same key. Use a CSPRNG for all keys/nonces/tokens.
4. HASH PASSWORDS with Argon2id/scrypt/bcrypt + per-user salt — never a fast hash.
5. AUTHENTICATE before you decrypt (AEAD / encrypt-then-MAC).
6. PROTECT KEYS: KMS/HSM/secrets manager; rotate; never hardcode in source/repos.
7. PREFER MODERN PRIMITIVES: Ed25519/X25519, SHA-256/SHA-3/BLAKE2; TLS 1.3.
8. PLAN FOR CRYPTO-AGILITY (PQC migration).
```

### 2.2 Choosing the right tool (decision guide)

```
Encrypt data at rest/in transit, shared secret possible? → AES-256-GCM or ChaCha20-Poly1305 (AEAD)
Encrypt to someone's public key?                          → hybrid (X25519/RSA-OAEP wraps a symmetric key)
Verify a file/message wasn't tampered (with a secret)?    → HMAC-SHA256
Prove who sent it / non-repudiation?                      → Ed25519 (or ECDSA/RSA-PSS) signature
Store user passwords?                                     → Argon2id (or scrypt/bcrypt)
Generate tokens/keys/nonces?                              → CSPRNG (secrets/randBytes)
Secure a network connection?                              → TLS 1.3 with proper cert validation
```

### 2.3 Common protocol/composition patterns

- **Authenticated encryption of structured data:** AEAD with **Additional Authenticated Data
  (AAD)** to bind context (e.g., a record's ID) so ciphertexts can't be swapped between contexts.
- **Token integrity:** sign or MAC tokens (e.g., JWT with a strong algorithm — *reject `alg:none`*
  and confused-deputy `alg` confusion; prefer well-reviewed libraries).
- **Forward secrecy:** ephemeral key exchange so a future key compromise doesn't decrypt past
  sessions.

---

## 3. Common Pitfalls

1. **Rolling your own crypto / "clever" custom schemes.** Almost always broken; use vetted libs.
2. **ECB mode or any non-AEAD without separate integrity** → pattern leakage / tampering.
3. **Nonce/IV reuse** (especially GCM) → catastrophic key/plaintext compromise.
4. **Fast hashes for passwords** (SHA-256/MD5) → trivially cracked; use Argon2id/bcrypt/scrypt.
5. **Hash without a key for authenticity** → anyone can forge; use HMAC/signatures.
6. **Weak/Predictable randomness** (`Math.random`, `rand()`) for keys/tokens.
7. **Hardcoded keys/secrets in code or repos** → use a secrets manager; rotate on leak.
8. **MD5/SHA-1** for signatures/certificates (collision-broken).
9. **Disabling TLS certificate validation** ("to make it work") → MITM wide open.
10. **Decrypting before authenticating** attacker-controlled ciphertext (padding-oracle class).
11. **Non-constant-time secret comparisons** → timing side channels.
12. **No key rotation / no crypto-agility** → stuck when an algorithm is deprecated (incl. PQC).

---

## 4. Advanced Resources

**Standards (authoritative)**
- NIST Cryptographic Standards (FIPS 197 AES, FIPS 180/202 SHA, SP 800-38 modes, SP 800-63
  password guidance): <https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines>
- NIST Post-Quantum Cryptography (ML-KEM/ML-DSA/SLH-DSA): <https://csrc.nist.gov/projects/post-quantum-cryptography>
- OWASP Cryptographic Storage Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html>

**Books**
- Aumasson, J-P. *Serious Cryptography* (2nd ed.) — the best modern practitioner text.
- Ferguson, Schneier, Kohno. *Cryptography Engineering.*
- Boneh & Shoup. *A Graduate Course in Applied Cryptography* (free): <https://toc.cryptobook.us/>

**Libraries (use these, don't reinvent)**
- libsodium / NaCl, Google Tink, the platform's audited crypto module (Python `cryptography`,
  Go `crypto`, etc.).

---

### Cross-references
- `owasp-frameworks.md` — A02 cryptographic failures, password storage, JWT.
- `network-defense.md` — encryption in transit/at rest, TLS.
- `../03-computer-science-architecture/dbms.md` — encryption at rest, secrets handling.
- `../03-computer-science-architecture/system-design.md` — TLS termination, secrets management.
