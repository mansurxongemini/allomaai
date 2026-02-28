"use client"

import { NotificationBell } from "./NotificationBell"
import { useAuth } from "@/context/AuthContext"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DashboardHeaderProps {
    onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const { currentUser } = useAuth()

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-8 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-slate-500"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Qidirish..."
                        className="h-10 w-64 md:w-80 pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <NotificationBell />

                <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-3 pl-1">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {currentUser?.displayName || "Foydalanuvchi"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Premium Talaba
                        </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold shadow-sm overflow-hidden relative">
                        {currentUser?.photoURL ? (
                            <Image src={currentUser.photoURL} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                            <span>{currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase()}</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
