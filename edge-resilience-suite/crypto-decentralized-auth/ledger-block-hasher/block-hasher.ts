/**
 * Ledger Block Hasher — Immutable Sequential State Ledger
 * -------------------------------------------------------
 * A localized, append-only ledger that chains blocks by cryptographic hash,
 * giving tamper-evidence and verifiable sequential state. Each block:
 *   - references the previous block's hash (hash chain)
 *   - commits its transactions via a Merkle root
 *   - includes height, timestamp, and an optional proof-of-work nonce
 *
 * Built on Node's native `crypto` (SHA-256) — no external dependencies.
 *
 * Guarantees provided by `validateChain`:
 *   - Genesis integrity (height 0, zeroed prevHash)
 *   - Monotonic, gapless heights
 *   - Correct back-linking (block.prevHash === previous.hash)
 *   - Recomputed block hash matches the stored hash (no field tampering)
 *   - Recomputed Merkle root matches the committed root (no tx tampering)
 *   - Proof-of-work difficulty satisfied (when enabled)
 *
 * This is a ledger TEMPLATE — deterministic and self-contained — suitable for
 * audit logs, event sourcing with integrity, or as the core of a small chain.
 */

import { createHash } from 'crypto';

export interface Transaction {
  /** Logical operation, e.g. "transfer", "mint", "config.update". */
  readonly type: string;
  /** Arbitrary, JSON-serializable payload. */
  readonly payload: Record<string, unknown>;
  /** Optional client-supplied id; auto-derived if omitted. */
  readonly id?: string;
  /** Optional creation timestamp (epoch ms). */
  readonly timestamp?: number;
}

export interface BlockHeader {
  readonly height: number;
  readonly timestamp: number;
  readonly prevHash: string;
  readonly merkleRoot: string;
  readonly nonce: number;
  readonly difficulty: number;
}

export interface Block extends BlockHeader {
  readonly transactions: Transaction[];
  readonly hash: string;
}

export interface LedgerOptions {
  /** Proof-of-work difficulty = required leading zero hex chars. 0 disables PoW. */
  difficulty?: number;
  /** Deterministic genesis timestamp (defaults to 0 for reproducibility). */
  genesisTimestamp?: number;
  /** Upper bound on PoW iterations before giving up (safety valve). */
  maxNonce?: number;
}

export interface ValidationIssue {
  height: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  length: number;
  issues: ValidationIssue[];
}

const HASH_ALGO = 'sha256';
const ZERO_HASH = '0'.repeat(64);

/** SHA-256 hex digest of a string or buffer. */
export function sha256(data: string | Buffer): string {
  return createHash(HASH_ALGO).update(data).digest('hex');
}

/**
 * Canonical JSON: stable key ordering so logically-equal objects always hash
 * identically regardless of property insertion order.
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(',')}}`;
}

/** Deterministic hash of a single transaction (its leaf in the Merkle tree). */
export function hashTransaction(tx: Transaction): string {
  return sha256(canonicalize({ type: tx.type, payload: tx.payload, id: tx.id ?? null, timestamp: tx.timestamp ?? null }));
}

/**
 * Compute the Merkle root of a list of transactions.
 * Empty list -> ZERO_HASH. Odd levels duplicate the last node (Bitcoin-style).
 */
export function computeMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) return ZERO_HASH;
  let level = transactions.map(hashTransaction);
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : left; // duplicate last
      next.push(sha256(left + right));
    }
    level = next;
  }
  return level[0];
}

/** Serialize a header deterministically for hashing. */
function serializeHeader(header: BlockHeader): string {
  return canonicalize({
    height: header.height,
    timestamp: header.timestamp,
    prevHash: header.prevHash,
    merkleRoot: header.merkleRoot,
    nonce: header.nonce,
    difficulty: header.difficulty,
  });
}

/** Compute a block's hash from its header fields. */
export function computeBlockHash(header: BlockHeader): string {
  return sha256(serializeHeader(header));
}

/** Does a hash satisfy the difficulty (N leading '0' hex chars)? */
export function meetsDifficulty(hash: string, difficulty: number): boolean {
  if (difficulty <= 0) return true;
  return hash.startsWith('0'.repeat(difficulty));
}

