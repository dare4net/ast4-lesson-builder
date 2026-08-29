"use client"

import * as React from "react"
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRenderProps } from "./interactive-renderer"
import { useScoring as useScoringContext } from "@/context/scoring-context"
import { useFeedback } from "@/hooks/use-feedback"
import { useScoring as useBaseScoring, useAttemptTracking, UseAttemptTrackingReturn } from "./hooks"
import { BestAttemptBadge } from "./best-attempt-badge"

export interface ScoredRenderProps<S> extends InteractiveRenderProps<S>, UseAttemptTrackingReturn {
    handleScore: (isCorrect: boolean) => void
    handlePoints: (p: number) => void
    handleRetry: () => void
    isLive: boolean
    mode: 'practice' | 'live'
}

export interface ScoredRendererProps<S> extends Omit<InteractiveRendererProps<S>, 'onRender'> {
    points?: number
    mode?: 'practice' | 'live'
    onRender: (props: ScoredRenderProps<S>) => React.ReactNode
}

/**
 * ScoredRenderer
 * 
 * Wrapper for components that have points and scoring (e.g. Quiz, DragDrop, MemoryGrid).
 * Handles:
 * - All InteractiveRenderer logic (persistence)
 * - Scoring logic (Live vs Practice mode) via centralized context
 * - Attempt tracking (first-attempt baseline, local best, event bus emission)
 * - Points awarding
 */
export function ScoredRenderer<S>({
    points = 10,
    mode = 'practice',
    onRender,
    ...interactiveProps
}: ScoredRendererProps<S>) {
    const { playFeedback } = useFeedback()
    const contextScoring = useScoringContext()

    const { isLive, handleScore, handlePoints, handleRetry } = useBaseScoring({
        points,
        mode,
        scoreContext: contextScoring,
        playFeedback
    })

    const recordComponentAttempt = contextScoring.recordComponentAttempt
    const attemptTracking = useAttemptTracking({
        componentId: interactiveProps.component.id,
        componentType: interactiveProps.component.type,
        mode,
        initialRecord: contextScoring.attemptsMap?.[interactiveProps.component.id],
    })

    const handleRetryAndReset = React.useCallback(() => {
        attemptTracking.resetAttempts()
        handleRetry()
    }, [attemptTracking.resetAttempts, handleRetry])

    // Sync attempt records to ScoringContext for user-interactions persistence.
    // Depend on recordComponentAttempt, not the whole context value — that object
    // is recreated whenever attemptsMap changes and would loop setState.
    React.useEffect(() => {
        if (attemptTracking.firstAttemptCount !== null || attemptTracking.bestAttemptCount !== null) {
            recordComponentAttempt(interactiveProps.component.id, {
                firstAttemptCount: attemptTracking.firstAttemptCount,
                bestAttemptCount: attemptTracking.bestAttemptCount
            })
        }
    }, [
        interactiveProps.component.id,
        attemptTracking.firstAttemptCount,
        attemptTracking.bestAttemptCount,
        recordComponentAttempt
    ])

    return (
        <InteractiveRenderer
            {...interactiveProps}
            onRender={(renderProps) => {
                return (
                    <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                        {!isLive && (
                            <div className="shrink-0 flex justify-end px-3 sm:px-6 pt-1">
                                <BestAttemptBadge
                                    bestAttemptCount={attemptTracking.bestAttemptCount}
                                    attemptCount={attemptTracking.attemptCount}
                                />
                            </div>
                        )}
                        <div className="flex-1 flex flex-col min-h-0">
                            {onRender({
                                ...renderProps,
                                ...attemptTracking,
                                handleScore,
                                handlePoints,
                                handleRetry: handleRetryAndReset,
                                isLive,
                                mode
                            })}
                        </div>
                    </div>
                )
            }}
        />
    )
}

