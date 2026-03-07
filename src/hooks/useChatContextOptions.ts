import { useState, useEffect } from 'react'
import { getDocs, collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getSubjects, getMethods } from '@/services/firestore'

export type GroupedTopicOption = {
    id: string
    title: string
    type: 'subject' | 'method'
    parentId: string // subjectId or methodId
}

export type TopicGroup = {
    id: string
    label: string
    type: 'subject' | 'method'
    topics: GroupedTopicOption[]
}

/**
 * Robustly fetches topics for a subject. Falls back to an unordered query
 * if the 'order' index doesn't exist or if topics lack that field.
 */
async function fetchTopicsRobust(subjectId: string): Promise<{ id: string; title: string }[]> {
    try {
        const topicsRef = collection(db, 'subjects', subjectId, 'topics')
        const q = query(topicsRef, orderBy('order', 'asc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))
    } catch (err: any) {
        // Fallback: query without ordering (avoids index requirement)
        console.warn(`[useChatContextOptions] orderBy('order') failed for subject "${subjectId}", falling back to unordered query. Error:`, err?.code || err?.message)
        try {
            const snapshot = await getDocs(collection(db, 'subjects', subjectId, 'topics'))
            return snapshot.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))
        } catch (innerErr) {
            console.error(`[useChatContextOptions] Failed to fetch topics for subject "${subjectId}":`, innerErr)
            return []
        }
    }
}

/**
 * Robustly fetches topics for a method. Same fallback pattern.
 */
async function fetchMethodTopicsRobust(methodId: string): Promise<{ id: string; title: string }[]> {
    try {
        const topicsRef = collection(db, 'methods', methodId, 'topics')
        const q = query(topicsRef, orderBy('order', 'asc'))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))
    } catch (err: any) {
        console.warn(`[useChatContextOptions] orderBy('order') failed for method "${methodId}", falling back to unordered query. Error:`, err?.code || err?.message)
        try {
            const snapshot = await getDocs(collection(db, 'methods', methodId, 'topics'))
            return snapshot.docs.map(d => ({ id: d.id, title: d.data().title || d.id }))
        } catch (innerErr) {
            console.error(`[useChatContextOptions] Failed to fetch topics for method "${methodId}":`, innerErr)
            return []
        }
    }
}

export function useChatContextOptions() {
    const [groups, setGroups] = useState<TopicGroup[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadOptions() {
            try {
                console.log('[useChatContextOptions] Starting to load subjects and methods...')
                const [subjects, methods] = await Promise.all([
                    getSubjects(),
                    getMethods()
                ])

                console.log(`[useChatContextOptions] Found ${subjects.length} subjects, ${methods.length} methods`)

                const newGroups: TopicGroup[] = []

                // Load Subject Topics
                for (const subject of subjects) {
                    const topics = await fetchTopicsRobust(subject.id)
                    console.log(`[useChatContextOptions] Subject "${subject.name}" has ${topics.length} topics`)
                    if (topics.length > 0) {
                        newGroups.push({
                            id: subject.id,
                            label: subject.name,
                            type: 'subject',
                            topics: topics.map(t => ({
                                id: t.id,
                                title: t.title,
                                type: 'subject',
                                parentId: subject.id
                            }))
                        })
                    }
                }

                // Load Method Topics
                for (const method of methods) {
                    const topics = await fetchMethodTopicsRobust(method.id)
                    console.log(`[useChatContextOptions] Method "${method.name}" has ${topics.length} topics`)
                    if (topics.length > 0) {
                        newGroups.push({
                            id: method.id,
                            label: method.name,
                            type: 'method',
                            topics: topics.map(t => ({
                                id: t.id,
                                title: t.title,
                                type: 'method',
                                parentId: method.id
                            }))
                        })
                    }
                }

                console.log(`[useChatContextOptions] Total groups loaded: ${newGroups.length}`)
                setGroups(newGroups)
            } catch (error) {
                console.error('[useChatContextOptions] Top-level error loading chat context options:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadOptions()
    }, [])

    return { groups, isLoading }
}
