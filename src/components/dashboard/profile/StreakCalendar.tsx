"use client"

import { Flame, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile, WeeklyStreak } from "@/lib/gamification"

interface StreakCalendarProps {
  streak: UserProfile["streak"]
  weeklyStreak: WeeklyStreak[]
}

export function StreakCalendar({ streak, weeklyStreak }: StreakCalendarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
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
