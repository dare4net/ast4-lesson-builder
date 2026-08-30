"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import isEqual from "lodash.isequal"
import { appEventBus } from "@/lib/event-bus"

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

// ─── Attempt Tracking ─────────────────────────────────────────────────────────

export interface UseAttemptTrackingProps {
    /** Unique component ID as it appears in the lesson JSON */
    componentId: string
    /** Component type key e.g. 'quiz', 'memoryGrid' */
    componentType: string
    mode: 'practice' | 'live'
    lessonId?: string | null
    programId?: string | null
    /** Restored first/best counts from a previous session */
    initialRecord?: { firstAttemptCount: number | null; bestAttemptCount: number | null }
}

export interface UseAttemptTrackingReturn {
    /** Running attempt count since last reset (shown in viewer UI) */
    attemptCount: number
    /** 
     * Sealed on first completion. Used by leaderboards/achievements.
     * null = not yet completed even once.
     */
    firstAttemptCount: number | null
    /** Lowest attempt count across all resets. Shown as the local best. */
    bestAttemptCount: number | null
    /** Whether the component has been completed at least once */
    hasCompleted: boolean
    /** 
     * Call this on every submit/check press.
     * @param isCorrect - pass true only when the full component is 100% correct/completed
     * @param score - points earned this submission
     * @param maxScore - max possible points
     * @param completionTimeMs - elapsed ms since component was first shown
     */
    recordAttempt: (isCorrect: boolean, score?: number, maxScore?: number, completionTimeMs?: number, extras?: Record<string, number | boolean | string>) => void
    /** 
     * Resets running attemptCount to 0 so the student can challenge their best.
     * Only callable after first completion. Does NOT mutate firstAttemptCount.
     */
    resetAttempts: () => void
}

/**
 * useAttemptTracking
 * 
 * Tracks attempts per gamified component in Practice mode.
 * Seals the first-attempt baseline and maintains the local best attempt count.
 * Emits COMPONENT_SUBMITTED events to the AppEventBus on completion.
 * 
 * Live mode: attempt counts stay sealed at 0. Completing still emits
 * COMPONENT_SUBMITTED so the star engine can credit the wallet.
 */
export function useAttemptTracking({
    componentId,
    componentType,
    mode,
    lessonId,
    programId,
    initialRecord,
}: UseAttemptTrackingProps): UseAttemptTrackingReturn {
    const restoredFirst = initialRecord?.firstAttemptCount ?? null
    const restoredBest = initialRecord?.bestAttemptCount ?? null
    const [attemptCount, setAttemptCount] = useState(restoredFirst ?? 0)
    const [firstAttemptCount, setFirstAttemptCount] = useState<number | null>(restoredFirst)
    const [bestAttemptCount, setBestAttemptCount] = useState<number | null>(restoredBest)
    const [hasCompleted, setHasCompleted] = useState(restoredFirst !== null)
    const mountTimeRef = useRef<number>(Date.now())
    const isLive = mode === 'live'

    const recordAttempt = useCallback((
        isCorrect: boolean,
        score = 0,
        maxScore = 0,
        completionTimeMs?: number,
        extras?: Record<string, number | boolean | string>
    ) => {
        if (isLive) {
            if (!isCorrect) return
            const elapsed = completionTimeMs ?? (Date.now() - mountTimeRef.current)
            const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 100
            appEventBus.emit('COMPONENT_SUBMITTED', {
                componentId,
                type: componentType,
                mode,
                score,
                maxScore,
                percentage,
                attemptCount: 1,
                completionTimeMs: elapsed,
                isFirstAttempt: true,
                ...(lessonId ? { lessonId } : {}),
                ...(programId ? { programId } : {}),
                ...(extras ? { extras } : {}),
            })
            return
        }

        const nextAttemptCount = attemptCount + 1
        setAttemptCount(nextAttemptCount)

        if (!isCorrect) return

        const elapsed = completionTimeMs ?? (Date.now() - mountTimeRef.current)
        const isFirstAttempt = !hasCompleted
        setHasCompleted(true)

        if (isFirstAttempt) {
            setFirstAttemptCount(nextAttemptCount)
            setBestAttemptCount(nextAttemptCount)
        } else if (bestAttemptCount === null || nextAttemptCount < bestAttemptCount) {
            setBestAttemptCount(nextAttemptCount)
        }

        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : (isCorrect ? 100 : 0)

        appEventBus.emit('COMPONENT_SUBMITTED', {
            componentId,
            type: componentType,
            mode,
            score,
            maxScore,
            percentage,
            attemptCount: nextAttemptCount,
            completionTimeMs: elapsed,
            isFirstAttempt,
            ...(lessonId ? { lessonId } : {}),
            ...(programId ? { programId } : {}),
            ...(extras ? { extras } : {}),
        })
    }, [attemptCount, bestAttemptCount, hasCompleted, componentId, componentType, mode, isLive, lessonId, programId])

    const resetAttempts = useCallback(() => {
        if (!hasCompleted) return
        setAttemptCount(0)
        mountTimeRef.current = Date.now()

        appEventBus.emit('COMPONENT_RESET', {
            componentId,
            type: componentType,
            ...(lessonId ? { lessonId } : {}),
        })
    }, [hasCompleted, componentId, componentType, lessonId])

    return {
        attemptCount,
        firstAttemptCount,
        bestAttemptCount,
        hasCompleted,
        recordAttempt,
        resetAttempts,
    }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

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
