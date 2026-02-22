"use client"

import { useParams } from "next/navigation"
import { Lightbulb, BookOpen, Brain, Target, Repeat } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const methodsData: Record<string, {
  name: string
  icon: any
  description: string
  content: string
  example: string
  benefits: string[]
}> = {
  "encoding": {
    name: "Kodlash (Encoding)",
    icon: Brain,
    description: "Ma'lumotni chuqur tushunish va uzoq muddatli xotirada saqlash texnikasi",
    content: `# Kodlash (Encoding) metodi

## Bu nima?
Kodlash - bu ma'lumotni oddiy yodlash o'rniga, uni hayotiy tajribalar, his-tuyg'ular va mavjud bilimlar bilan bog'lash orqali chuqur tushunish jarayoni.

## Qanday ishlaydi?
Miyamiz ma'lumotni izolyatsiya qilingan holda emas, balki kontekst va bog'lanishlar bilan birga yaxshiroq eslab qoladi. Har bir yangi ma'lumotni:
1. Mavjud bilimlaringiz bilan bog'lang
2. Real hayotiy misollar bilan izohlang
3. Vizual tasavvurlar yarating
4. O'zingizga savollar bering

## Huquq fanida qo'llash
Qonun moddalarini oddiy yod olib bo'lmaydi. Lekin har bir moddani:
- Real sud ishiga bog'lash
- O'zingiz yoki tanishlaringiz boshidan o'tgan voqeaga moslashtirish
- Natijalarni tasavvur qilish

Bu usul orqali siz qonunni nafaqat bilasiz, balki chuqur tushunasiz.`,
    example: `**Amaliy misol: Fuqarolik kodeksi**

❌ Yomon usul: "166-modda: Shartnoma ikki tomonning kelishuviga ko'ra tuziladi"

✅ Yaxshi usul: "Uyimizni ijaraga olganimizda uy egasi bilan shartnoma tuzdik. Ikkalamiz ham kelishib, qog'ozga imzo chekdik. Bu 166-moddaning amaliy ko'rinishi. Agar bir taraf rozi bo'lmasa, shartnoma haqiqiy emas."

Bunday yondashuvda siz moddani hayotingiz bilan bog'ladingiz va u sizning uzoq muddatli xotirangizga o'tdi.`,
    benefits: [
      "Chuqur tushunish",
      "Uzoq muddatli xotira",
      "Amaliyotda qo'llash oson",
      "Tez eslash",
    ]
  },
  "chunking": {
    name: "Bo'laklash (Chunking)",
    icon: Target,
    description: "Katta ma'lumot hajmini mantiqiy guruhlarga ajratish",
    content: `# Bo'laklash (Chunking) metodi

## Asosiy g'oya
Miyamiz bir vaqtning o'zida cheklangan miqdordagi ma'lumotni qayta ishlay oladi (taxminan 7±2 element). Bo'laklash orqali biz katta ma'lumot hajmini kichik, mantiqiy guruhlarga ajratamiz.

## Huquqda qo'llash
Masalan, 50 ta qonun moddasi o'rniga:
- 5 ta kategoria yarating
- Har bir kategoriyada 10 ta modda
- Har bir kategoriyaga nom va vizual belgi bering

## Misol: Jinoyat kodeksi

**Guruh 1: Shaxsga qarshi jinoyatlar** (o'ldirish, tan jarohati, tahqirlash)
**Guruh 2: Mulkka qarshi jinoyatlar** (o'g'irlik, talon-taroj, buzib tashlash)
**Guruh 3: Davlat xavfsizligi** (terror, g'alayon, xiyonat)

Har bir guruhni alohida o'rganing va ular orasidagi farqlarni tushuning.`,
    example: `**Amaliy strategiya**

📚 Katta kitob o'rniga:
→ Boblarga ajrating
→ Har bir bobni mavzularga
→ Har bir mavzuni asosiy fikrlarga

🎯 Fokus: Bir vaqtning o'zida faqat bitta "bo'lak" ustida ishlang.`,
    benefits: [
      "Oson boshqarish",
      "Kam stress",
      "Yaxshi tashkilot",
      "Progressni ko'rish mumkin",
    ]
  },
  "spaced-repetition": {
    name: "Takroriy esga tushirish",
    icon: Repeat,
    description: "Optimal vaqt oralig'ida takrorlash orqali uzoq muddatli eslab qolish",
    content: `# Spaced Repetition (Takroriy esga tushirish)

## Ilmiy asos
Hermann Ebbinghaus "unutish egri chizig'i"ni kashf qildi: ma'lumot vaqt o'tishi bilan tez unutiladi. Lekin optimal vaqtlarda takrorlash orqali bu jarayonni sekinlashtirish mumkin.

## Optimal jadval
- 1-takror: O'rgangandan 1 kun keyin
- 2-takror: 3 kun keyin
- 3-takror: 1 hafta keyin
- 4-takror: 2 hafta keyin
- 5-takror: 1 oy keyin

## Huquq fanida amaliyot

**1-kun:** Jinoyat huquqi asoslarini o'qing
**3-kun:** Qisqacha esga oling, asosiy tushunchalarni takrorlang
**1-hafta:** Test savollari yeching
**2-hafta:** Real holatlarni tahlil qiling
**1-oy:** Boshqalarga tushuntiring

Har bir takror oldingi bilimni mustahkamlaydi va yangi bog'lanishlar yaratadi.`,
    example: `**Amaliy qo'llanma**

📅 Bugun: "Shartnomalar huquqi" mavzusini o'qing
📅 Ertaga: 5 daqiqalik takror
📅 3 kun: Flashcard'lar bilan test
📅 1 hafta: Amaliy ish tahlili
📅 2 hafta: Kimgadir tushuntiring
📅 1 oy: Murakkab savollarga javob bering

Bu strategiya bilimni "vaqtinchalik" emas, balki "doimiy" qiladi.`,
    benefits: [
      "Doimiy xotira",
      "Kam vaqt sarfi",
      "Unutmaslik kafolati",
      "Yodlash o'rniga tushunish",
    ]
  },
  "active-recall": {
    name: "Faol eslash",
    icon: BookOpen,
    description: "Ma'lumotni faol ravishda esga olish orqali mustahkamlash",
    content: `# Active Recall (Faol eslash)

## Nima uchun samarali?
Passiv o'qish (kitobni qayta-qayta o'qish) o'rniga, faol eslash (o'zingizga savollar berish va javob qidirish) miyani ishlatadi va chuqur bilim beradi.

## Texnika

**Passiv ❌:** Kitobni 5 marta o'qish
**Faol ✅:** Kitobni 1 marta o'qib, keyin o'zingizga 10 ta savol berish

## Amaliy usullar

### 1. Feynman texnikasi
Mavzuni oddiy tilda kimgadir tushuntirib bering (yoki o'zingizga). Qayerda qiynalsangiz, u yerda bilim zaif.

### 2. Self-testing
Har safar o'qigandan keyin:
- Asosiy fikrlar nima?
- Buni qanday amaliyotda qo'llash mumkin?
- Boshqa mavzular bilan qanday bog'langan?

### 3. Flashcards
Bir tomoniga savol, ikkinchi tomoniga javob yozing va muntazam test oling.`,
    example: `**Huquq fanida qo'llash**

📖 Jinoyat huquqini o'qidingiz

❓ O'zingizga savol:
- "Jinoyat" tushunchasi nimani anglatadi?
- Aybdorlikning qanday turlari bor?
- Real hayotdan 3 ta misol keltiring

💡 Javoblarni kitobsiz yozishga harakat qiling. Qiyinchilik bo'lsa, qaytadan o'qing va yana sinab ko'ring.

Bu jarayon o'qishdan 10 barobar samaraliroq!`,
    benefits: [
      "Chuqur bilim",
      "Tez o'rganish",
      "Zaif joylarni aniqlash",
      "Ishonch hosil qilish",
    ]
  }
}

export default function MethodPage() {
  const params = useParams()
  const methodId = params.id as string
  const method = methodsData[methodId]

  if (!method) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Metod topilmadi</p>
      </div>
    )
  }

  const Icon = method.icon

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-200">
            <Icon className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{method.name}</h1>
            <p className="text-sm text-slate-500">{method.description}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
          Justin Sung metodi
        </Badge>
      </div>

      {/* Main Content */}
      <Card className="mb-6 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Metod haqida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <div className="whitespace-pre-line">{method.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Example */}
      <Card className="mb-6 border-teal-200 bg-teal-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-teal-600" />
            Amaliy misol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none text-sm leading-relaxed">
            <div className="whitespace-pre-line">{method.example}</div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Asosiy afzalliklar</CardTitle>
          <CardDescription>Bu metod sizga nima beradi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {method.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg"
              >
                <div className="h-2 w-2 rounded-full bg-teal-600" />
                <span className="text-sm text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
