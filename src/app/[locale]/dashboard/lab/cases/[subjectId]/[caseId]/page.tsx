"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import { ChevronLeft, Loader2, Lock, Star, Clock, Eye, EyeOff, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCaseDetail, getQuestions, getUserProfile } from "@/services/firestore"
import { useAuth } from "@/context/AuthContext"
import { CaseItem, CaseQuestion, User } from "@/types"
import { cn } from "@/lib/utils"
import DOMPurify from "dompurify"

// ──────────────────────────────────────────────────────────────
//  Helper: determine solution visibility for a free case
// ──────────────────────────────────────────────────────────────
function getSolutionVisibility(caseItem: CaseItem): {
    visible: boolean
    countdown: string | null
} {
    if (caseItem.type === "premium") {
        return { visible: false, countdown: null }
    }
    // Free case
    if (!caseItem.freeAfterDate) {
        return { visible: true, countdown: null }
    }
    const releaseDate = caseItem.freeAfterDate?.toDate
        ? (caseItem.freeAfterDate.toDate() as Date)
        : new Date(caseItem.freeAfterDate)

    const now = new Date()
    if (releaseDate <= now) {
        return { visible: true, countdown: null }
    }
    // Not yet released — format the date
    const formatted = releaseDate.toLocaleDateString("uz-UZ", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
    return { visible: false, countdown: formatted }
}

// ──────────────────────────────────────────────────────────────
//  Tiptap HTML renderer (reuse prose styles from project)
// ──────────────────────────────────────────────────────────────
function RichContent({ html }: { html: string }) {
    return (
        <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-li:marker:text-teal-500 text-slate-700"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
    )
}

export default function CaseDetailPage() {
    const { subjectId, caseId } = useParams() as { subjectId: string; caseId: string }
    const router = useRouter()
    const { currentUser } = useAuth()

    const [caseItem, setCaseItem] = useState<CaseItem | null>(null)
    const [questions, setQuestions] = useState<CaseQuestion[]>([])
    const [userProfile, setUserProfile] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [revealedSolutions, setRevealedSolutions] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetches: Promise<any>[] = [
            getCaseDetail(caseId),
            getQuestions(caseId),
        ]
        if (currentUser?.uid) {
            fetches.push(getUserProfile(currentUser.uid))
        }
        Promise.all(fetches)
            .then(([c, qs, profile]) => {
                setCaseItem(c)
                setQuestions(qs)
                if (profile) setUserProfile(profile)
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [caseId, currentUser?.uid])

    const toggleSolution = useCallback((qId: string) => {
        setRevealedSolutions(prev => {
            const next = new Set(prev)
            if (next.has(qId)) next.delete(qId)
            else next.add(qId)
            return next
        })
    }, [])

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <p className="text-slate-500 text-sm">Yuklanmoqda...</p>
            </div>
        )
    }

    if (!caseItem) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center py-32 gap-4">
                <Scale className="h-12 w-12 text-slate-300" />
                <p className="text-slate-500 font-medium">Kazus topilmadi</p>
                <Button variant="ghost" onClick={() => router.back()}>← Orqaga</Button>
            </div>
        )
    }

    const { visible: isSolutionVisible, countdown } = getSolutionVisibility(caseItem)
    const isPremium = caseItem.type === "premium"
    const userHasPurchased = userProfile?.purchasedCases?.includes(caseId) ?? false
    const canSeeSolution = isPremium ? userHasPurchased : isSolutionVisible

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 lg:p-10 pb-20 space-y-8">
            {/* ── Back button + header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button
                        variant="ghost" size="icon"
                        onClick={() => router.push(`/dashboard/lab/cases/${subjectId}`)}
                        className="rounded-xl hover:bg-slate-100 shrink-0 mt-0.5"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {isPremium ? (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                                    <Star className="w-3 h-3 fill-amber-500" /> Premium
                                </Badge>
                            ) : (
                                <Badge className="bg-green-50 text-green-700 border-green-200">Bepul</Badge>
                            )}
                            <Badge variant="outline" className="text-slate-500">
                                {questions.length} ta savol
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{caseItem.title}</h1>
                    </div>
                </div>
            </div>

            {/* ── Vaziyat tavsifi ── */}
            {caseItem.description && (
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
                        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-teal-600" />
                            Vaziyat tavsifi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <RichContent html={caseItem.description} />
                    </CardContent>
                </Card>
            )}

            {/* ── Solution gate banners ── */}
            {/* Premium paywall */}
            {isPremium && !userHasPurchased && (
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-200/60 shrink-0">
                        <Lock className="w-7 h-7 text-amber-700" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-bold text-amber-900 mb-1">Yechimlar qulflangan</h3>
                        <p className="text-sm text-amber-700">
                            Ushbu kazusning yechimlarini ko'rish uchun Premium obunani faollashtiring.
                            {caseItem.price > 0 && (
                                <span className="font-semibold"> Narxi: {caseItem.price} coin</span>
                            )}
                        </p>
                    </div>
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shrink-0 px-6 shadow-lg shadow-amber-600/20">
                        <Star className="w-4 h-4 mr-2 fill-white" />
                        Sotib olish
                    </Button>
                </div>
            )}

            {/* Free — future date */}
            {!isPremium && !isSolutionVisible && countdown && (
                <div className="rounded-2xl bg-teal-50 border border-teal-200 p-5 flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 shrink-0">
                        <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-teal-900 mb-0.5">Yechimlar hali ochilmagan</h3>
                        <p className="text-sm text-teal-700">
                            Yechimlar <span className="font-semibold">{countdown}</span> dan boshlab ko'rinib boradi.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Questions ── */}
            {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                    Ushbu kazusga hali savollar qo'shilmagan.
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((q, idx) => (
                        <Card
                            key={q.id}
                            className="border-slate-200 shadow-sm rounded-2xl overflow-hidden"
                        >
                            {/* Question header */}
                            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
                                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    Savol #{idx + 1}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                {/* Question text */}
                                <RichContent html={q.questionText} />

                                {/* Solution section */}
                                <div className="border-t border-slate-100 pt-5">
                                    {canSeeSolution ? (
                                        /* User CAN see solution */
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleSolution(q.id)}
                                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 hover:text-teal-700 mb-3 transition-colors"
                                            >
                                                {revealedSolutions.has(q.id)
                                                    ? <><EyeOff className="w-3.5 h-3.5" /> Yechimni yashirish</>
                                                    : <><Eye className="w-3.5 h-3.5" /> Yechimni ko'rsatish</>
                                                }
                                            </button>
                                            {revealedSolutions.has(q.id) && (
                                                <div className={cn(
                                                    "rounded-xl border p-5",
                                                    isPremium
                                                        ? "border-amber-200 bg-amber-50/40"
                                                        : "border-teal-100 bg-teal-50/40"
                                                )}>
                                                    <p className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider mb-3",
                                                        isPremium ? "text-amber-600" : "text-teal-600"
                                                    )}>
                                                        Huquqiy yechim
                                                    </p>
                                                    <RichContent html={q.solutionText} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* User CANNOT see solution */
                                        <div className={cn(
                                            "rounded-xl border p-4 flex items-center gap-3",
                                            isPremium
                                                ? "border-amber-200 bg-amber-50/40"
                                                : "border-slate-200 bg-slate-50"
                                        )}>
                                            {isPremium
                                                ? <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                                                : <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                            }
                                            <p className="text-xs text-slate-500">
                                                {isPremium
                                                    ? "Yechimni ko'rish uchun Premium kerak"
                                                    : `Yechim ${countdown} dan boshlab ko'rinadi`
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
