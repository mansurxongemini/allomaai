"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2, Lightbulb } from "lucide-react"
import { useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getMethods, addMethod, deleteMethod } from "@/services/firestore"
import { Method } from "@/types"

export default function MethodsPage() {
    const router = useRouter()
    const [methods, setMethods] = useState<Method[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [newMethodName, setNewMethodName] = useState("")
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        loadMethods()
    }, [])

    const loadMethods = async () => {
        try {
            const data = await getMethods()
            setMethods(data)
        } catch (error) {
            console.error("Error loading methods:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddMethod = async () => {
        if (!newMethodName.trim()) return
        setIsAdding(true)
        try {
            await addMethod({ name: newMethodName })
            setNewMethodName("")
            loadMethods()
        } catch (error) {
            console.error("Error adding method:", error)
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, methodId: string) => {
        e.stopPropagation()
        if (!confirm("Haqiqatan ham ushbu metodni o'chirmoqchimisiz?")) return
        try {
            await deleteMethod(methodId)
            loadMethods()
        } catch (error) {
            console.error("Error deleting method:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Metodlar boshqaruvi</h1>
                    <p className="text-slate-500 text-sm mt-1">Platformadagi barcha metodlarni boshqarishingiz mumkin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Yangi metod nomi..."
                        value={newMethodName}
                        onChange={(e) => setNewMethodName(e.target.value)}
                        className="w-64 border-slate-200 rounded-xl"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMethod()}
                    />
                    <Button
                        onClick={handleAddMethod}
                        disabled={isAdding}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 w-fit"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Qo'shish</span>
                    </Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                            <p className="text-slate-500 font-medium text-sm">Metodlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-200">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700">Metod nomi</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Darslar soni</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Holati</TableHead>
                                    <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {methods.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-20 text-center text-slate-500">
                                            Hali hech qanday metod qo'shilmagan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    methods.map((method) => (
                                        <TableRow
                                            key={method.id}
                                            className="hover:bg-slate-50/50 border-slate-100 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/admin/methods/${method.id}`)}
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                                        <Lightbulb className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium text-slate-800">{method.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="text-slate-600 text-sm">{method.topicsCount || 0} ta dars</span>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors",
                                                        method.status === "Faol"
                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {method.status || 'Faol'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                                    onClick={(e) => handleDelete(e, method.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
