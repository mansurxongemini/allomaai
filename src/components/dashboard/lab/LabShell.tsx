"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LabSidebar } from "./LabSidebar"

export function LabShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-full min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:min-h-[100dvh]">
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
      <aside className="hidden md:block w-64 shrink-0">
        <LabSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
