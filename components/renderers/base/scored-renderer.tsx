"use client"

import * as React from "react"
import { InteractiveRenderer, InteractiveRendererProps, InteractiveRenderProps } from "./interactive-renderer"
import { useScoring as useScoringContext } from "@/context/scoring-context"
import { useFeedback } from "@/hooks/use-feedback"
import { useScoring as useBaseScoring } from "./hooks"

export interface ScoredRenderProps<S> extends InteractiveRenderProps<S> {
    handleScore: (isCorrect: boolean) => void
    handlePoints: (p: number) => void
    handleRetry: () => void
    isLive: boolean
    mode: 'practice' | 'live'
}

export interface ScoredRendererProps<S> extends Omit<InteractiveRendererProps<S>, 'onRender'> {
    points?: number
    mode?: 'practice' | 'live'
    // scoreContext is now handled purely via context inside ScoredRenderer
    onRender: (props: ScoredRenderProps<S>) => React.ReactNode
}

/**
 * ScoredRenderer
 * 
 * Wrapper for components that have points and scoring (e.g. Quiz, DragDrop).
 * Handles:
 * - All InteractiveRenderer logic (persistence)
 * - Scoring logic (Live vs Practice mode) via centralized context
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

    return (
        <InteractiveRenderer
            {...interactiveProps}
            onRender={(renderProps) => {
                return onRender({
                    ...renderProps,
                    handleScore,
                    handlePoints,
                    handleRetry,
                    isLive,
                    mode
                })
            }}
        />
    )
}
