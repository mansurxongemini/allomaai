"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts"
import { BarChart3, Clock } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DailyActivity, HourlyActivity } from "@/lib/gamification"

import { Skeleton } from "@/components/ui/skeleton"

/* ------------------------------------------------------------------ */
/* Weekly Activity Bar Chart                                           */
/* ------------------------------------------------------------------ */
interface WeeklyChartProps {
  data?: DailyActivity[]
  isLoading?: boolean
}

const weeklyConfig = {
  minutes: { label: "Daqiqalar", color: "#0d9488" },
  points: { label: "Ballar", color: "#f59e0b" },
}

export function WeeklyActivityChart({ data, isLoading }: WeeklyChartProps) {
  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-[200px] sm:h-[240px] w-full" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <BarChart3 className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Haftalik faollik</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Daqiqalar va ballar</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#0d9488" }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">Daqiqalar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">Ballar</span>
        </div>
      </div>

      <ChartContainer config={weeklyConfig} className="h-[200px] sm:h-[240px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="minutes" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="points" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hourly Peak Activity Area Chart                                     */
/* ------------------------------------------------------------------ */
interface HourlyChartProps {
  data?: HourlyActivity[]
  isLoading?: boolean
}

const hourlyConfig = {
  count: { label: "Faollik", color: "#0d9488" },
}

export function HourlyActivityChart({ data, isLoading }: HourlyChartProps) {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-6 w-16 ml-auto" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-[180px] sm:h-[220px] w-full" />
      </div>
    )
  }

  const peak = data.reduce(
    (max, d) => (d.count > max.count ? d : max),
    data[0]
  )

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 shrink-0">
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Soatlik faollik</h3>
            <p className="text-xs text-slate-400">Eng faol vaqt</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg sm:text-xl font-bold text-slate-800 tabular-nums">{peak.hour}:00</p>
          <p className="text-[10px] text-slate-400">Eng yuqori vaqt</p>
        </div>
      </div>

      <ChartContainer config={hourlyConfig} className="h-[180px] sm:h-[220px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            interval={2}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#areaGradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
