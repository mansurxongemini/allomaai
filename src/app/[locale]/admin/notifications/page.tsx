"use client"

import { useState } from "react"
import {
    Bell,
    Send,
    Users,
    Star,
    User,
    Info,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Trash2,
    Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import MiniEditor from "@/components/ui/editor/MiniEditor"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const mockHistory = [
    {
        id: "1",
        title: "Yangi dars qo'shildi!",
        audience: "Barchaga",
        type: "Info",
        date: "2026-02-22",
        status: "Yuborilgan"
    },
    {
        id: "2",
        title: "Premium a'zolik chegirmasi",
        audience: "Barcha foydalanuvchilar",
        type: "Success",
        date: "2026-02-21",
        status: "Yuborilgan"
    },
    {
        id: "3",
        title: "Tizimda texnik ishlar",
        audience: "Barchaga",
        type: "Warning",
        date: "2026-02-20",
        status: "Yuborilgan"
    }
]

export default function NotificationsPage() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [audience, setAudience] = useState("all")
    const [type, setType] = useState("info")

    const handleBroadcast = () => {
        alert("Bildirishnoma yuborildi!")
        setTitle("")
        setMessage("")
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bildirishnomalar yuborish</h1>
                <p className="text-slate-500 text-sm mt-1">Platforma foydalanuvchilariga Push yoki In-app xabarlar yuboring.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Form */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg">Yangi xabar yaratish</CardTitle>
                        <CardDescription>Barcha kerakli maydonlarni to'ldiring</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Sarlavha</label>
                                <Input
                                    placeholder="Xabarning qisqacha mazmuni..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-11 border-slate-200 focus:ring-teal-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Kimga yuborilishi</label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="h-11 border-slate-200">
                                        <SelectValue placeholder="Auditoriyani tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Barchaga</SelectItem>
                                        <SelectItem value="premium">Faqat premium obunachilarga</SelectItem>
                                        <SelectItem value="specific">Muayyan talabaga</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Xabar turi</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: "info", label: "Ma'lumot", icon: Info, color: "text-blue-600 bg-blue-50 border-blue-100" },
                                    { id: "success", label: "Muvaffaqiyat", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                                    { id: "warning", label: "Ogohlantirish", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
                                            type === t.id ? t.color + " ring-2 ring-offset-1 ring-current" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        <t.icon className="w-4 h-4" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Xabar matni</label>
                            <MiniEditor
                                value={message}
                                onChange={setMessage}
                                placeholder="Xabarning to'liq matnini kiriting..."
                            />
                        </div>

                        <div className="pt-2">
                            <Button
                                className="w-full md:w-auto h-12 px-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                                onClick={handleBroadcast}
                            >
                                <Send className="w-4 h-4" />
                                Yuborish (Broadcast)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Quick Stats/Info */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-teal-600 text-white overflow-hidden relative">
                        <CardContent className="p-6">
                            <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100/80">Jami obunachilar</span>
                                <h3 className="text-3xl font-bold mt-1">1,240</h3>
                                <p className="text-xs text-teal-100/70 mt-4 leading-relaxed">Oxirgi haftada +85 ta yangi talaba qo'shildi.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="p-4 border-b border-slate-50">
                            <CardTitle className="text-sm font-bold">Xabarlar turlari</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Info className="w-4 h-4" /></div>
                                <div className="text-[11px] text-slate-500"><span className="font-bold text-slate-700 block">Ma'lumot:</span> Yangiliklar va darslar haqida xabardor qilish uchun ishlatiladi.</div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="w-4 h-4" /></div>
                                <div className="text-[11px] text-slate-500"><span className="font-bold text-slate-700 block">Muvaffaqiyat:</span> Yutuqlar va promo-kodlar uchun javob beradi.</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold text-slate-800">Yuborilgan xabarlar tarixi</h2>
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-200">
                                    <TableHead className="py-4 pl-6 font-semibold text-slate-700">Sarlavha</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Kimga</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Tur</TableHead>
                                    <TableHead className="py-4 font-semibold text-slate-700">Sana</TableHead>
                                    <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Holat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockHistory.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/30 border-slate-100 transition-all">
                                        <TableCell className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    item.type === "Info" ? "bg-blue-50 text-blue-600" :
                                                        item.type === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                )}>
                                                    <Send className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-slate-800 text-sm">{item.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                {item.audience}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="outline" className={cn(
                                                "rounded-lg px-2 py-0 text-[10px] font-medium border-transparent shrink-0",
                                                item.type === "Info" ? "bg-blue-50 text-blue-600" :
                                                    item.type === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {item.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                {item.date}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-6 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-[xs] font-bold text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {item.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
