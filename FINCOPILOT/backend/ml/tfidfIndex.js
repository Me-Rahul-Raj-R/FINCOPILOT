/**
 * Minimal TF-IDF + cosine-similarity retriever.
 *
 * This is the "R" in RAG: no external embeddings API, no API key -
 * everything runs in-process so the demo works offline. The interface
 * (buildIndex / retrieve) is intentionally small so it could be swapped
 * for a real vector-embedding index later without touching ragService.js.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "to", "of", "in", "on", "for", "and", "or", "but", "with", "as", "by",
  "at", "from", "this", "that", "it", "its", "into", "than", "so", "do",
  "does", "did", "what", "how", "why", "when", "where", "who", "which",
  "i", "you", "my", "your", "me", "can", "could", "would", "should",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function termFrequency(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const len = tokens.length || 1;
  for (const k in tf) tf[k] /= len;
  return tf;
}

class TfIdfIndex {
  constructor(documents) {
    // documents: [{ id, text, ...meta }]
    this.documents = documents;
    this.docTokens = documents.map((d) => tokenize(d.text + " " + (d.title || "")));
    this._buildIdf();
    this.docVectors = this.docTokens.map((tokens) => this._vectorize(tokens));
  }

  _buildIdf() {
    const df = {};
    const N = this.docTokens.length;
    this.docTokens.forEach((tokens) => {
      new Set(tokens).forEach((t) => {
        df[t] = (df[t] || 0) + 1;
      });
    });
    this.idf = {};
    for (const term in df) {
      this.idf[term] = Math.log(1 + N / df[term]);
    }
  }

  _vectorize(tokens) {
    const tf = termFrequency(tokens);
    const vec = {};
    for (const term in tf) {
      vec[term] = tf[term] * (this.idf[term] || 0);
    }
    return vec;
  }

  static cosineSim(vecA, vecB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (const k in vecA) {
      dot += vecA[k] * (vecB[k] || 0);
      normA += vecA[k] * vecA[k];
    }
    for (const k in vecB) normB += vecB[k] * vecB[k];
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /** Returns the top-k documents for a query, each with a similarity `score`. */
  retrieve(query, k = 3) {
    const queryVec = this._vectorize(tokenize(query));
    const scored = this.documents.map((doc, i) => ({
      ...doc,
      score: TfIdfIndex.cosineSim(queryVec, this.docVectors[i]),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

module.exports = { TfIdfIndex, tokenize };
