import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('Student hunt, search, and dashboard hygiene', () => {
    it('removes the Active Student pill and shows lifetime stars next to wallet', () => {
        const dashboard = read('app/dashboard/student/page.tsx')
        const economy = read('components/dashboard/student/economy-panels.tsx')
        expect(dashboard).not.toContain('Active Student')
        expect(dashboard).toContain('StudentEconomyPanels')
        expect(economy).toContain('lifetimeStars')
        expect(economy).toContain('Earned')
        expect(read('context/gamification-context.tsx')).toContain('starsEarned: stats.lifetimeStarsEarned || 0')
    })

    it('awards practice points and counts them in the lesson total', () => {
        expect(read('domain/scoring.ts')).toContain('if (isScoredComponent(component))')
        expect(read('domain/scoring.ts')).toContain('if (!isScoredComponent(component) || !state || typeof state !== \'object\') return 0')
        expect(read('domain/scoring.ts')).toContain('shiftComponentAward')
        const scoring = read('components/renderers/base/hooks.ts')
        expect(scoring).toContain('applyAward')
        expect(scoring).toContain('applyAward(0)')
        expect(scoring).toContain('shiftComponentAward')
        expect(read('components/renderers/base/scored-renderer.tsx')).toContain('initialAwarded')
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
        const modal = read('components/dashboard/student/lesson-details-modal.tsx')
        expect(modal).toContain('See stars, points, and all blocks')
        expect(modal).toContain('obtainableStars')
        expect(modal).toContain('obtainablePoints')
        expect(modal).toContain('activities')
        expect(modal).toContain('practicePoints')
        expect(read('app/dashboard/student/programs/[id]/modules/[moduleId]/page.tsx')).toContain('LessonDetailsModal')
        expect(read('app/dashboard/student/page.tsx')).toContain('onDetails')
        expect(read('app/dashboard/student/page.tsx')).toContain('openLessonDetails')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('Details')
        expect(read('components/dashboard/student/lesson-card.tsx')).toContain('stopPropagation')
    })

    it('plays a synthesized powerup sound when a charge is activated', () => {
        const sounds = read('lib/sound-effects.ts')
        expect(sounds).toContain("'powerupUsed'")
        expect(sounds).toContain('playPowerupUsedSound')
        expect(read('context/live-powerups-context.tsx')).toContain("SoundEffects.play('powerupUsed')")
        expect(read('context/live-powerups-context.tsx')).toContain('setSecondWind((value) => value + Math.max(1, effect))')
        expect(read('app/dashboard/student/store/page.tsx')).toContain('activate')
        expect(read('app/dashboard/student/store/page.tsx')).toContain('Activate')
        expect(read('app/dashboard/student/streak/page.tsx')).toContain('Arm a freeze')
        expect(read('app/dashboard/student/streak/page.tsx')).toContain("activate('streak_freeze')")
    })

    it('grades practice without revealing the correct answer', () => {
        expect(read('lib/reveal.ts')).toContain("return mode === 'live'")
        expect(read('components/renderers/quiz-renderer.tsx')).toContain('shouldRevealAnswer(mode)')
        expect(read('components/renderers/true-false-renderer.tsx')).toContain('revealAnswers')
        expect(read('components/renderers/true-false-renderer.tsx')).toContain('Incorrect')
        expect(read('components/renderers/multi-select-quiz-renderer.tsx')).toContain('isLive || isSelected')
        expect(read('components/renderers/flashcard-quiz-renderer.tsx')).toContain('!isCorrect && revealAnswers')
        expect(read('components/renderers/flashcard-quiz-renderer.tsx')).toContain('playFlashcardFlipForward')
        expect(read('components/renderers/flashcard-quiz-renderer.tsx')).toContain('Tap to flip')
        expect(read('components/renderers/flashcard-quiz-renderer.tsx')).toContain("perspective: '1000px'")
        expect(read('components/renderers/fill-in-the-blank-renderer.tsx')).toContain('!isBlankCorrect && isLive')
        expect(read('components/renderers/swipe-deck-renderer.tsx')).toContain('shouldRevealAnswer(mode)')
        expect(read('components/renderers/spin-the-wheel-renderer.tsx')).toContain('revealAnswers')
        expect(read('components/renderers/spectrum-sorter-renderer.tsx')).toContain('shouldRevealAnswer(mode) || isItemCorrect')
        expect(read('components/renderers/hotspot-renderer.tsx')).toContain('isRevealed: isLive')
    })

    it('refetches lesson lists from the viewer even when the dashboard is closed', () => {
        expect(read('hooks/use-lessons-list.ts')).toContain("refetchOnWindowFocus: true")
        expect(read('hooks/use-lessons-list.ts')).toContain("refetchOnMount: 'always'")
        expect(read('components/viewer/LessonViewer.tsx')).toContain('invalidateLessonsListCache')
        expect(read('components/viewer/LessonViewer.tsx')).toContain("['lessons', 'mine']")
        expect(read('app/dashboard/student/page.tsx')).toContain('useLessonsList')
    })

    it('renders rank on scored and fastest-live pride rows', () => {
        const index = read('app/dashboard/student/pride/page.tsx')
        expect(index).toContain('CrownMark crown={stat.you?.crown} rank={stat.you?.rank}')
        expect(index).toContain('All scored blocks')
        expect(index).toContain('Fastest live by block')
    })
})
