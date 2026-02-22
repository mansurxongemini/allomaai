"use client"

import { useState } from "react"
import {
    MessageSquare,
    Search,
    Send,
    User,
    Clock,
    MoreVertical,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import MiniEditor from "@/components/ui/editor/MiniEditor"
import { cn } from "@/lib/utils"

const mockTickets = [
    {
        id: "1",
        user: "Mansurxon",
        email: "mansurxon@alloma.ai",
        subject: "Mening maqolamni AI xato baholadi",
        message: "Salom, mening maqolam 95% AI deb topildi, lekin men uni o'zim yozganman. Iltimos qayta tekshirib ko'ring.",
        status: "Ochiq",
        date: "2026-02-22",
        replies: [
            { sender: "user", text: "Salom, mening maqolam 95% AI deb topildi, lekin men uni o'zim yozganman. Iltimos qayta tekshirib ko'ring.", date: "10:30" }
        ]
    },
    {
        id: "2",
        user: "Zulfiya Ismoilova",
        email: "zulfiya@student.uz",
        subject: "Kursga to'lov qilishda muammo",
        message: "To'lovni amalga oshirdim, lekin hali ham premium darslar ochilmadi.",
        status: "Yopilgan",
        date: "2026-02-21",
        replies: [
            { sender: "user", text: "To'lovni amalga oshirdim, lekin hali ham premium darslar ochilmadi.", date: "14:20" },
            { sender: "admin", text: "Salom, to'lovingiz tasdiqlandi. Hozir darslaringiz ochiq.", date: "15:00" }
        ]
    },
    {
        id: "3",
        user: "Sardorbek",
        email: "sardor@alloma.ai",
        subject: "Parolni esdan chiqardim",
        message: "Profilingizga kira olmayapman, yordam bering.",
        status: "Ochiq",
        date: "2026-02-20",
        replies: [
            { sender: "user", text: "Profilingizga kira olmayapman, yordam bering.", date: "09:00" }
        ]
    }
]

export default function SupportPage() {
    const [selectedTicketId, setSelectedTicketId] = useState(mockTickets[0].id)
    const [replyText, setReplyText] = useState("")

    const selectedTicket = mockTickets.find(t => t.id === selectedTicketId)

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Qo'llab-quvvatlash markazi</h1>
                <p className="text-slate-500 text-sm mt-1">Talabalarning murojaatlari va savollariga javob bering.</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
                {/* Left Column: Tickets List */}
                <Card className="w-full md:w-80 lg:w-96 flex flex-col border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Qidiruv..."
                                className="pl-9 h-9 border-slate-200 bg-white shadow-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {mockTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={cn(
                                    "p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50",
                                    selectedTicketId === ticket.id ? "bg-teal-50/50 border-l-4 border-l-teal-600" : "bg-white"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-slate-800 text-sm truncate">{ticket.user}</span>
                                    <Badge variant="secondary" className={cn(
                                        "text-[10px] h-5 px-2",
                                        ticket.status === "Ochiq" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <p className="text-xs font-medium text-slate-600 truncate mb-1">{ticket.subject}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400">{ticket.date}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {ticket.replies[ticket.replies.length - 1].date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Chat/Reply Area */}
                <Card className="flex-1 flex flex-col border-slate-200 overflow-hidden shadow-sm min-h-0">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100">
                                        {selectedTicket.user.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{selectedTicket.user}</span>
                                        <span className="text-[10px] text-slate-400">{selectedTicket.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                                <div className="mb-6">
                                    <h2 className="text-sm font-bold text-slate-800 text-center mb-4 px-4 py-2 bg-slate-100/50 rounded-lg inline-block mx-auto w-full">
                                        Mavzu: {selectedTicket.subject}
                                    </h2>
                                </div>
                                {selectedTicket.replies.map((reply, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex flex-col max-w-[80%]",
                                            reply.sender === "admin" ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm shadow-sm",
                                            reply.sender === "admin"
                                                ? "bg-teal-600 text-white rounded-tr-none"
                                                : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                                        )}>
                                            {reply.text}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1">{reply.date}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Area */}
                            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                                <div className="flex flex-col gap-3">
                                    <MiniEditor
                                        value={replyText}
                                        onChange={setReplyText}
                                        placeholder="Javob yozing..."
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="h-9 rounded-xl text-slate-600 text-xs px-4">
                                                Statusni o'zgartirish
                                            </Button>
                                        </div>
                                        <Button
                                            className="h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-6 text-sm font-semibold shadow-lg shadow-teal-600/10"
                                            onClick={() => setReplyText("")}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Javob yuborish
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center italic">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <span>Murojaatni tanlang</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
