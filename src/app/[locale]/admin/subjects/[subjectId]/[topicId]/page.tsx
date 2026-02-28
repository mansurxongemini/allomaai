"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import {
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    Video,
    Image as ImageIcon,
    Upload,
    HelpCircle,
    CheckCircle2,
    Loader2,
    Layout,
    Sparkles,
    FileText,
    BrainCircuit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { getTopicDetail, updateTopic, uploadMindmap, addTopic, getTopics } from "@/services/firestore"
import { Topic, Quiz } from "@/types"
import { cn } from "@/lib/utils"
import NextImage from "next/image"

export default function TopicDetailPage() {
    const { subjectId, topicId } = useParams()
    const router = useRouter()

    const [topic, setTopic] = useState<Topic | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [uploadingMedia, setUploadingMedia] = useState<'video' | 'image' | 'mindmap' | null>(null)

    // Form State
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [firstPrinciples, setFirstPrinciples] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [mindmapUrl, setMindmapUrl] = useState("")
    const [quizzes, setQuizzes] = useState<Quiz[]>([])

    useEffect(() => {
        if (subjectId && topicId) {
            loadTopicDetail()
        }
    }, [subjectId, topicId])

    const loadTopicDetail = async () => {
        if (topicId === 'new') {
            setIsLoading(false)
            // Optionally fetch topics to get the next order
            try {
                const existingTopics = await getTopics(subjectId as string)
                setTopic({ order: existingTopics.length + 1 } as Topic)
            } catch (error) {
                console.error("Error fetching topics for order:", error)
                setTopic({ order: 1 } as Topic)
            }
            return
        }

        try {
            const data = await getTopicDetail(subjectId as string, topicId as string)
            if (data) {
                setTopic(data)
                setTitle(data.title)
                setContent(data.content || "")
                setFirstPrinciples(data.firstPrinciples || "")
                setVideoUrl(data.videoUrl || "")
                setMindmapUrl(data.mindmapUrl || "")
                setQuizzes(data.quizzes || [])
            }
        } catch (error) {
            console.error("Error loading topic detail:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image' | 'mindmap') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadingMedia(type)
            try {
                // For simplicity, we use uploadMindmap as a general upload service for now
                const url = await uploadMindmap(file)
                if (type === 'video') setVideoUrl(url)
                if (type === 'mindmap') setMindmapUrl(url)
            } catch (error) {
                console.error(`${type} upload error:`, error)
            } finally {
                setUploadingMedia(null)
            }
        }
    }

    const handleAddQuiz = (type: 'open' | 'closed') => {
        const newQuiz: Quiz = {
            id: Math.random().toString(36).substr(2, 9),
            question: "",
            type,
            options: type === 'closed' ? ["", "", "", ""] : undefined,
            correctAnswer: type === 'closed' ? "" : undefined,
        }
        setQuizzes([...quizzes, newQuiz])
    }

    const handleUpdateQuiz = (id: string, updates: Partial<Quiz>) => {
        setQuizzes(quizzes.map(q => q.id === id ? { ...q, ...updates } : q))
    }

    const handleRemoveQuiz = (id: string) => {
        setQuizzes(quizzes.filter(q => q.id !== id))
    }

    const handleSave = async () => {
        if (!title) return
        setIsSaving(true)
        try {
            // Firestore doesn't accept 'undefined'. We must remove undefined fields from quizzes.
            const sanitizedQuizzes = quizzes.map(quiz => {
                const cleaned: any = { ...quiz }
                Object.keys(cleaned).forEach(key => {
                    if (cleaned[key] === undefined) {
                        delete cleaned[key]
                    }
                })
                return cleaned
            })

            const topicData = {
                title,
                content,
                firstPrinciples,
                videoUrl,
                mindmapUrl,
                quizzes: sanitizedQuizzes,
                updatedAt: new Date()
            }

            if (topicId === 'new') {
                await addTopic(subjectId as string, {
                    ...topicData,
                    order: topic?.order || 1
                })
            } else {
                await updateTopic(subjectId as string, topicId as string, topicData)
            }
            router.push(`/admin/subjects/${subjectId}`)
        } catch (error) {
            console.error("Save error:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                <p className="text-slate-500 font-medium">Mavzu tafsilotlari yuklanmoqda...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 truncate max-w-[300px]">{title || "Nomsiz mavzu"}</h1>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Mavzu muharriri</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 shadow-lg shadow-teal-600/20 gap-2 font-bold transition-all"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Saqlash
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Basic Info Card */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-teal-600" />
                            Mavzu nomi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Mavzu sarlavhasini kiriting..."
                            className="h-12 text-lg font-semibold border-slate-200 rounded-xl focus:ring-teal-500"
                        />
                    </CardContent>
                </Card>

                {/* Content Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Layout className="w-5 h-5 text-teal-600" />
                            Asosiy kontent (Matn)
                        </CardTitle>
                        <CardDescription>Mavzu yuzasidan barcha nazariy ma'lumotlar va maxsus muharrir.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <AdvancedEditor value={content} onChange={setContent} />
                    </CardContent>
                </Card>

                {/* Methodology Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl bg-teal-50/30 border-teal-100">
                    <CardHeader className="border-b border-teal-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-teal-900">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            First Principles (Metodika)
                        </CardTitle>
                        <CardDescription className="text-teal-700/70">Justin Sung uslubidagi chuqurlashtirilgan tahlil bloki.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <AdvancedEditor value={firstPrinciples} onChange={setFirstPrinciples} />
                    </CardContent>
                </Card>

                {/* Media Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Video Upload Card */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Video className="w-5 h-5 text-teal-600" />
                                Video darslik
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {videoUrl ? (
                                <div className="space-y-3">
                                    <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden relative group">
                                        <video src={videoUrl} controls className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="destructive" size="sm" onClick={() => setVideoUrl("")} className="rounded-lg h-8">
                                                <Trash2 className="w-4 h-4 mr-2" /> O'chirish
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer"
                                    onClick={() => document.getElementById('video-upload')?.click()}
                                >
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                        {uploadingMedia === 'video' ? <Loader2 className="w-6 h-6 animate-spin text-teal-600" /> : <Upload className="w-6 h-6 text-slate-400" />}
                                    </div>
                                    <p className="text-sm font-bold text-slate-600">Video yuklash</p>
                                    <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Image Upload Card */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-teal-600" />
                                Mavzu rasmi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <Plus className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">Rasm qo'shish</p>
                                <input id="image-upload" type="file" className="hidden" accept="image/*" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quiz Builder Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-teal-600" />
                                Quizlar va Testlar
                            </CardTitle>
                            <CardDescription>Ochiq va yopiq turdagi test savollari.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleAddQuiz('closed')} className="rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50">
                                + Yopiq test
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleAddQuiz('open')} className="rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50">
                                + Ochiq savol
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {quizzes.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center gap-3">
                                <HelpCircle className="w-10 h-10 text-slate-200" />
                                <p className="text-slate-400 text-sm">Hali hech qanday savol qo'shilmagan.</p>
                            </div>
                        ) : (
                            quizzes.map((quiz, idx) => (
                                <div key={quiz.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveQuiz(quiz.id)} className="text-rose-500 hover:bg-rose-50 h-8 w-8">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className={cn(
                                            "border-none px-3",
                                            quiz.type === 'closed' ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {quiz.type === 'closed' ? "Yopiq Test" : "Ochiq Savol (AI)"}
                                        </Badge>
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Savol #{idx + 1}</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500">Savol matni</Label>
                                            <Input
                                                value={quiz.question}
                                                onChange={(e) => handleUpdateQuiz(quiz.id, { question: e.target.value })}
                                                placeholder="Savol matnini kiriting..."
                                                className="border-slate-200 rounded-xl"
                                            />
                                        </div>

                                        {quiz.type === 'closed' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {quiz.options?.map((opt, optIdx) => (
                                                    <div key={optIdx} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Variant {String.fromCharCode(65 + optIdx)}</Label>
                                                            <input
                                                                type="radio"
                                                                name={`correct-${quiz.id}`}
                                                                checked={quiz.correctAnswer === opt && opt !== ""}
                                                                onChange={() => handleUpdateQuiz(quiz.id, { correctAnswer: opt })}
                                                                className="text-teal-600"
                                                            />
                                                        </div>
                                                        <Input
                                                            value={opt}
                                                            onChange={(e) => {
                                                                const newOpts = [...(quiz.options || [])]
                                                                newOpts[optIdx] = e.target.value
                                                                handleUpdateQuiz(quiz.id, { options: newOpts })
                                                            }}
                                                            placeholder={`Variant ${String.fromCharCode(65 + optIdx)}...`}
                                                            className="h-10 border-slate-100 bg-white rounded-lg text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {quiz.type === 'open' && (
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                                <p className="text-[10px] text-amber-700 font-bold uppercase mb-1">AI Tekshiruv</p>
                                                <p className="text-xs text-amber-600">Ushbu savol javobi sun'iy intellekt tomonidan tahlil qilinadi va baholanadi.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Mindmap Card - At the end as requested */}
                <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-teal-600" />
                            Mindmap (Xaritalash)
                        </CardTitle>
                        <CardDescription>Mavzuning grafik xaritasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {mindmapUrl ? (
                            <div className="space-y-3">
                                <div className="aspect-auto min-h-[300px] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden relative group">
                                    <div className="relative w-full aspect-[16/9]">
                                        <NextImage src={mindmapUrl} alt="Mindmap" fill className="object-contain" sizes="100vw" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="destructive" size="sm" onClick={() => setMindmapUrl("")} className="rounded-lg h-8">
                                            <Trash2 className="w-4 h-4 mr-2" /> O'chirish
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer"
                                onClick={() => document.getElementById('mindmap-upload-detail')?.click()}
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <BrainCircuit className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">Mindmap yuklash</p>
                                <input id="mindmap-upload-detail" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'mindmap')} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
