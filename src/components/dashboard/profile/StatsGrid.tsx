"use client"

import {
  FileText,
  Scale,
  CheckCircle2,
  GraduationCap,
  Clock,
  Timer,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

interface StatsGridProps {
  stats?: UserProfile["stats"]
  isLoading?: boolean
}

const statConfig = [
  {
    key: "articlesSubmitted" as const,
    label: "Yuborilgan maqolalar",
    icon: FileText,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    key: "casesAnalyzed" as const,
    label: "Tahlil qilingan ishlar",
    icon: Scale,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-100",
  },
  {
    key: "tasksCompleted" as const,
    label: "Bajarilgan vazifalar",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    key: "quizzesPassed" as const,
    label: "O'tilgan testlar",
    icon: GraduationCap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    key: "totalStudyHours" as const,
    label: "Umumiy soatlar",
    icon: Clock,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    suffix: " soat",
  },
  {
    key: "avgDailyMinutes" as const,
    label: "O'rtacha kunlik",
    icon: Timer,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    suffix: " daq",
  },
]

export function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading || !stats) {
    return (
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">
          Faoliyat statistikasi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">
        Faoliyat statistikasi
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statConfig.map((s) => {
          const Icon = s.icon
          const value = stats[s.key as keyof UserProfile["stats"]]
          return (
            <div
              key={s.key}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md",
                s.border
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  s.bg
                )}
              >
                <Icon className={cn("w-5 h-5", s.color)} />
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 tabular-nums tracking-tight">
                  {value}
                  {s.suffix ? (
                    <span className="text-xs font-medium text-gray-400 ml-0.5">
                      {s.suffix}
                    </span>
                  ) : null}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 mt-0.5 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
