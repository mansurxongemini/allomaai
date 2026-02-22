"use client"

import { Link } from "@/i18n/routing"
import { Scale, ChevronRight } from "lucide-react"

const subjects = [
  {
    id: "jinoyat-huquqi",
    name: "Jinoyat huquqi",
    description: "Jinoyat va jazo munosabatlarini tartibga soluvchi huquq tarmog'i",
    caseCount: 24,
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "fuqarolik-huquqi",
    name: "Fuqarolik huquqi",
    description: "Mulkiy va shaxsiy nomulkiy munosabatlarni tartibga soladi",
    caseCount: 18,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "konstitutsiya-huquqi",
    name: "Konstitutsiya huquqi",
    description: "Davlat tuzilishi va fuqarolar huquqlari",
    caseCount: 12,
    color: "from-teal-500 to-teal-600",
  },
  {
    id: "mehnat-huquqi",
    name: "Mehnat huquqi",
    description: "Mehnat munosabatlarini tartibga soluvchi huquqiy normalar",
    caseCount: 15,
    color: "from-amber-500 to-amber-600",
  },
  {
    id: "administrativ-huquq",
    name: "Administrativ huquq",
    description: "Ijroiya hokimiyati organlarining faoliyatini tartibga soladi",
    caseCount: 10,
    color: "from-emerald-500 to-emerald-600",
  },
]

export default function CasesIndexPage() {
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

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/dashboard/lab/cases/${subject.id}`}
            className="group"
          >
            <div className="relative bg-white border border-slate-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200 h-full flex flex-col">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center h-11 w-11 rounded-lg bg-gradient-to-br ${subject.color} mb-4`}>
                <Scale className="h-5 w-5 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-slate-800 mb-1.5 group-hover:text-teal-700 transition-colors">
                {subject.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                {subject.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">
                  {subject.caseCount} ta kazus
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
