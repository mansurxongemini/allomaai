"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Scale, Search, Shuffle, Lock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const subjectNames: Record<string, string> = {
  "jinoyat-huquqi": "Jinoyat huquqi",
  "fuqarolik-huquqi": "Fuqarolik huquqi",
  "konstitutsiya-huquqi": "Konstitutsiya huquqi",
  "mehnat-huquqi": "Mehnat huquqi",
  "administrativ-huquq": "Administrativ huquq",
}

interface LegalCase {
  id: string
  title: string
  questionCount: number
  difficulty: "Oson" | "O'rta" | "Qiyin"
  isPaid: boolean
  price?: number
}

const casesData: Record<string, LegalCase[]> = {
  "jinoyat-huquqi": [
    { id: "c1", title: "O'g'irlik ishi: supermarket kamerasi dalillari", questionCount: 5, difficulty: "Oson", isPaid: false },
    { id: "c2", title: "Tan jarohati: o'z-o'zini himoya qilish chegarasi", questionCount: 8, difficulty: "O'rta", isPaid: false },
    { id: "c3", title: "Firibgarlik: internet orqali noqonuniy operatsiya", questionCount: 12, difficulty: "Qiyin", isPaid: true, price: 15000 },
    { id: "c4", title: "Huquqbuzarlik yoki jinoyat: chegarani aniqlash", questionCount: 6, difficulty: "O'rta", isPaid: false },
    { id: "c5", title: "Bilvosita qasd: transport hodisasi tahlili", questionCount: 10, difficulty: "Qiyin", isPaid: true, price: 20000 },
    { id: "c6", title: "Voyaga yetmagan shaxsning jinoyati", questionCount: 7, difficulty: "O'rta", isPaid: false },
    { id: "c7", title: "Korruptsiya: mansabdor shaxsning javobgarligi", questionCount: 15, difficulty: "Qiyin", isPaid: true, price: 25000 },
    { id: "c8", title: "Ehtiyotsizlik oqibatidagi o'lim: tibbiy xato", questionCount: 9, difficulty: "O'rta", isPaid: true, price: 15000 },
  ],
  "fuqarolik-huquqi": [
    { id: "c9", title: "Uy-joy ijarasi shartnomasi buzilishi", questionCount: 5, difficulty: "Oson", isPaid: false },
    { id: "c10", title: "Meros bo'lish: qonuniy va vasiyatnomaviy meros", questionCount: 10, difficulty: "O'rta", isPaid: false },
    { id: "c11", title: "Oldi-sotdi shartnomasi yaroqsizligi", questionCount: 8, difficulty: "O'rta", isPaid: true, price: 15000 },
    { id: "c12", title: "Ma'naviy zarar uchun kompensatsiya talabi", questionCount: 12, difficulty: "Qiyin", isPaid: true, price: 20000 },
    { id: "c13", title: "Nikoh shartnomasi va mulk bo'linishi", questionCount: 7, difficulty: "O'rta", isPaid: false },
  ],
  "konstitutsiya-huquqi": [
    { id: "c14", title: "So'z erkinligi va uning chegaralari", questionCount: 6, difficulty: "O'rta", isPaid: false },
    { id: "c15", title: "Teng huquqlilik printsipi buzilishi", questionCount: 8, difficulty: "O'rta", isPaid: true, price: 15000 },
    { id: "c16", title: "Saylov huquqining buzilishi", questionCount: 10, difficulty: "Qiyin", isPaid: true, price: 20000 },
  ],
  "mehnat-huquqi": [
    { id: "c17", title: "Noqonuniy ishdan bo'shatish", questionCount: 5, difficulty: "Oson", isPaid: false },
    { id: "c18", title: "Mehnat sharoitlari buzilishi", questionCount: 7, difficulty: "O'rta", isPaid: false },
    { id: "c19", title: "Ish haqi to'lanmasligi nizosi", questionCount: 6, difficulty: "O'rta", isPaid: true, price: 15000 },
  ],
  "administrativ-huquq": [
    { id: "c20", title: "Yo'l harakati qoidalarini buzish", questionCount: 3, difficulty: "Oson", isPaid: false },
    { id: "c21", title: "Litsenziyasiz tadbirkorlik", questionCount: 8, difficulty: "O'rta", isPaid: false },
    { id: "c22", title: "Administrativ jarimaga e'tiroz bildirish", questionCount: 6, difficulty: "O'rta", isPaid: true, price: 15000 },
  ],
}