export class Ledger {
  private readonly chain: Block[] = [];
  private readonly difficulty: number;
  private readonly maxNonce: number;
  /** Fingerprints of seen transactions to reject accidental replays in mempool. */
  private readonly seenTxIds = new Set<string>();

  constructor(options: LedgerOptions = {}) {
    this.difficulty = options.difficulty ?? 0;
    this.maxNonce = options.maxNonce ?? 5_000_000;
    this.chain.push(this.createGenesis(options.genesisTimestamp ?? 0));
  }

  private createGenesis(timestamp: number): Block {
    const header: BlockHeader = {
      height: 0,
      timestamp,
      prevHash: ZERO_HASH,
      merkleRoot: computeMerkleRoot([]),
      nonce: 0,
      difficulty: this.difficulty,
    };
    return { ...header, transactions: [], hash: computeBlockHash(header) };
  }

  /** Proof-of-work search: find a nonce making the hash meet difficulty. */
  private mine(headerBase: Omit<BlockHeader, 'nonce'>): { nonce: number; hash: string } {
    if (this.difficulty <= 0) {
      const header: BlockHeader = { ...headerBase, nonce: 0 };
      return { nonce: 0, hash: computeBlockHash(header) };
    }
    for (let nonce = 0; nonce <= this.maxNonce; nonce += 1) {
      const header: BlockHeader = { ...headerBase, nonce };
      const hash = computeBlockHash(header);
      if (meetsDifficulty(hash, this.difficulty)) return { nonce, hash };
    }
    throw new Error(`proof-of-work exhausted after ${this.maxNonce} iterations`);
  }

  /** The most recent block. */
  getHead(): Block {
    return this.chain[this.chain.length - 1];
  }

  get height(): number {
    return this.chain.length - 1;
  }

  /**
   * Append a new block committing the supplied transactions.
   * @returns the newly created block.
   */
  addBlock(transactions: Transaction[], timestamp: number = Date.now()): Block {
    if (!Array.isArray(transactions)) {
      throw new TypeError('transactions must be an array');
    }
    // Reject duplicate transaction ids within the ledger (replay protection).
    const normalized = transactions.map((tx) => {
      const id = tx.id ?? hashTransaction(tx);
      if (this.seenTxIds.has(id)) {
        throw new Error(`duplicate transaction rejected: ${id}`);
      }
      return { ...tx, id };
    });

    const prev = this.getHead();
    const headerBase: Omit<BlockHeader, 'nonce'> = {
      height: prev.height + 1,
      timestamp,
      prevHash: prev.hash,
      merkleRoot: computeMerkleRoot(normalized),
      difficulty: this.difficulty,
    };

    const { nonce, hash } = this.mine(headerBase);
    const block: Block = { ...headerBase, nonce, hash, transactions: normalized };

    this.chain.push(block);
    for (const tx of normalized) this.seenTxIds.add(tx.id as string);
    return block;
  }

  /** Read-only snapshot of the chain. */
  getChain(): readonly Block[] {
    return this.chain.map((b) => ({ ...b, transactions: [...b.transactions] }));
  }

  getBlock(height: number): Block | undefined {
    return this.chain[height];
  }

  /**
   * Full structural + cryptographic validation of the chain. Collects every
   * issue rather than failing fast, so callers get a complete audit report.
   */
  validateChain(): ValidationResult {
    const issues: ValidationIssue[] = [];
    const push = (height: number, field: string, message: string) =>
      issues.push({ height, field, message });

    if (this.chain.length === 0) {
      return { valid: false, length: 0, issues: [{ height: -1, field: 'chain', message: 'empty chain' }] };
    }

    // Genesis checks.
    const genesis = this.chain[0];
    if (genesis.height !== 0) push(genesis.height, 'height', 'genesis height must be 0');
    if (genesis.prevHash !== ZERO_HASH) push(0, 'prevHash', 'genesis prevHash must be zero');
    if (computeBlockHash(genesis) !== genesis.hash) push(0, 'hash', 'genesis hash mismatch');

    for (let i = 1; i < this.chain.length; i += 1) {
      const block = this.chain[i];
      const prev = this.chain[i - 1];

      if (block.height !== i) push(block.height, 'height', `expected height ${i}, got ${block.height}`);
      if (block.height !== prev.height + 1) push(block.height, 'height', 'non-monotonic/gap in heights');
      if (block.prevHash !== prev.hash) push(block.height, 'prevHash', 'broken back-link to previous block');

      const recomputed = computeBlockHash(block);
      if (recomputed !== block.hash) push(block.height, 'hash', 'block hash does not match header (tampered)');

      const root = computeMerkleRoot(block.transactions);
      if (root !== block.merkleRoot) push(block.height, 'merkleRoot', 'merkle root mismatch (tx tampered)');

      if (!meetsDifficulty(block.hash, block.difficulty)) {
        push(block.height, 'nonce', `hash fails difficulty ${block.difficulty}`);
      }
      if (block.timestamp < prev.timestamp) {
        push(block.height, 'timestamp', 'timestamp earlier than previous block');
      }
    }

    return { valid: issues.length === 0, length: this.chain.length, issues };
  }

