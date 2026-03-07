import { AI_MODEL } from '@/lib/ai/model';
import { PROMPT } from '@/lib/ai/prompts';
import { getMostRecentUserMessage } from '@/lib/utils';
import { streamText } from 'ai';
import { getTopicDetail, getMethodTopicDetail, getSubjects, getMethods } from '@/services/firestore';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages, topicId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('[/api/chat] GOOGLE_GENERATIVE_AI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'AI service is not configured properly' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = PROMPT;

    // Inject Context if topicId is selected
    if (topicId && topicId !== 'general') {
      try {
        let topicContent = '';
        const [subjects, methods] = await Promise.all([getSubjects(), getMethods()]);

        // Search across subjects
        for (const subject of subjects) {
          const detail = await getTopicDetail(subject.id, topicId);
          if (detail) {
            topicContent = detail.content || detail.firstPrinciples || '';
            break;
          }
        }

        // Search across methods
        if (!topicContent) {
          for (const method of methods) {
            const detail = await getMethodTopicDetail(method.id, topicId);
            if (detail) {
              topicContent = detail.content || detail.firstPrinciples || '';
              break;
            }
          }
        }

        if (topicContent) {
          systemPrompt = `You are a legal assistant. Strictly base your answer on the following context:
          
          <context>
          ${topicContent}
          </context>
          
          If the answer is not in the context, clearly say "Men bu savolga berilgan kontekst asosida javob bera olmayman, chunki ma'lumot yetarli emas" (I don't know based on the provided context). Answer in Uzbek.`;
        }
      } catch (err) {
        console.error('[/api/chat] Error fetching topic context:', err);
        // Fall back to general prompt if context fetching fails
      }
    }

    // Use gemini-3-flash-preview model
    const result = await streamText({
      model: AI_MODEL as any,
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 2048,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorCode = (error as any)?.error?.code || (error as any)?.statusCode || 'unknown';

    // Model not found
    if (errorCode === 404 || errorMessage.includes('is not found')) {
      console.error('[/api/chat] Model not found');
      return new Response(
        JSON.stringify({
          error: 'AI model mavjud emas. API kalitni tekshiring.',
          details: 'Model: gemini-3-flash-preview'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Quota exceeded
    if (errorCode === 'insufficient_quota' || errorCode === 429) {
      console.error('[/api/chat] API quota exceeded');
      return new Response(
        JSON.stringify({
          error: 'AI xizmatida vaqtinchalik yuk. Iltimos, keyinroq urinib ko\'ring.',
          details: 'Quota exceeded'
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Invalid API key
    if (errorCode === 'invalid_api_key' || errorCode === 401) {
      console.error('[/api/chat] Invalid API key');
      return new Response(
        JSON.stringify({
          error: 'API kalit noto\'g\'ri.',
          details: 'Invalid API key'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.',
        details: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
