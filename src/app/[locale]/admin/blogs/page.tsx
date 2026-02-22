import { useState } from "react"
import { Plus, Edit2, Trash2, Eye, PenTool, MoreVertical, Calendar, User, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
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

const mockBlogs = [
    {
        id: "1",
        title: "Yuridik ta'limda yangi tendensiyalar",
        author: "Admin",
        status: "Chop etilgan",
        date: "2026-02-22"
    },
    {
        id: "2",
        title: "O'zbekistonning yangi investitsiya muhiti",
        author: "Sardorbek",
        status: "Qoralama",
        date: "2026-02-21"
    },
    {
        id: "3",
        title: "Advokatlar uchun 5 ta foydali maslahat",
        author: "Admin",
        status: "Kutilmoqda",
        date: "2026-02-20"
    },
    {
        id: "4",
        title: "Jinoyat kodeksidagi yangi o'zgarishlar",
        author: "Mansurxon",
        status: "Chop etilgan",
        date: "2026-02-19"
    }
]

export default function BlogsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newBlog, setNewBlog] = useState({ title: "", content: "" })

    const handleSaveBlog = () => {
        console.log("Saving blog:", newBlog)
        setIsCreateModalOpen(false)
        setNewBlog({ title: "", content: "" })
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
                            >
                                <X className="w-4 h-4 mr-2" />
                                Bekor qilish
                            </Button>
                            <Button
                                onClick={handleSaveBlog}
                                disabled={!newBlog.title || !newBlog.content}
                                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 shadow-lg shadow-teal-600/10"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Saqlash
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
                            {mockBlogs.map((blog) => (
                                <TableRow key={blog.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors">
                                    <TableCell className="py-4 pl-6 max-w-[300px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                                <PenTool className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-800 line-clamp-1 text-sm">{blog.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            {blog.author}
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
                                            {blog.date}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
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
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Statistikani ko'rish</DropdownMenuItem>
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
