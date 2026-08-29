import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getOfflineStorageKey, saveUserInteraction } from '@/lib/user-interactions'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        interactions: {
            get: vi.fn(),
            save: vi.fn(),
        },
    },
}))

const save = () => vi.mocked(apiClient.interactions.save)

const payload = {
    componentsState: { q1: { submitted: true } },
    lessonState: {
        slides: [{ id: 's1', state: 'active' as const, status: 'uncompleted' as const }],
        currentSlideIndex: 0,
        lessonTitle: 'Test',
        lessonDescription: 'Desc',
    },
    attemptsMap: { q1: { firstAttemptCount: 1, bestAttemptCount: 1 } },
}

describe('saveUserInteraction', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
        save().mockReset()
        save().mockResolvedValue({ success: true })
    })

    it('returns success on HTTP 200 and keeps a local copy', async () => {
        const result = await saveUserInteraction('user-1', 'lesson-1', payload)

        expect(result).toEqual({ success: true, version: 1 })
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
        expect(save()).toHaveBeenCalledWith({
            userId: 'user-1',
            lessonId: 'lesson-1',
            componentsState: payload.componentsState,
            lessonState: payload.lessonState,
            attemptsMap: payload.attemptsMap,
            version: 0,
        })
    })

    it('returns success: false on HTTP 500 and does not drop the local copy', async () => {
        save().mockRejectedValue({ response: { status: 500, data: { error: 'db down' } } })

        const result = await saveUserInteraction('user-1', 'lesson-1', payload)

        expect(result.success).toBe(false)
        expect(result.error).toBe('db down')
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
    })

    it('returns success: false when fetch throws (network error)', async () => {
        save().mockRejectedValue(new Error('Failed to fetch'))

        const result = await saveUserInteraction('user-1', 'lesson-1', payload)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Failed to fetch')
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
    })

    it('returns success when offline if local write succeeded, without posting', async () => {
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })

        const result = await saveUserInteraction('user-1', 'lesson-1', payload)

        expect(result).toEqual({ success: true, version: 0 })
        expect(save()).not.toHaveBeenCalled()
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
    })

    it('returns success: false when offline and local write fails', async () => {
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
        vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded')
        })

        const result = await saveUserInteraction('user-1', 'lesson-1', payload)

        expect(result.success).toBe(false)
        expect(result.error).toMatch(/local save failed/i)
        expect(save()).not.toHaveBeenCalled()
    })
})
