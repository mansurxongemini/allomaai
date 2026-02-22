import type { Metadata } from "next"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { BottomNav } from "@/components/dashboard/BottomNav"

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

      {/* Main Content Area — pb accounts for mobile bottom nav height */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-[calc(52px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
