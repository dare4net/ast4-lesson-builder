import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('B4 tutor viewer slide reset', () => {
    it('resets inner step with useEffect when the slide changes', () => {
        const source = readFileSync(join(process.cwd(), 'components/viewer/TutorLessonContent.tsx'), 'utf8')
        expect(source).not.toMatch(/useState\(\(\) => \{\s*setInnerStepIndex\(0\)/)
        expect(source).toMatch(/useEffect\(\(\) => \{\s*setInnerStepIndex\(0\)/)
        expect(source).toContain('[currentSlideIndex]')
    })
})

describe('B5 attemptsMap persistence', () => {
    it('writes attemptsMap on the Express interactions POST', () => {
        const source = readFileSync(join(process.cwd(), '../afterschool-tech-backend/repositories/interactionsRepo.js'), 'utf8')
        expect(source).toContain('attemptsMap')
        expect(source).toContain('$set: set')
        expect(source).toContain('set.attemptsMap')
        expect(readFileSync(join(process.cwd(), '../afterschool-tech-backend/helpers/interactionMerge.js'), 'utf8')).toContain('tutorMarked')
    })

    it('production viewer saves and restores attemptsMap', () => {
        const source = readFileSync(join(process.cwd(), 'components/viewer/LessonViewer.tsx'), 'utf8')
        expect(source).toContain('attemptsMap: attemptsMapRef.current')
        expect(source).toContain('initialAttemptsMap={resolvedInteraction?.attemptsMap}')
    })

    it('does not resync an unchanged attempt record into scoring context', () => {
        const context = readFileSync(join(process.cwd(), 'context/scoring-context.tsx'), 'utf8')
        const scored = readFileSync(join(process.cwd(), 'components/renderers/base/scored-renderer.tsx'), 'utf8')
        expect(context).toContain('existing.firstAttemptCount === record.firstAttemptCount')
        expect(context).toContain('return prev')
        expect(scored).toContain('recordComponentAttempt')
        expect(scored).not.toMatch(/,\s*contextScoring\s*\n\s*\]/)
    })
})

describe('B6 leftover routes are aliases', () => {
    it('legacy viewer lesson list redirects to the student dashboard', () => {
        const source = readFileSync(join(process.cwd(), 'app/viewer/lesson/[userId]/page.tsx'), 'utf8')
        expect(source).toContain("redirect('/dashboard/student')")
    })

    it('legacy new-lesson page redirects to the studio module', () => {
        const source = readFileSync(join(process.cwd(), 'app/studio/modules/[id]/lessons/new/page.tsx'), 'utf8')
        expect(source).toContain('redirect(`/studio/modules/${id}`)')
    })

    it('legacy tutor programs page redirects to studio', () => {
        const source = readFileSync(join(process.cwd(), 'app/dashboard/tutor/programs/page.tsx'), 'utf8')
        expect(source).toContain("redirect('/studio')")
    })
})
