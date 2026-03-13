"use client"

import { Crown, Flame, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/gamification"
import { getRank } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface LeaderboardProps {
  entries?: LeaderboardEntry[]
  currentUsername?: string
  isLoading?: boolean
  limit?: number
}

function rankMedal(rank: number) {
  if (rank === 1) return { bg: "bg-gradient-to-br from-amber-400 to-amber-600", text: "text-white" }
  if (rank === 2) return { bg: "bg-gradient-to-br from-slate-300 to-slate-400", text: "text-white" }
  if (rank === 3) return { bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white" }
  return null
}

export function Leaderboard({ entries, currentUsername, isLoading, limit }: LeaderboardProps) {
  if (isLoading || !entries) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
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

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Reyting jadvali</h3>
            <p className="text-xs text-muted-foreground">Top foydalanuvchilar</p>
          </div>
        </div>

        <Empty className="min-h-[260px] rounded-[var(--radius-md)] border border-dashed border-border bg-slate-50/60 dark:bg-slate-900/30">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
              <ChevronUp className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle className="text-foreground">Ma&apos;lumot yo&apos;q</EmptyTitle>
            <EmptyDescription>Reyting hali shakllanmagan. Faollikni boshlang va birinchi bo&apos;lib jadvalga kiring.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard/lab">Faollikni boshlash</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const visibleEntries = typeof limit === "number" ? entries.slice(0, limit) : entries

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <Crown className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Reyting jadvali</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Top foydalanuvchilar</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {visibleEntries.map((entry) => {
          const medal = rankMedal(entry.rank)
          const isCurrent = entry.username === currentUsername
          const userRank = getRank(entry.totalPoints)

          return (
            <div
              key={entry.username}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors duration-200",
                isCurrent
                  ? "border-primary/20 bg-primary/10"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
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
                <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-slate-400 bg-slate-100 shrink-0 dark:bg-slate-800">
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
                      isCurrent ? "text-primary" : "text-slate-800"
                    )}
                  >
                    {entry.name}
                  </p>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
