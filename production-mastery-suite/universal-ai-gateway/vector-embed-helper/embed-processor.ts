/**
 * RAG embedding helper: token-aware text chunking + pluggable embedding backend,
 * with cosine similarity and a tiny in-memory vector index for retrieval.
 *
 *   const proc = new EmbedProcessor({ embedder: openAIEmbedder("text-embedding-3-small", key) });
 *   await proc.addDocument("doc1", longText);
 *   const hits = await proc.query("what is backpressure?", 3);
 */
export type EmbedFn = (texts: string[]) => Promise<number[][]>;

export interface ChunkOptions {
  chunkSize?: number;   // approx characters per chunk
  overlap?: number;     // characters of overlap between chunks
}

export interface Chunk { id: string; docId: string; index: number; text: string; }
export interface EmbeddedChunk extends Chunk { vector: number[]; }
export interface QueryHit { chunk: Chunk; score: number; }

/** Split on sentence/paragraph boundaries, then pack into overlapping windows. */
export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
  const chunkSize = opts.chunkSize ?? 1000;
  const overlap = Math.min(opts.overlap ?? 150, chunkSize - 1);
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= chunkSize) return clean ? [clean] : [];

  // Prefer splitting at sentence boundaries to preserve semantics.
  const sentences = clean.split(/(?<=[.!?])\s+|\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const sent of sentences) {
    if ((buf + " " + sent).trim().length > chunkSize && buf) {
      chunks.push(buf.trim());
      buf = buf.slice(Math.max(0, buf.length - overlap)); // carry overlap
    }
    buf = (buf + " " + sent).trim();
    // hard-split a single oversized sentence
    while (buf.length > chunkSize) {
      chunks.push(buf.slice(0, chunkSize));
      buf = buf.slice(chunkSize - overlap);
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("vector length mismatch");
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** Real OpenAI embedder (Node 18+ global fetch). Batches requests. */
export function openAIEmbedder(model: string, apiKey: string, baseUrl = "https://api.openai.com"): EmbedFn {
  return async (texts: string[]): Promise<number[][]> => {
    const res = await fetch(`${baseUrl}/v1/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, input: texts }),
    });
    if (!res.ok) throw new Error(`embedding API ${res.status}: ${await res.text()}`);
    const json: { data: { embedding: number[]; index: number }[] } = await res.json();
    return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  };
}

export class EmbedProcessor {
  private readonly embed: EmbedFn;
  private readonly chunkOpts: ChunkOptions;
  private readonly batchSize: number;
  private store: EmbeddedChunk[] = [];

  constructor(opts: { embedder: EmbedFn; chunkOptions?: ChunkOptions; batchSize?: number }) {
    this.embed = opts.embedder;
    this.chunkOpts = opts.chunkOptions ?? {};
    this.batchSize = opts.batchSize ?? 64;
  }

  async addDocument(docId: string, text: string): Promise<number> {
    const pieces = chunkText(text, this.chunkOpts);
    const chunks: Chunk[] = pieces.map((t, index) => ({ id: `${docId}::${index}`, docId, index, text: t }));
    for (let i = 0; i < chunks.length; i += this.batchSize) {
      const batch = chunks.slice(i, i + this.batchSize);
      const vectors = await this.embed(batch.map((c) => c.text));
      batch.forEach((c, j) => this.store.push({ ...c, vector: vectors[j] }));
    }
    return chunks.length;
  }

  async query(queryText: string, topK = 5): Promise<QueryHit[]> {
    if (this.store.length === 0) return [];
    const [qVec] = await this.embed([queryText]);
    return this.store
      .map((ec) => ({ chunk: { id: ec.id, docId: ec.docId, index: ec.index, text: ec.text }, score: cosineSimilarity(qVec, ec.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  size(): number { return this.store.length; }
  clear(): void { this.store = []; }
  /** Export the index for persistence (JSON-serializable). */
  export(): EmbeddedChunk[] { return this.store; }
  /** Re-hydrate a previously exported index. */
  import(data: EmbeddedChunk[]): void { this.store = data; }
}
