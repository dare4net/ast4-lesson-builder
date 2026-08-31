import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('Student hunt, search, and dashboard hygiene', () => {
    it('removes the Active Student pill and shows lifetime stars next to wallet', () => {
        const dashboard = read('app/dashboard/student/page.tsx')
        expect(dashboard).not.toContain('Active Student')
        expect(dashboard).toContain('lifetimeStars')
        expect(dashboard).toContain('lifetime')
        expect(read('context/gamification-context.tsx')).toContain('starsEarned: stats.lifetimeStarsEarned || 0')
    })

    it('awards practice points and counts them in the lesson total', () => {
        expect(read('domain/scoring.ts')).toContain('if (isScoredComponent(component))')
        expect(read('domain/scoring.ts')).toContain('if (!isScoredComponent(component) || !state || typeof state !== \'object\') return 0')
        const scoring = read('components/renderers/base/hooks.ts')
        expect(scoring).toContain('scoreContext?.addPoints(points)')
        expect(scoring).toContain('scoreContext?.addPoints(p)')
        expect(scoring).not.toContain('if (isLive) {\n            scoreContext?.addPoints(p)')
    })

    it('searches courses, modules, and lessons from the header', () => {
        const search = read('components/pride/pride-search.tsx')
        expect(search).toContain('useCurriculumSearch')
        expect(search).toContain('Courses')
        expect(search).toContain('Modules')
        expect(search).toContain('Lessons')
        expect(search).toContain('Search courses, lessons, people')
        expect(read('lib/api-client.ts')).toContain('/programs/search?q=')
        expect(read('hooks/use-curriculum-search.ts')).toContain('searchCurriculum')
    })

    it('shows obtainable stars, points, and every block in lesson details', () => {
        const modal = read('app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx')
        expect(modal).toContain('See stars, points, and all blocks')
        expect(modal).toContain('obtainableStars')
        expect(modal).toContain('obtainablePoints')
        expect(modal).toContain('activities')
        expect(modal).toContain('practicePoints')
    })

    it('refetches lesson lists from the viewer even when the dashboard is closed', () => {
        expect(read('hooks/use-lessons-list.ts')).toContain("refetchOnWindowFocus: true")
        expect(read('hooks/use-lessons-list.ts')).toContain("refetchOnMount: 'always'")
        expect(read('components/viewer/LessonViewer.tsx')).toContain('invalidateLessonsListCache')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('queryKeys.lessonsList')
        expect(read('app/dashboard/student/page.tsx')).toContain('useLessonsList')
    })

    it('renders rank on scored and fastest-live pride rows', () => {
        const index = read('app/dashboard/student/pride/page.tsx')
        expect(index).toContain('CrownMark crown={stat.you?.crown} rank={stat.you?.rank}')
        expect(index).toContain('All scored blocks')
        expect(index).toContain('Fastest live by block')
    })
})
