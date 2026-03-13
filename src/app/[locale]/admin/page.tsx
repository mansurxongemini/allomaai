"use client"

import { useEffect, useState } from "react"
import {
    Users,
    FileText,
    Scale,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Filter,
    Download,
    Loader2,
    BookOpen,
    Bug,
    ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { db } from "@/lib/firebase"
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    getCountFromServer,
} from "firebase/firestore"
import { formatRelativeTime } from "@/lib/date-utils"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface AdminStat {
    title: string
    value: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bg: string
}

interface BlogSubmission {
    id: string
    title: string
    authorName: string
    status: string
    createdAt: Date | null
}

interface SyncResult {
    total: number
    processed: number
    failed: number
    errors?: string[]
}

interface DebugLogEntry {
    id: number
    level: "info" | "error"
    message: string
    timestamp: string
}

/* ------------------------------------------------------------------ */
/* Skeleton Components                                                 */
/* ------------------------------------------------------------------ */
function StatCardSkeleton() {
    return (
        <Card className="border-none shadow-sm shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100" />
                    <div className="w-14 h-6 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-7 w-16 rounded bg-slate-100" />
                </div>
            </CardContent>
        </Card>
    )
}

function TableRowSkeleton() {
    return (
        <TableRow className="border-slate-50">
            <TableCell className="pl-6 py-4">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
            </TableCell>
            <TableCell className="py-4">
                <div className="animate-pulse flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100" />
                    <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
            </TableCell>
            <TableCell className="py-4"><div className="animate-pulse h-3 w-10 rounded bg-slate-100" /></TableCell>
            <TableCell className="py-4"><div className="animate-pulse h-3 w-10 rounded bg-slate-100" /></TableCell>
            <TableCell className="py-4"><div className="animate-pulse h-5 w-20 rounded bg-slate-100" /></TableCell>
            <TableCell className="text-right pr-6 py-4"><div className="animate-pulse h-8 w-8 rounded bg-slate-100 ml-auto" /></TableCell>
        </TableRow>
    )
}

