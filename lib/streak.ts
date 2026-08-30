export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const

export const STREAK_MILESTONE_COPY: Record<number, string> = {
    3: 'You are on fire.',
    7: 'A whole week. Unstoppable.',
    14: 'Two weeks. The podium noticed.',
    30: 'A month of showing up.',
    60: 'Two months. Rare air.',
    100: 'A hundred days. Legendary.',
}

export function streakMilestoneReward(days: number): number {
    const index = STREAK_MILESTONES.indexOf(days as typeof STREAK_MILESTONES[number])
    if (index < 0) return 0
    return 5 * (2 ** index)
}

export function nextStreakMilestone(days: number): number | null {
    const current = Number(days) || 0
    return STREAK_MILESTONES.find((mark) => mark > current) || null
}

export function utcDay(date = new Date()): string {
    return date.toISOString().slice(0, 10)
}

export function streakModalStorageKey(userId: string, day = utcDay()): string {
    return `ast-streak-modal:${userId}:${day}`
}

export function lastNUtcDays(count: number, endDay = utcDay()): string[] {
    const end = Date.parse(`${endDay}T00:00:00Z`)
    if (!Number.isFinite(end) || count < 1) return []
    return Array.from({ length: count }, (_, index) => {
        return new Date(end - (count - 1 - index) * 86400000).toISOString().slice(0, 10)
    })
}

export function inferredStreakDays(loginStreak: number, lastLoginDate?: string | null): string[] {
    const streak = Number(loginStreak) || 0
    const end = lastLoginDate || utcDay()
    if (streak < 1) return []
    return lastNUtcDays(streak, end)
}
