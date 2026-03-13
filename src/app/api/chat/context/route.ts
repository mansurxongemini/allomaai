import { NextResponse } from 'next/server';
import { generateEmbedding } from '@/services/vectorService';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

type ContextSource = {
  id: string;
  title: string;
  snippet: string;
  similarity: number | null;
  sourceId: string | null;
  sourceType: string | null;
};

function toSnippet(content: string, maxLength = 240) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured properly' }, { status: 500 });
    }

    const queryVector = await generateEmbedding(query.trim());
    const db = getAdminFirestore();

    const nearestSnapshot = await db
      .collection('vector_memory')
      .findNearest('embedding', queryVector, {
        limit: 6,
        distanceMeasure: 'COSINE',
        distanceResultField: 'vector_distance',
      })
      .get();

    const sources: ContextSource[] = nearestSnapshot.docs.map((doc) => {
      const data = doc.data();
      const distance = typeof data.vector_distance === 'number' ? data.vector_distance : null;
      const similarity = distance == null ? null : Math.max(0, Math.min(1, 1 - distance));

      return {
        id: doc.id,
        title: (data.metadata?.title as string) ?? doc.id,
        snippet: toSnippet((data.content as string) ?? ''),
        similarity,
        sourceId: (data.metadata?.source_id as string) ?? null,
        sourceType: (data.metadata?.source_type as string) ?? null,
      };
    });

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('[/api/chat/context] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load context sources' },
      { status: 500 }
    );
  }
}