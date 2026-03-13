import { db } from "@/lib/firebase"
import {
    doc,
    getDoc,
    updateDoc,
    increment,
    arrayUnion,
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore"
import { todayDateStr } from "@/lib/date-utils"
import { getRank, BADGE_DEFINITIONS, UserProfile } from "@/lib/gamification"

/* ------------------------------------------------------------------ */
/* Core Engine Functions */
/* ------------------------------------------------------------------ */

/**
 * Adds points to a user, recalculates their rank, and creates an activity log.
 * All Firestore operations are wrapped in try/catch for resilience.
 */
export async function addPoints(userId: string, amount: number, reason: string, additionalData?: any) {
    if (!userId || amount <= 0) return

    try {
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
            console.warn(`User ${userId} not found when adding points.`)
            return
        }

        const userData = userSnap.data() as UserProfile
        const newTotalPoints = (userData.totalPoints || 0) + amount
        const newRank = getRank(newTotalPoints)

        const updates: Partial<UserProfile> = {
            totalPoints: newTotalPoints,
            //@ts-ignore
            rank: newRank,
        }

        await updateDoc(userRef, updates)

        // Log the activity
        await addDoc(collection(db, "activities"), {
            userId,
            type: "points_gain",
            amount,
            reason,
            timestamp: serverTimestamp(),
            dateStr: todayDateStr(),
            ...additionalData
        })

        // After awarding points, also check if today's streak needs updating
        await updateDailyStreak(userId)
    } catch (error) {
        console.error(`addPoints error for user ${userId}:`, error)
        // Non-fatal: point-award failures shouldn't block UI so we swallow and log
    }
}

/**
 * Increments a specific statistic counter for the user and checks for achievements.
 */
export async function incrementStat(userId: string, statKey: keyof UserProfile["stats"], amount: number = 1) {
    if (!userId) return

    try {
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, {
            [`stats.${statKey}`]: increment(amount)
        })

        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            const updatedUser = userSnap.data() as UserProfile
            await checkAchievements(userId, updatedUser)
        }
    } catch (error) {
        console.error(`incrementStat error for user ${userId} (stat: ${statKey}):`, error)
        // Non-fatal: stat failures shouldn't block UI
    }
}

/**
 * Calculates and updates the user's daily streak.
 */
export async function updateDailyStreak(userId: string) {
    if (!userId) return

    try {
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) return

        const userData = userSnap.data() as UserProfile
        const today = todayDateStr()

        const currentStreak = userData.streak?.current || 0
        const longestStreak = userData.streak?.longest || 0
        const lastActiveDate = userData.streak?.lastActiveDate || ""

        if (lastActiveDate === today) {
            return // Already updated today
        }

        let newCurrentStreak = currentStreak

        if (!lastActiveDate) {
            newCurrentStreak = 1
        } else {
            const lastDate = new Date(lastActiveDate)
            const todayDate = new Date(today)
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                newCurrentStreak += 1
            } else if (diffDays > 1) {
                newCurrentStreak = 1
            }
        }

        const newLongestStreak = Math.max(newCurrentStreak, longestStreak)

        await updateDoc(userRef, {
            "streak.current": newCurrentStreak,
            "streak.longest": newLongestStreak,
            "streak.lastActiveDate": today,
            "streak.todayCompleted": true
        })

        await addDoc(collection(db, "activities"), {
            userId,
            type: "streak_maintained",
            streakDay: newCurrentStreak,
            timestamp: serverTimestamp(),
            dateStr: today,
        })

        const updatedSnap = await getDoc(userRef)
        if (updatedSnap.exists()) {
            await checkAchievements(userId, updatedSnap.data() as UserProfile)
        }
    } catch (error) {
        console.error(`updateDailyStreak error for user ${userId}:`, error)
        // Non-fatal
    }
}

/**
 * Evaluates user stats and streak against badge requirements.
 * Unlocks badges if criteria are met.
 */
export async function checkAchievements(userId: string, user: UserProfile) {
    if (!userId || !user) return

    try {
        const unlockedBadgeIds = user.unlockedBadges || []
        const newUnlocks: string[] = []

        for (const badge of BADGE_DEFINITIONS) {
            if (unlockedBadgeIds.includes(badge.id)) continue

            let conditionMet = false

            if (badge.metricType === "stat" && badge.statKey && badge.requirementValue !== undefined) {
                const currentValue = user.stats?.[badge.statKey as keyof typeof user.stats] || 0
                if (currentValue >= badge.requirementValue) {
                    conditionMet = true
                }
            } else if (badge.metricType === "streak" && badge.requirementValue !== undefined) {
                const currentStreak = user.streak?.longest || 0
                if (currentStreak >= badge.requirementValue) {
                    conditionMet = true
                }
            }

            if (conditionMet) {
                newUnlocks.push(badge.id)
                await addDoc(collection(db, "activities"), {
                    userId,
                    type: "badge_unlocked",
                    badgeId: badge.id,
                    timestamp: serverTimestamp(),
                    dateStr: todayDateStr()
                })
            }
        }

        if (newUnlocks.length > 0) {
            const userRef = doc(db, "users", userId)
            await updateDoc(userRef, {
                unlockedBadges: arrayUnion(...newUnlocks)
            })
        }
    } catch (error) {
        console.error(`checkAchievements error for user ${userId}:`, error)
        // Non-fatal
    }
}
