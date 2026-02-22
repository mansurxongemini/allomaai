import { Network, Calendar } from "lucide-react"

interface CaseCardProps {
  title: string
  category: string
  shortDescription: string
  date: string
}

const categoryColorMap: Record<string, { bg: string; text: string }> = {
  "Jinoyat huquqi": { bg: "bg-teal-50", text: "text-teal-700" },
  "Fuqarolik huquqi": { bg: "bg-sky-50", text: "text-sky-700" },
  "Ma'muriy huquq": { bg: "bg-amber-50", text: "text-amber-700" },
  "Mehnat huquqi": { bg: "bg-rose-50", text: "text-rose-700" },
  "Konstitutsiyaviy huquq": { bg: "bg-indigo-50", text: "text-indigo-700" },
  "Xalqaro huquq": { bg: "bg-emerald-50", text: "text-emerald-700" },
}

const defaultColor = { bg: "bg-slate-100", text: "text-slate-600" }

export function CaseCard({
  title,
  category,
  shortDescription,
  date,
}: CaseCardProps) {
  const colors = categoryColorMap[category] ?? defaultColor

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Header: Category badge + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
        >
          {category}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
          <Calendar className="h-3.5 w-3.5" />
          {date}
        </span>
      </div>

      {/* Body */}
      <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold leading-snug text-slate-800 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2">
        {title}
      </h3>
      <p className="mt-1.5 sm:mt-2 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3">
        {shortDescription}
      </p>

      {/* Footer */}
      <button
        type="button"
        className="mt-4 sm:mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
      >
        <Network className="h-4 w-4 shrink-0" />
        <span className="truncate">{"Tahlilni ko'rish (Mind Map)"}</span>
      </button>
    </article>
  )
}
