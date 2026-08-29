import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { animationClassFor } from '@/lib/feedback-animation'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('F2 feedback / sound — one brain', () => {
    it('maps answer types to animations.css classes', () => {
        expect(animationClassFor('correct')).toBe('duo-bounce')
        expect(animationClassFor('quizSuccess')).toBe('duo-bounce')
        expect(animationClassFor('incorrect')).toBe('duo-shake')
        expect(animationClassFor('complete')).toBe('duo-celebrate')
        expect(animationClassFor('click')).toBe('duo-pop')
        expect(animationClassFor('timerTick')).toBe('')
    })

    it('makes the lesson hook read FeedbackProvider mute and animation prefs', () => {
        const hook = read('hooks/use-feedback.ts')
        expect(hook).toContain("from '@/lib/feedback-context'")
        expect(hook).toContain('useFeedbackSettings')
        expect(hook).toContain('scope?.apply')
        expect(read('lib/feedback-context.tsx')).toContain('isSoundEnabled')
        expect(read('lib/feedback-context.tsx')).toContain('isAnimationEnabled')
        expect(read('lib/feedback-context.tsx')).toContain('sound && isSoundEnabled')
        expect(read('lib/feedback-context.tsx')).toContain('animation && isAnimationEnabled')
        expect(read('lib/feedback-context.tsx')).toContain('setLessonAudioPrefs')
        expect(read('hooks/use-audio-player.ts')).toContain('registerLessonAudio')
        expect(read('hooks/use-audio-player.ts')).toContain('canPlayLessonAudio')
    })

    it('mounts FeedbackSettings in the lesson viewer and student settings', () => {
        expect(read('components/viewer/LessonContent.tsx')).toContain('FeedbackSettingsButton')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('FeedbackSettingsButton')
        expect(read('app/dashboard/student/settings/page.tsx')).toContain('FeedbackSettings')
        expect(read('components/ui/feedback-settings.tsx')).toContain('export function FeedbackSettings')
        expect(read('components/ui/feedback-settings.tsx')).toContain("from '@/hooks/use-feedback'")
        expect(read('components/ui/feedback-settings.tsx')).toContain('How lessons feel')
        expect(read('app/dashboard/student/settings/page.tsx')).toContain('Learning')
    })

    it('defines duo-bounce / duo-shake only in animations.css', () => {
        expect(read('styles/animations.css')).toContain('@keyframes duo-bounce')
        expect(read('styles/animations.css')).toContain('@keyframes duo-shake')
        expect(read('app/globals.css')).toContain("animations.css")
        expect(read('tailwind.config.ts')).not.toContain('"duo-bounce"')
        expect(read('tailwind.config.ts')).not.toContain("'duo-bounce'")
        expect(read('tailwind.config.ts')).not.toContain('"duo-shake"')
    })

    it('applies animation classes on InteractiveRenderer and drops dead quiz state', () => {
        expect(read('components/renderers/base/interactive-renderer.tsx')).toContain('FeedbackAnimationScope')
        expect(read('components/renderers/base/interactive-renderer.tsx')).toContain('animationClass')
        expect(read('components/renderers/quiz-renderer.tsx')).not.toContain('animationClass')
    })
})
