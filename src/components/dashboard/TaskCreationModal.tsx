"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Book,
  Scale,
  Brain,
  Landmark,
  FileText,
  Gavel,
  ScrollText,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

const INTERVAL_OPTIONS = [1, 3, 7, 15, 30, 90]

const ICON_OPTIONS = [
  { name: "Book", icon: Book },
  { name: "Scale", icon: Scale },
  { name: "Brain", icon: Brain },
  { name: "Landmark", icon: Landmark },
  { name: "FileText", icon: FileText },
  { name: "Gavel", icon: Gavel },
  { name: "ScrollText", icon: ScrollText },
  { name: "ShieldCheck", icon: ShieldCheck },
] as const

interface TaskCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: {
    title: string
    type: "single" | "interval"
    intervals: number[]
    iconName: string
    note: string
  }) => void
}

export function TaskCreationModal({
  open,
  onOpenChange,
  onSave,
}: TaskCreationModalProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"single" | "interval">("single")
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([1, 7])
  const [selectedIcon, setSelectedIcon] = useState("Book")
  const [note, setNote] = useState("")

  function toggleInterval(day: number) {
    setSelectedIntervals((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function handleSave() {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      type,
      intervals: type === "interval" ? selectedIntervals : [],
      iconName: selectedIcon,
      note: note.trim(),
    })
    // Reset form
    setTitle("")
    setType("single")
    setSelectedIntervals([1, 7])
    setSelectedIcon("Book")
    setNote("")
    onOpenChange(false)
  }

  function handleCancel() {
    setTitle("")
    setType("single")
    setSelectedIntervals([1, 7])
    setSelectedIcon("Book")
    setNote("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-lg max-h-[85dvh] overflow-y-auto mx-2 sm:mx-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-800 text-lg font-semibold tracking-tight">
            Yangi vazifa yaratish
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            {"O'rganish vazifangizni sozlang va intervalli takrorlashni rejalashtiring."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-title"
              className="text-sm font-medium text-slate-700"
            >
              Sarlavha
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Jinoyat huquqi — 15-bob"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Turi</label>
            <div className="grid grid-cols-2 gap-3">
                <button
                type="button"
                onClick={() => setType("single")}
                className={cn(
                  "flex flex-col items-center gap-1 sm:gap-1.5 rounded-xl border-2 px-3 sm:px-4 py-3 sm:py-4 text-sm transition-all duration-200",
                  type === "single"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="font-semibold text-xs sm:text-sm">Bir martalik</span>
                <span className="text-[10px] sm:text-xs opacity-70">
                  Faqat bir marta bajarish
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType("interval")}
                className={cn(
                  "flex flex-col items-center gap-1 sm:gap-1.5 rounded-xl border-2 px-3 sm:px-4 py-3 sm:py-4 text-sm transition-all duration-200",
                  type === "interval"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="font-semibold text-xs sm:text-sm">Intervalli</span>
                <span className="text-[10px] sm:text-xs opacity-70">
                  Takroriy rejali takrorlash
                </span>
              </button>
            </div>
          </div>

          {/* Interval Selector — visible only when type is "interval" */}
          {type === "interval" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Takrorlash intervallari (kunlar)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERVAL_OPTIONS.map((day) => {
                  const isActive = selectedIntervals.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleInterval(day)}
                      className={cn(
                        "rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                      )}
                    >
                      {day} kun
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Icon Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Belgi tanlash
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border-2 p-3 transition-all duration-200",
                    selectedIcon === name
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  )}
                  aria-label={name}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-note"
              className="text-sm font-medium text-slate-700"
            >
              Eslatma
            </label>
            <textarea
              id="task-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="O'rganish bo'yicha qo'shimcha eslatmalar..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Saqlash
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
