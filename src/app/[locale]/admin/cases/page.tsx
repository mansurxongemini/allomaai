"use client"

import { Plus, Edit2, Trash2, Scale, MoreVertical, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const mockCases = [
    { id: "1", name: "Mulk huquqi nizosi", subject: "Fuqarolik huquqi", questionsCount: 5, type: "Premium" },
    { id: "2", name: "Mansab vakolatini suiiste'mol qilish", subject: "Jinoyat huquqi", questionsCount: 8, type: "Bepul" },
    { id: "3", name: "Intizomiy javobgarlikka tortish", subject: "Mehnat huquqi", questionsCount: 4, type: "Premium" },
    { id: "4", name: "Saylov huquqi buzilishi", subject: "Konstitutsiyaviy huquq", questionsCount: 12, type: "Bepul" },
    { id: "5", name: "Ma'muriy jarima nizosi", subject: "Ma'muriy huquqi", questionsCount: 6, type: "Premium" },
]

export default function CasesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kazuslar bazasi</h1>
                    <p className="text-slate-500 text-sm mt-1">Platformadagi barcha kazuslarni boshqarishingiz va yangilarini qo'shishingiz mumkin.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2 w-fit">
                    <Plus className="w-4 h-4" />
                    <span>Yangi kazus qo'shish</span>
                </Button>
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-200">
                                <TableHead className="py-4 pl-6 font-semibold text-slate-700">Kazus nomi</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Tegishli fan</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Savollar soni</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Turi</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakatlar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCases.map((caseItem) => (
                                <TableRow key={caseItem.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                                <Scale className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-slate-800">{caseItem.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-slate-600 text-sm">{caseItem.subject}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-slate-600 text-sm">{caseItem.questionsCount} ta savol</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors flex items-center gap-1 w-fit",
                                                caseItem.type === "Premium"
                                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                    : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                                            )}
                                        >
                                            {caseItem.type === "Premium" && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                                            {caseItem.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-left">
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-lg">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1.5 border-slate-200">
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Tahrirlash</DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Savollarni ko'rish</DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-rose-50 focus:text-rose-600">O'chirish</DropdownMenuItem>
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
