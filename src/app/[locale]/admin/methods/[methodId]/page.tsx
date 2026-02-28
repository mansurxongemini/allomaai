"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/routing"
import {
    Plus, ChevronLeft, Lightbulb, Layout, Sparkles,
    Trash2, MoveUp, MoveDown, Loader2, Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMethodTopics, updateMethodTopic, deleteMethodTopic } from "@/services/firestore"
import { MethodTopic } from "@/types"

export default function MethodDetailPage() {
    const { methodId } = useParams()
    const router = useRouter()
    const [topics, setTopics] = useState<MethodTopic[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (methodId) loadTopics()
    }, [methodId])

    const loadTopics = async () => {
        try {
            const data = await getMethodTopics(methodId as string)
            setTopics(data)
        } catch (error) {
            console.error("Error loading method topics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTopic = async (topicId: string) => {
        if (!confirm("Haqiqatan ham ushbu darsni o'chirmoqchimisiz?")) return
        try {
            await deleteMethodTopic(methodId as string, topicId)
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
            await updateMethodTopic(methodId as string, currentTopic.id, { order: targetTopic.order })
            await updateMethodTopic(methodId as string, targetTopic.id, { order: currentTopic.order })
            loadTopics()
        } catch (error) {
            console.error("Reorder error:", error)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost" size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl hover:bg-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Darslar boshqaruvi</h1>
                        <p className="text-slate-500 text-sm">Metod darslarini tahrirlash va boshqarish</p>
                    </div>
                </div>

                <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/20 gap-2"
                    onClick={() => router.push(`/admin/methods/${methodId}/new`)}
                >
                    <Plus className="w-4 h-4" />
                    <span>Yangi dars</span>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
                    <p className="text-slate-500 font-medium">Darslar yuklanmoqda...</p>
                </div>
            ) : topics.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-200 py-20 text-center shadow-none bg-slate-50/30">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Darslar hali yo'q</h3>
                        <p className="text-slate-500">Ushbu metodga hali hech qanday dars qo'shilmagan.</p>
                        <Button
                            className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-xl"
                            onClick={() => router.push(`/admin/methods/${methodId}/new`)}
                        >
                            Yangi dars qo'shish
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {topics.map((topic, index) => (
                        <Card key={topic.id} className="group border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-600/5 transition-all duration-300 overflow-hidden">
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 lg:p-6">
                                <div className="flex flex-row sm:flex-col items-center gap-1">
                                    <Button variant="ghost" size="icon"
                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                        onClick={() => handleReorder(topic.id, 'up')}
                                        disabled={index === 0}
                                    >
                                        <MoveUp className="w-4 h-4" />
                                    </Button>
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 font-bold text-lg shadow-sm border border-amber-100">
                                        {topic.order}
                                    </div>
                                    <Button variant="ghost" size="icon"
                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                        onClick={() => handleReorder(topic.id, 'down')}
                                        disabled={index === topics.length - 1}
                                    >
                                        <MoveDown className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h3
                                        className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/admin/methods/${methodId}/${topic.id}`)}
                                    >
                                        {topic.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 rounded-lg gap-1.5 px-3 py-1 font-normal">
                                            <Layout className="w-3.5 h-3.5" />
                                            {(topic.content?.length || 0) > 500 ? "Batafsil kontent" : "Qisqa kontent"}
                                        </Badge>
                                        {topic.firstPrinciples && (
                                            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 rounded-lg gap-1.5 px-3 py-1 font-normal">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Metodika mavjud
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon"
                                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                        onClick={() => router.push(`/admin/methods/${methodId}/${topic.id}`)}
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon"
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
