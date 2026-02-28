"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Scale, Loader2, ChevronRight, FolderOpen } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { getCaseSubjects, addCaseSubject, deleteCaseSubject } from "@/services/firestore"
import { CaseSubject } from "@/types"

const SUBJECT_COLORS = [
    "from-rose-500 to-rose-600",
    "from-blue-500 to-blue-600",
    "from-teal-500 to-teal-600",
    "from-amber-500 to-amber-600",
    "from-emerald-500 to-emerald-600",
    "from-violet-500 to-violet-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
]

export default function CasesPage() {
    const router = useRouter()
    const [subjects, setSubjects] = useState<CaseSubject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => { loadSubjects() }, [])

    const loadSubjects = async () => {
        try {
            const data = await getCaseSubjects()
            setSubjects(data)
        } catch { toast.error("Yuklashda xatolik") }
        finally { setIsLoading(false) }
    }

    const handleAdd = async () => {
        if (!newTitle.trim()) return
        setIsAdding(true)
        try {
            const colorIndex = subjects.length % SUBJECT_COLORS.length
            await addCaseSubject({
                title: newTitle.trim(),
                description: newDesc.trim() || "",
                color: SUBJECT_COLORS[colorIndex],
            })
            setNewTitle("")
            setNewDesc("")
            toast.success("Fan bo'limi qo'shildi")
            loadSubjects()
        } catch { toast.error("Xatolik yuz berdi") }
        finally { setIsAdding(false) }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" bo'limini o'chirishni tasdiqlaysizmi?`)) return
        try {
            await deleteCaseSubject(id)
            toast.success("O'chirildi")
            loadSubjects()
        } catch { toast.error("O'chirishda xatolik") }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kazuslar bazasi</h1>
                    <p className="text-slate-500 text-sm mt-1">Fan bo'limlarini boshqaring va kazuslar qo'shing.</p>
                </div>

                {/* Quick add form */}
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Fan bo'limi nomi..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            className="w-64 border-slate-200 rounded-xl"
                        />
                        <Button
                            onClick={handleAdd}
                            disabled={isAdding || !newTitle.trim()}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 flex items-center gap-2 whitespace-nowrap"
                        >
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>Qo'shish</span>
                        </Button>
                    </div>
                    <Input
                        placeholder="Qisqacha tavsif (ixtiyoriy)..."
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full sm:w-64 border-slate-200 rounded-xl text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                            <p className="text-slate-500 font-medium text-sm">Yuklanmoqda...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-200">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700">Fan bo'limi</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Kazuslar soni</TableHead>
                                    <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-20 text-center">
                                            <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">Hali hech qanday fan bo'limi qo'shilmagan</p>
                                            <p className="text-slate-400 text-sm mt-1">Yuqoridagi maydondan yengi bo'lim qo'shing</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subjects.map((subject) => (
                                        <TableRow
                                            key={subject.id}
                                            className="hover:bg-slate-50/50 border-slate-100 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/admin/cases/${subject.id}`)}
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${subject.color || "from-teal-500 to-teal-600"} flex items-center justify-center`}>
                                                        <Scale className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{subject.title}</p>
                                                        {subject.description && (
                                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subject.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge variant="secondary" className="bg-teal-50 text-teal-700 rounded-lg">
                                                    {subject.casesCount || 0} ta kazus
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/cases/${subject.id}`) }}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(subject.id, subject.title) }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
