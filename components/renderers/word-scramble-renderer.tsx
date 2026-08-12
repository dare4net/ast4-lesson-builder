"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Type, HelpCircle, CheckCircle2, Volume2, RefreshCw, Delete } from "lucide-react"
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

    const handleSpeakMain = (e: React.MouseEvent) => {
        e.stopPropagation()
        speak(title)
    }

    const handleSpeakHint = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hint) {
            speak(`Hint: ${hint}`)
        }
    }

    return (
        <div className="w-full my-6 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-4xl bg-white border-2 border-slate-200 border-b-4 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 overflow-hidden">
                {/* Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#1CB0F6]">
                            Word Scramble • {points} Points
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleSpeakMain}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                        title="Read Aloud Title"
                    >
                        <Volume2 className={cn("w-3.5 h-3.5", isSpeaking && "animate-pulse text-[#1CB0F6]")} />
                        <span className="text-[9px] font-black uppercase tracking-wider">Listen</span>
                    </button>
                </div>

                <h3 className="text-xl font-black mb-2 text-slate-900 tracking-tight">{title}</h3>

                {hint && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setShowHint(prev => !prev)}
                            className="flex items-center gap-2 text-xs font-black text-[#1CB0F6] hover:text-sky-600 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                        </button>
                        {showHint && (
                            <div className="mt-2 text-xs font-bold text-slate-700 bg-sky-50/60 p-3 rounded-2xl border border-sky-200 animate-in fade-in flex items-center justify-between gap-3">
                                <span>💡 {hint}</span>
                                <button
                                    type="button"
                                    onClick={handleSpeakHint}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 text-[10px] font-black transition-all border border-sky-200 shrink-0 cursor-pointer"
                                    title="Listen to Hint"
                                >
                                    <Volume2 className="w-3 h-3 text-[#1CB0F6]" />
                                    <span>Listen</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Spelled Word Answer Slots */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 p-6 bg-slate-50/60 rounded-2xl border-2 border-slate-200 border-b-4 min-h-[90px]">
                    {targetWord.split("").map((_, idx) => {
                        const letter = currentSpelled[idx]
                        const isFilled = !!letter
                        const isCorrect = submitted && currentSpelled === targetWord
                        const isIncorrect = submitted && !isCorrect

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "w-12 h-14 rounded-xl border-2 border-b-4 flex items-center justify-center font-black text-xl transition-all duration-200 shadow-sm select-none",
                                    isFilled && !submitted && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105",
                                    !isFilled && "bg-white border-slate-200 border-b-slate-300 text-slate-400",
                                    submitted && isCorrect && "bg-[#58CC02] text-white border-[#46a302] border-b-[#3B8C00]",
                                    submitted && isIncorrect && "bg-[#FF4B4B] text-white border-[#CC3C3C] border-b-[#992B2B] animate-shake"
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
                                        "w-12 h-12 rounded-xl border-2 border-b-4 font-black text-lg transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                        !isUsed && "bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-[#1CB0F6]",
                                        isUsed && "opacity-25 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed"
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
                            className="w-12 h-12 rounded-xl border-2 border-b-4 bg-white hover:bg-rose-50 border-slate-200 border-b-slate-300 hover:border-[#FF4B4B] text-slate-600 hover:text-[#FF4B4B] flex items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
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
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
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
                                "w-full h-12 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                                selectedLetterIds.length === targetWord.length
                                    ? "bg-[#1CB0F6] hover:bg-sky-500 text-white border-[#1CB0F6] border-b-[#0090CC] shadow-sky-500/20 cursor-pointer"
                                    : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
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
