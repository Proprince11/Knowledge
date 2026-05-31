'use strict';

/**
 * Optimized Full-Text Fuzzy Search Engine
 * ---------------------------------------
 * A zero-dependency, in-memory search index with an advanced ingestion
 * pipeline. Designed for low-latency retrieval over moderately sized corpora
 * (catalogs, docs, knowledge bases) and as a drop-in front for an external
 * engine (Elasticsearch/OpenSearch/Typesense) during local development.
 *
 * Indexing pipeline (per field):
 *   raw text -> normalize (lowercase, strip accents) -> tokenize ->
 *   stopword filter -> light stemmer -> inverted index postings + trigram index
 *
 * Query capabilities:
 *   - BM25 relevance ranking (tunable k1 / b)
 *   - Fuzzy term matching via trigram (Jaccard) candidate generation +
 *     bounded Levenshtein edit-distance verification (typo tolerance)
 *   - Field boosting (e.g. title weighted higher than body)
 *   - Prefix expansion for type-ahead / autocomplete
 *   - Snippet/highlight generation for matched terms
 *
 * Everything is synchronous and allocation-conscious for predictable latency.
 */

// ---- Text analysis pipeline ------------------------------------------------

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'or', 'this', 'these', 'those', 'but', 'not', 'you', 'your',
]);

/** Lowercase + strip diacritics + collapse non-alphanumerics to spaces. */
function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Very light Porter-style suffix stemmer (good enough for fuzzy recall). */
function stem(token) {
  let t = token;
  if (t.length <= 3) return t;
  const rules = [
    [/(ational)$/, 'ate'],
    [/(iveness|fulness|ousness)$/, ''],
    [/(ization)$/, 'ize'],
    [/(ing)$/, ''],
    [/(edly|edly)$/, ''],
    [/(ed)$/, ''],
    [/(ies)$/, 'y'],
    [/(ements?)$/, ''],
    [/(ness)$/, ''],
    [/(ly)$/, ''],
    [/(s)$/, ''],
  ];
  for (const [re, repl] of rules) {
    if (re.test(t)) {
      t = t.replace(re, repl);
      break;
    }
  }
  return t;
}

function tokenize(text, { useStopwords = true, useStemming = true } = {}) {
  const raw = normalize(text).split(' ').filter(Boolean);
  const out = [];
  for (const tok of raw) {
    if (useStopwords && STOPWORDS.has(tok)) continue;
    out.push(useStemming ? stem(tok) : tok);
  }
  return out;
}

