"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import {
    Plus, ChevronLeft, Scale, Edit2, Trash2,
    MoveUp, MoveDown, Loader2, Star, FolderOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    getCaseSubject, getCases, deleteCase, updateCaseItem
} from "@/services/firestore"
import { CaseSubject, CaseItem } from "@/types"

export default function CaseSubjectPage() {
    const { subjectId } = useParams() as { subjectId: string }
    const router = useRouter()
    const [subject, setSubject] = useState<CaseSubject | null>(null)
    const [cases, setCases] = useState<CaseItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => { if (subjectId) loadData() }, [subjectId])

    const loadData = async () => {
        try {
            const [subjectData, casesData] = await Promise.all([
                getCaseSubject(subjectId),
                getCases(subjectId),
            ])
            setSubject(subjectData)
            setCases(casesData)
        } catch { toast.error("Yuklashda xatolik") }
        finally { setIsLoading(false) }
    }

    const handleDelete = async (caseId: string, title: string) => {
        if (!confirm(`"${title}" kazusini o'chirishni tasdiqlaysizmi?`)) return
        try {
            await deleteCase(subjectId, caseId)
            toast.success("Kazus o'chirildi")
            loadData()
        } catch { toast.error("O'chirishda xatolik") }
    }

    const handleReorder = async (caseId: string, direction: 'up' | 'down') => {
        const index = cases.findIndex(c => c.id === caseId)
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === cases.length - 1) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const current = cases[index]
        const target = cases[targetIndex]

        try {
            await Promise.all([
                updateCaseItem(current.id, { order: target.order }),
                updateCaseItem(target.id, { order: current.order }),
            ])
            loadData()
        } catch { toast.error("Tartibni o'zgartirishda xatolik") }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/admin/cases")}
                        className="rounded-xl hover:bg-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900">
                                {subject?.title || "Kazuslar"}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Bu fan bo'limidagi kazuslarni boshqaring
                        </p>
                    </div>
                </div>
                <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 gap-2"
                    onClick={() => router.push(`/admin/cases/${subjectId}/new`)}
                >
                    <Plus className="w-4 h-4" />
                    <span>Yangi kazus</span>
                </Button>
            </div>

            {/* Cases list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500 font-medium">Kazuslar yuklanmoqda...</p>
                </div>
            ) : cases.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 py-20 text-center shadow-none bg-slate-50/30">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <FolderOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Kazuslar hali yo'q</h3>
                        <p className="text-slate-500">Bu fan bo'limiga hali kazus qo'shilmagan.</p>
                        <Button
                            className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none rounded-xl"
                            onClick={() => router.push(`/admin/cases/${subjectId}/new`)}
                        >
                            Yangi kazus qo'shish
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-200">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700 w-12">Tartib</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Kazus nomi</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Savollar</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Turi</TableHead>
                                    <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases.map((caseItem, index) => (
                                    <TableRow
                                        key={caseItem.id}
                                        className="hover:bg-slate-50/50 border-slate-100 transition-colors"
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col gap-1 items-center w-10">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-6 h-6 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                                    disabled={index === 0}
                                                    onClick={() => handleReorder(caseItem.id, 'up')}
                                                >
                                                    <MoveUp className="w-3.5 h-3.5" />
                                                </Button>
                                                <span className="text-sm font-bold text-slate-600">{caseItem.order}</span>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-6 h-6 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                                    disabled={index === cases.length - 1}
                                                    onClick={() => handleReorder(caseItem.id, 'down')}
                                                >
                                                    <MoveDown className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                    <Scale className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-slate-800">{caseItem.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="text-slate-600 text-sm">{caseItem.questionsCount || 0} ta savol</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "rounded-lg px-2 py-0.5 text-[11px] font-medium flex items-center gap-1 w-fit",
                                                    caseItem.type === "premium"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-teal-50 text-teal-700"
                                                )}
                                            >
                                                {caseItem.type === "premium" && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                                                {caseItem.type === "premium" ? "Premium" : "Bepul"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                                                    onClick={() => router.push(`/admin/cases/${subjectId}/${caseItem.id}`)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                    onClick={() => handleDelete(caseItem.id, caseItem.title)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
