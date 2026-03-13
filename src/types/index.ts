export interface StudentAnalyticsProfile {
    /** Legal topics or concepts the student has struggled with (deduplicated tags). */
    weaknesses: string[];
    /** Observed learning style, e.g. "needs more examples" or "struggles with logic". */
    learningStyle: string;
}

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    totalPoints: number;
    coins: number;
    level: number;
    completedCases: number;
    role: 'student' | 'lawyer' | 'admin';
    purchasedCases?: string[]; // Array of caseItem IDs user has purchased
    createdAt: any;
    /** Analytics & memory profile populated by background AI extraction. */
    profile?: StudentAnalyticsProfile;
}

export interface Task {
    id: string;
    title: string;
    type: 'single' | 'interval';
    intervals: number[];
    nextDueDate: Date | string; // Use ISO string or Date depending on Firestore preferences
}

export interface Blog {
    id: string;
    title: string;
    content: string;
    authorId: string;
    isPremium: boolean;
    plagiarismScore: number;
    aiScore: number;
    createdAt: any;
}

/** @deprecated Use CaseSubject / CaseItem / CaseQuestion instead */
export interface Case {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    questionCount: number;
    isPremium: boolean;
    price: number;
}

// ────────────────────────────────────────────────────────────
// Cases system (Kazuslar)
// ────────────────────────────────────────────────────────────

/** Fan bo'limi — Jinoyat huquqi, Fuqarolik huquqi, … */
export interface CaseSubject {
    id: string;
    title: string;            // Fan nomi
    description?: string;    // Qisqacha tavsif
    color?: string;           // Tailwind gradient e.g. "from-rose-500 to-rose-600"
    casesCount: number;
    createdAt: any;
}

/** Bitta kazus */
export interface CaseItem {
    id: string;
    subjectId: string;
    title: string;
    description: string;     // HTML (Tiptap)
    order: number;
    type: 'free' | 'premium';
    /** Free kazuslar uchun: null = darhol ko'rinadi, Timestamp = shu vaqtdan keyin */
    freeAfterDate: any | null;
    /** Premium uchun narx (coins) */
    price: number;
    questionsCount: number;
    createdAt: any;
    updatedAt: any;
}

/** Kazus ichidagi bitta savol + yechimi */
export interface CaseQuestion {
    id: string;
    caseId: string;
    order: number;
    questionText: string;    // HTML (Tiptap)
    solutionText: string;    // HTML (Tiptap)
    createdAt: any;
}

export interface Question {
    id: string;
    caseId: string;
    text: string;
    type: 'essay' | 'multiple-choice';
}

export interface Subject {
    id: string;
    name: string;
    topicsCount: number;
    status: 'Faol' | 'Yashirin';
    createdAt: any;
}

export interface Quiz {
    id: string;
    question: string;
    type: 'open' | 'closed';
    options?: string[]; // For closed
    correctAnswer?: string; // For closed
    explanation?: string;
}

export interface Topic {
    id: string;
    subjectId: string;
    title: string;
    content: string; // HTML from Tiptap
    firstPrinciples: string; // HTML from Tiptap (Justin Sung method)
    videoUrl?: string;
    mediaUrls?: string[];
    quizzes?: Quiz[];
    mindmapUrl?: string;
    order: number;
    createdAt: any;
    updatedAt: any;
}

export interface Method {
    id: string;
    name: string;
    topicsCount: number;
    status: 'Faol' | 'Yashirin';
    createdAt: any;
}

export interface MethodTopic {
    id: string;
    methodId: string;
    title: string;
    content: string; // HTML from Tiptap
    firstPrinciples: string; // HTML from Tiptap
    videoUrl?: string;
    mediaUrls?: string[];
    quizzes?: Quiz[];
    mindmapUrl?: string;
    order: number;
    createdAt: any;
    updatedAt: any;
}
