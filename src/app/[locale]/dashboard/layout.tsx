import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { BottomNav } from "@/components/dashboard/BottomNav"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ClientAuthGuard } from "@/components/auth/ClientAuthGuard"

export const metadata: Metadata = {
  title: "ALLOMA AI — Dashboard",
  description: "Your AI-powered academic workspace",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
          <div className="h-full">
            <ClientAuthGuard>
              {children}
            </ClientAuthGuard>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
