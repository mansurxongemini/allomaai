"use client"

import { ProfileHero } from "@/components/dashboard/profile/ProfileHero"
import { StatsGrid } from "@/components/dashboard/profile/StatsGrid"
import { StreakCalendar } from "@/components/dashboard/profile/StreakCalendar"
import { BadgesGrid } from "@/components/dashboard/profile/BadgesGrid"
import { WeeklyActivityChart, HourlyActivityChart } from "@/components/dashboard/profile/ActivityCharts"
import { Leaderboard } from "@/components/dashboard/profile/Leaderboard"
import { useAuth } from "@/context/AuthContext"
import {
  MOCK_USER,
  MOCK_BADGES,
  MOCK_DAILY_ACTIVITY,
  MOCK_HOURLY_ACTIVITY,
  MOCK_WEEKLY_STREAK,
  MOCK_LEADERBOARD,
} from "@/lib/gamification"

export default function DashboardPage() {
  const { currentUser } = useAuth()

  // Merge mock data with real user data if available
  const user = {
    ...MOCK_USER,
    name: currentUser?.displayName || MOCK_USER.name,
    username: currentUser?.email?.split('@')[0] || MOCK_USER.username,
    avatarUrl: currentUser?.photoURL || MOCK_USER.avatarUrl,
  }

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 text-balance">
          Bosh sahifa
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Yutuqlaringiz, reytingingiz va faollik tahlili
        </p>
      </div>

      {/* Sections stack */}
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* 1. Hero card -- avatar, rank, XP, quick stats */}
        <ProfileHero user={user} />

        {/* 2. Activity stats -- 6-column number grid */}
        <StatsGrid stats={user.stats} />

        {/* 3. Streak + Badges -- side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <StreakCalendar streak={user.streak} weeklyStreak={MOCK_WEEKLY_STREAK} />
          </div>
          <div className="lg:col-span-3">
            <BadgesGrid badges={MOCK_BADGES} />
          </div>
        </div>

        {/* 4. Charts -- weekly bar + hourly area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <WeeklyActivityChart data={MOCK_DAILY_ACTIVITY} />
          <HourlyActivityChart data={MOCK_HOURLY_ACTIVITY} />
        </div>

        {/* 5. Leaderboard */}
        <Leaderboard entries={MOCK_LEADERBOARD} currentUsername={user.username} />
      </div>
    </div>
  )
}
