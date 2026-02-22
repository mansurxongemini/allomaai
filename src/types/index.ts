export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    xp: number;
    coins: number;
    level: number;
    completedCases: number;
    role: 'student' | 'lawyer' | 'admin';
    createdAt: any;
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

export interface Case {
    id: string;
    subjectId: string;
    title: string;
    description: string;
    questionCount: number;
    isPremium: boolean;
    price: number;
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
