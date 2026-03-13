"use client"

import { useState } from "react"
import {
    LayoutDashboard,
    BookOpen,
    Scale,
    FileText,
    PenTool,
    Users,
    ChevronLeft,
    LogOut,
    Bell,
    Search,
    Headset,
    Send,
    Lightbulb,
    BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { auth } from "@/lib/firebase"

const navItems = [
    { label: "Asosiy", href: "/admin", icon: LayoutDashboard },
    { label: "Darslar", href: "/admin/subjects", icon: BookOpen },
    { label: "Metodlar", href: "/admin/methods", icon: Lightbulb },
    { label: "Kazuslar", href: "/admin/cases", icon: Scale },
    { label: "Maqolalar", href: "/admin/articles", icon: FileText },
    { label: "Bloglar", href: "/admin/blogs", icon: PenTool },
    { label: "Foydalanuvchilar", href: "/admin/users", icon: Users },
    { label: "Analitika", href: "/admin/analytics", icon: BarChart2 },
    { label: "Qo'llab-quvvatlash", href: "/admin/support", icon: Headset },
    { label: "Bildirishnomalar", href: "/admin/notifications", icon: Send },
]

export function AdminSidebarContent({ isCollapsed, pathname, handleLogout }: { isCollapsed: boolean, pathname: string, handleLogout: () => void }) {
    return (
        <>
            {/* Search - only if not collapsed */}
            {!isCollapsed && (
                <div className="px-6 py-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Qidiruv..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm transition-all focus:bg-white focus:border-teal-500/20 focus:ring-4 focus:ring-teal-500/5 outline-none text-slate-600 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className={cn(
                "flex flex-col gap-1.5 py-2 flex-1 transition-all duration-300",
                isCollapsed ? "px-3" : "px-4"
            )}>
                {isCollapsed && <div className="h-4" />}
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={cn(
                                "flex items-center gap-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                isCollapsed ? "justify-center h-12 w-12" : "px-4 py-3",
                                isActive
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                                isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {!isCollapsed && <span>{item.label}</span>}

                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className={cn(
                                    "absolute bg-teal-600 rounded-full transition-all duration-300",
                                    isCollapsed ? "right-[-12px] w-1.5 h-6 top-1/2 -translate-y-1/2" : "left-0 w-1 h-6 top-1/2 -translate-y-1/2"
                                )} />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Toggle & Footer */}
            <div className="mt-auto p-4 flex flex-col gap-3">
                {!isCollapsed && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-11 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 rounded-xl px-4 justify-start md:hidden"
                    >
                        <Bell className="h-5 w-5 shrink-0" />
                        <span className="ml-3 text-sm font-medium">Bildirishnomalar</span>
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className={cn(
                        "w-full h-11 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-xl",
                        isCollapsed ? "px-0 justify-center" : "px-4 justify-start"
                    )}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Chiqish</span>}
                </Button>
            </div>
        </>
    )
}

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)

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
            "hidden md:flex h-[100dvh] flex-col shrink-0 border-r border-slate-200 bg-white transition-all duration-300 z-50",
            isCollapsed ? "w-20" : "w-72"
        )}>
            {/* Logo */}
            <div className={cn(
                "flex items-center gap-3 h-16 border-b border-slate-100 transition-all duration-300",
                isCollapsed ? "px-4 justify-center" : "px-8 justify-start"
            )}>
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 shadow-lg shadow-teal-600/20 shrink-0">
                    <span className="text-base font-bold text-white tracking-tight">A</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight text-slate-800 leading-none">
                            ALLOMA AI
                        </span>
                        <span className="text-[10px] font-medium text-teal-600 uppercase tracking-widest mt-1">
                            Admin Panel
                        </span>
                    </div>
                )}
            </div>

            <AdminSidebarContent
                isCollapsed={isCollapsed}
                pathname={pathname}
                handleLogout={handleLogout}
            />

            {/* Collapse Toggle - only for desktop side */}
            <div className="p-4 pt-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "w-full h-11 text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 rounded-xl",
                        isCollapsed ? "px-0 justify-center" : "px-4 justify-start"
                    )}
                >
                    <ChevronLeft className={cn(
                        "h-5 w-5 transition-transform duration-500",
                        isCollapsed && "rotate-180"
                    )} />
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">Yig'ish</span>}
                </Button>
            </div>
        </aside>
    )
}
