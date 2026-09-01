"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Layers, CheckCircle2, RefreshCw } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import { LiveStartScreen, LiveTimer } from "@/components/live-mode"
import { buildLiveStartMeta } from "@/lib/live-start-info"
import { useLiveBlock, readTimeLimit } from "@/hooks/use-live-block"
import { FormattedText } from "@/components/ui/formatted-text"
import type { Component } from "@/types/lesson"

interface MemoryPair {
    id: string
    term: string
    definition: string
}

interface CardTile {
    id: string
    pairId: string
    text: string
    type: "term" | "definition"
}

interface MemoryGridRendererProps {
    id?: string
    title?: string
    pairs: MemoryPair[]
    points?: number
    mode?: "practice" | "live"
    timeLimit?: number
    savedState?: MemoryGridState
    setComponentState?: (state: MemoryGridState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

type MemoryGridState = {
    cards: CardTile[]
    flippedCardIds: string[]
    matchedPairIds: string[]
    attempts: number
    isChecking: boolean
    completed: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

function createShuffledDeck(pairs: MemoryPair[]): CardTile[] {
    const deck: CardTile[] = []
    pairs.forEach(p => {
        deck.push({ id: `term-${p.id}`, pairId: p.id, text: p.term, type: "term" })
        deck.push({ id: `def-${p.id}`, pairId: p.id, text: p.definition, type: "definition" })
    })
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
}

function MemoryGridContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    recordAttempt,
    isLive,
    mode,
    title,
    pairs,
    points,
    isEditing,
    disabled,
    componentId,
    timeLimit,
}: ScoredRenderProps<MemoryGridState> & {
    title: string
    pairs: MemoryPair[]
    points: number
    isEditing: boolean
    disabled: boolean
    componentId: string
    timeLimit: number
}) {
    const { cards, flippedCardIds, matchedPairIds, attempts, isChecking, completed } = state
    const { playFeedback } = useFeedback()
    const { showStartScreen, setHasStarted } = useLiveBlock({
        isLive,
        isComplete: completed || state.status === "completed",
        lockId: componentId,
    })

    const forceSubmit = (matchedCount: number) => {
        const allDone = matchedCount === pairs.length
        const earnedPoints = allDone
            ? points
            : Math.round((matchedCount / Math.max(pairs.length, 1)) * points)
        handlePoints(earnedPoints)
        recordAttempt(allDone, earnedPoints, points, undefined, { memoryFlips: attempts })
        setState(prev => ({
            ...prev,
            flippedCardIds: [],
            isChecking: false,
            completed: true,
            status: "completed",
            score: earnedPoints,
            maxScore: points,
        }))
    }

    const onTimeout = () => {
        if (completed || isEditing || disabled) return
        forceSubmit(matchedPairIds.length)
    }

    const handleCardClick = (card: CardTile) => {
        if (isChecking || completed || isEditing || disabled || flippedCardIds.includes(card.id) || matchedPairIds.includes(card.pairId)) {
            return
        }

        playFeedback("click", { sound: true })
        const nextFlipped = [...flippedCardIds, card.id]

        if (nextFlipped.length === 2) {
            const [firstId, secondId] = nextFlipped
            const card1 = cards.find(c => c.id === firstId)
            const card2 = cards.find(c => c.id === secondId)

            setState(prev => ({
                ...prev,
                flippedCardIds: nextFlipped,
                isChecking: true,
                attempts: prev.attempts + 1,
            }))

            if (card1 && card2 && card1.pairId === card2.pairId && card1.id !== card2.id) {
                setTimeout(async () => {
                    setState(prev => {
                        const nextMatched = [...prev.matchedPairIds, card1.pairId]
                        const allDone = nextMatched.length === pairs.length
                        if (allDone) {
                            handlePoints(points)
                            recordAttempt(true, points, points, undefined, { memoryFlips: prev.attempts })
                        }
                        return {
                            ...prev,
                            matchedPairIds: nextMatched,
                            flippedCardIds: [],
                            isChecking: false,
                            completed: allDone,
                            status: allDone ? "completed" : prev.status,
                            score: allDone ? points : prev.score,
                            maxScore: allDone ? points : prev.maxScore,
                        }
                    })
                    await playFeedback("quizSuccess", { sound: true })
                }, 500)
            } else {
                setTimeout(async () => {
                    await playFeedback("incorrect", { sound: true })
                    setState(prev => ({
                        ...prev,
                        flippedCardIds: [],
                        isChecking: false,
                    }))
                }, 1000)
            }
        } else {
            setState(prev => ({ ...prev, flippedCardIds: nextFlipped }))
        }
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState(prev => ({
            ...prev,
            flippedCardIds: [],
            matchedPairIds: [],
            attempts: 0,
            isChecking: false,
            completed: false,
            status: "active",
        }))
    }

    if (showStartScreen) {
        const liveMeta = buildLiveStartMeta({
            type: "memoryGrid",
            title: title || "Memory Grid",
            timeLimitSec: timeLimit,
            points,
            units: pairs.length,
        })
        return (
            <LiveStartScreen
                onStart={() => setHasStarted(true)}
                {...liveMeta}
            />
        )
    }

    return (
        <div className="w-full h-auto md:h-full md:flex-1 flex flex-col justify-start md:justify-center px-4 sm:px-6 py-4 relative min-h-0 overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-pink-600">
                        Memory Grid • {points} Points
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {isLive && (
                        <LiveTimer
                            isCompleted={completed || state.status === "completed"}
                            duration={timeLimit}
                            onTimeout={onTimeout}
                        />
                    )}
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">Attempts: {attempts}</span>
                </div>
            </div>

            <FormattedText content={title} as="h3" className="text-lg font-black mb-4 text-slate-900 tracking-tight shrink-0" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 p-1 overflow-visible">
                {cards.map(card => {
                    const isFlipped = flippedCardIds.includes(card.id)
                    const isMatched = matchedPairIds.includes(card.pairId)
                    const isTerm = card.type === "term"
                    return (
                        <div key={card.id} onClick={() => handleCardClick(card)}
                            className={cn(
                                "relative min-h-[90px] rounded-2xl border-2 border-b-4 p-3 flex items-center justify-center text-center font-black text-xs transition-all duration-200 select-none cursor-pointer active:border-b-2 active:translate-y-[2px]",
                                isMatched && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 cursor-default opacity-85 shadow-sm",
                                !isMatched && isFlipped && isTerm && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC]",
                                !isMatched && isFlipped && !isTerm && "bg-[#FFC800] text-slate-900 border-[#FFC800] border-b-amber-600",
                                !isMatched && !isFlipped && "bg-slate-50 hover:bg-pink-50/50 border-slate-200 border-b-slate-300 text-slate-400 hover:border-pink-300 shadow-sm"
                            )}>
                            {isFlipped || isMatched ? (
                                <span className="leading-snug animate-in zoom-in-75 duration-200">{card.text}</span>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <Layers className="w-4 h-4 text-slate-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Flip</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {completed && (
                <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 flex items-center justify-between font-black text-xs uppercase tracking-wider shrink-0">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                        <span>All pairs matched! Earned +{points} Points</span>
                    </div>
                    <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-black border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] cursor-pointer">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Play Again</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export function MemoryGridRenderer({
    id = "memory-grid-component",
    title = "Memory Card Pairs",
    pairs = [],
    points = 20,
    mode = "practice",
    timeLimit: timeLimitProp = 60,
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: MemoryGridRendererProps) {
    const component: Component = {
        id,
        type: "memoryGrid",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, pairs, points },
        mode: mode as any,
    } as Component

    const initialState: MemoryGridState = {
        cards: createShuffledDeck(pairs),
        flippedCardIds: [],
        matchedPairIds: [],
        attempts: 0,
        isChecking: false,
        completed: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            cards: savedState.cards ?? initialState.cards,
            completed: savedState.completed ?? savedState.status === "completed",
        }
        : undefined

    return (
        <ScoredRenderer<MemoryGridState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <MemoryGridContent
                    {...renderProps}
                    title={title}
                    pairs={pairs}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                    componentId={id}
                    timeLimit={readTimeLimit(timeLimitProp, 60)}
                />
            )}
        />
    )
}
