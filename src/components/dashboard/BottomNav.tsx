"use client"

import { Link, usePathname } from "@/i18n/routing"
import { Home, ClipboardList, FlaskConical, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Bosh sahifa", href: "/dashboard", icon: Home },
  { label: "Vazifalar", href: "/dashboard/vazifalar", icon: ClipboardList },
  { label: "LAB", href: "/dashboard/lab", icon: FlaskConical },
  { label: "Couch", href: "/dashboard/couch", icon: MessageCircle },
  { label: "Profil", href: "/dashboard", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Asosiy navigatsiya"
    >
      <div className="flex items-center justify-around w-full px-1">
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
                "flex flex-col items-center gap-0.5 min-w-0 flex-1 py-2.5 px-1 rounded-lg transition-colors",
                "active:bg-slate-50 min-h-[52px] justify-center",
                isActive
                  ? "text-teal-700"
                  : "text-slate-400 hover:text-slate-600"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "stroke-[2.5]")} />
              <span
                className={cn(
                  "text-[10px] leading-tight truncate max-w-full",
                  isActive ? "font-semibold" : "font-normal"
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
