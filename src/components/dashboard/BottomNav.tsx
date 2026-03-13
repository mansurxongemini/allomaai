"use client"

import { Link, usePathname } from "@/i18n/routing"
import { Home, ClipboardList, FlaskConical, MessageCircle, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const navItems = [
  { label: "Bosh sahifa", href: "/dashboard", icon: Home },
  { label: "Vazifalar", href: "/dashboard/vazifalar", icon: ClipboardList },
  { label: "LAB", href: "/dashboard/lab", icon: FlaskConical },
  { label: "AI", href: "/dashboard/couch", icon: Sparkles, highlight: true },
  { label: "Profil", href: "/dashboard/settings", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex md:hidden fixed bottom-0 left-0 right-0 z-50",
        "bg-surface/95 backdrop-blur-md",
        "border-t border-border",
        "pb-[env(safe-area-inset-bottom)]",
        "shadow-[0_-4px_20px_-10px_rgba(15,23,42,0.12)]"
      )}
      role="navigation"
      aria-label="Asosiy navigatsiya"
    >
      <div className="flex items-center justify-around w-full px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1 py-2 transition-colors duration-200",
                "min-h-[56px] justify-center",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                item.highlight && !isActive && "text-primary/80"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-200",
                isActive 
                  ? "bg-primary text-white"
                  : item.highlight 
                    ? "bg-primary/10"
                    : "bg-transparent",
                isActive && "text-white"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive && "stroke-[2.5]"
                )} />
              </div>
              
              <span
                className={cn(
                  "text-[10px] leading-tight truncate max-w-full",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
