"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Plus, Edit2, Trash2, Eye, PenTool, MoreVertical, Calendar, User, Save, X, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { db } from "@/lib/firebase"
import { compressImageToBase64 } from "@/lib/utils"
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc
} from "firebase/firestore"
import { useEffect } from "react"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

// Firestore types
interface Blog {
    id: string
    title: string
    excerpt: string
    content: string
    imageUrl: string
    isPremium: boolean
    tags: string[]
    authorName: string
    authorImage: string
    status: string
    createdAt: any
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newBlog, setNewBlog] = useState({
        title: "",
        excerpt: "",
        content: "",
        isPremium: false,
        tags: "",
        imageFile: null as File | null
    })

    useEffect(() => {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blogsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Blog[]
            setBlogs(blogsData)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const { currentUser } = useAuth()

    const handleSaveBlog = async () => {
        if (!newBlog.title || !newBlog.content) {
            toast.error("Iltimos, barcha maydonlarni to'ldiring")
            return
        }

        setIsSaving(true)
        try {
            // Upload image if present
            let imageUrl = ""
            if (newBlog.imageFile) {
                try {
                    imageUrl = await compressImageToBase64(newBlog.imageFile)
                } catch (error) {
                    console.error("Error compressing image:", error)
                    toast.error("Rasm qisqartirishda xatolik yuz berdi, lekin maqola rasmsiz saqlanmoqda...")
                }
            }

            // Save to Firestore
            await addDoc(collection(db, "blogs"), {
                title: newBlog.title,
                excerpt: newBlog.excerpt,
                content: newBlog.content,
                imageUrl,
                isPremium: newBlog.isPremium,
                tags: newBlog.tags.split(",").map(tag => tag.trim()),
                authorName: currentUser?.displayName || "Admin",
                authorImage: currentUser?.photoURL || "",
                status: "Chop etilgan",
                createdAt: serverTimestamp()
            })

            toast.success("Blog muvaffaqiyatli yaratildi")
            setIsCreateModalOpen(false)
            setNewBlog({
                title: "",
                excerpt: "",
                content: "",
                isPremium: false,
                tags: "",
                imageFile: null
            })
        } catch (error) {
            console.error("Error saving blog:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteBlog = async (id: string) => {
        if (window.confirm("Rostdan ham ushbu blogni o'chirmoqchimisiz?")) {
            try {
                await deleteDoc(doc(db, "blogs", id))
                toast.success("Blog o'chirildi")
            } catch (error) {
                console.error("Error deleting blog:", error)
                toast.error("O'chirishda xatolik yuz berdi")
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bloglar boshqaruvi</h1>
                    <p className="text-slate-500 text-sm mt-1">Platformadagi barcha erkin blog maqolalarini boshqaring.</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 w-fit">
                            <Plus className="w-4 h-4" />
                            <span>Yangi blog yozish</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-slate-900">Yangi maqola yaratish</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Blog posti uchun sarlavha va kontentni kiriting.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Maqola sarlavhasi</Label>
                                    <Input
                                        id="title"
                                        placeholder="Sarlavhani kiriting..."
                                        value={newBlog.title}
                                        onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-teal-500/20 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-sm font-semibold text-slate-700">Asosiy rasm</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setNewBlog({ ...newBlog, imageFile: e.target.files?.[0] || null })}
                                            className="h-11 border-slate-200 focus:ring-teal-500/20 rounded-xl cursor-pointer pt-2"
                                        />
                                        {newBlog.imageFile && <ImageIcon className="text-teal-600 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="excerpt" className="text-sm font-semibold text-slate-700">Qisqacha matn (Excerpt)</Label>
                                <Textarea
                                    id="excerpt"
                                    placeholder="Maqola haqida qisqacha..."
                                    value={newBlog.excerpt}
                                    onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                                    className="min-h-[100px] border-slate-200 focus:ring-teal-500/20 rounded-xl resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tags" className="text-sm font-semibold text-slate-700">Teglar (vergul bilan ajrating)</Label>
                                    <Input
                                        id="tags"
                                        placeholder="huquq, mantiq, tahlil"
                                        value={newBlog.tags}
                                        onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
                                        className="h-11 border-slate-200 focus:ring-teal-500/20 rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-semibold text-slate-700">Premium Maqola</Label>
                                        <p className="text-xs text-slate-500">Faqat obunachilar ko'ra oladi</p>
                                    </div>
                                    <Switch
                                        checked={newBlog.isPremium}
                                        onCheckedChange={(checked) => setNewBlog({ ...newBlog, isPremium: checked })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">Maqola matni</Label>
                                <AdvancedEditor
                                    value={newBlog.content}
                                    onChange={(content) => setNewBlog({ ...newBlog, content })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="border-t border-slate-100 pt-4 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl border-slate-200"
                                disabled={isSaving}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Bekor qilish
                            </Button>
                            <Button
                                onClick={handleSaveBlog}
                                disabled={!newBlog.title || !newBlog.content || isSaving}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 shadow-lg shadow-teal-600/10 min-w-[140px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saqlanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Saqlash
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-200">
                                <TableHead className="py-4 pl-6 font-semibold text-slate-700">Blog Sarlavhasi</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Muallif</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Holati</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Sana</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
                                        <p className="text-sm text-slate-500 mt-2">Ma'lumotlar yuklanmoqda...</p>
                                    </TableCell>
                                </TableRow>
                            ) : blogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center text-slate-500">
                                        Bloglar topilmadi.
                                    </TableCell>
                                </TableRow>
                            ) : blogs.map((blog) => (
                                <TableRow key={blog.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors">
                                    <TableCell className="py-4 pl-6 max-w-[300px]">
                                        <div className="flex items-center gap-3">
                                            {blog.imageUrl ? (
                                                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                                                    <Image src={blog.imageUrl} alt="" fill className="object-cover" sizes="36px" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                                    <PenTool className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-slate-800 line-clamp-1 text-sm">{blog.title}</span>
                                                <div className="flex gap-1 mt-0.5">
                                                    {blog.isPremium && <Badge className="text-[9px] h-3.5 bg-amber-500">Premium</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            {blog.authorName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="secondary" className={cn(
                                            "rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                            blog.status === "Chop etilgan" ? "bg-emerald-50 text-emerald-700" :
                                                blog.status === "Qoralama" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"
                                        )}>
                                            {blog.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                            {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : "Hozirgina"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteBlog(blog.id)}
                                                className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 rounded-lg">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 border-slate-200">
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Tahrirlash</DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">O'chirish</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
