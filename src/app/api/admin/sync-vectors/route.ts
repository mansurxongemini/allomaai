/**
 * POST /api/admin/sync-vectors
 *
 * Scans the `articles`, `blogs`, `cases`, and `laws` Firestore collections for
 * documents that have NOT been vectorized yet (`vectorized !== true`), generates
 * Gemini text-embedding-004 embeddings for each, and stores them in the
 * `vector_memory` collection.  After successful embedding, the source document
 * is flagged with `vectorized: true` so it is skipped on future runs.
 *
 * Authorization: Bearer <ADMIN_SYNC_SECRET>
 *   Set the ADMIN_SYNC_SECRET environment variable to a long random string.
 *   The request must include:  Authorization: Bearer <your-secret>
 *
 * Server-side only — uses Firebase Admin SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { batchUpsertToVectorDB, SourceType, VectorMetadata } from '@/services/vectorService';

export const dynamic = 'force-dynamic';
// Generous timeout: embedding many docs can take time
export const maxDuration = 300;

// ─── Auth guard ───────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (!secret) {
    console.error('[sync-vectors] ADMIN_SYNC_SECRET is not set — route is disabled.');
    return false;
  }
  const authHeader = req.headers.get('authorization') ?? '';
  console.log('[sync-vectors] Authorization header received:', {
    present: Boolean(authHeader),
    startsWithBearer: authHeader.startsWith('Bearer '),
    preview: authHeader ? `${authHeader.slice(0, 24)}...` : 'none',
  });
  return authHeader === `Bearer ${secret}`;
}

// ─── HTML stripper ─────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and decodes common HTML entities so the text fed into the
 * embedding model is clean prose rather than markup.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')        // remove tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')         // collapse whitespace
    .trim();
}

// ─── Collection scanners ───────────────────────────────────────────────────────

interface PendingItem {
  content: string;
  metadata: VectorMetadata;
  /** Firestore path of the source document to flag after vectorization */
  sourcePath: string;
}

/**
 * Scans a flat collection and returns items whose `vectorized` field is not true.
 *
 * @param collectionName  - Firestore top-level collection name
 * @param sourceType      - Label stored in vector_memory metadata
 * @param getContent      - Extracts the text to embed from a raw document data object
 * @param getTitle        - Extracts the display title for citations
 */
async function scanCollection(
  collectionName: string,
  sourceType: SourceType,
  getContent: (data: FirebaseFirestore.DocumentData) => string,
  getTitle: (data: FirebaseFirestore.DocumentData) => string
): Promise<PendingItem[]> {
  console.log(`[sync-vectors] Scanning collection: ${collectionName}`);
  const db = getAdminFirestore();
  const snapshot = await db.collection(collectionName).get();
  const docsToSync = snapshot.docs.filter((docSnap) => docSnap.data()?.vectorized !== true);
  console.log(`[sync-vectors] ${collectionName}: total=${snapshot.size}, toSync=${docsToSync.length}`);
  console.log('Found documents to sync:', docsToSync.length);

  const items: PendingItem[] = [];
  for (const docSnap of docsToSync) {
    const data = docSnap.data();
    const raw = getContent(data);
    if (!raw || raw.trim().length === 0) {
      console.log(`[sync-vectors] Skipping empty content: ${collectionName}/${docSnap.id}`);
      continue;
    }

    items.push({
      content: stripHtml(raw),
      metadata: {
        source_type: sourceType,
        source_id: docSnap.id,
        title: getTitle(data) || docSnap.id,
      },
      sourcePath: `${collectionName}/${docSnap.id}`,
    });
  }
  console.log(`[sync-vectors] ${collectionName}: ${items.length} eligible docs prepared`);
  return items;
}

/**
 * Scans nested `topics` subcollections under a parent collection, e.g.
 * `subjects/{subjectId}/topics/{topicId}` or `methods/{methodId}/topics/{topicId}`.
 */
