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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { addTopic, getTopics, uploadMindmap, updateTopic, deleteTopic } from "@/services/firestore"
import { Topic } from "@/types"
import { cn } from "@/lib/utils"

export default function SubjectDetailPage() {
    const { subjectId } = useParams()
    const router = useRouter()
    const [topics, setTopics] = useState<Topic[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null)

    // New Topic State
    const [newTopic, setNewTopic] = useState({
        title: "",
        content: "",
        firstPrinciples: "",
        order: 1,
        mindmapUrl: ""
    })
    const [mindmapFile, setMindmapFile] = useState<File | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setMindmapFile(file)

            setUploadingImage(true)
            try {
                const url = await uploadMindmap(file)
                setNewTopic({ ...newTopic, mindmapUrl: url })
            } catch (error) {
                console.error("Upload error:", error)
            } finally {
                setUploadingImage(false)
            }
        }
    }

    const handleSaveTopic = async () => {
        if (!newTopic.title) return

        setIsSaving(true)
        try {
            if (editingTopicId) {
                await updateTopic(subjectId as string, editingTopicId, newTopic)
            } else {
                await addTopic(subjectId as string, {
                    ...newTopic,
                    order: topics.length + 1
                })
            }
            setShowAddModal(false)
            setEditingTopicId(null)
            setNewTopic({ title: "", content: "", firstPrinciples: "", order: 1, mindmapUrl: "" })
            setMindmapFile(null)
            loadTopics()
        } catch (error) {
            console.error("Save error:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditTopic = (topic: Topic) => {
        setEditingTopicId(topic.id)
        setNewTopic({
            title: topic.title,
            content: topic.content,
            firstPrinciples: topic.firstPrinciples,
            order: topic.order,
            mindmapUrl: topic.mindmapUrl || ""
        })
        setShowAddModal(true)
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

                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 gap-2"
                            onClick={() => {
                                setEditingTopicId(null)
                                setNewTopic({ title: "", content: "", firstPrinciples: "", order: 1, mindmapUrl: "" })
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Yangi mavzu</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-teal-600 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                {editingTopicId ? <Edit2 className="w-32 h-32" /> : <Plus className="w-32 h-32" />}
                            </div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">
                                    {editingTopicId ? "Mavzuni tahrirlash" : "Yangi mavzu yaratish"}
                                </DialogTitle>
                                <DialogDescription className="text-teal-100 mt-1">
                                    Mavzu tarkibi, metodikasi va vizual materiallarini {editingTopicId ? "o'zgartiring" : "qo'shing"}.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-8 bg-white">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-teal-600" />
                                        Mavzu nomi
                                    </Label>
                                    <Input
                                        placeholder="Mavzu sarlavhasini kiriting..."
                                        value={newTopic.title}
                                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                        className="h-12 border-slate-200 focus:ring-teal-500 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-teal-600" />
                                        Mindmap (Rasm)
                                    </Label>
                                    <div className="flex gap-3">
                                        <div
                                            className={cn(
                                                "flex-1 h-12 border border-dashed border-slate-300 rounded-xl flex items-center px-4 cursor-pointer hover:bg-slate-50 transition-colors",
                                                newTopic.mindmapUrl && "border-teal-300 bg-teal-50"
                                            )}
                                            onClick={() => document.getElementById('map-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="text-sm text-slate-500 truncate">
                                                {uploadingImage ? "Yuklanmoqda..." : (mindmapFile?.name || "Rasm tanlang...")}
                                            </span>
                                            <input
                                                id="map-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                        {newTopic.mindmapUrl && (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none flex items-center gap-1 rounded-xl px-3">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Yuklandi
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-3">
                                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-teal-600" />
                                    Asosiy tushuntirish
                                </Label>
                                <AdvancedEditor
                                    value={newTopic.content}
                                    onChange={(val) => setNewTopic({ ...newTopic, content: val })}
                                />
                            </div>

                            {/* Methodology */}
                            <div className="space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                <Label className="text-slate-700 font-bold flex items-center gap-2 text-base">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    First Principles / Metodika (Justin Sung uslubi)
                                </Label>
                                <p className="text-sm text-slate-500 mb-4">Ushbu qismda mavzuni "Justin Sung" uslubida chuqurlashtirilgan tahlili yoziladi.</p>
                                <AdvancedEditor
                                    value={newTopic.firstPrinciples}
                                    onChange={(val) => setNewTopic({ ...newTopic, firstPrinciples: val })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl px-6"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 shadow-lg shadow-teal-600/20 gap-2"
                                    onClick={handleSaveTopic}
                                    disabled={isSaving || uploadingImage}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Mavzuni saqlash</span>
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
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
                            onClick={() => setShowAddModal(true)}
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
                                        onClick={() => handleEditTopic(topic)}
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
