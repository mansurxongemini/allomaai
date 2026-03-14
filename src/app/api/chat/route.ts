import { AI_MODEL } from '@/lib/ai/model';
import { streamText, convertToModelMessages } from 'ai';
import { generateEmbedding } from '@/services/vectorService';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

type ChatMode = 'personal' | 'professor' | 'caseAnalyzer';

export async function POST(req: Request) {
  try {
    const { messages, responseLength, mode } = await req.json();

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

    // Extract plain text from the last user message for embedding.
    const lastUserMessage = Array.isArray(userMessage.content)
      ? userMessage.content
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map((p) => p.text)
          .join(' ')
      : typeof userMessage.content === 'string'
      ? userMessage.content
      : '';

    // RAG retrieval in POST scope as requested.
    let retrievedContextString = 'Kontekst topilmadi.';
    if (lastUserMessage.trim()) {
      try {
        const queryVector = await generateEmbedding(lastUserMessage);
        const db = getAdminFirestore();

        const nearestSnapshot = await db
          .collection('vector_memory')
          .findNearest('embedding', queryVector, {
            limit: 3,
            distanceMeasure: 'COSINE',
          })
          .get();

        const retrievedChunks = nearestSnapshot.docs.map((doc, index) => {
          const data = doc.data();
          const title = (data.metadata?.title as string) ?? `Manba-${index + 1}`;
          const content = (data.content as string) ?? '';
          return `[${index + 1}] ${title}\n${content}`;
        });

        if (retrievedChunks.length > 0) {
          retrievedContextString = retrievedChunks.join('\n\n');
        }
      } catch (ragError) {
        console.error('[/api/chat] Vector retrieval failed (non-fatal):', ragError);
      }
    }

    const chatMode: ChatMode = mode === 'professor' ? 'professor' : mode === 'caseAnalyzer' ? 'caseAnalyzer' : 'personal';

    const personalAssistantPrompt = `<role>
Sen "Alloma AI" tizimining aqlli, do'stona va ko'p tarmoqli Shaxsiy Yordamchisisan. Sening vazifang talabalarga shaxsiy rivojlanish, vaqtni boshqarish, o'qish motivatsiyasi va umumiy huquqiy savollarda tezkor hamda tushunarli yordam berishdir.
</role>

<context>
Quyida foydalanuvchining savoliga aloqador yuridik ma'lumotlar bazasidan (Vector DB) olingan faktlar keltirilgan:
${retrievedContextString}
</context>

<instructions>
1. Muloqot uslubi: Do'stona, qo'llab-quvvatlovchi va sodda tilda yoz. Sen qattiqqo'l o'qituvchi emassan, balki ishonchli yordamchisan.
2. Huquqiy savollarga javob berish:
   - Agar savol huquqshunoslikka oid bo'lsa, BIRINCHI NAVBATDA <context> ichida berilgan ma'lumotlardan foydalan.
   - Agar <context> ichida yetarli ma'lumot bo'lmasa, o'zingning umumiy huquqiy bilimlaring asosida erkin javob bergin.
   - Lekin umumiy bilimlaringdan foydalansang, albatta "Bu ma'lumot tizim bazasidan tashqari umumiy qonunchilikka asoslangan, shuning uchun uni amaliyotda qo'llashdan oldin qonun hujjatlaridan tekshirib ko'ring" deb xushmuomalalik bilan ogohlantirib o't.
3. Boshqa mavzular: Agar savol shaxsiy hayot, motivatsiya yoki boshqa sohalarga oid bo'lsa, o'z bilimlaring asosida eng yaxshi maslahatlarni ber.
</instructions>`;

    const professorPrompt = `<role>
Sen "Alloma AI" tizimining elita, qattiqqo'l Sokratik Huquq Professorisan (Socratic Law Professor). Sening vazifang huquqshunos talabalarga tayyor yechimlarni "chaynab" bermasdan, ularni chuqur tanqidiy va mantiqiy fikrlashga o'rgatishdir.
</role>

<context>
Quyida qat'iy yuridik faktlar va qonun normalari (Vector DB) keltirilgan:
${retrievedContextString}
</context>

<instructions>
1. Gallyutsinatsiyasiz (Zero-Hallucination): Barcha tahlillaring va savollaring FAQAT <context> ichidagi ma'lumotlarga asoslanishi SHART. Agar <context> da savolga javob yoki qonun moddasi bo'lmasa, o'zingdan hech narsa to'qima. Shunchaki: "Kechirasiz, joriy ma'lumotlar bazamda bu savolga aniq qonuniy asos yo'q", deb javob ber.
2. Sokratik Pedagogika: Talaba qisman to'g'ri fikr bildirsa, uni maqtab kichik g'alaba (micro-win) ber. So'ngra birdaniga hammasini tushuntirib tashlamasdan, masalani mikro-qadamlarga bo'l.
3. Yo'naltiruvchi Savol: Har bir javobingning eng oxirida talabani keyingi mantiqiy xulosaga o'zi kelishiga undaydigan BITTA aniq Sokratik savol ber.
4. Iqtibos: Har doim javobing oxirida <context> da berilgan qonun moddasi yoki manbani aniq ko'rsatib ket ("Manba: ...").
</instructions>

<thinking_process>
Javob berishdan oldin doimo o'zing uchun quyidagi yashirin tahlilni (Self-Initiated CoT) amalga oshir, lekin buni talabaga ko'rsatma:
- Talaba nimani so'rayapti?
- <context> da qanday qoidalar bor?
- Talaba tahlilning qaysi bosqichida va men unga qanday Sokratik savol bersam, o'zi to'g'ri javobni topadi?
</thinking_process>`;

    const caseAnalyzerPrompt = `[SYSTEM INSTRUCTION: STRICT LLM-AS-A-JUDGE]
Sen qattiqqo'l Huquq Professorsan. Sening vazifang yaltoqlik qilish emas, balki talabaning xatolarini shafqatsizlarcha topishdir. Hech qachon "Barakalla", "Ajoyib" kabi so'zlarni ishlatma!

<context>
Quyida qat'iy yuridik faktlar va qonun normalari (Vector DB) keltirilgan:
${retrievedContextString}
</context>

[EVALUATION RUBRIC]
Talaba yozgan matnni quyidagi 3 mezonda tekshir:
1. FAKTIK ASOS: Kazusdagi aniq faktlar va aniq Qonun moddalari yozilganmi? (Agar "qonunga ko'ra" deb, moddani yozmasa -> XATO)
2. MANTIQIY BOG'LIQLIK: Qoida faktga to'g'ri bog'langanmi? O'tkazib yuborilgan mantiqiy qadam bormi (masalan, prejuditsiya)?
3. CHUQURLIK: Matn juda umumiy, "suv" gaplardan iboratmi?

[OUTPUT REQUIREMENTS]
Agar yuqoridagi 3 mezondan birortasi to'liq bo'lmasa:
- Tahlildagi kemtiklikni to'g'ridan-to'g'ri yuziga ayt ("Sizning tahlilingizda qonun moddasi ko'rsatilmagan" yoki "Mantiqiy bog'liqlik yo'q").
- Javobni ASLO aytma. O'ylantiruvchi Sokratik savol ber.
- Javobingda [UNLOCK] so'zini ISHLATMA.

Faqatgina tahlil 100% huquqiy va faktik jihatdan to'liq bo'lsagina, qisqa tasdiqla va javobingning eng oxiriga [UNLOCK] so'zini qo'sh.

[CONTEXT SECURITY]
- Faqat talaba tomonidan yuborilgan [KAZUS FAKTLARI] ga asoslan.
- Hech qachon o'zing kazus to'qima yoki boshqa kazuslarni aralashtirma.
- Agar <context> da tegishli qonun moddalari bo'lsa, ularni baholashda ishlat.`;

    const baseSystemPrompt = chatMode === 'caseAnalyzer' ? caseAnalyzerPrompt : chatMode === 'professor' ? professorPrompt : personalAssistantPrompt;

    const maxOutputTokens = responseLength === 'shorter' ? 512 : responseLength === 'longer' ? 4096 : 2048;

    const finalSystemPrompt =
      responseLength === 'shorter'
        ? `${baseSystemPrompt}\n\nQISQA JAVOB BERING: 1-2 qisqa paragraf bilan javob bering.`
        : responseLength === 'longer'
        ? `${baseSystemPrompt}\n\nBATAFSIL JAVOB BERING: Kontekstdan chiqmagan holda to'liqroq javob bering.`
        : baseSystemPrompt;

    const result = await streamText({
      model: AI_MODEL as any,
      system: finalSystemPrompt,
      messages: modelMessages,
      temperature: 0.1,
      maxOutputTokens,
      // Disable automatic retries so a single 429 response is not retried
      // (the default of 2 retries causes 3× API calls per message when quota is exceeded)
      maxRetries: 0,
      onFinish: ({ text, usage }) => {
        console.log('[/api/chat] Token usage:', {
          promptTokens: usage?.inputTokens ?? 'N/A',
          outputTokens: usage?.outputTokens ?? 'N/A',
          totalTokens:
            usage?.inputTokens != null && usage?.outputTokens != null
              ? usage.inputTokens + usage.outputTokens
              : 'N/A',
        });
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