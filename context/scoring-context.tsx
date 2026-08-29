"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { Lesson } from "@/types/lesson"
import { ScoringService } from "@/services/scoring-service"
import { calculateLessonScore } from "@/domain/scoring"

export interface ComponentAttemptRecord {
    firstAttemptCount: number | null
    bestAttemptCount: number | null
}

interface ScoringContextType {
    currentScore: number
    totalScore: number
    percentage: number
    addPoints: (points: number) => void
    resetScore: () => void
    isPerfect: boolean
    lessonId: string | null
    programId: string | null
    /** Map of componentId -> { firstAttemptCount, bestAttemptCount } */
    attemptsMap: Record<string, ComponentAttemptRecord>
    recordComponentAttempt: (componentId: string, record: ComponentAttemptRecord) => void
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined)

export function ScoringProvider({
    children,
    lesson,
    initialScore = 0,
    componentsState,
    initialAttemptsMap,
    onAttemptsMapChange,
}: {
    children: React.ReactNode
    lesson: Lesson | null
    initialScore?: number
    componentsState?: Record<string, unknown> | null
    initialAttemptsMap?: Record<string, ComponentAttemptRecord>
    onAttemptsMapChange?: (map: Record<string, ComponentAttemptRecord>) => void
}) {
    const pulledScore = useMemo(
        () => calculateLessonScore(lesson, componentsState, initialScore),
        [lesson, componentsState, initialScore]
    )
    const [currentScore, setCurrentScore] = useState(pulledScore)
    const [totalScore, setTotalScore] = useState(0)
    const [attemptsMap, setAttemptsMap] = useState<Record<string, ComponentAttemptRecord>>(initialAttemptsMap ?? {})

    useEffect(() => {
        setCurrentScore(pulledScore)
        // Hydrate from saved component state / lessonState only. Live addPoints owns the score after that.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [componentsState, initialScore])

    useEffect(() => {
        if (initialAttemptsMap) {
            setAttemptsMap(initialAttemptsMap)
        }
    }, [initialAttemptsMap])

    useEffect(() => {
        onAttemptsMapChange?.(attemptsMap)
    }, [attemptsMap, onAttemptsMapChange])

    // Calculate total possible points whenever the lesson changes
    useEffect(() => {
        if (lesson) {
            const total = ScoringService.getTotalPossiblePoints(lesson)
            setTotalScore(total)
        }
    }, [lesson])

    const addPoints = useCallback((points: number) => {
        setCurrentScore(prev => prev + points)
    }, [])

    const resetScore = useCallback(() => {
        setCurrentScore(0)
    }, [])

    const recordComponentAttempt = useCallback((componentId: string, record: ComponentAttemptRecord) => {
        setAttemptsMap(prev => {
            const existing = prev[componentId]
            if (
                existing &&
                existing.firstAttemptCount === record.firstAttemptCount &&
                existing.bestAttemptCount === record.bestAttemptCount
            ) {
                return prev
            }
            return {
                ...prev,
                [componentId]: record
            }
        })
    }, [])

    const percentage = useMemo(() => {
        if (totalScore === 0) return 0
        return Math.round((currentScore / totalScore) * 100)
    }, [currentScore, totalScore])

    const isPerfect = useMemo(() => {
        return totalScore > 0 && currentScore >= totalScore
    }, [currentScore, totalScore])

    const lessonId = lesson?.id || null
    const programId = (lesson as { programId?: string } | null)?.programId || null

    const value = useMemo(() => ({
        currentScore,
        totalScore,
        percentage,
        addPoints,
        resetScore,
        isPerfect,
        lessonId,
        programId,
        attemptsMap,
        recordComponentAttempt
    }), [currentScore, totalScore, percentage, addPoints, resetScore, isPerfect, lessonId, programId, attemptsMap, recordComponentAttempt])

    return (
        <ScoringContext.Provider value={value}>
            {children}
        </ScoringContext.Provider>
    )
}

export function useScoring() {
    const context = useContext(ScoringContext)
    if (context === undefined) {
        throw new Error("useScoring must be used within a ScoringProvider")
    }
    return context
}

