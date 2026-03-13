"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { X, Check, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AdvancedEditor from "@/components/ui/editor/AdvancedEditor"
import { cn } from "@/lib/utils"

export default function CreateBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPaid, setIsPaid] = useState(false)
  const [price, setPrice] = useState("15000")


  const handlePublish = () => {
    if (!title || !content) {
      alert("Iltimos, sarlavha va matn kiriting")
      return
    }
    alert(`Blog ${isPaid ? "pullik" : "bepul"} tarzda e'lon qilindi!`)
    router.push("/dashboard/blogs")
  }

  return (
    <div className="flex min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] flex-col bg-transparent md:min-h-[100dvh]">
      {/* Header Actions */}
      <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-md md:px-6 md:py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 rounded-[var(--radius-md)] text-slate-600 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Bekor qilish</span>
          </Button>

          {/* Right: Pricing & Publish */}
          <div className="flex items-center gap-3">
            {/* Pricing Toggle */}
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-slate-50 px-3 py-1.5 shadow-sm">
              <button
                onClick={() => setIsPaid(false)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  !isPaid
                    ? "border border-emerald-200 bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-800"
                )}
              >
                <Unlock className="h-3 w-3" />
                Bepul
              </button>
              <button
                onClick={() => setIsPaid(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  isPaid
                    ? "border border-amber-200 bg-white text-amber-700 shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-800"
                )}
              >
                <Lock className="h-3 w-3" />
                Premium
              </button>
            </div>

            {/* Price Input (if paid) */}
            {isPaid && (
              <div className="relative">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Narx"
                  className="h-9 w-28 rounded-[var(--radius-md)] pr-12 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  so'm
                </span>
              </div>
            )}

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              className="gap-2 rounded-[var(--radius-md)]"
              size="sm"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">E'lon qilish</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30 px-4 py-6 sm:px-6 md:py-8">
        <div className="mx-auto min-h-[calc(100vh-120px)] max-w-5xl rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-8 shadow-sm md:px-6 md:py-12">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sarlavha..."
            className="mb-8 border-none px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
          />
          <AdvancedEditor
            value={content}
            onChange={setContent}
          />

          {/* Character Count */}
          <div className="text-sm text-slate-400 text-right mt-4">
            {content.length.toLocaleString('en-US')} belgi
          </div>
        </div>
      </div>
    </div>
  )
}
