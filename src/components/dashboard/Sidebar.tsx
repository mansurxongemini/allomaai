"use client"

import { useState } from "react"
import {
  Home,
  ClipboardList,
  FlaskConical,
  MessageCircle,
  ChevronLeft,
  PenTool,
  Settings,
  LogOut,
  MessageSquare,
  Plus,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"

const navItems = [
  { label: "Bosh sahifa", href: "/dashboard", icon: Home },
  { label: "Vazifalar", href: "/dashboard/vazifalar", icon: ClipboardList },
  { label: "LAB", href: "/dashboard/lab", icon: FlaskConical },
  { label: "Couch", href: "/dashboard/couch", icon: MessageCircle, badge: "AI" },
  { label: "Bloglar", href: "/dashboard/blogs", icon: PenTool },
  { label: "Murojaatlar", href: "/dashboard/support", icon: MessageSquare },
  { label: "Sozlamalar", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { currentUser: _currentUser } = useAuth()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <aside className={cn(
      "hidden md:flex h-[100dvh] flex-col shrink-0 overflow-x-hidden transition-all duration-500 ease-out",
      "border-r border-border bg-surface/95 backdrop-blur-md",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border py-5 transition-all duration-300",
        isCollapsed ? "px-4 justify-center" : "px-6 justify-start"
      )}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 shrink-0 shadow-lg shadow-violet-500/25">
          <Sparkles className="w-5 h-5 text-white" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full border-2 border-white dark:border-slate-900" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">
              ALLOMA AI
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Huquqiy AI yordamchi
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex flex-1 flex-col gap-1.5 overflow-y-auto py-6 transition-all duration-300",
        isCollapsed ? "px-3" : "px-4"
      )}>
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Asosiy menu
          </p>
        )}

        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                isCollapsed ? "justify-center" : "justify-start",
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-200",
                isActive
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-white dark:bg-slate-800/60 dark:text-slate-300 dark:group-hover:bg-slate-800"
              )}>
                <item.icon className="w-4.5 h-4.5" />
              </div>

              {!isCollapsed && (
                <span className="relative">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-violet-500 to-teal-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        {!isCollapsed && (
          <div className="my-4 mx-3 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        )}

        {/* New Blog Button */}
        <Link
          href="/dashboard/blogs/create"
          className={cn(
            "mt-2 flex items-center gap-3 rounded-[var(--radius-md)] text-sm font-semibold transition-colors duration-200",
            pathname.includes("/dashboard/couch")
              ? "border border-border bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              : "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md",
            isCollapsed ? "justify-center px-0 py-3" : "justify-start px-4 py-3"
          )}
          title="Yangi Blog Yozish"
        >
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-lg",
            pathname.includes("/dashboard/couch") ? "bg-slate-200 dark:bg-slate-700" : "bg-white/20"
          )}>
            <Plus className="w-4 h-4" />
          </div>
          {!isCollapsed && <span>Yangi Blog Yozish</span>}
        </Link>
      </nav>

      {/* Toggle Button */}
      <div className={cn(
        "border-t border-border transition-all duration-300",
        isCollapsed ? "px-3 py-3" : "px-4 py-3"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full rounded-[var(--radius-md)] transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/50",
            isCollapsed ? "px-0 justify-center" : "justify-start"
          )}
          title={isCollapsed ? "Kengaytirish" : "Yig'ish"}
        >
          <div className={cn(
            "flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 transition-transform duration-300",
            !isCollapsed && "rotate-180"
          )}>
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </div>
          {!isCollapsed && <span className="ml-2 text-xs font-medium text-slate-500">Yig'ish</span>}
        </Button>
      </div>

      {/* Footer / Logout */}
      <div className={cn(
        "border-t border-border transition-all duration-300",
        "bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50",
        isCollapsed ? "px-3 py-4" : "px-4 py-4"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full rounded-[var(--radius-md)] transition-colors duration-200",
            "text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
            isCollapsed ? "px-0 justify-center" : "justify-start"
          )}
          title="Chiqish"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="ml-2 text-xs font-medium">Chiqish</span>}
        </Button>

        {!isCollapsed ? (
          <p className="text-[10px] text-slate-400 text-center mt-3">
            © 2026 ALLOMA AI
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 text-center mt-2">©</p>
        )}
      </div>
    </aside>
  )
}
