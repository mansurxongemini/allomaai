"use client"

import { TrendingUp } from "lucide-react"
import type { UserProfile } from "@/lib/gamification"
import { getRank } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

interface ProfileHeroProps {
  user: UserProfile | null
  isLoading?: boolean
}

function ProfileHeroSkeleton() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
          <div className="sm:hidden space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="hidden sm:block space-y-2 mb-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProfileHero({ user, isLoading }: ProfileHeroProps) {
  if (isLoading || !user) {
    return <ProfileHeroSkeleton />
  }

  const rank = getRank(user.totalPoints)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
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
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 lg:text-2xl">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
          </div>

          {/* Rank */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: rank.color }}
              >
                <TrendingUp className="w-3 h-3" />
                {rank.title}
              </span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Daraja {rank.level}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

