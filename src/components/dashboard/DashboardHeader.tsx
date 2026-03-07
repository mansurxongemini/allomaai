"use client"

import { NotificationBell } from "./NotificationBell"
import { useAuth } from "@/context/AuthContext"
import { Search, Menu, Sparkles, Crown, Zap } from "lucide-react"
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
        <header className={cn(
            "sticky top-0 z-40 flex h-18 w-full items-center justify-between",
            "px-4 md:px-8",
            "bg-white/70 dark:bg-slate-900/70",
            "backdrop-blur-xl",
            "border-b border-white/20 dark:border-white/5",
            "shadow-sm shadow-slate-200/20 dark:shadow-none"
        )}>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Compact Search icon for mobile / minimal input for desktop */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <Input
                        placeholder="Qidiruv..."
                        className={cn(
                            "h-9 w-8 sm:w-[200px] pl-9 pr-3",
                            "rounded-xl border-slate-200/60 dark:border-slate-700/40",
                            "bg-slate-100/40 dark:bg-slate-800/40",
                            "focus:bg-white dark:focus:bg-slate-800",
                            "focus:border-slate-300/80 focus:ring-0",
                            "transition-colors duration-200",
                            "placeholder:text-slate-400 text-sm"
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                {/* Premium Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/20">
                    <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">Premium</span>
                </div>

                <NotificationBell />
            </div>
        </header>
    )
}
