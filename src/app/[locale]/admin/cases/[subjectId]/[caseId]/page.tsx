"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import {
    ChevronLeft, Save, Plus, Trash2, Loader2,
    FileText, Star, Clock, HelpCircle, MoveUp, MoveDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { toast } from "sonner"
import {
    getCaseDetail, getCases, addCase, updateCaseItem,
    getQuestions, addQuestion, updateQuestion, deleteQuestion
} from "@/services/firestore"
import { CaseItem, CaseQuestion } from "@/types"
import { cn } from "@/lib/utils"

// ────────────────────────────────────────────────
//  Local type for editable question
// ────────────────────────────────────────────────
interface EditableQuestion {
    id: string | null   // null = not yet saved to Firestore
    questionText: string
    solutionText: string
    order: number
}

export default function CaseEditorPage() {
    const { subjectId, caseId } = useParams() as { subjectId: string; caseId: string }
    const router = useRouter()
    const isNew = caseId === "new"

    // Case meta fields
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [type, setType] = useState<"free" | "premium">("free")
    const [freeAfterDate, setFreeAfterDate] = useState("")
    const [price, setPrice] = useState(0)
    const [order, setOrder] = useState(1)

    // Questions
    const [questions, setQuestions] = useState<EditableQuestion[]>([])

    // Loading / saving states
    const [isLoading, setIsLoading] = useState(!isNew)
    const [isSaving, setIsSaving] = useState(false)
    const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null)

    useEffect(() => {
        if (!isNew) {
            loadData()
        } else {
            // Determine the next order number
            getCases(subjectId)
                .then(list => setOrder(list.length + 1))
                .catch(() => setOrder(1))
        }
    }, [caseId, subjectId])

    const loadData = async () => {
        try {
            const [caseData, questionsData] = await Promise.all([
                getCaseDetail(caseId),
                getQuestions(caseId),
            ])
            if (caseData) {
                setTitle(caseData.title)
                setDescription(caseData.description || "")
                setType(caseData.type)
                setPrice(caseData.price || 0)
                setOrder(caseData.order || 1)
                if (caseData.freeAfterDate?.toDate) {
                    // Firestore Timestamp → datetime-local string
                    const d = caseData.freeAfterDate.toDate() as Date
                    setFreeAfterDate(d.toISOString().slice(0, 16))
                }
            }
            setQuestions(questionsData.map(q => ({
                id: q.id,
                questionText: q.questionText,
                solutionText: q.solutionText,
                order: q.order,
            })))
        } catch { toast.error("Yuklashda xatolik") }
        finally { setIsLoading(false) }
    }

    // ──────────────────────────────────────
    //  Save case meta
    // ──────────────────────────────────────
    const handleSaveCase = async () => {
        if (!title.trim()) { toast.error("Sarlavha kiritilishi shart"); return }
        setIsSaving(true)
        try {
            const payload: Partial<CaseItem> = {
                title: title.trim(),
                description,
                type,
                price: type === "premium" ? price : 0,
                freeAfterDate: type === "free" && freeAfterDate
                    ? new Date(freeAfterDate)
                    : null,
                order,
            }
            if (isNew) {
                const newId = await addCase(subjectId, payload)
                toast.success("Kazus yaratildi!")
                // Redirect to edit mode so questions can be saved
                router.replace(`/admin/cases/${subjectId}/${newId}`)
            } else {
                await updateCaseItem(caseId, payload)
                toast.success("Kazus saqlandi!")
            }
        } catch { toast.error("Saqlashda xatolik") }
        finally { setIsSaving(false) }
    }

    // ──────────────────────────────────────
    //  Questions management
    // ──────────────────────────────────────
    const addLocalQuestion = () => {
        const nextOrder = questions.length + 1
        setQuestions(prev => [...prev, {
            id: null,
            questionText: "",
            solutionText: "",
            order: nextOrder,
        }])
    }

    const updateLocalQuestion = (index: number, key: keyof EditableQuestion, value: string | number) => {
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [key]: value } : q))
    }

    const handleSaveQuestion = async (index: number) => {
        if (isNew) { toast.error("Avval kazusni saqlang"); return }
        const q = questions[index]
        setSavingQuestionId(`${index}`)
        try {
            if (!q.id) {
                // New question — create in Firestore
                const newId = await addQuestion(caseId, {
                    questionText: q.questionText,
                    solutionText: q.solutionText,
                    order: q.order,
                })
                setQuestions(prev => prev.map((item, i) => i === index ? { ...item, id: newId } : item))
                toast.success("Savol qo'shildi")
            } else {
                await updateQuestion(caseId, q.id, {
                    questionText: q.questionText,
                    solutionText: q.solutionText,
                    order: q.order,
                })
                toast.success("Savol yangilandi")
            }
        } catch { toast.error("Saqlashda xatolik") }
        finally { setSavingQuestionId(null) }
    }

    const handleDeleteQuestion = async (index: number) => {
        const q = questions[index]
        if (!confirm("Savolni o'chirishni tasdiqlaysizmi?")) return
        try {
            if (q.id) {
                await deleteQuestion(caseId, q.id)
                toast.success("O'chirildi")
            }
            setQuestions(prev => prev.filter((_, i) => i !== index))
        } catch { toast.error("O'chirishda xatolik") }
    }

    const handleReorderQuestion = (index: number, dir: 'up' | 'down') => {
        const newList = [...questions]
        const targetIndex = dir === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newList.length) return
            ;[newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]]
        // Update orders
        newList.forEach((q, i) => { q.order = i + 1 })
        setQuestions(newList)
    }

    // ──────────────────────────────────────
    //  Render
    // ──────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                <p className="text-slate-500 font-medium">Yuklanmoqda...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* ── Sticky Header ── */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b border-slate-100 -mx-8 px-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost" size="icon"
                        onClick={() => router.push(`/admin/cases/${subjectId}`)}
                        className="rounded-xl hover:bg-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 truncate max-w-[340px]">
                            {title || (isNew ? "Yangi kazus" : "Kazus muharriri")}
                        </h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            {isNew ? "Yangi kazus yaratish" : "Kazus muharriri"}
                        </p>
                    </div>
                </div>
                <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 shadow-lg shadow-teal-600/20 gap-2 font-bold"
                    onClick={handleSaveCase}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isNew ? "Yaratish" : "Saqlash"}
                </Button>
            </div>

            {/* ── Kazus sarlavhasi ── */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Kazus sarlavhasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Kazus sarlavhasini kiriting..."
                        className="h-12 text-lg font-semibold border-slate-200 rounded-xl"
                    />
                </CardContent>
            </Card>

            {/* ── Kazus tavsifi ── */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Vaziyat tavsifi
                    </CardTitle>
                    <CardDescription>Kazusning to'liq huquqiy vaziyatini yozing</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <AdvancedEditor value={description} onChange={setDescription} />
                </CardContent>
            </Card>

            {/* ── Kirish turi & narx ── */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500" />
                        Kirish turi va narxi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        {/* type selector */}
                        <div className="space-y-1.5 flex-1">
                            <Label className="text-sm font-semibold text-slate-700">Turi</Label>
                            <Select value={type} onValueChange={(v) => setType(v as "free" | "premium")}>
                                <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-teal-50 text-teal-700 border-none text-xs">Bepul</Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="premium">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-amber-50 text-amber-700 border-none text-xs">⭐ Premium</Badge>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === "premium" && (
                            <div className="space-y-1.5 flex-1">
                                <Label className="text-sm font-semibold text-slate-700">Narxi (coins)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={price}
                                    onChange={e => setPrice(Number(e.target.value))}
                                    placeholder="0"
                                    className="h-11 border-slate-200 rounded-xl"
                                />
                            </div>
                        )}
                    </div>

                    {/* Free after date — only for free type */}
                    {type === "free" && (
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Yechim ko'rish boshlanish vaqti (ixtiyoriy)
                            </Label>
                            <p className="text-xs text-slate-500">
                                Bo'sh qoldirsangiz — yechim darhol ko'rinadi. Sana belgilasangiz — faqat o'sha vaqtdan keyin.
                            </p>
                            <Input
                                type="datetime-local"
                                value={freeAfterDate}
                                onChange={e => setFreeAfterDate(e.target.value)}
                                className="h-11 border-slate-200 rounded-xl w-64"
                            />
                            {freeAfterDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-rose-500 text-xs px-0"
                                    onClick={() => setFreeAfterDate("")}
                                >
                                    Sanani tozalash (darhol ko'rinsin)
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Savollar va Yechimlar ── */}
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-teal-600" />
                            Savollar va Yechimlar
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Har bir savol va uning huquqiy yechimini kiriting
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addLocalQuestion}
                        className="border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Savol qo'shish
                    </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {questions.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-3">
                            <HelpCircle className="w-10 h-10 text-slate-200" />
                            <p className="text-slate-400 text-sm">Hali hech qanday savol qo'shilmagan.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addLocalQuestion}
                                className="rounded-xl text-teal-600 border-teal-200 hover:bg-teal-50"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Birinchi savolni qo'shish
                            </Button>
                        </div>
                    )}

                    {questions.map((q, index) => (
                        <div
                            key={index}
                            className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                        >
                            {/* Question card header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="ghost" size="icon"
                                            className="w-5 h-5 rounded text-slate-400 hover:text-teal-600"
                                            disabled={index === 0}
                                            onClick={() => handleReorderQuestion(index, 'up')}
                                        >
                                            <MoveUp className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="icon"
                                            className="w-5 h-5 rounded text-slate-400 hover:text-teal-600"
                                            disabled={index === questions.length - 1}
                                            onClick={() => handleReorderQuestion(index, 'down')}
                                        >
                                            <MoveDown className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600">
                                        Savol #{index + 1}
                                    </span>
                                    {q.id ? (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">Saqlangan</Badge>
                                    ) : (
                                        <Badge className="bg-amber-50 text-amber-600 border-none text-[10px]">Yangi</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        className="h-7 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs px-3"
                                        onClick={() => handleSaveQuestion(index)}
                                        disabled={savingQuestionId === `${index}`}
                                    >
                                        {savingQuestionId === `${index}`
                                            ? <Loader2 className="w-3 h-3 animate-spin" />
                                            : <Save className="w-3 h-3 mr-1" />
                                        }
                                        Saqlash
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                        onClick={() => handleDeleteQuestion(index)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Question text editor */}
                            <div className="p-5 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Savol matni
                                    </Label>
                                    <AdvancedEditor
                                        value={q.questionText}
                                        onChange={(val) => updateLocalQuestion(index, 'questionText', val)}
                                    />
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="h-px flex-1 bg-teal-100" />
                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Yechim</span>
                                    <div className="h-px flex-1 bg-teal-100" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Yechim matnini kiriting
                                    </Label>
                                    <div className={cn(
                                        "rounded-xl border p-1",
                                        type === "premium"
                                            ? "border-amber-200 bg-amber-50/30"
                                            : "border-teal-100 bg-teal-50/20"
                                    )}>
                                        {type === "premium" && (
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-amber-600 flex items-center gap-1.5">
                                                <Star className="w-3 h-3 fill-amber-500" /> Premium foydalanuvchilar uchun
                                            </div>
                                        )}
                                        <AdvancedEditor
                                            value={q.solutionText}
                                            onChange={(val) => updateLocalQuestion(index, 'solutionText', val)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {questions.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={addLocalQuestion}
                            className="w-full rounded-xl border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-teal-600 hover:border-teal-300"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Yangi savol qo'shish
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
