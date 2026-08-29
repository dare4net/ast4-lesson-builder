import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    applyLessonAudioPrefs,
    canPlayLessonAudio,
    getLessonAudioPrefs,
    registerLessonAudio,
    setLessonAudioPrefs,
} from '@/lib/lesson-audio'

function fakeAudio() {
    const audio = document.createElement('audio')
    const pause = vi.spyOn(audio, 'pause').mockImplementation(() => undefined)
    return { audio, pause }
}

describe('lesson audio prefs', () => {
    afterEach(() => {
        setLessonAudioPrefs({ enabled: true, volume: 0.5 })
    })

    it('applies volume and mute to registered audio', () => {
        const { audio } = fakeAudio()
        const unregister = registerLessonAudio(audio)

        setLessonAudioPrefs({ enabled: true, volume: 0.25 })
        expect(audio.volume).toBeCloseTo(0.25)
        expect(audio.muted).toBe(false)

        setLessonAudioPrefs({ enabled: false, volume: 0.25 })
        expect(audio.muted).toBe(true)
        expect(audio.volume).toBe(0)

        unregister()
    })

    it('pauses playing audio when sound is turned off', () => {
        const { audio, pause } = fakeAudio()
        registerLessonAudio(audio)
        setLessonAudioPrefs({ enabled: false, volume: 0.8 })
        expect(pause).toHaveBeenCalled()
    })

    it('does not treat muted or zero volume as playable', () => {
        setLessonAudioPrefs({ enabled: true, volume: 0 })
        expect(canPlayLessonAudio()).toBe(false)
        setLessonAudioPrefs({ enabled: false, volume: 0.8 })
        expect(canPlayLessonAudio()).toBe(false)
        setLessonAudioPrefs({ enabled: true, volume: 0.8 })
        expect(canPlayLessonAudio()).toBe(true)
        expect(getLessonAudioPrefs().volume).toBeCloseTo(0.8)
    })

    it('applies current prefs to a newly created element', () => {
        setLessonAudioPrefs({ enabled: false, volume: 0.9 })
        const { audio } = fakeAudio()
        applyLessonAudioPrefs(audio)
        expect(audio.muted).toBe(true)
        expect(audio.volume).toBe(0)
    })
})
