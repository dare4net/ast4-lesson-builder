"use client"

import * as React from "react"
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRenderProps } from "./interactive-renderer"
import { useScoring as useScoringContext } from "@/context/scoring-context"
import { useFeedback } from "@/hooks/use-feedback"
import { useScoring as useBaseScoring, useAttemptTracking, UseAttemptTrackingReturn } from "./hooks"
import { BestAttemptBadge } from "./best-attempt-badge"
import { isComponentCompleted } from "@/domain/component-status"
import { getComponentScoringUnits } from "@/domain/scoring"
import { LiveBlockResetBar } from "@/components/store/live-block-reset"
import { ScoringService } from "@/services/scoring-service"

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

    const initialAwarded = ScoringService.calculateComponentScore(
        interactiveProps.component,
        interactiveProps.savedState,
    )

    const { isLive, handleScore, handlePoints, handleRetry } = useBaseScoring({
        points,
        mode,
        scoreContext: contextScoring,
        playFeedback,
        initialAwarded,
    })

    const recordComponentAttempt = contextScoring.recordComponentAttempt
    const attemptTracking = useAttemptTracking({
        componentId: interactiveProps.component.id,
        componentType: interactiveProps.component.type,
        mode,
        lessonId: contextScoring.lessonId,
        programId: contextScoring.programId,
        initialRecord: contextScoring.attemptsMap?.[interactiveProps.component.id],
    })

    const handleRetryAndReset = React.useCallback(() => {
        attemptTracking.resetAttempts()
        handleRetry()
    }, [attemptTracking.resetAttempts, handleRetry])

    const recordAttempt = React.useCallback<UseAttemptTrackingReturn['recordAttempt']>((
        isCorrect,
        score,
        maxScore,
        completionTimeMs,
        extras,
    ) => {
        attemptTracking.recordAttempt(isCorrect, score, maxScore, completionTimeMs, {
            ...extras,
            units: getComponentScoringUnits(interactiveProps.component),
        })
    }, [attemptTracking.recordAttempt, interactiveProps.component])

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

    const [resetNonce, setResetNonce] = React.useState(0)

    return (
        <InteractiveRenderer
            key={`${interactiveProps.component.id}-${resetNonce}`}
            {...interactiveProps}
            onRender={(renderProps) => {
                const done = isComponentCompleted(renderProps.state) || Boolean((renderProps.state as { timedOut?: boolean; submitted?: boolean })?.timedOut)
                return (
                    <div className="flex-1 flex flex-col min-h-0 w-full h-full">
                        {!isLive && (
                            <div className="shrink-0 flex items-center justify-end gap-2 px-3 sm:px-6 pt-1">
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
                                recordAttempt,
                                handleScore,
                                handlePoints,
                                handleRetry: handleRetryAndReset,
                                isLive,
                                mode
                            })}
                        </div>
                        <LiveBlockResetBar
                            lessonId={contextScoring.lessonId}
                            componentId={interactiveProps.component.id}
                            isLive={isLive}
                            done={done}
                            onWiped={() => {
                                handleRetryAndReset()
                                interactiveProps.setComponentState?.({ __replace: true } as S)
                                setResetNonce((value) => value + 1)
                            }}
                        />
                    </div>
                )
            }}
        />
    )
}

