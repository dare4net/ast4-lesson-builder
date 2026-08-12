"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Layers, Volume2, CheckCircle2, RefreshCw } from "lucide-react"
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
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 border border-pink-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-pink-600">
                            Memory Grid • {points} Points
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                            Attempts: {attempts}
                        </span>

                        <button
                            type="button"
                            onClick={handleSpeak}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                            title="Read Aloud"
                        >
                            <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-pink-600")} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight">{title}</h3>

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
                                    "relative aspect-[4/3] rounded-2xl border-2 border-b-4 p-3 flex items-center justify-center text-center font-black text-xs transition-all duration-200 select-none cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                    isMatched && "bg-emerald-50 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 cursor-default opacity-85",
                                    !isMatched && isFlipped && isTerm && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105",
                                    !isMatched && isFlipped && !isTerm && "bg-[#FFC800] text-slate-900 border-[#FFC800] border-b-amber-600 scale-105",
                                    !isMatched && !isFlipped && "bg-slate-50 hover:bg-pink-50/50 border-slate-200 border-b-slate-300 text-slate-400 hover:border-pink-300"
                                )}
                            >
                                {isFlipped || isMatched ? (
                                    <span className="leading-snug animate-in zoom-in-75 duration-200">
                                        {card.text}
                                    </span>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <Layers className="w-5 h-5 text-slate-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Flip</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Completion Bar */}
                {completed && (
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border-2 border-b-4 border-[#58CC02] border-b-[#3B8C00] text-emerald-950 flex items-center justify-between font-black text-xs uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                            <span>All pairs matched! Earned +{points} Points</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-black border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-[2px] cursor-pointer"
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