const difficultyColors = {
  "Oson": "bg-green-50 text-green-700 border-green-200",
  "O'rta": "bg-amber-50 text-amber-700 border-amber-200",
  "Qiyin": "bg-red-50 text-red-700 border-red-200",
}

export default function SubjectCasesPage() {
  const params = useParams()
  const subjectId = params.subjectId as string
  const subjectName = subjectNames[subjectId] || "Fan"
  const cases = casesData[subjectId] || []

  const [searchQuery, setSearchQuery] = useState("")
  const [randomCount, setRandomCount] = useState(3)
  const [randomCases, setRandomCases] = useState<LegalCase[]>([])
  const [showRandom, setShowRandom] = useState(false)

  const filteredCases = useMemo(() => {
    if (!searchQuery) return cases
    return cases.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [cases, searchQuery])

  const handleRandomSelect = () => {
    const count = Math.min(randomCount, cases.length)
    const shuffled = [...cases].sort(() => Math.random() - 0.5)
    setRandomCases(shuffled.slice(0, count))
    setShowRandom(true)
  }

  const displayCases = showRandom ? randomCases : filteredCases

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <Scale className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{subjectName}</h1>
            <p className="text-sm text-slate-500">{cases.length} ta amaliy kazus</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowRandom(false) }}
            placeholder="Qidirish..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Random Cases Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5">
          <Shuffle className="h-4 w-4 text-slate-500 ml-1.5" />
          <span className="text-xs text-slate-500 hidden sm:inline">Tasodifiy kazus:</span>
          <input
            type="number"
            min={1}
            max={cases.length}
            value={randomCount}
            onChange={(e) => setRandomCount(Math.max(1, Math.min(cases.length, parseInt(e.target.value) || 1)))}
            className="w-12 rounded border border-slate-200 px-2 py-1 text-sm text-center text-slate-700 focus:border-teal-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleRandomSelect}
            className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Boshlash
          </button>
        </div>
      </div>

      {/* Active filter indicator */}
      {showRandom && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
          <span className="text-sm text-teal-700 font-medium">
            Tasodifiy tanlangan: {randomCases.length} ta kazus
          </span>
          <button
            type="button"
            onClick={() => setShowRandom(false)}
            className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {/* Cases Grid */}
      {displayCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCases.map((legalCase) => (
            <div
              key={legalCase.id}
              className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200"
            >
              {/* Top row: title + badges */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2 flex-1">
                  {legalCase.title}
                </h3>
                {legalCase.isPaid ? (
                  <span className="inline-flex items-center gap-1 shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                    <Lock className="h-3 w-3" />
                    {legalCase.price?.toLocaleString('en-US')} so'm
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    Bepul
                  </span>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mb-4">
                <span className={cn(
                  "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                  difficultyColors[legalCase.difficulty]
                )}>
                  {legalCase.difficulty}
                </span>
                <span className="text-xs text-slate-500">
                  {legalCase.questionCount} ta savol
                </span>
              </div>

              {/* Action */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-teal-700 transition-colors w-full justify-center"
              >
                Yechimni ko'rish
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <Scale className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">
            {searchQuery ? `"${searchQuery}" bo'yicha kazus topilmadi` : "Hozircha kazuslar mavjud emas"}
          </p>
        </div>
      )}
    </div>
  )
}
