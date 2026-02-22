"use client"

import { useState } from "react"
import { Home, ClipboardList, FlaskConical, MessageCircle, ChevronLeft, PenTool, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"

const navItems = [
  { label: "Bosh sahifa", href: "/dashboard", icon: Home },
  { label: "Vazifalar", href: "/dashboard/vazifalar", icon: ClipboardList },
  { label: "LAB", href: "/dashboard/lab", icon: FlaskConical },
  { label: "Couch", href: "/dashboard/couch", icon: MessageCircle },
  { label: "Bloglar", href: "/dashboard/blogs", icon: PenTool },
  { label: "Sozlamalar", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { currentUser } = useAuth()

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
      "hidden md:flex flex-col shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2.5 py-4 border-b border-slate-200 transition-all duration-300",
        isCollapsed ? "px-3 justify-center" : "px-6 justify-start"
      )}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-700 shrink-0">
          <span className="text-sm font-bold text-white tracking-tight">A</span>
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold tracking-tight text-slate-800">
            ALLOMA AI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex flex-col gap-1 py-4 flex-1 transition-all duration-300",
        isCollapsed ? "px-2" : "px-3"
      )}>
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
                "flex items-center gap-3 rounded-lg text-sm transition-all duration-300",
                isCollapsed ? "justify-center px-0 py-2.5" : "justify-start px-3 py-2.5",
                isActive
                  ? "bg-slate-100 text-teal-700 font-medium"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Toggle Button */}
      <div className={cn(
        "border-t border-slate-200 transition-all duration-300",
        isCollapsed ? "px-2 py-3" : "px-3 py-3"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full transition-all duration-300",
            isCollapsed ? "px-0 justify-center" : "justify-start"
          )}
          title={isCollapsed ? "Kengaytirish" : "Yig'ish"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
          {!isCollapsed && <span className="ml-2 text-xs">Yig'ish</span>}
        </Button>
      </div>

      {/* Footer / User Profile */}
      <div className={cn(
        "mt-auto border-t border-slate-200 transition-all duration-300",
        isCollapsed ? "px-2 py-3" : "px-4 py-4"
      )}>
        {currentUser && (
          <div className={cn(
            "flex items-center gap-3 mb-4",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 overflow-hidden">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || ""} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-teal-700">
                  {currentUser.displayName?.[0] || currentUser.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {currentUser.displayName || "Foydalanuvchi"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-slate-500 hover:text-red-600 hover:bg-red-50 mb-2 transition-all duration-300",
            isCollapsed ? "px-0 justify-center" : "justify-start"
          )}
          title="Chiqish"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="ml-2 text-xs">Chiqish</span>}
        </Button>

        {!isCollapsed ? (
          <p className="text-[10px] text-slate-400 px-2 line-clamp-1">{"© 2026 ALLOMA AI"}</p>
        ) : (
          <p className="text-[10px] text-slate-400 text-center">{"©"}</p>
        )}
      </div>
    </aside>
  )
}
