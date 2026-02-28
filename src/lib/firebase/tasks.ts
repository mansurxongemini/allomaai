import { db } from "@/lib/firebase"
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    Timestamp,
    orderBy,
} from "firebase/firestore"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Task {
    id: string
    userId: string
    title: string
    type: "once" | "spaced"
    icon: string
    note: string
    status: "active" | "completed"
    nextReviewDate: Timestamp
    intervalStep: number
    createdAt: Timestamp
}

export interface CreateTaskData {
    title: string
    type: "once" | "spaced"
    icon: string
    note: string
}

/* ------------------------------------------------------------------ */
/* Spaced Repetition Formula                                           */
/* Step:  0 -> +1 day                                                 */
/*        1 -> +3 days                                                 */
/*        2 -> +7 days                                                 */
/*        3 -> +15 days                                                */
/*        4 -> +30 days  (cap)                                         */
/* ------------------------------------------------------------------ */
const INTERVAL_STEPS = [1, 3, 7, 15, 30]

function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    result.setHours(0, 0, 0, 0)
    return result
}

function startOfToday(): Date {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

/* ------------------------------------------------------------------ */
/* Create a new task                                                   */
/* ------------------------------------------------------------------ */
export async function createTask(userId: string, data: CreateTaskData): Promise<void> {
    if (!userId) throw new Error("Foydalanuvchi topilmadi")
    try {
        const today = startOfToday()
        await addDoc(collection(db, "tasks"), {
            userId,
            title: data.title,
            type: data.type,
            icon: data.icon,
            note: data.note,
            status: "active",
            nextReviewDate: Timestamp.fromDate(today),
            intervalStep: 0,
            createdAt: Timestamp.now(),
        })
    } catch (error) {
        console.error("createTask error:", error)
        throw new Error("Vazifa yaratishda xatolik yuz berdi")
    }
}

/* ------------------------------------------------------------------ */
/* Complete a task (spaced repetition engine)                          */
/* ------------------------------------------------------------------ */
export async function completeTask(task: Task): Promise<void> {
    try {
        const taskRef = doc(db, "tasks", task.id)

        if (task.type === "once") {
            // One-time task — mark as completed
            await updateDoc(taskRef, { status: "completed" })
        } else {
            // Spaced task — advance the interval step and reschedule
            const currentStep = task.intervalStep ?? 0
            const nextStep = Math.min(currentStep + 1, INTERVAL_STEPS.length - 1)
            const daysToAdd = INTERVAL_STEPS[currentStep] ?? 1
            const nextDate = addDays(startOfToday(), daysToAdd)

            await updateDoc(taskRef, {
                intervalStep: nextStep,
                nextReviewDate: Timestamp.fromDate(nextDate),
            })
        }
    } catch (error) {
        console.error("completeTask error:", error)
        throw new Error("Vazifani bajarishda xatolik yuz berdi")
    }
}

/* ------------------------------------------------------------------ */
/* Real-time listener — active tasks for a user                        */
/* ------------------------------------------------------------------ */
export function subscribeToActiveTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (!userId) return () => { }

    const q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("status", "==", "active"),
        orderBy("nextReviewDate", "asc")
    )

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const tasks: Task[] = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...(docSnap.data() as Omit<Task, "id">),
            }))
            callback(tasks)
        },
        (error) => {
            console.error("subscribeToActiveTasks error:", error)
            onError?.(new Error("Vazifalarni yuklashda xatolik"))
        }
    )

    return unsubscribe
}

/* ------------------------------------------------------------------ */
/* Date helpers for display                                            */
/* ------------------------------------------------------------------ */
export function formatReviewDate(timestamp: Timestamp): string {
    const reviewDate = timestamp.toDate()
    const today = startOfToday()

    const reviewDay = new Date(reviewDate)
    reviewDay.setHours(0, 0, 0, 0)

    const diffMs = reviewDay.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return "Bugun"
    if (diffDays === 1) return "Ertaga"
    return `${diffDays} kundan so'ng`
}

export function isToday(timestamp: Timestamp): boolean {
    const reviewDate = timestamp.toDate()
    const today = startOfToday()
    reviewDate.setHours(0, 0, 0, 0)
    return reviewDate.getTime() <= today.getTime()
}
