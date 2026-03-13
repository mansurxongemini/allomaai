"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
    onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
    const pathname = usePathname()

    if (pathname.includes("/couch")) return null

    return (
        <header className={cn(
            "sticky top-0 z-40 flex h-14 w-full items-center",
            "px-4 md:px-6",
            "bg-surface/85",
            "backdrop-blur-md",
            "border-b border-border",
            "shadow-sm"
        )}>
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                onClick={onMenuClick}
            >
                <Menu className="h-5 w-5" />
            </Button>
        </header>
    )
}
