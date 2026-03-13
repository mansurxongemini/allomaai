/**
 * Vector Service — Universal RAG pipeline
 *
 * Converts content into Gemini embedding vectors and persists them
 * in the `vector_memory` Firestore collection using the Admin SDK's VectorValue,
 * which enables native Firestore vector-similarity search.
 *
 * Server-side only (Node.js runtime). Never import from client components.
 */

import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SourceType = 'article' | 'case' | 'law' | 'method' | 'lesson';

export interface VectorMetadata {
  source_type: SourceType;
  source_id: string;
  title: string;
  [key: string]: unknown; // allow additional context fields
}

export interface VectorEntry {
  content: string;
  embedding: FirebaseFirestore.VectorValue;
  metadata: VectorMetadata;
  vectorized_at: FirebaseFirestore.FieldValue;
}

// ─── Embedding model ─────────────────────────────────────────────────────────

// Firestore vector index is configured as 768 dimensions in firestore.indexes.json.
const TARGET_VECTOR_DIMENSION = 768;

// `gemini-embedding-001` is supported by Google Generative AI API keys.
// Keep a fallback to `text-embedding-004` for environments where that model exists.
const EMBEDDING_MODEL_CANDIDATES = [
  google.textEmbeddingModel('gemini-embedding-001'),
  google.textEmbeddingModel('text-embedding-004'),
];

function normalizeVectorDimension(vector: number[], dimension: number): number[] {
  if (vector.length === dimension) return vector;
  if (vector.length > dimension) return vector.slice(0, dimension);
  return [...vector, ...new Array(dimension - vector.length).fill(0)];
}

/**
 * Calls Gemini embeddings and returns a normalized float array.
 * We force vectors to 768 dimensions to match the existing Firestore index.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text.');
  }

  // Gemini has a 2048-token limit per request — truncate to ~8 000 chars as a
  // safe proxy so we never hit the API limit.
  const safeText = text.slice(0, 8000);

  let lastError: unknown;

  for (const model of EMBEDDING_MODEL_CANDIDATES) {
    try {
      const { embedding } = await embed({
        model,
        value: safeText,
      });

      return normalizeVectorDimension(embedding, TARGET_VECTOR_DIMENSION);
    } catch (err) {
      lastError = err;
      console.error('[vectorService] Embedding model failed, trying fallback if available:', err);
    }
  }

  throw new Error(
    `All embedding models failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

// ─── Firestore persistence ────────────────────────────────────────────────────

/**
 * Generates an embedding for `content` and upserts the vector entry into the
 * `vector_memory` collection.
 *
 * The document ID is derived from `metadata.source_type` + `metadata.source_id`
 * so that re-running the function is idempotent (safe to call multiple times).
 *
 * @param content  - Raw text to embed (article/case/law body text).
 * @param metadata - Must include source_type, source_id, and title for citations.
 */
export async function upsertToVectorDB(
  content: string,
  metadata: VectorMetadata
): Promise<void> {
  const db = getAdminFirestore();

  const embeddingValues = await generateEmbedding(content);

  const docId = `${metadata.source_type}_${metadata.source_id}`;

  const entry: VectorEntry = {
    content,
    // firebase-admin stores this as a native Firestore VectorValue, which
    // enables vector-distance queries via Firestore's built-in KNN index.
    embedding: FieldValue.vector(embeddingValues),
    metadata,
    vectorized_at: FieldValue.serverTimestamp(),
  };

  await db.collection('vector_memory').doc(docId).set(entry, { merge: true });
}

// ─── Rate-limit-aware batch helper ───────────────────────────────────────────

/** Pause execution for `ms` milliseconds. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Processes an array of items through `upsertToVectorDB` with a configurable
 * delay between each call to respect Gemini's rate limits.
 *
 * Gemini Embedding API free tier: 1 500 req/min → ~40 ms minimum gap.
 * We default to 100 ms to leave headroom.
 *
 * @returns A summary of processed / failed counts.
 */
export async function batchUpsertToVectorDB(
  items: Array<{ content: string; metadata: VectorMetadata }>,
  delayMs = 100
): Promise<{ processed: number; failed: number; errors: string[] }> {
  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      await upsertToVectorDB(item.content, item.metadata);
      processed++;
    } catch (err) {
      failed++;
      const message =
        err instanceof Error ? err.message : String(err);
      errors.push(`[${item.metadata.source_type}:${item.metadata.source_id}] ${message}`);
      console.error(`[vectorService] Failed to upsert ${item.metadata.source_id}:`, err);
    }

    // Respect rate limits between individual embedding calls
    if (delayMs > 0) await sleep(delayMs);
  }

  return { processed, failed, errors };
}
