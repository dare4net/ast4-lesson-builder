import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { handleSchema } from '@/lib/contracts'
import { shouldToastInboxItem } from '@/lib/inbox'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W0 identity and inbox', () => {
    it('settings lets students pick a handle and opt into a public profile', () => {
        const settings = read('app/dashboard/student/settings/page.tsx')
        expect(settings).toContain('handleSchema')
        expect(settings).toContain('isPublicProfile')
        expect(settings).toContain('Make my profile public')
        expect(settings).toContain('Handle color')
        expect(settings).toContain('ACCENT_COLORS')
        expect(settings).toContain('Pick a handle first')
        expect(settings).toContain('Email stays private')
        expect(settings).toContain('profile.update')
    })

    it('exposes a student-dashboard public profile that never renders email', () => {
        const page = read('app/dashboard/student/u/[handle]/page.tsx')
        const profile = read('components/pride/public-profile.tsx')
        const missing = read('app/dashboard/student/u/[handle]/not-found.tsx')
        expect(page).toContain('PublicProfileView')
        expect(profile).toContain('usePeopleProfile')
        expect(profile).toContain('displayName')
        expect(profile).not.toContain('profile.email')
        expect(profile).not.toContain('user.email')
        expect(missing).toContain('private or doesn')
        expect(read('app/u/[handle]/page.tsx')).toContain('publicProfilePath')
        expect(read('middleware.ts')).not.toContain("'/u")
    })

    it('header bell is student-only and polls the inbox', () => {
        const header = read('components/dashboard/dashboard-header.tsx')
        const bell = read('components/dashboard/notification-bell.tsx')
        const hook = read('hooks/use-notifications.ts')
        expect(header).toContain('NotificationBell')
        expect(header).toContain('!isTutor && <NotificationBell')
        expect(header).toContain('PrideSearch')
        expect(header).toContain('!isTutor && (')
        expect(bell).toContain('aria-label')
        expect(bell).toContain('shouldToastInboxItem')
        expect(bell).toContain('INBOX_NOTICE')
        expect(hook).toContain('45000')
        expect(hook).toContain('queryKeys.notifications')
        expect(read('lib/api-client.ts')).toContain('/notifications')
        expect(read('lib/api-client.ts')).toContain('getByHandle')
        expect(read('lib/api-client.ts')).toContain('/people/search')
    })

    it('does not toast self-notifications', () => {
        expect(shouldToastInboxItem({ id: '1', actorId: null }, 'me')).toBe(false)
        expect(shouldToastInboxItem({ id: '1', actorId: 'me' }, 'me')).toBe(false)
        expect(shouldToastInboxItem({ id: '1', actorId: 'someone' }, 'me')).toBe(true)
        expect(handleSchema.safeParse('maya_codes').success).toBe(true)
        expect(handleSchema.safeParse('ab').success).toBe(false)
    })
})
