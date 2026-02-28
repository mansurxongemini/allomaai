"use client"

import { useState, useEffect } from "react"
import {
    MessageSquare,
    Search,
    Send,
    User,
    Clock,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import MiniEditor from "@/components/ui/editor/MiniEditor"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import DOMPurify from "dompurify"
import { formatFirestoreDate, formatFirestoreTime } from "@/lib/date-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Ticket {
    id: string;
    userId?: string;
    userName: string;
    userEmail: string;
    subject: string;
    category?: string;
    status: string;
    createdAt: any;
}

interface TicketMessage {
    id: string;
    sender: "admin" | "user";
    text: string;
    createdAt: any;
}

export default function SupportPage() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
    const [replyText, setReplyText] = useState("")
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [isTicketsLoading, setIsTicketsLoading] = useState(true)
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)

    // Status Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [newStatus, setNewStatus] = useState("")
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    // Fetch Tickets
    useEffect(() => {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTickets = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Ticket[]
            setTickets(fetchedTickets)
            setIsTicketsLoading(false)
        }, (error) => {
            console.error("Error fetching tickets:", error)
            setIsTicketsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Fetch Messages for selected ticket
    useEffect(() => {
        if (!selectedTicketId) {
            setMessages([])
            return
        }

        setIsMessagesLoading(true)
        const messagesRef = collection(db, "tickets", selectedTicketId, "messages")
        const q = query(messagesRef, orderBy("createdAt", "asc"))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as TicketMessage[]
            setMessages(fetchedMessages)
            setIsMessagesLoading(false)
        }, (error) => {
            console.error("Error fetching messages:", error)
            setIsMessagesLoading(false)
        })

        return () => unsubscribe()
    }, [selectedTicketId])

    const selectedTicket = tickets.find(t => t.id === selectedTicketId)

    const handleSendReply = async () => {
        if (!replyText.trim() || replyText === "<p></p>" || !selectedTicketId || !selectedTicket) return

        setIsSending(true)
        try {
            // 1. Add message to the ticket
            const messagesRef = collection(db, "tickets", selectedTicketId, "messages")
            await addDoc(messagesRef, {
                sender: "admin",
                text: replyText,
                createdAt: serverTimestamp()
            })

            // 2. Automatically set status to 'Kutilyapti' (Pending user to reply) or keep Open if preferred, let's keep it as is or update to pending.
            const ticketRef = doc(db, "tickets", selectedTicketId)
            await updateDoc(ticketRef, {
                status: "Kutilyapti"
            })

            // 3. Send a Notification to the user
            await addDoc(collection(db, "notifications"), {
                title: "Murojaatingizga javob keldi",
                body: `<b>${selectedTicket.subject}</b> nomli murojaatingizga administrator javob berdi.`,
                type: "info",
                target: selectedTicket.userId || "all", // Assuming ticket has userId, else we might need to fallback. Wait, let me check if userId exists on Ticket interface.
                readBy: [],
                createdAt: serverTimestamp()
            })

            setReplyText("")
            toast.success("Javob yuborildi")
        } catch (error) {
            console.error("Error sending reply:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setIsSending(false)
        }
    }

    const openStatusModal = () => {
        if (selectedTicket) {
            setNewStatus(selectedTicket.status)
            setIsStatusModalOpen(true)
        }
    }

    const handleUpdateStatus = async () => {
        if (!selectedTicketId || !newStatus) return

        setIsUpdatingStatus(true)
        try {
            const ticketRef = doc(db, "tickets", selectedTicketId)
            await updateDoc(ticketRef, {
                status: newStatus
            })
            setIsStatusModalOpen(false)
            toast.success("Status muvaffaqiyatli o'zgartirildi!")
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Status o'zgartirishda xatolik yuz berdi")
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    // The format utilities are used directly in JSX below

    return (
        <div className="h-[calc(100vh-100px)] overflow-hidden flex flex-col gap-4 p-2 md:p-6 lg:gap-6 lg:p-0">
            {/* Header - Hidden on mobile when chat is open */}
            <div className={cn("shrink-0", selectedTicketId ? "hidden md:block" : "block")}>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Qo'llab-quvvatlash</h1>
                <p className="text-slate-500 text-sm mt-1">Talabalarning murojaatlariga javob bering.</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 lg:gap-6 min-h-0 h-full overflow-hidden">
                {/* Left Column: Tickets List */}
                <Card className={cn(
                    "w-full md:w-80 lg:w-96 flex flex-col border-slate-200 overflow-hidden shadow-sm h-full shrink-0",
                    selectedTicketId ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Qidiruv..."
                                className="pl-9 h-9 border-slate-200 bg-white shadow-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto w-full">
                        {isTicketsLoading ? (
                            <div className="flex justify-center items-center h-20 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex justify-center items-center h-32 text-slate-400 text-sm italic">
                                Murojaatlar yo'q
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={cn(
                                        "p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 relative",
                                        selectedTicketId === ticket.id ? "bg-teal-50/50" : "bg-white"
                                    )}
                                >
                                    {selectedTicketId === ticket.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600 rounded-r-full" />
                                    )}
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <span className="font-semibold text-slate-800 text-sm truncate">{ticket.userName || 'Foydalanuvchi'}</span>
                                        <Badge variant="secondary" className={cn(
                                            "text-[10px] h-5 px-2 shrink-0 font-medium",
                                            ticket.status === "Ochiq" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                : ticket.status === "Kutilyapti" ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        )}>
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700 truncate mb-1">Mavzu: {ticket.subject}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[10px] text-slate-400 font-medium">{formatFirestoreDate(ticket.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Right Column: Chat/Reply Area */}
                <Card className={cn(
                    "flex-1 flex-col border-slate-200 overflow-hidden shadow-sm min-h-0 h-full w-full",
                    !selectedTicketId ? "hidden md:flex" : "flex"
                )}>
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 z-10 shadow-sm">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 md:hidden text-slate-500 mr-1"
                                        onClick={() => setSelectedTicketId(null)}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold border border-teal-100 shrink-0">
                                        {(selectedTicket.userName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-bold text-slate-800 truncate">{selectedTicket.userName || 'Foydalanuvchi'}</span>
                                        <span className="text-[10px] text-slate-500 truncate">{selectedTicket.userEmail || '-'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 w-full">
                                <div className="mb-6 flex justify-center">
                                    <div className="text-xs md:text-sm font-medium text-slate-700 mb-4 px-4 py-2 bg-white/80 border border-slate-200 shadow-sm rounded-xl max-w-[90%] text-center">
                                        Mavzu: {selectedTicket.subject}
                                    </div>
                                </div>

                                {isMessagesLoading ? (
                                    <div className="flex justify-center items-center py-10 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex justify-center items-center py-10 text-slate-400 text-sm italic">
                                        Hali xabarlar yozilmagan...
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex flex-col max-w-[85%] md:max-w-[75%]",
                                                message.sender === "admin" ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-2xl text-[13px] md:text-sm shadow-sm",
                                                message.sender === "admin"
                                                    ? "bg-teal-600 text-white rounded-tr-none"
                                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                            )} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
                                            <span className="text-[10px] text-slate-400 mt-1 font-medium">{formatFirestoreTime(message.createdAt)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Reply Area */}
                            <div className="p-3 md:p-4 border-t border-slate-200 bg-white shrink-0 z-10 w-full mb-0">
                                <div className="flex flex-col gap-3">
                                    <MiniEditor
                                        value={replyText}
                                        onChange={setReplyText}
                                        placeholder="Foydalanuvchiga javob yozing..."
                                    />
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" className="hidden sm:flex h-9 rounded-xl text-slate-600 text-xs px-4" onClick={openStatusModal}>
                                                Statusni o'zgartirish
                                            </Button>
                                        </div>
                                        <Button
                                            className="h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 sm:px-6 text-sm font-semibold shadow-lg shadow-teal-600/20"
                                            onClick={handleSendReply}
                                            disabled={isSending || !replyText.trim() || replyText === "<p></p>"}
                                        >
                                            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                            <span className="hidden sm:inline">Yuborish</span>
                                            <span className="sm:hidden">Yuborish</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">Murojaatni tanlang</h3>
                            <p className="text-sm">Javob berish yoki o'qish uchun chap tarafdan murojaatni tanlang</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Status Change Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Statusni o'zgartirish</DialogTitle>
                        <DialogDescription>
                            Murojaat holatini o'zgartiring. Bu foydalanuvchiga ham ko'rinadi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Yangi status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Statusni tanlang" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ochiq">Ochiq</SelectItem>
                                    <SelectItem value="Kutilyapti">Kutilyapti</SelectItem>
                                    <SelectItem value="Yopilgan">Yopilgan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusModalOpen(false)} disabled={isUpdatingStatus}>
                            Bekor qilish
                        </Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleUpdateStatus} disabled={isUpdatingStatus || !newStatus}>
                            {isUpdatingStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Saqlash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
