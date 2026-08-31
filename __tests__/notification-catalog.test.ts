import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATALOG, inboxTypes, isPushServer } from '@/lib/notification-catalog'

const readBackend = (relative: string) => readFileSync(join(process.cwd(), '..', 'afterschool-tech-backend', relative), 'utf8')

describe('push notification catalog', () => {
    it('keeps frontend and backend type lists in lockstep', () => {
        const backend = readBackend('helpers/notificationCatalog.js')
        for (const type of inboxTypes()) {
            expect(backend).toContain(`${type}:`)
        }
        expect(isPushServer('FOLLOWED_YOU')).toBe(true)
        expect(isPushServer('PROGRAM_LESSON_PUBLISHED')).toBe(true)
        expect(isPushServer('CLASS_POLL_LIVE')).toBe(true)
        expect(isPushServer('NEXT_LESSON_UNLOCKED')).toBe(true)
        expect(isPushServer('ACHIEVEMENT_EARNED')).toBe(false)
        expect(CATALOG.STREAK_REMINDER.inbox).toBe(false)
        expect(CATALOG.LESSON_REMINDER.pushServer).toBe(true)
        expect(readBackend('helpers/notify.js')).toContain('isPushServer')
        expect(readBackend('helpers/classActivity.js')).toContain('CLASS_POLL_LIVE')
    })
})
