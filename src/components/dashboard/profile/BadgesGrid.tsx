"use client"

import {
  Star,
  Trophy,
  Flame,
  Brain,
  FileText,
  Medal,
  Scale,
  Footprints,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Badge } from "@/lib/gamification"
import { TIER_STYLES } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star, Trophy, Flame, Brain, FileText, Medal, Scale, Footprints,
}

function resolveIcon(name: string) {
  return iconMap[name] ?? Star
}

interface BadgesGridProps {
  badges?: Badge[]
  isLoading?: boolean
}

export function BadgesGrid({ badges, isLoading }: BadgesGridProps) {
  if (isLoading || !badges) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const unlocked = badges.filter((b) => b.unlockedAt)
  const locked = badges.filter((b) => !b.unlockedAt)

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 shrink-0">
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Yutuqlar</h3>
            <p className="text-xs text-slate-400">{unlocked.length} / {badges.length} ochilgan</p>
          </div>
        </div>
      </div>

      {/* Unlocked badges */}
      {unlocked.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          {unlocked.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3 mt-4">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Qulflangan
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {locked.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = resolveIcon(badge.iconName)
  const isLocked = !badge.unlockedAt
  const tier = TIER_STYLES[badge.tier]

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-[var(--radius-md)] border p-3 transition-shadow duration-200 hover:shadow-md sm:p-4",
        isLocked && badge.progress < 100
          ? "border-slate-100 bg-slate-50/50 grayscale opacity-70"
          : cn("border-border bg-surface shadow-sm", tier.border)
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl",
          isLocked ? "bg-slate-100" : tier.bg
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6",
            isLocked ? "text-slate-300" : tier.text
          )}
        />
      </div>

      <div className="text-center min-w-0 w-full">
        <p
          className={cn(
            "text-xs sm:text-sm font-semibold leading-tight truncate",
            isLocked && badge.progress < 100 ? "text-gray-500" : "text-slate-800"
          )}
        >
          {badge.title}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 truncate">
          {badge.requirement}
        </p>
      </div>

      {/* Progress bar for locked */}
      {isLocked && (
        <div className="w-full">
          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${badge.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1 tabular-nums">
            {Math.round(badge.progress)}%
          </p>
        </div>
      )}

      {/* Tier badge */}
      {!isLocked && (
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            tier.bg,
            tier.text
          )}
        >
          {badge.tier}
        </span>
      )}
    </div>
  )
}
