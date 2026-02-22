"use client"

import { useState } from "react"
import {
  Plus,
  Book,
  Scale,
  Brain,
  Landmark,
  FileText,
  Gavel,
  ScrollText,
  ShieldCheck,
  Clock,
  Repeat,
  CalendarClock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskCreationModal } from "@/components/dashboard/TaskCreationModal"

/* ------------------------------------------------------------------ */
/* Icon Resolver                                                       */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  Scale,
  Brain,
  Landmark,
  FileText,
  Gavel,
  ScrollText,
  ShieldCheck,
}

function resolveIcon(name: string) {
  return iconMap[name] ?? Book
}

/* ------------------------------------------------------------------ */
/* Task Interface & Mock Data                                          */
/* ------------------------------------------------------------------ */
interface Task {
  id: string
  title: string
  type: "single" | "interval"
  intervals: number[]
  iconName: string
  nextDueDate: string
  note: string
}

const initialMockTasks: Task[] = [
  {
    id: "1",
    title: "Jinoyat huquqi — 15-bob takrorlash",
    type: "interval",
    intervals: [1, 3, 7],
    iconName: "Gavel",
    nextDueDate: "Ertaga",
    note: "Qasd va ehtiyotsizlik farqlari, javobgarlik turlari.",
  },
  {
    id: "2",
    title: "Fuqarolik kodeksi — Shartnoma turlari",
    type: "interval",
    intervals: [1, 7, 30],
    iconName: "Scale",
    nextDueDate: "3 kundan so'ng",
    note: "Oldi-sotdi, ijaraga berish, xizmat ko'rsatish shartnomalarini taqqoslash.",
  },
  {
    id: "3",
    title: "Konstitutsiyaviy huquq — Inson huquqlari",
    type: "interval",
    intervals: [3, 7, 15],
    iconName: "ShieldCheck",
    nextDueDate: "Bugun",
    note: "Konstitutsiya 18-42 moddalarini yodlash va misollar bilan mustahkamlash.",
  },
  {
    id: "4",
    title: "Xalqaro huquq — BMT Nizomi",
    type: "single",
    intervals: [],
    iconName: "Landmark",
    nextDueDate: "7 kundan so'ng",
    note: "BMT Xavfsizlik Kengashi vakolatlari va hal qilish mexanizmlarini o'rganish.",
  },
  {
    id: "5",
    title: "Mehnat huquqi — Ish vaqti va dam olish",
    type: "interval",
    intervals: [1, 3, 7, 30],
    iconName: "Book",
    nextDueDate: "Ertaga",
    note: "Qonunda belgilangan ish soatlari, ta'til kunlari, dam olish huquqlari.",
  },
  {
    id: "6",
    title: "Ma'muriy javobgarlik turlari",
    type: "interval",
    intervals: [7, 15, 90],
    iconName: "FileText",
    nextDueDate: "15 kundan so'ng",
    note: "Jarima, ogohlantirish, maxsus huquqni cheklash turlarini takrorlash.",
  },
  {
    id: "7",
    title: "Huquqiy atamalar lug'ati — Lotincha iboralar",
    type: "single",
    intervals: [],
    iconName: "ScrollText",
    nextDueDate: "5 kundan so'ng",
    note: "Habeas corpus, de facto, bona fide, prima facie kabi atamalar.",
  },
  {
    id: "8",
    title: "Mantiq va argumentatsiya usullari",
    type: "interval",
    intervals: [1, 7],
    iconName: "Brain",
    nextDueDate: "Bugun",
    note: "Deduktiv va induktiv xulosalar, mantiqiy xatolar tahlili.",
  },
]

/* ------------------------------------------------------------------ */
/* Due badge color helper                                              */
/* ------------------------------------------------------------------ */
function dueBadgeClasses(due: string) {
  if (due === "Bugun")
    return "bg-teal-50 text-teal-700 border-teal-200"
  if (due === "Ertaga")
    return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-slate-100 text-slate-500 border-slate-200"
}

/* ================================================================== */
/* Page Component                                                      */
/* ================================================================== */
export default function VazifalarPage() {
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks)
  const [modalOpen, setModalOpen] = useState(false)

  function handleCreateTask(data: {
    title: string
    type: "single" | "interval"
    intervals: number[]
    iconName: string
    note: string
  }) {
    const newTask: Task = {
      id: String(Date.now()),
      ...data,
      nextDueDate: data.type === "single" ? "7 kundan so'ng" : "Ertaga",
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const todayTasks = tasks.filter((t) => t.nextDueDate === "Bugun")
  const upcomingTasks = tasks.filter((t) => t.nextDueDate !== "Bugun")

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800 text-balance">
            Vazifalar (Spaced Repetition)
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {"Intervalli takrorlash orqali bilimlarni mustahkamlang."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 sm:px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{"Yangi vazifa qo'shish"}</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-teal-50 shrink-0">
            <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Bugun</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {todayTasks.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-50 shrink-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Kelgusi</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {upcomingTasks.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-slate-100 shrink-0">
            <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Jami</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {tasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Today Section */}
      {todayTasks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-700 mb-4">
            Bugungi vazifalar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {upcomingTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">
            Kelgusi vazifalar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {upcomingTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <Book className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm text-slate-400 mb-1">
            Hali vazifalar mavjud emas
          </p>
          <p className="text-xs text-slate-400">
            {"\"Yangi vazifa qo'shish\" tugmasini bosing"}
          </p>
        </div>
      )}

      {/* Creation Modal */}
      <TaskCreationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleCreateTask}
      />
    </div>
  )
}

/* ================================================================== */
/* Task Card Component                                                 */
/* ================================================================== */
function TaskCard({ task }: { task: Task }) {
  const Icon = resolveIcon(task.iconName)

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors duration-200">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-slate-800 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                dueBadgeClasses(task.nextDueDate)
              )}
            >
              <CalendarClock className="h-3 w-3" />
              {task.nextDueDate}
            </span>
            <span
              className={cn(
                "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                task.type === "interval"
                  ? "bg-teal-50 text-teal-600"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {task.type === "interval" ? "Intervalli" : "Bir martalik"}
            </span>
          </div>
        </div>
      </div>

      {/* Note */}
      {task.note && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {task.note}
        </p>
      )}

      {/* Interval pills */}
      {task.type === "interval" && task.intervals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {task.intervals.map((day) => (
            <span
              key={day}
              className="rounded-full bg-teal-600 px-2.5 py-0.5 text-[11px] font-medium text-white"
            >
              {day}k
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
