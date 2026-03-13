"use client"

import { Flame, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile, WeeklyStreak } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

interface StreakCalendarProps {
  streak?: UserProfile["streak"]
  weeklyStreak?: WeeklyStreak[]
  isLoading?: boolean
}

export function StreakCalendar({ streak, weeklyStreak, isLoading }: StreakCalendarProps) {
  if (isLoading || !streak || !weeklyStreak) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-baseline gap-1 mb-4">
          <Skeleton className="h-10 w-12" />
          <Skeleton className="h-4 w-6" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
              <Skeleton className="h-3 w-4" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 shrink-0">
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Kunlik seriya</h3>
          <p className="text-xs text-slate-400">Bu haftadagi faolligingiz</p>
        </div>
      </div>

      {/* Streak number */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl sm:text-5xl font-bold text-orange-500 tabular-nums">
          {streak.current}
        </span>
        <span className="text-sm font-medium text-slate-400">kun</span>
      </div>

      {/* Weekly dots */}
      <div className="flex items-center gap-2 sm:gap-3">
        {weeklyStreak.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-colors",
                d.active
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-300"
              )}
            >
              {d.active ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium",
                d.active ? "text-orange-600" : "text-slate-400"
              )}
            >
              {d.day}
            </span>
          </div>
        ))}
      </div>

      {/* Today indicator */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            streak.todayCompleted ? "bg-emerald-500" : "bg-slate-300"
          )}
        />
        <span className="text-xs text-slate-500">
          {streak.todayCompleted
            ? "Bugungi maqsad bajarildi"
            : "Bugungi maqsad hali bajarilmadi"}
        </span>
      </div>
    </div>
  )
}
