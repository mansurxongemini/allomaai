"use client"

import { useEffect, useState, useCallback } from "react"
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
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskCreationModal } from "@/components/dashboard/TaskCreationModal"
import { useAuth } from "@/context/AuthContext"
import {
  Task,
  createTask,
  completeTask,
  subscribeToActiveTasks,
  formatReviewDate,
  isToday,
} from "@/lib/firebase/tasks"
import { addPoints, incrementStat } from "@/lib/firebase/gamification"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

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
/* Due badge color helper                                              */
/* ------------------------------------------------------------------ */
function dueBadgeClasses(label: string) {
  if (label === "Bugun") return "bg-teal-50 text-teal-700 border-teal-200"
  if (label === "Ertaga") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-slate-100 text-slate-500 border-slate-200"
}

/* ------------------------------------------------------------------ */
/* Skeleton Card                                                       */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
    </div>
  )
}

/* ================================================================== */
/* Page Component                                                      */
/* ================================================================== */
export default function VazifalarPage() {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)

  /* ------ Real-time listener ------ */
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToActiveTasks(currentUser.uid, (fetchedTasks) => {
      setTasks(fetchedTasks)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser?.uid])

  /* ------ Create task ------ */
  async function handleCreateTask(data: {
    title: string
    type: "once" | "spaced"
    icon: string
    note: string
  }) {
    if (!currentUser?.uid) return
    await createTask(currentUser.uid, data)
  }

  /* ------ Complete task (spaced repetition engine + gamification) ------ */
  const handleCompleteTask = useCallback(
    async (task: Task) => {
      if (!currentUser?.uid || completingId) return
      setCompletingId(task.id)

      try {
        await completeTask(task)

        if (task.type === "once") {
          // Gamification: points + stat update only when truly "done"
          await addPoints(currentUser.uid, 10, "task_completed", { taskId: task.id })
          await incrementStat(currentUser.uid, "tasksCompleted")
        } else {
          // Spaced: grant points for review session even though task stays active
          await addPoints(currentUser.uid, 10, "task_reviewed", { taskId: task.id })
        }
      } catch (err) {
        console.error("Error completing task:", err)
      } finally {
        setCompletingId(null)
      }
    },
    [currentUser?.uid, completingId]
  )

  /* ------ Statistics ------ */
  const todayTasks = tasks.filter((t) => isToday(t.nextReviewDate))
  const upcomingTasks = tasks.filter((t) => !isToday(t.nextReviewDate))

  /* ------------------------------------------------------------------ */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground text-balance">
            Vazifalar (Spaced Repetition)
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {"Intervalli takrorlash orqali bilimlarni mustahkamlang."}
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="self-start rounded-[var(--radius-md)] sm:self-auto"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{"Yangi vazifa qo'shish"}</span>
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-4 sm:py-3">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-teal-50 shrink-0">
            <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Bugun</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {loading ? "—" : todayTasks.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-4 sm:py-3">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-amber-50 shrink-0">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Kelgusi</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {loading ? "—" : upcomingTasks.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:px-4 sm:py-3">
          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-slate-100 shrink-0">
            <Repeat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">Jami</p>
            <p className="text-base sm:text-lg font-semibold text-slate-800">
              {loading ? "—" : tasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Today Section */}
      {!loading && todayTasks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-700 mb-4">
            Bugungi vazifalar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {todayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleting={completingId === task.id}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {!loading && upcomingTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 sm:mb-4">
            Kelgusi vazifalar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleting={completingId === task.id}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <Empty className="rounded-[var(--radius-lg)] border border-dashed border-border bg-surface py-16 shadow-sm">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
              <Book className="h-5 w-5" />
            </EmptyMedia>
            <EmptyTitle className="text-foreground">Ma&apos;lumot yo&apos;q</EmptyTitle>
            <EmptyDescription>Hozircha faol vazifalar mavjud emas. Yangi vazifa qo&apos;shib, spaced repetition jarayonini boshlang.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setModalOpen(true)}>Yangi vazifa qo&apos;shish</Button>
          </EmptyContent>
        </Empty>
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
interface TaskCardProps {
  task: Task
  isCompleting: boolean
  onComplete: (task: Task) => void
}

function TaskCard({ task, isCompleting, onComplete }: TaskCardProps) {
  const Icon = resolveIcon(task.icon)
  const dateLabel = formatReviewDate(task.nextReviewDate)
  const today = isToday(task.nextReviewDate)

  return (
    <article className="group flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-5">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors duration-200">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug text-slate-800 group-hover:text-teal-700 transition-colors duration-200 line-clamp-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                dueBadgeClasses(dateLabel)
              )}
            >
              <CalendarClock className="h-3 w-3" />
              {dateLabel}
            </span>
            <span
              className={cn(
                "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                task.type === "spaced"
                  ? "bg-teal-50 text-teal-600"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {task.type === "spaced" ? "Intervalli" : "Bir martalik"}
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

      {/* Interval step indicator (only for spaced tasks) */}
      {task.type === "spaced" && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
          {[1, 3, 7, 15, 30].map((day, idx) => (
            <span
              key={day}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                idx < task.intervalStep
                  ? "bg-teal-600 text-white"
                  : idx === task.intervalStep
                    ? "bg-teal-100 text-teal-700 ring-1 ring-teal-400"
                    : "bg-slate-100 text-slate-400"
              )}
            >
              {day}k
            </span>
          ))}
        </div>
      )}

      {/* Complete button — only show for today's tasks */}
      {today && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Button
            onClick={() => onComplete(task)}
            disabled={isCompleting}
            className={cn(
              "h-10 w-full gap-2 rounded-[var(--radius-md)] border border-teal-200 bg-teal-50 text-xs font-medium text-teal-700 hover:border-teal-600 hover:bg-teal-600 hover:text-white",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isCompleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {isCompleting ? "Saqlanmoqda..." : "Bajarildi"}
          </Button>
        </div>
      )}
    </article>
  )
}
