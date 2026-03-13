"use client"

import { useEffect, useState } from "react"
import { FileText, Clock, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore"
import { toast } from "sonner"

interface ArticleRow {
    id: string
    studentName: string
    studentEmail: string
    topic: string
    aiScore: number
    plagiarismScore: number
    permission: string
    vectorized: boolean
    createdAtLabel: string
}

function mapArticle(docSnap: QueryDocumentSnapshot<DocumentData>): ArticleRow {
    const data = docSnap.data()
    const createdAtDate = data.createdAt?.toDate?.() as Date | undefined

    return {
        id: docSnap.id,
        studentName: data.authorName || data.student?.name || data.author || "Noma'lum talaba",
        studentEmail: data.authorEmail || data.student?.email || data.email || "email yo'q",
        topic: data.topic || data.case || data.caseTitle || data.title || "Noma'lum mavzu",
        aiScore: Number(data.aiScore ?? data.scores?.ai ?? 0),
        plagiarismScore: Number(data.plagiarismScore ?? data.scores?.plagiarism ?? 0),
        permission: data.permission || (data.authorPermission === true ? "Ruxsat berilgan" : "Kutilmoqda"),
        vectorized: data.vectorized === true,
        createdAtLabel: createdAtDate
            ? createdAtDate.toLocaleDateString("uz-UZ")
            : "Noma'lum sana",
    }
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<ArticleRow[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchArticles() {
        setLoading(true)

        try {
            // Primary query: newest first
            const orderedQuery = query(
                collection(db, "articles"),
                orderBy("createdAt", "desc"),
                limit(100)
            )
            const snap = await getDocs(orderedQuery)
            setArticles(snap.docs.map(mapArticle))
        } catch (orderedErr) {
            console.error("[admin/articles] ordered query failed, falling back:", orderedErr)

            try {
                // Fallback query when createdAt index/field is unavailable
                const plainSnap = await getDocs(collection(db, "articles"))
                setArticles(plainSnap.docs.map(mapArticle))
            } catch (err) {
                console.error("[admin/articles] failed to fetch articles:", err)
                toast.error("Maqolalarni yuklashda xatolik yuz berdi")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchArticles()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maqolalar (Firestore)</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time emas, lekin Firestore articles kolleksiyasidan jonli o'qiladi.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-slate-200"
                    onClick={fetchArticles}
                    disabled={loading}
                >
                    <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Yangilash
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-200">
                                <TableHead className="py-4 pl-6 font-semibold text-slate-700">Talaba</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Tegishli Kazus/Savol</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">AI Bahosi / Plagiat</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Muallif ruxsati</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">AI Xotira</TableHead>
                                <TableHead className="py-4 pr-6 font-semibold text-slate-700">Sana</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                        Yuklanmoqda...
                                    </TableCell>
                                </TableRow>
                            ) : articles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                                        Articles kolleksiyasida ma'lumot topilmadi
                                    </TableCell>
                                </TableRow>
                            ) : (
                                articles.map((article) => (
                                    <TableRow key={article.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800 text-sm">{article.studentName}</span>
                                                <span className="text-xs text-slate-400">{article.studentEmail}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                <span>{article.topic}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-teal-50 text-teal-700 border-teal-100 shadow-none font-bold">
                                                    {article.aiScore}/100
                                                </Badge>
                                                <span className="text-[10px] text-slate-400 font-medium">|</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "rounded-lg px-2 py-0 text-[10px] font-medium border-transparent shrink-0",
                                                        article.plagiarismScore < 10 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                    )}
                                                >
                                                    Plagiat: {article.plagiarismScore}%
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-xs border-transparent",
                                                    article.permission === "Ruxsat berilgan"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700"
                                                )}
                                            >
                                                {article.permission}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn(
                                                "text-xs font-medium",
                                                article.vectorized
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {article.vectorized ? "Vectorized" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-slate-600 text-sm">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {article.createdAtLabel}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
