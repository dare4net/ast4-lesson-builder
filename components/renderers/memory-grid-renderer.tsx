"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Layers, Sparkles, Volume2, CheckCircle2, RefreshCw } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

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
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

export function MemoryGridRenderer({
    id = "memory-grid-component",
    title = "Memory Card Pairs",
    pairs = [],
    points = 20,
    savedState,
    setComponentState,
    isEditing = false,
}: MemoryGridRendererProps) {
    const [cards, setCards] = useState<CardTile[]>([])
    const [flippedCardIds, setFlippedCardIds] = useState<string[]>([])
    const [matchedPairIds, setMatchedPairIds] = useState<string[]>([])
    const [attempts, setAttempts] = useState(0)
    const [isChecking, setIsChecking] = useState(false)
    const [completed, setCompleted] = useState(false)

    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    // Initialize and shuffle grid cards
    useEffect(() => {
        const deck: CardTile[] = []
        pairs.forEach(p => {
            deck.push({ id: `term-${p.id}`, pairId: p.id, text: p.term, type: "term" })
            deck.push({ id: `def-${p.id}`, pairId: p.id, text: p.definition, type: "definition" })
        })

        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[deck[i], deck[j]] = [deck[j], deck[i]]
        }

        setCards(deck)
    }, [pairs])

    useEffect(() => {
        if (savedState?.matchedPairIds) {
            setMatchedPairIds(savedState.matchedPairIds)
            setCompleted(true)
        }
    }, [savedState])

    const handleCardClick = (card: CardTile) => {
        if (
            isChecking ||
            completed ||
            isEditing ||
            flippedCardIds.includes(card.id) ||
            matchedPairIds.includes(card.pairId)
        ) {
            return
        }

        playFeedback("click", { sound: true })

        const nextFlipped = [...flippedCardIds, card.id]
        setFlippedCardIds(nextFlipped)

        if (nextFlipped.length === 2) {
            setIsChecking(true)
            setAttempts(prev => prev + 1)

            const [firstId, secondId] = nextFlipped
            const card1 = cards.find(c => c.id === firstId)
            const card2 = cards.find(c => c.id === secondId)

            if (card1 && card2 && card1.pairId === card2.pairId && card1.id !== card2.id) {
                // Match found!
                setTimeout(async () => {
                    const nextMatched = [...matchedPairIds, card1.pairId]
                    setMatchedPairIds(nextMatched)
                    setFlippedCardIds([])
                    setIsChecking(false)
                    await playFeedback("quizSuccess", { sound: true })

                    if (nextMatched.length === pairs.length) {
                        setCompleted(true)
                        if (setComponentState) {
                            setComponentState({
                                status: "completed",
                                score: points,
                                maxScore: points,
                                matchedPairIds: nextMatched,
                            })
                        }
                    }
                }, 500)
            } else {
                // No match
                setTimeout(async () => {
                    await playFeedback("incorrect", { sound: true })
                    setFlippedCardIds([])
                    setIsChecking(false)
                }, 1000)
            }
        }
    }

    const handleReset = () => {
        if (isEditing) return
        setFlippedCardIds([])
        setMatchedPairIds([])
        setAttempts(0)
        setCompleted(false)
    }

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        speak(`${title}. Match terms with their definitions.`)
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">
                            Memory Grid • {points} Points
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Attempts: {attempts}
                        </span>

                        <button
                            type="button"
                            onClick={handleSpeak}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                            title="Read Aloud"
                        >
                            <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-pink-400")} />
                            <span className="text-[10px] uppercase tracking-wider">Listen</span>
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-black mb-6 text-white">{title}</h3>

                {/* Card Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {cards.map(card => {
                        const isFlipped = flippedCardIds.includes(card.id)
                        const isMatched = matchedPairIds.includes(card.pairId)
                        const isTerm = card.type === "term"

                        return (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className={cn(
                                    "relative aspect-[4/3] rounded-2xl border-2 p-3 flex items-center justify-center text-center font-bold text-xs transition-all duration-300 select-none cursor-pointer active:scale-95 shadow-md",
                                    isMatched && "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 cursor-default opacity-80",
                                    !isMatched && isFlipped && isTerm && "bg-pink-500 text-slate-950 border-pink-300 shadow-pink-500/20 scale-105",
                                    !isMatched && isFlipped && !isTerm && "bg-indigo-500 text-white border-indigo-300 shadow-indigo-500/20 scale-105",
                                    !isMatched && !isFlipped && "bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-500 hover:border-pink-500/50"
                                )}
                            >
                                {isFlipped || isMatched ? (
                                    <span className="leading-snug animate-in zoom-in-75 duration-200">
                                        {card.text}
                                    </span>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Layers className="w-5 h-5 text-slate-700" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Flip</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Completion Bar */}
                {completed && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between font-bold text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>All pairs matched! Earned +{points} Points</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Play Again</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
