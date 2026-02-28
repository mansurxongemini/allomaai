"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import {
    Plus,
    ChevronLeft,
    BookOpen,
    Layout,
    Sparkles,
    Upload,
    Image as ImageIcon,
    Save,
    Trash2,
    MoveUp,
    MoveDown,
    Loader2,
    CheckCircle2,
    FileText,
    Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getTopics, updateTopic, deleteTopic } from "@/services/firestore"
import { Topic } from "@/types"
import { cn } from "@/lib/utils"

export default function SubjectDetailPage() {
    const { subjectId } = useParams()
    const router = useRouter()
    const [topics, setTopics] = useState<Topic[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    useEffect(() => {
        if (subjectId) {
            loadTopics()
        }
    }, [subjectId])

    const loadTopics = async () => {
        try {
            const data = await getTopics(subjectId as string)
            setTopics(data)
        } catch (error) {
            console.error("Error loading topics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTopic = async (topicId: string) => {
        if (!confirm("Haqiqatan ham ushbu mavzuni o'chirmoqchimisiz?")) return

        try {
            await deleteTopic(subjectId as string, topicId)
            loadTopics()
        } catch (error) {
            console.error("Delete error:", error)
        }
    }

    const handleReorder = async (topicId: string, direction: 'up' | 'down') => {
        const index = topics.findIndex(t => t.id === topicId)
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === topics.length - 1) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const currentTopic = topics[index]
        const targetTopic = topics[targetIndex]

        try {
            await updateTopic(subjectId as string, currentTopic.id, { order: targetTopic.order })
            await updateTopic(subjectId as string, targetTopic.id, { order: currentTopic.order })
            loadTopics()
        } catch (error) {
            console.error("Reorder error:", error)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl hover:bg-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mavzular boshqaruvi</h1>
                        <p className="text-slate-500 text-sm">Fandagi mavzular ketma-ketligi va kontentini tahrirlash</p>
                    </div>
                </div>

                <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 gap-2"
                    onClick={() => router.push(`/admin/subjects/${subjectId}/new`)}
                >
                    <Plus className="w-4 h-4" />
                    <span>Yangi mavzu</span>
                </Button>
            </div>

            {/* List of Topics */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500 font-medium">Mavzular yuklanmoqda...</p>
                </div>
            ) : topics.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 py-20 text-center shadow-none bg-slate-50/30">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Mavzular hali yo'q</h3>
                        <p className="text-slate-500">Ushbu fanga hali hech qanday mavzu qo'shilmagan. Birinchi mavzuni qo'shing.</p>
                        <Button
                            className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-none rounded-xl"
                            onClick={() => router.push(`/admin/subjects/${subjectId}/new`)}
                        >
                            Yangi mavzu qo'shish
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {topics.map((topic, index) => (
                        <Card key={topic.id} className="group border-slate-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-600/5 transition-all duration-300 overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 lg:p-6">
                                {/* Order Controls */}
                                <div className="flex flex-row sm:flex-col items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        onClick={() => handleReorder(topic.id, 'up')}
                                        disabled={index === 0}
                                    >
                                        <MoveUp className="w-4 h-4" />
                                    </Button>
                                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700 font-bold text-lg shadow-sm border border-teal-100">
                                        {topic.order}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        onClick={() => handleReorder(topic.id, 'down')}
                                        disabled={index === topics.length - 1}
                                    >
                                        <MoveDown className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Content Info */}
                                <div className="flex-1 space-y-1">
                                    <h3
                                        className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/subjects/${subjectId}/${topic.id}`)}
                                    >
                                        {topic.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 rounded-lg gap-1.5 px-3 py-1 font-normal">
                                            <Layout className="w-3.5 h-3.5" />
                                            {topic.content.length > 500 ? "Batafsil kontent" : "Qisqa kontent"}
                                        </Badge>
                                        <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 rounded-lg gap-1.5 px-3 py-1 font-normal">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Metodika mavjud
                                        </Badge>
                                        {topic.mindmapUrl && (
                                            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 rounded-lg gap-1.5 px-3 py-1 font-normal">
                                                <ImageIcon className="w-3.5 h-3.5" />
                                                Mindmap
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                        onClick={() => router.push(`/admin/subjects/${subjectId}/${topic.id}`)}
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => handleDeleteTopic(topic.id)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
