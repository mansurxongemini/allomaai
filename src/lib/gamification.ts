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
  progress: number // 0-100
  requirement: string
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
  }
  stats: {
    articlesSubmitted: number
    casesAnalyzed: number
    tasksCompleted: number
    quizzesPassed: number
    totalStudyHours: number
    avgDailyMinutes: number
  }
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
/* Mock Data                                                           */
/* ------------------------------------------------------------------ */
export const MOCK_USER: UserProfile = {
  id: "u1",
  name: "Sardor Alimov",
  username: "sardor_alimov",
  avatarUrl: null,
  joinedAt: "2025-09-01",
  rank: RANKS[3],
  xp: 1420,
  totalPoints: 3850,
  streak: {
    current: 12,
    longest: 28,
    todayCompleted: true,
  },
  stats: {
    articlesSubmitted: 24,
    casesAnalyzed: 47,
    tasksCompleted: 136,
    quizzesPassed: 18,
    totalStudyHours: 214,
    avgDailyMinutes: 45,
  },
}

export const MOCK_BADGES: Badge[] = [
  {
    id: "b1",
    title: "Birinchi qadam",
    description: "Birinchi maqolani yuborish",
    iconName: "Footprints",
    tier: "bronze",
    unlockedAt: "2025-09-05",
    progress: 100,
    requirement: "1 ta maqola yuborish",
  },
  {
    id: "b2",
    title: "Muntazam o'quvchi",
    description: "7 kunlik seriyani to'ldirish",
    iconName: "Flame",
    tier: "silver",
    unlockedAt: "2025-10-12",
    progress: 100,
    requirement: "7 kunlik seriya",
  },
  {
    id: "b3",
    title: "Tahlilchi",
    description: "25 ta ishni tahlil qilish",
    iconName: "Brain",
    tier: "gold",
    unlockedAt: "2026-01-20",
    progress: 100,
    requirement: "25 ta ish tahlili",
  },
  {
    id: "b4",
    title: "Yulduz talaba",
    description: "100 ta vazifani bajarish",
    iconName: "Star",
    tier: "gold",
    unlockedAt: "2026-02-10",
    progress: 100,
    requirement: "100 ta vazifa",
  },
  {
    id: "b5",
    title: "Oy raqibi",
    description: "30 kunlik seriyani to'ldirish",
    iconName: "Trophy",
    tier: "platinum",
    unlockedAt: null,
    progress: 40,
    requirement: "30 kunlik seriya",
  },
  {
    id: "b6",
    title: "Maqola ustasi",
    description: "50 ta maqola yuborish",
    iconName: "FileText",
    tier: "silver",
    unlockedAt: null,
    progress: 48,
    requirement: "50 ta maqola",
  },
  {
    id: "b7",
    title: "Marafon yuguruvchi",
    description: "90 kunlik seriyani to'ldirish",
    iconName: "Medal",
    tier: "platinum",
    unlockedAt: null,
    progress: 13,
    requirement: "90 kunlik seriya",
  },
  {
    id: "b8",
    title: "Huquqshunos",
    description: "Barcha huquq sohalarida ish tahlil qilish",
    iconName: "Scale",
    tier: "gold",
    unlockedAt: null,
    progress: 66,
    requirement: "6 ta soha",
  },
]

export const MOCK_DAILY_ACTIVITY: DailyActivity[] = [
  { date: "Dush", minutes: 52, points: 45 },
  { date: "Sesh", minutes: 38, points: 32 },
  { date: "Chor", minutes: 65, points: 58 },
  { date: "Pay", minutes: 41, points: 35 },
  { date: "Jum", minutes: 70, points: 62 },
  { date: "Shan", minutes: 25, points: 20 },
  { date: "Yak", minutes: 48, points: 40 },
]

export const MOCK_HOURLY_ACTIVITY: HourlyActivity[] = [
  { hour: "06", count: 2 },
  { hour: "07", count: 5 },
  { hour: "08", count: 12 },
  { hour: "09", count: 18 },
  { hour: "10", count: 22 },
  { hour: "11", count: 15 },
  { hour: "12", count: 8 },
  { hour: "13", count: 10 },
  { hour: "14", count: 20 },
  { hour: "15", count: 25 },
  { hour: "16", count: 19 },
  { hour: "17", count: 14 },
  { hour: "18", count: 11 },
  { hour: "19", count: 16 },
  { hour: "20", count: 22 },
  { hour: "21", count: 18 },
  { hour: "22", count: 8 },
  { hour: "23", count: 3 },
]

export const MOCK_WEEKLY_STREAK: WeeklyStreak[] = [
  { day: "Du", active: true },
  { day: "Se", active: true },
  { day: "Ch", active: true },
  { day: "Pa", active: true },
  { day: "Ju", active: true },
  { day: "Sh", active: false },
  { day: "Ya", active: true },
]

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Nodira Karimova", username: "nodira_k", xp: 4200, level: 6, streak: 45 },
  { rank: 2, name: "Jasur Toshmatov", username: "jasur_t", xp: 3100, level: 5, streak: 32 },
  { rank: 3, name: "Malika Rahimova", username: "malika_r", xp: 2800, level: 5, streak: 22 },
  { rank: 4, name: "Sardor Alimov", username: "sardor_alimov", xp: 1420, level: 4, streak: 12 },
  { rank: 5, name: "Dilnoza Yusupova", username: "dilnoza_y", xp: 1100, level: 3, streak: 8 },
  { rank: 6, name: "Bobur Sharipov", username: "bobur_sh", xp: 980, level: 3, streak: 15 },
  { rank: 7, name: "Zarina Mirzaeva", username: "zarina_m", xp: 750, level: 2, streak: 5 },
  { rank: 8, name: "Akmal Normatov", username: "akmal_n", xp: 520, level: 2, streak: 3 },
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
