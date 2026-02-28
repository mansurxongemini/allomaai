/* ------------------------------------------------------------------ */
/* Centralized Date Utilities (DRY)                                    */
/* ------------------------------------------------------------------ */

/**
 * Returns today's date as a YYYY-MM-DD string.
 * Replaces scattered `new Date().toISOString().split('T')[0]` usages.
 */
export function todayDateStr(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Returns a Date's YYYY-MM-DD string representation.
 */
export function toDateStr(date: Date): string {
    return date.toISOString().split('T')[0]
}

/**
 * Returns the start of today (midnight, local time).
 */
export function startOfToday(): Date {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Returns the start of the given day (midnight, local time).
 */
export function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Adds N days to a date (returns a new Date).
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

/**
 * Formats a date to Uzbek relative time string (e.g., "2 soat oldin", "1 kun oldin").
 * Falls back to DD.MM.YYYY for dates older than 7 days.
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) return "Hozirgina"
    if (diffMin < 60) return `${diffMin} daqiqa oldin`
    if (diffHr < 24) return `${diffHr} soat oldin`
    if (diffDay === 1) return "1 kun oldin"
    if (diffDay < 7) return `${diffDay} kun oldin`

    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}.${mm}.${yyyy}`
}

/**
 * Returns an array of the last N day YYYY-MM-DD strings (including today), ordered oldest → newest.
 */
export function lastNDaysStrs(n: number): string[] {
    const result: string[] = []
    const today = startOfToday()
    for (let i = n - 1; i >= 0; i--) {
        const d = addDays(today, -i)
        result.push(toDateStr(d))
    }
    return result
}

/**
 * Short Uzbek weekday name for a YYYY-MM-DD date string.
 */
const UZ_DAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"]
export function uzDayShort(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00")
    return UZ_DAYS_SHORT[d.getDay()]
}

/**
 * Formats a Firestore timestamp (or JS Date) to Uzbek date string.
 * Example: "24-fevral"
 */
export function formatFirestoreDate(timestamp: any): string {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "long" })
}

/**
 * Formats a Firestore timestamp (or JS Date) to Uzbek time string.
 * Example: "14:30"
 */
export function formatFirestoreTime(timestamp: any): string {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
}
