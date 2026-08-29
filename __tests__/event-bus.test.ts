import { describe, it, expect, vi, beforeEach } from 'vitest'
import { appEventBus, EventBus, type LiveEarlyFinishPayload } from '@/lib/event-bus'

// ─── Test Suite: EventBus ────────────────────────────────────────────────────

describe('EventBus', () => {
    let bus: EventBus

    beforeEach(() => {
        // Use a fresh instance for each test so singletons don't bleed state
        bus = new EventBus()
    })

    // ── Subscription & Emission ──────────────────────────────────────────────

    it('calls a listener when matching event is emitted', () => {
        const handler = vi.fn()
        bus.on('COMPONENT_SUBMITTED', handler)
        bus.emit('COMPONENT_SUBMITTED', {
            componentId: 'quiz-1',
            type: 'quiz',
            mode: 'live',
            score: 10,
            maxScore: 10,
            percentage: 100,
            attemptCount: 1,
            completionTimeMs: 5000,
            isFirstAttempt: true,
        })
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ componentId: 'quiz-1' }))
    })

    it('does NOT call listener for a different event', () => {
        const handler = vi.fn()
        bus.on('LESSON_COMPLETED', handler)
        bus.emit('COMPONENT_RESET', { componentId: 'scramble-1', type: 'wordScramble' })
        expect(handler).not.toHaveBeenCalled()
    })

    it('supports multiple listeners on the same event', () => {
        const h1 = vi.fn()
        const h2 = vi.fn()
        bus.on('AUDIO_REPLAYED', h1)
        bus.on('AUDIO_REPLAYED', h2)
        bus.emit('AUDIO_REPLAYED', { componentId: 'comp-1' })
        expect(h1).toHaveBeenCalledTimes(1)
        expect(h2).toHaveBeenCalledTimes(1)
    })

    // ── Unsubscription ───────────────────────────────────────────────────────

    it('stops calling listener after off() is called', () => {
        const handler = vi.fn()
        bus.on('PROGRAM_ENROLLED', handler)
        bus.off('PROGRAM_ENROLLED', handler)
        bus.emit('PROGRAM_ENROLLED', { programId: 'prog-1' })
        expect(handler).not.toHaveBeenCalled()
    })

    it('returns an unsubscribe function from on() that works correctly', () => {
        const handler = vi.fn()
        const unsubscribe = bus.on('STARS_SPENT', handler)
        unsubscribe()
        bus.emit('STARS_SPENT', { amount: 5, itemType: 'hint' })
        expect(handler).not.toHaveBeenCalled()
    })

    it('only removes the specified listener, not others', () => {
        const h1 = vi.fn()
        const h2 = vi.fn()
        bus.on('LIVE_TIMEOUT', h1)
        bus.on('LIVE_TIMEOUT', h2)
        bus.off('LIVE_TIMEOUT', h1)
        bus.emit('LIVE_TIMEOUT', { componentId: 'mem-1', type: 'memoryGrid' })
        expect(h1).not.toHaveBeenCalled()
        expect(h2).toHaveBeenCalledTimes(1)
    })

    // ── Payload Integrity ────────────────────────────────────────────────────

    it('delivers the exact payload object to the listener', () => {
        const received: any[] = []
        bus.on('LIVE_EARLY_FINISH', (p: LiveEarlyFinishPayload) => received.push(p))
        const payload = { componentId: 'drag-1', type: 'dragDrop', completionTimeMs: 8000, timeLimitMs: 30000 }
        bus.emit('LIVE_EARLY_FINISH', payload)
        expect(received[0]).toEqual(payload)
    })

    it('delivers payload for COMPONENT_CORRECT_STREAK', () => {
        const handler = vi.fn()
        bus.on('COMPONENT_CORRECT_STREAK', handler)
        bus.emit('COMPONENT_CORRECT_STREAK', { count: 3 })
        expect(handler).toHaveBeenCalledWith({ count: 3 })
    })

    // ── Isolation & Cleanup ──────────────────────────────────────────────────

    it('clear() removes all listeners for a specific event', () => {
        const handler = vi.fn()
        bus.on('LESSON_REVIEWED', handler)
        bus.clear('LESSON_REVIEWED')
        bus.emit('LESSON_REVIEWED', { lessonId: 'lesson-123' })
        expect(handler).not.toHaveBeenCalled()
    })

    it('clearAll() removes ALL listeners for ALL events', () => {
        const h1 = vi.fn()
        const h2 = vi.fn()
        bus.on('COMPONENT_RESET', h1)
        bus.on('LESSON_COMPLETED', h2)
        bus.clearAll()
        bus.emit('COMPONENT_RESET', { componentId: 'c-1', type: 'quiz' })
        bus.emit('LESSON_COMPLETED', { lessonId: 'l-1', score: 50, maxScore: 100, percentage: 50 })
        expect(h1).not.toHaveBeenCalled()
        expect(h2).not.toHaveBeenCalled()
    })

    it('listenerCount() returns accurate count', () => {
        expect(bus.listenerCount('PROGRAM_ENROLLED')).toBe(0)
        const u1 = bus.on('PROGRAM_ENROLLED', vi.fn())
        bus.on('PROGRAM_ENROLLED', vi.fn())
        expect(bus.listenerCount('PROGRAM_ENROLLED')).toBe(2)
        u1()
        expect(bus.listenerCount('PROGRAM_ENROLLED')).toBe(1)
    })

    // ── Error Isolation ──────────────────────────────────────────────────────

    it('a throwing listener does not prevent other listeners from firing', () => {
        const badHandler = vi.fn().mockImplementation(() => { throw new Error('boom') })
        const goodHandler = vi.fn()
        bus.on('STARS_SPENT', badHandler)
        bus.on('STARS_SPENT', goodHandler)
        // Should not throw outside the bus
        expect(() => bus.emit('STARS_SPENT', { amount: 10, itemType: 'powerup' })).not.toThrow()
        expect(goodHandler).toHaveBeenCalled()
    })

    // ── Singleton Sanity ─────────────────────────────────────────────────────

    it('appEventBus singleton is an active EventBus instance', () => {
        const handler = vi.fn()
        appEventBus.on('AUDIO_REPLAYED', handler)
        appEventBus.emit('AUDIO_REPLAYED', { componentId: 'test-singleton' })
        expect(handler).toHaveBeenCalledTimes(1)
        appEventBus.off('AUDIO_REPLAYED', handler)
    })
})
