"use client"

import { Zap, Flame, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/gamification"
import { getXpProgress, getRank, RANKS } from "@/lib/gamification"

interface ProfileHeroProps {
  user: UserProfile
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const rank = getRank(user.xp)
  const progress = getXpProgress(user.xp)
  const nextRank = RANKS.find((r) => r.level === rank.level + 1)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
          <div
            className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 shrink-0"
            style={{ ["--tw-ring-color" as string]: rank.color }}
          >
            <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-600">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            {/* Level badge */}
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ring-2 ring-white"
              style={{ backgroundColor: rank.color }}
            >
              {rank.level}
            </div>
          </div>
          <div className="sm:hidden">
            <h2 className="text-lg font-semibold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="hidden sm:block">
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>

          {/* Rank + XP bar */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: rank.color }}
                >
                  <TrendingUp className="w-3 h-3" />
                  {rank.title}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Daraja {rank.level}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500 tabular-nums">
                {user.xp.toLocaleString('en-US')} / {rank.maxXp.toLocaleString('en-US')} XP
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, backgroundColor: rank.color }}
              />
            </div>
            {nextRank && (
              <p className="mt-1 text-[11px] text-slate-400">
                Keyingi daraja: <span className="font-medium text-slate-500">{nextRank.title}</span> ({nextRank.minXp - user.xp} XP qoldi)
              </p>
            )}
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4">
            <QuickStat
              icon={Zap}
              label="Jami ball"
              value={user.totalPoints.toLocaleString('en-US')}
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <QuickStat
              icon={Flame}
              label="Seriya"
              value={`${user.streak.current} kun`}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <QuickStat
              icon={Calendar}
              label="A'zolik"
              value={`${Math.round((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} kun`}
              color="text-teal-600"
              bg="bg-teal-50"
            />
            <QuickStat
              icon={TrendingUp}
              label="Eng uzun seriya"
              value={`${user.streak.longest} kun`}
              color="text-sky-600"
              bg="bg-sky-50"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className={cn("flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0", bg)}>
        <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-slate-400 truncate">{label}</p>
        <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  )
}
