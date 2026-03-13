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
    <div className="relative flex h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
          <div className="min-h-full">
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
