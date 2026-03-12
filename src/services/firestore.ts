import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    setDoc,
    updateDoc,
    deleteDoc,
    increment,
    serverTimestamp,
    getCountFromServer,
    runTransaction
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Case, Blog, Topic, Subject, Method, MethodTopic, CaseSubject, CaseItem, CaseQuestion } from '@/types';

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

        const subjects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            topicsCount: doc.data().topicsCount || 0,
            ...doc.data()
        })) as Subject[];

        return subjects;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
}

/**
 * Fetches a single subject by ID.
 * @param subjectId The ID of the subject.
 * @returns The subject data.
 */
export async function getSubject(subjectId: string): Promise<Subject | null> {
    try {
        const subjectRef = doc(db, 'subjects', subjectId);
        const docSnap = await getDoc(subjectRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Subject;
        }
        return null;
    } catch (error) {
        console.error('Error fetching subject detail:', error);
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
        await runTransaction(db, async (transaction) => {
            const topicsRef = collection(db, 'subjects', subjectId, 'topics');
            const topicId = doc(topicsRef).id;
            const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
            const subjectRef = doc(db, 'subjects', subjectId);

            transaction.set(topicRef, {
                ...data,
                id: topicId,
                subjectId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            transaction.update(subjectRef, {
                topicsCount: increment(1)
            });
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
        await runTransaction(db, async (transaction) => {
            const topicRef = doc(db, 'subjects', subjectId, 'topics', topicId);
            const subjectRef = doc(db, 'subjects', subjectId);

            transaction.delete(topicRef);
            transaction.update(subjectRef, {
                topicsCount: increment(-1)
            });
        });
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

// ==========================================
// Methods CRUD
// ==========================================

/**
 * Fetches all methods from Firestore.
 */
export async function getMethods(): Promise<Method[]> {
    try {
        const methodsRef = collection(db, 'methods');
        const querySnapshot = await getDocs(methodsRef);

        const methods = querySnapshot.docs.map(doc => ({
            id: doc.id,
            topicsCount: doc.data().topicsCount || 0,
            ...doc.data()
        })) as Method[];

        return methods;
    } catch (error) {
        console.error('Error fetching methods:', error);
        throw error;
    }
}

/**
 * Fetches a single method by ID.
 */
export async function getMethod(methodId: string): Promise<Method | null> {
    try {
        const methodRef = doc(db, 'methods', methodId);
        const docSnap = await getDoc(methodRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Method;
        }
        return null;
    } catch (error) {
        console.error('Error fetching method detail:', error);
        throw error;
    }
}

/**
 * Adds a new method to Firestore.
 */
export async function addMethod(data: Partial<Method>): Promise<void> {
    try {
        const methodsRef = collection(db, 'methods');
        const methodId = doc(methodsRef).id;
        const methodRef = doc(db, 'methods', methodId);

        await setDoc(methodRef, {
            ...data,
            id: methodId,
            createdAt: serverTimestamp(),
            topicsCount: 0,
            status: data.status || 'Faol'
        });
    } catch (error) {
        console.error('Error adding method:', error);
        throw error;
    }
}

/**
 * Deletes a method from Firestore.
 */
export async function deleteMethod(methodId: string): Promise<void> {
    try {
        const methodRef = doc(db, 'methods', methodId);
        await deleteDoc(methodRef);
    } catch (error) {
        console.error('Error deleting method:', error);
        throw error;
    }
}

// ==========================================
// Method Topics CRUD
// ==========================================

/**
 * Fetches all topics for a given method, ordered by 'order'.
 */
export async function getMethodTopics(methodId: string): Promise<MethodTopic[]> {
    try {
        // NOTE: Do NOT use orderBy here — it requires a composite Firestore index.
        // We sort client-side instead to avoid index-related permission errors.
        const topicsRef = collection(db, 'methods', methodId, 'topics');
        const querySnapshot = await getDocs(topicsRef);

        const topics = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MethodTopic[];

        return topics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (error) {
        console.error('Error fetching method topics:', error);
        throw error;
    }
}

/**
 * Fetches a single method topic by ID.
 */
export async function getMethodTopicDetail(methodId: string, topicId: string): Promise<MethodTopic | null> {
    try {
        const topicRef = doc(db, 'methods', methodId, 'topics', topicId);
        const docSnap = await getDoc(topicRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as MethodTopic;
        }
        return null;
    } catch (error) {
        console.error('Error fetching method topic detail:', error);
        throw error;
    }
}

/**
 * Adds a new topic to a method.
 */
export async function addMethodTopic(methodId: string, data: Partial<MethodTopic>): Promise<void> {
    try {
        // Use sequential writes (not a transaction) — same pattern as addSubject.
        // Transactions that simultaneously write to a subcollection AND update the parent
        // cause Firestore security rules to fail with "permission-denied" even when
        // both paths are explicitly allowed.
        const topicsRef = collection(db, 'methods', methodId, 'topics');
        const topicId = doc(topicsRef).id;
        const topicRef = doc(db, 'methods', methodId, 'topics', topicId);

        await setDoc(topicRef, {
            ...data,
            id: topicId,
            methodId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        const methodRef = doc(db, 'methods', methodId);
        await updateDoc(methodRef, {
            topicsCount: increment(1)
        });
    } catch (error) {
        console.error('Error adding method topic:', error);
        throw error;
    }
}

/**
 * Updates an existing method topic.
 */
export async function updateMethodTopic(methodId: string, topicId: string, data: Partial<MethodTopic>): Promise<void> {
    try {
        const topicRef = doc(db, 'methods', methodId, 'topics', topicId);
        await setDoc(topicRef, {
            ...data,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error updating method topic:', error);
        throw error;
    }
}

/**
 * Deletes a topic from a method.
 */
export async function deleteMethodTopic(methodId: string, topicId: string): Promise<void> {
    try {
        await runTransaction(db, async (transaction) => {
            const topicRef = doc(db, 'methods', methodId, 'topics', topicId);
            const methodRef = doc(db, 'methods', methodId);

            // Firestore requires reading a document before updating it in a transaction
            await transaction.get(methodRef);

            transaction.delete(topicRef);
            transaction.update(methodRef, {
                topicsCount: increment(-1)
            });
        });
    } catch (error) {
        console.error('Error deleting method topic:', error);
        throw error;
    }
}

// ==========================================
// Cases System CRUD (Kazuslar tizimi)
// ==========================================

/** Fetches all case subjects ordered by createdAt asc. */
export async function getCaseSubjects(): Promise<CaseSubject[]> {
    try {
        const ref = collection(db, 'caseSubjects');
        const q = query(ref, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CaseSubject[];
    } catch (error) { console.error('Error fetching caseSubjects:', error); throw error; }
}

/** Fetches a single case subject by ID. */
export async function getCaseSubject(subjectId: string): Promise<CaseSubject | null> {
    try {
        const snap = await getDoc(doc(db, 'caseSubjects', subjectId));
        return snap.exists() ? { id: snap.id, ...snap.data() } as CaseSubject : null;
    } catch (error) { console.error('Error fetching caseSubject:', error); throw error; }
}

/** Adds a new case subject. Returns the new ID. */
export async function addCaseSubject(data: Pick<CaseSubject, 'title' | 'description' | 'color'>): Promise<string> {
    try {
        const newRef = doc(collection(db, 'caseSubjects'));
        await setDoc(newRef, { ...data, id: newRef.id, casesCount: 0, createdAt: serverTimestamp() });
        return newRef.id;
    } catch (error) { console.error('Error adding caseSubject:', error); throw error; }
}

/** Deletes a case subject. */
export async function deleteCaseSubject(subjectId: string): Promise<void> {
    try { await deleteDoc(doc(db, 'caseSubjects', subjectId)); }
    catch (error) { console.error('Error deleting caseSubject:', error); throw error; }
}

/** Fetches all cases for a subject, ordered by 'order'. */
export async function getCases(subjectId: string): Promise<CaseItem[]> {
    try {
        const q = query(collection(db, 'cases'), where('subjectId', '==', subjectId), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CaseItem[];
    } catch (error) { console.error('Error fetching cases:', error); throw error; }
}

/** Fetches a single case by ID. */
export async function getCaseDetail(caseId: string): Promise<CaseItem | null> {
    try {
        const snap = await getDoc(doc(db, 'cases', caseId));
        return snap.exists() ? { id: snap.id, ...snap.data() } as CaseItem : null;
    } catch (error) { console.error('Error fetching case detail:', error); throw error; }
}

/** Creates a new case. Returns the new ID. */
export async function addCase(subjectId: string, data: Partial<CaseItem>): Promise<string> {
    try {
        return await runTransaction(db, async (transaction) => {
            const newCaseRef = doc(collection(db, 'cases'));
            const subjectRef = doc(db, 'caseSubjects', subjectId);

            transaction.set(newCaseRef, {
                ...data,
                id: newCaseRef.id,
                subjectId,
                questionsCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            transaction.update(subjectRef, { casesCount: increment(1) });
            return newCaseRef.id;
        });
    } catch (error) {
        console.error('Error adding case:', error);
        throw error;
    }
}

/** Updates an existing case (merge). */
export async function updateCaseItem(caseId: string, data: Partial<CaseItem>): Promise<void> {
    try {
        await setDoc(doc(db, 'cases', caseId), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) { console.error('Error updating case:', error); throw error; }
}

/** Deletes a case and decrements parent subject casesCount. */
export async function deleteCase(subjectId: string, caseId: string): Promise<void> {
    try {
        await runTransaction(db, async (transaction) => {
            const caseRef = doc(db, 'cases', caseId);
            const subjectRef = doc(db, 'caseSubjects', subjectId);

            transaction.delete(caseRef);
            transaction.update(subjectRef, { casesCount: increment(-1) });
        });
    } catch (error) {
        console.error('Error deleting case:', error);
        throw error;
    }
}

/** Fetches all questions for a case, ordered by 'order'. */
export async function getQuestions(caseId: string): Promise<CaseQuestion[]> {
    try {
        const q = query(collection(db, 'cases', caseId, 'questions'), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as CaseQuestion[];
    } catch (error) { console.error('Error fetching questions:', error); throw error; }
}

/** Adds a question to a case, increments questionsCount. Returns new ID. */
export async function addQuestion(caseId: string, data: Partial<CaseQuestion>): Promise<string> {
    try {
        const newRef = doc(collection(db, 'cases', caseId, 'questions'));
        await setDoc(newRef, { ...data, id: newRef.id, caseId, createdAt: serverTimestamp() });
        await updateDoc(doc(db, 'cases', caseId), { questionsCount: increment(1) });
        return newRef.id;
    } catch (error) { console.error('Error adding question:', error); throw error; }
}

/** Updates a question (merge). */
export async function updateQuestion(caseId: string, questionId: string, data: Partial<CaseQuestion>): Promise<void> {
    try {
        await setDoc(doc(db, 'cases', caseId, 'questions', questionId), data, { merge: true });
    } catch (error) { console.error('Error updating question:', error); throw error; }
}

/** Deletes a question, decrements questionsCount. */
export async function deleteQuestion(caseId: string, questionId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, 'cases', caseId, 'questions', questionId));
        await updateDoc(doc(db, 'cases', caseId), { questionsCount: increment(-1) });
    } catch (error) { console.error('Error deleting question:', error); throw error; }
}

// ==========================================
// Student Analytics
// ==========================================

/**
 * Returns the list of weakness topic tags stored on a user's profile.
 * Safe to call from the API route — returns an empty array on any error so
 * a Firestore failure never breaks the chat response.
 *
 * @param userId - Firestore user document ID (users/{userId})
 */
export async function getUserWeaknesses(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (!userSnap.exists()) return [];
        const data = userSnap.data();
        const weaknesses = data?.profile?.weaknesses;
        return Array.isArray(weaknesses) ? weaknesses.filter((t: unknown) => typeof t === 'string' && t.trim().length > 0) : [];
    } catch (error) {
        console.error('[firestore] getUserWeaknesses error:', error);
        return [];
    }
}
