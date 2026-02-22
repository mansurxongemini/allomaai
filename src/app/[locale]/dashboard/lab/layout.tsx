import { LabShell } from "@/components/dashboard/lab/LabShell"

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>
}
