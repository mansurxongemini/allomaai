"use client"

import { useState, useEffect } from "react"
import { Bell, Info, CheckCircle2, AlertTriangle, Clock, X, Sparkles } from "lucide-react"
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
import { SafeHTML } from "@/components/SafeHTML"

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

            const relevantNotifications = fetchedNotifications.filter(n => {
                const isAll = n.target === 'all';
                const isSpecific = n.target === currentUser.uid;
                const isPremium = n.target === 'premium';
                return isAll || isSpecific || isPremium;
            })

            setNotifications(relevantNotifications)

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
        info: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
        warning: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
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
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-11 w-11 rounded-xl transition-all duration-200",
                        "hover:bg-violet-50 dark:hover:bg-violet-950/30",
                        "focus:ring-2 focus:ring-violet-500/20"
                    )}
                >
                    <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(
                    "w-80 sm:w-96 p-0 overflow-hidden",
                    "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
                    "border border-slate-200 dark:border-slate-700",
                    "shadow-2xl shadow-slate-900/10",
                    "rounded-2xl"
                )}
                align="end"
                sideOffset={8}
            >
                <div className={cn(
                    "flex items-center justify-between p-4",
                    "border-b border-slate-100 dark:border-slate-700/50",
                    "bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50"
                )}>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50">
                            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <DropdownMenuLabel className="p-0 font-bold text-slate-800 dark:text-slate-100">
                            Bildirishnomalar
                        </DropdownMenuLabel>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 font-semibold rounded-lg"
                            onClick={markAllAsRead}
                        >
                            Hammasini o'qish
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Hozircha xabarlar yo'q</p>
                            <p className="text-xs text-slate-400 mt-1">Yangi bildirishnomalar shu yerda paydo bo'ladi</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((notification) => {
                                const Icon = typeIcons[notification.type as keyof typeof typeIcons] || Info
                                const isUnread = !notification.readBy?.includes(currentUser?.uid || "")

                                return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={cn(
                                            "flex flex-col items-start p-4 gap-1 cursor-pointer transition-all",
                                            "focus:bg-violet-50/50 dark:focus:bg-violet-950/20",
                                            isUnread ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start justify-between w-full gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                                typeColors[notification.type as keyof typeof typeColors] || typeColors.info
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 flex flex-col overflow-hidden">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn(
                                                        "text-sm font-semibold truncate",
                                                        isUnread ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
                                                    )}>
                                                        {notification.title}
                                                    </span>
                                                    {isUnread && (
                                                        <div className="h-2 w-2 rounded-full bg-violet-500 shrink-0 shadow-sm shadow-violet-500/30" />
                                                    )}
                                                </div>
                                                <SafeHTML
                                                    className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed"
                                                    html={notification.body}
                                                />
                                                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
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

                <div className="p-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                    <Button
                        variant="ghost"
                        className="w-full h-10 text-xs font-medium text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-xl"
                    >
                        Barcha bildirishnomalar
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
