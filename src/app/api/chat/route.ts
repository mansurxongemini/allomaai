import { AI_MODEL } from '@/lib/ai/model';
import { PROMPT, STRICT_PROFESSOR_PROMPT, EMPATHETIC_FRIEND_PROMPT } from '@/lib/ai/prompts';
import { PROMPT_TIP_DELIMITER } from '@/lib/ai/constants';
import { streamText, generateText, convertToModelMessages } from 'ai';
import type { ModelMessage } from 'ai';
import { getTopicDetail, getMethodTopicDetail, getSubjects, getMethods } from '@/services/firestore';
import { updateStudentDosye } from '@/lib/firebase/analytics';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Background task: uses a fast AI model to detect legal/logical mistakes in
 * the chat and persists weakness tags to the student's Firebase profile.
 * This is intentionally fire-and-forget — it must never block or crash the
 * streaming response.
 */
async function extractAndSaveWeaknesses(
    userId: string,
    messages: ModelMessage[]
): Promise<void> {
    try {
        const { text } = await generateText({
            model: AI_MODEL as any,
            messages: [
                {
                    role: 'user',
                    // Limit to the last 10 messages to control cost and latency.
                    content: `Analyze this chat. Did the user make any legal or logical mistakes? If yes, output ONLY a comma-separated list of the specific topics they failed at (e.g., 'Mulk huquqi, Shartnoma tuzish'). If no mistakes, output 'NONE'.\n\nChat:\n${JSON.stringify(messages.slice(-10))}`,
                },
            ],
            maxOutputTokens: 512,
            maxRetries: 0,
        });

        const result = text?.trim() ?? '';
        if (result && result.toUpperCase() !== 'NONE') {
            const tags = result.split(',').map((t) => t.trim()).filter(Boolean);
            await updateStudentDosye(userId, tags);
        }
    } catch (error) {
        // Non-fatal: never propagate errors from the background task.
        console.error('[analytics] extractAndSaveWeaknesses error:', error);
    }
}

export async function POST(req: Request) {
  try {
    const { messages, topicId, roleMode, systemInstructions, responseLength, userId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert UIMessages (from ai-sdk v6 client) to ModelMessages for streamText
    const modelMessages = await convertToModelMessages(messages);

    const userMessage = modelMessages.filter((m) => m.role === 'user').at(-1);

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

    // Apply role mode — custom instructions override the base prompt
    if (roleMode === 'custom' && typeof systemInstructions === 'string' && systemInstructions.trim()) {
      systemPrompt = systemInstructions.trim();
    } else if (roleMode === 'professor') {
      systemPrompt = STRICT_PROFESSOR_PROMPT;
    } else if (roleMode === 'friend') {
      systemPrompt = EMPATHETIC_FRIEND_PROMPT;
    } else if (roleMode === 'learning') {
      systemPrompt = `${PROMPT}\n\n## Learning Guide Mode\nBreak every concept down step by step using analogies and real-world examples. After each explanation, ask the user one comprehension question to reinforce their understanding.`;
    }

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
          if (roleMode === 'custom' && typeof systemInstructions === 'string' && systemInstructions.trim()) {
            // Append topic context to custom instructions
            systemPrompt = `${systemInstructions.trim()}\n\n## Context\n${topicContent}`;
          } else if (roleMode === 'professor') {
            // Strict Professor: inject context into the professor persona
            systemPrompt = `${STRICT_PROFESSOR_PROMPT}\n\n## Berilgan kontekst (RAG)\nQuyidagi materialga qat'iy asoslanib javob bering:\n<context>\n${topicContent}\n</context>\nAgar javob kontekstda bo'lmasa, aniq aytib o'ting.`;
          } else if (roleMode === 'friend') {
            // Empathetic Friend: inject context into the friend persona
            systemPrompt = `${EMPATHETIC_FRIEND_PROMPT}\n\n## Mavzu bo'yicha ma'lumot\nQuyidagi materialdan foydalaning (kerak bo'lsa):\n<context>\n${topicContent}\n</context>`;
          } else {
            systemPrompt = `You are a legal assistant. Strictly base your answer on the following context:
          
          <context>
          ${topicContent}
          </context>
          
          If the answer is not in the context, clearly say "Men bu savolga berilgan kontekst asosida javob bera olmayman, chunki ma'lumot yetarli emas" (I don't know based on the provided context). Answer in Uzbek.`;
            if (roleMode === 'learning') {
              systemPrompt += '\n\nBreak concepts down step by step. After explaining, ask the user one comprehension question.';
            }
          }
        }
      } catch (err) {
        console.error('[/api/chat] Error fetching topic context:', err);
        // Fall back to general prompt if context fetching fails
      }
    }

    // Apply response length instructions
    if (responseLength === 'shorter') {
      systemPrompt += '\n\nKEEP IT SHORT: Respond concisely in 1-3 short paragraphs. Avoid unnecessary elaboration.';
    } else if (responseLength === 'longer') {
      systemPrompt += '\n\nBE THOROUGH: Provide comprehensive, detailed explanations with examples, nuances, and full context.';
    }

    // AI Coach: always append the split-response instruction
    systemPrompt += `\n\nQAT'IY BUYRUQ: Sen har doim javobingni ikkiga bo'lib berishing shart. 1-qism: Foydalanuvchi savoliga asosiy huquqiy javobing. 2-qism: Foydalanuvchiga qanday qilib savolni yaxshiroq va aniqroq berish bo'yicha maslahat. Bu ikki qismni har doim mana bu maxsus ajratgich bilan bo'lib yoz: '${PROMPT_TIP_DELIMITER}'. Agar foydalanuvchi savolni juda zo'r va aniq bergan bo'lsa, 2-qismga shunchaki 'NONE' deb yoz. Agar savol noaniq bo'lsa, uni qanday to'g'rilashni va detallar qo'shishni maslahat ber.`;

    const maxOutputTokens = responseLength === 'shorter' ? 512 : responseLength === 'longer' ? 4096 : 2048;

    // Use gemini-2.5-flash-lite
    const result = await streamText({
      model: AI_MODEL as any,
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.1,
      maxOutputTokens,
      // Disable automatic retries so a single 429 response is not retried
      // (the default of 2 retries causes 3× API calls per message when quota is exceeded)
      maxRetries: 0,
      onFinish: ({ usage }) => {
        console.log('[/api/chat] Token usage:', {
          promptTokens: usage?.inputTokens ?? 'N/A',
          outputTokens: usage?.outputTokens ?? 'N/A',
          totalTokens:
            usage?.inputTokens != null && usage?.outputTokens != null
              ? usage.inputTokens + usage.outputTokens
              : 'N/A',
        });

        // Background analytics: detect weaknesses and persist them to Firebase.
        // Uses void + .catch so the callback stays synchronous and errors are
        // swallowed without affecting the streaming response.
        if (userId && typeof userId === 'string') {
          extractAndSaveWeaknesses(userId, modelMessages).catch((err) => {
            console.error('[analytics] Unhandled background task error:', err);
          });
        }
      },
    });

    return result.toUIMessageStreamResponse();
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
          details: 'Model: gemini-2.5-flash-lite'
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
