"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { Lesson } from "@/types/lesson"
import { ScoringService } from "@/services/scoring-service"

interface ScoringContextType {
    currentScore: number
    totalScore: number
    percentage: number
    addPoints: (points: number) => void
    resetScore: () => void
    isPerfect: boolean
}

const ScoringContext = createContext<ScoringContextType | undefined>(undefined)

export function ScoringProvider({
    children,
    lesson,
    initialScore = 0
}: {
    children: React.ReactNode
    lesson: Lesson | null
    initialScore?: number
}) {
    const [currentScore, setCurrentScore] = useState(initialScore)
    const [totalScore, setTotalScore] = useState(0)

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

    const percentage = useMemo(() => {
        if (totalScore === 0) return 0
        return Math.round((currentScore / totalScore) * 100)
    }, [currentScore, totalScore])

    const isPerfect = useMemo(() => {
        return totalScore > 0 && currentScore >= totalScore
    }, [currentScore, totalScore])

    const value = useMemo(() => ({
        currentScore,
        totalScore,
        percentage,
        addPoints,
        resetScore,
        isPerfect
    }), [currentScore, totalScore, percentage, addPoints, resetScore, isPerfect])

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
