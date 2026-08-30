import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W5 store and login streak', () => {
    it('exposes a student star store and live powerup bar', () => {
        expect(read('app/dashboard/student/store/page.tsx')).toContain('Star market')
        expect(read('app/dashboard/student/store/page.tsx')).toContain('resetLesson')
        expect(read('app/dashboard/student/store/page.tsx')).toContain('Choose a lesson')
        expect(read('app/dashboard/student/store/page.tsx')).not.toContain('Lesson id')
        expect(read('lib/api-client.ts')).toContain('listMine')
        expect(read('components/store/live-powerup-bar.tsx')).toContain('live_time')
        expect(read('components/live-mode.tsx')).toContain('useLivePowerups')
        expect(read('lib/api-client.ts')).toContain("this.post('/store/buy'")
        expect(read('components/dashboard/sidebar/student-sidebar.tsx')).toContain('/dashboard/student/store')
    })

    it('shows a dramatic login streak and a pride board for it', () => {
        expect(read('components/store/login-streak-modal.tsx')).toContain('Day streak')
        expect(read('components/store/login-streak-modal.tsx')).toContain('streakModalStorageKey')
        expect(read('lib/streak.ts')).toContain('ast-streak-modal')
        expect(read('app/dashboard/student/layout.tsx')).toContain('LoginStreakModal')
        expect(read('app/dashboard/student/page.tsx')).toContain('/dashboard/student/streak')
        expect(read('app/dashboard/student/page.tsx')).not.toContain('href="/dashboard/student/store"')
        expect(read('app/dashboard/student/streak/page.tsx')).toContain('Milestone stars')
        expect(read('lib/streak.ts')).toContain('5 * (2 ** index)')
        expect(read('context/gamification-context.tsx')).toContain('loginStreak')
    })
})
