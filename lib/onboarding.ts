import type { User } from '@/context/auth-context'

export const ONBOARDING_BONUS_STARS = 5

export function isStudentRole(role?: string | null) {
    const value = String(role || '').toLowerCase()
    return value === 'student'
}

export function hasExperiencedOnboarding(user?: Pick<User, 'onboardingCompletedAt' | 'onboardingSkippedAt'> | null) {
    return Boolean(user?.onboardingCompletedAt || user?.onboardingSkippedAt)
}

export function isOnboardingReplay(search?: string | null) {
    if (!search) return false
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    const value = params.get('replay') || params.get('preview')
    return value === '1' || value === 'true'
}

export function needsOnboarding(user?: User | null) {
    if (!user) return false
    if (!isStudentRole(user.role)) return false
    return !hasExperiencedOnboarding(user)
}

export function safeNextPath(next?: string | null) {
    if (!next || !next.startsWith('/') || next.startsWith('//')) return null
    if (next.startsWith('/onboarding')) return null
    return next
}

export function studentPostAuthPath(user: User | null | undefined, next?: string | null) {
    const dest = safeNextPath(next)
    if (needsOnboarding(user)) {
        return dest ? `/onboarding?next=${encodeURIComponent(dest)}` : '/onboarding'
    }
    return dest || '/dashboard/student'
}

export function suggestHandle(displayName?: string | null) {
    const first = String(displayName || '').trim().split(/\s+/)[0] || 'student'
    let slug = first
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    if (!slug) slug = 'student'
    if (!/^[a-z]/.test(slug)) slug = `s${slug}`
    if (slug.length < 3) slug = `${slug}xxx`.slice(0, 8)
    return slug.slice(0, 20)
}
