"use client"

import { Crown, Flame, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/gamification"
import { getRank } from "@/lib/gamification"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUsername: string
}

function rankMedal(rank: number) {
  if (rank === 1) return { bg: "bg-amber-400", text: "text-white" }
  if (rank === 2) return { bg: "bg-slate-300", text: "text-white" }
  if (rank === 3) return { bg: "bg-orange-400", text: "text-white" }
  return null
}

export function Leaderboard({ entries, currentUsername }: LeaderboardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                isCurrent
                  ? "bg-teal-50 border border-teal-200"
                  : "hover:bg-slate-50"
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
                    <span className="shrink-0 rounded-full bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
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
