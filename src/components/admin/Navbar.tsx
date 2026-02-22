"use client"

import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    ChevronDown,
    Menu
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "@/i18n/routing"
import { AdminSidebarContent } from "./Sidebar"

export function AdminNavbar() {
    const { currentUser } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            await auth.signOut()
            router.push("/")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 rounded-xl">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-r-slate-100 bg-white">
                        <SheetHeader className="px-8 h-16 border-b border-slate-100 flex-row items-center gap-3 space-y-0 text-left">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 shadow-lg shadow-teal-600/20 shrink-0">
                                <span className="text-sm font-bold text-white tracking-tight">A</span>
                            </div>
                            <SheetTitle className="text-base font-bold tracking-tight text-slate-800">
                                ALLOMA AI
                            </SheetTitle>
                        </SheetHeader>
                        <div className="py-2 flex flex-col h-[calc(100vh-64px)]">
                            <AdminSidebarContent
                                isCollapsed={false}
                                pathname={pathname}
                                handleLogout={handleLogout}
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
                    Boshqaruv Paneli
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                </Button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2" />

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3 py-1.5 h-auto rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                            <Avatar className="h-8 w-8 border border-teal-100 ring-2 ring-teal-50">
                                <AvatarImage src={currentUser?.photoURL || ""} />
                                <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                                    {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-semibold text-slate-800 leading-none">
                                    Admin
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                                    Super Admin
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-200 shadow-xl shadow-slate-200/50 p-1.5">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
                            Hisob
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-lg py-2.5 px-3 focus:bg-teal-50 focus:text-teal-700 cursor-pointer transition-colors">
                            <User className="w-4 h-4 mr-2.5" />
                            <span>Profil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg py-2.5 px-3 focus:bg-teal-50 focus:text-teal-700 cursor-pointer transition-colors">
                            <Settings className="w-4 h-4 mr-2.5" />
                            <span>Sozlamalar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-lg py-2.5 px-3 focus:bg-red-50 focus:text-red-600 cursor-pointer text-slate-600 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2.5" />
                            <span>Chiqish</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
