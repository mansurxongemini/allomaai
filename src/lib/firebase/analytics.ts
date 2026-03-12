import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

/**
 * Merges new weakness tags into the student's profile.weaknesses array
 * in Firestore using arrayUnion so duplicate topics are automatically
 * deduplicated by Firestore.
 */
async function mergeWeaknessTags(userId: string, tags: string[]): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        "profile.weaknesses": arrayUnion(...tags),
    });
}

/**
 * Updates the student's learning profile with newly detected weakness topics.
 *
 * Call this as a **non-blocking** fire-and-forget operation so it never
 * delays or crashes the streaming chat response.
 *
 * @param userId      - Firestore user document ID
 * @param weaknessTags - Raw tags extracted by the background AI model
 */
export async function updateStudentDosye(
    userId: string,
    weaknessTags: string[]
): Promise<void> {
    if (!userId || weaknessTags.length === 0) return;

    try {
        const sanitizedTags = weaknessTags
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        if (sanitizedTags.length === 0) return;

        await mergeWeaknessTags(userId, sanitizedTags);
        console.log(`[analytics] Weaknesses updated for user ${userId}:`, sanitizedTags);
    } catch (error) {
        // Non-fatal: analytics failures must never affect the chat response.
        console.error(`[analytics] updateStudentDosye error for user ${userId}:`, error);
    }
}
