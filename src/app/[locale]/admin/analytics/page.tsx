"use client"

import { useEffect, useMemo, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
} from "recharts"
import { Users, Brain, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    getAggregatedWeaknesses,
    type WeaknessDashboardData,
    type WeaknessTopic,
} from "@/services/analytics"

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Maximum number of topics shown in the bar chart. */
const MAX_CHART_TOPICS = 15

/** Fixed chart height in px — sized for MAX_CHART_TOPICS bars at ~42px each. */
const CHART_HEIGHT = MAX_CHART_TOPICS * 42

/**
 * Bar opacity gradient: the most-frequent bar is fully opaque, the least
 * frequent drops to MIN_BAR_OPACITY. The step size is derived automatically.
 */
const MAX_BAR_OPACITY = 1
const MIN_BAR_OPACITY = 0.6
const BAR_OPACITY_STEP = (MAX_BAR_OPACITY - MIN_BAR_OPACITY) / Math.max(MAX_CHART_TOPICS - 1, 1)

/**
 * Teal → violet gradient palette used to colour bars from most to least
 * frequent. Cycles automatically if there are more than 15 topics.
 */
const BAR_COLORS = [
    "#0d9488", // teal-600
    "#0891b2", // cyan-600
    "#2563eb", // blue-600
    "#4f46e5", // indigo-600
    "#7c3aed", // violet-600
    "#9333ea", // purple-600
    "#c026d3", // fuchsia-600
    "#db2777", // pink-600
    "#e11d48", // rose-600
    "#dc2626", // red-600
    "#d97706", // amber-600
    "#65a30d", // lime-600
    "#059669", // emerald-600
    "#0284c7", // sky-600
    "#0e7490", // cyan-700
]

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function StatCardSkeleton() {
    return (
        <Card className="border-none shadow-sm shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100" />
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-32 rounded bg-slate-100" />
                    <div className="h-7 w-20 rounded bg-slate-100" />
                </div>
            </CardContent>
        </Card>
    )
}

function ChartSkeleton() {
    return (
        <div className="animate-pulse space-y-3 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="h-3 rounded bg-slate-100" style={{ width: `${40 + Math.random() * 30}%` }} />
                    <div className="h-7 rounded-lg bg-slate-100 flex-1" style={{ maxWidth: `${20 + Math.random() * 60}%` }} />
                </div>
            ))}
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Custom Tooltip                                                      */
/* ------------------------------------------------------------------ */

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{ value: number; payload: WeaknessTopic }>
    label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.length) return null
    const { topic, count } = payload[0].payload
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/60 px-4 py-3 min-w-[180px]">
            <p className="text-sm font-semibold text-slate-800 leading-snug mb-1">{topic}</p>
            <p className="text-xs text-slate-500">
                <span className="font-bold text-teal-600 text-base">{count}</span>
                {" "}ta talabada uchralgan
            </p>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AnalyticsDashboardPage() {
    const [data, setData] = useState<WeaknessDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        setLoading(true)
        setError(null)
        getAggregatedWeaknesses()
            .then(setData)
            .catch((err) => {
                console.error("[analytics page] fetch error:", err)
                setError("Ma'lumotlarni yuklashda xatolik yuz berdi.")
            })
            .finally(() => setLoading(false))
    }, [refreshKey])

    const chartData = useMemo(
        () => data?.chartData.slice(0, MAX_CHART_TOPICS) ?? [],
        [data]
    )

    const stats = useMemo(() => {
        if (!data) return []
        return [
            {
                title: "Jami Tahlil Qilingan Talabalar",
                value: data.totalAnalyzedStudents.toLocaleString(),
                sub: `${data.totalStudents.toLocaleString()} ta ro'yxatdan o'tgan`,
                icon: Users,
                color: "text-teal-600",
                bg: "bg-teal-50",
            },
            {
                title: "Eng Qiyin Mavzu",
                value: data.hardestTopic,
                sub: data.chartData[0] ? `${data.chartData[0].count} ta talabada` : "Hali ma'lumot yo'q",
                icon: Brain,
                color: "text-violet-600",
                bg: "bg-violet-50",
            },
            {
                title: "O'rtacha Xatolar Soni",
                value: data.avgWeaknessesPerStudent > 0
                    ? `${data.avgWeaknessesPerStudent}`
                    : "—",
                sub: "har bir tahlil qilingan talabada",
                icon: TrendingUp,
                color: "text-amber-600",
                bg: "bg-amber-50",
            },
        ]
    }, [data])

    return (
        <div className="animate-in fade-in duration-500 space-y-8">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Dekanat Analitikasi
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Talabalar Zaifliklari Radari — barcha foydalanuvchilar bo'yicha yig'ilgan ma'lumot.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setRefreshKey((k) => k + 1)}
                    disabled={loading}
                    className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 self-start md:self-auto"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    <span>Yangilash</span>
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                    : stats.map((stat) => (
                        <Card
                            key={stat.title}
                            className="border-none shadow-sm shadow-slate-200/50 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn(
                                        "p-3 rounded-xl transition-transform group-hover:scale-110 duration-300",
                                        stat.bg, stat.color
                                    )}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                                    {stat.value}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>

            {/* Bar Chart */}
            <Card className="border-none shadow-sm shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-6 pb-2 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">
                                Mavzular bo'yicha qiyinchiliklar
                            </CardTitle>
                            <CardDescription className="text-slate-500 mt-1 text-sm">
                                Eng ko'p xato qilingan {MAX_CHART_TOPICS} ta yuridik mavzu
                            </CardDescription>
                        </div>
                        {!loading && data && data.chartData.length > MAX_CHART_TOPICS && (
                            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                +{data.chartData.length - MAX_CHART_TOPICS} ta mavzu
                            </span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {loading ? (
                        <ChartSkeleton />
                    ) : chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <Brain className="w-10 h-10 text-slate-200" />
                            <p className="text-sm font-medium">Hali tahlil ma'lumotlari mavjud emas</p>
                            <p className="text-xs text-slate-300 text-center max-w-xs">
                                Talabalar AI bilan muloqot qilgach, zaif mavzular avtomatik aniqlanadi va bu yerda ko'rsatiladi.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 4, right: 32, bottom: 4, left: 8 }}
                                barCategoryGap="28%"
                            >
                                <CartesianGrid
                                    horizontal={false}
                                    strokeDasharray="3 3"
                                    stroke="#f1f5f9"
                                />
                                <XAxis
                                    type="number"
                                    allowDecimals={false}
                                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickCount={5}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="topic"
                                    width={160}
                                    tick={{ fontSize: 12, fill: "#475569" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: string) =>
                                        v.length > 22 ? `${v.slice(0, 21)}…` : v
                                    }
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "#f8fafc" }}
                                />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={BAR_COLORS[index % BAR_COLORS.length]}
                                            fillOpacity={MAX_BAR_OPACITY - index * BAR_OPACITY_STEP}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
