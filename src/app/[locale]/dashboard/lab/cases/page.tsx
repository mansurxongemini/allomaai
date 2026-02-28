"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/routing"
import { Scale, ChevronRight, Loader2 } from "lucide-react"
import { getCaseSubjects } from "@/services/firestore"
import { CaseSubject } from "@/types"

const FALLBACK_COLORS = [
  "from-rose-500 to-rose-600",
  "from-blue-500 to-blue-600",
  "from-teal-500 to-teal-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-violet-500 to-violet-600",
  "from-orange-500 to-orange-600",
  "from-cyan-500 to-cyan-600",
]

export default function CasesIndexPage() {
  const [subjects, setSubjects] = useState<CaseSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCaseSubjects()
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-teal-50 border border-teal-200">
            <Scale className="h-5 w-5 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kazuslar</h1>
            <p className="text-sm text-slate-500">Fanni tanlang va amaliy kazuslarni yeching</p>
          </div>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
          <Scale className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Hozircha kazuslar mavjud emas</p>
          <p className="text-sm text-slate-400 mt-1">Administrator tez orada kazuslar qo'shadi</p>
        </div>
      ) : (
        /* Subjects Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, i) => {
            const color = subject.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
            return (
              <Link
                key={subject.id}
                href={`/dashboard/lab/cases/${subject.id}`}
                className="group"
              >
                <div className="relative bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center h-11 w-11 rounded-lg bg-gradient-to-br ${color} mb-4`}>
                    <Scale className="h-5 w-5 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-slate-800 mb-1.5 group-hover:text-teal-700 transition-colors">
                    {subject.title}
                  </h3>

                  {/* Description */}
                  {subject.description && (
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                      {subject.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-xs font-medium text-slate-400">
                      {subject.casesCount || 0} ta kazus
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