async function scanNestedTopics(
  parentCollection: string,
  sourceType: SourceType,
  parentTitleField: string,
  topicTitleField: string
): Promise<PendingItem[]> {
  const db = getAdminFirestore();
  console.log(`[sync-vectors] Scanning nested topics: ${parentCollection}/*/topics`);

  const parentSnap = await db.collection(parentCollection).get();
  const items: PendingItem[] = [];

  for (const parentDoc of parentSnap.docs) {
    const parentData = parentDoc.data();
    const parentTitle = String(parentData?.[parentTitleField] ?? parentDoc.id);

    const topicSnap = await db.collection(parentCollection).doc(parentDoc.id).collection('topics').get();
    const topicDocsToSync = topicSnap.docs.filter((d) => d.data()?.vectorized !== true);

    console.log(
      `[sync-vectors] ${parentCollection}/${parentDoc.id}/topics: total=${topicSnap.size}, toSync=${topicDocsToSync.length}`
    );
    console.log('Found documents to sync:', topicDocsToSync.length);

    for (const topicDoc of topicDocsToSync) {
      const topicData = topicDoc.data();
      const topicTitle = String(topicData?.[topicTitleField] ?? topicDoc.id);
      const raw = [
        topicTitle,
        topicData?.content ?? '',
        topicData?.firstPrinciples ?? '',
        topicData?.description ?? '',
      ].join('\n');

      if (!raw.trim()) {
        console.log(`[sync-vectors] Skipping empty content: ${parentCollection}/${parentDoc.id}/topics/${topicDoc.id}`);
        continue;
      }

      items.push({
        content: stripHtml(raw),
        metadata: {
          source_type: sourceType,
          source_id: `${parentDoc.id}_${topicDoc.id}`,
          title: `${parentTitle} - ${topicTitle}`,
          parent_id: parentDoc.id,
          topic_id: topicDoc.id,
        },
        sourcePath: `${parentCollection}/${parentDoc.id}/topics/${topicDoc.id}`,
      });
    }
  }

  console.log(`[sync-vectors] ${parentCollection}/*/topics: ${items.length} eligible docs prepared`);
  return items;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  console.log('[sync-vectors] POST request received');

  if (!isAuthorized(req)) {
    console.error('[sync-vectors] Authorization failed');
    return NextResponse.json({ total: 0, processed: 0, failed: 0, errors: ['Unauthorized'] }, { status: 401 });
  }

  let db: FirebaseFirestore.Firestore;
  try {
    db = getAdminFirestore();
    console.log('[sync-vectors] getAdminFirestore initialized successfully');
  } catch (dbErr) {
    console.error('[sync-vectors] Failed to initialize Admin Firestore:', dbErr);
    return NextResponse.json(
      { total: 0, processed: 0, failed: 0, errors: [`Failed to initialize Firestore Admin: ${String(dbErr)}`] },
      { status: 500 }
    );
  }

  const allItems: PendingItem[] = [];

  try {
    // --- 1. articles (standalone article documents, if the collection exists) ---
    const articleItems = await scanCollection(
      'articles',
      'article',
      (d) => [d.title ?? '', d.body ?? d.content ?? ''].join('\n'),
      (d) => d.title ?? 'Untitled Article'
    );
    allItems.push(...articleItems);

    // --- 2. blogs (student-authored blog/article posts) ---
    const blogItems = await scanCollection(
      'blogs',
      'article',
      (d) => [d.title ?? '', d.content ?? ''].join('\n'),
      (d) => d.title ?? 'Untitled Blog'
    );
    allItems.push(...blogItems);

    // --- 3. cases (CaseItem top-level documents) ---
    const caseItems = await scanCollection(
      'cases',
      'case',
      (d) => [d.title ?? '', d.description ?? ''].join('\n'),
      (d) => d.title ?? 'Untitled Case'
    );
    allItems.push(...caseItems);

    // --- 4. laws (if this collection exists) ---
    const lawItems = await scanCollection(
      'laws',
      'law',
      (d) => [d.title ?? '', d.body ?? d.content ?? d.text ?? ''].join('\n'),
      (d) => d.title ?? 'Untitled Law'
    );
    allItems.push(...lawItems);

    // --- 5. lessons/topics under subjects ---
    const lessonItems = await scanNestedTopics('subjects', 'lesson', 'name', 'title');
    allItems.push(...lessonItems);

    // --- 6. method topics under methods ---
    const methodItems = await scanNestedTopics('methods', 'method', 'name', 'title');
    allItems.push(...methodItems);

    console.log('[sync-vectors] Scan summary:', {
      articles: articleItems.length,
      blogs: blogItems.length,
      cases: caseItems.length,
      laws: lawItems.length,
      lessons: lessonItems.length,
      methods: methodItems.length,
      total: allItems.length,
    });
  } catch (scanErr) {
    console.error('[sync-vectors] Collection scan failed:', scanErr);
    return NextResponse.json(
      { total: 0, processed: 0, failed: 0, errors: [`Failed to scan collections: ${String(scanErr)}`] },
      { status: 500 }
    );
  }

  if (allItems.length === 0) {
    console.log('[sync-vectors] No pending documents. Nothing to vectorize.');
    return NextResponse.json({ total: 0, processed: 0, failed: 0, errors: [] });
  }

  // Process embeddings with rate-limit-aware delay (100 ms between calls)
  console.log(`[sync-vectors] Starting embedding/upsert for ${allItems.length} items`);
  const { processed, failed, errors } = await batchUpsertToVectorDB(
    allItems.map(({ content, metadata }) => ({ content, metadata })),
    100
  );
  console.log('[sync-vectors] Embedding/upsert finished:', { processed, failed });
  if (errors.length > 0) {
    for (const error of errors) {
      console.error('[sync-vectors] Embedding API or upsert error:', error);
    }
  }

  // Mark successfully vectorized source documents
  const successfulIds = new Set(
    allItems
      .filter((item) => {
        const failedToken = `[${item.metadata.source_type}:${item.metadata.source_id}]`;
        return !errors.some((e) => e.includes(failedToken));
      })
      .map((item) => item.sourcePath)
  );

  if (successfulIds.size > 0) {
    console.log(`[sync-vectors] Marking ${successfulIds.size} source docs as vectorized`);
    const batch = db.batch();
    for (const path of successfulIds) {
      batch.update(db.doc(path), {
        vectorized: true,
        vectorized_at: new Date().toISOString(),
      });
    }
    try {
      await batch.commit();
      console.log('[sync-vectors] Source documents marked as vectorized successfully');
    } catch (batchErr) {
      console.error('[sync-vectors] Failed to mark documents as vectorized:', batchErr);
      // Non-fatal: embeddings were stored; flagging failed
    }
  }

  console.log('[sync-vectors] Request completed successfully');
  return NextResponse.json({
    total: allItems.length,
    processed,
    failed,
    errors,
  });
}
