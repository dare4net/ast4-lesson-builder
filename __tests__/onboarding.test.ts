import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { needsOnboarding, safeNextPath, studentPostAuthPath, suggestHandle } from '@/lib/onboarding'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('student onboarding', () => {
    it('gates every student who has not finished or skipped', () => {
        expect(needsOnboarding({ user_id: '1', role: 'student' })).toBe(true)
        expect(needsOnboarding({ user_id: '1', role: 'student', onboardingCompletedAt: '2026-08-30' })).toBe(false)
        expect(needsOnboarding({ user_id: '1', role: 'student', onboardingSkippedAt: '2026-08-30' })).toBe(false)
        expect(needsOnboarding({ user_id: '1', role: 'tutor' })).toBe(false)
        expect(studentPostAuthPath({ user_id: '1', role: 'student' }, '/viewer/abc')).toBe('/onboarding?next=%2Fviewer%2Fabc')
        expect(studentPostAuthPath({ user_id: '1', role: 'student', onboardingCompletedAt: 'x' }, '/viewer/abc')).toBe('/viewer/abc')
        expect(safeNextPath('https://evil.test')).toBe(null)
        expect(suggestHandle('Maya Codes')).toBe('maya')
    })

    it('wires auth shell, skip, first-win, and no pride events', () => {
        expect(read('components/auth/auth-shell.tsx')).toContain('student')
        expect(read('components/auth/auth-shell.tsx')).toContain('teacher')
        expect(read('app/auth/login/page.tsx')).toContain('studentPostAuthPath')
        expect(read('app/auth/signup/page.tsx')).toContain('studentPostAuthPath')
        expect(read('app/page.tsx')).toContain('needsOnboarding')
        expect(read('app/dashboard/student/layout.tsx')).toContain('needsOnboarding')
        expect(read('components/onboarding/onboarding-flow.tsx')).toContain('Skip')
        expect(read('components/onboarding/onboarding-flow.tsx')).toContain('AVATAR_IDS')
        expect(read('components/onboarding/first-win.tsx')).toContain('Spell STAR')
        expect(read('components/onboarding/onboarding-flow.tsx')).not.toContain('COMPONENT_SUBMITTED')
        expect(read('components/onboarding/first-win.tsx')).not.toContain('appEventBus')
        expect(read('lib/api-client.ts')).toContain('/onboarding/complete')
        expect(read('app/auth/login/page.tsx')).not.toContain('Forgot password')
    })
})
