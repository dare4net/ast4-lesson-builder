import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLATFORM_MISSIONS } from '@/lib/mission-engine'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('expandable missions and achievements', () => {
    it('shows all toasts at the top of the screen', () => {
        const gamification = read('components/ui/gamification-toast.tsx')
        expect(gamification).toContain('fixed top-6 right-6')
        expect(gamification).not.toContain('bottom-6')
        expect(gamification).toContain('slide-in-from-top-5')
        expect(gamification).toContain('aria-live="polite"')

        const toast = read('components/ui/toast.tsx')
        expect(toast).toContain('fixed top-0')
        expect(toast).not.toContain('sm:bottom-0')
        expect(toast).not.toContain('sm:slide-in-from-bottom-full')
    })

    it('locks catalog editing behind the env-auth superadmin console', () => {
        expect(PLATFORM_MISSIONS.every((m) => typeof m.stat === 'string')).toBe(true)
        expect(read('lib/api-client.ts')).toContain("this.get('/missions/catalog')")
        expect(read('lib/api-client.ts')).not.toContain('/studio/catalog/missions')
        expect(read('lib/superadmin-client.ts')).toContain("this.api.post('/superadmin/login'")
        expect(read('lib/superadmin-client.ts')).toContain('/superadmin/catalog/missions')
        expect(read('app/superadmin/page.tsx')).toContain('New level')
        expect(read('app/superadmin/page.tsx')).toContain('Criteria (all must match)')
        expect(read('app/superadmin/page.tsx')).toContain('Mission recipe')
        expect(read('app/superadmin/page.tsx')).toContain('100% on first attempt')
        expect(read('lib/gamification-catalog.ts')).toContain("stat: 'submits'")
        expect(read('app/superadmin/login/page.tsx')).toContain('Unlock')
        expect(read('app/studio/page.tsx')).not.toContain('/studio/gamification')
        expect(read('app/studio/page.tsx')).not.toContain('/superadmin')
        expect(read('lib/mission-engine.ts')).toContain('catalog = PLATFORM_MISSIONS')
        expect(read('../afterschool-tech-backend/helpers/platformAchievements.js')).toContain('rules:')
        expect(read('../afterschool-tech-backend/helpers/superadminAuth.js')).toContain('SUPERADMIN_PASSWORD')
        expect(read('../afterschool-tech-backend/helpers/superadminAuth.js')).not.toContain('dami')
        expect(read('app/superadmin/login/page.tsx')).not.toContain('dami')
        expect(read('app/superadmin/login/page.tsx')).not.toContain('1234')
    })
})
