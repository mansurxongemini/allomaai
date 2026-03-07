"use client"

import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        )
    }

    if (!currentUser) {
        // Return null while middleware handles the redirect to /signin
        return null
    }

    return <>{children}</>
}
