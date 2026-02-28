"use client"

import DOMPurify from "dompurify"
import { formatFirestoreDate } from "@/lib/date-utils"
import { useState, useEffect } from "react"
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
    Calendar,
    Plus,
    Loader2,
    Megaphone
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "sonner"

interface NotificationHistoryItem {
    id: string;
    title: string;
    body: string;
    target: string;
    type: string;
    createdAt: any;
}

export default function NotificationsPage() {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [audience, setAudience] = useState("all")
    const [type, setType] = useState("info")
    const [isSending, setIsSending] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const [history, setHistory] = useState<NotificationHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch History
    useEffect(() => {
        const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedHistory = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as NotificationHistoryItem[]
            setHistory(fetchedHistory)
            setIsLoading(false)
        }, (error) => {
            console.error("Error fetching notifications history:", error)
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim() || message === "<p></p>") {
            toast.error("Iltimos, barcha maydonlarni to'ldiring")
            return
        }

        setIsSending(true)
        try {
            await addDoc(collection(db, "notifications"), {
                title,
                body: message,
                target: audience,
                type,
                readBy: [], // Array to track user IDs who read it
                createdAt: serverTimestamp()
            })

            toast.success("Bildirishnoma muvaffaqiyatli yuborildi!")
            setTitle("")
            setMessage("")
            setIsSheetOpen(false)
        } catch (error) {
            console.error("Error sending notification:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setIsSending(false)
        }
    }

    const formatDate = (timestamp: any) => formatFirestoreDate(timestamp) || "-"

    const typeIcons = {
        info: Info,
        success: CheckCircle2,
        warning: AlertTriangle
    } as const

    const typeColors = {
        info: "text-blue-600 bg-blue-50 border-blue-100",
        success: "text-emerald-600 bg-emerald-50 border-emerald-100",
        warning: "text-amber-600 bg-amber-50 border-amber-100"
    } as const

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bildirishnomalar</h1>
                    <p className="text-slate-500 text-sm mt-1">Platforma foydalanuvchilariga xabarlar yuboring va boshqaring.</p>
                </div>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button className="h-12 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Yangi xabar yuborish
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-[500px] flex flex-col h-full bg-white p-0">
                        <SheetHeader className="p-6 border-b border-slate-100">
                            <SheetTitle className="text-xl font-bold">Yangi bildirishnoma</SheetTitle>
                            <SheetDescription>
                                Barcha foydalanuvchilarga yoki tanlangan auditoriyaga xabar yuboring.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Sarlavha</label>
                                <Input
                                    placeholder="Xabarning sarlavhasi..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-11 border-slate-200 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Auditoriya</label>
                                <Select value={audience} onValueChange={setAudience}>
                                    <SelectTrigger className="h-11 border-slate-200 rounded-xl">
                                        <SelectValue placeholder="Auditoriyani tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Barchaga</SelectItem>
                                        <SelectItem value="premium">Faqat premium obunachilarga</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Xabar turi</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: "info", label: "Ma'lumot", icon: Info, color: "text-blue-600 bg-blue-50 border-blue-100" },
                                        { id: "success", label: "Muvaffaqiyat", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                                        { id: "warning", label: "Ogohlantirish", icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-100" }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all shrink-0",
                                                type === t.id ? t.color + " ring-2 ring-offset-1 ring-current" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                            )}
                                        >
                                            <t.icon className="w-3.5 h-3.5" />
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
                        </div>

                        <SheetFooter className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <Button
                                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20"
                                onClick={handleBroadcast}
                                disabled={isSending}
                            >
                                {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Yuborish (Broadcast)
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Statistics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm bg-teal-600 text-white overflow-hidden relative">
                    <CardContent className="p-6">
                        <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100/80">Jami yuborilganlar</span>
                            <h3 className="text-3xl font-bold mt-1">{history.length}</h3>
                            <p className="text-xs text-teal-100/70 mt-4 leading-relaxed">Oxirgi oyda {history.length > 0 ? history.filter(h => h.createdAt?.toDate() > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length : 0} ta bildirishnoma yuborildi.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
                    <CardContent className="p-6">
                        <Megaphone className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 rotate-12" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Target: Barchaga</span>
                            <h3 className="text-3xl font-bold mt-1 text-slate-800">{history.filter(h => h.target === 'all').length}</h3>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed">Hammaga tegishli e'lonlar ulushi {history.length > 0 ? Math.round((history.filter(h => h.target === 'all').length / history.length) * 100) : 0}%.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative hidden lg:block">
                    <CardContent className="p-6">
                        <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-100 rotate-12" />
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Oxirgi yuborilgan</span>
                            <h3 className="text-xl font-bold mt-2 text-slate-800 line-clamp-1">{history[0]?.title || "Mavjud emas"}</h3>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed">{history[0] ? formatDate(history[0].createdAt) : "Ma'lumot yo'q"}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Section */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Yuborilgan xabarlar tarixi</h2>
                    <Badge variant="outline" className="text-slate-500 border-slate-200 bg-white">
                        {history.length} ta xabar
                    </Badge>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-200 hover:bg-transparent">
                                        <TableHead className="py-4 pl-6 font-semibold text-slate-700">Sarlavha</TableHead>
                                        <TableHead className="py-4 font-semibold text-slate-700">Target</TableHead>
                                        <TableHead className="py-4 font-semibold text-slate-700">Tur</TableHead>
                                        <TableHead className="py-4 font-semibold text-slate-700">Sana</TableHead>
                                        <TableHead className="py-4 pr-6 text-right font-semibold text-slate-700">Holat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center">
                                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-2" />
                                                <p className="text-slate-500 text-sm">Xabarlar tarixi yuklanmoqda...</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center">
                                                <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-medium">Hozircha xabarlar yo'q</p>
                                                <p className="text-slate-400 text-xs">Yuborilgan xabarlar shu yerda ko'rinadi</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        history.map((item) => {
                                            const IconComponent = typeIcons[item.type as keyof typeof typeIcons] || Info;
                                            return (
                                                <TableRow key={item.id} className="hover:bg-slate-50/50 border-slate-100 transition-all">
                                                    <TableCell className="py-4 pl-6 min-w-[300px]">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                                                                typeColors[item.type as keyof typeof typeColors] || typeColors.info
                                                            )}>
                                                                <IconComponent className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <span className="font-bold text-slate-800 text-sm truncate">{item.title}</span>
                                                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.body) }} />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium whitespace-nowrap">
                                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                                            {item.target === 'all' ? 'Barchaga' : item.target === 'premium' ? 'Premiumlar' : 'Maxsus'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge variant="outline" className={cn(
                                                            "rounded-lg px-2 py-0 text-[10px] font-bold border-transparent uppercase tracking-wider shrink-0",
                                                            typeColors[item.type as keyof typeof typeColors] || typeColors.info
                                                        )}>
                                                            {item.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-xs text-slate-500 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                            {formatDate(item.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-6 text-right whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Yuborildi
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
