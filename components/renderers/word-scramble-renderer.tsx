"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Type, HelpCircle, RefreshCw, Delete, Shuffle } from "lucide-react"
import { useFeedback } from "@/hooks/use-feedback"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

interface LetterTile {
    id: string
    letter: string
}

interface WordScrambleRendererProps {
    id?: string
    title?: string
    word: string
    hint?: string
    points?: number
    mode?: "practice" | "live"
    savedState?: WordScrambleState
    setComponentState?: (state: WordScrambleState) => void
    isEditing?: boolean
    disabled?: boolean
    status?: string
}

type WordScrambleState = {
    scrambledLetters: LetterTile[]
    selectedLetterIds: string[]
    submitted: boolean
    showHint: boolean
    spelled?: string
    isCorrect?: boolean
    status?: "active" | "completed"
    score?: number
    maxScore?: number
}

function createScrambledLetters(targetWord: string): LetterTile[] {
    const letters = targetWord.split("").map((char, index) => ({
        id: `${char}-${index}`,
        letter: char,
    }))
    const shuffled = [...letters]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    if (shuffled.map(l => l.letter).join("") === targetWord && targetWord.length > 1) {
        shuffled.reverse()
    }
    return shuffled
}

function WordScrambleContent({
    state,
    setState,
    handlePoints,
    handleRetry,
    mode,
    title,
    targetWord,
    hint,
    points,
    isEditing,
    disabled,
}: ScoredRenderProps<WordScrambleState> & {
    title: string
    targetWord: string
    hint: string
    points: number
    isEditing: boolean
    disabled: boolean
}) {
    const { scrambledLetters, selectedLetterIds, submitted, showHint } = state
    const { playFeedback } = useFeedback()

    const currentSpelled = selectedLetterIds
        .map(id => scrambledLetters.find(l => l.id === id)?.letter)
        .join("")

    const handleTileClick = (tileId: string) => {
        if (submitted || isEditing || disabled) return
        setState(prev => ({
            ...prev,
            selectedLetterIds: [...prev.selectedLetterIds, tileId],
        }))
        playFeedback("click", { sound: true })
    }

    const handleBackspace = () => {
        if (submitted || isEditing || disabled || selectedLetterIds.length === 0) return
        setState(prev => ({
            ...prev,
            selectedLetterIds: prev.selectedLetterIds.slice(0, -1),
        }))
        playFeedback("click", { sound: true })
    }

    const handleReshuffleRemaining = () => {
        if (submitted || isEditing || disabled) return
        const unused = scrambledLetters.filter(l => !selectedLetterIds.includes(l.id))
        if (unused.length <= 1) return

        const shuffledUnused = [...unused]
        for (let i = shuffledUnused.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[shuffledUnused[i], shuffledUnused[j]] = [shuffledUnused[j], shuffledUnused[i]]
        }

        let unusedIdx = 0
        const nextScrambled = scrambledLetters.map(l => {
            if (selectedLetterIds.includes(l.id)) return l
            return shuffledUnused[unusedIdx++]
        })

        setState(prev => ({
            ...prev,
            scrambledLetters: nextScrambled,
        }))
        playFeedback("click", { sound: true })
    }

    const handleReset = () => {
        if (isEditing || mode === "live") return
        handleRetry()
        setState(prev => ({
            ...prev,
            selectedLetterIds: [],
            submitted: false,
            showHint: false,
            status: "active",
        }))
    }

    const handleCheckAnswer = async () => {
        if (submitted || isEditing || disabled) return
        const isCorrect = currentSpelled === targetWord
        const earnedPoints = isCorrect ? points : 0

        if (isCorrect) {
            await playFeedback("quizSuccess", { sound: true })
        } else {
            await playFeedback("incorrect", { sound: true })
        }

        setState(prev => ({
            ...prev,
            submitted: true,
            spelled: currentSpelled,
            isCorrect,
            status: "completed",
            score: earnedPoints,
            maxScore: points,
        }))

        handlePoints(earnedPoints)
    }

    return (
        <div className="w-full h-full flex-1 flex flex-col justify-center px-4 sm:px-6 py-4 relative min-h-0 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#1CB0F6]">
                        Word Scramble • {points} Points
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-black mb-2 text-slate-900 tracking-tight shrink-0 text-center">{title}</h3>

            {hint && (
                <div className="mb-4 shrink-0 flex flex-col items-center">
                    <button type="button" onClick={() => setState(prev => ({ ...prev, showHint: !prev.showHint }))} className="flex items-center gap-2 text-xs font-black text-[#1CB0F6] hover:text-sky-600 transition-colors uppercase tracking-wider cursor-pointer">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                    </button>
                    {showHint && (
                        <div className="mt-2 text-xs font-bold text-slate-700 bg-sky-50/60 p-2.5 rounded-2xl border border-sky-200 animate-in fade-in max-w-md w-full text-center">
                            💡 {hint}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mb-6 p-4 bg-slate-50/60 rounded-2xl border-2 border-slate-200 border-b-4 shrink-0">
                {targetWord.split("").map((_, idx) => {
                    const letter = currentSpelled[idx]
                    const isFilled = !!letter
                    const isCorrect = submitted && currentSpelled === targetWord
                    const isIncorrect = submitted && !isCorrect
                    return (
                        <div key={idx} className={cn(
                            "w-11 h-12 rounded-xl border-2 border-b-4 flex items-center justify-center font-black text-lg transition-all duration-200 shadow-sm select-none",
                            isFilled && !submitted && "bg-[#1CB0F6] text-white border-[#1CB0F6] border-b-[#0090CC] scale-105",
                            !isFilled && "bg-white border-slate-200 border-b-slate-300 text-slate-400",
                            submitted && isCorrect && "bg-[#58CC02] text-white border-[#46a302] border-b-[#3B8C00]",
                            submitted && isIncorrect && "bg-[#FF4B4B] text-white border-[#CC3C3C] border-b-[#992B2B]"
                        )}>
                            {letter || ""}
                        </div>
                    )
                })}
            </div>

            {!submitted && (
                <div className="flex flex-wrap justify-center gap-2 mb-4 shrink-0">
                    {scrambledLetters.map(tile => {
                        const isUsed = selectedLetterIds.includes(tile.id)
                        return (
                            <button key={tile.id} type="button" onClick={() => handleTileClick(tile.id)} disabled={isUsed || isEditing || disabled}
                                className={cn(
                                    "w-11 h-11 rounded-xl border-2 border-b-4 font-black text-base transition-all duration-200 cursor-pointer active:border-b-2 active:translate-y-[2px] shadow-sm",
                                    !isUsed && "bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 text-slate-800 hover:border-[#1CB0F6]",
                                    isUsed && "opacity-25 bg-slate-100 border-slate-200 border-b-slate-200 text-slate-400 cursor-not-allowed"
                                )}>
                                {tile.letter}
                            </button>
                        )
                    })}
                    <button type="button" onClick={handleBackspace} disabled={selectedLetterIds.length === 0 || isEditing || disabled}
                        className="w-11 h-11 rounded-xl border-2 border-b-4 bg-white hover:bg-rose-50 border-slate-200 border-b-slate-300 hover:border-[#FF4B4B] text-slate-600 flex items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        title="Backspace">
                        <Delete className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={handleReshuffleRemaining} disabled={scrambledLetters.filter(l => !selectedLetterIds.includes(l.id)).length <= 1 || isEditing || disabled}
                        className="w-11 h-11 rounded-xl border-2 border-b-4 bg-white hover:bg-sky-50 border-slate-200 border-b-slate-300 hover:border-[#1CB0F6] text-[#1CB0F6] flex items-center justify-center transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        title="Reshuffle Remaining Letters">
                        <Shuffle className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4 shrink-0">
                {submitted ? (
                    <button type="button" onClick={handleReset} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-200 border-b-4 font-black text-xs uppercase tracking-wider transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer">
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry Unscramble</span>
                    </button>
                ) : (
                    <button type="button" onClick={handleCheckAnswer} disabled={selectedLetterIds.length !== targetWord.length || isEditing || disabled}
                        className={cn(
                            "w-full h-11 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all duration-200 border-2 border-b-4 active:border-b-0 active:translate-y-[2px]",
                            selectedLetterIds.length === targetWord.length
                                ? "bg-[#1CB0F6] hover:bg-sky-500 text-white border-[#1CB0F6] border-b-[#0090CC] shadow-sky-500/20 cursor-pointer"
                                : "bg-slate-100 text-slate-400 border-slate-200 border-b-slate-200 cursor-not-allowed"
                        )}>
                        Check Word
                    </button>
                )}
            </div>
        </div>
    )
}

export function WordScrambleRenderer({
    id = "word-scramble-component",
    title = "Unscramble the Word",
    word = "PHOTOSYNTHESIS",
    hint = "",
    points = 15,
    mode = "practice",
    savedState,
    setComponentState,
    isEditing = false,
    disabled = false,
    status,
}: WordScrambleRendererProps) {
    const targetWord = word.toUpperCase().replace(/\s+/g, "")

    const component: Component = {
        id,
        type: "wordScramble",
        state: "active",
        status: (status || savedState?.status || "uncompleted") as any,
        props: { title, word, hint, points },
        mode: mode as any,
    } as Component

    const initialState: WordScrambleState = {
        scrambledLetters: createScrambledLetters(targetWord),
        selectedLetterIds: [],
        submitted: false,
        showHint: false,
        status: "active",
    }

    const mergedSavedState = savedState
        ? {
            ...initialState,
            ...savedState,
            scrambledLetters: savedState.scrambledLetters ?? initialState.scrambledLetters,
            submitted: savedState.submitted ?? savedState.status === "completed",
        }
        : undefined

    return (
        <ScoredRenderer<WordScrambleState>
            component={component}
            initialState={initialState}
            savedState={mergedSavedState}
            setComponentState={setComponentState}
            points={points}
            mode={mode}
            disabled={disabled}
            onRender={(renderProps) => (
                <WordScrambleContent
                    {...renderProps}
                    title={title}
                    targetWord={targetWord}
                    hint={hint}
                    points={points}
                    isEditing={isEditing}
                    disabled={disabled}
                />
            )}
        />
    )
}
