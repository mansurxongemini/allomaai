/* ------------------------------------------------------------------ */
/* Gamification Data Layer — Types, mock data & helpers                */
/* Scalable: swap mock data for API calls when backend is ready       */
/* ------------------------------------------------------------------ */

/* ---------- Badge / Achievement ---------- */
export interface Badge {
  id: string
  title: string
  description: string
  iconName: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  unlockedAt: string | null // ISO date or null = locked
  progress: number // 0-100 (Dynamic UI calculation)
  requirement: string
  metricType?: "stat" | "streak"
  statKey?: string
  requirementValue?: number
}

/* ---------- Rank ---------- */
export interface Rank {
  level: number
  title: string
  minXp: number
  maxXp: number
  color: string
}

/* ---------- User Profile ---------- */
export interface UserProfile {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  joinedAt: string
  rank: Rank
  xp: number
  totalPoints: number
  streak: {
    current: number
    longest: number
    todayCompleted: boolean
    lastActiveDate: string
  }
  stats: {
    articlesSubmitted: number
    casesAnalyzed: number
    tasksCompleted: number
    quizzesPassed: number
    totalStudyHours: number
    avgDailyMinutes: number
  }
  unlockedBadges: string[]
}

/* ---------- Activity data for charts ---------- */
export interface DailyActivity {
  date: string
  minutes: number
  points: number
}

export interface HourlyActivity {
  hour: string
  count: number
}

export interface WeeklyStreak {
  day: string
  active: boolean
}

/* ---------- Leaderboard ---------- */
export interface LeaderboardEntry {
  rank: number
  name: string
  username: string
  xp: number
  level: number
  streak: number
}

/* ------------------------------------------------------------------ */
/* Ranks                                                               */
/* ------------------------------------------------------------------ */
export const RANKS: Rank[] = [
  { level: 1, title: "Yangi talaba", minXp: 0, maxXp: 200, color: "#94a3b8" },
  { level: 2, title: "Tinglovchi", minXp: 200, maxXp: 500, color: "#0d9488" },
  { level: 3, title: "Tadqiqotchi", minXp: 500, maxXp: 1000, color: "#0891b2" },
  { level: 4, title: "Tahlilchi", minXp: 1000, maxXp: 2000, color: "#7c3aed" },
  { level: 5, title: "Mutaxassis", minXp: 2000, maxXp: 3500, color: "#db2777" },
  { level: 6, title: "Ustoz", minXp: 3500, maxXp: 5000, color: "#ea580c" },
  { level: 7, title: "Alloma", minXp: 5000, maxXp: 10000, color: "#ca8a04" },
]

export function getRank(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i]
  }
  return RANKS[0]
}

export function getXpProgress(xp: number): number {
  const rank = getRank(xp)
  const range = rank.maxXp - rank.minXp
  if (range <= 0) return 100
  return Math.min(100, Math.round(((xp - rank.minXp) / range) * 100))
}

/* ------------------------------------------------------------------ */
/* Badge Definitions (Source of truth for unlocking)                    */
/* ------------------------------------------------------------------ */
export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: "b1",
    title: "Birinchi qadam",
    description: "Birinchi maqolani yuborish",
    iconName: "Footprints",
    tier: "bronze",
    unlockedAt: null,
    progress: 0,
    requirement: "1 ta maqola yuborish",
    metricType: "stat",
    statKey: "articlesSubmitted",
    requirementValue: 1
  },
  {
    id: "b2",
    title: "Muntazam o'quvchi",
    description: "7 kunlik seriyani to'ldirish",
    iconName: "Flame",
    tier: "silver",
    unlockedAt: null,
    progress: 0,
    requirement: "7 kunlik seriya",
    metricType: "streak",
    requirementValue: 7
  },
  {
    id: "b3",
    title: "Tahlilchi",
    description: "25 ta ishni tahlil qilish",
    iconName: "Brain",
    tier: "gold",
    unlockedAt: null,
    progress: 0,
    requirement: "25 ta ish tahlili",
    metricType: "stat",
    statKey: "casesAnalyzed",
    requirementValue: 25
  },
  {
    id: "b4",
    title: "Yulduz talaba",
    description: "100 ta vazifani bajarish",
    iconName: "Star",
    tier: "gold",
    unlockedAt: null,
    progress: 0,
    requirement: "100 ta vazifa",
    metricType: "stat",
    statKey: "tasksCompleted",
    requirementValue: 100
  },
  {
    id: "b5",
    title: "Oy raqibi",
    description: "30 kunlik seriyani to'ldirish",
    iconName: "Trophy",
    tier: "platinum",
    unlockedAt: null,
    progress: 0,
    requirement: "30 kunlik seriya",
    metricType: "streak",
    requirementValue: 30
  },
  {
    id: "b6",
    title: "Maqola ustasi",
    description: "50 ta maqola yuborish",
    iconName: "FileText",
    tier: "silver",
    unlockedAt: null,
    progress: 0,
    requirement: "50 ta maqola",
    metricType: "stat",
    statKey: "articlesSubmitted",
    requirementValue: 50
  },
  {
    id: "b7",
    title: "Marafon yuguruvchi",
    description: "90 kunlik seriyani to'ldirish",
    iconName: "Medal",
    tier: "platinum",
    unlockedAt: null,
    progress: 0,
    requirement: "90 kunlik seriya",
    metricType: "streak",
    requirementValue: 90
  }
]


/* ------------------------------------------------------------------ */
/* Tier styling                                                        */
/* ------------------------------------------------------------------ */
export const TIER_STYLES: Record<Badge["tier"], { bg: string; text: string; border: string; ring: string }> = {
  bronze: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", ring: "ring-orange-200" },
  silver: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-300", ring: "ring-slate-300" },
  gold: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300", ring: "ring-amber-300" },
  platinum: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-300", ring: "ring-teal-300" },
}
