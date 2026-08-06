"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import isEqual from "lodash.isequal"

export interface UseInteractiveStateProps<S> {
    initialState: S
    savedState?: S
    setComponentState?: (state: S) => void
}

/**
 * useInteractiveState
 * 
 * Hook to manage local state that syncs with parent persistence.
 * Prevents hydration mismatches and handles deep equality checks.
 */
export function useInteractiveState<S>({
    initialState,
    savedState,
    setComponentState
}: UseInteractiveStateProps<S>) {
    const [state, setState] = useState<S>(savedState ?? initialState)
    const lastIncomingState = useRef<S | undefined>(savedState)
    const lastOutgoingState = useRef<S>(savedState ?? initialState)

    // Sync from parent (savedState) -> local state
    // We intentionally do NOT include `state` in the dep array here.
    // Including it caused a loop: savedState changes → setState → state changes → effect re-runs.
    // The `lastIncomingState` ref is sufficient to deduplicate incoming updates.
    useEffect(() => {
        if (savedState !== undefined && !isEqual(savedState, lastIncomingState.current)) {
            setState(savedState)
            lastIncomingState.current = savedState
            lastOutgoingState.current = savedState
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedState])

    // Sync from local state -> parent (setComponentState)
    useEffect(() => {
        // Only sync outward if the state has changed from what we last sent or received
        if (setComponentState && !isEqual(state, lastOutgoingState.current)) {
            lastOutgoingState.current = state
            setComponentState(state)
        }
    }, [state, setComponentState])

    return [state, setState] as const
}

export interface UseScoringProps {
    points: number
    mode?: 'practice' | 'live'
    scoreContext?: { addPoints: (p: number) => void }
    playFeedback: (type: any, options?: any) => Promise<any>
}

/**
 * useScoring
 * 
 * Hook to manage scoring logic and feedback for Scored Components.
 * Handles Practice vs Live mode differences.
 */
export function useScoring({
    points,
    mode = 'practice',
    scoreContext,
    playFeedback
}: UseScoringProps) {
    const isLive = mode === 'live'

    const handleScore = useCallback((isCorrect: boolean) => {
        if (isCorrect) {
            if (isLive) {
                scoreContext?.addPoints(points)
            }
        }
    }, [isLive, points, scoreContext])

    const handlePoints = useCallback((p: number) => {
        if (isLive) {
            scoreContext?.addPoints(p)
        }
    }, [isLive, scoreContext])

    const handleRetry = useCallback(() => {
        if (isLive) return // No retry in live mode
        playFeedback('uiClick')
    }, [isLive, playFeedback])

    return {
        isLive,
        handleScore,
        handlePoints,
        handleRetry
    }
}
