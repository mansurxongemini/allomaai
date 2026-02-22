"use client"

import { Trash2, User, FileText, ExternalLink, ShieldCheck, Clock, MoreVertical, Eye } from "lucide-react"
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

const mockArticles = [
    {
        id: "1",
        student: { name: "Mansurxon", email: "mansurxon@alloma.ai" },
        case: "Mulk huquqi nizosi",
        scores: { ai: 45, plagiarism: 2 },
        permission: "Ruxsat berilgan",
        date: "2026-02-22"
    },
    {
        id: "2",
        student: { name: "Zulfiya Ismoilova", email: "zulfiya@student.uz" },
        case: "Jinoyat huquqi savollari",
        scores: { ai: 30, plagiarism: 5 },
        permission: "Ruxsat berilgan",
        date: "2026-02-21"
    },
    {
        id: "3",
        student: { name: "Sardorbek", email: "sardor@alloma.ai" },
        case: "Mehnat huquqi kazusi",
        scores: { ai: 55, plagiarism: 0 },
        permission: "Ruxsat berilgan",
        date: "2026-02-20"
    },
    {
        id: "4",
        student: { name: "Nilufar G'aniyeva", email: "nilufar.g@proton.me" },
        case: "Fuqarolik huquqi tahlili",
        scores: { ai: 65, plagiarism: 12 },
        permission: "Ruxsat berilgan",
        date: "2026-02-19"
    }
]

export default function ArticlesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Barcha chop etilgan maqolalar logi (tarixi)</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Tizim tomonidan avtomatik tasdiqlangan va chop etilgan barcha talabalar ishlari tarixi.
                </p>
            </div>

            {/* Table Section */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-200">
                                <TableHead className="py-4 pl-6 font-semibold text-slate-700">Talaba</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Tegishli Kazus/Savol</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">AI Bahosi / Plagiat</TableHead>
                                <TableHead className="py-4 font-semibold text-slate-700">Muallif ruxsati</TableHead>
                                <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Harakat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockArticles.map((article) => (
                                <TableRow key={article.id} className="hover:bg-slate-50/30 border-slate-100 transition-colors">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 text-sm">{article.student.name}</span>
                                            <span className="text-xs text-slate-400">{article.student.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span>{article.case}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-teal-50 text-teal-700 border-teal-100 shadow-none font-bold">
                                                {article.scores.ai}/100
                                            </Badge>
                                            <span className="text-[10px] text-slate-400 font-medium">|</span>
                                            <Badge variant="outline" className={cn(
                                                "rounded-lg px-2 py-0 text-[10px] font-medium border-transparent shrink-0",
                                                article.scores.plagiarism < 10 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                Plagiat: {article.scores.plagiarism}%
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-1.5">
                                            {article.permission === "Ruxsat berilgan" ? (
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            )}
                                            <span className={cn(
                                                "text-xs font-medium",
                                                article.permission === "Ruxsat berilgan" ? "text-emerald-700" : "text-amber-700"
                                            )}>{article.permission}</span>
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
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-teal-50 focus:text-teal-700">Statistikani ko'rish</DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg cursor-pointer py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700">O'chirish</DropdownMenuItem>
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
