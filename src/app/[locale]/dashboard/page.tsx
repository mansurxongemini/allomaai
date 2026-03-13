"use client"

import { ProfileHero } from "@/components/dashboard/profile/ProfileHero"
import { WeeklyActivityChart } from "@/components/dashboard/profile/ActivityCharts"
import { useDashboardData } from "@/hooks/useDashboardData"
import { CheckCircle2, FileText, Flame } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const {
    profile,
    dailyActivity,
    isLoading
  } = useDashboardData()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Bosh sahifa
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Eng muhim ko&apos;rsatkichlar va keyingi qadamingiz bitta joyda.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8">
        <ProfileHero user={profile} isLoading={isLoading} />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {isLoading || !profile ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-xl border border-slate-200 dark:border-slate-800" />
            ))
          ) : (
            <>
              <CompactStatCard
                label="Yuborilgan maqolalar"
                value={String(profile.stats.articlesSubmitted)}
                icon={FileText}
              />
              <CompactStatCard
                label="Kunlik seriya"
                value={String(profile.streak.current)}
                suffix="kun"
                icon={Flame}
              />
              <CompactStatCard
                label="Bajarilgan vazifalar"
                value={String(profile.stats.tasksCompleted)}
                icon={CheckCircle2}
              />
            </>
          )}
        </section>

        <WeeklyActivityChart data={dailyActivity} isLoading={isLoading} />
      </div>
    </div>
  )
}

function CompactStatCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  suffix?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </span>
        {suffix ? (
          <span className="text-sm text-slate-500 dark:text-slate-400">{suffix}</span>
        ) : null}
      </div>
    </div>
  )
}
