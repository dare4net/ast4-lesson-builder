import { describe, expect, it, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { nextBackoffMs } from '@/lib/backoff'
import { createTabSync } from '@/lib/tab-sync'
import { saveUserInteraction, getOfflineStorageKey } from '@/lib/user-interactions'
import { apiClient } from '@/lib/api-client'

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        interactions: {
            save: vi.fn(),
        },
    },
}))

const read = (relative: string) => readFileSync(join(process.cwd(), relative), 'utf8')
const save = () => vi.mocked(apiClient.interactions.save)

function memoryChannel() {
    const listeners = new Set<(event: { data: unknown }) => void>()
    return {
        postMessage(msg: unknown) {
            for (const listener of [...listeners]) listener({ data: msg })
        },
        addEventListener(_type: 'message', fn: (event: { data: unknown }) => void) {
            listeners.add(fn)
        },
        removeEventListener(_type: 'message', fn: (event: { data: unknown }) => void) {
            listeners.delete(fn)
        },
        close() {
            listeners.clear()
        },
    }
}

const payload = {
    componentsState: { q1: { submitted: true } },
    lessonState: {
        slides: [{ id: 's1', state: 'active' as const, status: 'uncompleted' as const }],
        currentSlideIndex: 0,
        lessonTitle: 'Test',
        lessonDescription: 'Desc',
    },
}

describe('G3 exponential backoff', () => {
    it('doubles until the 30s cap', () => {
        expect(nextBackoffMs(0)).toBe(0)
        expect(nextBackoffMs(1)).toBe(1000)
        expect(nextBackoffMs(2)).toBe(2000)
        expect(nextBackoffMs(3)).toBe(4000)
        expect(nextBackoffMs(5)).toBe(16000)
        expect(nextBackoffMs(6)).toBe(30000)
        expect(nextBackoffMs(20)).toBe(30000)
    })
})

describe('G3 BroadcastChannel tab sync', () => {
    it('lets the visible tab write and suppresses a hidden tab after the other published', () => {
        const channel = memoryChannel()
        const visible = createTabSync({ channel, tabId: 'tab-a', isHidden: () => false })
        const hidden = createTabSync({ channel, tabId: 'tab-b', isHidden: () => true })

        expect(hidden.shouldSuppressWrite('user-1', 'lesson-1')).toBe(false)
        visible.publishInteraction('user-1', 'lesson-1', 1)
        expect(hidden.shouldSuppressWrite('user-1', 'lesson-1')).toBe(true)
        expect(visible.shouldSuppressWrite('user-1', 'lesson-1')).toBe(false)

        hidden.close()
        visible.close()
    })
})

describe('G3 versioned interaction save', () => {
    beforeEach(() => {
        localStorage.clear()
        Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
        save().mockReset()
    })

    it('sends version and returns the server version', async () => {
        save().mockResolvedValue({ success: true, version: 4 })
        const result = await saveUserInteraction('user-1', 'lesson-1', { ...payload, version: 3 })
        expect(save()).toHaveBeenCalledWith(expect.objectContaining({ version: 3 }))
        expect(result).toEqual({ success: true, version: 4 })
    })

    it('surfaces a 409 conflict without dropping the local copy', async () => {
        save().mockRejectedValue({ response: { status: 409, data: { error: 'Version conflict', version: 7 } } })
        const result = await saveUserInteraction('user-1', 'lesson-1', { ...payload, version: 6 })
        expect(result).toMatchObject({ success: false, conflict: true, version: 7 })
        expect(localStorage.getItem(getOfflineStorageKey('user-1', 'lesson-1'))).toBeTruthy()
    })
})

describe('G3 wiring', () => {
    it('syncEngine retries with nextBackoffMs and skips a suppressed tab write', () => {
        const source = read('lib/sync-engine.ts')
        expect(source).toContain('nextBackoffMs')
        expect(source).toContain('scheduleRetry')
        expect(source).toContain('shouldSuppressWrite')
        expect(source).toContain('result.conflict')
    })

    it('viewer and builder send version on save', () => {
        expect(read('components/viewer/LessonViewer.tsx')).toContain('interactionVersionRef')
        expect(read('components/viewer/LessonViewer.tsx')).toContain('version: interactionVersionRef.current')
        expect(read('components/lesson-builder.tsx')).toContain('lessonVersionRef')
        expect(read('components/lesson-builder.tsx')).toContain('version: lessonVersionRef.current')
    })
})
