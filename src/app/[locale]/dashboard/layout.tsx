import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { BottomNav } from "@/components/dashboard/BottomNav"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

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
    <div className="flex min-h-[100dvh] bg-slate-50">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />

        {/* Main Content Area — pb accounts for mobile bottom nav height */}
        <main className="flex-1 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-6">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
