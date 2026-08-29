import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAttemptTracking } from '@/components/renderers/base/hooks'
import { appEventBus } from '@/lib/event-bus'

describe('Reset Button Logic', () => {
    beforeEach(() => {
        appEventBus.clearAll()
    })

    it('does NOT reset attempts if the component has not been completed at least once', () => {
        const resetListener = vi.fn()
        appEventBus.on('COMPONENT_RESET', resetListener)

        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-reset-1', componentType: 'matchingPairs', mode: 'practice' })
        )

        act(() => { result.current.recordAttempt(false) }) // attempt 1 (wrong)
        expect(result.current.attemptCount).toBe(1)
        expect(result.current.hasCompleted).toBe(false)

        // Attempt reset before completion -> should be a no-op
        act(() => { result.current.resetAttempts() })
        expect(result.current.attemptCount).toBe(1) // unchanged!
        expect(resetListener).not.toHaveBeenCalled()
    })

    it('resets attemptCount to 0 and emits COMPONENT_RESET once completed', () => {
        const resetListener = vi.fn()
        appEventBus.on('COMPONENT_RESET', resetListener)

        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-reset-1', componentType: 'matchingPairs', mode: 'practice' })
        )

        // Complete in 2 attempts
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(true, 20, 20) })

        expect(result.current.attemptCount).toBe(2)
        expect(result.current.firstAttemptCount).toBe(2)
        expect(result.current.hasCompleted).toBe(true)

        // Perform reset
        act(() => { result.current.resetAttempts() })

        expect(result.current.attemptCount).toBe(0)
        expect(result.current.firstAttemptCount).toBe(2) // IMMUTABLE
        expect(resetListener).toHaveBeenCalledTimes(1)
        expect(resetListener).toHaveBeenCalledWith({
            componentId: 'comp-reset-1',
            type: 'matchingPairs'
        })
    })

    it('updates bestAttemptCount when a subsequent attempt sequence beats the baseline', () => {
        const { result } = renderHook(() =>
            useAttemptTracking({ componentId: 'comp-reset-2', componentType: 'wordScramble', mode: 'practice' })
        )

        // Baseline: 4 attempts
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(true, 15, 15) })

        expect(result.current.firstAttemptCount).toBe(4)
        expect(result.current.bestAttemptCount).toBe(4)

        // Reset
        act(() => { result.current.resetAttempts() })

        // Second run: 2 attempts (better!)
        act(() => { result.current.recordAttempt(false) })
        act(() => { result.current.recordAttempt(true, 15, 15) })

        expect(result.current.attemptCount).toBe(2)
        expect(result.current.firstAttemptCount).toBe(4) // STILL 4
        expect(result.current.bestAttemptCount).toBe(2)  // IMPROVED TO 2!
    })
})
