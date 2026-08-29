import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAttemptTracking } from '@/components/renderers/base/hooks'
import { appEventBus } from '@/lib/event-bus'

describe('useAttemptTracking', () => {
    beforeEach(() => {
        appEventBus.clearAll()
    })

    it('initializes with 0 attempts and uncompleted state', () => {
        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-1', componentType: 'quiz', mode: 'practice' })
        )
        expect(result.current.attemptCount).toBe(0)
        expect(result.current.firstAttemptCount).toBeNull()
        expect(result.current.bestAttemptCount).toBeNull()
        expect(result.current.hasCompleted).toBe(false)
    })

    it('increments attemptCount on incorrect attempt without completing', () => {
        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-1', componentType: 'quiz', mode: 'practice' })
        )

        act(() => {
            result.current.recordAttempt(false) // incorrect
        })

        expect(result.current.attemptCount).toBe(1)
        expect(result.current.firstAttemptCount).toBeNull()
        expect(result.current.hasCompleted).toBe(false)
    })

    it('seals firstAttemptCount on first correct completion and emits COMPONENT_SUBMITTED', () => {
        const busListener = vi.fn()
        appEventBus.on('COMPONENT_SUBMITTED', busListener)

        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-1', componentType: 'quiz', mode: 'practice' })
        )

        act(() => {
            result.current.recordAttempt(false) // attempt 1 (wrong)
        })
        act(() => {
            result.current.recordAttempt(true, 10, 10) // attempt 2 (correct)
        })

        expect(result.current.attemptCount).toBe(2)
        expect(result.current.firstAttemptCount).toBe(2)
        expect(result.current.bestAttemptCount).toBe(2)
        expect(result.current.hasCompleted).toBe(true)

        expect(busListener).toHaveBeenCalledTimes(1)
        expect(busListener).toHaveBeenCalledWith(
            expect.objectContaining({
                componentId: 'comp-1',
                type: 'quiz',
                mode: 'practice',
                score: 10,
                maxScore: 10,
                percentage: 100,
                attemptCount: 2,
                isFirstAttempt: true,
            })
        )
    })

    it('preserves firstAttemptCount on reset and updates bestAttemptCount if retry is better', () => {
        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-1', componentType: 'quiz', mode: 'practice' })
        )

        // First completion in 3 attempts
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(true, 10, 10) })

        expect(result.current.firstAttemptCount).toBe(3)
        expect(result.current.bestAttemptCount).toBe(3)

        // Student resets attempt count to challenge record
        act(() => { result.current.resetAttempts() })
        expect(result.current.attemptCount).toBe(0)
        expect(result.current.firstAttemptCount).toBe(3) // STILL SEALED AT 3!

        // Second completion in 1 attempt
        act(() => { result.current.recordAttempt(true, 10, 10) })
        expect(result.current.attemptCount).toBe(1)
        expect(result.current.firstAttemptCount).toBe(3) // STILL SEALED AT 3!
        expect(result.current.bestAttemptCount).toBe(1)  // BEST UPDATED TO 1!
    })

    it('does NOT track attempts in live mode but still emits COMPONENT_SUBMITTED', () => {
        const busListener = vi.fn()
        appEventBus.on('COMPONENT_SUBMITTED', busListener)

        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-1', componentType: 'quiz', mode: 'live' })
        )

        act(() => { result.current.recordAttempt(true, 10, 10) })

        expect(result.current.attemptCount).toBe(0)
        expect(busListener).toHaveBeenCalledTimes(1)
        expect(busListener).toHaveBeenCalledWith(
            expect.objectContaining({
                componentId: 'comp-1',
                mode: 'live',
                percentage: 100,
            })
        )
    })

    it('restores sealed attempt counts from a previous session', () => {
        const { result } = renderHook(() =>
            useAttemptTracking({
                componentId: 'comp-1',
                componentType: 'quiz',
                mode: 'practice',
                initialRecord: { firstAttemptCount: 4, bestAttemptCount: 3 },
            })
        )
        expect(result.current.attemptCount).toBe(4)
        expect(result.current.firstAttemptCount).toBe(4)
        expect(result.current.bestAttemptCount).toBe(3)
        expect(result.current.hasCompleted).toBe(true)
    })

    it('includes lessonId and programId on COMPONENT_SUBMITTED', () => {
        const busListener = vi.fn()
        appEventBus.on('COMPONENT_SUBMITTED', busListener)
        const { result } = renderHook(() =>
            useAttemptTracking({
                componentId: 'hang-1',
                componentType: 'hangman',
                mode: 'practice',
                lessonId: 'lesson-1',
                programId: 'prog-1',
            })
        )
        act(() => {
            result.current.recordAttempt(true, 10, 10)
        })
        expect(busListener).toHaveBeenCalledWith(
            expect.objectContaining({
                componentId: 'hang-1',
                lessonId: 'lesson-1',
                programId: 'prog-1',
                type: 'hangman',
            })
        )
    })
})
