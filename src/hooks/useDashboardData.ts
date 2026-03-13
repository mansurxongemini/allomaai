import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import {
    collection, doc, onSnapshot, query, orderBy, limit, where, getDocs
} from 'firebase/firestore'
import {
    UserProfile,
    LeaderboardEntry,
    DailyActivity,
    HourlyActivity,
    WeeklyStreak,
    getRank
} from '@/lib/gamification'
import { useAuth } from '@/context/AuthContext'
import { lastNDaysStrs, uzDayShort } from '@/lib/date-utils'

export function useDashboardData() {
    const { currentUser } = useAuth()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
    const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([])
    const [weeklyStreak, setWeeklyStreak] = useState<WeeklyStreak[]>([])

    const [isLoadingProfile, setIsLoadingProfile] = useState(true)
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true)
    const [isLoadingActivities, setIsLoadingActivities] = useState(true)

    // 1. Listen to Current User Profile
    useEffect(() => {
        if (!currentUser) return

        const userRef = doc(db, 'users', currentUser.uid)
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data()

                // Ensure data matches UserProfile structure, supply defaults for missing fields
                const totalPoints = data.totalPoints || 0
                const rank = getRank(totalPoints)

                setProfile({
                    id: currentUser.uid,
                    name: currentUser.displayName || data.name || 'Hozircha ism yoq',
                    username: currentUser.email?.split('@')[0] || data.username || 'user',
                    avatarUrl: currentUser.photoURL || data.avatarUrl || null,
                    joinedAt: data.joinedAt || new Date().toISOString(),
                    rank: rank,
                    totalPoints,
                    streak: {
                        current: data.streak?.current ?? data.streak ?? 0,
                        longest: data.streak?.longest ?? data.longestStreak ?? 0,
                        todayCompleted: data.streak?.todayCompleted ?? false,
                        lastActiveDate: data.streak?.lastActiveDate ?? ''
                    },
                    stats: {
                        articlesSubmitted: data.stats?.articlesSubmitted ?? data.articlesCount ?? 0,
                        casesAnalyzed: data.stats?.casesAnalyzed ?? data.completedCases ?? 0,
                        tasksCompleted: data.stats?.tasksCompleted ?? data.tasksCompleted ?? 0,
                        quizzesPassed: data.stats?.quizzesPassed ?? data.testsPassed ?? 0,
                        totalStudyHours: data.stats?.totalStudyHours ?? data.totalHours ?? 0,
                        avgDailyMinutes: data.stats?.avgDailyMinutes ?? data.avgDailyMinutes ?? 0,
                    },
                    unlockedBadges: data.unlockedBadges || []
                })
            }
            setIsLoadingProfile(false)
        }, (error) => {
            console.error("Error fetching user profile:", error)
            setIsLoadingProfile(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    // 2. Listen to Leaderboard (Top 10 users by points)
    useEffect(() => {
        if (!currentUser) return

        const q = query(
            collection(db, 'users'),
            orderBy('totalPoints', 'desc'),
            limit(10)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries: LeaderboardEntry[] = snapshot.docs.map((doc, index) => {
                const data = doc.data()
                const totalPoints = data.totalPoints || 0
                const rank = getRank(totalPoints)

                return {
                    rank: index + 1,
                    name: data.name || data.displayName || 'Anonim Foydalanuvchi',
                    username: data.email ? data.email.split('@')[0] : (data.username || `user_${doc.id.substring(0, 5)}`),
                    totalPoints,
                    level: rank.level,
                    streak: data.streak?.current || 0
                }
            })
            setLeaderboard(entries)
            setIsLoadingLeaderboard(false)
        }, (error) => {
            console.error("Error fetching leaderboard:", error)
            setIsLoadingLeaderboard(false)
        })

        return () => unsubscribe()
    }, [currentUser])

    // 3. Fetch Real Activity Data from `activities` collection
    useEffect(() => {
        if (!currentUser) return

        async function fetchActivities() {
            try {
                const last7Days = lastNDaysStrs(7)

                // Query activities for this user within the last 7 days
                const q = query(
                    collection(db, 'activities'),
                    where('userId', '==', currentUser!.uid),
                    where('dateStr', '>=', last7Days[0]),
                    orderBy('dateStr', 'asc')
                )

                const snapshot = await getDocs(q)

                // --- Daily Activity (aggregate points per day) ---
                const dailyMap: Record<string, { minutes: number; points: number }> = {}
                for (const dateStr of last7Days) {
                    dailyMap[dateStr] = { minutes: 0, points: 0 }
                }

                // --- Hourly Activity (bucket by hour) ---
                const hourlyMap: Record<string, number> = {}
                for (let h = 6; h <= 23; h++) {
                    hourlyMap[String(h).padStart(2, '0')] = 0
                }

                // --- Weekly Streak (which days had activity) ---
                const activeDays = new Set<string>()

                snapshot.docs.forEach((docSnap) => {
                    const data = docSnap.data()
                    const dateStr = data.dateStr as string
                    const amount = (data.amount as number) || 0

                    // Daily aggregation
                    if (dailyMap[dateStr]) {
                        dailyMap[dateStr].points += amount
                        // Estimate minutes from points for a rough study-time trend.
                        dailyMap[dateStr].minutes += Math.round(amount * 0.8)
                    }

                    // Hourly aggregation
                    const ts = data.timestamp
                    if (ts) {
                        const actDate = ts.toDate ? ts.toDate() : new Date(ts)
                        const hourKey = String(actDate.getHours()).padStart(2, '0')
                        if (hourlyMap[hourKey] !== undefined) {
                            hourlyMap[hourKey] += 1
                        }
                    }

                    // Track active days
                    activeDays.add(dateStr)
                })

                // Build final arrays
                const dailyResult: DailyActivity[] = last7Days.map(dateStr => ({
                    date: uzDayShort(dateStr),
                    minutes: dailyMap[dateStr].minutes,
                    points: dailyMap[dateStr].points
                }))

                const hourlyResult: HourlyActivity[] = Object.entries(hourlyMap).map(([hour, count]) => ({
                    hour,
                    count
                }))

                const weeklyResult: WeeklyStreak[] = last7Days.map(dateStr => ({
                    day: uzDayShort(dateStr).substring(0, 2),
                    active: activeDays.has(dateStr)
                }))

                setDailyActivity(dailyResult)
                setHourlyActivity(hourlyResult)
                setWeeklyStreak(weeklyResult)
            } catch (error) {
                console.error("Error fetching activity data:", error)

                // Fallback to empty data
                const last7Days = lastNDaysStrs(7)
                setDailyActivity(last7Days.map(d => ({ date: uzDayShort(d), minutes: 0, points: 0 })))
                setHourlyActivity(Array.from({ length: 18 }, (_, i) => ({
                    hour: String(i + 6).padStart(2, '0'),
                    count: 0
                })))
                setWeeklyStreak(last7Days.map(d => ({ day: uzDayShort(d).substring(0, 2), active: false })))
            } finally {
                setIsLoadingActivities(false)
            }
        }

        fetchActivities()
    }, [currentUser])

    return {
        profile,
        leaderboard,
        dailyActivity,
        hourlyActivity,
        weeklyStreak,
        isLoading: isLoadingProfile || isLoadingLeaderboard || isLoadingActivities
    }
}