/* ================================================================== */
/* Admin Dashboard Page                                                */
/* ================================================================== */
export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStat[]>([])
    const [submissions, setSubmissions] = useState<BlogSubmission[]>([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingTable, setLoadingTable] = useState(true)
    const [syncSecret, setSyncSecret] = useState("")
    const [syncLoading, setSyncLoading] = useState(false)
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
    const [debugOpen, setDebugOpen] = useState(false)
    const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([])
    const [debugPayload, setDebugPayload] = useState("")

    function pushDebugLog(level: "info" | "error", message: string) {
        const entry: DebugLogEntry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            level,
            message,
            timestamp: new Date().toLocaleTimeString("uz-UZ"),
        }

        setDebugLogs((prev) => [entry, ...prev].slice(0, 20))
    }

    async function executeSyncRequest(trigger: "sync" | "verify") {
        if (!syncSecret.trim()) {
            pushDebugLog("error", "ADMIN_SYNC_SECRET kiritilmagan")
            toast.error("ADMIN_SYNC_SECRET kiriting")
            return null
        }

        setSyncLoading(true)
        if (trigger === "sync") setSyncResult(null)

        const startedAt = Date.now()
        pushDebugLog("info", `${trigger.toUpperCase()} so'rovi boshlandi`)

        try {
            const res = await fetch("/api/admin/sync-vectors", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${syncSecret.trim()}`,
                },
            })

            const elapsed = Date.now() - startedAt
            pushDebugLog("info", `HTTP ${res.status} (${elapsed} ms)`)

            const body = await res.json().catch(() => ({}))
            const result: SyncResult = {
                total: Number(body?.total ?? 0),
                processed: Number(body?.processed ?? 0),
                failed: Number(body?.failed ?? 0),
                errors: Array.isArray(body?.errors) ? body.errors.map(String) : [],
            }
            setDebugPayload(JSON.stringify(result, null, 2))

            if (res.status === 401) {
                pushDebugLog("error", "Unauthorized: Bearer token noto'g'ri")
                toast.error("Noto'g'ri secret yoki ruxsat yo'q")
                return null
            }

            if (!res.ok) {
                pushDebugLog("error", result.errors?.[0] ?? `Server xatosi: ${res.status}`)
                toast.error(result.errors?.[0] ?? `Sync xatosi: ${res.status}`)
                return null
            }

            setSyncResult(result)
            pushDebugLog("info", `Natija: processed=${result.processed}, failed=${result.failed}`)

            if (Array.isArray(result.errors) && result.errors.length > 0) {
                result.errors.forEach((err) => pushDebugLog("error", err))
            }

            return result
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err)
            pushDebugLog("error", `So'rov bajarilmadi: ${msg}`)
            console.error("[admin-dashboard] sync-vectors request failed:", err)
            toast.error("Tarmoq xatosi: sync amalga oshmadi")
            return null
        } finally {
            setSyncLoading(false)
        }
    }

    async function handleGlobalVectorSync() {
        const result = await executeSyncRequest("sync")
        if (!result) return
        toast.success(`${result.processed || 0} ta maqola yuklandi, ${result.failed || 0} ta xato.`)
    }

    async function handleLiveVerify() {
        setDebugOpen(true)
        const data = await executeSyncRequest("verify")
        if (!data) return

        toast.success("Live verification yakunlandi. Debug panel yangilandi.")
    }

    /* ------ Fetch Aggregated Stats ------ */
    useEffect(() => {
        async function fetchStats() {
            try {
                const [usersSnap, pendingBlogsSnap, casesSnap, allBlogsSnap] = await Promise.all([
                    getCountFromServer(collection(db, "users")),
                    getCountFromServer(query(collection(db, "blogs"), where("status", "==", "pending"))),
                    getCountFromServer(collection(db, "cases")),
                    getCountFromServer(collection(db, "blogs")),
                ])

                setStats([
                    {
                        title: "Jami Talabalar",
                        value: usersSnap.data().count.toLocaleString(),
                        icon: Users,
                        color: "text-blue-600",
                        bg: "bg-blue-50"
                    },
                    {
                        title: "Kutilayotgan Maqolalar",
                        value: String(pendingBlogsSnap.data().count),
                        icon: FileText,
                        color: "text-amber-600",
                        bg: "bg-amber-50"
                    },
                    {
                        title: "Faol Kazuslar",
                        value: String(casesSnap.data().count),
                        icon: Scale,
                        color: "text-teal-600",
                        bg: "bg-teal-50"
                    },
                    {
                        title: "Jami Maqolalar",
                        value: String(allBlogsSnap.data().count),
                        icon: BookOpen,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50"
                    }
                ])
            } catch (err) {
                console.error("Error fetching admin stats:", err)
            } finally {
                setLoadingStats(false)
            }
        }

        fetchStats()
    }, [])

    /* ------ Real-time Recent Blog Submissions ------ */
    useEffect(() => {
        const q = query(
            collection(db, "blogs"),
            orderBy("createdAt", "desc"),
            limit(5)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rows: BlogSubmission[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data()
                return {
                    id: docSnap.id,
                    title: data.title || "Nomsiz maqola",
                    authorName: data.authorName || data.author || "Noma'lum muallif",
                    status: data.status || "pending",
                    createdAt: data.createdAt?.toDate?.() || null,
                }
            })
            setSubmissions(rows)
            setLoadingTable(false)
        }, (error) => {
            console.error("Error fetching recent submissions:", error)
            setLoadingTable(false)
        })

        return () => unsubscribe()
    }, [])

    /* ------ Status helpers ------ */
    function statusLabel(status: string) {
        if (status === "approved" || status === "published") return "Tasdiqlangan"
        if (status === "rejected") return "Rad etilgan"
        return "Kutilmoqda"
    }

    function statusVariant(status: string) {
        const label = statusLabel(status)
        if (label === "Tasdiqlangan") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        if (label === "Rad etilgan") return "bg-rose-50 text-rose-700 hover:bg-rose-100"
        return "bg-amber-50 text-amber-700 hover:bg-amber-100"
    }

    return (
        <div className="animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Xush kelibsiz, Admin!</h2>
                    <p className="text-slate-500 mt-1">Platformadagi so'nggi yangiliklar va statistikalar.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span>Filtrlash</span>
                    </Button>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Hisobot yuklash</span>
                    </Button>
                </div>
            </div>

            <Card className="border-violet-100 bg-gradient-to-br from-violet-50/60 to-indigo-50/40 shadow-sm mb-10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-800">AI Xotirasini Yangilash (Vector Sync)</CardTitle>
                    <CardDescription>
                        articles, blogs, cases va laws kolleksiyalaridagi vectorized bo'lmagan yozuvlar sinxronlanadi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            type="password"
                            placeholder="ADMIN_SYNC_SECRET..."
                            value={syncSecret}
                            onChange={(e) => setSyncSecret(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleGlobalVectorSync()}
                            disabled={syncLoading}
                            className="md:max-w-md bg-white"
                        />
                        <Button
                            onClick={handleGlobalVectorSync}
                            disabled={syncLoading}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {syncLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sync qilinmoqda...
                                </>
                            ) : (
                                "Sync AI Memory"
                            )}
                        </Button>
                        <Button
                            onClick={handleLiveVerify}
                            disabled={syncLoading}
                            variant="outline"
                            className="border-violet-200 text-violet-700 hover:bg-violet-50"
                        >
                            <Bug className="w-4 h-4 mr-2" />
                            One-click Live Verify
                        </Button>
                    </div>
                    {syncResult && (
                        <p className="text-xs text-slate-600 mt-3">
                            Jami: {syncResult.total}, Yuklandi: {syncResult.processed}, Xato: {syncResult.failed}
                        </p>
                    )}

                    <div className="mt-4 border border-violet-100 rounded-xl bg-white/80">
                        <button
                            type="button"
                            onClick={() => setDebugOpen((v) => !v)}
                            className="w-full px-3 py-2.5 flex items-center justify-between text-left"
                        >
                            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Bug className="w-4 h-4 text-violet-600" />
                                Sync Debug Panel
                            </span>
                            <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", debugOpen && "rotate-180")} />
                        </button>

                        {debugOpen && (
                            <div className="px-3 pb-3 border-t border-violet-100 space-y-3">
                                <div className="max-h-44 overflow-auto rounded-lg bg-slate-950 text-slate-100 p-2 text-xs font-mono">
                                    {debugLogs.length === 0 ? (
                                        <p className="text-slate-400">Hali log yo'q. "One-click Live Verify" tugmasini bosing.</p>
                                    ) : (
                                        debugLogs.map((log) => (
                                            <p key={log.id} className={cn("leading-5", log.level === "error" ? "text-rose-300" : "text-emerald-300")}>
                                                [{log.timestamp}] {log.level.toUpperCase()}: {log.message}
                                            </p>
                                        ))
                                    )}
                                </div>

                                {debugPayload && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-600 mb-1">Last Response Payload</p>
                                        <pre className="max-h-44 overflow-auto rounded-lg bg-slate-100 text-slate-700 p-2 text-[11px] leading-5">
                                            {debugPayload}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loadingStats
                    ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    : stats.map((stat, index) => (
                        <Card key={index} className="border-none shadow-sm shadow-slate-200/50 bg-white hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>

            {/* Table Section */}
            <Card className="border-none shadow-sm shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900">So'nggi blog arizalari</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">Talabalar tomonidan yuborilgan maqolalar va ularning tahlili.</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-all text-sm font-semibold">
                        Barchasini ko'rish
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[400px] font-semibold text-slate-600 pl-6 py-4">Maqola nomi</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">Muallif</TableHead>
                                <TableHead className="font-semibold text-slate-600 py-4">Holati</TableHead>
                                <TableHead className="text-right font-semibold text-slate-600 pr-6 py-4">Harakat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingTable
                                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                                : submissions.length === 0
                                    ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12 text-slate-400">
                                                Hali maqolalar yuborilmagan
                                            </TableCell>
                                        </TableRow>
                                    )
                                    : submissions.map((submission) => (
                                        <TableRow key={submission.id} className="group hover:bg-slate-50/30 border-slate-50 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800 line-clamp-1">{submission.title}</span>
                                                    <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {submission.createdAt ? formatRelativeTime(submission.createdAt) : "Noma'lum"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                                                        {submission.authorName[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="text-sm text-slate-600">{submission.authorName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className={cn(
                                                    "rounded-lg font-medium text-[11px] px-2 py-0.5",
                                                    statusVariant(submission.status)
                                                )}>
                                                    {statusLabel(submission.status) === "Tasdiqlangan" ? (
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <Clock className="w-3 h-3 mr-1" />
                                                    )}
                                                    {statusLabel(submission.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 group-hover:opacity-100 transition-all">
                                                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 p-1.5 shadow-xl shadow-slate-200/50">
                                                        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-teal-50 focus:text-teal-700">
                                                            Ko'rish
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-teal-50 focus:text-teal-700">
                                                            Tasdiqlash
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-rose-50 focus:text-rose-600">
                                                            Rad etish
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
