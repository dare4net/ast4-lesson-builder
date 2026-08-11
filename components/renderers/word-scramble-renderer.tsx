"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Type, HelpCircle, CheckCircle2, Volume2, Sparkles, RefreshCw, Delete } from "lucide-react"
import { useReadAloud } from "@/context/read-aloud-context"
import { useFeedback } from "@/hooks/use-feedback"

interface WordScrambleRendererProps {
    id?: string
    title?: string
    word: string
    hint?: string
    points?: number
    savedState?: any
    setComponentState?: (state: any) => void
    isEditing?: boolean
}

export function WordScrambleRenderer({
    id = "word-scramble-component",
    title = "Unscramble the Word",
    word = "PHOTOSYNTHESIS",
    hint = "",
    points = 15,
    savedState,
    setComponentState,
    isEditing = false,
}: WordScrambleRendererProps) {
    const targetWord = word.toUpperCase().replace(/\s+/g, "")
    const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string }[]>([])
    const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [showHint, setShowHint] = useState(false)

    const { speak, isSpeaking } = useReadAloud()
    const { playFeedback } = useFeedback()

    // Shuffle letters on mount
    useEffect(() => {
        const letters = targetWord.split("").map((char, index) => ({
            id: `${char}-${index}`,
            letter: char,
        }))

        // Fisher-Yates shuffle
        const shuffled = [...letters]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        // Ensure it's not identical to target
        if (shuffled.map(l => l.letter).join("") === targetWord && targetWord.length > 1) {
            shuffled.reverse()
        }

        setScrambledLetters(shuffled)
    }, [targetWord])

    useEffect(() => {
        if (savedState?.selectedLetterIds) {
            setSelectedLetterIds(savedState.selectedLetterIds)
            setSubmitted(true)
        }
    }, [savedState])

    const handleTileClick = (tileId: string) => {
        if (submitted || isEditing) return
        setSelectedLetterIds(prev => [...prev, tileId])
        playFeedback("click", { sound: true })
    }

    const handleBackspace = () => {
        if (submitted || isEditing || selectedLetterIds.length === 0) return
        setSelectedLetterIds(prev => prev.slice(0, -1))
        playFeedback("click", { sound: true })
    }

    const handleReset = () => {
        if (isEditing) return
        setSelectedLetterIds([])
        setSubmitted(false)
    }

    const currentSpelled = selectedLetterIds
        .map(id => scrambledLetters.find(l => l.id === id)?.letter)
        .join("")

    const handleCheckAnswer = async () => {
        if (submitted || isEditing) return
        setSubmitted(true)

        const isCorrect = currentSpelled === targetWord
        const earnedPoints = isCorrect ? points : 0

        if (isCorrect) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        if (setComponentState) {
            setComponentState({
                status: "completed",
                score: earnedPoints,
                maxScore: points,
                spelled: currentSpelled,
                isCorrect,
            })
        }
    }

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        speak(`${title}. ${hint ? `Hint: ${hint}` : ""}`)
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                            Word Scramble • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeak}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer"
                        title="Read Aloud"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-sky-400")} />
                        <span className="text-[10px] uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-2 text-white">{title}</h3>

                {hint && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setShowHint(prev => !prev)}
                            className="flex items-center gap-2 text-xs font-extrabold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                        </button>
                        {showHint && (
                            <p className="mt-2 text-xs font-medium text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 animate-in fade-in">
                                💡 {hint}
                            </p>
                        )}
                    </div>
                )}

                {/* Spelled Word Answer Slots */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 p-6 bg-slate-950/80 rounded-2xl border border-slate-800 min-h-[80px]">
                    {targetWord.split("").map((_, idx) => {
                        const letter = currentSpelled[idx]
                        const isFilled = !!letter
                        const isCorrect = submitted && currentSpelled === targetWord
                        const isIncorrect = submitted && !isCorrect

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "w-12 h-14 rounded-xl border-2 flex items-center justify-center font-black text-xl transition-all duration-300 shadow-md select-none",
                                    isFilled && !submitted && "bg-sky-500 text-slate-950 border-sky-300 shadow-sky-500/20 scale-105",
                                    !isFilled && "bg-slate-900 border-slate-800 text-slate-600",
                                    submitted && isCorrect && "bg-emerald-500 text-slate-950 border-emerald-300",
                                    submitted && isIncorrect && "bg-rose-500 text-white border-rose-300 animate-shake"
                                )}
                            >
                                {letter || ""}
                            </div>
                        )
                    })}
                </div>

                {/* Scrambled Letter Tiles Bank */}
                {!submitted && (
                    <div className="flex flex-wrap justify-center gap-2.5 mb-6">
                        {scrambledLetters.map(tile => {
                            const isUsed = selectedLetterIds.includes(tile.id)

                            return (
                                <button
                                    key={tile.id}
                                    type="button"
                                    onClick={() => handleTileClick(tile.id)}
                                    disabled={isUsed || isEditing}
                                    className={cn(
                                        "w-12 h-12 rounded-xl border-2 font-black text-lg transition-all duration-200 cursor-pointer active:scale-95 shadow-lg",
                                        !isUsed && "bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-200 hover:border-sky-400 hover:scale-105",
                                        isUsed && "opacity-20 bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                                    )}
                                >
                                    {tile.letter}
                                </button>
                            )
                        })}

                        <button
                            type="button"
                            onClick={handleBackspace}
                            disabled={selectedLetterIds.length === 0 || isEditing}
                            className="w-12 h-12 rounded-xl border-2 bg-slate-800 hover:bg-rose-500/20 border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Backspace"
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Action Controls */}
                <div className="mt-6 flex items-center justify-between gap-4">
                    {submitted ? (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry Unscramble</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCheckAnswer}
                            disabled={selectedLetterIds.length !== targetWord.length || isEditing}
                            className={cn(
                                "w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all duration-300 shadow-lg",
                                selectedLetterIds.length === targetWord.length
                                    ? "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20 active:scale-95 cursor-pointer"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            )}
                        >
                            Check Word
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
