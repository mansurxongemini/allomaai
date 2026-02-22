"use client"

import { useParams } from "next/navigation"
import { Link, useRouter, usePathname } from "@/i18n/routing"
import { BookOpen, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const subjectsData: Record<string, { name: string; topics: Array<{ id: string; title: string; description: string; difficulty: string }> }> = {
  "jinoyat-huquqi": {
    name: "Jinoyat huquqi",
    topics: [
      { id: "jinoyat-tushunchasi", title: "Jinoyat tushunchasi va belgilari", description: "Jinoyatning ta'rifi, asosiy belgilari va turlari", difficulty: "Oson" },
      { id: "qasd-ehtiyotsizlik", title: "Qasd va ehtiyotsizlik", description: "Jinoyatning subyektiv tomonlari va aybdorlik shakllari", difficulty: "O'rta" },
      { id: "jazo-turlari", title: "Jazo turlari va maqsadlari", description: "Jinoyat jazolarining asosiy turlari va ularning qo'llanilishi", difficulty: "O'rta" },
      { id: "shaxsga-qarshi", title: "Shaxsga qarshi jinoyatlar", description: "Hayot, sog'liq va shaxs erkinligiga qarshi jinoyatlar", difficulty: "Qiyin" },
      { id: "mulkka-qarshi", title: "Mulkka qarshi jinoyatlar", description: "O'g'irlik, talon-taroj va boshqa mulkiy jinoyatlar", difficulty: "O'rta" },
    ],
  },
  "fuqarolik-huquqi": {
    name: "Fuqarolik huquqi",
    topics: [
      { id: "shartnomalar", title: "Shartnomalar huquqi asoslari", description: "Shartnoma tuzish, bajarish va buzish qoidalari", difficulty: "O'rta" },
      { id: "mulk-huquqi", title: "Mulk huquqi", description: "Egalik, foydalanish va tasarruf etish huquqlari", difficulty: "O'rta" },
      { id: "meros-huquqi", title: "Meros huquqi", description: "Meros qoldirish va olish tartibi", difficulty: "Qiyin" },
      { id: "javobgarlik", title: "Fuqarolik javobgarligi", description: "Zararni qoplash va javobgarlik turlari", difficulty: "O'rta" },
    ],
  },
  "konstitutsiya-huquqi": {
    name: "Konstitutsiya huquqi",
    topics: [
      { id: "davlat-tuzilishi", title: "Davlat tuzilishi", description: "O'zbekiston Respublikasining davlat tuzilishi asoslari", difficulty: "Oson" },
      { id: "hokimiyat-bolinishi", title: "Hokimiyat bo'linishi", description: "Qonun chiqaruvchi, ijro etuvchi va sud hokimiyatlari", difficulty: "O'rta" },
      { id: "inson-huquqlari", title: "Inson huquq va erkinliklari", description: "Konstitutsiyaviy huquqlar va ularning kafolatlari", difficulty: "O'rta" },
    ],
  },
  "mehnat-huquqi": {
    name: "Mehnat huquqi",
    topics: [
      { id: "mehnat-shartnomasi", title: "Mehnat shartnomasi", description: "Shartnoma tuzish, o'zgartirish va bekor qilish", difficulty: "Oson" },
      { id: "ish-vaqti", title: "Ish vaqti va dam olish", description: "Ish vaqti tartibi va dam olish huquqlari", difficulty: "Oson" },
      { id: "mehnat-nizolari", title: "Mehnat nizolarini hal qilish", description: "Nizolarni ko'rish tartibi va ishloveranning huquqlari", difficulty: "O'rta" },
    ],
  },
  "administrativ-huquq": {
    name: "Administrativ huquq",
    topics: [
      { id: "admin-javobgarlik", title: "Administrativ javobgarlik", description: "Administrativ huquqbuzarliklar va jazolar", difficulty: "O'rta" },
      { id: "davlat-organlari", title: "Davlat organlarining faoliyati", description: "Ijroiya hokimiyati organlarining vakolatlari", difficulty: "O'rta" },
      { id: "jarimalar", title: "Administrativ jarimalar", description: "Jarimalar turlariga va ularning qo'llanilishi", difficulty: "Oson" },
    ],
  },
}

const difficultyColors = {
  "Oson": "bg-green-50 text-green-700 border-green-200",
  "O'rta": "bg-amber-50 text-amber-700 border-amber-200",
  "Qiyin": "bg-red-50 text-red-700 border-red-200",
}

export default function SubjectPage() {
  const params = useParams()
  const subjectId = params.id as string
  const subject = subjectsData[subjectId] || { name: "Fan", topics: [] }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <BookOpen className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{subject.name}</h1>
            <p className="text-sm text-slate-500">Mavzularni tanlang va o'rganishni boshlang</p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {subject.topics.map((topic, index) => (
          <Link
            key={topic.id}
            href={`/dashboard/lab/subjects/${subjectId}/${topic.id}`}
            className="group"
          >
            <Card className="border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border font-medium",
                      difficultyColors[topic.difficulty as keyof typeof difficultyColors]
                    )}>
                      {topic.difficulty}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {topic.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {subject.topics.length === 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Hozircha mavzular mavjud emas</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