  /**
   * Produce a Merkle inclusion proof for a transaction in a given block.
   * The proof is a list of sibling hashes + positions; verify with
   * `verifyMerkleProof`.
   */
  getMerkleProof(height: number, txIndex: number): { leaf: string; proof: { hash: string; position: 'left' | 'right' }[] } {
    const block = this.chain[height];
    if (!block) throw new Error(`no block at height ${height}`);
    if (txIndex < 0 || txIndex >= block.transactions.length) {
      throw new Error('transaction index out of range');
    }
    let index = txIndex;
    let level = block.transactions.map(hashTransaction);
    const leaf = level[txIndex];
    const proof: { hash: string; position: 'left' | 'right' }[] = [];

    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = i + 1 < level.length ? level[i + 1] : left;
        if (i === index || i + 1 === index) {
          if (index % 2 === 0) proof.push({ hash: right, position: 'right' });
          else proof.push({ hash: left, position: 'left' });
        }
        next.push(sha256(left + right));
      }
      index = Math.floor(index / 2);
      level = next;
    }
    return { leaf, proof };
  }
}

/** Verify a Merkle inclusion proof against an expected root. */
export function verifyMerkleProof(
  leaf: string,
  proof: { hash: string; position: 'left' | 'right' }[],
  expectedRoot: string,
): boolean {
  let computed = leaf;
  for (const step of proof) {
    computed = step.position === 'left' ? sha256(step.hash + computed) : sha256(computed + step.hash);
  }
  return computed === expectedRoot;
}

export default Ledger;

// ---- Self-test (run with ts-node) ------------------------------------------
declare const require: NodeJS.Require | undefined;
declare const module: NodeJS.Module | undefined;

if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  const ledger = new Ledger({ difficulty: 3, genesisTimestamp: 0 });

  const b1 = ledger.addBlock(
    [
      { type: 'mint', payload: { to: 'alice', amount: 100 }, timestamp: 1 },
      { type: 'transfer', payload: { from: 'alice', to: 'bob', amount: 40 }, timestamp: 2 },
    ],
    10,
  );
  const b2 = ledger.addBlock(
    [{ type: 'transfer', payload: { from: 'bob', to: 'carol', amount: 15 }, timestamp: 3 }],
    20,
  );

  // eslint-disable-next-line no-console
  console.log(`[ledger] height=${ledger.height} head=${ledger.getHead().hash.slice(0, 16)}…`);
  // eslint-disable-next-line no-console
  console.log('[ledger] PoW head meets difficulty:', meetsDifficulty(b2.hash, 3));

  const result = ledger.validateChain();
  // eslint-disable-next-line no-console
  console.log('[ledger] chain valid:', result.valid, '| blocks:', result.length);

  // Merkle inclusion proof for tx #1 in block #1.
  const { leaf, proof } = ledger.getMerkleProof(1, 1);
  // eslint-disable-next-line no-console
  console.log('[ledger] merkle proof verifies:', verifyMerkleProof(leaf, proof, b1.merkleRoot));

  // Demonstrate tamper detection by mutating a stored transaction in place.
  (b1.transactions[0].payload as Record<string, unknown>).amount = 999999;
  const tampered = ledger.validateChain();
  // eslint-disable-next-line no-console
  console.log('[ledger] tamper detected:', !tampered.valid, '| issues:', tampered.issues.map((i) => `${i.height}:${i.field}`).join(', '));
}
