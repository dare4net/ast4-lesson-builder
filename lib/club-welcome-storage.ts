const PREFIX = 'ast-club-welcome'
const SPLASH_PREFIX = 'ast-club-splash'

export function clubWelcomeStorageKey(userId: string, orgId: string) {
    return `${PREFIX}:${userId}:${orgId}`
}

export function clubSplashStorageKey(userId: string, orgId: string) {
    return `${SPLASH_PREFIX}:${userId}:${orgId}`
}

export function hasSeenClubWelcome(userId: string, orgId: string) {
    try {
        return window.localStorage.getItem(clubWelcomeStorageKey(userId, orgId)) === '1'
    } catch {
        return false
    }
}

export function markClubWelcomeSeen(userId: string, orgId: string) {
    try {
        window.localStorage.setItem(clubWelcomeStorageKey(userId, orgId), '1')
    } catch {
        // ignore
    }
}

export function hasSeenClubSplash(userId: string, orgId: string) {
    try {
        return window.localStorage.getItem(clubSplashStorageKey(userId, orgId)) === '1'
    } catch {
        return false
    }
}

export function markClubSplashSeen(userId: string, orgId: string) {
    try {
        window.localStorage.setItem(clubSplashStorageKey(userId, orgId), '1')
    } catch {
        // ignore
    }
}
