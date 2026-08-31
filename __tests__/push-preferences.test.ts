import { describe, expect, it, beforeEach } from 'vitest'
import {
    PUSH_DENIED_NUDGE_INTERVAL_MS,
    PUSH_NUDGE_INTERVAL_MS,
    getPushNudgeDismissedAt,
    isPushOptedOut,
    markPushNudgeDismissed,
    setPushOptedOut,
    shouldShowPushNudge,
} from '@/lib/push-preferences'

describe('push notification preferences', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('tracks opt-out per user', () => {
        setPushOptedOut('u1', true)
        expect(isPushOptedOut('u1')).toBe(true)
        expect(isPushOptedOut('u2')).toBe(false)
        setPushOptedOut('u1', false)
        expect(isPushOptedOut('u1')).toBe(false)
    })

    it('waits seven days before nudging again after Not now', () => {
        const now = Date.now()
        markPushNudgeDismissed('u1')
        expect(getPushNudgeDismissedAt('u1')).toBeGreaterThanOrEqual(now)
        expect(shouldShowPushNudge('u1', 'default')).toBe(false)
        localStorage.setItem(`ast_push_nudge_at:u1`, String(now - PUSH_NUDGE_INTERVAL_MS - 1))
        expect(shouldShowPushNudge('u1', 'default')).toBe(true)
    })

    it('does not nudge when granted, opted out, or unsupported', () => {
        expect(shouldShowPushNudge('u1', 'granted')).toBe(false)
        expect(shouldShowPushNudge('u1', 'unsupported')).toBe(false)
        setPushOptedOut('u1', true)
        expect(shouldShowPushNudge('u1', 'default')).toBe(false)
    })

    it('uses a longer interval when the browser blocked the prompt', () => {
        const now = Date.now()
        localStorage.setItem(`ast_push_nudge_at:u1`, String(now - PUSH_NUDGE_INTERVAL_MS - 1))
        expect(shouldShowPushNudge('u1', 'denied')).toBe(false)
        localStorage.setItem(`ast_push_nudge_at:u1`, String(now - PUSH_DENIED_NUDGE_INTERVAL_MS - 1))
        expect(shouldShowPushNudge('u1', 'denied')).toBe(true)
    })
})
