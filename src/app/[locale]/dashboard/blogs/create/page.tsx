"use client"

import { useState, useRef } from "react"
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
    <div className="min-h-[calc(100dvh-52px-env(safe-area-inset-bottom))] md:min-h-[100dvh] bg-white flex flex-col">
      {/* Header Actions */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-slate-600 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Bekor qilish</span>
          </Button>

          {/* Right: Pricing & Publish */}
          <div className="flex items-center gap-3">
            {/* Pricing Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <button
                onClick={() => setIsPaid(false)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
                  !isPaid
                    ? "bg-white text-green-700 border border-green-200 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                )}
              >
                <Unlock className="h-3 w-3" />
                Bepul
              </button>
              <button
                onClick={() => setIsPaid(true)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200",
                  isPaid
                    ? "bg-white text-amber-700 border border-amber-200 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
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
                  className="w-28 h-9 text-sm pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  so'm
                </span>
              </div>
            )}

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              className="bg-teal-600 hover:bg-teal-700 gap-2"
              size="sm"
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">E'lon qilish</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12 bg-white min-h-screen shadow-sm border-x border-slate-100">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sarlavha..."
            className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 px-0 mb-8"
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