/** Generate padded character trigrams for fuzzy candidate generation. */
function trigrams(term) {
  const padded = `  ${term} `;
  const grams = new Set();
  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

/** Bounded Levenshtein distance; returns `maxDistance + 1` if exceeded. */
function levenshtein(a, b, maxDistance = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

// ---- The search index ------------------------------------------------------

class SearchIndexer {
  /**
   * @param {object} [options]
   * @param {string[]} [options.fields] indexed fields (default ['title','body'])
   * @param {Record<string, number>} [options.fieldBoosts] per-field weight
   * @param {number} [options.k1] BM25 term-frequency saturation (default 1.5)
   * @param {number} [options.b] BM25 length-normalization (default 0.75)
   * @param {boolean} [options.stemming]
   * @param {boolean} [options.stopwords]
   */
  constructor(options = {}) {
    this.fields = options.fields || ['title', 'body'];
    this.fieldBoosts = options.fieldBoosts || { title: 2.5, body: 1.0 };
    this.k1 = options.k1 ?? 1.5;
    this.b = options.b ?? 0.75;
    this.analyzerOpts = {
      useStemming: options.stemming !== false,
      useStopwords: options.stopwords !== false,
    };

    /** docId -> original document */
    this.documents = new Map();
    /** term -> Map<docId, { tf per field }> postings list */
    this.inverted = new Map();
    /** trigram -> Set<term> for fuzzy candidate lookup */
    this.trigramIndex = new Map();
    /** docId -> total token count (for BM25 length norm) */
    this.docLengths = new Map();
    /** field -> running token total (for average doc length) */
    this.fieldTokenTotals = Object.fromEntries(this.fields.map((f) => [f, 0]));

    this.docCount = 0;
  }

  _indexTermTrigrams(term) {
    if (this.trigramIndex.has(term)) return;
    for (const g of trigrams(term)) {
      if (!this.trigramIndex.has(g)) this.trigramIndex.set(g, new Set());
      this.trigramIndex.get(g).add(term);
    }
  }

  /**
   * Add or replace a document.
   * @param {string|number} id stable document id
   * @param {Record<string, string>} doc field -> text
   */
  add(id, doc) {
    if (this.documents.has(id)) this.remove(id);

    this.documents.set(id, doc);
    let docLength = 0;

    for (const field of this.fields) {
      const text = doc[field];
      if (text == null) continue;
      const tokens = tokenize(text, this.analyzerOpts);
      this.fieldTokenTotals[field] += tokens.length;
      docLength += tokens.length;

      for (const term of tokens) {
        this._indexTermTrigrams(term);
        if (!this.inverted.has(term)) this.inverted.set(term, new Map());
        const postings = this.inverted.get(term);
        if (!postings.has(id)) {
          postings.set(id, Object.fromEntries(this.fields.map((f) => [f, 0])));
        }
        postings.get(id)[field] += 1;
      }
    }

    this.docLengths.set(id, docLength);
    this.docCount += 1;
    return this;
  }

  /** Bulk add. */
  addAll(items, idField = 'id') {
    for (const item of items) {
      const { [idField]: id, ...rest } = item;
      this.add(id, rest);
    }
    return this;
  }

  /** Remove a document and clean up empty postings. */
  remove(id) {
    const doc = this.documents.get(id);
    if (!doc) return false;

    for (const field of this.fields) {
      const text = doc[field];
      if (text == null) continue;
      const tokens = tokenize(text, this.analyzerOpts);
      this.fieldTokenTotals[field] -= tokens.length;
      for (const term of tokens) {
        const postings = this.inverted.get(term);
        if (postings) {
          postings.delete(id);
          if (postings.size === 0) this.inverted.delete(term);
        }
      }
    }
    this.documents.delete(id);
    this.docLengths.delete(id);
    this.docCount -= 1;
    return true;
  }

  _avgDocLength() {
    if (this.docCount === 0) return 0;
    let total = 0;
    for (const len of this.docLengths.values()) total += len;
    return total / this.docCount;
  }

  /**
   * Fuzzy-expand a query term into matching indexed terms using trigram
   * Jaccard similarity for candidate generation, then verify with a bounded
   * edit distance. Exact matches always score highest.
   *
   * @returns {Array<{term: string, similarity: number}>}
   */
  _expandFuzzy(term, { maxEdits, minTrigramSim }) {
    if (this.inverted.has(term)) {
      // Exact hit — still allow other close terms but prioritize this one.
    }
    const grams = trigrams(term);
    const candidateCounts = new Map();
    for (const g of grams) {
      const owners = this.trigramIndex.get(g);
      if (!owners) continue;
      for (const cand of owners) {
        candidateCounts.set(cand, (candidateCounts.get(cand) || 0) + 1);
      }
    }

    const results = [];
    for (const [cand, shared] of candidateCounts) {
      const candGrams = trigrams(cand);
      const union = grams.size + candGrams.size - shared;
      const jaccard = union === 0 ? 0 : shared / union;
      if (jaccard < minTrigramSim && cand !== term) continue;

      const dist = levenshtein(term, cand, maxEdits);
      if (dist > maxEdits) continue;
      // Similarity: exact => 1.0, otherwise blend of edit distance + trigram.
      const editSim = 1 - dist / Math.max(term.length, cand.length, 1);
      const similarity = cand === term ? 1 : 0.5 * editSim + 0.5 * jaccard;
      results.push({ term: cand, similarity });
    }
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, 8); // cap expansion fan-out for latency
  }

  /**
   * Execute a ranked search.
   * @param {string} query
   * @param {object} [opts]
   * @param {number} [opts.limit] default 10
   * @param {boolean} [opts.fuzzy] default true
   * @param {number} [opts.maxEdits] default scales with term length
   * @param {number} [opts.minTrigramSim] default 0.3
   * @param {boolean} [opts.prefix] enable prefix expansion (autocomplete)
   * @returns {Array<{id:*, score:number, document:object, highlights:string[]}>}
   */
  search(query, opts = {}) {
    const limit = opts.limit ?? 10;
    const fuzzy = opts.fuzzy !== false;
    const minTrigramSim = opts.minTrigramSim ?? 0.3;

    const queryTerms = tokenize(query, this.analyzerOpts);
    if (queryTerms.length === 0) return [];

    const avgDl = this._avgDocLength();
    const N = this.docCount || 1;

    // docId -> { score, matchedTerms:Set }
    const scores = new Map();

    for (const qTerm of queryTerms) {
      const maxEdits =
        opts.maxEdits ?? (qTerm.length <= 4 ? 1 : qTerm.length <= 8 ? 2 : 3);

      let expansions;
      if (fuzzy) {
        expansions = this._expandFuzzy(qTerm, { maxEdits, minTrigramSim });
        if (expansions.length === 0 && this.inverted.has(qTerm)) {
          expansions = [{ term: qTerm, similarity: 1 }];
        }
      } else {
        expansions = this.inverted.has(qTerm)
          ? [{ term: qTerm, similarity: 1 }]
          : [];
      }

      // Optional prefix expansion for autocomplete.
      if (opts.prefix) {
        for (const term of this.inverted.keys()) {
          if (term.startsWith(qTerm) && term !== qTerm) {
            expansions.push({ term, similarity: 0.6 });
          }
        }
      }

      for (const { term, similarity } of expansions) {
        const postings = this.inverted.get(term);
        if (!postings) continue;
        const df = postings.size;
        // BM25 IDF with +1 smoothing (always positive).
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

        for (const [docId, fieldTf] of postings) {
          const dl = this.docLengths.get(docId) || 1;
          let termScore = 0;
          for (const field of this.fields) {
            const tf = fieldTf[field];
            if (!tf) continue;
            const boost = this.fieldBoosts[field] ?? 1;
            const denom = tf + this.k1 * (1 - this.b + (this.b * dl) / (avgDl || 1));
            termScore += boost * idf * ((tf * (this.k1 + 1)) / denom);
          }
          // Down-weight fuzzy matches by their similarity to the query term.
          termScore *= similarity;

          const entry = scores.get(docId) || { score: 0, matched: new Set() };
          entry.score += termScore;
          entry.matched.add(term);
          scores.set(docId, entry);
        }
      }
    }

    const ranked = [...scores.entries()]
      .map(([id, { score, matched }]) => ({
        id,
        score,
        document: this.documents.get(id),
        highlights: this._highlight(id, matched),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked;
  }

  /** Produce simple highlighted snippets for matched terms. */
  _highlight(docId, matchedTerms) {
    const doc = this.documents.get(docId);
    if (!doc) return [];
    const snippets = [];
    for (const field of this.fields) {
      const text = doc[field];
      if (!text) continue;
      const words = String(text).split(/\s+/);
      for (let i = 0; i < words.length; i += 1) {
        const norm = stem(normalize(words[i]));
        if (matchedTerms.has(norm)) {
          const start = Math.max(0, i - 4);
          const end = Math.min(words.length, i + 5);
          const window = words.slice(start, end).join(' ');
          snippets.push(`${field}: …${window}…`);
          break; // one snippet per field is enough
        }
      }
    }
    return snippets;
  }

  /** Serialize the index for persistence/warm-start. */
  toJSON() {
    return {
      fields: this.fields,
      fieldBoosts: this.fieldBoosts,
      k1: this.k1,
      b: this.b,
      documents: [...this.documents.entries()],
    };
  }

  /** Rebuild an index from a serialized snapshot. */
  static fromJSON(snapshot) {
    const idx = new SearchIndexer({
      fields: snapshot.fields,
      fieldBoosts: snapshot.fieldBoosts,
      k1: snapshot.k1,
      b: snapshot.b,
    });
    for (const [id, doc] of snapshot.documents) idx.add(id, doc);
    return idx;
  }

  stats() {
    return {
      documents: this.docCount,
      terms: this.inverted.size,
      trigrams: this.trigramIndex.size,
      avgDocLength: this._avgDocLength(),
    };
  }
}

module.exports = {
  SearchIndexer,
  normalize,
  tokenize,
  stem,
  trigrams,
  levenshtein,
};

// Demo:  node search-indexer.js
if (require.main === module) {
  const idx = new SearchIndexer();
  idx.addAll([
    { id: 1, title: 'Enterprise Event-Driven Architecture', body: 'RabbitMQ Kafka pub sub messaging at scale' },
    { id: 2, title: 'Redis Caching Strategies', body: 'Cache aside and write through patterns for low latency' },
    { id: 3, title: 'Zero Trust Security', body: 'CSRF CORS hardening and AES encryption for sensitive data' },
    { id: 4, title: 'Full Text Search Engines', body: 'Inverted index BM25 ranking and fuzzy typo tolerant matching' },
  ]);

  console.log('[search] stats:', idx.stats());
  // Note the deliberate typo "enterprize" — fuzzy matching should still hit doc 1.
  const results = idx.search('enterprize architcture', { limit: 3 });
  for (const r of results) {
    console.log(`#${r.id} score=${r.score.toFixed(3)} :: ${r.document.title}`);
    r.highlights.forEach((h) => console.log('   ', h));
  }
}
