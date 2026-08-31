/** Days between soft “turn on notifications?” prompts after Not now. */
export const PUSH_NUDGE_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000

/** Less often when the browser blocked the native prompt. */
export const PUSH_DENIED_NUDGE_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000

function optOutKey(userId: string) {
    return `ast_push_opt_out:${userId}`
}

function nudgeKey(userId: string) {
    return `ast_push_nudge_at:${userId}`
}

function tokenKey(userId: string) {
    return `ast_fcm_token:${userId}`
}

function readStorage(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function writeStorage(key: string, value: string | null) {
    if (typeof window === 'undefined') return
    try {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
    } catch {
        /* ignore quota / private mode */
    }
}

export function isPushOptedOut(userId?: string | null) {
    if (!userId) return false
    return readStorage(optOutKey(userId)) === '1'
}

export function setPushOptedOut(userId: string, optedOut: boolean) {
    writeStorage(optOutKey(userId), optedOut ? '1' : null)
}

export function getStoredFcmToken(userId?: string | null) {
    if (!userId) return null
    return readStorage(tokenKey(userId))
}

export function setStoredFcmToken(userId: string, token: string | null) {
    writeStorage(tokenKey(userId), token)
}

export function getPushNudgeDismissedAt(userId?: string | null) {
    if (!userId) return null
    const raw = readStorage(nudgeKey(userId))
    const value = raw ? Number(raw) : NaN
    return Number.isFinite(value) ? value : null
}

export function markPushNudgeDismissed(userId: string) {
    writeStorage(nudgeKey(userId), String(Date.now()))
}

export function shouldShowPushNudge(
    userId: string | null | undefined,
    permission: NotificationPermission | 'unsupported',
) {
    if (!userId || permission === 'unsupported' || permission === 'granted') return false
    if (isPushOptedOut(userId)) return false
    const last = getPushNudgeDismissedAt(userId)
    if (!last) return true
    const interval = permission === 'denied' ? PUSH_DENIED_NUDGE_INTERVAL_MS : PUSH_NUDGE_INTERVAL_MS
    return Date.now() - last >= interval
}
