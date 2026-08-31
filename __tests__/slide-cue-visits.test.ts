import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { seedSeenSlideKeys, shouldPlaySlideCue, slideCueVisitKey } from '@/lib/slide-cue-visits'

describe('slide cue visits', () => {
    const slides = [
        { id: 'a', status: 'completed' },
        { id: 'b', status: 'active' },
        { id: 'c', status: 'active' },
    ]

    it('seeds the resume slide and already-completed slides as seen', () => {
        const seen = seedSeenSlideKeys(slides, 1)
        expect(seen.has('a')).toBe(true)
        expect(seen.has('b')).toBe(true)
        expect(seen.has('c')).toBe(false)
    })

    it('plays the cue only the first time you enter a slide', () => {
        const seen = seedSeenSlideKeys(slides, 0)
        const next = slideCueVisitKey(slides[1], 1)
        expect(shouldPlaySlideCue(seen, next, true)).toBe(true)
        seen.add(next)
        expect(shouldPlaySlideCue(seen, next, true)).toBe(false)
        expect(shouldPlaySlideCue(seen, slideCueVisitKey(slides[0], 0), true)).toBe(false)
    })

    it('lets Begin fire immediately on the slide cue', () => {
        const source = readFileSync(join(process.cwd(), 'components/viewer/SlideTransitionOverlay.tsx'), 'utf8')
        expect(source).not.toContain('Get ready')
        expect(source).not.toContain('secondsLeft')
        expect(source).toContain('disabled={isStarting}')
    })
})
