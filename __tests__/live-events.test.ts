import { describe, expect, it, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { appEventBus } from '@/lib/event-bus'
import { emitLiveTimerEvent, resolveLiveTimerEvent } from '@/lib/live-events'

describe('resolveLiveTimerEvent', () => {
    it('emits LIVE_TIMEOUT when the clock hits zero while still running', () => {
        expect(resolveLiveTimerEvent({
            alreadyEmitted: false,
            wasIncompleteAtStart: true,
            isCompleted: false,
            secondsRemaining: 0,
            durationSeconds: 10,
        })).toEqual({ type: 'LIVE_TIMEOUT' })
    })

    it('emits LIVE_EARLY_FINISH when completed with time left', () => {
        expect(resolveLiveTimerEvent({
            alreadyEmitted: false,
            wasIncompleteAtStart: true,
            isCompleted: true,
            secondsRemaining: 6,
            durationSeconds: 10,
        })).toEqual({
            type: 'LIVE_EARLY_FINISH',
            completionTimeMs: 4000,
            timeLimitMs: 10000,
        })
    })

    it('does not emit for a timer that mounted already completed', () => {
        expect(resolveLiveTimerEvent({
            alreadyEmitted: false,
            wasIncompleteAtStart: false,
            isCompleted: true,
            secondsRemaining: 8,
            durationSeconds: 10,
        })).toBeNull()
    })

    it('does not emit twice', () => {
        expect(resolveLiveTimerEvent({
            alreadyEmitted: true,
            wasIncompleteAtStart: true,
            isCompleted: true,
            secondsRemaining: 4,
            durationSeconds: 10,
        })).toBeNull()
    })

    it('does not treat finishing at 0s as an early finish', () => {
        expect(resolveLiveTimerEvent({
            alreadyEmitted: false,
            wasIncompleteAtStart: true,
            isCompleted: true,
            secondsRemaining: 0,
            durationSeconds: 10,
        })).toBeNull()
    })
})

describe('emitLiveTimerEvent', () => {
    beforeEach(() => {
        appEventBus.clearAll()
    })

    it('publishes timeout and early-finish on the bus', () => {
        const timeout = vi.fn()
        const early = vi.fn()
        appEventBus.on('LIVE_TIMEOUT', timeout)
        appEventBus.on('LIVE_EARLY_FINISH', early)

        emitLiveTimerEvent({ type: 'LIVE_TIMEOUT' }, { componentId: 'quiz-1', type: 'quiz' })
        emitLiveTimerEvent(
            { type: 'LIVE_EARLY_FINISH', completionTimeMs: 3000, timeLimitMs: 10000 },
            { componentId: 'quiz-1', type: 'quiz' },
        )

        expect(timeout).toHaveBeenCalledWith({ componentId: 'quiz-1', type: 'quiz' })
        expect(early).toHaveBeenCalledWith({
            componentId: 'quiz-1',
            type: 'quiz',
            completionTimeMs: 3000,
            timeLimitMs: 10000,
        })
    })
})

describe('B2 wiring', () => {
    it('catalog enroll still emits PROGRAM_ENROLLED', () => {
        const source = readFileSync(join(process.cwd(), 'app/dashboard/student/catalog/page.tsx'), 'utf8')
        expect(source).toContain("emit('PROGRAM_ENROLLED'")
    })

    it('LiveTimer uses the shared live-event helpers', () => {
        const source = readFileSync(join(process.cwd(), 'components/live-mode.tsx'), 'utf8')
        expect(source).toContain('resolveLiveTimerEvent')
        expect(source).toContain('emitLiveTimerEvent')
    })
})
