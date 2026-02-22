"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, BookOpen, MoreVertical, Loader2 } from "lucide-react"
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getSubjects, addSubject } from "@/services/firestore"
import { Subject } from "@/types"

export default function SubjectsPage() {
    const router = useRouter()
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newSubjectName, setNewSubjectName] = useState("")
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        loadSubjects()
    }, [])

    const loadSubjects = async () => {
        try {
            const data = await getSubjects()
            setSubjects(data)
        } catch (error) {
            console.error("Error loading subjects:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return
        setIsAdding(true)
        try {
            await addSubject({ name: newSubjectName })
            setNewSubjectName("")
            loadSubjects()
        } catch (error) {
            console.error("Error adding subject:", error)
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Darslar boshqaruvi</h1>
                    <p className="text-slate-500 text-sm mt-1">Platformadagi barcha fanlarni boshqarishingiz mumkin.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Yangi fan nomi..."
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-64 border-slate-200 rounded-xl"
                    />
                    <Button
                        onClick={handleAddSubject}
                        disabled={isAdding}
                        className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 w-fit"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Qo'shish</span>
                    </Button>
                </div>
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                            <p className="text-slate-500 font-medium text-sm">Fanlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-200">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700">Fan nomi</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Mavzular soni</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Holati</TableHead>
                                    <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-20 text-center text-slate-500">
                                            Hali hech qanday fan qo'shilmagan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subjects.map((subject) => (
                                        <TableRow
                                            key={subject.id}
                                            className="hover:bg-slate-50/50 border-slate-100 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/admin/subjects/${subject.id}`)}
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium text-slate-800">{subject.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-slate-600 text-sm">{subject.topicsCount || 0} ta mavzu</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors",
                                                        subject.status === "Faol"
                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {subject.status || 'Faol'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); /* edit logic */ }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                        onClick={(e) => { e.stopPropagation(); /* delete logic */ }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 border-slate-200">
                                                            <DropdownMenuItem
                                                                className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700"
                                                                onClick={() => router.push(`/admin/subjects/${subject.id}`)}
                                                            >
                                                                Mavzularni ko'rish
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Holatni o'zgartirish</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
