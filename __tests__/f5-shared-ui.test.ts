import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ACTION_LABELS } from '@/lib/action-labels'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F5 shared UI + renderer vocabulary', () => {
    it('extracts StudentCard, PageHero, CourseHero, EntityEditDialog, CueOverlayShell', () => {
        const files = [
            'components/dashboard/student-card.tsx',
            'components/dashboard/page-hero.tsx',
            'components/dashboard/course-hero.tsx',
            'components/studio/entity-edit-dialog.tsx',
            'components/viewer/cue-overlay-shell.tsx',
        ]
        for (const file of files) {
            expect(existsSync(join(process.cwd(), file)), file).toBe(true)
        }
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('StudentCard')
        expect(read('app/dashboard/student/programs/page.tsx')).toContain('PageHero')
        expect(read('app/dashboard/student/catalog/page.tsx')).toContain('PageHero')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('CourseHero')
        expect(read('app/dashboard/student/programs/[id]/page.tsx')).toContain('StudentCard')
        expect(read('components/studio/edit-program-dialog.tsx')).toContain('EntityEditDialog')
        expect(read('components/studio/edit-module-dialog.tsx')).toContain('EntityEditDialog')
        expect(read('components/viewer/LessonIntroCueOverlay.tsx')).toContain('CueOverlayShell')
        expect(read('components/viewer/SlideTransitionOverlay.tsx')).toContain('CueOverlayShell')
        expect(read('components/viewer/cue-overlay-shell.tsx')).toContain('absolute inset-0')
        expect(read('components/viewer/cue-overlay-shell.tsx')).not.toContain('fixed inset-0')
        expect(read('components/viewer/LessonContent.tsx')).toContain('showIntroCue ||')
    })

    it('does not keep a local RenderGraphicBackground in cue overlays', () => {
        expect(read('components/viewer/LessonIntroCueOverlay.tsx')).not.toContain('RenderGraphicBackground')
        expect(read('components/viewer/SlideTransitionOverlay.tsx')).not.toContain('RenderGraphicBackground')
        expect(read('components/viewer/cue-overlay-shell.tsx')).toContain('export function GraphicBackground')
        expect(read('components/viewer/cue-overlay-shell.tsx')).toContain('export function CueOverlayShell')
    })

    it('keeps a duo 3D Button variant and uses it on word-scramble Check Answer', () => {
        expect(read('components/ui/button.tsx')).toContain('duo:')
        expect(read('components/ui/button.tsx')).toContain('link:')
        expect(read('components/ui/button.tsx')).toContain('border-b-4')
        expect(read('components/renderers/word-scramble-renderer.tsx')).toContain('variant="duo"')
        expect(read('components/renderers/word-scramble-renderer.tsx')).toContain('ACTION_LABELS.checkAnswer')
        expect(read('components/renderers/word-scramble-renderer.tsx')).toContain('ACTION_LABELS.tryAgain')
    })

    it('uses one pending-tutor-review label across scored renderers', () => {
        expect(ACTION_LABELS.checkAnswer).toBe('Check Answer')
        expect(ACTION_LABELS.tryAgain).toBe('Try Again')
        expect(ACTION_LABELS.pendingTutorReview).toBe('Submitted — Pending Tutor Review')
        expect(ACTION_LABELS.bestAttempt).toBe('Best')
        expect(read('components/renderers/fill-in-the-blank-renderer.tsx')).toContain('ACTION_LABELS.pendingTutorReview')
        expect(read('components/renderers/short-answer-renderer.tsx')).toContain('ACTION_LABELS.pendingTutorReview')
        expect(read('components/renderers/hotspot-renderer.tsx')).toContain('ACTION_LABELS.pendingTutorReview')
        expect(read('components/renderers/base/scored-renderer.tsx')).toContain('BestAttemptBadge')
        expect(read('components/renderers/base/best-attempt-badge.tsx')).toContain('Best')
        expect(read('components/renderers/base/scored-renderer.tsx')).toContain('resetAttempts()')
        expect(read('components/renderers/quiz-renderer.tsx')).toContain('recordAttempt(newScore === questions.length')
        expect(read('components/renderers/fill-in-the-blank-renderer.tsx')).toContain('recordAttempt(allCorrect')
    })

    it('wraps renderer dynamic() with a loading fallback', () => {
        const src = read('components/component-renderer.tsx')
        expect(src).toContain('function loadRenderer')
        expect(src).toContain('loading: RendererLoading')
        expect(src).not.toMatch(/dynamic\(\(\)\s*=>/)
    })

    it('uses dvh for lesson viewer chrome', () => {
        expect(read('components/viewer/LessonViewer.tsx')).toContain('h-dvh')
        expect(read('components/viewer/LessonViewer.tsx')).not.toContain('h-screen')
        expect(read('components/viewer/TutorLessonViewer.tsx')).toContain('h-dvh')
        expect(read('components/viewer/TutorLessonViewer.tsx')).not.toContain('h-screen')
        expect(read('app/viewer/layout.tsx')).toContain('h-dvh')
        expect(read('app/viewer/page.tsx')).toContain('h-dvh')
        expect(read('app/viewer/[id]/page.tsx')).toContain('h-dvh')
        expect(read('app/tutor-view/[id]/page.tsx')).toContain('h-dvh')
    })
})
