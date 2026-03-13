"use client"

import { useState } from "react"
import { Menu, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LabSidebar } from "./LabSidebar"
import { useAuth } from "@/context/AuthContext"

export function LabShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!currentUser) {
    return null // Redirection happens via middleware
  }

  return (
    <div className="flex h-full min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] overflow-hidden md:min-h-full">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 h-9 w-9 bg-white border-slate-200"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-in slide-in-from-left duration-200">
            <div className="h-full" onClick={() => setMobileOpen(false)}>
              <LabSidebar />
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-64 shrink-0 md:block">
        <LabSidebar />
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
