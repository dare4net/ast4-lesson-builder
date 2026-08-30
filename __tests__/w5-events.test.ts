import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ACHIEVEMENT_EVENT_TYPES, ACHIEVEMENT_FIELDS_BY_EVENT } from '@/lib/gamification-catalog'

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')

describe('W5 richer component events', () => {
    it('attaches extras on hangman, memory, jigsaw, and code submits', () => {
        expect(read('components/renderers/hangman-renderer.tsx')).toContain('wrongGuesses')
        expect(read('components/renderers/memory-grid-renderer.tsx')).toContain('memoryFlips')
        expect(read('components/renderers/jigsaw-renderer.tsx')).toContain('jigsawMoves')
        expect(read('components/renderers/code-editor-renderer.tsx')).toContain('testsPassed')
        expect(read('lib/achievement-listener.ts')).toContain('payload.extras')
        expect(read('lib/achievement-listener.ts')).toContain("on('AUDIO_REPLAYED'")
        expect(read('lib/achievement-listener.ts')).toContain("on('HINT_USED'")
        expect(read('lib/achievement-listener.ts')).toContain("on('POLL_VOTED'")
        expect(ACHIEVEMENT_FIELDS_BY_EVENT.COMPONENT_SUBMITTED).toContain('wrongGuesses')
        expect(ACHIEVEMENT_EVENT_TYPES).toContain('AUDIO_REPLAYED')
        expect(ACHIEVEMENT_EVENT_TYPES).toContain('HINT_USED')
        expect(ACHIEVEMENT_EVENT_TYPES).toContain('POLL_VOTED')
    })

    it('keeps class votes live on polls, word clouds, and scale sliders', () => {
        expect(read('hooks/use-poll-store.ts')).toContain('setInterval')
        expect(read('components/renderers/word-cloud-renderer.tsx')).toContain('setInterval')
        expect(read('components/renderers/scale-slider-renderer.tsx')).toContain('rateScale')
        expect(read('components/renderers/scale-slider-renderer.tsx')).toContain('Class average')
        expect(read('lib/api-client.ts')).toContain("this.post('/scales'")
        expect(read('components/renderers/poll-renderer.tsx')).toContain("emit('POLL_VOTED'")
        expect(read('components/viewer/LessonViewer.tsx')).toContain("emit('LESSON_REVIEWED'")
    })

    it('widens the mobile search panel and gives inbox types icons', () => {
        expect(read('components/pride/pride-search.tsx')).toContain('max-sm:fixed')
        expect(read('components/dashboard/notification-bell.tsx')).toContain('InboxTypeIcon')
        expect(read('components/dashboard/notification-bell.tsx')).toContain('w-6 h-6')
        expect(read('lib/inbox-icons.tsx')).toContain('CROWN_GOLD')
        expect(read('lib/inbox-icons.tsx')).toContain('FOLLOWED_YOU')
        expect(read('lib/inbox-icons.tsx')).toContain('PROGRAM_LESSON_PUBLISHED')
    })
})
