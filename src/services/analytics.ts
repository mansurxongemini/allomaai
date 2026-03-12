import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WeaknessTopic {
    topic: string;
    count: number;
}

export interface WeaknessDashboardData {
    /** Frequency-sorted list of weakness topics across all students. */
    chartData: WeaknessTopic[];
    /** Total number of user documents in Firestore. */
    totalStudents: number;
    /** Number of users who have at least one weakness tag recorded. */
    totalAnalyzedStudents: number;
    /** The most frequently recorded weakness topic, or '—' if none. */
    hardestTopic: string;
    /** Average number of unique weakness tags per analyzed student (1 decimal). */
    avgWeaknessesPerStudent: number;
}

/**
 * Reads every user document from Firestore, aggregates their
 * `profile.weaknesses` arrays, and returns a frequency-sorted list
 * together with summary statistics for the Dean's Analytics Dashboard.
 *
 * This function is designed to be called from a client component
 * (uses the browser-side Firebase SDK). All errors are swallowed so
 * a Firestore failure never crashes the dashboard.
 */
export async function getAggregatedWeaknesses(): Promise<WeaknessDashboardData> {
    try {
        const usersSnap = await getDocs(collection(db, 'users'));

        const frequencyMap = new Map<string, number>();
        let totalStudents = 0;
        let analyzedStudents = 0;
        let totalWeaknessEntries = 0;

        usersSnap.forEach((userDoc) => {
            totalStudents++;
            const data = userDoc.data();
            const weaknesses: unknown = data?.profile?.weaknesses;

            if (Array.isArray(weaknesses) && weaknesses.length > 0) {
                analyzedStudents++;
                weaknesses.forEach((tag: unknown) => {
                    if (typeof tag === 'string' && tag.trim().length > 0) {
                        const normalized = tag.trim();
                        frequencyMap.set(normalized, (frequencyMap.get(normalized) ?? 0) + 1);
                        totalWeaknessEntries++;
                    }
                });
            }
        });

        const chartData = Array.from(frequencyMap.entries())
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count);

        return {
            chartData,
            totalStudents,
            totalAnalyzedStudents: analyzedStudents,
            hardestTopic: chartData[0]?.topic ?? '—',
            avgWeaknessesPerStudent:
                analyzedStudents > 0
                    ? Math.round((totalWeaknessEntries / analyzedStudents) * 10) / 10
                    : 0,
        };
    } catch (error) {
        console.error('[analytics] getAggregatedWeaknesses error:', error);
        return {
            chartData: [],
            totalStudents: 0,
            totalAnalyzedStudents: 0,
            hardestTopic: '—',
            avgWeaknessesPerStudent: 0,
        };
    }
}
