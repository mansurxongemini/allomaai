import { AI_MODEL } from '@/lib/ai/model';
import { PROMPT } from '@/lib/ai/prompts';
import { getMostRecentUserMessage } from '@/lib/utils';
import { streamText } from 'ai';

export const maxDuration = 50;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', {
        status: 404,
      });
    }

    const result = streamText({
      model: AI_MODEL as any,
      system: PROMPT,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[/api/chat] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
