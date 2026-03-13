import { generateText } from 'ai';
import { AI_MODEL } from '@/lib/ai/model';
import { generateEmbedding } from '@/services/vectorService';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type HintStep = 'issue' | 'rule' | 'application' | 'conclusion';

type HintLadderResponse = {
  score: 'A' | 'B' | 'C';
  is_correct: boolean;
  feedback_to_student: string;
  hint_ladder: {
    level_1_strategic: string;
    level_2_reconfigure: string;
    level_3_heuristic: string;
  };
};

function stripCodeFence(value: string) {
  return value.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
}

function parseHintLadder(raw: string): HintLadderResponse {
  const cleaned = stripCodeFence(raw);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  const parsed = JSON.parse(jsonText) as Partial<HintLadderResponse>;

  return {
    score: parsed.score === 'A' || parsed.score === 'B' || parsed.score === 'C' ? parsed.score : 'B',
    is_correct: Boolean(parsed.is_correct),
    feedback_to_student: parsed.feedback_to_student?.trim() || 'Javob to‘liq emas. Avval huquqiy muammoni yanada aniqroq ajratib ko‘ring.',
    hint_ladder: {
      level_1_strategic:
        parsed.hint_ladder?.level_1_strategic?.trim() || 'Qaysi fakt ushbu bosqichda eng asosiy huquqiy savolni shakllantirayotganini o‘ylab ko‘ring.',
      level_2_reconfigure:
        parsed.hint_ladder?.level_2_reconfigure?.trim() || 'Vaziyatni oddiy kundalik misolga aylantirib ko‘ring: bu yerda kimning huquqi yoki majburiyati buzilyapti?',
      level_3_heuristic:
        parsed.hint_ladder?.level_3_heuristic?.trim() || 'Kazusdagi aniq norma, obyektiv tomon yoki asosiy faktga e’tibor qarating.',
    },
  };
}

async function getRetrievedContext(query: string) {
  const queryVector = await generateEmbedding(query);
  const db = getAdminFirestore();

  const nearestSnapshot = await db
    .collection('vector_memory')
    .findNearest('embedding', queryVector, {
      limit: 3,
      distanceMeasure: 'COSINE',
    })
    .get();

  if (nearestSnapshot.empty) return 'Kontekst topilmadi.';

  return nearestSnapshot.docs
    .map((doc, index) => {
      const data = doc.data();
      const title = (data.metadata?.title as string) ?? `Manba-${index + 1}`;
      const content = (data.content as string) ?? '';
      return `[${index + 1}] ${title}\n${content}`;
    })
    .join('\n\n');
}

export async function POST(req: Request) {
  try {
    const { caseText, step, studentDraft } = await req.json() as {
      caseText?: string;
      step?: HintStep;
      studentDraft?: string;
    };

    if (!caseText?.trim() || !step) {
      return new Response(JSON.stringify({ error: 'caseText and step are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service is not configured properly' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const context = await getRetrievedContext(`${caseText}\n${studentDraft ?? ''}`);

    const stepLabelMap: Record<HintStep, string> = {
      issue: 'Issue',
      rule: 'Rule',
      application: 'Application',
      conclusion: 'Conclusion',
    };

    const prompt = `
Siz "Alloma AI" platformasining LLM-Hakam va Legal Tech tutorisiz.
Vazifangiz: talabaning IRAC bo'yicha ${stepLabelMap[step]} bosqichidagi draftini baholang va Hint Ladder yarating.

Pedagogik qoidalar:
- Talabaga tayyor javob bermang.
- GuideEval va Cognitive Load Theory asosida progressiv 3 bosqichli ishora yozing.
- 1-daraja strategik savol bo'lsin.
- 2-daraja reconfigure yoki analogy bo'lsin.
- 3-daraja heuristic bo'lib, aniq norma yoki faktga ishora qilsin.
- Javob o'zbek tilida bo'lsin.

Kazus matni:
${caseText}

Talabaning joriy drafti (${stepLabelMap[step]}):
${studentDraft?.trim() || 'Hali yozilmagan'}

RAG konteksti:
${context}

<output_format>
Natijani FAQAT qat'iy JSON formatida qaytar:
{
  "score": "A" | "B" | "C",
  "is_correct": boolean,
  "feedback_to_student": "Talabaning xatosini ko'rsatuvchi do'stona va qisqa P-Redirect tahlili.",
  "hint_ladder": {
    "level_1_strategic": "Talabani chuqur o'ylashga undaydigan bitta E-Strategic Sokratik savol.",
    "level_2_reconfigure": "Murakkablikni kamaytiruvchi O-Reconfigure o'xshatish yoki konseptual tushuntirish.",
    "level_3_heuristic": "Aniq qonun moddasi yoki kazusdagi yashirin faktni ko'rsatuvchi qisqa maslahat."
  }
}
</output_format>
`;

    const result = await generateText({
      model: AI_MODEL as any,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 900,
      maxRetries: 0,
    });

    const payload = parseHintLadder(result.text);

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[/api/chat/hint-ladder] Error:', error);
    return new Response(JSON.stringify({ error: 'Hint ladder generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}