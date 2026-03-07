"use client"

import { Crown, Flame, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/gamification"
import { getRank } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardProps {
  entries?: LeaderboardEntry[]
  currentUsername?: string
  isLoading?: boolean
}

function rankMedal(rank: number) {
  if (rank === 1) return { bg: "bg-gradient-to-br from-amber-400 to-amber-600", text: "text-white" }
  if (rank === 2) return { bg: "bg-gradient-to-br from-slate-300 to-slate-400", text: "text-white" }
  if (rank === 3) return { bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white" }
  return null
}

export function Leaderboard({ entries, currentUsername, isLoading }: LeaderboardProps) {
  if (isLoading || !entries) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 shrink-0">
          <Crown className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Reyting jadvali</h3>
          <p className="text-xs text-slate-400">Top foydalanuvchilar</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {entries.map((entry) => {
          const medal = rankMedal(entry.rank)
          const isCurrent = entry.username === currentUsername
          const userRank = getRank(entry.xp)

          return (
            <div
              key={entry.username}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
                isCurrent
                  ? "bg-teal-50/50 border border-teal-100 shadow-sm shadow-teal-500/5 scale-[1.02] z-10"
                  : "hover:bg-slate-50 border border-transparent"
              )}
            >
              {/* Rank */}
              {medal ? (
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0",
                    medal.bg,
                    medal.text
                  )}
                >
                  {entry.rank}
                </div>
              ) : (
                <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-slate-400 bg-slate-100 shrink-0">
                  {entry.rank}
                </div>
              )}

              {/* Avatar */}
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-xs font-bold text-white"
                style={{ backgroundColor: userRank.color }}
              >
                {entry.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              {/* Name & info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate",
                      isCurrent ? "text-teal-800" : "text-slate-800"
                    )}
                  >
                    {entry.name}
                  </p>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                      Siz
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">Daraja {entry.level}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                    <Flame className="w-2.5 h-2.5" />
                    {entry.streak}
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-800 tabular-nums">
                  {entry.xp.toLocaleString('en-US')}
                </p>
                <p className="text-[10px] text-slate-400">XP</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
