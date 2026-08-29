import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isNavActive } from '@/lib/nav-active'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F1 accessibility floor', () => {
    it('respects prefers-reduced-motion globally and on idle loops', () => {
        expect(read('app/globals.css')).toContain('prefers-reduced-motion: reduce')
        expect(read('hooks/use-reduced-motion.ts')).toContain('useReducedMotion')
        expect(read('app/auth/login/page.tsx')).toContain('useReducedMotion')
        expect(read('app/auth/signup/page.tsx')).toContain('useReducedMotion')
        expect(read('app/dashboard/tutor/page.tsx')).toContain('useReducedMotion')
        expect(read('app/auth/login/page.tsx')).toContain('reduceMotion ? undefined')
        expect(read('app/auth/signup/page.tsx')).toContain('reduceMotion ? undefined')
        expect(read('app/dashboard/tutor/page.tsx')).toContain('reduceMotion ? undefined')
    })

    it('labels icon buttons and live regions', () => {
        expect(read('components/ui/button.tsx')).toContain('"aria-label"')
        expect(read('components/ui/gamification-toast.tsx')).toContain('aria-live="polite"')
        expect(read('components/ui/score-display.tsx')).toContain('aria-live="polite"')
        expect(read('components/viewer/TopProgressBar.tsx')).toContain('aria-live="polite"')
        expect(read('components/viewer/LessonContent.tsx')).toContain('aria-live="polite"')
        expect(read('components/viewer/TopProgressBar.tsx')).toContain('Open lesson menu')
    })

    it('keeps LiveTimer as an essential live-mode clock', () => {
        const source = read('components/live-mode.tsx')
        expect(source).not.toContain('Add 30 seconds')
        expect(source).not.toContain('Turn off timer')
        expect(source).not.toContain('timerOff')
        expect(source).toContain('resolveLiveTimerEvent')
    })

    it('wires tutor mobile nav and removes the 72px header gutter', () => {
        expect(read('app/dashboard/tutor/layout.tsx')).toContain('TutorMobileNav')
        expect(read('app/dashboard/tutor/layout.tsx')).toContain('hasSidebar={false}')
        expect(read('components/dashboard/dashboard-header.tsx')).toContain('hasSidebar')
        expect(read('components/dashboard/dashboard-header.tsx')).toContain('!hasSidebar')
    })

    it('uses Link or button for catalog, programs, and lesson cards', () => {
        expect(read('app/dashboard/student/catalog/page.tsx')).toContain('aria-label={`View')
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('StudentCard')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('StudentCard')
        expect(read('components/dashboard/student-card.tsx')).toContain('<Link href={href}')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('<button type="button"')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('<Link href={href}')
    })

    it('matches nested routes as active in mobile and sidebar nav', () => {
        expect(isNavActive('/dashboard/student/programs/abc', '/dashboard/student/programs', '/dashboard/student')).toBe(true)
        expect(isNavActive('/dashboard/student', '/dashboard/student', '/dashboard/student')).toBe(true)
        expect(isNavActive('/dashboard/student/catalog', '/dashboard/student', '/dashboard/student')).toBe(false)
        expect(isNavActive('/dashboard/tutor/students/x', '/dashboard/tutor/students', '/dashboard/tutor')).toBe(true)
        expect(read('components/dashboard/sidebar/student-mobile-nav.tsx')).toContain('isNavActive')
        expect(read('components/dashboard/sidebar/tutor-mobile-nav.tsx')).toContain('isNavActive')
        expect(read('components/dashboard/sidebar/student-sidebar.tsx')).toContain('isNavActive')
        expect(read('components/dashboard/dashboard-header.tsx')).toContain('isNavActive')
    })
})
