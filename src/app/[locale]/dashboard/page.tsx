"use client"

import { ProfileHero } from "@/components/dashboard/profile/ProfileHero"
import { StatsGrid } from "@/components/dashboard/profile/StatsGrid"
import { StreakCalendar } from "@/components/dashboard/profile/StreakCalendar"
import { BadgesGrid } from "@/components/dashboard/profile/BadgesGrid"
import { WeeklyActivityChart, HourlyActivityChart } from "@/components/dashboard/profile/ActivityCharts"
import { Leaderboard } from "@/components/dashboard/profile/Leaderboard"
import { useDashboardData } from "@/hooks/useDashboardData"
import { BADGE_DEFINITIONS } from "@/lib/gamification"

export default function DashboardPage() {
  const {
    profile,
    leaderboard,
    dailyActivity,
    hourlyActivity,
    weeklyStreak,
    isLoading
  } = useDashboardData()

  // Dynamic Badge Calculation
  const badges = BADGE_DEFINITIONS.map((badge) => {
    const isUnlocked = profile?.unlockedBadges?.includes(badge.id)

    let progress = 0
    if (isUnlocked) {
      progress = 100
    } else if (badge.metricType === "stat" && badge.statKey && badge.requirementValue && profile?.stats) {
      const currentVal = profile.stats[badge.statKey as keyof typeof profile.stats] || 0
      progress = Math.min(100, (currentVal / badge.requirementValue) * 100)
    } else if (badge.metricType === "streak" && badge.requirementValue && profile?.streak) {
      const currentVal = profile.streak.longest || 0
      progress = Math.min(100, (currentVal / badge.requirementValue) * 100)
    }

    return {
      ...badge,
      unlockedAt: isUnlocked ? new Date().toISOString() : null,
      progress
    }
  })

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 text-balance">
            Bosh sahifa
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Yutuqlaringiz, reytingingiz va faollik tahlili
          </p>
        </div>
      </div>

      {/* Sections stack */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* 1. Hero card -- avatar, rank, XP, quick stats */}
        <ProfileHero user={profile} isLoading={isLoading} />

        {/* 2. Activity stats -- 6-column number grid */}
        <StatsGrid stats={profile?.stats} isLoading={isLoading} />

        {/* 3. Streak + Badges -- side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <StreakCalendar
              streak={profile?.streak}
              weeklyStreak={weeklyStreak}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-3">
            <BadgesGrid badges={badges} isLoading={isLoading} />
          </div>
        </div>

        {/* 4. Charts -- weekly bar + hourly area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <WeeklyActivityChart data={dailyActivity} isLoading={isLoading} />
          <HourlyActivityChart data={hourlyActivity} isLoading={isLoading} />
        </div>

        {/* 5. Leaderboard */}
        <Leaderboard
          entries={leaderboard}
          currentUsername={profile?.username}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
