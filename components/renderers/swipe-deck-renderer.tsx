"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2, XCircle, Layers, HelpCircle } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

export interface SwipeCardItem {
    id: string
    front?: string // Statement / term / question
    text?: string // Fallback property name from editor
    statement?: string // Fallback property name
    explanation?: string // Shown on card back after decision
    correctSide: "left" | "right"
}

export interface SwipeDeckRendererProps {
    id?: string
    title?: string
    leftLabel?: string
    rightLabel?: string
    cards?: SwipeCardItem[]
    points?: number
    mode?: "practice" | "live"
    savedState?: SwipeDeckState
    setComponentState?: (state: SwipeDeckState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

export type SwipeDeckState = {
    currentIndex: number
    /** Card ID -> Decision "left" | "right" */
    decisions: Record<string, "left" | "right">
    isFlipped: boolean
    submitted: boolean
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

const DEFAULT_CARDS: SwipeCardItem[] = [
    {
        id: "c1",
        front: "Humans only use 10% of their brain.",
        explanation: "Myth: Brain imaging shows almost all areas of the brain are active during routine tasks.",
        correctSide: "left",
    },
    {
        id: "c2",
        front: "Water boils at a lower temperature at high altitudes.",
        explanation: "Fact: Lower atmospheric pressure reduces the boiling point of liquids.",
        correctSide: "right",
    },
    {
        id: "c3",
        front: "Sunlight reaches Earth in about 8 minutes.",
        explanation: "Fact: Light travels 93 million miles in roughly 8 minutes and 20 seconds.",
        correctSide: "right",
    },
]

function SwipeDeckContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    mode,
    title,
    leftLabel = "Myth",
    rightLabel = "Fact",
    cards = DEFAULT_CARDS,
    points = 15,
    isEditing,
    disabled,
}: ScoredRenderProps<SwipeDeckState> & {
    title: string
    leftLabel: string
    rightLabel: string
    cards: SwipeCardItem[]
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { playFeedback } = useFeedback()
    const { currentIndex, decisions, isFlipped, submitted } = state

    const currentCard = cards[currentIndex]
    const isEnd = currentIndex >= cards.length

    const handleChoice = (side: "left" | "right") => {
        if (submitted || isEnd || isEditing || disabled || isFlipped) return

        const card = cards[currentIndex]
        const isChoiceCorrect = side === card.correctSide

        if (isChoiceCorrect) {
            void playFeedback("dngSuccess", { sound: true, animation: false })
        } else {
            void playFeedback("incorrect", { sound: true, animation: false })
        }

        // Show card explanation flip first
        setState(prev => ({
            ...prev,
            decisions: { ...prev.decisions, [card.id]: side },
            isFlipped: true,
        }))
    }

    const handleNextCard = async () => {
        if (submitted || isEnd || isEditing || disabled) return

        const nextIdx = currentIndex + 1
        const nextIsEnd = nextIdx >= cards.length

        if (nextIsEnd) {
            // Calculate final deck score
            let correctCount = 0
            cards.forEach(c => {
                if (decisions[c.id] === c.correctSide) correctCount++
            })

            const isAllCorrect = correctCount === cards.length
            const earnedPoints = Math.round((correctCount / Math.max(cards.length, 1)) * points)

            if (isAllCorrect) {
                await playFeedback("quizSuccess", { sound: true })
            }

            setState(prev => ({
                ...prev,
                currentIndex: nextIdx,
                isFlipped: false,
                submitted: true,
                isCorrect: isAllCorrect,
                status: "completed",
                score: earnedPoints,
                maxScore: points,
            }))

            handlePoints(earnedPoints)
        } else {
            setState(prev => ({
                ...prev,
                currentIndex: nextIdx,
                isFlipped: false,
            }))
        }
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState({
            currentIndex: 0,
            decisions: {},
            isFlipped: false,
            submitted: false,
            status: "active",
        })
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-all duration-300 px-6 sm:px-10 md:px-12 py-3">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1CB0F6]">
                        Swipe Deck • {points} Points
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-[#1CB0F6]" />
                    <span>
                        Card {Math.min(currentIndex + 1, cards.length)} of {cards.length}
                    </span>
                </div>
            </div>

            {/* Main Stage: Card Stack */}
            <div className="flex-1 flex flex-col justify-center items-center my-4 min-h-[260px]">
                {!isEnd ? (
                    <div className="relative w-full max-w-xl min-h-[260px] sm:min-h-[300px] flex flex-col justify-center perspective-1000">
                        {/* 3D Stack Layer Behind */}
                        {currentIndex < cards.length - 1 && (
                            <div className="absolute inset-0 transform translate-y-3 scale-95 rounded-3xl bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-sm opacity-60 z-0 pointer-events-none" />
                        )}

                        {/* Front Active Card */}
                        <div
                            className={cn(
                                "relative z-10 w-full min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-3xl border-2 border-b-6 shadow-xl flex flex-col justify-between transition-all duration-300 select-none",
                                !isFlipped && "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700",
                                isFlipped && decisions[currentCard.id] === currentCard.correctSide && "bg-[#58CC02]/15 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 dark:text-emerald-100",
                                isFlipped && decisions[currentCard.id] !== currentCard.correctSide && "bg-[#FF4B4B]/15 border-[#FF4B4B] border-b-[#CC3C3C] text-rose-950 dark:text-rose-100"
                            )}
                        >
                            {!isFlipped ? (
                                <>
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Evaluate Statement
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">
                                            Swipe or Tap Below
                                        </span>
                                    </div>

                                    <div className="my-auto py-4 text-center">
                                        <FormattedText content={currentCard.front || currentCard.text || currentCard.statement || "No statement text provided"} as="p" className="text-lg sm:text-xl font-bold tracking-tight leading-relaxed text-slate-800 dark:text-slate-100" />
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-black text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                        <span>← {leftLabel}</span>
                                        <span>{rightLabel} →</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                                        <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider">
                                            {decisions[currentCard.id] === currentCard.correctSide ? (
                                                <span className="text-[#58CC02] flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" /> Correct Decision!
                                                </span>
                                            ) : (
                                                <span className="text-[#FF4B4B] flex items-center gap-1">
                                                    <XCircle className="w-4 h-4" /> Incorrect
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="my-auto py-4 text-center space-y-2">
                                        <FormattedText content={currentCard.explanation || `Correct answer is ${currentCard.correctSide === "left" ? leftLabel : rightLabel}.`} as="p" className="text-sm sm:text-base font-bold leading-relaxed text-slate-700 dark:text-slate-200" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNextCard}
                                        className="w-full py-3 rounded-xl bg-[#1CB0F6] hover:bg-[#189CDD] border-2 border-b-4 border-[#1CB0F6] border-b-[#0090CC] text-white font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-md mt-2"
                                    >
                                        Next Card →
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    // End of Deck Summary
                    <div className="w-full max-w-xl p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-b-6 border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
                        <div className="w-12 h-12 rounded-2xl bg-[#58CC02]/20 text-[#58CC02] flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black">Deck Completed!</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            You reviewed all {cards.length} cards in this deck.
                        </p>
                    </div>
                )}
            </div>

            {/* Binary Decision Buttons (3D Tactile Controls) */}
            {!isEnd && !isFlipped && (
                <div className="shrink-0 grid grid-cols-2 gap-4 max-w-xl mx-auto w-full pt-2">
                    <button
                        type="button"
                        onClick={() => handleChoice("left")}
                        disabled={isEditing || disabled}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white border-2 border-b-4 border-rose-500 border-b-rose-700 font-black text-sm sm:text-base uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[3]" />
                        <span>{leftLabel}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleChoice("right")}
                        disabled={isEditing || disabled}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#58CC02] hover:bg-[#46a302] text-white border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] font-black text-sm sm:text-base uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer shadow-md"
                    >
                        <span>{rightLabel}</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                </div>
            )}

            {/* Footer Reset Control */}
            <div className="shrink-0 min-h-[48px] flex items-center justify-end pt-3">
                {submitted && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-2 border-b-4 border-slate-200 dark:border-slate-700 text-xs font-extrabold uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Restart Deck</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export function SwipeDeckRenderer({
    id = "swipe-deck-component",
    title = "Myth vs. Fact",
    leftLabel = "Myth",
    rightLabel = "Fact",
    cards = DEFAULT_CARDS,
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: SwipeDeckRendererProps) {
    const component: Component = {
        id,
        type: "swipeDeck",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, leftLabel, rightLabel, cards, points },
        mode: mode as any,
    } as Component

    const initialState: SwipeDeckState = {
        currentIndex: 0,
        decisions: {},
        isFlipped: false,
        submitted: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            submitted: savedState.submitted ?? savedState.status === "completed",
        }
        : undefined

    return (
        <ScoredRenderer<SwipeDeckState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={renderProps => (
                <SwipeDeckContent
                    {...renderProps}
                    title={title}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    cards={cards}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
