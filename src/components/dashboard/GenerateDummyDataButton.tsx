"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

export function GenerateDummyDataButton() {
    const { currentUser } = useAuth()
    const [isGenerating, setIsGenerating] = useState(false)

    // Hide in production
    if (process.env.NODE_ENV === 'production') return null

    const handleGenerate = async () => {
        if (!currentUser) return
        setIsGenerating(true)

        try {
            const userRef = doc(db, "users", currentUser.uid)

            // 1. Generate random stats
            const randomStats = {
                articlesSubmitted: Math.floor(Math.random() * 20),
                casesAnalyzed: Math.floor(Math.random() * 50),
                tasksCompleted: Math.floor(Math.random() * 100),
                quizzesPassed: Math.floor(Math.random() * 30),
                totalStudyHours: Math.floor(Math.random() * 200),
                avgDailyMinutes: Math.floor(Math.random() * 120 + 30),
            }

            const randomStreak = {
                current: Math.floor(Math.random() * 10 + 1),
                longest: Math.floor(Math.random() * 30 + 5),
                todayCompleted: true,
                lastActiveDate: new Date().toISOString().split('T')[0]
            }

            await setDoc(userRef, {
                stats: randomStats,
                streak: randomStreak,
                totalPoints: Math.floor(Math.random() * 6000 + 1000),

                // Root fallbacks to make sure the user's requested schema works too
                articlesCount: randomStats.articlesSubmitted,
                completedCases: randomStats.casesAnalyzed,
                tasksCompleted: randomStats.tasksCompleted,
                testsPassed: randomStats.quizzesPassed,
                totalHours: randomStats.totalStudyHours,
                avgDailyMinutes: randomStats.avgDailyMinutes,
                longestStreak: randomStreak.longest,
            }, { merge: true })

            // 2. Generate random activities for charts
            const activitiesRef = collection(db, "activities")

            // Generate some dummy activities over the last 7 days
            for (let i = 0; i < 15; i++) {
                const pastDate = new Date()
                pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 7))

                await addDoc(activitiesRef, {
                    userId: currentUser.uid,
                    type: "points_gain",
                    amount: Math.floor(Math.random() * 50 + 10),
                    reason: "Test ma'lumot",
                    timestamp: pastDate,
                    dateStr: pastDate.toISOString().split('T')[0]
                })
            }

            toast.success("Test ma'lumotlari muvaffaqiyatli yaratildi!", {
                description: "Dashboard endi yangilangan bo'lishi kerak.",
            })
        } catch (error) {
            console.error(error)
            toast.error("Xatolik yuz berdi", {
                description: "Test ma'lumotlarini yaratishda muammo yuzaga keldi."
            })
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button
            onClick={handleGenerate}
            disabled={isGenerating || !currentUser}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
        >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Yaratilmoqda..." : "Test Ma'lumotlarni Yaratish"}
        </Button>
    )
}
