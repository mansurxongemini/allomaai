"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "sonner"
import { formatFirestoreDate, formatFirestoreTime } from "@/lib/date-utils"
import { Link } from "@/i18n/routing"
import {
    MessageSquare,
    Send,
    Clock,
    ChevronRight,
    ArrowLeft,
    Loader2,
    PlusCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import DOMPurify from "dompurify"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// A simple textarea implementation tailored for the student chat
import MiniEditor from "@/components/ui/editor/MiniEditor"

interface Ticket {
    id: string;
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

export default function StudentSupportDashboard() {
    const { currentUser } = useAuth()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
    const [messages, setMessages] = useState<TicketMessage[]>([])
    const [replyText, setReplyText] = useState("")

    const [isTicketsLoading, setIsTicketsLoading] = useState(true)
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)

    // New Ticket Modal State
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)
    const [newSubject, setNewSubject] = useState("")
    const [newCategory, setNewCategory] = useState("texnik")
    const [newMessage, setNewMessage] = useState("")
    const [isCreatingTicket, setIsCreatingTicket] = useState(false)

    // Fetch user's tickets
    useEffect(() => {
        if (!currentUser) return

        const q = query(
            collection(db, "tickets"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        )

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
    }, [currentUser])

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

    const handleCreateTicket = async () => {
        if (!currentUser || !newSubject.trim() || !newMessage.trim() || newMessage === "<p></p>") return

        setIsCreatingTicket(true)
        try {
            // 1. Create the ticket document
            const newTicket = {
                userId: currentUser.uid,
                userName: currentUser.displayName || "Foydalanuvchi",
                userEmail: currentUser.email || "",
                subject: newSubject,
                category: newCategory,
                status: "Ochiq",
                createdAt: serverTimestamp()
            }

            const ticketDocRef = await addDoc(collection(db, "tickets"), newTicket)

            // 2. Create the first message in the ticket's messages subcollection
            await addDoc(collection(db, "tickets", ticketDocRef.id, "messages"), {
                sender: "user",
                text: newMessage,
                createdAt: serverTimestamp()
            })

            setIsNewTicketOpen(false)
            setNewSubject("")
            setNewCategory("texnik")
            setNewMessage("")
            setSelectedTicketId(ticketDocRef.id)
            toast.success("Murojaat yuborildi!")
        } catch (error) {
            console.error("Error creating ticket:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setIsCreatingTicket(false)
        }
    }

    const handleSendReply = async () => {
        if (!replyText.trim() || replyText === "<p></p>" || !selectedTicketId) return

        setIsSending(true)
        try {
            const messagesRef = collection(db, "tickets", selectedTicketId, "messages")
            await addDoc(messagesRef, {
                sender: "user",
                text: replyText,
                createdAt: serverTimestamp()
            })
            setReplyText("")
        } catch (error) {
            console.error("Error sending reply:", error)
            toast.error("Xatolik yuz berdi")
        } finally {
            setIsSending(false)
        }
    }

    const selectedTicket = tickets.find(t => t.id === selectedTicketId)

    // The format utilities are used directly in JSX below

    if (!currentUser) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        )
    }

    return (
        <div className="mx-auto flex h-[calc(100vh-80px)] w-full max-w-7xl flex-col gap-4 overflow-hidden p-4 lg:gap-6 lg:p-6">
            {/* Header - Hidden on mobile when chat is open */}
            <div className={cn("shrink-0 flex justify-between items-center", selectedTicketId ? "hidden md:flex" : "flex")}>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mening murojaatlarim</h1>
                    <p className="text-slate-500 text-sm mt-1">Sizning barcha so'rovlaringiz va ularning javoblari.</p>
                </div>

                <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                    <Button onClick={() => setIsNewTicketOpen(true)} className="rounded-[var(--radius-md)] shadow-sm hover:shadow-md">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Yangi murojaat</span>
                        <span className="sm:hidden">Yangi</span>
                    </Button>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Yangi murojaat yaratish</DialogTitle>
                            <DialogDescription>
                                Iltimos, muammongizni batafsil tasvirlab bering. Biz imkon qadar tezroq javob beramiz.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="subject">Mavzu</Label>
                                <Input
                                    id="subject"
                                    placeholder="Masalan: Tizimga kira olmayapman"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="category">Bo'lim (Kategoriya)</Label>
                                <Select value={newCategory} onValueChange={setNewCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kategoriyani tanlang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="texnik">Texnik muammo</SelectItem>
                                        <SelectItem value="tolov">To'lov masalalari</SelectItem>
                                        <SelectItem value="taklif">Taklif va shikoyatlar</SelectItem>
                                        <SelectItem value="boshqa">Boshqa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Xabar matni</Label>
                                <MiniEditor
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    placeholder="Muammongizni batafsil yozing..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNewTicketOpen(false)} disabled={isCreatingTicket}>
                                Bekor qilish
                            </Button>
                            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateTicket} disabled={isCreatingTicket || !newSubject.trim() || !newMessage.trim() || newMessage === "<p></p>"}>
                                {isCreatingTicket ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Yuborish
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-4 lg:gap-6 min-h-0 h-full overflow-hidden">
                {/* Left Column: Tickets List */}
                <Card className={cn(
                    "h-full w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border-border bg-surface shadow-sm md:w-80 lg:w-96",
                    selectedTicketId ? "hidden md:flex" : "flex"
                )}>
                    {/* Active/Closed Tabs or Title */}
                    <div className="shrink-0 border-b border-border bg-surface p-4">
                        <h3 className="font-semibold text-slate-800">Barcha murojaatlar</h3>
                    </div>

                    <div className="flex-1 w-full overflow-y-auto bg-slate-50/40 dark:bg-slate-900/20">
                        {isTicketsLoading ? (
                            <div className="flex justify-center items-center h-32 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="flex h-full items-center justify-center p-6">
                                <Empty className="min-h-[280px] rounded-[var(--radius-md)] border border-dashed border-border bg-surface">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                                            <MessageSquare className="h-5 w-5" />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-foreground">Ma&apos;lumot yo&apos;q</EmptyTitle>
                                        <EmptyDescription>Sizda hozircha murojaatlar yo&apos;q. Yangi murojaat ochib, yordam so&apos;rashingiz mumkin.</EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button onClick={() => setIsNewTicketOpen(true)}>Yangi murojaat yozish</Button>
                                    </EmptyContent>
                                </Empty>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                        className={cn(
                                            "cursor-pointer rounded-[var(--radius-md)] border p-4 transition-colors duration-200",
                                            selectedTicketId === ticket.id
                                                ? "border-primary/15 bg-primary/10 shadow-sm"
                                                : "border-border bg-surface hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <p className="font-medium text-slate-800 text-sm truncate w-full">{ticket.subject}</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatFirestoreDate(ticket.createdAt)}
                                            </span>
                                            <Badge variant="secondary" className={cn(
                                                "text-[10px] h-5 px-2",
                                                ticket.status === "Ochiq" ? "bg-emerald-50 text-emerald-700"
                                                    : ticket.status === "Kutilyapti" ? "bg-amber-50 text-amber-700"
                                                        : ticket.status === "Yopilgan" ? "bg-slate-100 text-slate-500"
                                                            : "bg-blue-50 text-blue-700"
                                            )}>
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right Column: Chat/Reply Area */}
                <Card className={cn(
                    "min-h-0 h-full w-full flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border-border bg-surface shadow-sm",
                    !selectedTicketId ? "hidden md:flex" : "flex"
                )}>
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="z-10 flex items-center border-b border-border bg-surface p-3 shadow-sm md:p-4 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 md:hidden text-slate-500 mr-2 shrink-0"
                                    onClick={() => setSelectedTicketId(null)}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-slate-800 truncate">{selectedTicket.subject}</span>
                                    <span className="text-[11px] text-slate-500 truncate">
                                        Holat: {selectedTicket.status} • Yuribori: {formatFirestoreDate(selectedTicket.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="w-full flex-1 overflow-y-auto space-y-4 bg-slate-50/40 p-4 md:p-6 dark:bg-slate-900/20">
                                {isMessagesLoading ? (
                                    <div className="flex justify-center items-center py-10 text-slate-400">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex flex-col max-w-[85%] md:max-w-[75%]",
                                                message.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <div className="flex items-end gap-2">
                                                {message.sender === "admin" && (
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 hidden sm:flex items-center justify-center shrink-0 mb-1">
                                                        <span className="text-[10px] font-bold text-teal-700">A</span>
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "p-3 rounded-2xl text-[13px] md:text-sm shadow-sm",
                                                    message.sender === "user"
                                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                                                )} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] text-slate-400 mt-1 font-medium",
                                                message.sender === "user" ? "mr-1" : "ml-8"
                                            )}>
                                                {formatFirestoreTime(message.createdAt)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Reply Area */}
                            <div className="z-10 mb-0 w-full shrink-0 border-t border-border bg-surface p-3 md:p-4">
                                {selectedTicket.status === "Yopilgan" ? (
                                    <div className="text-center p-3 text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100">
                                        Murojaat yopilgan. Agar qo'shimcha savolingiz bo'lsa, iltimos yangi murojaat oching.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <MiniEditor
                                            value={replyText}
                                            onChange={setReplyText}
                                            placeholder="Javobingizni yozing..."
                                        />
                                        <div className="flex justify-end items-center w-full">
                                            <Button
                                                className="h-10 rounded-[var(--radius-md)] px-5 text-sm font-semibold shadow-sm hover:shadow-md sm:px-6"
                                                onClick={handleSendReply}
                                                disabled={isSending || !replyText.trim() || replyText === "<p></p>"}
                                            >
                                                {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                                Yuborish
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center bg-transparent p-8 text-center text-slate-400">
                            <Empty className="min-h-[320px] rounded-[var(--radius-md)] border border-dashed border-border bg-slate-50/60 dark:bg-slate-900/20">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                                        <MessageSquare className="h-5 w-5" />
                                    </EmptyMedia>
                                    <EmptyTitle className="text-foreground">Ma&apos;lumot yo&apos;q</EmptyTitle>
                                    <EmptyDescription>Xabarlar tarixini ko&apos;rish uchun chap tarafdagi murojaatlardan birini tanlang.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
