"use client"

import { useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { useAuth } from "@/context/AuthContext"
import { AdminSidebar } from "@/components/admin/Sidebar"
import { AdminNavbar } from "@/components/admin/Navbar"
import { Spinner } from "@/components/ui/spinner"

const ALLOWED_ADMIN_EMAILS = ["sardor@gmail.com", "admin@alloma.ai", "mansurxonpersonal@gmail.com", "mansurxon.gemini@gmail.com"]

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { currentUser, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!currentUser || !currentUser.email || !ALLOWED_ADMIN_EMAILS.includes(currentUser.email)) {
                router.push("/dashboard")
            }
        }
    }, [currentUser, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-teal-200 border-4 border-teal-100 opacity-20"></div>
                        <Spinner className="w-12 h-12 text-teal-600 relative z-10" />
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">Tekshirilmoqda...</p>
                </div>
            </div>
        )
    }

    if (!currentUser || !currentUser.email || !ALLOWED_ADMIN_EMAILS.includes(currentUser.email)) {
        return null // Will redirect via useEffect
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar />
                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
