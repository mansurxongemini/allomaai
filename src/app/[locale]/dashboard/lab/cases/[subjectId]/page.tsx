"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Link } from "@/i18n/routing"
import { Scale, Search, Shuffle, Lock, ChevronRight, Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCaseSubject, getCases } from "@/services/firestore"
import { CaseSubject, CaseItem } from "@/types"

export default function SubjectCasesPage() {
  const { subjectId } = useParams() as { subjectId: string }

  const [subject, setSubject] = useState<CaseSubject | null>(null)
  const [cases, setCases] = useState<CaseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [randomCount, setRandomCount] = useState(3)
  const [randomCases, setRandomCases] = useState<CaseItem[]>([])
  const [showRandom, setShowRandom] = useState(false)

  useEffect(() => {
    Promise.all([getCaseSubject(subjectId), getCases(subjectId)])
      .then(([sub, cas]) => { setSubject(sub); setCases(cas) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [subjectId])

  const filteredCases = useMemo(() => {
    if (!searchQuery) return cases
    return cases.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [cases, searchQuery])

  const handleRandomSelect = () => {
    const count = Math.min(randomCount, cases.length)
    const shuffled = [...cases].sort(() => Math.random() - 0.5)
    setRandomCases(shuffled.slice(0, count))
    setShowRandom(true)
  }

  const displayCases = showRandom ? randomCases : filteredCases

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <Scale className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{subject?.title || "Kazuslar"}</h1>
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
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Random Selector */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5">
          <Shuffle className="h-4 w-4 text-slate-500 ml-1.5" />
          <span className="text-xs text-slate-500 hidden sm:inline">Tasodifiy:</span>
          <input
            type="number" min={1} max={cases.length} value={randomCount}
            onChange={e => setRandomCount(Math.max(1, Math.min(cases.length, parseInt(e.target.value) || 1)))}
            className="w-12 rounded border border-slate-200 px-2 py-1 text-sm text-center focus:border-teal-400 focus:outline-none"
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

      {/* Active random filter */}
      {showRandom && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200">
          <span className="text-sm text-teal-700 font-medium">Tasodifiy tanlangan: {randomCases.length} ta kazus</span>
          <button type="button" onClick={() => setShowRandom(false)} className="text-xs text-teal-600 hover:text-teal-800 font-medium">
            Bekor qilish
          </button>
        </div>
      )}

      {/* Cases Grid */}
      {displayCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCases.map(c => {
            const isPremium = c.type === "premium"
            return (
              <Link
                key={c.id}
                href={`/dashboard/lab/cases/${subjectId}/${c.id}`}
                className="group block"
              >
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2 flex-1">
                      {c.title}
                    </h3>
                    {isPremium ? (
                      <span className="inline-flex items-center gap-1 shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500" />
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Bepul
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-slate-500">{c.questionsCount || 0} ta savol</span>
                    {isPremium && c.price > 0 && (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                        <Lock className="h-3 w-3" />
                        {c.price} coin
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white group-hover:bg-teal-700 transition-colors w-full justify-center">
                    Kazusni ko'rish
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            )
          })}
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
