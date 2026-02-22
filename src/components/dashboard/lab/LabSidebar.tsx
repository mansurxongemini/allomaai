"use client"

import { useState } from "react"
import { Link, usePathname } from "@/i18n/routing"
import { FlaskConical, ChevronDown, BookOpen, Lightbulb, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

const subjects = [
  { id: "jinoyat-huquqi", name: "Jinoyat huquqi" },
  { id: "fuqarolik-huquqi", name: "Fuqarolik huquqi" },
  { id: "konstitutsiya-huquqi", name: "Konstitutsiya huquqi" },
  { id: "mehnat-huquqi", name: "Mehnat huquqi" },
  { id: "administrativ-huquq", name: "Administrativ huquq" },
]

const methods = [
  { id: "encoding", name: "Kodlash (Encoding)" },
  { id: "chunking", name: "Bo'laklash (Chunking)" },
  { id: "spaced-repetition", name: "Takroriy esga tushirish" },
  { id: "active-recall", name: "Faol eslash" },
]

export function LabSidebar() {
  const pathname = usePathname()
  const [subjectsOpen, setSubjectsOpen] = useState(true)
  const [methodsOpen, setMethodsOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="px-4 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal-50 border border-teal-200">
            <FlaskConical className="h-4 w-4 text-teal-700" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Laboratoriya</h2>
            <p className="text-xs text-slate-500">O'quv markazi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Fanlar Section */}
        <div>
          <button
            type="button"
            onClick={() => setSubjectsOpen(!subjectsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>Fanlar</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", subjectsOpen && "rotate-180")} />
          </button>
          {subjectsOpen && (
            <div className="mt-1 space-y-0.5">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  href={`/dashboard/lab/subjects/${subject.id}`}
                  className={cn(
                    "block px-3 py-2 ml-6 text-sm rounded-lg transition-colors",
                    pathname === `/dashboard/lab/subjects/${subject.id}` ||
                      pathname.startsWith(`/dashboard/lab/subjects/${subject.id}/`)
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {subject.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Metodlar Section */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setMethodsOpen(!methodsOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <span>Metodlar</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", methodsOpen && "rotate-180")} />
          </button>
          {methodsOpen && (
            <div className="mt-1 space-y-0.5">
              {methods.map((method) => (
                <Link
                  key={method.id}
                  href={`/dashboard/lab/methods/${method.id}`}
                  className={cn(
                    "block px-3 py-2 ml-6 text-sm rounded-lg transition-colors",
                    pathname === `/dashboard/lab/methods/${method.id}`
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {method.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Kazuslar Section */}
        <Link
          href="/dashboard/lab/cases"
          className={cn(
            "flex items-center gap-2 px-3 py-2 mt-2 text-sm font-medium rounded-lg transition-colors",
            pathname.startsWith("/dashboard/lab/cases")
              ? "bg-teal-50 text-teal-700"
              : "text-slate-700 hover:bg-slate-50"
          )}
        >
          <Scale className="h-4 w-4 text-teal-600" />
          <span>Kazuslar</span>
        </Link>
      </nav>
    </div>
  )
}
