import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const saveUserInteraction = vi.hoisted(() => vi.fn())
const clearQueueByLesson = vi.hoisted(() => vi.fn())
const getSyncQueue = vi.hoisted(() => vi.fn())
const saveInteraction = vi.hoisted(() => vi.fn())

vi.mock('@/lib/user-interactions', () => ({
    saveUserInteraction,
}))

vi.mock('@/lib/offline-store', () => ({
    offlineStore: {
        saveInteraction,
        queueSyncTask: vi.fn(),
        getSyncQueue,
        clearQueueByLesson,
    },
}))

import { syncEngine } from '@/lib/sync-engine'

const queuedTask = {
    id: 1,
    userId: 'user-1',
    lessonId: 'lesson-1',
    timestamp: 1_700_000_000_000,
    data: { componentsState: {}, lessonState: {} },
}

describe('syncEngine queue retention', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
        getSyncQueue.mockResolvedValue([queuedTask])
        saveInteraction.mockResolvedValue(undefined)
        clearQueueByLesson.mockResolvedValue(undefined)
    })

    afterEach(() => {
        syncEngine.resetBackoff()
    })

    it('does not clear the queue when the server save reports failure', async () => {
        saveUserInteraction.mockResolvedValue({ success: false, error: 'Server responded with 500' })
        getSyncQueue
            .mockResolvedValueOnce([queuedTask])
            .mockResolvedValue([])

        await syncEngine.forceSync()

        expect(saveUserInteraction).toHaveBeenCalled()
        expect(clearQueueByLesson).not.toHaveBeenCalled()
        expect(syncEngine.getStatus().status).toBe('error')
    })

    it('clears the queue only after a successful server save', async () => {
        saveUserInteraction.mockResolvedValue({ success: true })
        getSyncQueue
            .mockResolvedValueOnce([queuedTask])
            .mockResolvedValue([])

        await syncEngine.forceSync()

        expect(clearQueueByLesson).toHaveBeenCalledWith(
            'user-1',
            'lesson-1',
            queuedTask.timestamp
        )
        expect(syncEngine.getStatus().status).toBe('synced')
    })
})
