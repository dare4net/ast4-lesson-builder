import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RENDERER_LOADERS } from '@/lib/component-renderer-loaders'
import {
    ALL_RENDERABLE_TYPES,
    LIVE_START_SCREEN_TYPES,
    RENDERER_FIXTURES,
} from '@/lib/test-utils/renderer-fixtures'
import { RendererTestProviders } from '@/lib/test-utils/test-providers'

vi.mock('@/lib/sound-effects', () => ({
    SoundEffects: {
        play: vi.fn().mockResolvedValue(undefined),
        resumeAudio: vi.fn().mockResolvedValue(undefined),
        preloadAll: vi.fn().mockResolvedValue(undefined),
        unloadAll: vi.fn(),
        setVolume: vi.fn(),
        mute: vi.fn(),
        unmute: vi.fn(),
    },
    playFlashcardFlipForward: vi.fn(),
    playPowerupUsedSound: vi.fn(),
    playStarsSpentSound: vi.fn(),
}))

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        live: {
            getWordCloud: vi.fn().mockResolvedValue({ counts: {} }),
            getScale: vi.fn().mockResolvedValue({ average: 0, total: 0, buckets: {} }),
        },
        store: {
            activate: vi.fn().mockResolvedValue({ effect: 0 }),
        },
    },
}))

beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
})

describe('renderer smoke mounts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it.each(ALL_RENDERABLE_TYPES)('mounts %s without throwing', async (type) => {
        const Renderer = await RENDERER_LOADERS[type]()
        const props = { ...RENDERER_FIXTURES[type] }

        render(
            <RendererTestProviders>
                <Renderer {...props} />
            </RendererTestProviders>,
        )

        await waitFor(() => {
            expect(document.body.innerHTML.length).toBeGreaterThan(0)
        })
    })

    it.each([...LIVE_START_SCREEN_TYPES])(
        'shows live pre-play screen for %s in live mode',
        async (type) => {
            const Renderer = await RENDERER_LOADERS[type]()
            const props = { ...RENDERER_FIXTURES[type], mode: 'live' as const }

            render(
                <RendererTestProviders>
                    <Renderer {...props} />
                </RendererTestProviders>,
            )

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /play live/i })).toBeTruthy()
            })
        },
    )
})
