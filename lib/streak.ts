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

export function previousStreakMilestone(days: number): number | null {
    const current = Number(days) || 0
    const reached = [...STREAK_MILESTONES].filter((mark) => mark <= current)
    return reached.length ? reached[reached.length - 1] : null
}

export type StreakHeat = {
    flame: string
    from: string
    to: string
    border: string
    chipBorder: string
    chipBg: string
    chipText: string
    label: string
}

export function streakHeat(days: number): StreakHeat {
    const n = Number(days) || 0
    if (n >= 100) {
        return { flame: '#F4B942', from: '#5B21B6', to: '#F59E0B', border: '#F4B942', chipBorder: 'border-amber-400', chipBg: 'bg-violet-50', chipText: 'text-violet-700', label: 'Legendary' }
    }
    if (n >= 60) {
        return { flame: '#F0ABFC', from: '#6D28D9', to: '#DB2777', border: '#E879F9', chipBorder: 'border-fuchsia-400', chipBg: 'bg-fuchsia-50', chipText: 'text-fuchsia-700', label: 'Rare air' }
    }
    if (n >= 30) {
        return { flame: '#FFC800', from: '#F59E0B', to: '#B45309', border: '#FFC800', chipBorder: 'border-amber-400', chipBg: 'bg-amber-50', chipText: 'text-amber-800', label: 'Month of fire' }
    }
    if (n >= 14) {
        return { flame: '#38BDF8', from: '#0284C7', to: '#1E3A8A', border: '#1CB0F6', chipBorder: 'border-sky-400', chipBg: 'bg-sky-50', chipText: 'text-sky-700', label: 'Blazing' }
    }
    if (n >= 7) {
        return { flame: '#E879F9', from: '#A855F7', to: '#E11D48', border: '#CE82FF', chipBorder: 'border-fuchsia-400', chipBg: 'bg-fuchsia-50', chipText: 'text-fuchsia-700', label: 'Unstoppable' }
    }
    if (n >= 3) {
        return { flame: '#FF4B4B', from: '#FF4B4B', to: '#9F1239', border: '#FF4B4B', chipBorder: 'border-red-400', chipBg: 'bg-red-50', chipText: 'text-red-600', label: 'Heating up' }
    }
    return { flame: '#FF9600', from: '#FF9600', to: '#FF4B4B', border: '#FF9600', chipBorder: 'border-[#FF9600]/30', chipBg: 'bg-orange-50', chipText: 'text-[#FF9600]', label: 'Spark' }
}

export function inferredStreakDays(loginStreak: number, lastLoginDate?: string | null): string[] {
    const streak = Number(loginStreak) || 0
    const end = lastLoginDate || utcDay()
    if (streak < 1) return []
    return lastNUtcDays(streak, end)
}
