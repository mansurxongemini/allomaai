import { db } from "@/lib/firebase"
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    deleteDoc
} from "firebase/firestore"
import { UIMessage } from "ai"

export interface ChatSession {
    id: string
    userId: string
    title: string
    messages: UIMessage[]
    createdAt: any
    updatedAt: any
}

/**
 * Subscribes to all chat sessions for a specific user, ordered by most recent first.
 */
export function subscribeToUserChats(
    userId: string,
    callback: (chats: ChatSession[]) => void
) {
    if (!userId) return () => { }

    const q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
    )

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        })) as ChatSession[]
        callback(chats)
    })
}

/**
 * Creates a new chat session for the user.
 */
export async function createChatSession(userId: string, title: string = "Yangi suhbat"): Promise<string> {
    const docRef = await addDoc(collection(db, "chats"), {
        userId,
        title,
        messages: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    })
    return docRef.id
}

/**
 * Updates the messages array in a specific chat session.
 */
export async function updateChatMessages(chatId: string, messages: UIMessage[], title?: string) {
    if (!chatId) return

    // Firestore rejects `undefined` values. UIMessage objects from the AI SDK
    // contain optional fields that can be undefined, so we strip them via JSON round-trip.
    const sanitizedMessages = JSON.parse(JSON.stringify(messages))

    const updates: any = {
        messages: sanitizedMessages,
        updatedAt: serverTimestamp()
    }

    if (title) {
        updates.title = title
    }

    await updateDoc(doc(db, "chats", chatId), updates)
}

/**
 * Deletes a chat session.
 */
export async function deleteChatSession(chatId: string) {
    if (!chatId) return
    await deleteDoc(doc(db, "chats", chatId))
}
