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
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border-t border-slate-200/80 dark:border-slate-700/50",
        "pb-[env(safe-area-inset-bottom)]",
        "shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]"
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
                "relative flex flex-col items-center gap-1 min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                "min-h-[56px] justify-center",
                isActive
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                item.highlight && !isActive && "text-violet-500"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className={cn(
                    "absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full",
                    "bg-gradient-to-r from-violet-500 to-violet-600"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25"
                  : item.highlight 
                    ? "bg-violet-50 dark:bg-violet-950/30"
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
