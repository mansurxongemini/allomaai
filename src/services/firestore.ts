import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    setDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Case, Blog, Topic, Subject } from '@/types';

/**
 * Fetches a user's profile data from Firestore.
 * @param uid The unique identifier of the user.
 * @returns The user data or null if not found.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() } as unknown as User;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Fetches all cases related to a specific law subject.
 * @param subjectId The identifier of the law subject.
 * @returns An array of cases.
 */
export async function getCasesBySubject(subjectId: string): Promise<Case[]> {
    try {
        const casesRef = collection(db, 'cases');
        const q = query(casesRef, where('subjectId', '==', subjectId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Case[];
    } catch (error) {
        console.error('Error fetching cases by subject:', error);
        throw error;
    }
}

/**
 * Saves or updates a user's blog post as a draft.
 * @param blogData The blog data to save.
 */
export async function saveBlogDraft(blogData: Partial<Blog> & { authorId: string }): Promise<void> {
    try {
        const blogId = blogData.id || doc(collection(db, 'blogs')).id;
        const blogRef = doc(db, 'blogs', blogId);

        await setDoc(blogRef, {
            ...blogData,
            id: blogId,
            updatedAt: serverTimestamp(),
            createdAt: blogData.createdAt || serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error saving blog draft:', error);
        throw error;
    }
}

/**
 * Fetches all law subjects from Firestore.
 * @returns An array of subjects.
 */
export async function getSubjects(): Promise<Subject[]> {
    try {
        const subjectsRef = collection(db, 'subjects');
        const querySnapshot = await getDocs(subjectsRef);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Subject[];
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
}

/**
 * Adds a new subject to Firestore.
 * @param data The subject data.
 */
export async function addSubject(data: Partial<Subject>): Promise<void> {
    try {
        const subjectsRef = collection(db, 'subjects');
        const subjectId = doc(subjectsRef).id;
        const subjectRef = doc(db, 'subjects', subjectId);

        await setDoc(subjectRef, {
            ...data,
            id: subjectId,
            createdAt: serverTimestamp(),
            topicsCount: 0,
            status: data.status || 'Faol'
        });
    } catch (error) {
        console.error('Error adding subject:', error);
        throw error;
    }
}

/**
 * Adds a new topic to a subject.
 * @param subjectId The ID of the subject.
 * @param data The topic data.
 */
export async function addTopic(subjectId: string, data: Partial<Topic>): Promise<void> {
    try {
        const topicsRef = collection(db, 'subjects', subjectId, 'topics');
        const topicId = doc(topicsRef).id;
        const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);

        await setDoc(topicRef, {
            ...data,
            id: topicId,
            subjectId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error adding topic:', error);
        throw error;
    }
}

/**
 * Updates an existing topic.
 * @param subjectId The ID of the subject.
 * @param topicId The ID of the topic.
 * @param data The updated topic data.
 */
export async function updateTopic(subjectId: string, topicId: string, data: Partial<Topic>): Promise<void> {
    try {
        const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
        await setDoc(topicRef, {
            ...data,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating topic:', error);
        throw error;
    }
}

/**
 * Deletes a topic from a subject.
 * @param subjectId The ID of the subject.
 * @param topicId The ID of the topic.
 */
export async function deleteTopic(subjectId: string, topicId: string): Promise<void> {
    try {
        const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
        await deleteDoc(topicRef);
    } catch (error) {
        console.error('Error deleting topic:', error);
        throw error;
    }
}

/**
 * Fetches a single topic by ID.
 * @param subjectId The ID of the subject.
 * @param topicId The ID of the topic.
 * @returns The topic data.
 */
export async function getTopicDetail(subjectId: string, topicId: string): Promise<Topic | null> {
    try {
        const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
        const docSnap = await getDoc(topicRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Topic;
        }
        return null;
    } catch (error) {
        console.error('Error fetching topic detail:', error);
        throw error;
    }
}

/**
 * Fetches all topics for a given subject, ordered by the 'order' field.
 * @param subjectId The ID of the subject.
 * @returns An array of topics.
 */
export async function getTopics(subjectId: string): Promise<Topic[]> {
    try {
        const topicsRef = collection(db, 'subjects', subjectId, 'topics');
        const q = query(topicsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Topic[];
    } catch (error) {
        console.error('Error fetching topics:', error);
        throw error;
    }
}

/**
 * Uploads a mindmap file to Firebase Storage.
 * @param file The file to upload.
 * @returns The download URL.
 */
export async function uploadMindmap(file: File): Promise<string> {
    try {
        const storageRef = ref(storage, `mindmaps/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error uploading mindmap:', error);
        throw error;
    }
}
