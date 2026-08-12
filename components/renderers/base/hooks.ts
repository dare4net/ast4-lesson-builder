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
    const isIncomingRef = useRef(false)
    const lastStateRef = useRef<S | undefined>(savedState ?? initialState)

    // 1. Sync incoming from parent (savedState -> local state)
    useEffect(() => {
        if (savedState !== undefined && !isEqual(savedState, lastStateRef.current)) {
            isIncomingRef.current = true
            lastStateRef.current = savedState
            setState(savedState)
        }
    }, [savedState])

    // 2. Sync outgoing from local state -> parent (setComponentState)
    useEffect(() => {
        if (isIncomingRef.current) {
            // State update originated from parent (savedState), do NOT send back
            isIncomingRef.current = false
            return
        }
        if (setComponentState && !isEqual(state, lastStateRef.current)) {
            lastStateRef.current = state
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
