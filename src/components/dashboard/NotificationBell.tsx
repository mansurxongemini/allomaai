"use client"

import { useState, useEffect } from "react"
import { Bell, Info, CheckCircle2, AlertTriangle, Clock, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore"
import DOMPurify from "dompurify"

interface Notification {
    id: string;
    title: string;
    body: string;
    type: "info" | "success" | "warning";
    target: string;
    readBy: string[];
    createdAt: any;
}

export function NotificationBell() {
    const { currentUser } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!currentUser) return

        const q = query(
            collection(db, "notifications"),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Notification[]

            // Filter locally to avoid complex composite indices if possible.
            const relevantNotifications = fetchedNotifications.filter(n => {
                const isAll = n.target === 'all';
                const isSpecific = n.target === currentUser.uid;
                // For now, let's also show 'premium' notifications to all dashboard users
                // as most are likely premium, or we can add a check later.
                const isPremium = n.target === 'premium';

                return isAll || isSpecific || isPremium;
            })

            setNotifications(relevantNotifications)

            // Calculate unread
            const unread = relevantNotifications.filter(n =>
                !(n.readBy || []).includes(currentUser.uid)
            ).length
            setUnreadCount(unread)
        }, (error) => {
            console.error("Error fetching notifications:", error)
        })

        return () => unsubscribe()
    }, [currentUser])

    const markAsRead = async (notificationId: string) => {
        if (!currentUser) return

        const notification = notifications.find(n => n.id === notificationId)
        if (notification?.readBy?.includes(currentUser.uid)) return

        try {
            const notificationRef = doc(db, "notifications", notificationId)
            await updateDoc(notificationRef, {
                readBy: arrayUnion(currentUser.uid)
            })
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        if (!currentUser) return

        const unreadNotifications = notifications.filter(n => !n.readBy?.includes(currentUser.uid))
        if (unreadNotifications.length === 0) return

        try {
            // In a real high-volume app, we might use a batch here
            await Promise.all(unreadNotifications.map(n =>
                updateDoc(doc(db, "notifications", n.id), {
                    readBy: arrayUnion(currentUser.uid)
                })
            ))
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    const typeIcons = {
        info: Info,
        success: CheckCircle2,
        warning: AlertTriangle
    }

    const typeColors = {
        info: "text-blue-600 bg-blue-50/50",
        success: "text-emerald-600 bg-emerald-50/50",
        warning: "text-amber-600 bg-amber-50/50"
    }

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return ""
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

        if (seconds < 60) return "Hozirgina"
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes} daqiqa oldin`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours} soat oldin`
        const days = Math.floor(hours / 24)
        return `${days} kun oldin`
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 transition-all">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 sm:w-96 p-0 border-slate-200 shadow-xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                    <DropdownMenuLabel className="p-0 font-bold text-slate-800">Bildirishnomalar</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold"
                            onClick={markAllAsRead}
                        >
                            Hammasini o'qilgan deb belgilash
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                                <Bell className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium text-sm">Hozircha xabarlar yo'q</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {notifications.map((notification) => {
                                const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Info
                                const isUnread = !notification.readBy?.includes(currentUser?.uid || "")

                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex flex-col items-start p-4 gap-1 cursor-pointer transition-all focus:bg-slate-50",
                                            isUnread ? "bg-white" : "bg-slate-50/30"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start justify-between w-full gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                                typeColors[notification.type as keyof typeof typeColors] || typeColors.info
                                            )}>
                                                <Icon className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="flex-1 flex flex-col overflow-hidden">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn("text-xs font-bold truncate", isUnread ? "text-slate-900" : "text-slate-600")}>
                                                        {notification.title}
                                                    </span>
                                                    {isUnread && <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0 shadow-sm shadow-teal-500/20" />}
                                                </div>
                                                <div
                                                    className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(notification.body) }}
                                                />
                                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {getTimeAgo(notification.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <Button variant="ghost" className="w-full h-9 text-xs text-slate-500 hover:text-slate-800 transition-colors">
                        Barcha bildirishnomalar...
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
